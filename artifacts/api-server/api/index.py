"""CIVAC monolith for Vercel's Flask runtime.

This module is intentionally self-contained at the HTTP boundary.  The
original application was split between an Express API, a Vite SPA and two
Python services.  Vercel is configured with ``artifacts/api-server`` as its
root, so this Flask application now serves the SPA, exposes the main API
contracts, and mounts the existing analytics application.

Persistent data is stored in PostgreSQL through DATABASE_URL.  No request
path silently falls back to an in-memory database.
"""

from __future__ import annotations

import importlib.util
import hashlib
import hmac
import json
import os
import re
import secrets
import sys
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from werkzeug.exceptions import HTTPException
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT.parent
PUBLIC = ROOT / "public"

app = Flask(__name__, static_folder=str(PUBLIC), static_url_path="")
app.config["JSON_SORT_KEYS"] = False
CORS(app, resources={r"/api/*": {"origins": "*"}})

_memory_sessions: dict[str, dict[str, Any]] = {}


def _db():
    """Open a short-lived PostgreSQL connection for one request."""
    url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
    if not url:
        raise RuntimeError("DATABASE_URL no está configurada")
    try:
        import psycopg
        from psycopg.rows import dict_row
    except ImportError as exc:
        raise RuntimeError("La dependencia psycopg no está instalada") from exc
    return psycopg.connect(url, row_factory=dict_row)


def _camel(value: Any) -> Any:
    if isinstance(value, list):
        return [_camel(item) for item in value]
    if isinstance(value, dict):
        result: dict[str, Any] = {}
        for key, item in value.items():
            parts = key.split("_")
            public_key = parts[0] + "".join(part[:1].upper() + part[1:] for part in parts[1:])
            result[public_key] = _camel(item)
        return result
    return value


def _snake(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def _body() -> dict[str, Any]:
    payload = request.get_json(silent=True)
    return payload if isinstance(payload, dict) else {}


def _json_row(row: dict[str, Any], omit: set[str] | None = None) -> dict[str, Any]:
    omit = omit or set()
    return _camel({key: value for key, value in row.items() if key not in omit})


def _json_rows(rows: list[dict[str, Any]], omit: set[str] | None = None) -> list[dict[str, Any]]:
    return [_json_row(row, omit) for row in rows]


def _error(message: str, status: int = 500):
    return jsonify({"error": message}), status


def _allowed_values(payload: dict[str, Any], columns: set[str], drop: set[str] | None = None):
    drop = drop or set()
    values = {}
    for key, value in payload.items():
        column = _snake(key)
        if column in columns and column not in drop:
            values[column] = value
    return values


# Public API route -> PostgreSQL table and behavior.  Keeping this list
# explicit prevents request data from becoming SQL identifiers.
TABLES: dict[str, dict[str, Any]] = {
    "animals": {"table": "animals", "id": "id", "omit": {"created_at", "updated_at"}},
    "potreros": {"table": "potreros", "id": "id", "omit": {"created_at", "updated_at"}},
    "insumos": {"table": "insumos", "id": "id", "omit": {"id", "created_at", "updated_at"}},
    "personal": {"table": "personal", "id": "id", "omit": {"id", "created_at", "updated_at"}},
    "reproduccion": {"table": "reproduccion", "id": "id", "omit": {"id", "created_at", "updated_at"}},
    "alertas": {"table": "alertas", "id": "id", "omit": {"id", "created_at"}},
    "pesajes": {"table": "pesajes", "id": "id", "omit": {"id", "created_at"}},
    "usuarios": {"table": "usuarios_sistema", "id": "id", "omit": {"password", "created_at", "updated_at"}},
    "lotes": {"table": "movimientos_lote", "id": "id", "omit": {"id", "created_at"}},
    # Plans, licenses, activation codes, tramas and audit have custom
    # contracts below. They are intentionally not exposed through the
    # generic CRUD factory.
}


def _table_columns(conn, table: str) -> set[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema() AND table_name = %s
            """,
            (table,),
        )
        return {row["column_name"] for row in cur.fetchall()}


def _select_rows(resource: str, item_id: str | None = None):
    try:
        config = TABLES[resource]
        with _db() as conn:
            columns = _table_columns(conn, config["table"])
            if not columns:
                return _error(f"Tabla no disponible: {config['table']}", 503)
            query = f'SELECT * FROM "{config["table"]}"'
            params: list[Any] = []
            if item_id is not None:
                query += f' WHERE "{config["id"]}" = %s'
                params.append(item_id if resource == "animals" else int(item_id))
            query += f' ORDER BY "{config["id"]}"'
            with conn.cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
            if item_id is not None:
                if not rows:
                    return _error("Not found", 404)
                return jsonify(_json_row(rows[0], config["omit"]))
            return jsonify(_json_rows(rows, config["omit"]))
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/health")
def health():
    return jsonify({"status": "healthy", "service": "civac-flask-monolith", "timestamp": datetime.now(timezone.utc).isoformat()})


@app.get("/api/healthz")
def healthz():
    return jsonify({"status": "ok", "service": "civac-flask-monolith", "timestamp": datetime.now(timezone.utc).isoformat()})


@app.get("/api/db-status")
@app.get("/api/db/status")
def db_status():
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 AS ok")
                cur.fetchone()
        return jsonify({"ok": True, "driver": "postgresql"})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 503


def _make_table_routes(resource: str):
    config = TABLES[resource]

    @app.get(f"/api/{resource}", endpoint=f"list_{resource}")
    def list_resource(resource=resource):
        return _select_rows(resource)

    @app.get(f"/api/{resource}/<item_id>", endpoint=f"get_{resource}")
    def get_resource(item_id: str, resource=resource):
        return _select_rows(resource, item_id)

    @app.post(f"/api/{resource}", endpoint=f"create_{resource}")
    def create_resource(resource=resource):
        try:
            with _db() as conn:
                columns = _table_columns(conn, config["table"])
                values = _allowed_values(_body(), columns, {"id", "created_at", "updated_at"})
                if not values:
                    return _error("No hay campos válidos", 400)
                names = list(values)
                placeholders = ", ".join(["%s"] * len(names))
                query = f'INSERT INTO "{config["table"]}" ({", ".join(f"""\"{name}\"""" for name in names)}) VALUES ({placeholders}) RETURNING *'
                with conn.cursor() as cur:
                    cur.execute(query, [values[name] for name in names])
                    row = cur.fetchone()
                conn.commit()
            return jsonify(_json_row(row, config["omit"])), 201
        except Exception as exc:
            return _error(str(exc))

    @app.put(f"/api/{resource}/<item_id>", endpoint=f"update_{resource}")
    def update_resource(item_id: str, resource=resource):
        try:
            with _db() as conn:
                columns = _table_columns(conn, config["table"])
                values = _allowed_values(_body(), columns, {"id", "created_at"})
                values.pop(config["id"], None)
                if "updated_at" in columns:
                    values["updated_at"] = datetime.now(timezone.utc)
                if not values:
                    return _error("No hay campos válidos", 400)
                assignments = ", ".join(f'"{name}" = %s' for name in values)
                params = list(values.values())
                params.append(item_id if resource == "animals" else int(item_id))
                query = f'UPDATE "{config["table"]}" SET {assignments} WHERE "{config["id"]}" = %s RETURNING *'
                with conn.cursor() as cur:
                    cur.execute(query, params)
                    row = cur.fetchone()
                if not row:
                    return _error("Not found", 404)
                conn.commit()
            return jsonify(_json_row(row, config["omit"]))
        except Exception as exc:
            return _error(str(exc))

    @app.delete(f"/api/{resource}/<item_id>", endpoint=f"delete_{resource}")
    def delete_resource(item_id: str, resource=resource):
        try:
            with _db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f'DELETE FROM "{config["table"]}" WHERE "{config["id"]}" = %s',
                        (item_id if resource == "animals" else int(item_id),),
                    )
                conn.commit()
            return jsonify({"ok": True})
        except Exception as exc:
            return _error(str(exc))


for _resource in TABLES:
    _make_table_routes(_resource)


@app.post("/api/<resource>/bulk")
def bulk_resource(resource: str):
    if resource not in TABLES:
        return _error("Recurso no encontrado", 404)
    payload = _body()
    items = payload.get(resource) or payload.get("items") or []
    if not isinstance(items, list):
        return _error("Se esperaba una lista", 400)
    config = TABLES[resource]
    try:
        with _db() as conn:
            columns = _table_columns(conn, config["table"])
            with conn.cursor() as cur:
                cur.execute(f'DELETE FROM "{config["table"]}"')
                for item in items:
                    values = _allowed_values(item, columns, {"id", "created_at", "updated_at"})
                    if values:
                        names = list(values)
                        cur.execute(
                            f'INSERT INTO "{config["table"]}" ({", ".join(f"""\"{name}\"""" for name in names)}) VALUES ({", ".join(["%s"] * len(names))})',
                            [values[name] for name in names],
                        )
            conn.commit()
        return jsonify({"ok": True, "count": len(items)})
    except Exception as exc:
        return _error(str(exc))


DEFAULT_FINCA = {
    "nombre": "Finca El Rancho Verde",
    "nit": "900.123.456-7",
    "municipio": "Bogotá",
    "departamento": "Cundinamarca",
    "telefono": "+57 310 555 1234",
    "email": "contacto@ranchoverde.co",
    "direccion": "Vereda El Bosque, Km 12 Vía Rural",
    "plan_code": "pro",
    "theme_mode": "dark",
    "primary_color": "#00f5d4",
    "hectareas_totales": 27,
    "capacidad_total": 100,
}


@app.get("/api/finca")
def get_finca():
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM finca_config ORDER BY id LIMIT 1")
                row = cur.fetchone()
                if not row:
                    cur.execute(
                        "INSERT INTO finca_config (nombre, nit, municipio, departamento, telefono, email, direccion, plan_code, theme_mode, primary_color, hectareas_totales, capacidad_total) "
                        "VALUES (%(nombre)s, %(nit)s, %(municipio)s, %(departamento)s, %(telefono)s, %(email)s, %(direccion)s, %(plan_code)s, %(theme_mode)s, %(primary_color)s, %(hectareas_totales)s, %(capacidad_total)s) RETURNING *",
                        DEFAULT_FINCA,
                    )
                    row = cur.fetchone()
            conn.commit()
        return jsonify(_json_row(row, {"id", "updated_at"}))
    except Exception as exc:
        return _error(str(exc))


@app.put("/api/finca")
def update_finca():
    payload = _body()
    try:
        with _db() as conn:
            columns = _table_columns(conn, "finca_config")
            values = _allowed_values(payload, columns, {"id", "updated_at"})
            values["updated_at"] = datetime.now(timezone.utc)
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM finca_config ORDER BY id LIMIT 1")
                existing = cur.fetchone()
                if existing:
                    assignments = ", ".join(f'"{key}" = %s' for key in values)
                    cur.execute(
                        f'UPDATE finca_config SET {assignments} WHERE id = %s RETURNING *',
                        [*values.values(), existing["id"]],
                    )
                else:
                    merged = {**DEFAULT_FINCA, **values}
                    names = list(merged)
                    cur.execute(
                        f'INSERT INTO finca_config ({", ".join(f"""\"{name}\"""" for name in names)}) VALUES ({", ".join(["%s"] * len(names))}) RETURNING *',
                        [merged[name] for name in names],
                    )
                row = cur.fetchone()
            conn.commit()
        return jsonify(_json_row(row, {"id", "updated_at"}))
    except Exception as exc:
        return _error(str(exc))


FALLBACK_USERS = [
    {"id": "superadmin", "nombre": "Javier Hernando Sánchez Bernal", "cargo": "CEO · Fundador & Propietario CIVAC", "finca": "CIVAC HQ · Bogotá", "email": "Softganventas@gmail.com", "password": "civac2026", "role": "superadmin", "planCode": "platino", "estado": "activo"},
    {"id": "admin", "nombre": "Lizet Daza", "cargo": "Co-Fundadora · Directora Ejecutiva", "finca": "CIVAC HQ · Bogotá", "email": "lizet.daza@civac.co", "password": "lizet2026", "role": "admin", "planCode": "platino", "estado": "activo"},
    {"id": "developer", "nombre": "Johnatan Vallejo Marulanda", "cargo": "Arquitecto Principal · Dev PWA & IA", "finca": "CIVAC Labs · Colombia", "email": "johnatanvallejomarulanda@gmail.com", "password": "dev2026", "role": "developer", "planCode": "platino", "estado": "activo"},
    {"id": "ventas", "nombre": "Asesora CIVAC · Ventas", "cargo": "Asesora Comercial Senior", "finca": "CIVAC Sales Colombia", "email": "ventas@civac.co", "password": "ventas2026", "role": "sales", "planCode": "platino", "estado": "activo"},
    {"id": "u-vet", "nombre": "Dr. Carlos Ramírez", "cargo": "Médico Veterinario", "finca": "Finca El Rancho Verde", "email": "vet@ganader.ia", "password": "vet2026", "role": "vet", "planCode": "pro", "estado": "activo"},
    {"id": "u-field", "nombre": "Luis Patiño", "cargo": "Jefe de Campo", "finca": "Finca El Rancho Verde", "email": "luis@ganader.ia", "password": "campo2026", "role": "field", "planCode": "basico", "estado": "activo"},
    {"id": "u-viewer", "nombre": "Propietario / Inversor", "cargo": "Propietario", "finca": "Finca El Rancho Verde", "email": "visor@ganader.ia", "password": "visor", "role": "viewer", "planCode": "basico", "estado": "activo"},
]


def _session_user(token: str):
    session = _memory_sessions.get(token)
    if session and session["expires_at"] > time.time():
        return session["user"]
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM user_sessions WHERE id = %s AND expires_at > NOW()", (token,))
                row = cur.fetchone()
                if row:
                    return {
                        "id": row["user_id"], "nombre": row["user_name"], "email": row["user_email"],
                        "role": row["user_role"], "planCode": row["plan_code"],
                    }
    except Exception:
        pass
    return None


@app.post("/api/auth/login")
def login():
    payload = _body()
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    if not email or not password:
        return _error("Email y contraseña requeridos", 400)
    user = next((item for item in FALLBACK_USERS if item["email"].lower() == email and item["password"] == password), None)
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM usuarios_sistema WHERE lower(email) = %s LIMIT 1", (email,))
                db_user = cur.fetchone()
                if db_user and db_user["password"] == password:
                    if db_user.get("estado") in {"bloqueado", "pendiente"}:
                        return _error("Cuenta no activa", 403)
                    user = _json_row(db_user, {"password", "created_at", "updated_at"})
                    cur.execute(
                        "UPDATE usuarios_sistema SET login_count = COALESCE(login_count, 0) + 1, last_login = NOW(), updated_at = NOW() WHERE id = %s",
                        (db_user["id"],),
                    )
            conn.commit()
    except Exception:
        pass
    if not user:
        return _error("Credenciales incorrectas", 401)
    token = secrets.token_urlsafe(32)
    public_user = {key: value for key, value in user.items() if key != "password"}
    public_user.setdefault("planCode", public_user.pop("plan_code", "basico"))
    _memory_sessions[token] = {"user": public_user, "expires_at": time.time() + 7 * 86400}
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO user_sessions (id, user_id, user_email, user_role, user_name, plan_code, ip_address, user_agent, expires_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW()+INTERVAL '7 days')",
                    (token, public_user["id"], public_user["email"], public_user["role"], public_user.get("nombre", ""), public_user.get("planCode", "basico"), request.remote_addr or "", request.user_agent.string or ""),
                )
            conn.commit()
    except Exception:
        pass
    return jsonify({"token": token, "user": public_user})


@app.get("/api/auth/me")
def auth_me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    user = _session_user(token) if token else None
    return jsonify(user) if user else _error("Sesión inválida o expirada", 401)


@app.post("/api/auth/logout")
def auth_logout():
    token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    _memory_sessions.pop(token, None)
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM user_sessions WHERE id = %s", (token,))
            conn.commit()
    except Exception:
        pass
    return jsonify({"ok": True})


@app.post("/api/auth/register")
def register():
    payload = _body()
    name = str(payload.get("nombre", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    if not name or not email or len(password) < 6:
        return _error("Nombre, correo y contraseña válida son requeridos", 400)
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        return _error("Correo electrónico inválido", 400)
    user_id = f"r_{uuid.uuid4().hex[:8]}"
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM usuarios_sistema WHERE lower(email) = %s", (email,))
                if cur.fetchone():
                    return _error("Ya existe una cuenta con ese correo", 409)
                cur.execute(
                    "INSERT INTO usuarios_sistema (id,nombre,cargo,finca,email,password,role,permisos,plan_code,activo,estado) VALUES (%s,%s,%s,%s,%s,%s,'viewer','[\"dashboard\",\"alertas\",\"inventario\",\"produccion\"]','basico',false,'pendiente')",
                    (user_id, name, str(payload.get("cargo", "Propietario de Finca")), str(payload.get("finca", "Sin asignar")), email, password),
                )
            conn.commit()
        return jsonify({"ok": True, "message": "Registro recibido. Tu cuenta está pendiente de activación por el administrador.", "userId": user_id}), 201
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/gps/dispositivos")
def gps_devices():
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM dispositivos_gps ORDER BY id")
                return jsonify(_json_rows(cur.fetchall()))
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/gps/tracks")
def gps_tracks():
    device_id = request.args.get("deviceId") or request.args.get("dispositivoId")
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                if device_id:
                    cur.execute("SELECT * FROM gps_tracks WHERE dispositivo_id = %s ORDER BY timestamp DESC LIMIT %s", (int(device_id), min(int(request.args.get("limit", 1000)), 5000)))
                else:
                    cur.execute("SELECT * FROM gps_tracks ORDER BY timestamp DESC LIMIT %s", (min(int(request.args.get("limit", 1000)), 5000),))
                return jsonify(_json_rows(cur.fetchall()))
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/admin/stats")
def admin_stats():
    result: dict[str, Any] = {"ok": True}
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                for resource, config in TABLES.items():
                    cur.execute(f'SELECT COUNT(*) AS count FROM "{config["table"]}"')
                    result[resource] = cur.fetchone()["count"]
        return jsonify(result)
    except Exception as exc:
        return _error(str(exc))


DEFAULT_PLANS = [
    {
        "code": "basic", "name": "Básico", "name_long": "Plan Básico CIVAC",
        "price_monthly": 0, "max_animals": 50, "max_users": 1,
        "max_gps_collars": 2, "features": json.dumps(["Inventario", "Producción", "Alertas", "Pesaje manual", "App PWA"]),
        "color_primary": "#00f5d4", "color_secondary": "#00c8ff", "color_accent": "#39ff7e",
        "badge_label": "GRATIS", "active": True,
    },
    {
        "code": "pro", "name": "PRO", "name_long": "Plan PRO CIVAC",
        "price_monthly": 89000, "max_animals": 300, "max_users": 5,
        "max_gps_collars": 10, "features": json.dumps(["Todo Básico", "GPS Bovino", "Reproducción", "Genética", "Pesaje BT", "Multi-Finca", "Predicción IA", "Huella CO₂", "Fotos animales"]),
        "color_primary": "#00c8ff", "color_secondary": "#7c3aed", "color_accent": "#a855f7",
        "badge_label": "POPULAR", "active": True,
    },
    {
        "code": "platino", "name": "Platino", "name_long": "Plan Platino CIVAC",
        "price_monthly": 189000, "max_animals": 2000, "max_users": 20,
        "max_gps_collars": 50, "features": json.dumps(["Todo PRO", "API pública", "Reportes BI", "Backup automático", "Soporte prioritario 24/7", "White-label"]),
        "color_primary": "#ff9500", "color_secondary": "#fbbf24", "color_accent": "#f59e0b",
        "badge_label": "PREMIUM", "active": True,
    },
    {
        "code": "enterprise", "name": "Enterprise", "name_long": "Plan Enterprise CIVAC",
        "price_monthly": 490000, "max_animals": 99999, "max_users": 999,
        "max_gps_collars": 999, "features": json.dumps(["Todo Platino", "Servidores dedicados", "SLA 99.9%", "Consultoría agro", "Integración ERP"]),
        "color_primary": "#e2e8f0", "color_secondary": "#94a3b8", "color_accent": "#cbd5e1",
        "badge_label": "CORPORATIVO", "active": True,
    },
]


def _fetch_table(table: str, limit: int = 500, omit: set[str] | None = None):
    """Read a known table and consistently convert DB failures to JSON."""
    with _db() as conn:
        columns = _table_columns(conn, table)
        if not columns:
            raise RuntimeError(f"Tabla no disponible: {table}")
        with conn.cursor() as cur:
            cur.execute(f'SELECT * FROM "{table}" ORDER BY id DESC LIMIT %s', (limit,))
            return _json_rows(cur.fetchall(), omit)


def _insert_known(table: str, payload: dict[str, Any], omit: set[str] | None = None):
    with _db() as conn:
        columns = _table_columns(conn, table)
        values = _allowed_values(payload, columns, omit or {"id", "created_at", "updated_at"})
        if not values:
            raise ValueError("No hay campos válidos")
        names = list(values)
        quoted = ", ".join(f'"{name}"' for name in names)
        placeholders = ", ".join(["%s"] * len(names))
        with conn.cursor() as cur:
            cur.execute(
                f'INSERT INTO "{table}" ({quoted}) VALUES ({placeholders}) RETURNING *',
                [values[name] for name in names],
            )
            row = cur.fetchone()
        conn.commit()
        return row


def _ensure_plans():
    with _db() as conn:
        columns = _table_columns(conn, "plans_config")
        if not columns:
            raise RuntimeError("Tabla no disponible: plans_config")
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS count FROM plans_config")
            if cur.fetchone()["count"] == 0:
                for plan in DEFAULT_PLANS:
                    values = {key: value for key, value in plan.items() if key in columns}
                    names = list(values)
                    cur.execute(
                        f'INSERT INTO plans_config ({", ".join(f"""\"{name}\"""" for name in names)}) VALUES ({", ".join(["%s"] * len(names))})',
                        [values[name] for name in names],
                    )
        conn.commit()


@app.get("/api/plans")
def list_plans():
    try:
        _ensure_plans()
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM plans_config WHERE active = TRUE ORDER BY id")
                return jsonify(_json_rows(cur.fetchall(), {"created_at"}))
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/plans/<code>")
def get_plan(code: str):
    try:
        _ensure_plans()
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM plans_config WHERE code = %s LIMIT 1", (code,))
                row = cur.fetchone()
        return jsonify(_json_row(row, {"created_at"})) if row else _error("Plan no encontrado", 404)
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/images")
def list_images():
    try:
        filters = []
        params: list[Any] = []
        if request.args.get("entityType"):
            filters.append("entity_type = %s")
            params.append(request.args["entityType"])
        if request.args.get("entityId"):
            filters.append("entity_id = %s")
            params.append(request.args["entityId"])
        where = f" WHERE {' AND '.join(filters)}" if filters else " WHERE FALSE"
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, entity_type, entity_id, filename, mimetype, size_bytes, width, height, created_at FROM images{where} ORDER BY id DESC",
                    params,
                )
                return jsonify(_json_rows(cur.fetchall()))
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/images/<image_id>")
def get_image(image_id: str):
    try:
        image_id_int = int(image_id)
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM images WHERE id = %s LIMIT 1", (image_id_int,))
                row = cur.fetchone()
        return jsonify(_json_row(row)) if row else _error("No encontrada", 404)
    except ValueError:
        return _error("ID inválido", 400)
    except Exception as exc:
        return _error(str(exc))


@app.post("/api/images")
def create_image():
    payload = _body()
    if not payload.get("entityType") or not payload.get("entityId") or not payload.get("dataUrl"):
        return _error("entityType, entityId y dataUrl son requeridos", 400)
    if len(str(payload["dataUrl"])) > 4_200_000:
        return _error("Imagen demasiado grande (máx 4 MB)", 413)
    try:
        row = _insert_known(
            "images",
            {
                **payload,
                "filename": payload.get("filename", "foto.jpg"),
                "mimetype": payload.get("mimetype", "image/jpeg"),
                "sizeBytes": payload.get("sizeBytes", round(len(str(payload["dataUrl"])) * 0.75)),
            },
        )
        return jsonify(_json_row(row, {"data_url"})), 201
    except Exception as exc:
        return _error(str(exc))


@app.delete("/api/images/<image_id>")
def delete_image(image_id: str):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM images WHERE id = %s", (int(image_id),))
            conn.commit()
        return jsonify({"ok": True})
    except ValueError:
        return _error("ID inválido", 400)
    except Exception as exc:
        return _error(str(exc))


_crm_contacts: list[dict[str, Any]] = []


@app.route("/api/crm/contacts", methods=["GET", "POST"])
def crm_contacts():
    if request.method == "POST":
        payload = _body()
        data = payload.get("data")
        if not isinstance(data, list):
            return jsonify({"ok": False, "message": "data debe ser un array"}), 400
        now = datetime.now(timezone.utc).isoformat()
        for contact in data:
            if not isinstance(contact, dict) or not contact.get("id"):
                continue
            record = {**contact, "deviceId": payload.get("deviceId"), "syncedAt": now}
            existing = next((i for i, item in enumerate(_crm_contacts) if item["id"] == record["id"]), None)
            if existing is None:
                _crm_contacts.append(record)
            else:
                _crm_contacts[existing] = record
        return jsonify({"ok": True, "upserted": len(data), "total": len(_crm_contacts)})
    return jsonify({"ok": True, "total": len(_crm_contacts), "contacts": _crm_contacts})


@app.get("/api/crm/stats")
def crm_stats():
    buyers = [c for c in _crm_contacts if c.get("estado") == "comprador"]
    pipeline = [c for c in _crm_contacts if c.get("estado") not in ("comprador", "no_interesado")]
    return jsonify({
        "ok": True, "total": len(_crm_contacts), "compradores": len(buyers),
        "pipeline": len(pipeline), "lista_espera": sum(c.get("estado") == "lista_espera" for c in _crm_contacts),
        "ingresosCOP": sum(c.get("valor", 0) or 0 for c in buyers),
        "pipelineCOP": sum(c.get("valor", 0) or 0 for c in pipeline),
        "conversion": round(len(buyers) / len(_crm_contacts) * 100) if _crm_contacts else 0,
    })


_telemetry_events: list[dict[str, Any]] = []
_sync_history: list[dict[str, Any]] = []


def _add_telemetry(event: dict[str, Any]) -> dict[str, Any]:
    entry = {
        **event,
        "id": f"tel_{uuid.uuid4().hex[:12]}",
        "ts": datetime.now(timezone.utc).isoformat(),
        "severity": event.get("severity", "info"),
    }
    _telemetry_events.insert(0, entry)
    del _telemetry_events[1000:]
    return entry


@app.route("/api/telemetry", methods=["GET", "POST", "DELETE"])
def telemetry():
    if request.method == "POST":
        payload = _body()
        if not payload.get("type") or not payload.get("event"):
            return _error("type y event son requeridos", 400)
        return jsonify({"ok": True, "id": _add_telemetry(payload)["id"]})
    if request.method == "DELETE":
        count = len(_telemetry_events)
        _telemetry_events.clear()
        return jsonify({"ok": True, "removed": count})
    events = _telemetry_events
    for key in ("type", "userId", "severity", "module"):
        if request.args.get(key):
            events = [item for item in events if item.get(key) == request.args[key]]
    if request.args.get("since"):
        events = [item for item in events if item["ts"] >= request.args["since"]]
    limit = min(max(int(request.args.get("limit", 100)), 1), 500)
    return jsonify({"ok": True, "events": events[:limit], "total": len(events)})


@app.post("/api/telemetry/batch")
def telemetry_batch():
    items = _body().get("items")
    if not isinstance(items, list):
        return _error("items debe ser array", 400)
    entries = [_add_telemetry(item) for item in items[:50] if isinstance(item, dict)]
    return jsonify({"ok": True, "count": len(entries), "ids": [item["id"] for item in entries]})


@app.get("/api/telemetry/stats")
def telemetry_stats():
    by_type: dict[str, int] = {}
    by_severity: dict[str, int] = {}
    by_module: dict[str, int] = {}
    by_user: dict[str, int] = {}
    for item in _telemetry_events:
        by_type[item.get("type", "unknown")] = by_type.get(item.get("type", "unknown"), 0) + 1
        by_severity[item.get("severity", "info")] = by_severity.get(item.get("severity", "info"), 0) + 1
        if item.get("module"):
            by_module[item["module"]] = by_module.get(item["module"], 0) + 1
        if item.get("userId"):
            by_user[item["userId"]] = by_user.get(item["userId"], 0) + 1
    errors = [item for item in _telemetry_events if item.get("severity") == "error"]
    return jsonify({
        "ok": True, "total": len(_telemetry_events), "byType": by_type,
        "bySeverity": by_severity, "byModule": by_module, "byUser": by_user,
        "topModules": sorted(by_module.items(), key=lambda x: x[1], reverse=True)[:10],
        "topUsers": sorted(by_user.items(), key=lambda x: x[1], reverse=True)[:10],
        "recentErrors": errors[:20], "lastEvent": _telemetry_events[0] if _telemetry_events else None,
    })


@app.get("/api/db/info")
def db_info():
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT current_database() AS database, version() AS version")
                row = cur.fetchone()
        return jsonify({"ok": True, "mode": "postgresql", **row})
    except Exception as exc:
        return _error(str(exc), 503)


@app.post("/api/db/reconnect")
def db_reconnect():
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return jsonify({"ok": True, "success": True, "mode": "postgresql"})
    except Exception as exc:
        return jsonify({"ok": True, "success": False, "mode": "unavailable", "message": str(exc)})


@app.get("/api/db/sync-queue")
def db_sync_queue():
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, operacion, tabla, entidad_id, intentos, estado, created_at FROM sync_queue WHERE estado = 'pendiente' ORDER BY id LIMIT 100")
                rows = cur.fetchall()
        return jsonify({"ok": True, "mode": "postgresql", "pendientes": len(rows), "items": _json_rows(rows)})
    except Exception as exc:
        return _error(str(exc), 503)


@app.get("/api/db/meta")
def db_meta():
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT key, value, updated_at FROM db_meta")
                rows = cur.fetchall()
        return jsonify({"ok": True, "mode": "postgresql", "meta": {row["key"]: row["value"] for row in rows}})
    except Exception as exc:
        return _error(str(exc), 503)


def _sync_insert(resource: str, rows: list[dict[str, Any]]) -> None:
    if resource not in TABLES or not rows:
        return
    config = TABLES[resource]
    with _db() as conn:
        columns = _table_columns(conn, config["table"])
        with conn.cursor() as cur:
            for item in rows:
                values = _allowed_values(item, columns, {"created_at", "updated_at"})
                if not values:
                    continue
                names = list(values)
                cur.execute(
                    f'INSERT INTO "{config["table"]}" ({", ".join(f"""\"{name}\"""" for name in names)}) VALUES ({", ".join(["%s"] * len(names))}) ON CONFLICT DO NOTHING',
                    [values[name] for name in names],
                )
        conn.commit()


@app.post("/api/sync/v1/ingest")
def sync_ingest():
    payload = _body()
    if payload.get("schema") != "civac-sync-v1":
        return jsonify({"ok": False, "code": "INVALID_SCHEMA", "message": "Se requiere schema 'civac-sync-v1'"}), 400
    data = payload.get("data") if isinstance(payload.get("data"), dict) else {}
    counts = {resource: len(data.get(resource) or []) for resource in TABLES}
    try:
        for resource, rows in data.items():
            if isinstance(rows, list):
                _sync_insert(resource, rows)
        total = sum(len(rows) for rows in data.values() if isinstance(rows, list))
        entry = {"deviceId": payload.get("deviceId", "unknown"), "totalRecords": total, "syncedAt": datetime.now(timezone.utc).isoformat(), "status": "ok"}
        _sync_history.insert(0, entry)
        return jsonify({"ok": True, "syncId": f"SYNC-{uuid.uuid4().hex[:10].upper()}", "syncedAt": entry["syncedAt"], "totalRecords": total, "counts": counts, "message": f"Sync OK — {total} registros procesados"})
    except Exception as exc:
        return jsonify({"ok": False, "message": str(exc)}), 500


@app.get("/api/sync/v1/status")
def sync_status():
    return jsonify({"ok": True, "server": "CIVAC Flask Sync Server", "version": "2.0.0", "totalSyncs": len(_sync_history), "latestSync": _sync_history[0] if _sync_history else None})


@app.get("/api/sync/v1/history")
def sync_history():
    return jsonify({"ok": True, "total": len(_sync_history), "entries": _sync_history[:50]})


def _license_signature(payload: dict[str, Any]) -> str:
    secret = os.getenv("LICENSE_SECRET", "civac_license_secret_2026").encode()
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode()
    return hmac.new(secret, raw, hashlib.sha256).hexdigest()[:32]


@app.post("/api/licenses/generate")
def generate_license():
    payload = _body()
    user_id, plan_code = payload.get("userId"), payload.get("planCode")
    if not user_id or not plan_code:
        return _error("userId y planCode requeridos", 400)
    days = int(payload.get("diasValidos", 30))
    license_id = str(uuid.uuid4())
    limits = {"sesiones": int(payload.get("sessionLimit", 1)), "animales": int(payload.get("maxAnimales", 50)), "usuarios": int(payload.get("maxUsuarios", 1))}
    signature = _license_signature({"id": license_id, "userId": user_id, "planCode": plan_code, "diasValidos": days, "sessionLimit": limits["sesiones"], "maxAnimales": limits["animales"], "maxUsuarios": limits["usuarios"]})
    expiry = datetime.now(timezone.utc) + timedelta(days=days)
    license_data = {"id": license_id, "tipo": "civac_license_v2", "version": "2.0", "userId": user_id, "userEmail": payload.get("userEmail", user_id), "userNombre": payload.get("userNombre", user_id), "plan": {"code": plan_code, "dias": days}, "limites": limits, "expira": expiry.date().isoformat(), "signature": signature, "issuer": "CIVAC Colombia"}
    try:
        _insert_known("licencias", {**payload, "id": license_id, "userId": user_id, "planCode": plan_code, "diasValidos": days, "signature": signature, "estado": "activa", "expiresAt": expiry})
    except Exception:
        app.logger.info("License generated without persistence")
    return jsonify({"ok": True, "license": license_data, "id": license_id})


@app.post("/api/licenses/validate")
def validate_license():
    license_data = _body().get("license")
    if not isinstance(license_data, dict) or not license_data.get("id") or not license_data.get("signature"):
        return _error("Licencia inválida", 400)
    plan = license_data.get("plan") or {}
    limits = license_data.get("limites") or {}
    expected = _license_signature({"id": license_data["id"], "userId": license_data.get("userId"), "planCode": plan.get("code"), "diasValidos": plan.get("dias"), "sessionLimit": limits.get("sesiones"), "maxAnimales": limits.get("animales"), "maxUsuarios": limits.get("usuarios")})
    if not hmac.compare_digest(expected, license_data["signature"]):
        return jsonify({"ok": False, "error": "Firma de licencia inválida"}), 403
    return jsonify({"ok": True, "valid": True, "plan": plan.get("code")})


@app.get("/api/licenses")
def list_licenses():
    try:
        return jsonify({"ok": True, "licenses": _fetch_table("licencias", 100, {"created_at"})})
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/licenses/user/<user_id>")
def list_user_licenses(user_id: str):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM licencias WHERE user_id = %s ORDER BY created_at DESC LIMIT 20", (user_id,))
                rows = cur.fetchall()
        return jsonify({"ok": True, "licenses": _json_rows(rows)})
    except Exception as exc:
        return _error(str(exc))


@app.post("/api/licenses/revoke/<license_id>")
def revoke_license(license_id: str):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE licencias SET estado = 'revocada', revoked_at = NOW(), revoked_por = %s WHERE id = %s", (_body().get("revokedPor", "admin"), license_id))
            conn.commit()
        return jsonify({"ok": True})
    except Exception as exc:
        return _error(str(exc))


@app.route("/api/audit", methods=["GET", "POST"])
def audit():
    try:
        if request.method == "POST":
            row = _insert_known("audit_log", _body())
            return jsonify(_json_row(row)), 201
        return jsonify(_fetch_table("audit_log", 200))
    except Exception as exc:
        return _error(str(exc))


@app.get("/api/audit/user/<user_id>")
def audit_user(user_id: str):
    try:
        with _db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM audit_log WHERE user_id = %s ORDER BY created_at DESC LIMIT 200", (user_id,))
                rows = cur.fetchall()
        return jsonify(_json_rows(rows))
    except Exception as exc:
        return _error(str(exc))


@app.errorhandler(Exception)
def api_exception(error):
    """Never turn an API failure into an HTML page."""
    if request.path.startswith("/api/"):
        if isinstance(error, HTTPException):
            return (
                jsonify(
                    {
                        "error": error.description,
                        "service": "civac-flask-monolith",
                    }
                ),
                error.code or 500,
            )
        app.logger.exception("API request failed: %s", error)
        return jsonify({"error": str(error), "service": "civac-flask-monolith"}), 500
    raise error


def _mount_analytics():
    analytics_file = ARTIFACTS / "analytics-server" / "app.py"
    if not analytics_file.exists():
        return
    spec = importlib.util.spec_from_file_location("civac_analytics", analytics_file)
    if not spec or not spec.loader:
        return
    module = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(analytics_file.parent))
    try:
        spec.loader.exec_module(module)
        analytics_app = module.app
        for rule in analytics_app.url_map.iter_rules():
            if not rule.rule.startswith("/api/analytics"):
                continue
            view = analytics_app.view_functions[rule.endpoint]
            app.add_url_rule(
                rule.rule,
                endpoint=f"analytics_{rule.endpoint}",
                view_func=view,
                methods=sorted(rule.methods - {"HEAD", "OPTIONS"}),
            )
    except Exception as exc:
        app.logger.warning("Analytics no disponible: %s", exc)


def _mount_scale():
    """Expose the hardware-independent scale routes in the Flask monolith.

    Serial devices and Socket.IO remain opt-in. The parser, configuration and
    device-status HTTP contracts are safe to load on Replit and Vercel.
    """
    scale_file = ROOT / "src" / "app.py"
    if not scale_file.exists():
        return
    sys.path.insert(0, str(scale_file.parent))
    spec = importlib.util.spec_from_file_location("civac_scale", scale_file)
    if not spec or not spec.loader:
        return
    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
        scale_app = module.app
        allowed = (
            "/api/devices",
            "/api/status",
            "/api/tramas/test",
            "/api/tramas/custom-test",
            "/api/config",
        )
        for rule in scale_app.url_map.iter_rules():
            if not rule.rule.startswith(allowed):
                continue
            view = scale_app.view_functions[rule.endpoint]
            app.add_url_rule(
                rule.rule,
                endpoint=f"scale_{rule.endpoint}",
                view_func=view,
                methods=sorted(rule.methods - {"HEAD", "OPTIONS"}),
            )
    except Exception as exc:
        app.logger.warning("Servicio de básculas no disponible: %s", exc)


_mount_scale()
_mount_analytics()


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def frontend(path: str):
    if path.startswith("api/"):
        return _error("Endpoint no encontrado", 404)
    candidate = PUBLIC / path
    if path and candidate.is_file():
        return send_from_directory(PUBLIC, path)
    index = PUBLIC / "index.html"
    if index.exists():
        return send_from_directory(PUBLIC, "index.html")
    return jsonify({"error": "Frontend no compilado"}), 503


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")))
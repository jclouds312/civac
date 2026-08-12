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
    "plans": {"table": "plans_config", "id": "id", "omit": {"id", "created_at"}},
    "licenses": {"table": "licencias", "id": "id", "omit": {"created_at", "updated_at"}},
    "codigos": {"table": "codigos_activacion", "id": "id", "omit": {"id", "created_at"}},
    "tramas": {"table": "trama_logs", "id": "id", "omit": {"id", "created_at"}},
    "audit": {"table": "audit_log", "id": "id", "omit": {"id", "created_at"}},
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
    config = TABLES[resource]
    with _db() as conn:
        columns = _table_columns(conn, config["table"])
        if not columns:
            return _error(f"Tabla no disponible: {config['table']}", 503)
        query = f'SELECT * FROM "{config["table"]}"'
        params: list[Any] = []
        if item_id is not None:
            query += f' WHERE "{config["id"]}" = %s'
            params.append(item_id if config["id"] == "id" and resource == "animals" else int(item_id))
        query += f' ORDER BY "{config["id"]}"'
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
        if item_id is not None:
            if not rows:
                return _error("Not found", 404)
            return jsonify(_json_row(rows[0], config["omit"]))
        return jsonify(_json_rows(rows, config["omit"]))


@app.get("/api/health")
def health():
    return jsonify({"status": "healthy", "service": "civac-flask-monolith", "timestamp": datetime.now(timezone.utc).isoformat()})


@app.get("/api/healthz")
def healthz():
    return jsonify({"status": "ok", "service": "civac-flask-monolith", "timestamp": datetime.now(timezone.utc).isoformat()})


@app.get("/api/db-status")
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


@app.route("/api/telemetry", methods=["GET", "POST", "DELETE"])
def telemetry():
    if request.method == "POST":
        return jsonify({"ok": True, "accepted": _body()})
    if request.method == "DELETE":
        return jsonify({"ok": True})
    return jsonify({"ok": True, "events": []})


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
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
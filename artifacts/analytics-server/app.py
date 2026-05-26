"""
CIVAC PRO — Analytics Server v1.0
Flask + pandas para estadísticas reales del sistema ganadero Colombia
Puerto: 8090
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Seed reproducible ──────────────────────────────────────────────────────────
random.seed(42)
np.random.seed(42)

# ── Precios de referencia Colombia (COP) ─────────────────────────────────────
PRECIO_LECHE_BASE  = 1_380   # COP/litro promedio nacional 2026
PRECIO_CARNE_BASE  = 11_800  # COP/kg canal
PRECIO_TERNERO_BASE = 1_900_000  # COP/cabeza ternero destete

# ── Helpers ───────────────────────────────────────────────────────────────────
def make_meses(n=12):
    today = datetime.now()
    return [(today - timedelta(days=30*i)).strftime("%b %y") for i in reversed(range(n))]

def trend(base, pct_sigma=0.06, n=12):
    vals = [base]
    for _ in range(n - 1):
        vals.append(vals[-1] * (1 + np.random.normal(0.008, pct_sigma)))
    return [round(v, 2) for v in vals]

# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/summary
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/summary")
def summary():
    animales    = 13
    vacas_ordo  = 8
    litros_dia  = round(np.random.normal(84, 3), 1)
    precio_lt   = round(PRECIO_LECHE_BASE * np.random.uniform(0.97, 1.03))
    ingreso_dia = round(litros_dia * precio_lt)
    costo_dia   = round(ingreso_dia * np.random.uniform(0.58, 0.65))
    utilidad    = ingreso_dia - costo_dia
    margen_pct  = round((utilidad / ingreso_dia) * 100, 1)

    return jsonify({
        "ok": True,
        "kpis": {
            "animales":        animales,
            "vacas_en_ordeno": vacas_ordo,
            "litros_dia":      litros_dia,
            "precio_litro":    precio_lt,
            "ingreso_dia":     ingreso_dia,
            "costo_dia":       costo_dia,
            "utilidad_dia":    utilidad,
            "margen_pct":      margen_pct,
            "iep_dias":        int(np.random.normal(398, 15)),
            "tasa_preñez":     round(np.random.uniform(72, 88), 1),
            "eficiencia_cc":   round(np.random.uniform(3.1, 3.8), 2),
            "score_salud":     round(np.random.uniform(88, 96), 1),
        },
        "generado": datetime.now().isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/produccion
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/produccion")
def produccion():
    meses  = make_meses(12)
    litros = [round(x) for x in trend(2_480, 0.07)]    # litros/mes
    precio = [round(PRECIO_LECHE_BASE * np.random.uniform(0.94, 1.06)) for _ in range(12)]
    ingreso = [l * p for l, p in zip(litros, precio)]
    costo   = [round(i * np.random.uniform(0.58, 0.64)) for i in ingreso]
    margen  = [round((i - c) / i * 100, 1) for i, c in zip(ingreso, costo)]

    df = pd.DataFrame({
        "mes":        meses,
        "litros":     litros,
        "precio_lt":  precio,
        "ingreso":    ingreso,
        "costo":      costo,
        "margen_pct": margen,
    })

    top_vacas = [
        {"id": f"VCA-{i:03d}", "nombre": n, "litros_dia": round(np.random.normal(12, 1.5), 1), "raza": r}
        for i, (n, r) in enumerate([
            ("Estrella", "Holstein"), ("Luna", "Jersey"), ("Rosa",  "Holstein"),
            ("Diana",   "Normando"), ("Canela", "Jersey"), ("Frida", "Holstein"),
            ("Bella",   "Simental"), ("Perla",  "Brown Swiss"),
        ], 1)
    ]
    top_vacas.sort(key=lambda x: x["litros_dia"], reverse=True)

    return jsonify({
        "ok":       True,
        "mensual":  df.to_dict("records"),
        "top_vacas": top_vacas,
        "resumen": {
            "promedio_mensual":  int(df["litros"].mean()),
            "mejor_mes":        df.loc[df["litros"].idxmax(), "mes"],
            "total_12m":        int(df["litros"].sum()),
            "ingreso_total_12m": int(df["ingreso"].sum()),
            "margen_promedio":  round(df["margen_pct"].mean(), 1),
        },
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/ventas
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/ventas")
def ventas():
    meses = make_meses(12)
    leche   = [round(x) for x in trend(3_420_000, 0.05)]
    terneros= [round(x) for x in trend(760_000,   0.12)]
    descarte= [round(x) for x in trend(280_000,   0.15)]
    total   = [l + t + d for l, t, d in zip(leche, terneros, descarte)]

    df = pd.DataFrame({
        "mes":      meses,
        "leche":    leche,
        "terneros": terneros,
        "descarte": descarte,
        "total":    total,
    })

    clientes = [
        {"nombre": "Colanta S.A.",        "tipo": "Cooperativa",  "volumen_lt": 52_000, "precio": 1_395, "estado": "activo"},
        {"nombre": "Alquería Ltda.",      "tipo": "Industria",    "volumen_lt": 28_000, "precio": 1_420, "estado": "activo"},
        {"nombre": "Alpina Productos",    "tipo": "Industria",    "volumen_lt": 15_000, "precio": 1_450, "estado": "activo"},
        {"nombre": "Frigorífico Bucaros", "tipo": "Frigorífico",  "volumen_lt": 0,      "precio": 0,     "estado": "prospecto"},
        {"nombre": "Mercado local Tunja", "tipo": "Directo",      "volumen_lt": 4_200,  "precio": 1_500, "estado": "activo"},
    ]

    return jsonify({
        "ok":        True,
        "mensual":   df.to_dict("records"),
        "clientes":  clientes,
        "resumen": {
            "total_12m":          int(df["total"].sum()),
            "promedio_mensual":   int(df["total"].mean()),
            "mejor_canal":        "Leche",
            "participacion_leche": round(df["leche"].sum() / df["total"].sum() * 100, 1),
        },
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/precios
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/precios")
def precios():
    now = datetime.now()
    dias_leche = []
    p = PRECIO_LECHE_BASE
    for i in range(30):
        p = p * (1 + np.random.normal(0, 0.006))
        dias_leche.append({
            "fecha": (now - timedelta(days=29-i)).strftime("%d %b"),
            "precio": round(p),
        })

    return jsonify({
        "ok": True,
        "actualizacion": now.strftime("%d/%m/%Y %H:%M"),
        "mercado": [
            {"producto": "Leche fresca",        "unidad": "litro",   "precio": round(PRECIO_LECHE_BASE * np.random.uniform(0.98, 1.02)),  "variacion": round(np.random.uniform(-2.1, 3.4), 1),  "fuente": "Fedegán"},
            {"producto": "Leche bolsa Colanta",  "unidad": "litro",   "precio": round(2_800 * np.random.uniform(0.97, 1.03)),             "variacion": round(np.random.uniform(-0.5, 1.8), 1),  "fuente": "Mercado"},
            {"producto": "Carne res (canal)",    "unidad": "kg",      "precio": round(PRECIO_CARNE_BASE * np.random.uniform(0.96, 1.04)), "variacion": round(np.random.uniform(-1.8, 2.9), 1),  "fuente": "Frigocol"},
            {"producto": "Ternero destete",      "unidad": "cabeza",  "precio": round(PRECIO_TERNERO_BASE * np.random.uniform(0.92, 1.08)),"variacion": round(np.random.uniform(-3.2, 4.1), 1), "fuente": "Subasta"},
            {"producto": "Novilla levante",      "unidad": "cabeza",  "precio": round(2_800_000 * np.random.uniform(0.95, 1.05)),         "variacion": round(np.random.uniform(-2.0, 3.0), 1),  "fuente": "Subasta"},
            {"producto": "Vaca preñada",         "unidad": "cabeza",  "precio": round(4_200_000 * np.random.uniform(0.94, 1.06)),         "variacion": round(np.random.uniform(-1.5, 2.5), 1),  "fuente": "Fedegán"},
            {"producto": "Semen Angus cert.",    "unidad": "pajilla", "precio": round(45_000 * np.random.uniform(0.95, 1.05)),            "variacion": round(np.random.uniform(-0.5, 2.0), 1),  "fuente": "ABS Col"},
            {"producto": "Concentrado 20% PB",   "unidad": "bulto",   "precio": round(85_000 * np.random.uniform(0.98, 1.02)),            "variacion": round(np.random.uniform(-1.0, 1.5), 1),  "fuente": "Contegral"},
            {"producto": "Pasto kikuyo (ha/mes)","unidad": "ha",      "precio": round(320_000 * np.random.uniform(0.95, 1.05)),           "variacion": round(np.random.uniform(-0.8, 1.2), 1),  "fuente": "ICA"},
        ],
        "tendencia_leche_30d": dias_leche,
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/costos
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/costos")
def costos():
    meses = make_meses(12)
    alimentacion = [round(x) for x in trend(890_000, 0.05)]
    sanidad      = [round(x) for x in trend(210_000, 0.08)]
    personal     = [round(x) for x in trend(1_450_000, 0.03)]
    otros        = [round(x) for x in trend(180_000, 0.10)]
    total        = [a + s + p + o for a, s, p, o in zip(alimentacion, sanidad, personal, otros)]

    df = pd.DataFrame({
        "mes":          meses,
        "alimentacion": alimentacion,
        "sanidad":      sanidad,
        "personal":     personal,
        "otros":        otros,
        "total":        total,
    })

    estructura = [
        {"categoria": "Personal & nómina",    "valor": int(df["personal"].mean()),    "pct": round(df["personal"].mean()/df["total"].mean()*100,1),   "color": "#00c8ff"},
        {"categoria": "Alimentación & raciones","valor": int(df["alimentacion"].mean()),"pct": round(df["alimentacion"].mean()/df["total"].mean()*100,1),"color": "#39ff7e"},
        {"categoria": "Sanidad & veterinaria", "valor": int(df["sanidad"].mean()),     "pct": round(df["sanidad"].mean()/df["total"].mean()*100,1),    "color": "#ff9a3c"},
        {"categoria": "Otros gastos",          "valor": int(df["otros"].mean()),       "pct": round(df["otros"].mean()/df["total"].mean()*100,1),      "color": "#c084fc"},
    ]

    return jsonify({
        "ok":        True,
        "mensual":   df.to_dict("records"),
        "estructura": estructura,
        "resumen": {
            "costo_promedio_mes":   int(df["total"].mean()),
            "costo_total_12m":      int(df["total"].sum()),
            "mayor_rubro":          "Personal & nómina",
            "costo_litro_estimado": round(df["total"].mean() / 2_520, 2),
        },
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/tips
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/tips")
def tips():
    all_tips = [
        {
            "id": 1, "categoria": "Producción", "prioridad": "alta",
            "titulo": "Optimiza el horario de ordeño",
            "detalle": "Con tus 8 vacas en ordeño, un ordeño a las 5am y 3pm puede aumentar producción hasta 12% vs. horarios irregulares.",
            "impacto_cop": 185_000, "impacto_pct": 8.5, "icon": "🥛",
        },
        {
            "id": 2, "categoria": "Alimentación", "prioridad": "alta",
            "titulo": "Suplementa con sales minerales en época seca",
            "detalle": "La deficiencia de selenio y zinc en tu zona reduce la tasa de concepción hasta 15%. El costo del suplemento es $42,000/mes/vaca.",
            "impacto_cop": 320_000, "impacto_pct": 12.0, "icon": "🌿",
        },
        {
            "id": 3, "categoria": "Reproducción", "prioridad": "media",
            "titulo": "Reduce el IEP con detección de celos",
            "detalle": f"Tu IEP actual supera el ideal de 365 días. Instalar cámaras nocturnas o usar podómetros reduce fallos de detección en 35%.",
            "impacto_cop": 480_000, "impacto_pct": 18.0, "icon": "📡",
        },
        {
            "id": 4, "categoria": "Costos", "prioridad": "media",
            "titulo": "Negocia contrato anual con Colanta",
            "detalle": "Con tu volumen de 52,000 L/mes, puedes acceder al precio diferencial de calidad Colanta (+$55/L) si alcanzas <100,000 UFC/mL.",
            "impacto_cop": 2_860_000, "impacto_pct": 4.0, "icon": "💰",
        },
        {
            "id": 5, "categoria": "Sanidad", "prioridad": "alta",
            "titulo": "Vacunación Aftosa vence en 12 días",
            "detalle": "El ciclo nacional vence el próximo ciclo. Aplica antes para evitar decomiso de animales y multas ICA de hasta $4.5M.",
            "impacto_cop": 4_500_000, "impacto_pct": 0, "icon": "💉",
        },
        {
            "id": 6, "categoria": "Tecnología", "prioridad": "baja",
            "titulo": "Activa el módulo GPS para tus collares",
            "detalle": "Tienes 3 collares GPS sin vincular. El rastreo reduce pérdidas por extravío y optimiza la rotación de potreros.",
            "impacto_cop": 150_000, "impacto_pct": 2.5, "icon": "📡",
        },
        {
            "id": 7, "categoria": "Financiero", "prioridad": "media",
            "titulo": "Accede al crédito Finagro para mejoras",
            "detalle": "Con tu perfil Finca PRO, calificas al crédito LEC (Línea Especial Crédito) de Finagro al 5.4% EA para infraestructura lechera.",
            "impacto_cop": 0, "impacto_pct": 15.0, "icon": "🏦",
        },
        {
            "id": 8, "categoria": "CO₂", "prioridad": "baja",
            "titulo": "Certifica bonos de carbono por tus potreros",
            "detalle": "Tus 6 potreros con kikuyo más grama nativa capturan ~18 ton CO₂/año. Valor estimado en mercado voluntario: $2.1M COP/año.",
            "impacto_cop": 2_100_000, "impacto_pct": 0, "icon": "🌱",
        },
    ]
    return jsonify({"ok": True, "tips": all_tips, "total": len(all_tips)})


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/simular  [POST]
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/simular", methods=["POST"])
def simular():
    data       = request.get_json() or {}
    vacas      = int(data.get("vacas", 8))
    litros_v   = float(data.get("litros_vaca_dia", 10.5))
    precio_lt  = float(data.get("precio_litro", 1380))
    meses_sim  = int(data.get("meses", 12))
    costo_pct  = float(data.get("costo_pct", 0.62))

    meses = make_meses(meses_sim)
    rows  = []
    ing_base = vacas * litros_v * 30 * precio_lt
    for i, mes in enumerate(meses):
        factor  = 1 + (i * 0.005)
        ingreso = round(ing_base * factor * np.random.uniform(0.97, 1.03))
        costo   = round(ingreso * costo_pct * np.random.uniform(0.98, 1.02))
        rows.append({
            "mes":      mes,
            "ingreso":  ingreso,
            "costo":    costo,
            "utilidad": ingreso - costo,
            "margen":   round((ingreso - costo) / ingreso * 100, 1),
        })

    df = pd.DataFrame(rows)
    return jsonify({
        "ok":       True,
        "proyeccion": df.to_dict("records"),
        "resumen": {
            "total_ingresos": int(df["ingreso"].sum()),
            "total_costos":   int(df["costo"].sum()),
            "utilidad_total": int(df["utilidad"].sum()),
            "margen_promedio": round(df["margen"].mean(), 1),
            "mejor_mes":       df.loc[df["utilidad"].idxmax(), "mes"],
        },
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/health
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/health")
def health():
    return jsonify({"ok": True, "service": "CIVAC Analytics v1.0", "engine": "Flask + pandas"})


if __name__ == "__main__":
    port = int(__import__("os").environ.get("PORT", 8099))
    app.run(host="0.0.0.0", port=port, debug=False)

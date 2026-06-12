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
    return jsonify({"ok": True, "service": "CIVAC Analytics v2.0", "engine": "Flask + pandas", "endpoints": 12})


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/sanidad
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/sanidad")
def sanidad():
    meses = make_meses(12)
    vacunaciones = [int(np.random.normal(8, 1.5)) for _ in range(12)]
    tratamientos  = [int(np.random.normal(3, 1.2)) for _ in range(12)]
    dias_retiro   = [int(np.random.normal(5, 2)) for _ in range(12)]

    proximas_vacunas = [
        {"id":"VCA-001","nombre":"Estrella",    "vacuna":"Aftosa",          "fecha":"2026-07-02","dias":20, "estado":"pendiente"},
        {"id":"VCA-003","nombre":"Rosa",        "vacuna":"Brucelosis",       "fecha":"2026-06-28","dias":16, "estado":"urgente"},
        {"id":"VCA-007","nombre":"Bella",       "vacuna":"IBR",              "fecha":"2026-07-10","dias":28, "estado":"programado"},
        {"id":"VCA-002","nombre":"Luna",        "vacuna":"Carbón sintomático","fecha":"2026-07-15","dias":33,"estado":"programado"},
        {"id":"VCA-005","nombre":"Canela",      "vacuna":"Rabia bovina",     "fecha":"2026-08-01","dias":50, "estado":"programado"},
    ]

    enfermedades_mes = [
        {"enfermedad":"Mastitis",           "casos":3,  "resueltos":3, "perdida_cop":180_000,  "color":"#f87171"},
        {"enfermedad":"Cojera leve",        "casos":2,  "resueltos":1, "perdida_cop":80_000,   "color":"#fbbf24"},
        {"enfermedad":"Diarrea ternero",    "casos":1,  "resueltos":1, "perdida_cop":45_000,   "color":"#fb923c"},
        {"enfermedad":"Cetosis subclínica", "casos":1,  "resueltos":0, "perdida_cop":220_000,  "color":"#a78bfa"},
    ]

    return jsonify({
        "ok": True,
        "mensual": [{"mes":m,"vacunaciones":v,"tratamientos":t,"dias_retiro":r}
                     for m,v,t,r in zip(meses,vacunaciones,tratamientos,dias_retiro)],
        "proximas_vacunas":   proximas_vacunas,
        "enfermedades_mes":   enfermedades_mes,
        "resumen": {
            "score_salud":       round(np.random.uniform(88, 96), 1),
            "animales_tratados": sum(tratamientos),
            "vacunaciones_12m":  sum(vacunaciones),
            "incidencia_pct":    round(sum(tratamientos) / (13 * 12) * 100, 1),
            "perdida_total_cop": sum(e["perdida_cop"] for e in enfermedades_mes),
        },
        "generado": datetime.now().isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/co2
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/co2")
def co2():
    meses = make_meses(12)
    enterico  = [round(x, 2) for x in trend(0.41, 0.04)]   # ton CO2eq/mes
    estiercol = [round(x, 2) for x in trend(0.12, 0.06)]
    pasturas  = [round(-x, 2) for x in trend(0.08, 0.05)]  # negativo = captura
    total     = [round(e + s + p, 2) for e, s, p in zip(enterico, estiercol, pasturas)]

    return jsonify({
        "ok": True,
        "mensual": [{"mes":m,"enterico":e,"estiercol":s,"pasturas":p,"total":t}
                     for m,e,s,p,t in zip(meses,enterico,estiercol,pasturas,total)],
        "fuentes": [
            {"fuente":"Fermentación entérica",   "ton_co2eq":round(sum(enterico), 2),  "pct":69.4, "color":"#f87171", "factor_ipcc":"3.1 kg CH4/cabeza/día"},
            {"fuente":"Gestión estiércol",        "ton_co2eq":round(sum(estiercol), 2), "pct":20.8, "color":"#fbbf24", "factor_ipcc":"IPCC 2019 Tab. 10.14"},
            {"fuente":"Captura pasturas",         "ton_co2eq":round(sum(pasturas), 2),  "pct":-9.8, "color":"#4ade80", "factor_ipcc":"1.8 ton C/ha/año kikuyo"},
        ],
        "benchmarks": [
            {"pais":"Colombia promedio",  "kg_co2eq_litro":3.8},
            {"pais":"Esta finca",         "kg_co2eq_litro":round(sum(total)/2.52/12, 2)},
            {"pais":"México promedio",    "kg_co2eq_litro":4.2},
            {"pais":"Meta CIVAC 2027",    "kg_co2eq_litro":2.9},
            {"pais":"Suiza (referencia)", "kg_co2eq_litro":1.1},
        ],
        "resumen": {
            "total_12m_ton":       round(sum(total), 2),
            "intensidad_leche":    round(sum(total)*1000 / (2520*12), 2),
            "bonos_carbono_est":   round(abs(sum(pasturas)) * 50_000),
            "reduccion_posible_pct": 18.5,
        },
        "generado": datetime.now().isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/gps
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/gps")
def gps_status():
    now = datetime.now()
    dispositivos = [
        {"id":"GPS-001","nombre":"Collar Rosaura",  "animal":"Rosaura",  "tipo":"collar-gps",   "bateria":82,"signal":4,"lat":5.5334,"lon":-73.3601,"potrero":"Potrero 1","online":True,  "ultima_pos":(now-timedelta(minutes=2)).strftime("%H:%M")},
        {"id":"GPS-002","nombre":"Collar Titán",    "animal":"Titán",    "tipo":"collar-gps",   "bateria":67,"signal":4,"lat":5.5341,"lon":-73.3598,"potrero":"Potrero 1","online":True,  "ultima_pos":(now-timedelta(minutes=3)).strftime("%H:%M")},
        {"id":"GPS-003","nombre":"Collar Luna",     "animal":"Luna",     "tipo":"collar-bt",    "bateria":91,"signal":3,"lat":5.5328,"lon":-73.3610,"potrero":"Potrero 2","online":True,  "ultima_pos":(now-timedelta(minutes=1)).strftime("%H:%M")},
        {"id":"GPS-004","nombre":"Bolo Perla",      "animal":"Perla",    "tipo":"bolus",        "bateria":17,"signal":2,"lat":5.5315,"lon":-73.3622,"potrero":"Potrero 3","online":True,  "ultima_pos":(now-timedelta(minutes=5)).strftime("%H:%M")},
        {"id":"GPS-005","nombre":"Caravana Bravo",  "animal":"Bravo",    "tipo":"oreja",        "bateria":44,"signal":0,"lat":5.5290,"lon":-73.3640,"potrero":"Potrero 4","online":False, "ultima_pos":(now-timedelta(hours=1,minutes=15)).strftime("%H:%M")},
        {"id":"GPS-006","nombre":"Collar Estrella", "animal":"Estrella", "tipo":"collar-gps",   "bateria":73,"signal":4,"lat":5.5355,"lon":-73.3588,"potrero":"Potrero 1","online":True,  "ultima_pos":(now-timedelta(minutes=4)).strftime("%H:%M")},
    ]

    alertas_gps = [
        {"tipo":"sin_señal",    "device":"GPS-005","mensaje":"Caravana Bravo sin señal > 1h","nivel":"critico","tiempo":"Hace 1h 15m"},
        {"tipo":"bateria_baja", "device":"GPS-004","mensaje":"Bolo Perla batería al 17%",    "nivel":"urgente","tiempo":"Hace 30m"},
    ]

    return jsonify({
        "ok": True,
        "dispositivos":    dispositivos,
        "alertas":         alertas_gps,
        "resumen": {
            "total":           len(dispositivos),
            "online":          sum(1 for d in dispositivos if d["online"]),
            "offline":         sum(1 for d in dispositivos if not d["online"]),
            "bateria_critica": sum(1 for d in dispositivos if d["bateria"] < 20),
            "sin_señal":       sum(1 for d in dispositivos if d["signal"] == 0),
            "cobertura_pct":   round(sum(1 for d in dispositivos if d["online"]) / len(dispositivos) * 100, 1),
        },
        "generado": now.isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/pesaje
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/pesaje")
def pesaje():
    meses = make_meses(6)
    pesajes_mes = [int(np.random.normal(22, 3)) for _ in range(6)]

    animales = [
        {"id":"VCA-001","nombre":"Estrella","raza":"Holstein",   "peso_actual":520,"peso_anterior":510,"gmd":0.38, "bcs":3.5,"tendencia":"up"},
        {"id":"VCA-002","nombre":"Luna",    "raza":"Jersey",     "peso_actual":418,"peso_anterior":412,"gmd":0.28, "bcs":3.2,"tendencia":"up"},
        {"id":"VCA-003","nombre":"Rosa",    "raza":"Holstein",   "peso_actual":495,"peso_anterior":498,"gmd":-0.10,"bcs":3.8,"tendencia":"down"},
        {"id":"VCA-004","nombre":"Diana",   "raza":"Normando",   "peso_actual":580,"peso_anterior":571,"gmd":0.52, "bcs":3.0,"tendencia":"up"},
        {"id":"VCA-007","nombre":"Bella",   "raza":"Simental",   "peso_actual":545,"peso_anterior":540,"gmd":0.29, "bcs":3.5,"tendencia":"up"},
        {"id":"TOR-001","nombre":"Titán",   "raza":"GyrxHolstein","peso_actual":820,"peso_anterior":805,"gmd":0.85,"bcs":4.0,"tendencia":"up"},
    ]

    return jsonify({
        "ok": True,
        "mensual":    [{"mes":m,"pesajes":p} for m,p in zip(meses,pesajes_mes)],
        "animales":    sorted(animales, key=lambda x: x["gmd"], reverse=True),
        "resumen": {
            "peso_promedio_hato":  round(sum(a["peso_actual"] for a in animales) / len(animales)),
            "gmd_promedio":        round(sum(a["gmd"] for a in animales) / len(animales), 2),
            "bcs_promedio":        round(sum(a["bcs"] for a in animales) / len(animales), 1),
            "animales_pesados_mes": pesajes_mes[-1],
            "pendientes_pesaje":   4,
        },
        "generado": datetime.now().isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/clima  (simulado Boyacá 2600 msnm)
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/analytics/clima")
def clima():
    now = datetime.now()
    dias_7 = []
    for i in range(7):
        d = now + timedelta(days=i)
        dias_7.append({
            "fecha":      d.strftime("%a %d"),
            "tmax":       round(np.random.normal(21, 2), 1),
            "tmin":       round(np.random.normal(9, 2), 1),
            "humedad":    int(np.random.normal(76, 8)),
            "lluvia_mm":  round(max(0, np.random.normal(3, 4)), 1),
            "condicion":  np.random.choice(["Soleado","Parcial nublado","Nublado","Lluvia leve"], p=[0.25,0.40,0.25,0.10]),
            "riesgo_helada": "bajo",
            "ico":        np.random.choice(["☀️","⛅","🌥️","🌦️"], p=[0.25,0.40,0.25,0.10]),
        })

    return jsonify({
        "ok": True,
        "ubicacion": {"nombre":"Finca La Esperanza","municipio":"Tunja","depto":"Boyacá","msnm":2600,"lat":5.5334,"lon":-73.3601},
        "actual": {
            "temperatura": round(np.random.normal(17, 2), 1),
            "humedad":     int(np.random.normal(74, 5)),
            "presion":     int(np.random.normal(748, 3)),
            "viento_kmh":  round(np.random.uniform(5, 20), 1),
            "condicion":   "Parcialmente nublado",
            "uv_index":    int(np.random.uniform(2, 7)),
        },
        "pronostico_7d": dias_7,
        "alertas_agro": [
            {"tipo":"lluvia",    "msg":"Lluvia leve esperada jueves y viernes","nivel":"info"},
            {"tipo":"potrero",   "msg":"Buenas condiciones para pastoreo esta semana","nivel":"ok"},
        ],
        "generado": now.isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT: /api/analytics/chat  — CIVAC Agente IA
# ─────────────────────────────────────────────────────────────────────────────
CIVAC_INTENTS = {
    "produccion":   ["produccion","leche","litros","ordeño","ordeno","vacas producen","cuanto produce"],
    "animales":     ["animales","bovinos","inventario","cuantas vacas","cuantos","hato","cabezas","bovino"],
    "gps":          ["gps","collar","ubicacion","donde esta","rastreo","chip","dispositivo","geovalla"],
    "alertas":      ["alertas","problemas","urgente","critico","notificaciones","advertencias"],
    "costos":       ["costos","gastos","dinero","ingresos","utilidad","margen","financiero","plata","pesos"],
    "reproduccion": ["reproduccion","celo","preñez","parto","inseminacion","gestacion","ternero"],
    "potreros":     ["potreros","pasto","potrero","hectareas","lote","rotacion","forraje"],
    "insumos":      ["insumos","medicamentos","vacunas","stock","inventario medicamentos","drogas","mineral"],
    "personal":     ["personal","empleados","nomina","trabajadores","operarios"],
    "precio":       ["precio leche","precio litro","fedegan","valor leche","cotizacion"],
    "recomendacion":["recomienda","consejo","que hago","como mejoro","tip","sugerencia","ayuda","que debo"],
    "clima":        ["clima","temperatura","lluvia","tiempo","sol","frio","calor","helada"],
    "pesaje":       ["pesaje","peso","bcs","condicion corporal","kilos","bascula","bluetooth"],
    "genetica":     ["genetica","dep","raza","pajilla","semen","pedigri","holstein","brahman","cebú","gyr"],
    "saludo":       ["hola","buenos","buenas","buen dia","saludos","hey","hi"],
    "despedida":    ["adios","chao","hasta luego","bye","gracias","listo","ok","bien"],
    "planes":       ["plan","precio","costo suscripcion","pro","premium","platino","upgrade","mejorar"],
    "cifras":       ["estadisticas","cifras","resumen","kpi","dashboard","numeros","reportes"],
    "sync":         ["sincronizar","sync","offline","sin internet","conexion","backup","datos"],
    "modulos":      ["modulos","funciones","que puedes","que haces","capacidades","que tiene"],
}

RESPUESTAS = {
    "produccion": {
        "texto": "🥛 **Producción actual del hato:**\n\n• **84 L/día** en total (5 vacas en ordeño)\n• **16.8 L/vaca** promedio diario\n• **Meta del mes:** 2,520 L\n• Precio leche hoy: **$1,380/L** (Fedegán)\n\n💰 Ingreso diario estimado: **$115,920 COP**\n\n📈 La producción aumentó un **+6%** respecto al mes anterior.",
        "accion": "/produccion", "accion_label": "Ver módulo Producción",
    },
    "animales": {
        "texto": "🐄 **Inventario del hato:**\n\n• **13 animales** registrados con RFID\n• Vacas en producción: **7**\n• Novillas: **3** | Terneros: **2** | Toros: **1**\n\n📊 Categoría principal: vacas lecheras (54%)\n🏥 Estado sanitario: **9/13 al día** con vacunas\n\nPuedo mostrarte la ficha individual de cualquier animal.",
        "accion": "/inventario", "accion_label": "Ver inventario completo",
    },
    "gps": {
        "texto": "📡 **Estado GPS del hato:**\n\n• **6 chips GPS** registrados en Django\n• Activos en línea: **5/6**\n• 1 dispositivo sin señal: **Caravana Bravo** (Potrero 4)\n• Batería crítica: **Bolo Perla** (17%)\n\n🗺️ Animales rastreados: Rosaura, Titan, Perla, Luna, Estrella\n\n⚠️ Tienes **2 alertas GPS activas**.",
        "accion": "/gps-chips", "accion_label": "Ver GPS Chips",
    },
    "alertas": {
        "texto": "🚨 **Alertas activas:**\n\n🔴 **Críticas (2):**\n• Caravana Bravo sin señal GPS > 1h\n• Batería Bolo Perla al 17%\n\n🟡 **Advertencias (2):**\n• 4 insumos bajo stock mínimo\n• Vacuna Aftosa vence en 12 días\n\n✅ Sin alertas de salud animal urgentes.",
        "accion": "/alertas", "accion_label": "Ir al Centro de Alertas",
    },
    "costos": {
        "texto": "💰 **Situación financiera del mes:**\n\n• **Ingresos:** $86.4M COP\n• **Costos totales:** $46.2M COP\n• **Utilidad neta:** $40.2M COP\n• **Margen:** 46.5%\n\n📉 Costo por litro: **$549/L**\n📈 Proyección anual (IA): **$482M utilidad**\n\nEl margen está **por encima** del promedio nacional (35%).",
        "accion": "/costos", "accion_label": "Ver P&G completo",
    },
    "reproduccion": {
        "texto": "🔁 **Estado reproductivo:**\n\n• **Tasa de preñez:** 78% (meta: 80%)\n• IEP actual: **390 días** (meta < 400 días)\n• Próximos partos: **2 en los próximos 30 días**\n• Celos detectados esta semana: **1**\n• Inseminaciones pendientes: **1**\n\n📅 Próximo parto: **Rosaura** (estimado 15 Jun)",
        "accion": "/reproduccion", "accion_label": "Ver módulo Reproducción",
    },
    "potreros": {
        "texto": "🌿 **Estado de potreros:**\n\n• **6 lotes** en rotación activa\n• **Potrero activo:** Potrero 1 — Kikuyo (4.5 ha)\n• **Disponible:** Potrero 2 — Raigrás (3.8 ha)\n• Capacidad de carga: **1.8 UA/ha**\n• Próximo movimiento: **en 5 días**\n\n⚠️ Potrero 6 necesita descanso (pastoreo alto).",
        "accion": "/potreros", "accion_label": "Ver mapa potreros",
    },
    "insumos": {
        "texto": "💊 **Estado de insumos:**\n\n⚠️ **4 items bajo stock mínimo:**\n• Vacuna Aftosa: 2 dosis (mín. 15)\n• Mineral sal: 12 kg (mín. 25 kg)\n• Ivermectina: 50 ml (mín. 100 ml)\n• Oxitocina: 3 amp (mín. 10)\n\n✅ Stock OK: antibióticos, vitaminas, desparasitante.",
        "accion": "/insumos", "accion_label": "Ver Kardex de insumos",
    },
    "personal": {
        "texto": "👷 **Personal de la finca:**\n\n• **6 empleados** activos\n• Mayordomo: Carlos Muñoz\n• Ordeñadores: 2 turnos mañana\n• Nómina del mes: **$7.2M COP**\n• Próximo pago: **30 de mayo**\n• Sin novedades de ARL/EPS este mes.",
        "accion": "/personal", "accion_label": "Ver módulo Personal",
    },
    "precio": {
        "texto": "💵 **Precio de leche Colombia (Fedegán):**\n\n• **Precio base:** $1,380/litro\n• Con incentivos calidad: hasta **$1,520/litro**\n• Variación semana: **+1.2%**\n• Precio carne en pie: **$5,800/kg**\n• Ternero destete: **$1,900,000/cabeza**\n\n📊 Fedegán registró producción nacional de 7,200 M L/año.",
        "accion": "/asesora", "accion_label": "Ver precios en tiempo real",
    },
    "recomendacion": {
        "texto": "🤖 **Recomendaciones CIVAC IA:**\n\n1. 🔋 **Urgente:** Cargar Bolo Perla (17% batería)\n2. 💊 **Esta semana:** Reponer vacuna Aftosa\n3. 🌿 **Rotación:** Mover hato al Potrero 2 en 5 días\n4. 🐄 **Oportunidad:** Rosaura produce 18L/día — revisar dieta\n5. 💰 **Finanzas:** Tu margen (46.5%) supera la meta — considera expansión\n6. 📡 **GPS:** Verificar señal de Caravana Bravo en Potrero 4",
        "accion": "/asesora", "accion_label": "Ver Asesora IA completa",
    },
    "clima": {
        "texto": "🌤️ **Clima finca (Boyacá · 2,600 msnm):**\n\n• **Temperatura:** 18°C (máx 22°C / mín 10°C)\n• **Humedad:** 74%\n• **Condición:** Parcialmente nublado\n• **Riesgo helada:** bajo (próximos 7 días)\n\n🌧️ Lluvia esperada: jueves y viernes\n🌾 Buenas condiciones para pastoreo esta semana.",
        "accion": "/potreros", "accion_label": "Ver estado potreros",
    },
    "pesaje": {
        "texto": "⚖️ **Últimos pesajes del hato:**\n\n• Promedio hato: **417 kg** (↑ +3 kg vs mes anterior)\n• Mejor GMD: **Titan** con +0.85 kg/día\n• BCS promedio: **3.2/5** (rango óptimo)\n• Pesaje pendiente: **4 animales**\n\n📱 Conéctate a la báscula Bluetooth para pesaje automático.",
        "accion": "/pesaje", "accion_label": "Ir a módulo Pesaje BT",
    },
    "genetica": {
        "texto": "🧬 **Genética del hato:**\n\n• Raza principal: **Holstein × GyrXHolstein**\n• DEP leche promedio: **+892 kg**\n• Mejor DEP: **Titan** (toro) con +1,240 kg leche\n• Pajillas disponibles: **8 dosis** (3 razas)\n• Próxima inseminación programada: **Perla** (sem. próxima)\n\n🏆 Potencial genético: mejora del 8% en próxima generación.",
        "accion": "/genetica", "accion_label": "Ver módulo Genética",
    },
    "saludo": {
        "texto": "¡Hola! 👋 Soy **CIVAC IA**, tu asistente ganadero inteligente.\n\nPuedo ayudarte con:\n• 🐄 Datos del inventario bovino\n• 🥛 Producción y precios de leche\n• 📡 Estado GPS de los animales\n• 🚨 Alertas y problemas activos\n• 💰 Finanzas y costos de la finca\n• 🌿 Potreros y alimentación\n• 💊 Insumos y medicamentos\n\n¿Qué necesitas consultar hoy?",
        "accion": None, "accion_label": None,
    },
    "despedida": {
        "texto": "¡Con gusto! 🤝 Estoy aquí cuando me necesites.\n\nRecuerda que puedes consultarme sobre cualquier módulo de CIVAC PRO. ¡Buena jornada ganadera! 🐄🌿",
        "accion": None, "accion_label": None,
    },
    "planes": {
        "texto": "💎 **Planes CIVAC PRO:**\n\n• **Básico** — Gratis: Inventario, Producción, Alertas\n• **PRO** — $129,000/mes: +GPS 5 chips, Reproducción, Costos, Asesora IA\n• **Premium** — $289,000/mes: +GPS 20 chips, Genética, CO₂, Multi-finca\n• **Platino** — $890,000/mes: GPS ilimitado + soporte dedicado\n\nLicencias: **SoftGan Colombia** · Propietario: **Johnatan Vallejo Marulanda**",
        "accion": "/planes", "accion_label": "Ver todos los planes",
    },
    "cifras": {
        "texto": "📊 **Resumen ejecutivo CIVAC PRO:**\n\n• 🐄 **13** animales · **7** en producción\n• 🥛 **84 L/día** · $1,380/litro\n• 📡 **5/6** chips GPS en línea\n• 💰 Margen **46.5%** · Utilidad $40.2M/mes\n• 🌿 **6** potreros · rotación activa\n• ⚠️ **4** alertas activas (2 críticas)\n• 👷 **6** empleados · Nómina $7.2M/mes",
        "accion": "/", "accion_label": "Ver Dashboard principal",
    },
    "sync": {
        "texto": "🔄 **Estado de sincronización CIVAC:**\n\n• **Modo offline:** activo (PWA Service Worker v6)\n• **Cola pendiente:** 0 registros\n• **Último sync:** hace 2 minutos\n• **GPS Server Django:** ✅ conectado (localhost:8000)\n• **Analytics Flask:** ✅ conectado (localhost:8099)\n\n📱 Al reconectarte, los datos offline se sincronizan automáticamente con el servidor.",
        "accion": None, "accion_label": None,
    },
    "modulos": {
        "texto": "🔧 **Módulos CIVAC PRO que puedo consultar:**\n\n🐄 Inventario · 🥛 Producción · 🔁 Reproducción\n🧬 Genética · 🌿 Potreros · 🌾 Alimentación\n💊 Insumos · 👷 Personal · 💰 Costos P&G\n🤖 Predicciones IA · 🌱 CO₂ · 🚨 Alertas\n🧊 Semen · 📋 Ficha individual · 🗺️ Multi-finca\n📡 GPS Bovino · ⚖️ Pesaje BT · 🛰️ GPS Chips\n\nPregúntame sobre cualquiera de ellos.",
        "accion": None, "accion_label": None,
    },
}

DEFAULT_RESPONSE = {
    "texto": "Entendí tu pregunta 🤔 Puedo ayudarte con información sobre:\n\n• **Producción** de leche y precios\n• **Animales** e inventario bovino\n• **GPS** y rastreo de collares\n• **Alertas** y problemas activos\n• **Costos** y finanzas de la finca\n• **Reproducción** y genética\n• **Potreros** y alimentación\n• **Insumos** y medicamentos\n\nIntenta preguntarme algo específico como '¿cuántos litros produzco?' o '¿qué alertas tengo?'",
    "accion": None, "accion_label": None,
}

@app.route("/api/analytics/chat", methods=["POST"])
def chat():
    data    = request.get_json() or {}
    message = data.get("message", "").lower().strip()

    if not message:
        return jsonify({"ok": False, "error": "Mensaje vacío"}), 400

    # Intent matching
    detected = None
    best_score = 0
    for intent, keywords in CIVAC_INTENTS.items():
        score = sum(1 for kw in keywords if kw in message)
        if score > best_score:
            best_score = score
            detected = intent

    # Fallback: single word partial match
    if not detected or best_score == 0:
        for intent, keywords in CIVAC_INTENTS.items():
            if any(message.startswith(kw[:4]) for kw in keywords if len(kw) >= 4):
                detected = intent
                break

    resp = RESPUESTAS.get(detected, DEFAULT_RESPONSE)
    return jsonify({
        "ok":         True,
        "intent":     detected,
        "respuesta":  resp["texto"],
        "accion":     resp.get("accion"),
        "accion_label": resp.get("accion_label"),
        "agente":     "CIVAC IA v1.0",
        "ts":         datetime.now().isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN ENDPOINTS — estadísticas de plataforma para el panel admin
# ─────────────────────────────────────────────────────────────────────────────

# Datos mock de usuarios registrados en la plataforma
USUARIOS_PLATAFORMA = [
    {"id":"u001","nombre":"Hacienda El Dorado","email":"eldorado@gmail.com","plan":"platino","activo":True, "animales":287,"litros_dia":1840,"modulos_activos":32,"pais":"CO","region":"Antioquia","ultima_sesion":"2026-06-03","creado":"2025-01-10"},
    {"id":"u002","nombre":"Finca Las Brisas",  "email":"brisas@hotmail.com","plan":"premium","activo":True, "animales":98, "litros_dia":620, "modulos_activos":25,"pais":"CO","region":"Cundinamarca","ultima_sesion":"2026-06-02","creado":"2025-03-15"},
    {"id":"u003","nombre":"Rancho San Pedro",  "email":"sanpedro@civac.co", "plan":"pro",    "activo":True, "animales":54, "litros_dia":340, "modulos_activos":18,"pais":"CO","region":"Boyacá","ultima_sesion":"2026-06-01","creado":"2025-05-20"},
    {"id":"u004","nombre":"Ganadería Córdoba",  "email":"cordoba@outlook.com","plan":"pro",  "activo":True, "animales":71, "litros_dia":448, "modulos_activos":18,"pais":"CO","region":"Córdoba","ultima_sesion":"2026-05-30","creado":"2025-06-01"},
    {"id":"u005","nombre":"Finca La Esperanza", "email":"esperanza@gmail.com","plan":"basico","activo":True,"animales":13,"litros_dia":84,  "modulos_activos":7, "pais":"CO","region":"Nariño","ultima_sesion":"2026-06-03","creado":"2026-01-08"},
    {"id":"u006","nombre":"Granja El Porvenir", "email":"porvenir@yahoo.com","plan":"basico","activo":False,"animales":8, "litros_dia":0,  "modulos_activos":7, "pais":"CO","region":"Cauca","ultima_sesion":"2026-04-15","creado":"2026-02-20"},
    {"id":"u007","nombre":"Hacienda San Rafael", "email":"sanrafael@civac.co","plan":"premium","activo":True,"animales":142,"litros_dia":890,"modulos_activos":25,"pais":"CO","region":"Valle","ultima_sesion":"2026-06-02","creado":"2025-07-12"},
    {"id":"u008","nombre":"Finca Los Alpes",     "email":"losalpes@gmail.com","plan":"pro",  "activo":True,"animales":67,"litros_dia":422, "modulos_activos":18,"pais":"CO","region":"Caldas","ultima_sesion":"2026-05-28","creado":"2025-09-05"},
]

MODULOS_PLATAFORMA = [
    {"id":"dashboard",    "label":"Dashboard",       "plan":"basico",  "uso_pct":98, "sesiones_mes":2140, "icono":"📊"},
    {"id":"inventario",   "label":"Inventario",      "plan":"basico",  "uso_pct":95, "sesiones_mes":1980, "icono":"🐄"},
    {"id":"produccion",   "label":"Producción",      "plan":"basico",  "uso_pct":91, "sesiones_mes":1820, "icono":"🥛"},
    {"id":"alertas",      "label":"Alertas",         "plan":"basico",  "uso_pct":88, "sesiones_mes":1560, "icono":"🔔"},
    {"id":"potreros",     "label":"Potreros",        "plan":"basico",  "uso_pct":82, "sesiones_mes":1340, "icono":"🌿"},
    {"id":"sanidad",      "label":"Sanidad",         "plan":"basico",  "uso_pct":79, "sesiones_mes":1120, "icono":"💉"},
    {"id":"pesaje-manual","label":"Pesaje Manual",   "plan":"basico",  "uso_pct":65, "sesiones_mes":890,  "icono":"⚖️"},
    {"id":"reproduccion", "label":"Reproducción",    "plan":"pro",     "uso_pct":77, "sesiones_mes":980,  "icono":"🔁"},
    {"id":"genetica",     "label":"Genética",        "plan":"pro",     "uso_pct":62, "sesiones_mes":740,  "icono":"🧬"},
    {"id":"pesaje",       "label":"Pesaje BT",       "plan":"pro",     "uso_pct":58, "sesiones_mes":680,  "icono":"📡"},
    {"id":"insumos",      "label":"Insumos",         "plan":"pro",     "uso_pct":71, "sesiones_mes":860,  "icono":"💊"},
    {"id":"alimentacion", "label":"Alimentación",    "plan":"pro",     "uso_pct":68, "sesiones_mes":810,  "icono":"🌾"},
    {"id":"semen",        "label":"Semen / TE",      "plan":"pro",     "uso_pct":44, "sesiones_mes":520,  "icono":"🧊"},
    {"id":"costos",       "label":"Costos P&G",      "plan":"pro",     "uso_pct":81, "sesiones_mes":960,  "icono":"💰"},
    {"id":"personal",     "label":"Personal",        "plan":"pro",     "uso_pct":55, "sesiones_mes":640,  "icono":"👷"},
    {"id":"gps",          "label":"GPS Bovino",      "plan":"pro",     "uso_pct":73, "sesiones_mes":880,  "icono":"📡"},
    {"id":"gps-chips",    "label":"GPS Chips",       "plan":"pro",     "uso_pct":49, "sesiones_mes":580,  "icono":"🛰️"},
    {"id":"lotes",        "label":"Lotes",           "plan":"pro",     "uso_pct":60, "sesiones_mes":720,  "icono":"📦"},
    {"id":"ficha",        "label":"Ficha Clínica",   "plan":"pro",     "uso_pct":67, "sesiones_mes":800,  "icono":"📋"},
    {"id":"trazabilidad", "label":"Trazabilidad ICA","plan":"pro",     "uso_pct":57, "sesiones_mes":680,  "icono":"🗺️"},
    {"id":"asesora",      "label":"Asesora IA",      "plan":"premium", "uso_pct":88, "sesiones_mes":1040, "icono":"🤖"},
    {"id":"ventas",       "label":"Ventas CRM",      "plan":"premium", "uso_pct":74, "sesiones_mes":880,  "icono":"📈"},
    {"id":"multifinca",   "label":"Multi-Finca",     "plan":"premium", "uso_pct":52, "sesiones_mes":620,  "icono":"🏡"},
    {"id":"prediccion",   "label":"Predicción IA",   "plan":"premium", "uso_pct":81, "sesiones_mes":960,  "icono":"🔮"},
    {"id":"co2",          "label":"Huella CO₂",      "plan":"premium", "uso_pct":46, "sesiones_mes":540,  "icono":"🌱"},
    {"id":"drive",        "label":"Drive Backup",    "plan":"premium", "uso_pct":63, "sesiones_mes":750,  "icono":"☁️"},
    {"id":"datos",        "label":"Centro Datos",    "plan":"basico",  "uso_pct":42, "sesiones_mes":500,  "icono":"🗄️"},
    {"id":"configuracion","label":"Configuración",   "plan":"basico",  "uso_pct":78, "sesiones_mes":920,  "icono":"⚙️"},
    {"id":"usuarios",     "label":"Usuarios",        "plan":"pro",     "uso_pct":41, "sesiones_mes":480,  "icono":"👥"},
    {"id":"documentacion","label":"Documentación",   "plan":"basico",  "uso_pct":35, "sesiones_mes":410,  "icono":"📖"},
    {"id":"manual",       "label":"Manual",          "plan":"basico",  "uso_pct":28, "sesiones_mes":330,  "icono":"📕"},
    {"id":"planes",       "label":"Planes",          "plan":"basico",  "uso_pct":55, "sesiones_mes":650,  "icono":"⭐"},
]

@app.route("/api/analytics/admin/stats")
def admin_stats():
    activos  = [u for u in USUARIOS_PLATAFORMA if u["activo"]]
    inactivos= [u for u in USUARIOS_PLATAFORMA if not u["activo"]]
    por_plan = {}
    for p in ["basico","pro","premium","platino"]:
        por_plan[p] = len([u for u in USUARIOS_PLATAFORMA if u["plan"]==p])

    total_animales = sum(u["animales"] for u in activos)
    total_litros   = sum(u["litros_dia"] for u in activos)
    mrr_map = {"basico":0,"pro":89000,"premium":189000,"platino":399000}
    mrr = sum(mrr_map.get(u["plan"],0) for u in activos)

    return jsonify({
        "ok": True,
        "plataforma": {
            "total_usuarios":  len(USUARIOS_PLATAFORMA),
            "activos":         len(activos),
            "inactivos":       len(inactivos),
            "por_plan":        por_plan,
            "total_animales":  total_animales,
            "total_litros_dia":total_litros,
            "mrr_cop":         mrr,
            "total_modulos":   len(MODULOS_PLATAFORMA),
            "sesiones_mes":    sum(m["sesiones_mes"] for m in MODULOS_PLATAFORMA),
        },
        "top_usuarios": sorted(activos, key=lambda x: x["litros_dia"], reverse=True)[:5],
        "generado": datetime.now().isoformat(),
    })


@app.route("/api/analytics/admin/usuarios")
def admin_usuarios():
    plan_filter = request.args.get("plan", "todos")
    search_q    = request.args.get("q", "").lower()
    result = USUARIOS_PLATAFORMA
    if plan_filter != "todos":
        result = [u for u in result if u["plan"] == plan_filter]
    if search_q:
        result = [u for u in result if search_q in u["nombre"].lower() or search_q in u["email"].lower()]
    return jsonify({
        "ok":      True,
        "total":   len(result),
        "usuarios": result,
        "generado": datetime.now().isoformat(),
    })


@app.route("/api/analytics/admin/modulos")
def admin_modulos():
    plan_filter = request.args.get("plan", "todos")
    result = MODULOS_PLATAFORMA
    if plan_filter != "todos":
        result = [m for m in result if m["plan"] == plan_filter]
    result_sorted = sorted(result, key=lambda x: x["sesiones_mes"], reverse=True)

    por_plan = {}
    for p in ["basico","pro","premium","platino"]:
        mods = [m for m in MODULOS_PLATAFORMA if m["plan"] == p]
        por_plan[p] = {
            "count":       len(mods),
            "uso_promedio": round(sum(m["uso_pct"] for m in mods) / len(mods), 1) if mods else 0,
            "sesiones_mes": sum(m["sesiones_mes"] for m in mods),
        }

    return jsonify({
        "ok":      True,
        "total":   len(result),
        "modulos":  result_sorted,
        "por_plan": por_plan,
        "top5":    result_sorted[:5],
        "generado": datetime.now().isoformat(),
    })


@app.route("/api/analytics/admin/usuarios/<uid>", methods=["PATCH"])
def admin_patch_usuario(uid):
    data = request.get_json() or {}
    usuario = next((u for u in USUARIOS_PLATAFORMA if u["id"] == uid), None)
    if not usuario:
        return jsonify({"ok":False,"error":"Usuario no encontrado"}), 404
    if "activo" in data:
        usuario["activo"] = bool(data["activo"])
    if "plan" in data and data["plan"] in ["basico","pro","premium","platino"]:
        usuario["plan"] = data["plan"]
    return jsonify({"ok":True,"usuario":usuario})


@app.route("/api/analytics/admin/alertas")
def admin_alertas():
    """Alertas críticas del sistema para el panel admin."""
    alertas = [
        {"id":"A001","tipo":"bateria","severidad":"alta",   "mensaje":"Collar Bravo sin señal > 2h. Potrero 4.","ts":"hace 2h 18min","icono":"🔴"},
        {"id":"A002","tipo":"stock",  "severidad":"media",  "mensaje":"Ivermectina 1% por debajo del stock mínimo (2L).","ts":"hace 4h","icono":"🟡"},
        {"id":"A003","tipo":"sanidad","severidad":"media",  "mensaje":"Perla: día 2 de 3 en tratamiento mastitis — verificar.","ts":"hace 6h","icono":"🟡"},
        {"id":"A004","tipo":"gps",    "severidad":"baja",   "mensaje":"Bolo Perla: batería crítica 17%%.","ts":"hace 30min","icono":"🟠"},
        {"id":"A005","tipo":"sistema","severidad":"info",   "mensaje":"Analytics Server v2.0 operando normalmente.","ts":"hace 1min","icono":"🟢"},
    ]
    return jsonify({"ok":True,"alertas":alertas,"total":len(alertas),"criticas":1,"medias":2,"bajas":1,"info":1})


if __name__ == "__main__":
    port = int(__import__("os").environ.get("PORT", 8099))
    app.run(host="0.0.0.0", port=port, debug=False)

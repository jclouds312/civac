"""
CIVAC GPS Server — Django settings
GPS tracking microservice for GanaderIA PRO
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'civac-gps-server-dev-key-2026-ganaderia-colombia'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'tracking',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'gps_server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {'context_processors': []},
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'civac_gps.sqlite3',
    }
}

STATIC_URL = '/static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── CORS — allow Vite dev server ───────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# ── DRF ───────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_PARSER_CLASSES':   ['rest_framework.parsers.JSONParser'],
}

# ── GPS Plan limits (chips por plan) ─────────────────────────────────────
GPS_PLAN_LIMITS = {
    'basico':  0,
    'pro':     5,
    'premium': 20,
    'platino': 999,
}

GPS_PLAN_PRICES = {
    'basico':  0,
    'pro':     129_000,
    'premium': 289_000,
    'platino': 890_000,
}

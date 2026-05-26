#!/bin/bash
# CIVAC GPS Server — startup script
set -e

PYTHON=".pythonlibs/bin/python3"
MANAGE="artifacts/gps-server/manage.py"
SEED="artifacts/gps-server/seed_data.py"

# Run migrations (idempotent)
echo "[GPS] Running migrations…"
$PYTHON $MANAGE migrate --run-syncdb --no-input 2>&1

# Seed initial data
echo "[GPS] Seeding initial data…"
$PYTHON $SEED 2>&1

# Start Django dev server
echo "[GPS] Starting Django on port ${PORT:-8000}…"
exec $PYTHON $MANAGE runserver 0.0.0.0:${PORT:-8000} --noreload

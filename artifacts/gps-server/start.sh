#!/bin/bash
# CIVAC GPS Server — startup script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PYTHON="$REPO_ROOT/.pythonlibs/bin/python3"
MANAGE="$SCRIPT_DIR/manage.py"
SEED="$SCRIPT_DIR/seed_data.py"

# Run migrations (idempotent)
echo "[GPS] Running migrations…"
"$PYTHON" "$MANAGE" migrate --run-syncdb --no-input 2>&1

# Seed initial data
echo "[GPS] Seeding initial data…"
"$PYTHON" "$SEED" 2>&1

# Start Django dev server
echo "[GPS] Starting Django on port ${PORT:-8000}…"
exec "$PYTHON" "$MANAGE" runserver 0.0.0.0:${PORT:-8000} --noreload

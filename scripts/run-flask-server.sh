#!/usr/bin/env bash
set -euo pipefail

python_bin="${PYTHON_BIN:-python3}"
python_version="$("$python_bin" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
nix_site_packages="$(find /nix/store -maxdepth 5 -type d \
  -path "*/lib/python${python_version}/site-packages" -print | paste -sd: -)"

if [[ -z "$nix_site_packages" ]]; then
  echo "No se encontraron paquetes Python de Nix para Python ${python_version}." >&2
  exit 1
fi

# Replit's Nix packages live in separate store paths and are not automatically
# added to the workspace Python import path.
export PYTHONPATH="${nix_site_packages}${PYTHONPATH:+:${PYTHONPATH}}"
exec "$python_bin" artifacts/api-server/api/index.py

#!/bin/sh
set -eu

CA_DIR="/app/.certs"
CA_PATH="$CA_DIR/db-ca.pem"

if [ -n "${DB_CA_CERT_BASE64:-}" ]; then
  mkdir -p "$CA_DIR"
  printf '%s' "$DB_CA_CERT_BASE64" | base64 -d > "$CA_PATH"
  chmod 600 "$CA_PATH"
  export NODE_EXTRA_CA_CERTS="$CA_PATH"
  echo "[entrypoint] Loaded database CA certificate into NODE_EXTRA_CA_CERTS."
fi

exec "$@"

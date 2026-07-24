#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/contract/managed/contract"
DEST="$ROOT/frontend/src/generated"
PUBLIC_SRC_KEYS="$ROOT/contract/managed/keys"
PUBLIC_SRC_ZKIR="$ROOT/contract/managed/zkir"
PUBLIC_DEST="$ROOT/frontend/public"

if [[ ! -f "$SRC/index.js" || ! -f "$SRC/index.d.ts" ]]; then
  echo "Missing managed contract bindings. Run pnpm build:zk first." >&2
  exit 1
fi

mkdir -p "$DEST" "$PUBLIC_DEST/keys" "$PUBLIC_DEST/zkir"
cp "$SRC/index.js" "$DEST/index.js"
cp "$SRC/index.d.ts" "$DEST/index.d.ts"
# Compact emits a sourceMappingURL for a map that is not published; strip it for Vite/Vitest.
if grep -q 'sourceMappingURL' "$DEST/index.js"; then
  sed -i.bak '/sourceMappingURL/d' "$DEST/index.js"
  rm -f "$DEST/index.js.bak"
fi

if [[ -d "$PUBLIC_SRC_KEYS" ]]; then
  cp -f "$PUBLIC_SRC_KEYS/"*.verifier "$PUBLIC_DEST/keys/" 2>/dev/null || true
  # Hosted proving needs these keys at /keys/*.prover
  cp -f "$PUBLIC_SRC_KEYS/"*.prover "$PUBLIC_DEST/keys/" 2>/dev/null || true
fi
if [[ -d "$PUBLIC_SRC_ZKIR" ]]; then
  cp -f "$PUBLIC_SRC_ZKIR/"* "$PUBLIC_DEST/zkir/" 2>/dev/null || true
fi

echo "Synced generated bindings and public ZK assets into frontend/"
if ! compgen -G "$PUBLIC_DEST/keys/"*.prover >/dev/null; then
  echo "Warning: no *.prover keys in frontend/public/keys - hosted proving will fail." >&2
fi

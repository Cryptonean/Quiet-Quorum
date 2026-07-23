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

if [[ -d "$PUBLIC_SRC_KEYS" ]]; then
  cp -f "$PUBLIC_SRC_KEYS/"*.verifier "$PUBLIC_DEST/keys/" 2>/dev/null || true
fi
if [[ -d "$PUBLIC_SRC_ZKIR" ]]; then
  cp -f "$PUBLIC_SRC_ZKIR/"* "$PUBLIC_DEST/zkir/" 2>/dev/null || true
fi

echo "Synced generated bindings and public ZK assets into frontend/"

#!/usr/bin/env bash
set -euo pipefail

KEYS_DIR="${DAO_VOTING_KEYS_DIR:-$HOME/.midnight-expert/dao-voting-keys}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$CONTRACT_DIR/.." && pwd)"
CONTRACT_SRC="$CONTRACT_DIR/src/dao-voting.compact"
MANAGED_DIR="$CONTRACT_DIR/managed"
FRONTEND_GENERATED_DIR="$REPO_DIR/frontend/src/generated"
FRONTEND_PUBLIC_DIR="$REPO_DIR/frontend/public"

command -v compact >/dev/null 2>&1 || {
  echo "Compact CLI is required. Install/activate the Midnight Compact toolchain first." >&2
  exit 1
}

rm -rf "$KEYS_DIR"
compact compile "$CONTRACT_SRC" "$KEYS_DIR"

mkdir -p \
  "$MANAGED_DIR/keys" \
  "$MANAGED_DIR/zkir" \
  "$MANAGED_DIR/contract" \
  "$FRONTEND_GENERATED_DIR" \
  "$FRONTEND_PUBLIC_DIR/keys" \
  "$FRONTEND_PUBLIC_DIR/zkir"

cp "$KEYS_DIR/contract/index.js" "$MANAGED_DIR/contract/index.js"
cp "$KEYS_DIR/contract/index.d.ts" "$MANAGED_DIR/contract/index.d.ts"
cp -f "$KEYS_DIR/keys/"* "$MANAGED_DIR/keys/"
cp -f "$KEYS_DIR/zkir/"* "$MANAGED_DIR/zkir/"

# Frontend consumes generated bindings and serves ZK assets.
cp "$MANAGED_DIR/contract/index.js" "$FRONTEND_GENERATED_DIR/index.js"
cp "$MANAGED_DIR/contract/index.d.ts" "$FRONTEND_GENERATED_DIR/index.d.ts"
cp -f "$MANAGED_DIR/keys/"* "$FRONTEND_PUBLIC_DIR/keys/"
cp -f "$MANAGED_DIR/zkir/"* "$FRONTEND_PUBLIC_DIR/zkir/"

echo "DAO voting ZK artifacts generated in $MANAGED_DIR and synced to frontend/public"

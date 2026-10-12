#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
  if [[ -f .nvmrc ]]; then
    nvm use
  fi
fi

need="22.12.0"
have="$(node -p "process.versions.node")"

node -e "
const need = '${need}'.split('.').map(Number);
const have = process.versions.node.split('.').map(Number);
for (let i = 0; i < 3; i++) {
  if ((have[i] || 0) > (need[i] || 0)) process.exit(0);
  if ((have[i] || 0) < (need[i] || 0)) process.exit(1);
}
process.exit(0);
" || {
  echo ""
  echo "Node.js v${have} is not supported by Astro!"
  echo "This project needs Node >= ${need} (see .nvmrc)."
  echo ""
  echo "Fix:"
  echo "  cd \"${ROOT}\""
  echo "  nvm install"
  echo "  nvm use"
  echo "  npm run dev"
  echo ""
  exit 1
}

exec "$@"

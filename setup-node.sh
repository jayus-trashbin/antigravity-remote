#!/bin/bash
# Setup NODE PATH for portable Node.js

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$SCRIPT_DIR/node-v20.11.0-win-x64:$PATH"

echo "✅ Node.js v$(node --version) ready"
echo "✅ npm v$(npm --version) ready"
echo "📍 PATH updated with portable Node.js"

exec "$@"

#!/bin/bash
# Antigravity Remote - Start Script for Portable Node.js

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$SCRIPT_DIR/node-v20.11.0-win-x64:$PATH"

echo "========================================="
echo "  Antigravity Remote - Development Mode"
echo "========================================="
echo ""
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo ""

# Check if Antigravity is running
echo "⏳ Waiting for Antigravity IDE on port 9222..."
for i in {1..5}; do
  if nc -zv localhost 9222 2>/dev/null; then
    echo "✅ Antigravity found!"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "⚠️  Antigravity not found on port 9222"
    echo "   Make sure Antigravity is running with: antigravity --remote-debugging-port=9222"
  fi
  sleep 2
done

echo ""
echo "Starting dev servers..."
echo "📱 Client:  http://localhost:5173"
echo "🖥️  Server:  https://localhost:3333"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run both servers
npm run dev

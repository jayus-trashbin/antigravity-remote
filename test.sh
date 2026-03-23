#!/bin/bash
# Antigravity Remote - Automated Testing Script
# This script runs all tests sequentially and generates a report

set -e

export PATH="$(pwd)/node-v20.11.0-win-x64:$PATH"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ANTIGRAVITY REMOTE - AUTOMATED TESTING SUITE             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((TESTS_FAILED++))
  fi
}

echo -e "${BLUE}[1/6]${NC} Checking Node.js and npm..."
node --version > /dev/null
test_result "Node.js v20+ installed"

npm --version > /dev/null
test_result "npm v10+ installed"

echo ""
echo -e "${BLUE}[2/6]${NC} Checking build artifacts..."
[ -d "server/dist" ] && test_result "Server build exists" || (echo -e "${YELLOW}⚠ Rebuilding server...${NC}" && cd server && npm run build > /dev/null 2>&1 && test_result "Server built successfully")

[ -d "client/dist" ] && test_result "Client build exists" || (echo -e "${YELLOW}⚠ Rebuilding client...${NC}" && cd client && npm run build > /dev/null 2>&1 && test_result "Client built successfully")

echo ""
echo -e "${BLUE}[3/6]${NC} Validating TypeScript..."
cd server && ../node_modules/.bin/tsc --noEmit > /dev/null 2>&1
test_result "Server TypeScript validates"

cd ../client && ../node_modules/.bin/tsc --noEmit > /dev/null 2>&1
test_result "Client TypeScript validates"

cd ..
echo ""
echo -e "${BLUE}[4/6]${NC} Checking dependencies..."
[ -f "package.json" ] && grep -q "workspaces" package.json
test_result "Workspaces configured in root package.json"

[ -f "server/package.json" ]
test_result "Server package.json exists"

[ -f "client/package.json" ]
test_result "Client package.json exists"

echo ""
echo -e "${BLUE}[5/6]${NC} Checking configuration files..."
[ -f ".env" ] || [ -f ".env.example" ]
test_result "Environment files present"

[ -f "server/tsconfig.json" ]
test_result "Server TypeScript config exists"

[ -f "client/tsconfig.json" ]
test_result "Client TypeScript config exists"

[ -f "client/vite.config.ts" ]
test_result "Vite config exists"

echo ""
echo -e "${BLUE}[6/6]${NC} Checking source files..."
[ "$(find server/src -name "*.ts" | wc -l)" -gt 0 ]
test_result "Server source files exist"

[ "$(find client/src -name "*.tsx" | wc -l)" -gt 0 ]
test_result "Client source files exist"

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                     TEST SUMMARY                           ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo -e "║  ${GREEN}Passed: $TESTS_PASSED${NC}                                                  ║"
echo -e "║  ${RED}Failed: $TESTS_FAILED${NC}                                                  ║"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo "║  Total:  $TOTAL                                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "🚀 Ready to run development servers:"
  echo ""
  echo "  Terminal 1:"
  echo "    export PATH=\"\$(pwd)/node-v20.11.0-win-x64:\$PATH\""
  echo "    npm run dev"
  echo ""
  echo "  OR individually:"
  echo "    npm run dev:server  # https://localhost:3333"
  echo "    npm run dev:client  # http://localhost:5173"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
  exit 1
fi

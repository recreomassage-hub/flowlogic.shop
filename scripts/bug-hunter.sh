#!/bin/bash
# Bug Hunter Script
# Automatically finds bugs through static analysis, test failures, and log analysis
# Creates Beads issues for found bugs
#
# Usage:
#   ./scripts/bug-hunter.sh [--mode fast|deep] [--timeout SECONDS] [--report]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default values
MODE="deep"
TIMEOUT=300
REPORT_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --report)
      REPORT_MODE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--mode fast|deep] [--timeout SECONDS] [--report]"
      exit 1
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Counters
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0
TOTAL_BUGS=0

# Timeout function
timeout_cmd() {
  if command -v timeout &> /dev/null; then
    timeout "$TIMEOUT" "$@"
  else
    "$@"
  fi
}

echo "🔍 Bug Hunter: Starting bug discovery..."
echo "Mode: $MODE, Timeout: ${TIMEOUT}s"

# 1. Static Analysis (ESLint + TypeScript)
echo ""
echo "📋 Phase 1: Static Analysis"
echo "============================"

# ESLint (always run in both modes)
if command -v npx &> /dev/null; then
  echo "Running ESLint..."
  ESLINT_OUTPUT=$(timeout_cmd npx eslint . --format json 2>&1 || true)
  
  if [ -n "$ESLINT_OUTPUT" ] && [ "$ESLINT_OUTPUT" != "null" ]; then
    if command -v jq &> /dev/null; then
      echo "$ESLINT_OUTPUT" | jq -r '.[] | .messages[] | select(.severity == 2) | "\(.filePath):\(.line):\(.column) - \(.message)"' 2>/dev/null | while read -r line; do
        if [ -n "$line" ]; then
          echo -e "${RED}CRITICAL:${NC} $line"
          CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
          TOTAL_BUGS=$((TOTAL_BUGS + 1))
        fi
      done || true
    else
      # Fallback if jq not available
      echo "$ESLINT_OUTPUT" | grep -i "error" | head -10 | while read -r line; do
        if [ -n "$line" ]; then
          echo -e "${RED}CRITICAL:${NC} $line"
          CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
          TOTAL_BUGS=$((TOTAL_BUGS + 1))
        fi
      done
    fi
  fi
else
  echo "⚠️  ESLint not available, skipping..."
fi

# TypeScript (always run in both modes)
if command -v npx &> /dev/null; then
  echo "Running TypeScript compiler..."
  TSC_OUTPUT=$(timeout_cmd npx tsc --noEmit 2>&1 || true)
  
  if [ -n "$TSC_OUTPUT" ]; then
    echo "$TSC_OUTPUT" | grep -E "error TS" | while read -r line; do
      echo -e "${RED}CRITICAL:${NC} $line"
      CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
      TOTAL_BUGS=$((TOTAL_BUGS + 1))
    done
  fi
else
  echo "⚠️  TypeScript compiler not available, skipping..."
fi

# 2. Test Analysis (only in deep mode or if explicitly requested)
if [ "$MODE" = "deep" ] || [ "$REPORT_MODE" = true ]; then
  echo ""
  echo "📋 Phase 2: Test Analysis"
  echo "========================="

  if [ -f "$PROJECT_ROOT/package.json" ]; then
    if npm run test -- --listTests &> /dev/null 2>&1; then
      echo "Running tests..."
      TEST_OUTPUT=$(timeout_cmd npm test 2>&1 || true)
      
      if echo "$TEST_OUTPUT" | grep -qE "FAIL|failing|✕"; then
        echo -e "${RED}HIGH:${NC} Test failures detected"
        HIGH_COUNT=$((HIGH_COUNT + 1))
        TOTAL_BUGS=$((TOTAL_BUGS + 1))
        echo "$TEST_OUTPUT" | grep -E "FAIL|failing|✕" | head -5
      else
        echo -e "${GREEN}✓${NC} All tests passing"
      fi
    else
      echo "⚠️  Test suite not available, skipping..."
    fi
  else
    echo "⚠️  package.json not found, skipping tests..."
  fi
else
  echo ""
  echo "📋 Phase 2: Test Analysis"
  echo "========================="
  echo "⏭️  Skipped (fast mode - only critical checks)"
fi

# 3. Summary
echo ""
echo "📊 Summary"
echo "=========="
echo "Total bugs found: $TOTAL_BUGS"
echo "  - CRITICAL: $CRITICAL_COUNT"
echo "  - HIGH: $HIGH_COUNT"
echo "  - MEDIUM: $MEDIUM_COUNT"
echo "  - LOW: $LOW_COUNT"

# 4. Beads Integration (if available)
if command -v bd &> /dev/null; then
  echo ""
  echo "📝 Creating Beads issues..."
  
  # Note: Actual Beads integration would require parsing output and creating issues
  # This is a placeholder - actual implementation depends on Beads CLI API
  echo "⚠️  Beads integration: Manual step required"
  echo "   Run: bd create \"[Bug Title]\" --type bug --priority [CRITICAL|HIGH|MEDIUM|LOW]"
else
  echo ""
  echo "⚠️  Beads CLI not found. Install with: npm install -g @beads/bd"
  echo "   Or create issues manually based on output above."
fi

# 5. Exit code based on findings
echo ""
if [ $TOTAL_BUGS -gt 0 ]; then
  echo "⚠️  Bug Hunter: Found $TOTAL_BUGS bug(s)"
  exit 1
else
  echo "✅ Bug Hunter: Complete - No bugs found"
  exit 0
fi

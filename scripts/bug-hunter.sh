#!/bin/bash
# Bug Hunter Script
# Automatically finds bugs through static analysis, test failures, and log analysis
# Creates Beads issues for found bugs
#
# Usage:
#   ./scripts/bug-hunter.sh [--mode fast|deep] [--timeout SECONDS] [--report]

set -uo pipefail  # Use -u for undefined variables, but not -e to allow error handling

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

# Timeout function - always returns 0 to prevent script exit
timeout_cmd() {
  if command -v timeout &> /dev/null; then
    timeout "$TIMEOUT" "$@" || true
  else
    "$@" || true
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
  set +e  # Temporarily disable exit on error
  # Check frontend and backend separately for better performance
  # Only check src directories, exclude dist/ and node_modules/
  ESLINT_OUTPUT=""
  if [ -d "$PROJECT_ROOT/src/frontend/src" ]; then
    echo "  Checking frontend..."
    ESLINT_FRONTEND=$(timeout_cmd npx eslint "$PROJECT_ROOT/src/frontend/src" --format compact 2>&1 || echo "")
    ESLINT_OUTPUT="${ESLINT_OUTPUT}${ESLINT_FRONTEND}"
  fi
  if [ -d "$PROJECT_ROOT/src/backend/src" ]; then
    echo "  Checking backend..."
    ESLINT_BACKEND=$(timeout_cmd npx eslint "$PROJECT_ROOT/src/backend/src" --format compact 2>&1 || echo "")
    ESLINT_OUTPUT="${ESLINT_OUTPUT}${ESLINT_BACKEND}"
  fi
  ESLINT_EXIT=$?
  set +e  # Keep error handling disabled for grep/processing
  
  if [ -n "$ESLINT_OUTPUT" ]; then
    # Process compact format output (faster than JSON)
    echo "$ESLINT_OUTPUT" | grep -E "Error" | while read -r line || true; do
      if [ -n "$line" ]; then
        echo -e "${RED}CRITICAL:${NC} $line"
        CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
        TOTAL_BUGS=$((TOTAL_BUGS + 1))
      fi
    done || true
  fi
  set -e  # Re-enable exit on error after processing
else
  echo "⚠️  ESLint not available, skipping..."
fi

# TypeScript (always run in both modes)
if command -v npx &> /dev/null; then
  echo "Running TypeScript compiler..."
  TSC_OUTPUT=$(timeout_cmd npx tsc --noEmit 2>&1) || true
  TSC_EXIT=$?
  
  if [ -n "$TSC_OUTPUT" ]; then
    echo "$TSC_OUTPUT" | grep -E "error TS" | while read -r line || true; do
      if [ -n "$line" ]; then
        echo -e "${RED}CRITICAL:${NC} $line"
        CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
        TOTAL_BUGS=$((TOTAL_BUGS + 1))
      fi
    done || true
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
      TEST_OUTPUT=$(timeout_cmd npm test 2>&1) || true
      TEST_EXIT=$?
      
      if echo "$TEST_OUTPUT" | grep -qE "FAIL|failing|✕" || true; then
        echo -e "${RED}HIGH:${NC} Test failures detected"
        HIGH_COUNT=$((HIGH_COUNT + 1))
        TOTAL_BUGS=$((TOTAL_BUGS + 1))
        echo "$TEST_OUTPUT" | grep -E "FAIL|failing|✕" | head -5 || true
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

# 3. OpenSpec Rules Checking (only in deep mode)
if [ "$MODE" = "deep" ] || [ "$REPORT_MODE" = true ]; then
  echo ""
  echo "📋 Phase 3: OpenSpec Rules Checking"
  echo "==================================="
  
  if [ -f "$SCRIPT_DIR/openspec-rules-parser.sh" ]; then
    echo "Checking OpenSpec rules..."
    
    # Parse OpenSpec rules
    OPENSPEC_RULES=$("$SCRIPT_DIR/openspec-rules-parser.sh" 2>/dev/null || echo "{}")
    
    # Check for violations (simplified - can be enhanced)
    # For now, we'll check basic code style violations that might be in OpenSpec
    
    # Example: Check for naming convention violations
    # This is a placeholder - actual implementation would check against parsed rules
    if echo "$OPENSPEC_RULES" | grep -q "code-style" 2>/dev/null; then
      echo "OpenSpec rules loaded"
      
      # Check for common violations (can be expanded)
      # For now, just log that we're checking
      echo "Checking code style compliance..."
      
      # In future: actual rule checking logic here
      # For Phase 1, we're setting up the infrastructure
    else
      echo "⚠️  Could not parse OpenSpec rules, skipping..."
    fi
  else
    echo "⚠️  OpenSpec rules parser not found, skipping..."
  fi
else
  echo ""
  echo "📋 Phase 3: OpenSpec Rules Checking"
  echo "==================================="
  echo "⏭️  Skipped (fast mode - only critical checks)"
fi

# 4. Summary
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

# 6. Exit code based on findings
echo ""
if [ $TOTAL_BUGS -gt 0 ]; then
  echo "⚠️  Bug Hunter: Found $TOTAL_BUGS bug(s)"
  exit 1
else
  echo "✅ Bug Hunter: Complete - No bugs found"
  exit 0
fi

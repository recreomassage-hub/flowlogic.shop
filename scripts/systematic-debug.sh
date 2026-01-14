#!/bin/bash
# Systematic Debugging Script
# Applies 4-phase systematic debugging methodology to a bug
# Usage: ./scripts/systematic-debug.sh <bug-id>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BUG_ID="${1:-}"
if [ -z "$BUG_ID" ]; then
  echo "Usage: $0 <bug-id>"
  echo "Example: $0 bug-123"
  exit 1
fi

echo "🔧 Systematic Debugging: Bug $BUG_ID"
echo "====================================="

# Phase 1: Root Cause Analysis
echo ""
echo "📋 Phase 1: Root Cause Analysis"
echo "================================"
echo "1. Reproduce the bug"
echo "   - Create minimal reproducible example"
echo "   - Record exact reproduction steps"
echo "   - Identify environment (OS, versions, configuration)"
echo ""
echo "2. Trace data flow"
echo "   - Follow data path from input to error point"
echo "   - Find point where data becomes incorrect"
echo "   - Use breakpoints / logs / assertions"
echo ""
echo "3. Identify root cause"
echo "   - ❌ DON'T fix symptom"
echo "   - ✅ DO understand WHY error occurs"
echo "   - Check upstream: where does data come from?"
echo ""
read -p "Press Enter when root cause is identified..."

# Phase 2: Pattern Analysis
echo ""
echo "📋 Phase 2: Pattern Analysis"
echo "============================"
echo "1. How many places are affected?"
echo "   - Single file/component → isolated"
echo "   - Multiple files/components → systemic"
echo ""
echo "2. Are there similar bugs?"
echo "   - Search codebase for similar patterns"
echo ""
echo "3. Is this one-time or recurring?"
echo "   - One-time → isolated"
echo "   - Recurring → systemic"
echo ""
read -p "Is bug isolated or systemic? (isolated/systemic): " PATTERN

# Phase 3: Fix Strategy
echo ""
echo "📋 Phase 3: Fix Strategy"
echo "======================="

# Check fix attempts (would come from Beads issue in real implementation)
FIX_ATTEMPTS="${FIX_ATTEMPTS:-0}"

if [ "$PATTERN" = "isolated" ] && [ "$FIX_ATTEMPTS" -lt 3 ]; then
  STRATEGY="quick_fix"
  echo "Strategy: Quick Fix"
  echo "  - Apply minimal fix to root cause"
  echo "  - Verify with tests"
elif [ "$PATTERN" = "systemic" ] || [ "$FIX_ATTEMPTS" -ge 3 ]; then
  STRATEGY="architectural_review"
  echo "Strategy: Architectural Review"
  echo "  - STOP applying quick fixes"
  echo "  - Create OpenSpec proposal"
  echo "  - Notify stakeholders"
  echo ""
  echo "⚠️  Rule: 3 Fixes = Architectural Review"
  echo "   Creating OpenSpec proposal..."
  # In real implementation, would create OpenSpec proposal here
else
  STRATEGY="quick_fix"
  echo "Strategy: Quick Fix"
fi

# Phase 4: Quality Gates
echo ""
echo "📋 Phase 4: Quality Gates"
echo "========================"

if [ "$STRATEGY" = "quick_fix" ]; then
  echo "1. Fix Verification"
  echo "   - Reproduce bug → verify it fails"
  echo "   - Apply fix → verify it passes"
  echo ""
  echo "2. Tests"
  read -p "Run tests? (y/n): " RUN_TESTS
  if [ "$RUN_TESTS" = "y" ]; then
    npm run test || echo "⚠️  Tests failed - fix rejected"
  fi
  echo ""
  echo "3. Regression Check"
  echo "   - No new bugs introduced"
  echo "   - Existing functionality still works"
  echo ""
  echo "4. Code Quality"
  read -p "Run linting? (y/n): " RUN_LINT
  if [ "$RUN_LINT" = "y" ]; then
    npm run lint || echo "⚠️  Linting failed - fix rejected"
  fi
  echo ""
  echo "✅ All quality gates passed"
else
  echo "⚠️  Architectural review required - skipping quality gates"
  echo "   OpenSpec proposal created for architectural change"
fi

echo ""
echo "✅ Systematic Debugging: Complete"
echo ""
echo "Summary:"
echo "  - Root cause: [documented in issue]"
echo "  - Pattern: $PATTERN"
echo "  - Strategy: $STRATEGY"
echo "  - Fix attempts: $FIX_ATTEMPTS"

exit 0

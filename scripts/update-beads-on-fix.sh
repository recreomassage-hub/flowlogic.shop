#!/bin/bash
# Script to update Beads issue when a bug is fixed
# Usage: ./scripts/update-beads-on-fix.sh <issue-id> <fix-description>

set -euo pipefail

ISSUE_ID="${1:-}"
FIX_DESCRIPTION="${2:-Bug fixed using systematic-debugging methodology}"

if [ -z "$ISSUE_ID" ]; then
  echo "❌ ERROR: Issue ID required"
  echo "Usage: $0 <issue-id> [fix-description]"
  exit 1
fi

# Check if Beads CLI is available
if ! command -v bd &> /dev/null; then
  echo "⚠️  WARNING: Beads CLI not found"
  echo "   Install: ./scripts/install-beads.sh"
  echo "   Skipping Beads update..."
  exit 0
fi

echo "📝 Updating Beads issue: $ISSUE_ID"
echo ""

# Get current fix attempts (if tracking is implemented)
FIX_ATTEMPTS=$(bd show "$ISSUE_ID" --json 2>/dev/null | jq -r '.fix_attempts // 0' || echo "0")

# Update issue with fix information and solution_status
COMMENT="✅ Fixed: $FIX_DESCRIPTION (Attempt: $((FIX_ATTEMPTS + 1)))"
COMMENT+="\n\nSolution Status: fixed"

if bd update "$ISSUE_ID" --comment "$COMMENT" 2>/dev/null; then
  echo "✅ Beads issue updated successfully"
  
  # Try to update solution_status field (if Beads CLI supports it)
  # For now, we'll add it as a note in the comment
  # In future, this could be a direct field update if Beads supports it
else
  echo "⚠️  Failed to update Beads issue (non-critical)"
  echo "   Issue ID: $ISSUE_ID"
  echo "   Fix description: $FIX_DESCRIPTION"
fi

# Try to close the issue if fix is complete
if bd close "$ISSUE_ID" --reason "Fixed" 2>/dev/null; then
  echo "✅ Beads issue closed"
else
  echo "⚠️  Failed to close Beads issue (may require manual closure)"
fi

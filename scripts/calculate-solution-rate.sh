#!/bin/bash
# Calculate Solution Rate Metric
# Reads all Beads issues with type "bug" and calculates solution_rate = fixed / total_reported
#
# Usage:
#   ./scripts/calculate-solution-rate.sh [--output-format json|markdown]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default values
OUTPUT_FORMAT="markdown"
BEADS_ISSUES_FILE="${PROJECT_ROOT}/.beads/issues.jsonl"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --output-format)
      OUTPUT_FORMAT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--output-format json|markdown]"
      exit 1
      ;;
  esac
done

# Check if Beads issues file exists
if [ ! -f "$BEADS_ISSUES_FILE" ]; then
  echo "❌ ERROR: Beads issues file not found: $BEADS_ISSUES_FILE"
  exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "❌ ERROR: jq is required but not installed"
  echo "   Install: sudo apt-get install jq (Linux) or brew install jq (macOS)"
  exit 1
fi

# Initialize counters
TOTAL_REPORTED=0
TOTAL_FIXED=0
TOTAL_INVALID=0
TOTAL_WONT_FIX=0
TOTAL_PENDING=0

# Process each line in issues.jsonl
while IFS= read -r line || [ -n "$line" ]; do
  if [ -z "$line" ]; then
    continue
  fi
  
  # Parse JSON line
  issue_type=$(echo "$line" | jq -r '.issue_type // "unknown"' 2>/dev/null || echo "unknown")
  status=$(echo "$line" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
  solution_status=$(echo "$line" | jq -r '.solution_status // "pending"' 2>/dev/null || echo "pending")
  
  # Only count bug issues
  if [ "$issue_type" = "bug" ]; then
    TOTAL_REPORTED=$((TOTAL_REPORTED + 1))
    
    case "$solution_status" in
      "fixed")
        TOTAL_FIXED=$((TOTAL_FIXED + 1))
        ;;
      "invalid")
        TOTAL_INVALID=$((TOTAL_INVALID + 1))
        ;;
      "wont_fix")
        TOTAL_WONT_FIX=$((TOTAL_WONT_FIX + 1))
        ;;
      "pending"|*)
        TOTAL_PENDING=$((TOTAL_PENDING + 1))
        ;;
    esac
  fi
done < "$BEADS_ISSUES_FILE"

# Calculate metrics
if [ $TOTAL_REPORTED -eq 0 ]; then
  SOLUTION_RATE=0
  FALSE_POSITIVE_RATE=0
else
  SOLUTION_RATE=$(echo "scale=2; $TOTAL_FIXED * 100 / $TOTAL_REPORTED" | bc 2>/dev/null || echo "0")
  FALSE_POSITIVE_RATE=$(echo "scale=2; $TOTAL_INVALID * 100 / $TOTAL_REPORTED" | bc 2>/dev/null || echo "0")
fi

# Output based on format
if [ "$OUTPUT_FORMAT" = "json" ]; then
  cat <<EOF
{
  "total_reported": $TOTAL_REPORTED,
  "total_fixed": $TOTAL_FIXED,
  "total_invalid": $TOTAL_INVALID,
  "total_wont_fix": $TOTAL_WONT_FIX,
  "total_pending": $TOTAL_PENDING,
  "solution_rate": $SOLUTION_RATE,
  "false_positive_rate": $FALSE_POSITIVE_RATE,
  "calculated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
else
  # Markdown format
  cat <<EOF
# Solution Rate Metrics

**Calculated at:** $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Summary

| Metric | Value | Target |
|--------|-------|--------|
| **Total Reported** | $TOTAL_REPORTED | - |
| **Total Fixed** | $TOTAL_FIXED | - |
| **Total Invalid** (False Positives) | $TOTAL_INVALID | < 20% |
| **Total Won't Fix** | $TOTAL_WONT_FIX | - |
| **Total Pending** | $TOTAL_PENDING | - |
| **Solution Rate** | ${SOLUTION_RATE}% | ≥ 70% |
| **False Positive Rate** | ${FALSE_POSITIVE_RATE}% | < 20% |

## Status

EOF

  # Status indicators
  if (( $(echo "$SOLUTION_RATE >= 70" | bc -l 2>/dev/null || echo "0") )); then
    echo "✅ **Solution Rate:** ${SOLUTION_RATE}% (Target met)"
  elif (( $(echo "$SOLUTION_RATE >= 60" | bc -l 2>/dev/null || echo "0") )); then
    echo "⚠️  **Solution Rate:** ${SOLUTION_RATE}% (Below target, but acceptable)"
  else
    echo "❌ **Solution Rate:** ${SOLUTION_RATE}% (Below target - action required)"
  fi
  
  if (( $(echo "$FALSE_POSITIVE_RATE < 20" | bc -l 2>/dev/null || echo "0") )); then
    echo "✅ **False Positive Rate:** ${FALSE_POSITIVE_RATE}% (Target met)"
  else
    echo "⚠️  **False Positive Rate:** ${FALSE_POSITIVE_RATE}% (Above target - calibration needed)"
  fi
fi

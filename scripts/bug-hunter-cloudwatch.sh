#!/bin/bash
# Bug Hunter CloudWatch Integration
# Analyzes CloudWatch logs for production errors
# MVP: Alert-only (no auto-fix)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
LOG_GROUP="${LOG_GROUP:-/aws/lambda/flowlogic-api}"
LOOKBACK_HOURS="${LOOKBACK_HOURS:-1}"
START_TIME=$(date -d "$LOOKBACK_HOURS hour ago" +%s)000

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🔍 Bug Hunter CloudWatch: Analyzing production logs..."
echo "Region: $AWS_REGION"
echo "Log Group: $LOG_GROUP"
echo "Lookback: $LOOKBACK_HOURS hour(s)"
echo ""

# Check AWS CLI availability
if ! command -v aws &> /dev/null; then
  echo "⚠️  AWS CLI not found. Skipping CloudWatch analysis."
  exit 0
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "⚠️  AWS credentials not configured. Skipping CloudWatch analysis."
  exit 0
fi

# Check if log group exists
if ! aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --region "$AWS_REGION" &> /dev/null; then
  echo "⚠️  Log group not found: $LOG_GROUP"
  echo "   Skipping CloudWatch analysis."
  exit 0
fi

CRITICAL_ERRORS=0
HIGH_ERRORS=0

# Pattern 1: Critical Errors (TypeError, ReferenceError, SyntaxError)
echo "📋 Checking for critical errors..."
CRITICAL_PATTERN="TypeError|ReferenceError|SyntaxError|Cannot read property|Cannot access"
CRITICAL_EVENTS=$(aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --start-time "$START_TIME" \
  --filter-pattern "$CRITICAL_PATTERN" \
  --region "$AWS_REGION" \
  --query 'events[*].message' \
  --output text 2>/dev/null || echo "")

if [ -n "$CRITICAL_EVENTS" ] && [ "$CRITICAL_EVENTS" != "None" ]; then
  echo -e "${RED}🔴 CRITICAL: Production errors detected${NC}"
  echo "$CRITICAL_EVENTS" | head -10 | while read -r line; do
    if [ -n "$line" ] && [ "$line" != "None" ]; then
      echo -e "${RED}  - $line${NC}"
      CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
    fi
  done
else
  echo -e "${GREEN}✓${NC} No critical errors found"
fi

# Pattern 2: High Priority Errors (500, Internal Server Error)
echo ""
echo "📋 Checking for high priority errors..."
HIGH_PATTERN="500|Internal Server Error|Unhandled|Exception"
HIGH_EVENTS=$(aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --start-time "$START_TIME" \
  --filter-pattern "$HIGH_PATTERN" \
  --region "$AWS_REGION" \
  --query 'events[*].message' \
  --output text 2>/dev/null || echo "")

if [ -n "$HIGH_EVENTS" ] && [ "$HIGH_EVENTS" != "None" ]; then
  echo -e "${YELLOW}🟠 HIGH: Production errors detected${NC}"
  echo "$HIGH_EVENTS" | head -10 | while read -r line; do
    if [ -n "$line" ] && [ "$line" != "None" ]; then
      echo -e "${YELLOW}  - $line${NC}"
      HIGH_ERRORS=$((HIGH_ERRORS + 1))
    fi
  done
else
  echo -e "${GREEN}✓${NC} No high priority errors found"
fi

# Summary
echo ""
echo "📊 CloudWatch Analysis Summary"
echo "=============================="
echo "Critical errors: $CRITICAL_ERRORS"
echo "High priority errors: $HIGH_ERRORS"
echo ""

# Recommendations
if [ $CRITICAL_ERRORS -gt 0 ] || [ $HIGH_ERRORS -gt 0 ]; then
  echo "⚠️  Action Required:"
  echo "   1. Review CloudWatch logs: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:log-groups/log-group/$LOG_GROUP"
  echo "   2. Create Beads issues for new error patterns"
  echo "   3. Investigate root cause using systematic-debugging methodology"
  echo ""
  echo "   Example Beads issue creation:"
  echo "   bd create \"Production error: [error type]\" --type bug --priority CRITICAL"
  exit 1
else
  echo "✅ No production errors detected in last $LOOKBACK_HOURS hour(s)"
  exit 0
fi

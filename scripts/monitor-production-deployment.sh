#!/bin/bash
# Script to monitor first production deployment after early secrets loading implementation
# Usage: ./scripts/monitor-production-deployment.sh [deployment-number]

set -euo pipefail

DEPLOYMENT_NUM="${1:-1}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "📊 Monitoring Production Deployment #$DEPLOYMENT_NUM"
echo "   After early secrets loading pattern implementation"
echo ""

# Check CloudWatch metrics
echo "🔍 Checking CloudWatch Metrics (last 24 hours)..."
echo ""

# SSM Fallback Usage (should be 0)
echo "1. SSM Fallback Usage (should be 0):"
FALLBACK_USAGE=$(aws cloudwatch get-metric-statistics \
  --namespace FlowLogic/Workflows \
  --metric-name SSMFallbackUsage \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region "$AWS_REGION" \
  --query 'Datapoints[*].Sum' \
  --output text 2>/dev/null || echo "0")

if [ -z "$FALLBACK_USAGE" ] || [ "$FALLBACK_USAGE" = "None" ]; then
  FALLBACK_USAGE="0"
fi

TOTAL_FALLBACK=$(echo "$FALLBACK_USAGE" | awk '{sum+=$1} END {print sum+0}')
if [ "$TOTAL_FALLBACK" -eq 0 ]; then
  echo "   ✅ No fallback usage detected (expected)"
else
  echo "   ⚠️  WARNING: Fallback used $TOTAL_FALLBACK times"
  echo "   This indicates OIDC may have failed"
fi
echo ""

# Workflow Duration
echo "2. Workflow Duration (should be < 3600 seconds):"
MAX_DURATION=$(aws cloudwatch get-metric-statistics \
  --namespace FlowLogic/Workflows \
  --metric-name WorkflowDuration \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Maximum \
  --region "$AWS_REGION" \
  --query 'Datapoints[*].Maximum' \
  --output text 2>/dev/null | awk '{max=$1>max?$1:max} END {print max+0}' || echo "0")

if [ "$MAX_DURATION" -gt 3600 ]; then
  echo "   ⚠️  WARNING: Max workflow duration = ${MAX_DURATION}s (> 1 hour)"
  echo "   OIDC token may expire for workflows > 1 hour"
else
  echo "   ✅ Max workflow duration = ${MAX_DURATION}s (< 1 hour)"
fi
echo ""

# OIDC Token Expiry Events
echo "3. OIDC Token Expiry Events (should be 0):"
EXPIRY_EVENTS=$(aws cloudwatch get-metric-statistics \
  --namespace FlowLogic/Workflows \
  --metric-name OIDCTokenExpiryEvents \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum \
  --region "$AWS_REGION" \
  --query 'Datapoints[*].Sum' \
  --output text 2>/dev/null || echo "0")

if [ -z "$EXPIRY_EVENTS" ] || [ "$EXPIRY_EVENTS" = "None" ]; then
  EXPIRY_EVENTS="0"
fi

TOTAL_EXPIRY=$(echo "$EXPIRY_EVENTS" | awk '{sum+=$1} END {print sum+0}')
if [ "$TOTAL_EXPIRY" -eq 0 ]; then
  echo "   ✅ No token expiry events detected (expected)"
else
  echo "   ❌ ERROR: Token expiry events detected: $TOTAL_EXPIRY"
  echo "   This indicates the robust solution may need adjustment"
fi
echo ""

# Check CloudWatch Alarms
echo "4. CloudWatch Alarms Status:"
ALARM_STATUS=$(aws cloudwatch describe-alarms \
  --alarm-name-prefix flowlogic \
  --region "$AWS_REGION" \
  --query 'MetricAlarms[*].[AlarmName,StateValue]' \
  --output text 2>/dev/null || echo "")

if [ -n "$ALARM_STATUS" ]; then
  echo "$ALARM_STATUS" | while read -r ALARM_NAME STATE; do
    if [ "$STATE" = "ALARM" ]; then
      echo "   ❌ $ALARM_NAME: $STATE"
    elif [ "$STATE" = "INSUFFICIENT_DATA" ]; then
      echo "   ⚠️  $ALARM_NAME: $STATE (waiting for data)"
    else
      echo "   ✅ $ALARM_NAME: $STATE"
    fi
  done
else
  echo "   ⚠️  No alarms found"
fi
echo ""

# Summary
echo "📋 Summary:"
if [ "$TOTAL_FALLBACK" -eq 0 ] && [ "$TOTAL_EXPIRY" -eq 0 ] && [ "$MAX_DURATION" -lt 3600 ]; then
  echo "   ✅ All metrics healthy"
  echo "   ✅ Early secrets loading pattern working correctly"
  echo "   ✅ No issues detected"
else
  echo "   ⚠️  Some issues detected:"
  [ "$TOTAL_FALLBACK" -gt 0 ] && echo "      - Fallback usage: $TOTAL_FALLBACK"
  [ "$TOTAL_EXPIRY" -gt 0 ] && echo "      - Token expiry events: $TOTAL_EXPIRY"
  [ "$MAX_DURATION" -ge 3600 ] && echo "      - Workflow duration > 1 hour: ${MAX_DURATION}s"
  echo ""
  echo "   💡 Recommendations:"
  echo "      - Review workflow logs"
  echo "      - Check OIDC configuration"
  echo "      - Verify IAM permissions"
fi

echo ""
echo "📊 View detailed metrics in CloudWatch Dashboard:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=flowlogic-oidc-token-monitoring"

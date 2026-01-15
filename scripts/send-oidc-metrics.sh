#!/bin/bash
# Script to send OIDC token expiry metrics to CloudWatch
# Usage: ./scripts/send-oidc-metrics.sh <metric-name> <value> [unit]
#
# Metrics:
#   - SSMFallbackUsage: Count of SSM fallback usage (Count)
#   - WorkflowDuration: Workflow duration in seconds (Seconds)
#   - OIDCTokenExpiryEvents: Count of token expiry events (Count)

set -euo pipefail

METRIC_NAME="${1:-}"
METRIC_VALUE="${2:-}"
METRIC_UNIT="${3:-Count}"

if [ -z "$METRIC_NAME" ] || [ -z "$METRIC_VALUE" ]; then
  echo "❌ ERROR: Metric name and value required"
  echo "Usage: $0 <metric-name> <value> [unit]"
  echo ""
  echo "Examples:"
  echo "  $0 SSMFallbackUsage 1 Count"
  echo "  $0 WorkflowDuration 3600 Seconds"
  echo "  $0 OIDCTokenExpiryEvents 1 Count"
  exit 1
fi

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
  echo "⚠️  WARNING: AWS CLI not found, skipping metric send"
  exit 0
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "⚠️  WARNING: AWS credentials not configured, skipping metric send"
  exit 0
fi

AWS_REGION="${AWS_REGION:-us-east-1}"
NAMESPACE="FlowLogic/Workflows"

# Get workflow context from GitHub Actions (if available)
WORKFLOW_RUN_ID="${GITHUB_RUN_ID:-manual-$(date +%s)}"
WORKFLOW_NAME="${GITHUB_WORKFLOW:-unknown}"

# Send metric to CloudWatch
aws cloudwatch put-metric-data \
  --namespace "$NAMESPACE" \
  --metric-name "$METRIC_NAME" \
  --value "$METRIC_VALUE" \
  --unit "$METRIC_UNIT" \
  --region "$AWS_REGION" \
  --dimensions WorkflowRunId="$WORKFLOW_RUN_ID",WorkflowName="$WORKFLOW_NAME" \
  > /dev/null 2>&1 || {
    echo "⚠️  WARNING: Failed to send metric to CloudWatch (non-critical)"
    exit 0
  }

echo "✅ Metric sent: $METRIC_NAME = $METRIC_VALUE $METRIC_UNIT"

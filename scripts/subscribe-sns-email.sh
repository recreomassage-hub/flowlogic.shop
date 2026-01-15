#!/bin/bash
# Script to subscribe email to SNS topic for OIDC token expiry alerts
# Usage: ./scripts/subscribe-sns-email.sh <email-address>

set -euo pipefail

EMAIL="${1:-}"

if [ -z "$EMAIL" ]; then
  echo "❌ ERROR: Email address required"
  echo "Usage: $0 <email-address>"
  exit 1
fi

# Validate email format (basic)
if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "❌ ERROR: Invalid email format"
  exit 1
fi

AWS_REGION="${AWS_REGION:-us-east-1}"

# Get SNS Topic ARN
TOPIC_ARN=$(aws sns list-topics --region "$AWS_REGION" \
  --query 'Topics[?contains(TopicArn, `oidc-token-expiry`)].TopicArn' \
  --output text 2>/dev/null || echo "")

if [ -z "$TOPIC_ARN" ]; then
  echo "❌ ERROR: SNS Topic not found"
  echo "   Make sure CloudWatch stack is deployed:"
  echo "   aws cloudformation deploy --template-file infra/cloudwatch/oidc-token-monitoring.yml --stack-name flowlogic-oidc-monitoring"
  exit 1
fi

echo "📧 Subscribing $EMAIL to SNS Topic: $TOPIC_ARN"
echo ""

# Subscribe email to SNS topic
SUBSCRIPTION_ARN=$(aws sns subscribe \
  --topic-arn "$TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$EMAIL" \
  --region "$AWS_REGION" \
  --query 'SubscriptionArn' \
  --output text 2>&1)

if [ $? -eq 0 ]; then
  echo "✅ Subscription created successfully"
  echo "   Subscription ARN: $SUBSCRIPTION_ARN"
  echo ""
  echo "📧 Please check your email ($EMAIL) and confirm the subscription"
  echo "   You will receive a confirmation email from AWS SNS"
else
  echo "❌ Failed to create subscription"
  exit 1
fi

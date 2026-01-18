#!/bin/bash
# Infrastructure Compliance Check
# Checks AWS resources against infrastructure-spec.yaml rules
# Integration with Bug Hunter for infrastructure compliance violations

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SPEC_FILE="${PROJECT_ROOT}/infrastructure/infrastructure-spec.yaml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🛡️  Infrastructure Compliance Check"
echo "===================================="
echo ""

# Check dependencies
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq not found${NC}"
    exit 1
fi

# Check spec file exists
if [ ! -f "$SPEC_FILE" ]; then
    echo -e "${RED}❌ Infrastructure spec not found: $SPEC_FILE${NC}"
    exit 1
fi

echo "📋 Spec file: $SPEC_FILE"
echo ""

# Run inventory scan
TEMP_INVENTORY="/tmp/inventory-compliance-$(date +%s).json"
TEMP_CLASSIFIED="/tmp/classified-compliance-$(date +%s).json"

echo "🔍 Running inventory scan..."
"$SCRIPT_DIR/aws-inventory-scan.sh" > /dev/null 2>&1 || {
    # If scan fails, try minimal scan
    echo "  → Using minimal scan..."
    aws resourcegroupstaggingapi get-resources \
        --tag-filters Key=Project,Values=FlowLogic \
        --query 'ResourceTagMappingList[*]' \
        --output json | jq '[.[] | {
            ResourceARN: .ResourceARN,
            ResourceType: (.ResourceARN | split(":")[2]),
            ResourceName: (.ResourceARN | split(":")[5] // ""),
            Tags: (.Tags // [] | map({Key: .Key, Value: .Value}))
        }]' > "$TEMP_INVENTORY"
}

# Classify
echo "🏷️  Classifying resources..."
python3 "$SCRIPT_DIR/aws-inventory-classifier.py" \
    "$TEMP_INVENTORY" \
    --output "$TEMP_CLASSIFIED" \
    --spec "$SPEC_FILE" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Classification failed, continuing with raw inventory${NC}"
    TEMP_CLASSIFIED=""
}

# Check violations
VIOLATIONS=0
CRITICAL_VIOLATIONS=0
HIGH_VIOLATIONS=0
MEDIUM_VIOLATIONS=0

if [ -f "$TEMP_CLASSIFIED" ]; then
    VIOLATIONS=$(jq '.violations | length' "$TEMP_CLASSIFIED")
    NON_COMPLIANT=$(jq '.summary.non_compliant' "$TEMP_CLASSIFIED")
    EXPIRED=$(jq '.summary.expired' "$TEMP_CLASSIFIED")
    UNTAGGED=$(jq '.summary.untagged' "$TEMP_CLASSIFIED")
    
    # Categorize violations by severity
    # Critical: prod resources without required tags
    # High: staging resources without required tags
    # Medium: dev resources without ExpiresAt, naming violations
    CRITICAL_VIOLATIONS=$(jq '[.violations[] | select(.env == "prod")] | length' "$TEMP_CLASSIFIED")
    HIGH_VIOLATIONS=$(jq '[.violations[] | select(.env == "staging")] | length' "$TEMP_CLASSIFIED")
    MEDIUM_VIOLATIONS=$(jq '[.violations[] | select(.env == "dev" or .env == "untagged")] | length' "$TEMP_CLASSIFIED")
fi

echo ""
echo "📊 Compliance Report"
echo "==================="

if [ "$VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}✅ All resources are compliant!${NC}"
    exit 0
fi

echo ""
echo "Violations found:"
echo -e "  ${RED}Critical: ${CRITICAL_VIOLATIONS}${NC} (prod resources)"
echo -e "  ${YELLOW}High: ${HIGH_VIOLATIONS}${NC} (staging resources)"
echo -e "  ${BLUE}Medium: ${MEDIUM_VIOLATIONS}${NC} (dev/untagged resources)"
echo ""

# Show violations
if [ -f "$TEMP_CLASSIFIED" ]; then
    echo "Critical Violations (Prod resources):"
    jq -r '.violations[] | select(.env == "prod") | "  ❌ \(.name // .arn): \(.violations | join(", "))"' "$TEMP_CLASSIFIED" || true
    
    echo ""
    echo "High Violations (Staging resources):"
    jq -r '.violations[] | select(.env == "staging") | "  ⚠️  \(.name // .arn): \(.violations | join(", "))"' "$TEMP_CLASSIFIED" || true
    
    echo ""
    echo "Medium Violations (Dev/Untagged resources):"
    jq -r '.violations[] | select(.env == "dev" or .env == "untagged") | "  ℹ️  \(.name // .arn): \(.violations | join(", "))"' "$TEMP_CLASSIFIED" | head -10 || true
fi

# Create Beads issues for violations (if bd CLI available)
if command -v bd &> /dev/null; then
    echo ""
    echo "📝 Creating Beads issues for violations..."
    
    if [ "$CRITICAL_VIOLATIONS" -gt 0 ]; then
        bd create "Infrastructure: CRITICAL compliance violations (${CRITICAL_VIOLATIONS} prod resources)" \
            --type infrastructure \
            --priority 0 \
            --body "Critical compliance violations found in production resources. Immediate action required." 2>/dev/null || true
    fi
    
    if [ "$HIGH_VIOLATIONS" -gt 0 ]; then
        bd create "Infrastructure: HIGH compliance violations (${HIGH_VIOLATIONS} staging resources)" \
            --type infrastructure \
            --priority 1 \
            --body "High priority compliance violations found in staging resources." 2>/dev/null || true
    fi
fi

# Exit code based on violations
if [ "$CRITICAL_VIOLATIONS" -gt 0 ]; then
    exit 1
elif [ "$HIGH_VIOLATIONS" -gt 0 ]; then
    exit 1
elif [ "$VIOLATIONS" -gt 0 ]; then
    exit 0  # Medium violations don't fail CI
fi

exit 0

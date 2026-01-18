#!/bin/bash
# AWS Inventory Scan
# Scans all AWS resources and generates inventory JSON for classification

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="${PROJECT_ROOT}/infrastructure/inventory"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
INVENTORY_FILE="${OUTPUT_DIR}/inventory-${TIMESTAMP}.json"
CLASSIFIED_FILE="${OUTPUT_DIR}/classified-${TIMESTAMP}.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 AWS Inventory Scan"
echo "===================="
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    exit 1
fi

# Check Python3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found${NC}"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📋 Scanning AWS resources..."
echo ""

# Get all resources with tags using Resource Groups Tagging API
# This is more efficient than scanning each service individually
RESOURCES=()

echo "  → Querying Resource Groups Tagging API..."

# Get resources by tag filter (Project: FlowLogic)
# If no tags, get all resources (will be classified as untagged)
if aws resourcegroupstaggingapi get-resources \
    --tag-filters Key=Project,Values=FlowLogic \
    --query 'ResourceTagMappingList[*]' \
    --output json > /tmp/flowlogic-resources.json 2>/dev/null; then
    
    FLOWLOGIC_COUNT=$(jq 'length' /tmp/flowlogic-resources.json)
    echo "  ✓ Found $FLOWLOGIC_COUNT resources with Project=FlowLogic tag"
    
    # Transform to common format
    RESOURCES=$(jq -c '[.[] | {
        ResourceARN: .ResourceARN,
        ResourceType: (.ResourceARN | split(":")[2]),
        ResourceName: (.ResourceARN | split(":")[5] // ""),
        Tags: (.Tags // [] | map({Key: .Key, Value: .Value}))
    }]' /tmp/flowlogic-resources.json)
else
    echo -e "  ${YELLOW}⚠️  No resources found with Project=FlowLogic tag${NC}"
    RESOURCES='[]'
fi

# Also scan for untagged resources (optional, can be expensive)
if [ "${SCAN_UNTAGGED:-false}" = "true" ]; then
    echo "  → Scanning for untagged resources..."
    # This would require service-specific scanning
    # For now, we'll focus on tagged resources
fi

# Save raw inventory
echo "$RESOURCES" | jq '.' > "$INVENTORY_FILE"
INVENTORY_COUNT=$(jq 'length' "$INVENTORY_FILE")

echo ""
echo "✓ Inventory saved: $INVENTORY_FILE ($INVENTORY_COUNT resources)"

# Classify inventory
echo ""
echo "🏷️  Classifying resources..."
python3 "$SCRIPT_DIR/aws-inventory-classifier.py" \
    "$INVENTORY_FILE" \
    --output "$CLASSIFIED_FILE" \
    --spec "${PROJECT_ROOT}/infrastructure/infrastructure-spec.yaml"

if [ -f "$CLASSIFIED_FILE" ]; then
    echo ""
    echo "✓ Classification complete: $CLASSIFIED_FILE"
    
    # Show summary
    echo ""
    echo "📊 Classification Summary"
    echo "========================"
    jq -r '.summary | 
        "Compliant: \(.compliant)\nNon-compliant: \(.non_compliant)\nExpired: \(.expired)\nUntagged: \(.untagged)\n\nBy Environment:\nProd: \(.by_env.prod)\nStaging: \(.by_env.staging)\nDev: \(.by_env.dev)\nUntagged: \(.by_env.untagged)"' \
        "$CLASSIFIED_FILE"
    
    # Show violations count
    VIOLATIONS=$(jq '.violations | length' "$CLASSIFIED_FILE")
    if [ "$VIOLATIONS" -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Found $VIOLATIONS resources with violations${NC}"
        echo ""
        echo "Top 10 violations:"
        jq -r '.violations[0:10][] | "  - \(.name // .arn): \(.violations | join(", "))"' "$CLASSIFIED_FILE"
    fi
fi

echo ""
echo -e "${GREEN}✅ Scan complete!${NC}"
echo ""
echo "Files created:"
echo "  - Inventory: $INVENTORY_FILE"
echo "  - Classified: $CLASSIFIED_FILE"

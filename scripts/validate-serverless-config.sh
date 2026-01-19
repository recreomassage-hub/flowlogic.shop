#!/bin/bash
# validate-serverless-config.sh
# Validates serverless.yml against OpenSpec rules before deployment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVERLESS_DIR="$PROJECT_ROOT/infra/serverless"
SERVERLESS_YML="$SERVERLESS_DIR/serverless.yml"
RESOURCES_YML="$SERVERLESS_DIR/resources.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "🔍 Validating serverless.yml against OpenSpec rules..."

# 1. Check service name
echo ""
echo "1. Checking service name..."
if grep -qE "^service: flowlogic-backend$" "$SERVERLESS_YML"; then
  echo -e "${GREEN}✓${NC} Service name is correct: flowlogic-backend"
else
  echo -e "${RED}✗${NC} Service name must be 'flowlogic-backend' (no environment suffixes)"
  ERRORS=$((ERRORS + 1))
fi

# 2. Check for hardcoded environment names
echo ""
echo "2. Checking for hardcoded environment names..."
if grep -qE "flowlogic-staging-v2|flowlogic-dev-v2|flowlogic-prod-v2" "$SERVERLESS_YML" "$RESOURCES_YML" 2>/dev/null; then
  echo -e "${RED}✗${NC} Found hardcoded environment names (should use \${self:provider.stage})"
  grep -nE "flowlogic-staging-v2|flowlogic-dev-v2|flowlogic-prod-v2" "$SERVERLESS_YML" "$RESOURCES_YML" 2>/dev/null || true
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✓${NC} No hardcoded environment names found"
fi

# 3. Check required plugins
echo ""
echo "3. Checking required plugins..."
if grep -qE "serverless-prune-plugin" "$SERVERLESS_YML" && grep -qE "serverless-offline" "$SERVERLESS_YML"; then
  echo -e "${GREEN}✓${NC} Required plugins are declared"
else
  echo -e "${RED}✗${NC} Missing required plugins (serverless-prune-plugin, serverless-offline)"
  ERRORS=$((ERRORS + 1))
fi

# 4. Check prune plugin configuration
echo ""
echo "4. Checking prune plugin configuration..."
if grep -qE "prune:" "$SERVERLESS_YML" && grep -qE "automatic: true" "$SERVERLESS_YML"; then
  echo -e "${GREEN}✓${NC} Prune plugin is configured"
else
  echo -e "${YELLOW}⚠${NC} Prune plugin configuration missing or incomplete"
  WARNINGS=$((WARNINGS + 1))
fi

# 5. Check resource naming pattern
echo ""
echo "5. Checking resource naming pattern..."
if grep -qE "flowlogic-\$\{self:provider.stage\}" "$RESOURCES_YML" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Resources use stage-aware naming"
else
  echo -e "${YELLOW}⚠${NC} Some resources may not use stage-aware naming"
  WARNINGS=$((WARNINGS + 1))
fi

# 6. Check security settings
echo ""
echo "6. Checking security settings..."
if grep -qE "blockPublicAccess: true" "$SERVERLESS_YML"; then
  echo -e "${GREEN}✓${NC} Deployment bucket has public access blocked"
else
  echo -e "${YELLOW}⚠${NC} Deployment bucket public access not explicitly blocked"
  WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warning(s)${NC}"
  exit 0
else
  echo -e "${RED}✗ Validation failed: $ERRORS error(s), $WARNINGS warning(s)${NC}"
  exit 1
fi

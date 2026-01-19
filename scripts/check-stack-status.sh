#!/bin/bash
# check-stack-status.sh
# Проверка статуса CloudFormation stacks
#
# Usage:
#   ./scripts/check-stack-status.sh [stage] [region]
#
# Example:
#   ./scripts/check-stack-status.sh staging us-east-1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
STAGE="${1:-staging}"
REGION="${2:-us-east-1}"

echo -e "${BLUE}🔍 Проверка статуса stacks для stage: $STAGE${NC}"
echo "Region: $REGION"
echo ""

# Найти все stacks, связанные с flowlogic-backend
echo -e "${BLUE}Поиск stacks...${NC}"
STACKS=$(aws cloudformation list-stacks \
  --region "$REGION" \
  --stack-status-filter \
    CREATE_COMPLETE \
    UPDATE_COMPLETE \
    UPDATE_ROLLBACK_COMPLETE \
    DELETE_IN_PROGRESS \
    DELETE_FAILED \
    ROLLBACK_COMPLETE \
  --query "StackSummaries[?contains(StackName, 'flowlogic-backend') && contains(StackName, '$STAGE')]" \
  --output json)

STACK_COUNT=$(echo "$STACKS" | jq -r 'length // 0')

if [ "$STACK_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}⚠ Не найдено stacks для flowlogic-backend-$STAGE${NC}"
  exit 0
fi

echo -e "${GREEN}Найдено stacks: $STACK_COUNT${NC}"
echo ""

# Показать статус каждого stack
echo "$STACKS" | jq -r '.[] | "\(.StackName)|\(.StackStatus)"' | while IFS='|' read -r stack_name stack_status; do
  echo -e "${BLUE}Stack: $stack_name${NC}"
  
  case "$stack_status" in
    "CREATE_COMPLETE"|"UPDATE_COMPLETE")
      echo -e "  Статус: ${GREEN}$stack_status${NC}"
      ;;
    "DELETE_FAILED")
      echo -e "  Статус: ${RED}$stack_status${NC}"
      echo -e "  ${YELLOW}⚠ Требуется очистка${NC}"
      
      # Проверить ресурсы в DELETE_FAILED
      FAILED_COUNT=$(aws cloudformation describe-stack-resources \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query 'length(StackResources[?ResourceStatus==`DELETE_FAILED`])' \
        --output text 2>/dev/null || echo "0")
      
      if [ "$FAILED_COUNT" -gt 0 ]; then
        echo -e "  Ресурсов в DELETE_FAILED: ${RED}$FAILED_COUNT${NC}"
        echo "  Запустите: ./scripts/cleanup-delete-failed-stack.sh $stack_name $REGION"
      fi
      ;;
    "DELETE_IN_PROGRESS")
      echo -e "  Статус: ${YELLOW}$stack_status${NC}"
      echo "  Stack удаляется..."
      ;;
    *)
      echo -e "  Статус: ${YELLOW}$stack_status${NC}"
      ;;
  esac
  
  # Показать время последнего обновления
  LAST_UPDATE=$(aws cloudformation describe-stacks \
    --stack-name "$stack_name" \
    --region "$REGION" \
    --query 'Stacks[0].LastUpdatedTime' \
    --output text 2>/dev/null || echo "N/A")
  
  if [ "$LAST_UPDATE" != "N/A" ]; then
    echo "  Последнее обновление: $LAST_UPDATE"
  fi
  
  echo ""
done

# Проверить основной stack
MAIN_STACK="flowlogic-backend-$STAGE"
echo -e "${BLUE}Проверка основного stack: $MAIN_STACK${NC}"

if aws cloudformation describe-stacks \
  --stack-name "$MAIN_STACK" \
  --region "$REGION" \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null; then
  STATUS=$(aws cloudformation describe-stacks \
    --stack-name "$MAIN_STACK" \
    --region "$REGION" \
    --query 'Stacks[0].StackStatus' \
    --output text)
  
  if [ "$STATUS" = "CREATE_COMPLETE" ] || [ "$STATUS" = "UPDATE_COMPLETE" ]; then
    echo -e "${GREEN}✓ Основной stack в рабочем состоянии: $STATUS${NC}"
  else
    echo -e "${YELLOW}⚠ Основной stack: $STATUS${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Основной stack не найден${NC}"
  echo "  Это нормально, если stack еще не был создан"
fi

echo ""
echo -e "${GREEN}✓ Проверка завершена${NC}"

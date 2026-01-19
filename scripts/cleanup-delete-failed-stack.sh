#!/bin/bash
# cleanup-delete-failed-stack.sh
# Очистка DELETE_FAILED stack в AWS CloudFormation
#
# Usage:
#   ./scripts/cleanup-delete-failed-stack.sh [stack-name] [region]
#
# Example:
#   ./scripts/cleanup-delete-failed-stack.sh flowlogic-backend-staging-staging us-east-1

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
STACK_NAME="${1:-flowlogic-backend-staging-staging}"
REGION="${2:-us-east-1}"

echo -e "${BLUE}🔍 Очистка DELETE_FAILED stack${NC}"
echo "Stack: $STACK_NAME"
echo "Region: $REGION"
echo ""

# 1. Проверить существование stack
echo -e "${BLUE}1. Проверка существования stack...${NC}"
if ! aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null; then
  echo -e "${GREEN}✓ Stack не существует или уже удален${NC}"
  exit 0
fi

STACK_STATUS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].StackStatus' \
  --output text)

echo -e "${YELLOW}Текущий статус: $STACK_STATUS${NC}"

if [ "$STACK_STATUS" != "DELETE_FAILED" ]; then
  echo -e "${YELLOW}⚠ Stack не в состоянии DELETE_FAILED. Текущий статус: $STACK_STATUS${NC}"
  read -p "Продолжить очистку? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

# 2. Найти ресурсы в DELETE_FAILED
echo ""
echo -e "${BLUE}2. Поиск ресурсов в DELETE_FAILED...${NC}"
FAILED_RESOURCES=$(aws cloudformation describe-stack-resources \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'StackResources[?ResourceStatus==`DELETE_FAILED`]' \
  --output json)

FAILED_COUNT=$(echo "$FAILED_RESOURCES" | jq -r 'length // 0')

if [ "$FAILED_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✓ Нет ресурсов в DELETE_FAILED${NC}"
else
  echo -e "${RED}✗ Найдено ресурсов в DELETE_FAILED: $FAILED_COUNT${NC}"
  echo "$FAILED_RESOURCES" | jq -r '.[] | "  - \(.LogicalResourceId) (\(.ResourceType)): \(.PhysicalResourceId // "N/A")"'
fi

# 3. Показать детали каждого ресурса
if [ "$FAILED_COUNT" -gt 0 ]; then
  echo ""
  echo -e "${BLUE}3. Детали ресурсов в DELETE_FAILED:${NC}"
  echo "$FAILED_RESOURCES" | jq -r '.[] | "\(.LogicalResourceId)|\(.ResourceType)|\(.PhysicalResourceId // "N/A")"' | while IFS='|' read -r logical_id resource_type physical_id; do
    echo ""
    echo -e "${YELLOW}Ресурс: $logical_id${NC}"
    echo "  Тип: $resource_type"
    echo "  Physical ID: $physical_id"
    
    # Получить причину ошибки
    REASON=$(aws cloudformation describe-stack-events \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --query "StackEvents[?LogicalResourceId=='$logical_id' && ResourceStatus=='DELETE_FAILED'].ResourceStatusReason" \
      --output text | head -1)
    
    if [ -n "$REASON" ]; then
      echo "  Причина: $REASON"
    fi
  done
fi

# 4. Интерактивная очистка ресурсов
if [ "$FAILED_COUNT" -gt 0 ]; then
  echo ""
  echo -e "${BLUE}4. Очистка ресурсов:${NC}"
  echo "$FAILED_RESOURCES" | jq -r '.[] | "\(.LogicalResourceId)|\(.ResourceType)|\(.PhysicalResourceId // "N/A")"' | while IFS='|' read -r logical_id resource_type physical_id; do
    echo ""
    echo -e "${YELLOW}Обработка: $logical_id ($resource_type)${NC}"
    
    case "$resource_type" in
      "AWS::S3::Bucket")
        if [ "$physical_id" != "N/A" ] && [ -n "$physical_id" ]; then
          echo "  S3 Bucket: $physical_id"
          read -p "  Удалить bucket вручную? (y/N): " -n 1 -r
          echo
          if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "  Выполнение: aws s3 rb s3://$physical_id --force"
            if aws s3 rb "s3://$physical_id" --force --region "$REGION" 2>/dev/null; then
              echo -e "  ${GREEN}✓ Bucket удален${NC}"
            else
              echo -e "  ${RED}✗ Ошибка удаления bucket${NC}"
            fi
          fi
        fi
        ;;
      "AWS::DynamoDB::Table")
        if [ "$physical_id" != "N/A" ] && [ -n "$physical_id" ]; then
          echo "  DynamoDB Table: $physical_id"
          read -p "  Удалить table вручную? (y/N): " -n 1 -r
          echo
          if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "  Выполнение: aws dynamodb delete-table --table-name $physical_id"
            if aws dynamodb delete-table --table-name "$physical_id" --region "$REGION" 2>/dev/null; then
              echo -e "  ${GREEN}✓ Table удалена${NC}"
            else
              echo -e "  ${RED}✗ Ошибка удаления table${NC}"
            fi
          fi
        fi
        ;;
      "AWS::Lambda::Function")
        if [ "$physical_id" != "N/A" ] && [ -n "$physical_id" ]; then
          echo "  Lambda Function: $physical_id"
          read -p "  Удалить function вручную? (y/N): " -n 1 -r
          echo
          if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "  Выполнение: aws lambda delete-function --function-name $physical_id"
            if aws lambda delete-function --function-name "$physical_id" --region "$REGION" 2>/dev/null; then
              echo -e "  ${GREEN}✓ Function удалена${NC}"
            else
              echo -e "  ${RED}✗ Ошибка удаления function${NC}"
            fi
          fi
        fi
        ;;
      *)
        echo "  Тип ресурса: $resource_type"
        echo "  Physical ID: $physical_id"
        echo -e "  ${YELLOW}⚠ Требуется ручное удаление через AWS Console${NC}"
        ;;
    esac
  done
fi

# 5. Попытка удалить stack снова
echo ""
echo -e "${BLUE}5. Попытка удалить stack снова...${NC}"
read -p "Удалить stack '$STACK_NAME'? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Выполнение: aws cloudformation delete-stack --stack-name $STACK_NAME"
  if aws cloudformation delete-stack \
    --stack-name "$STACK_NAME" \
    --region "$REGION"; then
    echo -e "${GREEN}✓ Команда удаления stack отправлена${NC}"
    echo "Ожидание завершения..."
    
    if aws cloudformation wait stack-delete-complete \
      --stack-name "$STACK_NAME" \
      --region "$REGION" 2>/dev/null; then
      echo -e "${GREEN}✓ Stack успешно удален${NC}"
    else
      echo -e "${YELLOW}⚠ Stack все еще удаляется. Проверьте статус:${NC}"
      echo "  aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION"
    fi
  else
    echo -e "${RED}✗ Ошибка отправки команды удаления${NC}"
    exit 1
  fi
fi

# 6. Альтернатива: Игнорировать DELETE_FAILED и продолжить
echo ""
echo -e "${BLUE}6. Альтернативный вариант:${NC}"
echo -e "${YELLOW}Если stack все еще в DELETE_FAILED, можно:${NC}"
echo "  1. Игнорировать его и создать новый stack с другим именем"
echo "  2. Или использовать Serverless Framework, который может обновить существующий stack"
echo ""
echo "Для создания нового stack:"
echo "  cd infra/serverless"
echo "  serverless deploy --stage staging"
echo ""
echo "Serverless Framework попытается обновить существующий stack или создать новый."

echo ""
echo -e "${GREEN}✓ Очистка завершена${NC}"

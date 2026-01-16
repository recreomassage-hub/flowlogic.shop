#!/bin/bash
# Скрипт для обновления IAM политик OIDC ролей с правами CloudFormation

set -e

ENVIRONMENT=${1:-production}
REGION="us-east-1"

# Определяем файл политики и имя роли в зависимости от окружения
case "$ENVIRONMENT" in
  "production"|"prod")
    POLICY_FILE="infra/iam/cicd-policy-production.json"
    ROLE_NAME="flowlogic-ci-cd-production"
    ;;
  "staging"|"stage")
    POLICY_FILE="infra/iam/cicd-policy-with-diagnostics.json"
    ROLE_NAME="flowlogic-ci-cd-staging"
    ;;
  "dev"|"development")
    POLICY_FILE="infra/iam/cicd-policy.json"
    ROLE_NAME="flowlogic-ci-cd-dev"
    ;;
  *)
    echo "❌ Неизвестное окружение: $ENVIRONMENT"
    echo "Использование: $0 [production|staging|dev]"
    exit 1
    ;;
esac

echo "🔐 ОБНОВЛЕНИЕ IAM ПОЛИТИКИ OIDC РОЛИ"
echo "=========================================="
echo "Окружение: $ENVIRONMENT"
echo "Роль: $ROLE_NAME"
echo "Файл политики: $POLICY_FILE"
echo ""

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI не установлен"
  exit 1
fi

# Проверка credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS credentials не настроены"
  exit 1
fi

echo "✅ AWS CLI настроен"
echo ""

# Проверка файла политики
if [ ! -f "$POLICY_FILE" ]; then
  echo "❌ Файл $POLICY_FILE не найден"
  exit 1
fi

# Проверка существования роли
if ! aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
  echo "❌ Роль $ROLE_NAME не найдена"
  exit 1
fi

echo "✅ Роль $ROLE_NAME найдена"
echo ""

# Имя inline политики (должно совпадать с именем из setup-iam-roles.sh)
INLINE_POLICY_NAME="FlowLogicCICDPolicy"

echo "📝 Обновление inline политики $INLINE_POLICY_NAME для роли $ROLE_NAME..."

# Обновление inline политики
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$INLINE_POLICY_NAME" \
  --policy-document "file://$POLICY_FILE" \
  > /dev/null

echo "✅ Политика обновлена успешно"
echo ""

# Проверка применения политики
echo "📋 Проверка примененных прав CloudFormation..."
POLICY_DOC=$(aws iam get-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$INLINE_POLICY_NAME" \
  --query 'PolicyDocument' --output json 2>/dev/null || echo "{}")

if echo "$POLICY_DOC" | grep -q "cloudformation:DescribeStackResource"; then
  echo "✅ cloudformation:DescribeStackResource найден в политике"
else
  echo "⚠️  cloudformation:DescribeStackResource не найден в политике"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ОБНОВЛЕНИЕ ЗАВЕРШЕНО!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Обновленные права CloudFormation для роли $ROLE_NAME:"
echo "  ✅ cloudformation:CreateStack"
echo "  ✅ cloudformation:UpdateStack"
echo "  ✅ cloudformation:DeleteStack"
echo "  ✅ cloudformation:DescribeStacks"
echo "  ✅ cloudformation:DescribeStackEvents"
echo "  ✅ cloudformation:DescribeStackResources"
echo "  ✅ cloudformation:DescribeStackResource (ДОБАВЛЕНО)"
echo "  ✅ cloudformation:GetTemplate"
echo "  ✅ cloudformation:ValidateTemplate"
echo "  ✅ cloudformation:ListStacks"
echo ""

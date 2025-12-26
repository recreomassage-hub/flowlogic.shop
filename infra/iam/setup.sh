#!/bin/bash
# setup.sh - Скрипт для автоматической настройки IAM для Flow Logic

set -e

echo "🔐 Flow Logic IAM Setup"
echo "======================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI не установлен${NC}"
    echo "Установите: https://aws.amazon.com/cli/"
    exit 1
fi

# Проверка конфигурации AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS не настроен${NC}"
    echo "Выполните: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI настроен${NC}"
echo ""

# Получение Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"
echo ""

# Создание директории для IAM файлов
mkdir -p infra/iam

# Шаг 1: Создание IAM пользователя
echo "📝 Шаг 1: Создание IAM пользователя..."
USER_NAME="flowlogic-cicd-user"

if aws iam get-user --user-name "$USER_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Пользователь $USER_NAME уже существует${NC}"
    read -p "Продолжить? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    aws iam create-user \
        --user-name "$USER_NAME" \
        --tags Key=Project,Value=FlowLogic Key=Environment,Value=All Key=ManagedBy,Value=Script
    
    echo -e "${GREEN}✅ Пользователь $USER_NAME создан${NC}"
fi

# Шаг 2: Создание политики
echo ""
echo "📝 Шаг 2: Создание IAM политики..."

POLICY_NAME="FlowLogic-CICD-Policy"
POLICY_FILE="infra/iam/cicd-policy.json"

if [ ! -f "$POLICY_FILE" ]; then
    echo -e "${RED}❌ Файл $POLICY_FILE не найден${NC}"
    exit 1
fi

# Проверка существования политики
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>/dev/null || echo "")

if [ -z "$POLICY_ARN" ]; then
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document "file://$POLICY_FILE" \
        --description "Policy for CI/CD deployment of Flow Logic platform" \
        --query 'Policy.Arn' --output text)
    
    echo -e "${GREEN}✅ Политика $POLICY_NAME создана${NC}"
    echo "   ARN: $POLICY_ARN"
else
    echo -e "${YELLOW}⚠️  Политика $POLICY_NAME уже существует${NC}"
    echo "   ARN: $POLICY_ARN"
    
    # Обновление политики
    read -p "Обновить политику? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        POLICY_VERSION=$(aws iam create-policy-version \
            --policy-arn "$POLICY_ARN" \
            --policy-document "file://$POLICY_FILE" \
            --set-as-default \
            --query 'PolicyVersion.VersionId' --output text)
        
        echo -e "${GREEN}✅ Политика обновлена (версия: $POLICY_VERSION)${NC}"
    fi
fi

# Шаг 3: Прикрепление политики к пользователю
echo ""
echo "📝 Шаг 3: Прикрепление политики к пользователю..."

if aws iam list-attached-user-policies --user-name "$USER_NAME" --query "AttachedPolicies[?PolicyArn=='$POLICY_ARN']" --output text | grep -q "$POLICY_ARN"; then
    echo -e "${YELLOW}⚠️  Политика уже прикреплена${NC}"
else
    aws iam attach-user-policy \
        --user-name "$USER_NAME" \
        --policy-arn "$POLICY_ARN"
    
    echo -e "${GREEN}✅ Политика прикреплена к пользователю${NC}"
fi

# Шаг 4: Создание Access Keys
echo ""
echo "📝 Шаг 4: Создание Access Keys..."

EXISTING_KEYS=$(aws iam list-access-keys --user-name "$USER_NAME" --query 'AccessKeyMetadata' --output json)

if [ "$(echo "$EXISTING_KEYS" | jq '. | length')" -ge 2 ]; then
    echo -e "${YELLOW}⚠️  У пользователя уже есть 2 Access Keys (максимум)${NC}"
    echo "   Удалите один из существующих ключей перед созданием нового"
    echo ""
    echo "Существующие ключи:"
    echo "$EXISTING_KEYS" | jq -r '.[] | "   - \(.AccessKeyId) (создан: \(.CreateDate))"'
else
    read -p "Создать новый Access Key? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        KEY_OUTPUT=$(aws iam create-access-key --user-name "$USER_NAME")
        
        ACCESS_KEY_ID=$(echo "$KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
        SECRET_ACCESS_KEY=$(echo "$KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')
        
        echo -e "${GREEN}✅ Access Key создан${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  ВАЖНО: Сохраните эти ключи! SecretAccessKey показывается только один раз!${NC}"
        echo ""
        echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
        echo "AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
        echo ""
        echo "Добавьте в GitHub Secrets:"
        echo "  - AWS_ACCESS_KEY_ID_DEV = $ACCESS_KEY_ID"
        echo "  - AWS_SECRET_ACCESS_KEY_DEV = $SECRET_ACCESS_KEY"
        echo ""
        
        # Сохранение в файл (опционально, с предупреждением)
        read -p "Сохранить в файл .env.local? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cat >> .env.local << EOF

# AWS Credentials for CI/CD (НЕ КОММИТИТЬ!)
AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY
EOF
            echo -e "${GREEN}✅ Ключи сохранены в .env.local${NC}"
            echo -e "${YELLOW}⚠️  Убедитесь, что .env.local в .gitignore!${NC}"
        fi
    fi
fi

# Шаг 5: Создание SSM параметров (опционально)
echo ""
echo "📝 Шаг 5: Создание SSM параметров (опционально)..."

read -p "Создать SSM параметры для dev окружения? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Создание параметров..."
    echo "  (Используйте реальные значения из вашего AWS аккаунта)"
    echo ""
    
    read -p "Cognito User Pool ID: " COGNITO_POOL_ID
    if [ -n "$COGNITO_POOL_ID" ]; then
        aws ssm put-parameter \
            --name /flowlogic/dev/cognito/user-pool-id \
            --value "$COGNITO_POOL_ID" \
            --type String \
            --description "Cognito User Pool ID for dev environment" \
            --overwrite 2>/dev/null || true
        echo -e "${GREEN}✅ Параметр /flowlogic/dev/cognito/user-pool-id создан${NC}"
    fi
    
    read -p "Cognito Client ID: " COGNITO_CLIENT_ID
    if [ -n "$COGNITO_CLIENT_ID" ]; then
        aws ssm put-parameter \
            --name /flowlogic/dev/cognito/client-id \
            --value "$COGNITO_CLIENT_ID" \
            --type String \
            --description "Cognito Client ID for dev environment" \
            --overwrite 2>/dev/null || true
        echo -e "${GREEN}✅ Параметр /flowlogic/dev/cognito/client-id создан${NC}"
    fi
    
    read -p "Stripe Secret Key (sk_test_...): " STRIPE_KEY
    if [ -n "$STRIPE_KEY" ]; then
        aws ssm put-parameter \
            --name /flowlogic/dev/stripe/secret-key \
            --value "$STRIPE_KEY" \
            --type SecureString \
            --description "Stripe Secret Key for dev environment" \
            --key-id alias/aws/ssm \
            --overwrite 2>/dev/null || true
        echo -e "${GREEN}✅ Параметр /flowlogic/dev/stripe/secret-key создан${NC}"
    fi
fi

# Итоговая сводка
echo ""
echo "================================"
echo -e "${GREEN}✅ IAM Setup завершен!${NC}"
echo "================================"
echo ""
echo "Создано:"
echo "  ✅ IAM пользователь: $USER_NAME"
echo "  ✅ IAM политика: $POLICY_NAME"
echo "  ✅ Политика прикреплена к пользователю"
echo ""
echo "Следующие шаги:"
echo "  1. Добавьте Access Keys в GitHub Secrets"
echo "  2. Создайте SSM параметры для всех окружений"
echo "  3. Проверьте деплой: cd infra/serverless && serverless deploy --stage dev"
echo ""
echo "📚 Документация: docs/infrastructure/iam_setup.md"




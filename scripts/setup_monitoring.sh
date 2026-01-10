#!/bin/bash
# setup_monitoring.sh - Настройка CloudWatch мониторинга и алертов

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

STAGE="${1:-production}"
REGION="${2:-us-east-1}"

echo "📊 Настройка CloudWatch мониторинга для окружения: $STAGE"
echo ""

# Проверяем наличие AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI не установлен"
    echo "   Установите: https://aws.amazon.com/cli/"
    exit 1
fi

# Проверяем AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials не настроены"
    echo "   Настройте: aws configure"
    exit 1
fi

echo "✅ AWS CLI настроен"
echo ""

# Деплой monitoring resources через CloudFormation
MONITORING_FILE="$PROJECT_ROOT/infra/serverless/monitoring.yml"
STACK_NAME="flowlogic-${STAGE}-monitoring"

if [ ! -f "$MONITORING_FILE" ]; then
    echo "❌ Файл monitoring.yml не найден: $MONITORING_FILE"
    exit 1
fi

echo "📋 Деплой CloudWatch Alarms и SNS Topics..."
echo "   Stack: $STACK_NAME"
echo "   Region: $REGION"
echo ""

# Заменяем переменные в monitoring.yml для текущего stage
TEMP_FILE=$(mktemp)
sed "s/\${self:provider.stage}/$STAGE/g" "$MONITORING_FILE" > "$TEMP_FILE"

# Деплой через CloudFormation
aws cloudformation deploy \
    --template-file "$TEMP_FILE" \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides Stage="$STAGE" \
    || {
        echo "❌ Ошибка при деплое monitoring resources"
        rm "$TEMP_FILE"
        exit 1
    }

rm "$TEMP_FILE"

echo ""
echo "✅ CloudWatch мониторинг настроен!"
echo ""

# Показываем созданные ресурсы
echo "📊 Созданные ресурсы:"
aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs' \
    --output table 2>/dev/null || echo "   (Outputs не найдены)"

echo ""
echo "📋 Следующие шаги:"
echo "   1. Подписаться на SNS Topics для получения алертов:"
echo "      aws sns subscribe --topic-arn <TOPIC_ARN> --protocol email --notification-endpoint your-email@example.com"
echo ""
echo "   2. Проверить алерты в CloudWatch Console:"
echo "      https://console.aws.amazon.com/cloudwatch/home?region=$REGION#alarmsV2:"
echo ""
echo "   3. Просмотреть метрики:"
echo "      https://console.aws.amazon.com/cloudwatch/home?region=$REGION#metricsV2:"






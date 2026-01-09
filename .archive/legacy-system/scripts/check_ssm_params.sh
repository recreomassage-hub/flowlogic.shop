#!/bin/bash
# Проверка SSM параметров для всех окружений Flow Logic

REGION="us-east-1"
ENVIRONMENTS=("dev" "staging" "production")
PARAMS=("cognito/user-pool-id" "cognito/client-id" "stripe/secret-key")

echo "=== ПРОВЕРКА SSM ПАРАМЕТРОВ ==="
echo "Регион: $REGION"
echo ""

TOTAL_FOUND=0
TOTAL_MISSING=0

for env in "${ENVIRONMENTS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 ОКРУЖЕНИЕ: $env"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  FOUND=0
  MISSING=0
  
  for param in "${PARAMS[@]}"; do
    full_path="/flowlogic/$env/$param"
    echo -n "  $full_path: "
    
    result=$(aws ssm get-parameter --name "$full_path" --region "$REGION" --query "Parameter.{Type:Type,LastModified:LastModifiedDate}" --output json 2>/dev/null)
    
    if [ $? -eq 0 ]; then
      type=$(echo "$result" | jq -r '.Type')
      modified=$(echo "$result" | jq -r '.LastModified')
      if [ "$type" == "SecureString" ]; then
        echo "✅ SecureString (обновлен: $modified)"
      else
        value=$(aws ssm get-parameter --name "$full_path" --region "$REGION" --query "Parameter.Value" --output text 2>/dev/null)
        echo "✅ $type = $value"
      fi
      ((FOUND++))
      ((TOTAL_FOUND++))
    else
      echo "❌ НЕ НАЙДЕН"
      ((MISSING++))
      ((TOTAL_MISSING++))
    fi
  done
  
  echo "  Статус: $FOUND/${#PARAMS[@]} параметров найдено"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ИТОГО:"
echo "  Найдено: $TOTAL_FOUND параметров"
echo "  Отсутствует: $TOTAL_MISSING параметров"
echo ""

if [ $TOTAL_MISSING -gt 0 ]; then
  echo "⚠️  ВНИМАНИЕ: Некоторые параметры отсутствуют!"
  echo "   Создайте их с помощью команд из docs/deployment/cognito_setup.md"
  exit 1
else
  echo "✅ Все параметры настроены!"
  exit 0
fi







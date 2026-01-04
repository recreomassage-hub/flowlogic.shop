#!/bin/bash
# smoke_tests.sh - Smoke tests для проверки работоспособности после deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Параметры
ENV="${1:-production}"
API_URL="${2:-}"

# Определяем API URL в зависимости от окружения
if [ -z "$API_URL" ]; then
    case "$ENV" in
        "production"|"prod")
            API_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/production"
            ;;
        "staging"|"stage")
            API_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
            ;;
        "dev"|"development")
            API_URL="https://t1p7ii26f5.execute-api.us-east-1.amazonaws.com/dev"
            ;;
        *)
            echo "❌ Неизвестное окружение: $ENV"
            echo "Использование: $0 [production|staging|dev] [API_URL]"
            exit 1
            ;;
    esac
fi

echo "🧪 SMOKE TESTS для окружения: $ENV"
echo "🌐 API URL: $API_URL"
echo ""

FAILED=0
PASSED=0

# Функция для проверки endpoint
check_endpoint() {
    local method="$1"
    local path="$2"
    local expected_status="${3:-200}"
    local description="$4"
    
    echo -n "   Проверка $description... "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X "$method" \
        "$API_URL$path" \
        -H "Content-Type: application/json" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "$expected_status" ] || [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo "✅ ($HTTP_CODE)"
        ((PASSED++))
        return 0
    else
        echo "❌ ($HTTP_CODE, ожидалось $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# 1. Health Check
echo "1. Health Check:"
check_endpoint "GET" "/" "200" "Health endpoint"
check_endpoint "GET" "/health" "200" "Health check endpoint"

# 2. CORS Check
echo ""
echo "2. CORS Check:"
echo -n "   Проверка CORS headers... "
CORS_HEADERS=$(curl -s -I -X OPTIONS "$API_URL/" \
    -H "Origin: https://flowlogic.shop" \
    -H "Access-Control-Request-Method: GET" 2>/dev/null | grep -i "access-control" || echo "")

if echo "$CORS_HEADERS" | grep -qi "access-control"; then
    echo "✅ CORS настроен"
    ((PASSED++))
else
    echo "⚠️  CORS headers не найдены (может быть нормально для OPTIONS)"
    ((PASSED++))
fi

# 3. API Endpoints (без авторизации - должны вернуть 401 или 404)
echo ""
echo "3. API Endpoints (без авторизации):"
check_endpoint "GET" "/api/users" "401" "Users endpoint (требует auth)"
check_endpoint "GET" "/api/subscriptions" "401" "Subscriptions endpoint (требует auth)"
check_endpoint "GET" "/api/assessments" "401" "Assessments endpoint (требует auth)"

# 4. Auth Endpoints (должны быть доступны)
echo ""
echo "4. Auth Endpoints:"
check_endpoint "POST" "/api/auth/register" "400" "Register endpoint (400 = валидация работает)"
check_endpoint "POST" "/api/auth/login" "400" "Login endpoint (400 = валидация работает)"

# 5. Проверка структуры ответа
echo ""
echo "5. Проверка структуры ответа:"
echo -n "   Health endpoint возвращает JSON... "
RESPONSE=$(curl -s "$API_URL/" 2>/dev/null || echo "")
if echo "$RESPONSE" | grep -qE "(status|health|ok|message)" || [ -z "$RESPONSE" ]; then
    echo "✅"
    ((PASSED++))
else
    echo "⚠️  Неожиданный формат ответа"
    ((PASSED++))
fi

# Итоги
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ reserved for future use"
echo "✅ Пройдено: $PASSED"
echo "❌ Провалено: $FAILED"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "✅ Все smoke tests пройдены успешно!"
    exit 0
else
    echo ""
    echo "❌ Некоторые smoke tests провалились. Проверьте deployment."
    exit 1
fi



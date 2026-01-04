#!/bin/bash
# Pre-commit hook для проверки секретов
# Использование: ./scripts/pre-commit-secrets-check.sh

set -e

echo "🔒 Проверка на секреты перед коммитом..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Проверка на .env файлы
echo "1. Проверка на .env файлы..."
ENV_FILES=$(git diff --cached --name-only | grep -E "\.env$" || true)
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}❌ ОШИБКА: Найдены .env файлы в staged:${NC}"
    echo "$ENV_FILES"
    echo -e "${YELLOW}Удалите их из staged: git reset HEAD <file>${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env файлов нет в staged${NC}"
fi
echo ""

# 2. Проверка на реальные токены и ключи
echo "2. Проверка на реальные токены и ключи..."
SECRETS=$(git diff --cached | grep -oE "(ghp_[a-zA-Z0-9]{36}|sk_live_[a-zA-Z0-9]{32,}|sk_test_[a-zA-Z0-9]{32,}|AKIA[0-9A-Z]{16})" || true)
if [ -n "$SECRETS" ]; then
    echo -e "${RED}❌ ОШИБКА: Найдены реальные токены/ключи:${NC}"
    echo "$SECRETS" | head -5
    echo -e "${YELLOW}Удалите их из staged и используйте GitHub Secrets!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Реальных токенов/ключей не найдено${NC}"
fi
echo ""

# 3. Проверка на подозрительные паттерны
echo "3. Проверка на подозрительные паттерны..."
SUSPICIOUS=$(git diff --cached | grep -iE "(password\s*[:=]\s*['\"][^'\"]{8,}|secret\s*[:=]\s*['\"][^'\"]{8,}|api[_-]?key\s*[:=]\s*['\"][^'\"]{8,})" || true)
if [ -n "$SUSPICIOUS" ]; then
    echo -e "${YELLOW}⚠️  ВНИМАНИЕ: Найдены подозрительные паттерны:${NC}"
    echo "$SUSPICIOUS" | head -5
    echo -e "${YELLOW}Убедитесь, что это placeholder значения, а не реальные секреты!${NC}"
fi
echo ""

# 4. Проверка на AWS credentials
echo "4. Проверка на AWS credentials..."
AWS_CREDS=$(git diff --cached | grep -iE "(aws[_-]?access[_-]?key[_-]?id|aws[_-]?secret[_-]?access[_-]?key)\s*[:=]\s*['\"][^'\"]{8,}" || true)
if [ -n "$AWS_CREDS" ]; then
    echo -e "${RED}❌ ОШИБКА: Найдены AWS credentials:${NC}"
    echo "$AWS_CREDS" | head -3
    echo -e "${YELLOW}Используйте GitHub Secrets для AWS credentials!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ AWS credentials не найдены${NC}"
fi
echo ""

# 5. Проверка на Stripe keys
echo "5. Проверка на Stripe keys..."
STRIPE_KEYS=$(git diff --cached | grep -iE "stripe[_-]?(secret|key)\s*[:=]\s*['\"]sk_(live|test)_[^'\"]{32,}" || true)
if [ -n "$STRIPE_KEYS" ]; then
    echo -e "${RED}❌ ОШИБКА: Найдены Stripe keys:${NC}"
    echo "$STRIPE_KEYS" | head -3
    echo -e "${YELLOW}Используйте SSM Parameter Store для Stripe keys!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Stripe keys не найдены${NC}"
fi
echo ""

# Итог
echo "=== ИТОГ ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Проверка пройдена! Можно коммитить.${NC}"
    exit 0
else
    echo -e "${RED}❌ Найдено ошибок: $ERRORS${NC}"
    echo -e "${YELLOW}Исправьте ошибки перед коммитом!${NC}"
    exit 1
fi






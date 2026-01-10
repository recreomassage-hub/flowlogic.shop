#!/bin/bash
# clean-archive-secrets.sh
# Очистка секретов из архива перед коммитом

set -e

ARCHIVE_DIR=".archive/legacy-system"

if [ ! -d "$ARCHIVE_DIR" ]; then
    echo "❌ Архив не найден: $ARCHIVE_DIR"
    exit 1
fi

echo "🔒 Очистка секретов из архива..."
echo ""

# GitHub токены
echo "🔍 Поиск GitHub токенов..."
TOKEN_COUNT=$(grep -r "ghp_" "$ARCHIVE_DIR" 2>/dev/null | wc -l)
if [ "$TOKEN_COUNT" -gt 0 ]; then
    echo "  Найдено токенов: $TOKEN_COUNT"
    find "$ARCHIVE_DIR" -type f \( -name "*.md" -o -name "*.sh" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" \) -exec sed -i 's/ghp_[A-Za-z0-9]\{36\}/ghp_REDACTED/g' {} \; 2>/dev/null
    echo "  ✅ GitHub токены заменены на ghp_REDACTED"
else
    echo "  ✅ GitHub токены не найдены"
fi

# AWS credentials
echo "🔍 Поиск AWS credentials..."
AWS_COUNT=$(grep -r "AKIA[0-9A-Z]\{16\}" "$ARCHIVE_DIR" 2>/dev/null | wc -l)
if [ "$AWS_COUNT" -gt 0 ]; then
    echo "  Найдено AWS ключей: $AWS_COUNT"
    find "$ARCHIVE_DIR" -type f -exec sed -i 's/AKIA[0-9A-Z]\{16\}/AKIA_REDACTED/g' {} \; 2>/dev/null
    echo "  ✅ AWS ключи заменены на AKIA_REDACTED"
else
    echo "  ✅ AWS ключи не найдены"
fi

# Stripe keys
echo "🔍 Поиск Stripe ключей..."
STRIPE_COUNT=$(grep -r "sk_live_\|sk_test_\|pk_live_\|pk_test_" "$ARCHIVE_DIR" 2>/dev/null | wc -l)
if [ "$STRIPE_COUNT" -gt 0 ]; then
    echo "  Найдено Stripe ключей: $STRIPE_COUNT"
    find "$ARCHIVE_DIR" -type f -exec sed -i 's/sk_live_[A-Za-z0-9]\{24,\}/sk_live_REDACTED/g' {} \; 2>/dev/null
    find "$ARCHIVE_DIR" -type f -exec sed -i 's/sk_test_[A-Za-z0-9]\{24,\}/sk_test_REDACTED/g' {} \; 2>/dev/null
    find "$ARCHIVE_DIR" -type f -exec sed -i 's/pk_live_[A-Za-z0-9]\{24,\}/pk_live_REDACTED/g' {} \; 2>/dev/null
    find "$ARCHIVE_DIR" -type f -exec sed -i 's/pk_test_[A-Za-z0-9]\{24,\}/pk_test_REDACTED/g' {} \; 2>/dev/null
    echo "  ✅ Stripe ключи заменены на REDACTED"
else
    echo "  ✅ Stripe ключи не найдены"
fi

# Проверка результата
echo ""
echo "✅ Очистка завершена!"
echo ""
echo "🔍 Финальная проверка..."
FINAL_TOKENS=$(grep -r "ghp_[A-Za-z0-9]\{36\}" "$ARCHIVE_DIR" 2>/dev/null | wc -l)
if [ "$FINAL_TOKENS" -eq 0 ]; then
    echo "  ✅ Все токены очищены"
else
    echo "  ⚠️  Осталось токенов: $FINAL_TOKENS"
    echo "  Проверьте вручную: grep -r 'ghp_' $ARCHIVE_DIR"
fi




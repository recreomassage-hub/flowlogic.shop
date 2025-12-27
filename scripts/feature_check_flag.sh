#!/bin/bash

# 🚦 FEATURE CHECK FLAG - Проверка наличия feature flag
# Использование: ./scripts/feature_check_flag.sh <feature_slug>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

FEATURE_SLUG="${1}"

if [ -z "$FEATURE_SLUG" ]; then
  echo "❌ Ошибка: укажите slug фичи"
  echo ""
  echo "Использование: ./scripts/feature_check_flag.sh <feature_slug>"
  exit 1
fi

echo "🚦 FEATURE CHECK FLAG: Проверка feature flag '$FEATURE_SLUG'"
echo ""

FLAG_FOUND=0
FLAG_FILES=()

# Ищем feature flag в конфигурационных файлах
CONFIG_FILES=(
  "infra/serverless/serverless.yml"
  "src/backend/.env.example"
  "src/frontend/.env.example"
  "PROJECT_CONFIG.md"
)

for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$file" ]; then
    if grep -q "$FEATURE_SLUG" "$file" 2>/dev/null; then
      FLAG_FOUND=1
      FLAG_FILES+=("$file")
    fi
  fi
done

# Проверяем в коде
CODE_FILES=$(grep -r "$FEATURE_SLUG" src/ infra/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | cut -d: -f1 | sort -u || true)

if [ -n "$CODE_FILES" ]; then
  FLAG_FOUND=1
  while IFS= read -r file; do
    FLAG_FILES+=("$file")
  done <<< "$CODE_FILES"
fi

if [ $FLAG_FOUND -eq 1 ]; then
  echo "✅ Feature flag найден в:"
  for file in "${FLAG_FILES[@]}"; do
    echo "   • $file"
  done
  echo ""
  echo "✅ Feature flag настроен"
else
  echo "⚠️  Feature flag НЕ найден!"
  echo ""
  echo "📋 Нужно добавить в:"
  echo "   1. Конфигурацию (serverless.yml или .env)"
  echo "   2. Код (проверка флага)"
  echo ""
  echo "💡 Пример для serverless.yml:"
  echo "   \`\`\`yaml"
  echo "   custom:"
  echo "     features:"
  echo "       ${FEATURE_SLUG}: false"
  echo "   \`\`\`"
  echo ""
  exit 1
fi


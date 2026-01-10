#!/bin/bash

# 🔎 FEATURE IMPACT - Анализ влияния фичи
# Использование: ./scripts/feature_impact.sh <feature_slug>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

FEATURE_SLUG="${1}"

if [ -z "$FEATURE_SLUG" ]; then
  echo "❌ Ошибка: укажите slug фичи"
  echo ""
  echo "Использование: ./scripts/feature_impact.sh <feature_slug>"
  echo ""
  echo "Пример:"
  echo "  ./scripts/feature_impact.sh smart-task-prioritization"
  exit 1
fi

FEATURE_DIR="docs/features/${FEATURE_SLUG}"

if [ ! -d "$FEATURE_DIR" ]; then
  echo "❌ Ошибка: фича '$FEATURE_SLUG' не найдена"
  echo ""
  echo "Создайте фичу: ./scripts/feature_new.sh <feature_name>"
  exit 1
fi

FEATURE_NAME=$(grep -E "^# Feature:" "${FEATURE_DIR}/feature_brief.md" 2>/dev/null | sed 's/# Feature: //' || echo "$FEATURE_SLUG")

echo "🔎 FEATURE IMPACT: Анализ влияния фичи '$FEATURE_NAME'"
echo ""

# Создаем инструкцию для Cursor
INSTRUCTION=".feature_impact_instruction.md"

cat > "$INSTRUCTION" <<EOF
# 🔎 FEATURE IMPACT ANALYSIS

**Фича:** $FEATURE_NAME
**Slug:** $FEATURE_SLUG

---

## ⚠️ ИНСТРУКЦИЯ ДЛЯ CURSOR

**Скопируйте и вставьте в Cursor:**

\`\`\`
ROLE: ARCHITECT + PM

Задача: Проанализируй влияние фичи "$FEATURE_NAME"

Прочитай:
- docs/features/${FEATURE_SLUG}/feature_brief.md

Проанализируй влияние на:
1. Backend (API, сервисы, зависимости)
2. Frontend (компоненты, состояние, UX)
3. Data Model (таблицы, индексы, миграции)
4. Performance (нагрузка, кэширование, оптимизация)
5. Security (авторизация, валидация, риски)

Для каждого компонента укажи:
- Impact: LOW / MEDIUM / HIGH
- Risk: LOW / MEDIUM / HIGH
- Mitigation: [как снизить риск]

Результат → обнови docs/features/${FEATURE_SLUG}/impact_analysis.md

⚠️ Если impact HIGH → фича должна быть разбита на меньшие части.
\`\`\`

---

## 📋 КРИТЕРИИ

**Impact HIGH если:**
- Требует изменения core архитектуры
- Влияет на >3 компонента
- Требует breaking changes
- Значительно влияет на performance

**В этом случае:** Разбей фичу на меньшие части

---

**После анализа:** Удалите этот файл (\`rm $INSTRUCTION\`)

EOF

echo "✅ Инструкция создана: $INSTRUCTION"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте файл: $INSTRUCTION"
echo "   2. Скопируйте инструкцию в Cursor"
echo "   3. После анализа обновите: ${FEATURE_DIR}/impact_analysis.md"
echo "   4. Удалите инструкцию: rm $INSTRUCTION"
echo ""
echo "⚠️  Если impact HIGH → фича должна быть разбита на меньшие части"






#!/bin/bash

# 🧠 FEATURE RETRO - Ретроспектива фичи
# Использование: ./scripts/feature_retro.sh <feature_slug>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

FEATURE_SLUG="${1}"

if [ -z "$FEATURE_SLUG" ]; then
  echo "❌ Ошибка: укажите slug фичи"
  echo ""
  echo "Использование: ./scripts/feature_retro.sh <feature_slug>"
  exit 1
fi

FEATURE_DIR="docs/features/${FEATURE_SLUG}"

if [ ! -d "$FEATURE_DIR" ]; then
  echo "❌ Ошибка: фича '$FEATURE_SLUG' не найдена"
  exit 1
fi

FEATURE_NAME=$(grep -E "^# Feature:" "${FEATURE_DIR}/feature_brief.md" 2>/dev/null | sed 's/# Feature: //' || echo "$FEATURE_SLUG")

echo "🧠 FEATURE RETRO: Ретроспектива фичи '$FEATURE_NAME'"
echo ""

# Создаем инструкцию для Cursor
INSTRUCTION=".feature_retro_instruction.md"

cat > "$INSTRUCTION" <<EOF
# 🧠 FEATURE RETROSPECTIVE

**Фича:** $FEATURE_NAME
**Slug:** $FEATURE_SLUG

---

## ⚠️ ИНСТРУКЦИЯ ДЛЯ CURSOR

**Скопируйте и вставьте в Cursor:**

\`\`\`
ROLE: OWNER + LLM

Задача: Проведи ретроспективу фичи "$FEATURE_NAME"

Прочитай:
- docs/features/${FEATURE_SLUG}/feature_brief.md
- docs/features/${FEATURE_SLUG}/impact_analysis.md
- docs/features/${FEATURE_SLUG}/qa.md

Проанализируй:
1. Что сработало хорошо?
2. Что не сработало?
3. Какие были проблемы?
4. Что можно улучшить в следующих фичах?

Результат → обнови docs/features/${FEATURE_SLUG}/retro.md

📌 Это обучает следующие фичи, а не только эту.
\`\`\`

---

## 📋 ВОПРОСЫ ДЛЯ АНАЛИЗА

**Что сработало:**
- Быстрый дизайн?
- Малые коммиты?
- Хорошее тестирование?

**Что не сработало:**
- Недооценили UX?
- Проблемы с performance?
- Сложности в реализации?

**Выводы:**
- Что делать по-другому в следующих фичах?
- Какие процессы улучшить?

---

**После ретроспективы:** Удалите этот файл (\`rm $INSTRUCTION\`)

EOF

echo "✅ Инструкция создана: $INSTRUCTION"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте файл: $INSTRUCTION"
echo "   2. Скопируйте инструкцию в Cursor"
echo "   3. После ретроспективы обновите: ${FEATURE_DIR}/retro.md"
echo "   4. Удалите инструкцию: rm $INSTRUCTION"
echo ""
echo "💡 Это обучает следующие фичи, а не только эту"




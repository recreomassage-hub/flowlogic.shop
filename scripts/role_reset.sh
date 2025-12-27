#!/bin/bash

# 🔄 ROLE RESET - Перезапуск роли с очисткой контекста
# Использование: ./scripts/role_reset.sh [role_name]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

ROLE_NAME="${1:-$(grep -E '^current_role:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')}"

if [ ! -f "ROLES/${ROLE_NAME}.md" ] && [ ! -f "ROLES/0${ROLE_NAME}.md" ]; then
  echo "❌ Ошибка: роль '$ROLE_NAME' не найдена"
  echo ""
  echo "Доступные роли:"
  ls -1 ROLES/*.md | sed 's|ROLES/||' | sed 's|\.md||'
  exit 1
fi

# Находим файл роли
ROLE_FILE=$(find ROLES -name "*${ROLE_NAME}*.md" | head -1)

echo "🔄 ROLE RESET: Перезапуск роли '$ROLE_NAME'"
echo ""

# Создаем reset инструкцию
RESET_INSTRUCTION=".role_reset_instruction.md"

cat > "$RESET_INSTRUCTION" <<EOF
# ⚠️ ROLE RESET INSTRUCTION

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Роль:** $ROLE_NAME

---

## 🔄 ИНСТРУКЦИЯ ДЛЯ CURSOR

**Скопируйте и вставьте в Cursor:**

\`\`\`
⚠️ ROLE RESET

1. Забудь последние N сообщений (игнорируй предыдущий контекст)

2. Прочитай следующие файлы:
   - PROJECT_CONFIG.md
   - WORKFLOW_STATE.md
   - $ROLE_FILE

3. Определи текущий этап из WORKFLOW_STATE.md

4. Продолжай строго по чеклисту из $ROLE_FILE

5. НЕ повторяй уже выполненные задачи (проверь WORKFLOW_STATE.md)

6. Фокус на конкретных действиях, а не на объяснениях
\`\`\`

---

## 📋 КОНТЕКСТ

**Текущая роль:** $ROLE_NAME
**Файл роли:** $ROLE_FILE
**Текущий этап:** $(grep -E '^current_stage:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')

---

**После reset:** Удалите этот файл (\`rm $RESET_INSTRUCTION\`)

EOF

echo "✅ Инструкция создана: $RESET_INSTRUCTION"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте файл: $RESET_INSTRUCTION"
echo "   2. Скопируйте инструкцию в Cursor"
echo "   3. После reset удалите файл: rm $RESET_INSTRUCTION"
echo ""
echo "💡 Это работает лучше, чем 'пожалуйста, сосредоточься'"


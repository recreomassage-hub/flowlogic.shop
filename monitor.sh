#!/bin/bash
# monitor.sh - Мониторинг LLM-OS

# Определяем корень проекта (где находится WORKFLOW_STATE.md)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Если запускаем из поддиректории, ищем корень проекта
while [ ! -f "$PROJECT_ROOT/WORKFLOW_STATE.md" ] && [ "$PROJECT_ROOT" != "/" ]; do
    PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done

cd "$PROJECT_ROOT" || exit 1

echo "📊 LLM-OS Мониторинг"
echo "==================="
echo "Время: $(date '+%H:%M:%S')"
echo "Директория: $PROJECT_ROOT"
echo ""

echo "🎭 Текущая роль:"
grep -i "current_role" WORKFLOW_STATE.md 2>/dev/null | head -1 | sed -E 's/.*[Cc]urrent[_\s]*[Rr]ole[:\s]*//' | sed 's/\*\*//g' | sed 's/^[:\s]*//' | sed 's/[:\s]*$//' || echo "Не найден"

echo ""
echo "📈 Прогресс:"
grep -i "выполнено" WORKFLOW_STATE.md 2>/dev/null | head -1 | sed 's/^[[:space:]]*//' || echo "Не найден"

echo ""
echo "❓ Вопросы:"
grep -A3 "open_questions:" WORKFLOW_STATE.md 2>/dev/null | tail -3 || echo "Нет вопросов"

echo ""
echo "📝 GIT СТАТУС:"
git status --short 2>/dev/null || echo "Git не инициализирован"



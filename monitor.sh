#!/bin/bash
# monitor.sh - Мониторинг LLM-OS

echo "📊 LLM-OS Мониторинг"
echo "==================="
echo "Время: $(date '+%H:%M:%S')"
echo ""

echo "🎭 Текущая роль:"
grep "current_role:" WORKFLOW_STATE.md 2>/dev/null || echo "Не найден"

echo ""
echo "📈 Прогресс:"
grep "выполнено:" WORKFLOW_STATE.md 2>/dev/null || echo "Не найден"

echo ""
echo "❓ Вопросы:"
grep -A3 "open_questions:" WORKFLOW_STATE.md 2>/dev/null | tail -3 || echo "Нет вопросов"

echo ""
echo "📝 GIT СТАТУС:"
git status --short 2>/dev/null || echo "Git не инициализирован"



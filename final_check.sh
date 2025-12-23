#!/bin/bash
echo "🎯 ФИНАЛЬНАЯ ПРОВЕРКА LLM-OS"
echo "==========================="

echo "1. Проверка файлов:"
echo "   WORKFLOW_STATE.md: $(wc -l < WORKFLOW_STATE.md) строк"
echo "   PROJECT_CONFIG.md: $(wc -l < PROJECT_CONFIG.md) строк"
echo "   step.sh: $(wc -l < step.sh) строк"
echo "   Всего скриптов: $(find . -name "*.sh" -type f | wc -l)"

echo ""
echo "2. Текущее состояние:"
if [ -f "WORKFLOW_STATE.md" ]; then
    echo "   Роль: $(grep -i "current_role" WORKFLOW_STATE.md | head -1 | cut -d':' -f2 | xargs)"
    echo "   Этап: $(grep -i "current_stage" WORKFLOW_STATE.md | head -1 | cut -d':' -f2 | xargs)"
    echo "   Обновлено: $(grep -i "last_update" WORKFLOW_STATE.md | head -1 | cut -d':' -f2 | xargs)"
else
    echo "   ❌ WORKFLOW_STATE.md не найден"
fi

echo ""
echo "3. Git статус:"
echo "   Ветка: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "   Коммитов: $(git log --oneline 2>/dev/null | wc -l)"
echo "   Последний коммит: $(git log --oneline -1 2>/dev/null || echo 'none')"
echo "   Remote: $(git remote -v 2>/dev/null | head -1 | cut -d' ' -f1-2 || echo 'не настроен')"

echo ""
echo "4. Готовность к работе:"
if [ -f "WORKFLOW_STATE.md" ] && [ -f "PROJECT_CONFIG.md" ] && [ -f "step.sh" ] && [ -d ".git" ]; then
    echo "✅ Система LLM-OS готова к работе!"
    echo ""
    echo "🎮 КОМАНДЫ:"
    echo "   ./step.sh          - Атомарный коммит"
    echo "   ./monitor.sh       - Мониторинг (отдельный терминал)"
    echo "   git push           - Отправить на GitHub"
    echo "   git log --oneline  - История коммитов"
else
    echo "❌ Система не полностью настроена"
fi

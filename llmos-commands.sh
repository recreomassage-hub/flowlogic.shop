#!/bin/bash
# llmos-commands.sh - Утилиты для управления LLM-OS

case "$1" in
    "start")
        echo "🚀 Запуск LLM-OS мониторинга"
        ./monitor.sh
        ;;
    "status")
        echo "📊 Статус системы:"
        grep -A1 "current_role:" WORKFLOW_STATE.md 2>/dev/null || echo "Не найден"
        grep -A1 "current_stage:" WORKFLOW_STATE.md 2>/dev/null || echo "Не найден"
        grep "выполнено:" WORKFLOW_STATE.md 2>/dev/null || echo "Не найден"
        ;;
    "commit")
        echo "💾 Выполнение коммита..."
        ./step.sh
        ;;
    "prompt")
        echo "📋 Копирование промпта..."
        if [ -f "./copy_prompt.sh" ]; then
            ./copy_prompt.sh
        else
            ./show_prompt.sh
        fi
        ;;
    "report")
        echo "📈 Генерация отчета..."
        if [ -f "./generate_report.py" ]; then
            python3 generate_report.py
        elif [ -f "./generate_report.sh" ]; then
            ./generate_report.sh
        else
            echo "❌ Скрипт отчета не найден"
        fi
        ;;
    "check")
        echo "🔍 Проверка системы..."
        ./check-linux.sh
        ;;
    "help")
        echo "🐧 LLM-OS Команды для Linux:"
        echo "  ./llmos start    - Запустить мониторинг"
        echo "  ./llmos status   - Показать статус"
        echo "  ./llmos commit   - Сделать коммит"
        echo "  ./llmos prompt   - Скопировать промпт"
        echo "  ./llmos report   - Сгенерировать отчет"
        echo "  ./llmos check    - Проверить систему"
        echo "  ./llmos help     - Показать эту справку"
        ;;
    *)
        echo "Используйте: ./llmos [start|status|commit|prompt|report|check|help]"
        ;;
esac



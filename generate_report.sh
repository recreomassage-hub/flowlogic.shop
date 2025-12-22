#!/bin/bash
# generate_report.sh - Отчет о прогрессе для Linux (bash version)

echo "📊 ОТЧЕТ О ПРОГРЕССЕ LLM-OS"
echo "=========================="
echo "Время: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Проверяем наличие файлов
[ -f "WORKFLOW_STATE.md" ] || { echo "❌ WORKFLOW_STATE.md не найден"; exit 1; }

# Парсим этапы
echo "📋 ЭТАПЫ ПРОЕКТА:"
echo ""

while IFS= read -r line; do
    # Ищем заголовки этапов
    if [[ $line =~ ^###\ .* ]]; then
        STAGE_NAME=$(echo "$line" | sed 's/^### //')
        echo "🎯 $STAGE_NAME"
        
        # Читаем следующие строки для этого этапа
        for i in {1..10}; do
            read -r next_line || break
            if [[ $next_line =~ \*\*статус\*\* ]]; then
                STATUS=$(echo "$next_line" | grep -o '\`.*\`' | tr -d '\`')
                echo "   Статус: $STATUS"
            fi
            if [[ $next_line =~ \*\*выполнено\*\* ]]; then
                PROGRESS=$(echo "$next_line" | sed 's/.*выполнено: //')
                echo "   Прогресс: $PROGRESS"
                
                # Парсим прогресс для визуализации
                DONE=$(echo "$PROGRESS" | cut -d'/' -f1)
                TOTAL=$(echo "$PROGRESS" | cut -d'/' -f2)
                if [[ $TOTAL -gt 0 ]]; then
                    PERCENT=$((DONE * 100 / TOTAL))
                    BARS=$((PERCENT / 10))
                    echo -n "   ["
                    for ((i=0; i<10; i++)); do
                        [[ $i -lt $BARS ]] && echo -n "█" || echo -n "░"
                    done
                    echo "] $PERCENT%"
                fi
            fi
        done
        echo ""
    fi
done < <(cat WORKFLOW_STATE.md)

# Считаем общую статистику
TOTAL_TASKS=$(grep -c "\[ \]\|\[x\]" WORKFLOW_STATE.md || echo "0")
DONE_TASKS=$(grep -c "\[x\]" WORKFLOW_STATE.md || echo "0")
OPEN_QUESTIONS=$(grep -c "open_questions:" WORKFLOW_STATE.md || echo "0")

echo "📈 ОБЩАЯ СТАТИСТИКА:"
echo "   Всего задач: $TOTAL_TASKS"
echo "   Выполнено: $DONE_TASKS"
echo "   Открытых вопросов: $OPEN_QUESTIONS"
echo ""
echo "🚀 РЕКОМЕНДАЦИИ:"
if [[ $DONE_TASKS -eq 0 ]]; then
    echo "   Начните работу с этапа requirements"
elif [[ $OPEN_QUESTIONS -gt 0 ]]; then
    echo "   Проверьте open_questions в WORKFLOW_STATE.md"
else
    echo "   Продолжайте в том же духе!"
fi



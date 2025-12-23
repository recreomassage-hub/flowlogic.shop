#!/bin/bash
# Quick Commands - Шпаргалка по LLM-OS

echo "🎮 LLM-OS v1.0 Quick Commands"
echo "=============================="

cat << 'CMDS'
🧠 СИСТЕМНЫЕ КОМАНДЫ:
  ./step.sh              - Атомарный коммит + отчет
  ./generate_report.sh   - Анализ прогресса
  git log --oneline -10  - История изменений

🎭 УПРАВЛЕНИЕ РОЛЯМИ:
  grep "current_role:" WORKFLOW_STATE.md
  grep "current_stage:" WORKFLOW_STATE.md
  grep "status:" WORKFLOW_STATE.md | head -3

📊 МОНИТОРИНГ:
  grep "выполнено:" WORKFLOW_STATE.md
  grep -c "\[x\]" WORKFLOW_STATE.md
  grep -c "\[ \]" WORKFLOW_STATE.md

🔄 СМЕНА ЭТАПОВ:
  # Переключить на следующую роль
  sed -i "s/current_role:.*/current_role: ARCHITECT/" WORKFLOW_STATE.md
  sed -i "s/current_stage:.*/current_stage: architecture/" WORKFLOW_STATE.md
  sed -i "s/status:.*/status: IN_PROGRESS/" WORKFLOW_STATE.md

🚨 АВАРИЙНЫЕ КОМАНДЫ:
  git status             - Проверить изменения
  git diff               - Посмотреть diff
  git checkout -- .      - Откатить все изменения
  git log --oneline -5   - Последние коммиты

💡 ПРОМПТЫ:
  # Старт ANALYST
  "Активируй LLM-OS. Проверь контекст и начни этап requirements."
  
  # Передача ARCHITECT
  "Этап requirements завершен. Переключись на ARCHITECT и начни проектирование."
  
  # Проверка состояния
  "Покажи текущий статус проекта. Что сделано, что в процессе?"
CMDS



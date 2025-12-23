#!/bin/bash
# setup_workflow.sh - Инициализация LLM-OS v1.0

echo "🧠 LLM-OS v1.0: Инициализация системы"
echo "===================================="

# Создаем структуру
mkdir -p {ROLES,docs,infra,src,.cursor/rules,.templates,reports}
mkdir -p docs/{requirements,architecture,api,planning,decisions,testing}
mkdir -p infra/{docker,kubernetes,terraform,ci-cd}
mkdir -p src/{backend,frontend,shared}
mkdir -p docs/architecture/adr

echo "✅ Структура создана"

# Инициализируем Git если еще не инициализирован
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git инициализирован"
fi

echo ""
echo "🎉 LLM-OS v1.0 УСПЕШНО ИНИЦИАЛИЗИРОВАНА!"
echo ""
echo "📁 Структура проекта:"
ls -la
echo ""
echo "🚀 Следующие шаги:"
echo "1. git add . && git commit -m '🚀 LLM-OS v1.0 initialized'"
echo "2. Откройте проект в Cursor"
echo "3. Начните работу с ANALYST"



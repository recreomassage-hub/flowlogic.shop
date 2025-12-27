#!/bin/bash

# 📋 SETUP WORKFLOW - Инициализация базовой структуры проекта
# Использование: ./scripts/setup_workflow.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "📋 SETUP WORKFLOW: Инициализация базовой структуры"
echo ""

# Проверка структуры проекта
echo "1. Проверка структуры проекта..."
if [ ! -f "PROJECT_CONFIG.md" ]; then
    echo "   ⚠️  PROJECT_CONFIG.md не найден"
else
    echo "   ✅ PROJECT_CONFIG.md найден"
fi

if [ ! -f "WORKFLOW_STATE.md" ]; then
    echo "   ⚠️  WORKFLOW_STATE.md не найден"
else
    echo "   ✅ WORKFLOW_STATE.md найден"
fi

if [ ! -f "SCENARIO_STATE.yml" ]; then
    echo "   ⚠️  SCENARIO_STATE.yml не найден"
else
    echo "   ✅ SCENARIO_STATE.yml найден"
fi

# Инициализация git (если не инициализирован)
echo ""
echo "2. Проверка git..."
if [ ! -d ".git" ]; then
    echo "   ⚠️  Git не инициализирован"
    echo "   💡 Запустите: git init"
else
    echo "   ✅ Git инициализирован"
fi

# Создание базовых директорий
echo ""
echo "3. Проверка базовых директорий..."
for dir in "docs" "scripts" "scenarios"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "   ✅ Создана директория: $dir"
    else
        echo "   ✅ Директория существует: $dir"
    fi
done

echo ""
echo "✅ Базовая структура проверена/создана"


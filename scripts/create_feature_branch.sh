#!/bin/bash
# create_feature_branch.sh - Создание feature ветки для этапа LLM-OS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

STAGE=$1
if [ -z "$STAGE" ]; then
    echo "❌ Укажите название этапа"
    echo "Использование: ./scripts/create_feature_branch.sh <stage>"
    echo ""
    echo "Примеры:"
    echo "  ./scripts/create_feature_branch.sh requirements"
    echo "  ./scripts/create_feature_branch.sh architecture"
    echo "  ./scripts/create_feature_branch.sh backend"
    exit 1
fi

# Проверяем, что develop ветка существует
if ! git show-ref --verify --quiet refs/heads/develop; then
    echo "⚠️  Ветка develop не найдена"
    echo "📋 Создаю develop ветку из main..."
    
    # Создаем develop из main
    git checkout main 2>/dev/null || git checkout -b main
    git checkout -b develop
    git push -u origin develop 2>/dev/null || echo "⚠️  Не удалось создать develop на remote (создайте вручную)"
    
    echo "✅ Ветка develop создана"
    echo ""
fi

# Переходим на develop и обновляем
echo "🔄 Переход на develop..."
git checkout develop
git pull origin develop 2>/dev/null || echo "⚠️  Не удалось обновить develop (возможно, ветка новая)"

# Создаем feature ветку
BRANCH_NAME="feat/$STAGE"
echo "🌿 Создание feature ветки: $BRANCH_NAME"

if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
    echo "⚠️  Ветка $BRANCH_NAME уже существует"
    read -p "Переключиться на существующую ветку? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        git checkout "$BRANCH_NAME"
        echo "✅ Переключено на $BRANCH_NAME"
    else
        echo "❌ Отменено"
        exit 1
    fi
else
    git checkout -b "$BRANCH_NAME"
    echo "✅ Создана ветка: $BRANCH_NAME"
fi

# Обновляем WORKFLOW_STATE.md
if [ -f "WORKFLOW_STATE.md" ]; then
    if grep -q "^git_branch:" WORKFLOW_STATE.md; then
        sed -i "s|^git_branch:.*|git_branch: $BRANCH_NAME|" WORKFLOW_STATE.md
    else
        # Добавляем git_branch если его нет
        sed -i "/^git_branch:/a\git_branch: $BRANCH_NAME" WORKFLOW_STATE.md 2>/dev/null || \
        echo "git_branch: $BRANCH_NAME" >> WORKFLOW_STATE.md
    fi
    echo "✅ WORKFLOW_STATE.md обновлен: git_branch: $BRANCH_NAME"
fi

echo ""
echo "✅ Готово! Вы на ветке: $BRANCH_NAME"
echo "📋 Следующий шаг: ./step.sh (коммиты будут пушиться в $BRANCH_NAME)"




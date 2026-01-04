#!/bin/bash
# merge_to_develop.sh - Merge feature ветки в develop

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ -z "$CURRENT_BRANCH" ]; then
    echo "❌ Не удалось определить текущую ветку"
    exit 1
fi

# Проверяем, что мы на feature ветке
if [[ ! "$CURRENT_BRANCH" == feat/* ]]; then
    echo "⚠️  Вы не на feature ветке (текущая: $CURRENT_BRANCH)"
    echo "   Этот скрипт предназначен для merge feature веток в develop"
    read -p "   Продолжить? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Отменено"
        exit 1
    fi
fi

# Проверяем, что develop существует
if ! git show-ref --verify --quiet refs/heads/develop; then
    echo "❌ Ветка develop не найдена"
    echo "   Создайте её: git checkout -b develop"
    exit 1
fi

# Проверяем, что нет незакоммиченных изменений
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Есть незакоммиченные изменения"
    echo "   Закоммитьте их перед merge: ./step.sh"
    exit 1
fi

echo "🔄 Merge $CURRENT_BRANCH → develop"
echo ""

# Переходим на develop
echo "1. Переход на develop..."
git checkout develop
git pull origin develop 2>/dev/null || echo "⚠️  Не удалось обновить develop"

# Merge feature ветки
echo "2. Merge $CURRENT_BRANCH..."
git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH into develop [LLM-OS]"

if [ $? -eq 0 ]; then
    echo "✅ Merge успешен"
    
    # Push в develop
    echo "3. Push в develop..."
    git push origin develop 2>/dev/null && echo "✅ Pushed to origin/develop" || echo "⚠️  Push failed"
    
    # Предлагаем удалить feature ветку
    echo ""
    read -p "Удалить feature ветку $CURRENT_BRANCH? (yes/no): " delete_confirm
    if [ "$delete_confirm" = "yes" ]; then
        git branch -d "$CURRENT_BRANCH" 2>/dev/null && echo "✅ Локальная ветка удалена" || echo "⚠️  Не удалось удалить локальную ветку"
        git push origin --delete "$CURRENT_BRANCH" 2>/dev/null && echo "✅ Remote ветка удалена" || echo "⚠️  Не удалось удалить remote ветку"
    fi
    
    echo ""
    echo "✅ Готово! $CURRENT_BRANCH merged into develop"
else
    echo "❌ Merge failed. Разрешите конфликты вручную"
    exit 1
fi



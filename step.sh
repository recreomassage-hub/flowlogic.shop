#!/usr/bin/env bash
# step.sh - Атомарный коммит для LLM-OS

# Определяем корень проекта (где находится step.sh)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 LLM-OS: Подготовка коммита..."
echo "================================="

# Проверяем что WORKFLOW_STATE.md существует
if [ ! -f "WORKFLOW_STATE.md" ]; then
    echo "❌ Ошибка: WORKFLOW_STATE.md не найден в $SCRIPT_DIR"
    exit 1
fi

# Получаем текущие метрики из WORKFLOW_STATE.md
ROLE=$(grep -i "current_role:" WORKFLOW_STATE.md | head -1 | cut -d':' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
STAGE=$(grep -i "current_stage:" WORKFLOW_STATE.md | head -1 | cut -d':' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

# Если не нашли, используем значения по умолчанию
[ -z "$ROLE" ] && ROLE="ANALYST"
[ -z "$STAGE" ] && STAGE="requirements"

TIMESTAMP=$(date +"%H:%M:%S")
ISO_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🔍 Текущее состояние:"
echo "   Роль: $ROLE"
echo "   Этап: $STAGE"
echo "   Время: $TIMESTAMP"

# Обновляем дату в WORKFLOW_STATE.md
sed -i "s/last_update:.*/last_update: $ISO_TIMESTAMP/" WORKFLOW_STATE.md
echo "✅ WORKFLOW_STATE.md обновлен"

# Проверяем есть ли изменения для коммита
if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
    echo "⚠️ Нет изменений для коммита"
    echo "💡 Совет: Сначала выполните какую-то работу, затем запустите ./step.sh"
    
    # Но все равно делаем коммит с обновлением даты
    git add WORKFLOW_STATE.md
    COMMIT_MSG="[SYSTEM] Обновление времени @$TIMESTAMP"
    git commit -m "$COMMIT_MSG" 2>/dev/null
    echo "💾 Коммит даты: $COMMIT_MSG"
else
    # Создаем сообщение коммита
    COMMIT_MSG="[$ROLE] $STAGE @$TIMESTAMP"
    
    echo "💾 Коммит: $COMMIT_MSG"
    git add .
    git commit -m "$COMMIT_MSG" 2>/dev/null
fi

# Автоопределение правильного remote
REMOTE=$(git remote get-url flowlogic 2>/dev/null || echo "origin")

# Определяем текущую ветку
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Безопасный push в зависимости от ветки
if [[ "$CURRENT_BRANCH" == feat/* ]]; then
    # Feature ветка → push в feature ветку
    git push "$REMOTE" "$CURRENT_BRANCH" 2>/dev/null && echo "✅ Pushed to $REMOTE/$CURRENT_BRANCH" || echo "⚠️ Push failed (возможно, нет прав или нет сети)"
elif [[ "$CURRENT_BRANCH" == "develop" ]]; then
    # Develop ветка → push в develop
    git push "$REMOTE" develop 2>/dev/null && echo "✅ Pushed to $REMOTE/develop" || echo "⚠️ Push failed (возможно, нет прав или нет сети)"
elif [[ "$CURRENT_BRANCH" == "main" ]]; then
    # Main ветка → только после явного подтверждения (production-ready код)
    echo "⚠️  ВНИМАНИЕ: Вы на ветке main!"
    echo "   Убедитесь, что это production-ready код."
    echo "   Рекомендуется использовать develop для разработки."
    read -p "   Продолжить push в main? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        git push "$REMOTE" main 2>/dev/null && echo "✅ Pushed to $REMOTE/main" || echo "⚠️ Push failed"
    else
        echo "❌ Push отменен. Переключитесь на develop: git checkout develop"
    fi
else
    # Другие ветки → push в текущую ветку
    git push "$REMOTE" "$CURRENT_BRANCH" 2>/dev/null && echo "✅ Pushed to $REMOTE/$CURRENT_BRANCH" || echo "⚠️ Push failed (возможно, нет прав или нет сети)"
fi

echo ""
echo "✅ Коммит выполнен!"
echo "📊 Статистика:"
git log --oneline -5 2>/dev/null || echo "   (история недоступна)"

# Показываем текущий прогресс если есть
if grep -q "выполнено:" WORKFLOW_STATE.md; then
    echo ""
    echo "📈 Прогресс текущего этапа:"
    grep "выполнено:" WORKFLOW_STATE.md | head -1
fi

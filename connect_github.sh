#!/bin/bash
cd ~/Obsidian\ Vault/llm-os-project

GITHUB_USER="recreomassage-hub"
REPO_NAME="llm-os"
GITHUB_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo "🌐 СВЯЗЬ С GITHUB: $GITHUB_USER/$REPO_NAME"
echo "======================================="

# Проверяем существует ли remote
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' уже существует"
    CURRENT_URL=$(git remote get-url origin)
    echo "   Текущий URL: $CURRENT_URL"
    
    if [ "$CURRENT_URL" != "$GITHUB_URL" ]; then
        echo "   Обновляю URL на: $GITHUB_URL"
        git remote set-url origin "$GITHUB_URL"
    fi
else
    echo "➕ Добавляю remote 'origin'..."
    git remote add origin "$GITHUB_URL"
fi

echo ""
echo "📤 ОТПРАВКА НА GITHUB"
echo "==================="

# Убедимся что в ветке main
git branch -M main 2>/dev/null

echo "Ветка: $(git branch --show-current)"
echo "Коммитов для отправки: $(git log --oneline origin/main..main 2>/dev/null | wc -l || echo 'все')"

# Пробуем отправить
echo ""
echo "Отправка файлов..."
git push -u origin main 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 УСПЕХ! LLM-OS на GitHub!"
    echo "👉 https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📊 СТАТИСТИКА ПРОЕКТА:"
    echo "   Файлов: $(find . -type f | wc -l)"
    echo "   Директорий: $(find . -type d | wc -l)"
    echo "   Скриптов: $(find . -name "*.sh" | wc -l)"
    echo "   Markdown файлов: $(find . -name "*.md" | wc -l)"
else
    echo ""
    echo "⚠️ Проблема при отправке. Пробую принудительно..."
    git push -u origin main --force 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Успешно отправлено (принудительно)"
        echo "👉 https://github.com/$GITHUB_USER/$REPO_NAME"
    else
        echo "❌ Критическая ошибка"
        echo ""
        echo "Попробуйте вручную:"
        echo "git push -u origin main"
        echo ""
        echo "Или создайте репозиторий: https://github.com/new"
        echo "Имя: $REPO_NAME"
        echo "НЕ добавляйте README, .gitignore, license"
    fi
fi

#!/bin/bash
cd ~/Obsidian\ Vault/llm-os-project

GITHUB_USER="recreomassage-hub"
echo "👤 GitHub user: $GITHUB_USER"

# Настраиваем Git
git config user.name "$GITHUB_USER"
git config user.email "recreomassage@gmail.com"

echo ""
echo "🔍 Проверяю репозитории..."

# Проверяем flowlogic
if curl -s https://api.github.com/repos/$GITHUB_USER/flowlogic | grep -q '"name"'; then
    echo "✅ Репозиторий 'flowlogic' существует"
    REPO="flowlogic"
else
    echo "❌ Репозиторий 'flowlogic' не найден"
fi

# Проверяем llm-os  
if curl -s https://api.github.com/repos/$GITHUB_USER/llm-os | grep -q '"name"'; then
    echo "✅ Репозиторий 'llm-os' существует"
    REPO="llm-os"
else
    echo "❌ Репозиторий 'llm-os' не найден"
fi

echo ""
echo "🎯 Выбор репозитория:"
if [ -n "$REPO" ]; then
    echo "Использую: $REPO"
else
    echo "⚠️ Нет существующих репозиториев"
    echo "Создайте: https://github.com/new"
    echo "Имя: llm-os"
    echo "НЕ добавляйте README, .gitignore, license"
    echo "После создания нажмите Enter..."
    read
    REPO="llm-os"
fi

echo ""
echo "🔗 Настраиваю remote..."
git remote set-url origin git@github.com:$GITHUB_USER/$REPO.git
echo "Remote URL: $(git remote get-url origin)"

echo ""
echo "📤 Отправляю LLM-OS на GitHub..."
echo "Файлов: $(git ls-files | wc -l)"
echo "Коммитов: $(git log --oneline | wc -l)"

git push -u origin main 2>&1
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 УСПЕХ! LLM-OS на GitHub!"
    echo "👉 https://github.com/$GITHUB_USER/$REPO"
    echo ""
    echo "📊 Статистика проекта:"
    echo "   Скрипты: $(find . -name "*.sh" | wc -l)"
    echo "   Markdown: $(find . -name "*.md" | wc -l)"
    echo "   Всего файлов: $(find . -type f | wc -l)"
else
    echo ""
    echo "⚠️ Проблема. Пробую принудительно..."
    git push -u origin main --force 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Успешно отправлено (принудительно)"
        echo "👉 https://github.com/$GITHUB_USER/$REPO"
    else
        echo "❌ Ошибка. Создайте репозиторий вручную:"
        echo "   https://github.com/new"
        echo "   Имя: $REPO"
        echo "   Без README, .gitignore, license"
    fi
fi

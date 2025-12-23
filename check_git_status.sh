#!/bin/bash
echo "🔍 ПРОВЕРКА СОСТОЯНИЯ GIT"
echo "========================"

echo "1. Текущая папка:"
pwd

echo ""
echo "2. Корень Git репозитория:"
ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ $ROOT"
else
    echo "❌ Не Git репозиторий"
fi

echo ""
echo "3. Статус Git:"
git status 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Git не инициализирован здесь"
fi

echo ""
echo "4. История коммитов:"
git log --oneline 2>/dev/null | head -5
if [ $? -ne 0 ]; then
    echo "❌ Нет истории"
fi

echo ""
echo "5. Remote репозитории:"
git remote -v 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Нет remote"
fi

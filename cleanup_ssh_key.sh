#!/bin/bash
# cleanup_ssh_key.sh - Скрипт для удаления SSH ключа из истории Git

set -e

echo "🔒 Очистка истории Git от SSH ключа"
echo "===================================="
echo ""

# Проверяем наличие git-filter-repo
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo не установлен"
    echo ""
    echo "Установите git-filter-repo:"
    echo "  Ubuntu/Debian: sudo apt install git-filter-repo"
    echo "  macOS: brew install git-filter-repo"
    echo "  Или: pip install git-filter-repo"
    echo ""
    exit 1
fi

# Имя файла с ключом
KEY_FILE='eval "$(ssh-agent -s)"'

echo "⚠️  ВНИМАНИЕ: Этот скрипт удалит файл '$KEY_FILE' из всей истории Git"
echo "   Это действие необратимо!"
echo ""
read -p "Продолжить? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Отменено"
    exit 1
fi

# Создаем backup
echo "📦 Создание backup..."
BACKUP_DIR=".git_backup_$(date +%Y%m%d_%H%M%S)"
cp -r .git "$BACKUP_DIR"
echo "✅ Backup создан: $BACKUP_DIR"

# Удаляем файл из истории
echo ""
echo "🧹 Удаление файла из истории Git..."
git filter-repo --invert-paths --path "$KEY_FILE" --force

echo ""
echo "✅ Файл удален из истории Git"
echo ""
echo "📤 Следующий шаг: Force push в remote"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "⚠️  ВНИМАНИЕ: Force push перезапишет историю на GitHub!"
echo "   Убедитесь, что все участники проекта знают об этом."
echo ""
read -p "Выполнить force push сейчас? (yes/no): " -r
echo

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    REMOTE=$(git remote get-url flowlogic 2>/dev/null || git remote get-url origin 2>/dev/null || echo "origin")
    echo "📤 Отправка в $REMOTE..."
    git push "$REMOTE" --force --all
    git push "$REMOTE" --force --tags
    echo "✅ История обновлена на GitHub"
else
    echo "ℹ️  Force push не выполнен. Выполните вручную:"
    echo "   git push origin --force --all"
    echo "   git push origin --force --tags"
fi

echo ""
echo "✅ Очистка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Отзовите скомпрометированный SSH ключ из GitHub"
echo "2. Удалите ключ из всех серверов"
echo "3. Сгенерируйте новый SSH ключ"
echo "4. Добавьте новый ключ в GitHub"
echo ""
echo "📚 Подробнее: SECURITY_FIX.md"





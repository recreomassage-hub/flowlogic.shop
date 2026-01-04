#!/bin/bash
# setup_pre_commit.sh - Настройка pre-commit hook для проверки секретов

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
PRE_COMMIT_HOOK="$GIT_HOOKS_DIR/pre-commit"
SECRETS_CHECK_SCRIPT="$PROJECT_ROOT/scripts/pre-commit-secrets-check.sh"

echo "🔒 Настройка pre-commit hook для проверки секретов..."
echo ""

# Проверяем, что мы в Git репозитории
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo "❌ Ошибка: .git директория не найдена. Это не Git репозиторий."
    exit 1
fi

# Проверяем наличие скрипта проверки секретов
if [ ! -f "$SECRETS_CHECK_SCRIPT" ]; then
    echo "❌ Ошибка: Скрипт проверки секретов не найден: $SECRETS_CHECK_SCRIPT"
    exit 1
fi

# Создаем директорию hooks, если не существует
mkdir -p "$GIT_HOOKS_DIR"

# Создаем pre-commit hook
cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/bash
# Pre-commit hook для проверки секретов

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Запускаем проверку секретов
"$PROJECT_ROOT/scripts/pre-commit-secrets-check.sh"

# Если проверка провалилась, блокируем коммит
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Коммит заблокирован из-за обнаруженных секретов."
    echo "   Исправьте проблемы и попробуйте снова."
    exit 1
fi
EOF

# Делаем hook исполняемым
chmod +x "$PRE_COMMIT_HOOK"

echo "✅ Pre-commit hook установлен: $PRE_COMMIT_HOOK"
echo ""
echo "📋 Hook будет автоматически проверять:"
echo "   • .env файлы в staged"
echo "   • Реальные токены и ключи (GitHub PAT, AWS Keys, Stripe keys)"
echo "   • Подозрительные паттерны (password, secret, api_key)"
echo "   • AWS credentials"
echo "   • Stripe keys"
echo ""
echo "✅ Готово! Теперь каждый коммит будет проверяться на секреты."




#!/bin/bash
# launch-llmos.sh - Запуск LLM-OS в tmux

echo "🐧 Запуск LLM-OS в tmux..."

# Проверяем наличие tmux
if ! command -v tmux &> /dev/null; then
    echo "⚠️ tmux не установлен"
    echo "Установите: sudo apt install tmux"
    echo ""
    echo "Альтернатива: запустите ./monitor.sh в отдельном терминале"
    exit 1
fi

# Создаем сессию tmux
tmux new-session -d -s llmos

# Окно 0: Мониторинг
tmux rename-window -t llmos:0 'Monitor'
tmux send-keys -t llmos:0 './monitor.sh' C-m

# Окно 1: Работа с Cursor
tmux new-window -t llmos:1 -n 'Cursor'
tmux send-keys -t llmos:1 'echo "Откройте Cursor в этой директории"' C-m
tmux send-keys -t llmos:1 'echo "Используйте промпт из show_prompt.sh"' C-m

# Окно 2: Управление
tmux new-window -t llmos:2 -n 'Control'
tmux send-keys -t llmos:2 './llmos-commands.sh help' C-m

# Окно 3: Git
tmux new-window -t llmos:3 -n 'Git'
tmux send-keys -t llmos:3 'git log --oneline -10' C-m

# Присоединяемся к сессии
echo "✅ Сессия tmux создана"
echo "Команды для управления:"
echo "  tmux attach -t llmos  # Подключиться"
echo "  Ctrl+b, 0-3           # Переключить окно"
echo "  Ctrl+b, d             # Отключиться"
echo ""
echo "Запуск: tmux attach -t llmos"



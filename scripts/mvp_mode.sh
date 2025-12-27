#!/bin/bash

# 🧨 MVP MODE - Overengineering Kill Switch
# Использование: ./scripts/mvp_mode.sh [on|off]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

ACTION="${1:-on}"

if [ "$ACTION" = "on" ]; then
  echo "🧨 MVP MODE: ON"
  echo ""
  
  # Обновляем PROJECT_CONFIG.md
  if ! grep -q "constraints:" PROJECT_CONFIG.md; then
    cat >> PROJECT_CONFIG.md <<EOF

## 🧨 ОГРАНИЧЕНИЯ СЛОЖНОСТИ

constraints:
  complexity_budget: LOW
  mvp_mode: true
  max_services: 1
  max_databases: 1
  async_allowed: false
  patterns_forbidden:
    - Event Sourcing
    - CQRS
    - Microservices
    - Kubernetes
    - Service Mesh
EOF
    echo "✅ PROJECT_CONFIG.md обновлен"
  fi
  
  # Создаем инструкцию
  INSTRUCTION=".mvp_mode_instruction.md"
  cat > "$INSTRUCTION" <<EOF
# 🧨 MVP MODE: ON

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

---

## ⚠️ ИНСТРУКЦИЯ ДЛЯ CURSOR

**Скопируйте и вставьте в Cursor:**

\`\`\`
MVP MODE ON.

Ограничения:
- 1 сервис
- 1 БД
- без асинхронщины
- без Event Sourcing
- без CQRS
- без Kubernetes

Перепроектируй решение с учетом этих ограничений.
\`\`\`

---

## 📋 ОГРАНИЧЕНИЯ

- **Сервисы:** максимум 1
- **Базы данных:** максимум 1
- **Асинхронность:** запрещена
- **Паттерны:** только простые (MVC, Repository)

---

**После применения:** Удалите этот файл (\`rm $INSTRUCTION\`)

EOF
  
  echo "✅ Инструкция создана: $INSTRUCTION"
  echo ""
  echo "📋 Следующие шаги:"
  echo "   1. Откройте файл: $INSTRUCTION"
  echo "   2. Скопируйте инструкцию в Cursor"
  echo "   3. После применения удалите файл: rm $INSTRUCTION"
  
elif [ "$ACTION" = "off" ]; then
  echo "🧨 MVP MODE: OFF"
  echo ""
  
  # Удаляем ограничения из PROJECT_CONFIG.md
  if grep -q "constraints:" PROJECT_CONFIG.md; then
    sed -i '/^## 🧨 ОГРАНИЧЕНИЯ СЛОЖНОСТИ/,/^EOF$/d' PROJECT_CONFIG.md || true
    echo "✅ Ограничения удалены из PROJECT_CONFIG.md"
  fi
  
  echo "✅ MVP MODE отключен"
else
  echo "Использование: ./scripts/mvp_mode.sh [on|off]"
  exit 1
fi


#!/bin/bash

# 🤝 PARALLEL ROLES - Fork Workflow State для параллельной работы
# Использование: ./scripts/parallel_roles.sh [role1] [role2] [scope1] [scope2]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

ROLE1="${1:-BACKEND_DEV}"
ROLE2="${2:-FRONTEND_DEV}"
SCOPE1="${3:-src/backend}"
SCOPE2="${4:-src/frontend}"

echo "🤝 PARALLEL ROLES: Создание параллельных workflow"
echo "   Роль 1: $ROLE1 (scope: $SCOPE1)"
echo "   Роль 2: $ROLE2 (scope: $SCOPE2)"
echo ""

# Создаем директорию для параллельных состояний
mkdir -p .parallel_workflows

# Копируем WORKFLOW_STATE.md
cp WORKFLOW_STATE.md ".parallel_workflows/WORKFLOW_STATE_${ROLE1}.md"
cp WORKFLOW_STATE.md ".parallel_workflows/WORKFLOW_STATE_${ROLE2}.md"

# Обновляем первый workflow
sed -i "s/^current_role:.*/current_role: $ROLE1/" ".parallel_workflows/WORKFLOW_STATE_${ROLE1}.md"
sed -i "/^parallel_scope:/d" ".parallel_workflows/WORKFLOW_STATE_${ROLE1}.md"
echo "parallel_scope: $SCOPE1" >> ".parallel_workflows/WORKFLOW_STATE_${ROLE1}.md"

# Обновляем второй workflow
sed -i "s/^current_role:.*/current_role: $ROLE2/" ".parallel_workflows/WORKFLOW_STATE_${ROLE2}.md"
sed -i "/^parallel_scope:/d" ".parallel_workflows/WORKFLOW_STATE_${ROLE2}.md"
echo "parallel_scope: $SCOPE2" >> ".parallel_workflows/WORKFLOW_STATE_${ROLE2}.md"

# Создаем инструкцию
INSTRUCTION=".parallel_roles_instruction.md"
cat > "$INSTRUCTION" <<EOF
# 🤝 PARALLEL ROLES: Инструкция

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

---

## 📋 СОЗДАННЫЕ WORKFLOW

1. **$ROLE1** → \`.parallel_workflows/WORKFLOW_STATE_${ROLE1}.md\`
   - Scope: $SCOPE1
   - Не имеет права менять: $SCOPE2

2. **$ROLE2** → \`.parallel_workflows/WORKFLOW_STATE_${ROLE2}.md\`
   - Scope: $SCOPE2
   - Не имеет права менять: $SCOPE1

---

## ⚠️ ПРАВИЛА

1. **Каждый агент работает только в своем scope**
2. **Изменения в чужом scope требуют арбитража**
3. **Перед merge проверьте конфликты**

---

## 🔧 ИСПОЛЬЗОВАНИЕ

### Для $ROLE1:
\`\`\`
Используй: .parallel_workflows/WORKFLOW_STATE_${ROLE1}.md
Scope: $SCOPE1
Запрещено менять: $SCOPE2
\`\`\`

### Для $ROLE2:
\`\`\`
Используй: .parallel_workflows/WORKFLOW_STATE_${ROLE2}.md
Scope: $SCOPE2
Запрещено менять: $SCOPE1
\`\`\`

---

**После завершения:** Объедините изменения и удалите .parallel_workflows/

EOF

echo "✅ Параллельные workflow созданы"
echo "✅ Инструкция: $INSTRUCTION"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте инструкцию: $INSTRUCTION"
echo "   2. Используйте соответствующий WORKFLOW_STATE для каждой роли"
echo "   3. После завершения объедините изменения"



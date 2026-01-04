#!/bin/bash

# 🔄 ROLLBACK STAGE - Контролируемый откат этапа
# Использование: ./scripts/rollback_stage.sh [commit_hash] [reason]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

COMMIT_HASH="${1}"
REASON="${2:-Invalid assumptions detected}"

if [ -z "$COMMIT_HASH" ]; then
  echo "📋 Последние 10 коммитов:"
  git log --oneline -10
  echo ""
  echo "Использование: ./scripts/rollback_stage.sh <commit_hash> [reason]"
  exit 1
fi

# Проверяем, что коммит существует
if ! git cat-file -e "$COMMIT_HASH" 2>/dev/null; then
  echo "❌ Ошибка: коммит $COMMIT_HASH не найден"
  exit 1
fi

echo "🔄 ROLLBACK: Откат к коммиту $COMMIT_HASH"
echo "📋 Причина: $REASON"
echo ""

# Создаем backup текущего состояния
BACKUP_DIR=".rollback_backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp WORKFLOW_STATE.md "$BACKUP_DIR/"
cp PROJECT_CONFIG.md "$BACKUP_DIR/" 2>/dev/null || true

echo "💾 Backup создан: $BACKUP_DIR"
echo ""

# Обновляем WORKFLOW_STATE.md
CURRENT_STAGE=$(grep -E '^current_stage:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')
CURRENT_ROLE=$(grep -E '^current_role:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')

# Создаем запись о rollback
ROLLBACK_LOG="docs/rollbacks/rollback_$(date +%Y%m%d_%H%M%S).md"
mkdir -p "$(dirname "$ROLLBACK_LOG")"

cat > "$ROLLBACK_LOG" <<EOF
# 🔄 Rollback Log

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Коммит:** $COMMIT_HASH
**Этап:** $CURRENT_STAGE
**Роль:** $CURRENT_ROLE
**Причина:** $REASON

---

## 📋 Детали отката

**До отката:**
- Stage: $CURRENT_STAGE
- Role: $CURRENT_ROLE
- Commit: $(git rev-parse HEAD)

**После отката:**
- Commit: $COMMIT_HASH

---

## ⚠️ СЛЕДУЮЩИЕ ШАГИ

1. Проверьте изменения:
   \`\`\`bash
   git diff $COMMIT_HASH HEAD
   \`\`\`

2. Выполните откат:
   \`\`\`bash
   git checkout $COMMIT_HASH
   \`\`\`

3. Обновите WORKFLOW_STATE.md:
   \`\`\`
   status: REWORK
   reason: "$REASON"
   \`\`\`

4. В Cursor запустите:
   \`\`\`
   ROLE: $CURRENT_ROLE
   Мы откатились к коммиту $COMMIT_HASH.
   Причина: $REASON
   Пересобери этап с учетом исправлений.
   \`\`\`

EOF

echo "✅ Rollback log создан: $ROLLBACK_LOG"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Проверьте изменения: git diff $COMMIT_HASH HEAD"
echo "   2. Выполните откат: git checkout $COMMIT_HASH"
echo "   3. Обновите WORKFLOW_STATE.md (status: REWORK)"
echo "   4. Запустите роль заново в Cursor"



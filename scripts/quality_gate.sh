#!/bin/bash

# 🔍 QUALITY GATE - Аудит качества этапа перед передачей следующей роли
# Использование: ./scripts/quality_gate.sh [stage_name]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

STAGE_NAME="${1:-$(grep -E '^current_stage:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')}"
CURRENT_ROLE=$(grep -E '^current_role:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')

echo "🔍 QUALITY GATE: Аудит этапа '$STAGE_NAME'"
echo "📋 Текущая роль: $CURRENT_ROLE"
echo ""

# Создаем отчет
REPORT_FILE="docs/quality_gates/${STAGE_NAME}_audit_$(date +%Y%m%d_%H%M%S).md"
mkdir -p "$(dirname "$REPORT_FILE")"

cat > "$REPORT_FILE" <<EOF
# 🔍 Quality Gate Audit: $STAGE_NAME

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Роль:** $CURRENT_ROLE
**Этап:** $STAGE_NAME

---

## 📋 ПРОВЕРКИ

### 1. Артефакты этапа

EOF

# Проверяем артефакты этапа
case "$STAGE_NAME" in
  requirements|1.1*)
    echo "### Требования (Requirements)" >> "$REPORT_FILE"
    [ -f "docs/requirements/PRD.md" ] && echo "- [x] PRD.md существует" >> "$REPORT_FILE" || echo "- [ ] PRD.md отсутствует" >> "$REPORT_FILE"
    [ -f "docs/requirements/user_stories.md" ] && echo "- [x] user_stories.md существует" >> "$REPORT_FILE" || echo "- [ ] user_stories.md отсутствует" >> "$REPORT_FILE"
    [ -f "docs/requirements/glossary.md" ] && echo "- [x] glossary.md существует" >> "$REPORT_FILE" || echo "- [ ] glossary.md отсутствует" >> "$REPORT_FILE"
    ;;
  architecture|2.1*)
    echo "### Архитектура (Architecture)" >> "$REPORT_FILE"
    [ -f "docs/architecture/tech_stack.md" ] && echo "- [x] tech_stack.md существует" >> "$REPORT_FILE" || echo "- [ ] tech_stack.md отсутствует" >> "$REPORT_FILE"
    [ -f "docs/architecture/db_schema.md" ] && echo "- [x] db_schema.md существует" >> "$REPORT_FILE" || echo "- [ ] db_schema.md отсутствует" >> "$REPORT_FILE"
    ;;
esac

cat >> "$REPORT_FILE" <<EOF

### 2. Проверка качества

**⚠️ РУЧНАЯ ПРОВЕРКА ТРЕБУЕТСЯ**

Проверьте:
- [ ] Все требования четко определены
- [ ] Edge cases учтены
- [ ] Решения имеют обоснование
- [ ] Нет двусмысленностей
- [ ] Масштабируемость проверена

### 3. Вердикт

**Статус:** PENDING_AUDIT

**Действия:**
1. Откройте этот файл: \`$REPORT_FILE\`
2. Проверьте артефакты этапа
3. Обновите вердикт: PASS / PASS_WITH_COMMENTS / FAIL
4. Если FAIL - обновите WORKFLOW_STATE.md:
   \`\`\`
   status: BLOCKED
   blocked_by: QUALITY_GATE
   \`\`\`

---

**Следующий шаг:** Запустите в Cursor:
\`\`\`
ROLE: QUALITY_AUDITOR
Задача: Прочитай артефакты этапа $STAGE_NAME и дай вердикт
\`\`\`

EOF

echo "✅ Отчет создан: $REPORT_FILE"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте отчет: $REPORT_FILE"
echo "   2. В Cursor запустите Quality Audit"
echo "   3. Обновите вердикт в отчете"
echo ""
echo "⚠️  Этап не может быть передан дальше без PASS"




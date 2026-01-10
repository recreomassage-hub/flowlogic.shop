#!/bin/bash

# 🧯 FAKE PROGRESS DETECTOR - Обнаружение "фейк-прогресса"
# Использование: ./scripts/detect_fake_progress.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🧯 FAKE PROGRESS DETECTOR"
echo ""

# Проверяем коммиты
RECENT_COMMITS=$(git log --oneline --since="24 hours ago" | wc -l)
echo "📊 Коммитов за 24 часа: $RECENT_COMMITS"

# Проверяем изменения в WORKFLOW_STATE.md
LAST_UPDATE=$(grep -E '^last_update:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')
CURRENT_STAGE=$(grep -E '^current_stage:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')

# Извлекаем прогресс из WORKFLOW_STATE.md
COMPLETED_TASKS=$(grep -E 'выполнено:' WORKFLOW_STATE.md | head -1 | grep -oE '[0-9]+/[0-9]+' | head -1 || echo "0/0")

echo "📋 Последнее обновление: $LAST_UPDATE"
echo "📊 Выполнено задач: $COMPLETED_TASKS"
echo ""

# Проверяем симптомы
SYMPTOMS=0
WARNINGS=()

if [ "$RECENT_COMMITS" -gt 5 ] && [ "$COMPLETED_TASKS" = "0/0" ]; then
  WARNINGS+=("⚠️  Много коммитов, но прогресс не меняется")
  SYMPTOMS=$((SYMPTOMS + 1))
fi

# Проверяем размер изменений
RECENT_CHANGES=$(git diff --stat HEAD~5..HEAD 2>/dev/null | tail -1 || echo "0 files changed")
echo "📝 Изменения (последние 5 коммитов): $RECENT_CHANGES"

# Проверяем наличие артефактов
CURRENT_ROLE=$(grep -E '^current_role:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')
ARTIFACTS_COUNT=0

case "$CURRENT_ROLE" in
  ANALYST)
    [ -f "docs/requirements/PRD.md" ] && ARTIFACTS_COUNT=$((ARTIFACTS_COUNT + 1))
    [ -f "docs/requirements/user_stories.md" ] && ARTIFACTS_COUNT=$((ARTIFACTS_COUNT + 1))
    ;;
  ARCHITECT)
    [ -f "docs/architecture/tech_stack.md" ] && ARTIFACTS_COUNT=$((ARTIFACTS_COUNT + 1))
    [ -f "docs/architecture/db_schema.md" ] && ARTIFACTS_COUNT=$((ARTIFACTS_COUNT + 1))
    ;;
esac

echo "📦 Артефактов этапа: $ARTIFACTS_COUNT"
echo ""

# Генерируем отчет
REPORT_FILE=".fake_progress_report_$(date +%Y%m%d_%H%M%S).md"

cat > "$REPORT_FILE" <<EOF
# 🧯 Fake Progress Detection Report

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Роль:** $CURRENT_ROLE
**Этап:** $CURRENT_STAGE

---

## 📊 МЕТРИКИ

- **Коммитов за 24ч:** $RECENT_COMMITS
- **Выполнено задач:** $COMPLETED_TASKS
- **Артефактов этапа:** $ARTIFACTS_COUNT
- **Последнее обновление:** $LAST_UPDATE

---

## ⚠️ ПРОВЕРКА

EOF

if [ $SYMPTOMS -gt 0 ]; then
  echo "## 🚨 ОБНАРУЖЕНЫ СИМПТОМЫ ФЕЙК-ПРОГРЕССА" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  for warning in "${WARNINGS[@]}"; do
    echo "- $warning" >> "$REPORT_FILE"
  done
  echo "" >> "$REPORT_FILE"
  echo "## 🔧 ДЕЙСТВИЕ" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  cat >> "$REPORT_FILE" <<'INNEREOF'
**Скопируйте в Cursor:**

```
STOP.
Перечисли:
1. Конкретные принятые решения (не объяснения, а факты)
2. Что изменилось в системе? (файлы, код, конфигурация)
3. Что можно закоммитить как артефакт?

Без объяснений. Только факты.
```

INNEREOF
else
  echo "✅ Симптомы фейк-прогресса не обнаружены" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Файл отчета:** \`$REPORT_FILE\`" >> "$REPORT_FILE"

echo "✅ Отчет создан: $REPORT_FILE"
echo ""

if [ $SYMPTOMS -gt 0 ]; then
  echo "🚨 ОБНАРУЖЕНЫ СИМПТОМЫ ФЕЙК-ПРОГРЕССА"
  echo ""
  echo "📋 Откройте отчет и следуйте инструкциям"
  exit 1
else
  echo "✅ Прогресс выглядит реальным"
fi






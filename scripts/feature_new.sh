#!/bin/bash

# 🚀 FEATURE NEW - Создание новой фичи
# Использование: ./scripts/feature_new.sh <feature_name> [description]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

FEATURE_NAME="${1}"
DESCRIPTION="${2:-}"

if [ -z "$FEATURE_NAME" ]; then
  echo "❌ Ошибка: укажите название фичи"
  echo ""
  echo "Использование: ./scripts/feature_new.sh <feature_name> [description]"
  echo ""
  echo "Пример:"
  echo "  ./scripts/feature_new.sh smart_task_prioritization \"Smart task prioritization feature\""
  exit 1
fi

# Создаем slug из названия
FEATURE_SLUG=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

FEATURE_DIR="docs/features/${FEATURE_SLUG}"
mkdir -p "$FEATURE_DIR"

echo "🚀 FEATURE NEW: Создание фичи '$FEATURE_NAME'"
echo "📁 Директория: $FEATURE_DIR"
echo ""

# 1. Feature Brief
cat > "${FEATURE_DIR}/feature_brief.md" <<EOF
# Feature: $FEATURE_NAME

**Дата создания:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Статус:** DRAFT
**Feature Flag:** \`${FEATURE_SLUG}\`

---

## 🎯 Цель

$([ -n "$DESCRIPTION" ] && echo "$DESCRIPTION" || echo "[Опишите цель фичи]")

---

## 👤 Пользователь

**Role:** [knowledge worker / admin / etc]
**Pain:** [Какую проблему решает фича]

---

## ✅ Success Criteria

- [ ] [Критерий 1]
- [ ] [Критерий 2]
- [ ] [Критерий 3]

**Метрики:**
- [Метрика 1]: [целевое значение]
- [Метрика 2]: [целевое значение]

---

## 🚫 Out of Scope

- [Что НЕ входит в эту фичу]
- [Что будет в следующих версиях]

---

## 🔁 Rollback

**Feature Flag:** \`${FEATURE_SLUG}=false\`

**Процедура:**
1. Отключить feature flag в конфигурации
2. \`git revert <feature_commit>\`
3. Redeploy

---

## 📋 Чеклист разработки

- [ ] Feature Brief (этот файл)
- [ ] Impact Analysis
- [ ] Design (API / UX / Data)
- [ ] Implementation
- [ ] QA
- [ ] Feature Flag добавлен
- [ ] Release
- [ ] Retrospective

---

**Следующий шаг:** Запустите Impact Analysis

EOF

# 2. Impact Analysis шаблон
cat > "${FEATURE_DIR}/impact_analysis.md" <<EOF
# Impact Analysis: $FEATURE_NAME

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Статус:** PENDING

---

## 📊 Анализ влияния

| Компонент | Impact | Risk | Mitigation |
|-----------|--------|------|------------|
| Backend | - | - | - |
| Frontend | - | - | - |
| Data Model | - | - | - |
| Performance | - | - | - |
| Security | - | - | - |

---

## 🔴 Высокий Impact

Если impact HIGH → фича должна быть разбита на меньшие части.

---

**Следующий шаг:** Design (API / UX / Data)

EOF

# 3. Design шаблоны
mkdir -p "${FEATURE_DIR}/design"

cat > "${FEATURE_DIR}/design/api.md" <<EOF
# API Design: $FEATURE_NAME

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Статус:** DRAFT

---

## 📋 Требования

- ✅ Backward compatible
- ✅ No breaking changes
- ✅ Feature-flag ready

---

## 🔌 Endpoints

### [Endpoint 1]

\`\`\`
GET /api/v1/[endpoint]
\`\`\`

**Request:**
\`\`\`json
{
}
\`\`\`

**Response:**
\`\`\`json
{
}
\`\`\`

---

EOF

cat > "${FEATURE_DIR}/design/ux.md" <<EOF
# UX Design: $FEATURE_NAME

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Статус:** DRAFT

---

## 🎨 User Flow

1. [Шаг 1]
2. [Шаг 2]
3. [Шаг 3]

---

## 📱 Компоненты

- [Компонент 1]
- [Компонент 2]

---

EOF

cat > "${FEATURE_DIR}/design/data.md" <<EOF
# Data Model: $FEATURE_NAME

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Статус:** DRAFT

---

## 🗄️ Изменения в Data Model

### Новые таблицы / поля

\`\`\`sql
-- [SQL для новых таблиц/полей]
\`\`\`

### Миграции

- [ ] Миграция 1
- [ ] Миграция 2

---

EOF

# 4. QA шаблон
cat > "${FEATURE_DIR}/qa.md" <<EOF
# QA: $FEATURE_NAME

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Статус:** PENDING

---

## ✅ Positive Cases

- [ ] [Сценарий 1]
- [ ] [Сценарий 2]
- [ ] [Сценарий 3]

---

## ❌ Negative Cases

- [ ] [Edge case 1]
- [ ] [Edge case 2]
- [ ] [Edge case 3]

---

## 🔄 Regression

- [ ] Старые фичи не сломаны
- [ ] Feature flag работает (on/off)
- [ ] Rollback работает

---

## 🧪 Тесты

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

EOF

# 5. Retrospective шаблон
cat > "${FEATURE_DIR}/retro.md" <<EOF
# Retrospective: $FEATURE_NAME

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Статус:** PENDING

---

## ✅ Что сработало

- [Что-то 1]
- [Что-то 2]

---

## ❌ Что не сработало

- [Проблема 1]
- [Проблема 2]

---

## 📚 Выводы

**Для следующих фич:**
- [Вывод 1]
- [Вывод 2]

---

EOF

# 6. README для фичи
cat > "${FEATURE_DIR}/README.md" <<EOF
# Feature: $FEATURE_NAME

**Slug:** \`${FEATURE_SLUG}\`
**Feature Flag:** \`${FEATURE_SLUG}\`

---

## 📁 Структура

- **feature_brief.md** - Описание фичи (обязательно перед стартом)
- **impact_analysis.md** - Анализ влияния
- **design/** - Дизайн (API, UX, Data)
- **qa.md** - Тестирование
- **retro.md** - Ретроспектива

---

## 🚀 Workflow

1. ✅ Feature Brief
2. ⏳ Impact Analysis
3. ⏳ Design
4. ⏳ Implementation
5. ⏳ QA
6. ⏳ Release
7. ⏳ Retrospective

---

**Следующий шаг:** Заполните feature_brief.md и запустите Impact Analysis

EOF

echo "✅ Feature создана!"
echo ""
echo "📁 Структура:"
echo "   $FEATURE_DIR/"
echo "   ├── feature_brief.md (заполните первым!)"
echo "   ├── impact_analysis.md"
echo "   ├── design/"
echo "   │   ├── api.md"
echo "   │   ├── ux.md"
echo "   │   └── data.md"
echo "   ├── qa.md"
echo "   ├── retro.md"
echo "   └── README.md"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Заполните feature_brief.md"
echo "   2. Запустите Impact Analysis: ./scripts/feature_impact.sh ${FEATURE_SLUG}"
echo "   3. Начните Design"
echo ""
echo "💡 Feature Flag: ${FEATURE_SLUG}"




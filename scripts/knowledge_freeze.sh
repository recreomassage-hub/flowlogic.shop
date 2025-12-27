#!/bin/bash

# 🧠 KNOWLEDGE FREEZE - Сохранение знаний проекта
# Использование: ./scripts/knowledge_freeze.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

FREEZE_DATE=$(date +%Y%m%d_%H%M%S)
KNOWLEDGE_DIR="docs/knowledge/freeze_${FREEZE_DATE}"
mkdir -p "$KNOWLEDGE_DIR"

echo "🧠 KNOWLEDGE FREEZE: Сохранение знаний проекта"
echo "📁 Директория: $KNOWLEDGE_DIR"
echo ""

# Создаем структуру
mkdir -p "$KNOWLEDGE_DIR"

# 1. Decisions
cat > "$KNOWLEDGE_DIR/decisions.md" <<EOF
# 📋 Ключевые решения проекта

**Дата freeze:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

---

## 🎯 Архитектурные решения

EOF

# Извлекаем решения из architecture docs
if [ -f "docs/architecture/tech_stack.md" ]; then
  echo "### Tech Stack" >> "$KNOWLEDGE_DIR/decisions.md"
  echo "" >> "$KNOWLEDGE_DIR/decisions.md"
  head -50 "docs/architecture/tech_stack.md" >> "$KNOWLEDGE_DIR/decisions.md"
  echo "" >> "$KNOWLEDGE_DIR/decisions.md"
fi

# 2. Assumptions
cat > "$KNOWLEDGE_DIR/assumptions.md" <<EOF
# 💭 Допущения проекта

**Дата freeze:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

---

## 📋 Бизнес-допущения

EOF

if [ -f "docs/requirements/qna.md" ]; then
  grep -A 5 "допущение\|assumption" "docs/requirements/qna.md" >> "$KNOWLEDGE_DIR/assumptions.md" || true
fi

# 3. Risks
cat > "$KNOWLEDGE_DIR/risks.md" <<EOF
# ⚠️ Риски проекта

**Дата freeze:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

---

## 🔴 Технические риски

EOF

# 4. Why Not
cat > "$KNOWLEDGE_DIR/why_not.md" <<EOF
# ❌ Почему отказались от альтернатив

**Дата freeze:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

---

## 🔍 Рассмотренные альтернативы

EOF

# 5. Summary
cat > "$KNOWLEDGE_DIR/README.md" <<EOF
# 🧠 Knowledge Freeze: $FREEZE_DATE

**Дата:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Версия проекта:** $(grep -E '^version:' PROJECT_CONFIG.md 2>/dev/null | cut -d: -f2 | tr -d ' ' || echo "unknown")
**Текущий этап:** $(grep -E '^current_stage:' WORKFLOW_STATE.md | cut -d: -f2 | tr -d ' ')

---

## 📁 Структура

- **decisions.md** - Ключевые архитектурные и технические решения
- **assumptions.md** - Бизнес и технические допущения
- **risks.md** - Выявленные риски проекта
- **why_not.md** - Рассмотренные альтернативы и причины отказа

---

## 🎯 Цель

Этот freeze сохраняет "корпоративную память" проекта:
- Почему были приняты те или иные решения
- Какие альтернативы рассматривались
- Какие риски были выявлены
- Какие допущения были сделаны

---

**Использование:** При передаче проекта или возобновлении работы после паузы

EOF

# Копируем ключевые документы
cp PROJECT_CONFIG.md "$KNOWLEDGE_DIR/" 2>/dev/null || true
cp WORKFLOW_STATE.md "$KNOWLEDGE_DIR/" 2>/dev/null || true

echo "✅ Knowledge freeze создан"
echo "📁 Директория: $KNOWLEDGE_DIR"
echo ""
echo "📋 Содержимое:"
echo "   • decisions.md - Ключевые решения"
echo "   • assumptions.md - Допущения"
echo "   • risks.md - Риски"
echo "   • why_not.md - Отклоненные альтернативы"
echo "   • README.md - Обзор"
echo ""
echo "💡 Это превращает LLM-OS в корпоративную память"


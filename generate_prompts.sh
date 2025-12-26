#!/usr/bin/env bash
# Генерация оставшихся промптов по шаблону

ROLES=(
  "pm:PM:planning"
  "backend_dev:BACKEND_DEV:backend"
  "frontend_dev:FRONTEND_DEV:frontend"
  "infra_devops:INFRA_DEVOPS:infra"
  "qa:QA:qa"
  "security:SECURITY:security"
  "docs:DOCS:docs"
)

PEER_REVIEWERS=(
  "pm:BACKEND_DEV"
  "backend_dev:FRONTEND_DEV"
  "frontend_dev:INFRA_DEVOPS"
  "infra_devops:QA"
  "qa:SECURITY"
  "security:DOCS"
  "docs:OWNER"
)

# Функция для создания execute промпта
create_execute_prompt() {
  local num=$1
  local role_key=$2
  local role_name=$3
  local stage=$4
  local file="PROMPTS/${num}_${role_key}_execute.md"
  
  cat > "$file" << EOF
# 🎯 ${role_name} EXECUTE — Создание артефактов

**Этап:** ${stage} Execute  
**Роль:** ${role_name}  
**Режим:** EXECUTE  
**Время:** 30-90 минут

---

## 🔄 ЦИКЛ ИСПОЛНЕНИЯ

1. **FETCH:** Прочитай PROJECT_CONFIG.md + WORKFLOW_STATE.md + ROLES/${role_key}.md
2. **DECODE:** Определи текущий этап (${stage}_execute)
3. **EXECUTE:** Создай артефакты согласно ROLES/${role_key}.md
4. **WRITEBACK:** Обнови WORKFLOW_STATE.md

---

## 📋 ЗАДАЧА

Создать артефакты согласно роли ${role_name}.

---

## 📤 ВЫХОДНЫЕ АРТЕФАКТЫ

См. ROLES/${role_key}.md

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

- [ ] Все артефакты созданы
- [ ] Критерии из ROLES/${role_key}.md выполнены
- [ ] WORKFLOW_STATE.md обновлен: статус \`DONE\`, next_role: \`${role_name}_SELF_REVIEW\`

---

**После завершения:** Переходи к следующему self-review промпту

EOF
}

# Функция для создания self-review промпта
create_self_review_prompt() {
  local num=$1
  local role_key=$2
  local role_name=$3
  local stage=$4
  local file="PROMPTS/${num}_${role_key}_self_review.md"
  
  cat > "$file" << EOF
# 🔍 ${role_name} SELF-REVIEW — Самопроверка

**Этап:** ${stage} Self-Review  
**Роль:** ${role_name}  
**Режим:** SELF-REVIEW  
**Время:** 10-15 минут

---

## 📋 ЗАДАЧА

Провести самопроверку созданных артефактов.

---

## 📤 ВЫХОДНОЙ АРТЕФАКТ

1. \`docs/${stage}/self_review_report.md\`

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

- [ ] Артефакты проверены
- [ ] Вердикт: APPROVED / NEEDS_REVISION
- [ ] WORKFLOW_STATE.md обновлен

---

## 🎯 ВЕРДИКТЫ

- **APPROVED** → next_role: \`PEER_REVIEWER\`, current_stage: \`${stage}_peer_review\`
- **NEEDS_REVISION** → next_role: \`${role_name}\`, current_stage: \`${stage}_execute\`

---

**После APPROVED:** Переходи к peer-review промпту

EOF
}

# Функция для создания peer-review промпта
create_peer_review_prompt() {
  local num=$1
  local reviewer_key=$2
  local reviewer_name=$3
  local reviewed_role=$4
  local stage=$5
  local file="PROMPTS/${num}_${reviewer_key}_peer_review.md"
  
  cat > "$file" << EOF
# 🔍 ${reviewer_name} PEER-REVIEW — Кросс-проверка ${reviewed_role}

**Этап:** ${stage} Peer-Review  
**Роль:** ${reviewer_name}  
**Режим:** PEER-REVIEW  
**Время:** 10-15 минут

---

## 📋 ЗАДАЧА

Провести кросс-проверку артефактов ${reviewed_role} с точки зрения ${reviewer_name}.

---

## 📤 ВЫХОДНОЙ АРТЕФАКТ

1. \`docs/${stage}/peer_review_report.md\`

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

- [ ] Артефакты проверены
- [ ] Вердикт: APPROVED / NEEDS_REVISION / BLOCKED
- [ ] WORKFLOW_STATE.md обновлен

---

## 🎯 ВЕРДИКТЫ

- **APPROVED** → next_role: \`${reviewer_name}\`, current_stage: \`next_stage_execute\`
- **NEEDS_REVISION** → next_role: \`${reviewed_role}\`, current_stage: \`${stage}_execute\`
- **BLOCKED** → next_role: \`OWNER\`, current_stage: \`${stage}_peer_review\`

---

**После APPROVED:** Переходи к следующему execute промпту

EOF
}

# Генерация промптов
counter=7  # Начинаем с 7 (после PM)

for role_data in "${ROLES[@]}"; do
  IFS=':' read -r role_key role_name stage <<< "$role_data"
  
  # Execute
  create_execute_prompt $counter "${role_key}" "${role_name}" "${stage}"
  ((counter++))
  
  # Self-review
  create_self_review_prompt $counter "${role_key}" "${role_name}" "${stage}"
  ((counter++))
done

# Peer-review промпты (уже созданы некоторые, создам остальные)
# PM peer-review уже создан (06)
# Остальные создам вручную для точности

echo "✅ Промпты сгенерированы!"





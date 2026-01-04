# 🏗️ Объединенная архитектура: LLM-OS Core + Сценарии

## 📋 КОНЦЕПЦИЯ

**LLM-OS = стабильный SDLC-движок** (core-слой)
- Роли, промпты, EXECUTE/SELF/PEER-REVIEW
- WORKFLOW_STATE.md, `./llmos step/next/approve`
- Жестко заданный цикл с гарантированным quality-гейтом

**Сценарии = модуль выбора маршрута** (оркестрационный слой)
- Определяют какие роли включены/выключены
- Задают глубину проработки для каждой роли
- Указывают ожидаемые артефакты на выходе
- Параметры: сроки, бюджет, глубина тестов, уровень документации

---

## 🎯 АРХИТЕКТУРА

```
┌─────────────────────────────────────────────────────────┐
│              СЦЕНАРИИ (SCENARIOS/*.yml)                 │
│  • saas_mvp.yml - Полный цикл разработки                │
│  • docs_only.yml - Только документация                  │
│  • refactor.yml - Рефакторинг проекта                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         PROJECT_CONFIG.md (выбранный сценарий)         │
│  **Выбранный сценарий:** `saas_mvp`                     │
│  **Файл сценария:** `SCENARIOS/saas_mvp.yml`           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              LLM-OS CORE-ДВИЖОК (неизменный)            │
│  • Роли: ANALYST → ARCHITECT → PM → ...                │
│  • Промпты: EXECUTE → PEER-REVIEW                       │
│  • WORKFLOW_STATE.md                                    │
│  • ./llmos next/execute/peer/approve                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         ./llmos next (читает сценарий)                  │
│  • Проверяет, включена ли роль в сценарии               │
│  • Пропускает роли из skip_roles                        │
│  • Применяет глубину проработки (depth)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 СТРУКТУРА ФАЙЛОВ

### SCENARIOS/*.yml - Конфигурации маршрутов

```yaml
name: SaaS MVP
description: "Полный цикл разработки SaaS приложения"

# Роли, которые будут использоваться
roles:
  - ANALYST
  - ARCHITECT
  - PM
  - BACKEND_DEV
  - FRONTEND_DEV
  - INFRA_DEVOPS
  - QA
  - SECURITY
  - DOCS
  - OWNER

# Роли, которые будут пропущены
skip_roles: []

# Глубина проработки для каждой роли
depth:
  ANALYST:
    requirements: full
    user_stories: full
    glossary: full
  
  ARCHITECT:
    c4_diagrams: full
    db_schema: full
    api_spec: full

# Ожидаемые артефакты
outputs:
  requirements:
    - docs/requirements/PRD.md
    - docs/requirements/user_stories.md

# Параметры проекта
parameters:
  time_to_market: fast
  complexity_budget: medium
  quality_gate: strict
  owner_approval: true
```

### PROJECT_CONFIG.md - Выбранный сценарий

```markdown
## 🎬 СЦЕНАРИЙ ПРОЕКТА

**Выбранный сценарий:** `saas_mvp`

**Файл сценария:** `SCENARIOS/saas_mvp.yml`

**Описание:** Сценарий определяет маршрут прохождения через LLM-OS core-движок
```

---

## 🚀 КОМАНДЫ

### Управление сценариями

```bash
# Показать доступные сценарии
./llmos scenario list

# Выбрать сценарий (записывает в PROJECT_CONFIG.md)
./llmos scenario start saas_mvp

# Показать статус текущего сценария
./llmos scenario status
```

### Работа с LLM-OS core

```bash
# Следующий промпт (читает сценарий и пропускает ненужные роли)
./llmos next

# EXECUTE режим для роли
./llmos execute ANALYST

# PEER-REVIEW режим для роли
./llmos peer ANALYST

# OWNER Final Approval
./llmos approve

# Атомарный коммит
./llmos step
```

---

## 🔄 КАК ЭТО РАБОТАЕТ

### 1. Выбор сценария

```bash
./llmos scenario start saas_mvp
```

**Что происходит:**
- Читается `SCENARIOS/saas_mvp.yml`
- Обновляется `PROJECT_CONFIG.md` с выбранным сценарием
- LLM-OS core-движок остается неизменным

### 2. Выполнение через LLM-OS

```bash
./llmos next
```

**Что происходит:**
1. Читается `PROJECT_CONFIG.md` → выбранный сценарий
2. Читается `SCENARIOS/saas_mvp.yml` → конфигурация маршрута
3. Читается `WORKFLOW_STATE.md` → текущая роль
4. Проверяется, включена ли роль в `roles` (не в `skip_roles`)
5. Если роль пропущена → переход к следующей включенной роли
6. Если роль включена → показывается промпт с учетом `depth`

### 3. Прохождение ролей

**Пример для `docs_only.yml`:**
- `roles: [ANALYST, ARCHITECT, DOCS, OWNER]`
- `skip_roles: [PM, BACKEND_DEV, FRONTEND_DEV, INFRA_DEVOPS, QA, SECURITY]`

**Результат:**
- ANALYST → ARCHITECT → DOCS → OWNER (4 роли вместо 10)
- PM, BACKEND_DEV, FRONTEND_DEV, INFRA_DEVOPS, QA, SECURITY пропущены

---

## 📊 ПРИМЕРЫ СЦЕНАРИЕВ

### 1. SaaS MVP (полный цикл)

```yaml
roles: [ANALYST, ARCHITECT, PM, BACKEND_DEV, FRONTEND_DEV, INFRA_DEVOPS, QA, SECURITY, DOCS, OWNER]
depth:
  ANALYST: {requirements: full, user_stories: full}
  QA: {test_coverage: 75}
```

**Использование:** Полная разработка SaaS приложения от требований до production.

### 2. Docs Only (только документация)

```yaml
roles: [ANALYST, ARCHITECT, DOCS, OWNER]
skip_roles: [PM, BACKEND_DEV, FRONTEND_DEV, INFRA_DEVOPS, QA, SECURITY]
depth:
  ANALYST: {requirements: full, user_stories: medium}
  ARCHITECT: {c4_diagrams: full, api_spec: full}
```

**Использование:** Быстрое создание PRD + Architecture без кода.

### 3. Refactor (рефакторинг)

```yaml
roles: [ANALYST, ARCHITECT, BACKEND_DEV, FRONTEND_DEV, QA, OWNER]
skip_roles: [PM, INFRA_DEVOPS, SECURITY, DOCS]
depth:
  QA: {test_coverage: 80, test_types: [unit, integration, e2e, regression]}
```

**Использование:** Рефакторинг существующего проекта с повышенным покрытием тестами.

---

## ⚠️ ВАЖНЫЕ ПРАВИЛА

### 1. LLM-OS Core не изменяется

- Роли, промпты, EXECUTE/PEER-REVIEW остаются неизменными
- WORKFLOW_STATE.md работает как обычно
- `./llmos step/next/approve` работают как обычно

### 2. Сценарии только определяют маршрут

- Сценарии НЕ меняют логику LLM-OS core
- Сценарии только говорят "какие роли включены" и "какая глубина"
- LLM-OS core сам решает "как выполнять" роль

### 3. Обратная совместимость

- Если сценарий не выбран → используется полный цикл (все роли)
- Если роль не указана в сценарии → считается включенной (fallback)
- Если `depth` не указан → используется `full` (fallback)

---

## 🔧 РАСШИРЕНИЕ

### Добавление нового сценария

1. Создать файл `SCENARIOS/my_scenario.yml`
2. Определить `roles`, `skip_roles`, `depth`, `outputs`, `parameters`
3. Выбрать сценарий: `./llmos scenario start my_scenario`

### Кастомизация глубины

```yaml
depth:
  ANALYST:
    requirements: full      # full | medium | light
    user_stories: medium
    glossary: light
```

**Как используется:**
- LLM-OS core читает `depth` из сценария
- Агент получает инструкции с учетом `depth`
- Например, `light` → меньше деталей, `full` → полная проработка

---

## 📚 СМ. ТАКЖЕ

- `SCENARIOS/saas_mvp.yml` - Пример полного сценария
- `SCENARIOS/docs_only.yml` - Пример минимального сценария
- `SCENARIOS/refactor.yml` - Пример сценария рефакторинга
- `PROJECT_CONFIG.md` - Выбранный сценарий
- `docs/scenarios/scenarios_reference.md` - Справочник FSM сценариев

---

**Последнее обновление:** 2025-12-27



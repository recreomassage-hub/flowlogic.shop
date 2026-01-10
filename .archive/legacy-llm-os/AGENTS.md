<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# 🤖 AGENTS - Rules for AI Assistants

**Версия:** 1.0  
**Дата:** 2026-01-06  
**Цель:** Правила для AI агентов при работе с гибридной системой Spec-Driven + Issue Tracking

---

## 🎯 CORE PRINCIPLES

### 1. Spec-Driven для проектирования
- **НЕ заменяется** issue tracking
- Используется для **новых фич** и **сложных изменений**
- Создает: `spec.md`, `plan.md`, `tasks.md`

### 2. Issue Tracking для исполнения
- **Дополняет** Spec-Driven, не заменяет
- Используется для **управления задачами** во время реализации
- Хранит: `.beads/issues.jsonl`, `.beads/status.json`

### 3. STATUS.md как якорь
- **Человеко-читаемый** обзор состояния
- Автоматически генерируется из issues
- **Всегда обновлять** перед завершением сессии

---

## 📋 WORKFLOW RULES

### При проектировании новой фичи

**Используй Spec-Driven (как было):**

1. `/specify` → создай `spec.md`
2. `/clarify` → уточни неясности (если нужно)
3. `/plan` → создай технический план
4. `/tasks` → разбей на задачи в `tasks.md`
5. **НОВОЕ:** `/create-issues` → конвертируй задачи в `.beads/issues.jsonl`

**НЕ создавай issues вручную** - используй команду `/create-issues` после `/tasks`.

---

### При реализации задач

**Используй Issue Tracking:**

```bash
# 1. Найди работу
./scripts/bd.sh ready

# 2. Начни работу
./scripts/bd.sh start {issue-id}

# 3. Во время работы - если обнаружил проблему
./scripts/bd.sh discover "Description" --from {issue-id}

# 4. Заверши задачу
./scripts/bd.sh complete {issue-id}

# 5. Обнови статус
./scripts/generate-status.sh
```

**Правила:**
- ✅ **Одна задача на сессию** (избегай перегрузки контекста)
- ✅ **Всегда логируй обнаруженные проблемы** (не теряй задачи)
- ✅ **Обновляй статус перед завершением** сессии
- ✅ **Проверяй блокировки** перед началом: `./scripts/bd.sh show {issue-id}`

---

### Между сессиями

**Автоматически:**
- `.beads/issues.jsonl` версионируется в git
- `STATUS.md` генерируется из issues
- Контекст **никогда не теряется**

**При начале новой сессии:**
1. Прочитай `STATUS.md` - твой "якорь"
2. Проверь `.beads/status.json` - текущее состояние
3. Используй `./scripts/bd.sh ready` - что делать дальше

---

## 🔧 COMMANDS REFERENCE

### Issue Tracker Commands

```bash
# Создать задачу (обычно через /create-issues, не вручную)
./scripts/bd.sh create "Title" --epic EPIC --priority 1 --estimated-time "30min"

# Показать готовые задачи
./scripts/bd.sh ready              # Текстовый формат
./scripts/bd.sh ready --json       # JSON для агентов

# Работа с задачей
./scripts/bd.sh start {issue-id}   # Начать работу
./scripts/bd.sh complete {issue-id} # Завершить
./scripts/bd.sh show {issue-id}     # Детали задачи

# Обнаружение проблем
./scripts/bd.sh discover "Description" --from {issue-id}

# Статус
./scripts/bd.sh status             # Генерирует .beads/status.json
./scripts/generate-status.sh       # Генерирует STATUS.md
```

---

## ⚠️ ANTI-PATTERNS

### ❌ НЕ делай:

1. **НЕ создавай issues вручную** - используй `/create-issues` после `/tasks`
2. **НЕ пропускай обновление статуса** - всегда `./scripts/generate-status.sh` перед завершением
3. **НЕ теряй обнаруженные проблемы** - всегда `bd discover` при находке
4. **НЕ начинай заблокированные задачи** - проверь `bd show {id}` сначала
5. **НЕ работай над несколькими задачами одновременно** - одна задача на сессию

### ✅ Делай:

1. **Всегда читай STATUS.md** в начале сессии
2. **Всегда обновляй статус** перед завершением сессии
3. **Всегда логируй обнаруженные проблемы** через `bd discover`
4. **Всегда проверяй блокировки** перед началом работы
5. **Всегда коммить изменения** в `.beads/` вместе с кодом

---

## 📊 FILE STRUCTURE

```
.specify/features/{name}/     # Spec-Driven (проектирование)
├── spec.md                   # Требования
├── plan.md                   # Технический план
└── tasks.md                  # Задачи (markdown)

.beads/                       # Issue Tracking (исполнение)
├── issues.jsonl              # Все задачи (структурированные)
└── status.json               # Текущее состояние (автогенерация)

STATUS.md                     # Человеко-читаемый обзор (автогенерация)
```

---

## 🎯 INTEGRATION WITH EXISTING SYSTEM

### Сохраняется:

- ✅ Spec-Driven для проектирования фич
- ✅ Constitution как стандарты качества
- ✅ Git workflow
- ✅ Структура `.specify/`
- ✅ `WORKFLOW_STATE.md` для LLM-OS системы

### Добавлено:

- ✅ `.beads/issues.jsonl` для задач
- ✅ `bd` CLI для управления задачами
- ✅ Автообновление `STATUS.md`
- ✅ Правила в `AGENTS.md`

### Результат:

- 🎯 Spec-Driven для дизайна
- 🎯 Issue-tracking для исполнения
- 🎯 Никогда не теряешь контекст
- 🎯 Агенты не "забывают" задачи
- 🎯 Работа в свободное время = комфортно

---

## 📝 EXAMPLES

### Пример 1: Новая фича

```bash
# 1. Проектирование (Spec-Driven)
/specify
Feature: User Notifications
...

/plan
@constitution.md @spec.md
...

/tasks
@constitution.md @spec.md @plan.md
...

# 2. Создание issues (НОВОЕ)
/create-issues
@spec.md @plan.md @tasks.md
Convert tasks into structured issues

# 3. Реализация (Issue Tracking)
./scripts/bd.sh ready
./scripts/bd.sh start NOTIF-1
/implement Task: NOTIF-1
./scripts/bd.sh complete NOTIF-1
./scripts/generate-status.sh
```

### Пример 2: Обнаружение проблемы

```bash
# Во время работы над NOTIF-1
./scripts/bd.sh discover "Email template validation needed" --from NOTIF-1

# Новая задача создана автоматически
# Продолжаешь работу над NOTIF-1
# Позже вернешься к обнаруженной задаче
```

### Пример 3: Начало новой сессии

```bash
# 1. Читаешь STATUS.md
cat STATUS.md

# 2. Видишь готовые задачи
./scripts/bd.sh ready

# 3. Начинаешь работу
./scripts/bd.sh start NOTIF-2
```

---

**Последнее обновление:** 2026-01-06


## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds


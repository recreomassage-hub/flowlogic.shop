# 🚀 CHEATSHEET - Гибридная система (Spec-Driven + Issue Tracking)

**Быстрая справка по командам для ежедневной работы**

---

## ⚡ УСТАНОВКА

### Beads (Issue Tracker)

**Официальный Beads установлен:** ✅ `@beads/bd@0.46.0`

```bash
# Установка (если нужно обновить)
npm install -g @beads/bd@latest

# Проверка
bd --help
```

**Совместимость:** ✅ Полная совместимость с `.beads/issues.jsonl`  
**Интеграция:** ✅ Автоматическая через `.aliases`

### Алиасы

#### Автоматическая установка (рекомендуется)

```bash
# Запустить скрипт установки
./install-aliases.sh
```

Скрипт автоматически:
- Определит ваш shell (bash/zsh)
- Добавит алиасы в `.bashrc` или `.zshrc`
- Проверит, не установлены ли уже алиасы

#### Ручная установка

Если предпочитаете установить вручную, добавьте в ваш `.bashrc` или `.zshrc`:

```bash
# Добавить в ~/.bashrc или ~/.zshrc
source "/path/to/project/.aliases"
```

Или для текущей сессии:
```bash
source .aliases
```

**Примечание:** Алиасы автоматически используют официальный Beads, если он установлен.

### Основные алиасы

- `bd` → `./scripts/bd.sh` (Issue Tracking)
- `status-gen` → `./scripts/generate-status.sh`
- `status-read` → `cat STATUS.md`
- `bd-ready` → `bd ready`
- `bd-start {id}` → `bd start {id}`
- `bd-complete {id}` → `bd complete {id}`
- `bd-discover` → `bd discover`
- `bd-next` → получить ID следующей готовой задачи
- `bd-start-next` → начать работу над следующей задачей
- `bd-finish {id}` → завершить задачу и обновить статус

**Полный список:** см. файл `.aliases`

---

## 🌅 НАЧАЛО ДНЯ / СЕССИИ

### 1. Проверить текущее состояние
```bash
# Прочитать статус (твой "якорь")
status-read
# или
cat STATUS.md

# Или сгенерировать свежий
status-gen
# или
./scripts/generate-status.sh
```

### 2. Найти работу
```bash
# Показать готовые задачи (текст)
bd-ready
# или
./scripts/bd.sh ready

# Показать готовые задачи (JSON для агентов)
bd-ready-json
# или
./scripts/bd.sh ready --json

# Показать детали конкретной задачи
bd-show {issue-id}
# или
./scripts/bd.sh show {issue-id}

# Пример:
bd-show TASK-1234567890-1234
```

### 3. Начать работу
```bash
# Начать работу над задачей
bd-start {issue-id}
# или
./scripts/bd.sh start {issue-id}

# Быстрый старт следующей готовой задачи
bd-start-next

# Пример:
bd-start DS-4
```

---

## 💻 ВО ВРЕМЯ РАБОТЫ

### Работа над задачей
```bash
# Проверить детали задачи
bd-show {issue-id}
# или
./scripts/bd.sh show {issue-id}

# Проверить блокировки
bd-show {issue-id} | jq '.blocked_by'

# Проверить что блокирует эта задача
bd-show {issue-id} | jq '.blocks'
```

### Обнаружение проблем
```bash
# Создать новую задачу из обнаруженной проблемы
bd-discover "Описание проблемы" --from {issue-id}
# или
./scripts/bd.sh discover "Описание проблемы" --from {issue-id}

# Пример:
bd-discover "Нужна валидация email" --from DS-9
```

### Проверка статуса
```bash
# Показать только активные задачи
issues-active
# или
cat .beads/issues.jsonl | jq 'select(.status == "in_progress")'

# Обновить STATUS.md
status-gen
# или
./scripts/generate-status.sh
```

**Примечание:** Команда `bd.sh status` не существует. Используйте `status-gen` для обновления `STATUS.md`.

---

## ✅ ЗАВЕРШЕНИЕ РАБОТЫ

### Завершить задачу
```bash
# Отметить задачу как выполненную и обновить статус
bd-finish {issue-id}
# или
bd-complete {issue-id} && status-gen
# или
./scripts/bd.sh complete {issue-id} && ./scripts/generate-status.sh

# Пример:
bd-finish DS-4
```

### Обновить статус
```bash
# Сгенерировать свежий STATUS.md
status-gen
# или
./scripts/generate-status.sh

# Проверить что обновилось
status-read
# или
cat STATUS.md
```

### Коммит изменений
```bash
# Проверить изменения
git status

# Добавить все изменения (включая .beads/)
git add .

# Коммит
git commit -m "feat: {issue-id} - {description}"

# Пример:
git commit -m "feat: DS-4 - Create Typography Components"
```

**Примечание:** Для legacy LLM-OS системы можно использовать `./step.sh` (см. раздел "LEGACY LLM-OS").

---

## 🆕 НОВАЯ ФИЧА (Spec-Driven)

### 1. Идея / Спецификация
```bash
# В Cursor:
/idea

Feature: {название}

IDEA:
{описание идеи}

INITIAL REQUIREMENTS:
{требования}
```

### 2. Уточнение
```bash
# В Cursor:
/clarify

@spec.md

Review and clarify:
1. {вопрос 1}
```

### 3. План
```bash
# В Cursor:
/plan

@constitution.md @spec.md @clarifications.md

Create technical plan
```

### 4. Задачи
```bash
# В Cursor:
/tasks

@constitution.md @spec.md @plan.md

Break down into tasks
```

### 5. Создание Issues (НОВОЕ)
```bash
# В Cursor:
/create-issues

@spec.md @plan.md @tasks.md

Convert tasks into structured issues

Epic: {feature-name}
Prefix: {PREFIX}
```

### 6. Реализация (Issue Tracking)
```bash
# Найти задачу
bd-ready
# или
./scripts/bd.sh ready

# Начать работу
bd-start {issue-id}
# или быстро начать следующую
bd-start-next

# В Cursor:
/implement

@constitution.md @spec.md @plan.md @tasks.md

Task: {номер}
```

---

## 🔍 ПОИСК И ФИЛЬТРАЦИЯ

### Поиск задач
```bash
# Все задачи эпика
issues | jq 'select(.epic == "design-system")'
# или
cat .beads/issues.jsonl | jq 'select(.epic == "design-system")'

# Только готовые задачи
issues | jq 'select(.status == "ready")'
# или
bd-ready-json

# Задачи с высоким приоритетом
issues | jq 'select(.priority == 1)'

# Заблокированные задачи
issues | jq 'select(.blocked_by != null and (.blocked_by | length > 0))'

# Обнаруженные проблемы
issues | jq 'select(.discovered_from != null)'
```

### Статистика
```bash
# Всего задач
issues | wc -l
# или
cat .beads/issues.jsonl | wc -l

# Выполнено
issues-done | wc -l
# или
cat .beads/issues.jsonl | jq 'select(.status == "done")' | wc -l

# В работе
issues-active | wc -l
# или
cat .beads/issues.jsonl | jq 'select(.status == "in_progress")' | wc -l

# Готово к работе
issues | jq 'select(.status == "ready")' | wc -l
```

---

## 🛠️ УПРАВЛЕНИЕ ЗАДАЧАМИ

### Создать задачу вручную
```bash
# Создать задачу
bd-create "Название задачи" \
  --epic "epic-name" \
  --priority 1 \
  --estimated-time "1h"
# или
./scripts/bd.sh create "Название задачи" \
  --epic "epic-name" \
  --priority 1 \
  --estimated-time "1h"

# Пример с приоритетом
bd-create "Fix bug" --priority 1 --estimated-time "30min"
```

**Примечание:** Параметры `--blocks` и `--blocked-by` не поддерживаются в текущей версии. Для установки зависимостей используйте редактирование через jq (см. раздел "Обновить задачу").
```

### Обновить задачу
```bash
# Показать задачу (для редактирования вручную)
bd-show {issue-id}
# или
./scripts/bd.sh show {issue-id}

# Затем отредактировать .beads/issues.jsonl напрямую
# (или использовать jq для автоматизации)
```

---

## 📊 ТИПИЧНЫЕ СЦЕНАРИИ

### Сценарий 1: Быстрая сессия (30 мин)
```bash
# 1. Проверить статус
status-read

# 2. Найти быструю задачу
bd-ready | grep "30min\|1h"

# 3. Начать работу
bd-start {issue-id}
# или быстро начать следующую
bd-start-next

# 4. Завершить
bd-finish {issue-id}
# или
bd-complete {issue-id} && status-gen
git add . && git commit -m "feat: {issue-id}"
```

### Сценарий 2: Длинная сессия (2+ часа)
```bash
# 1. Проверить статус
status-read

# 2. Найти задачу
bd-ready

# 3. Начать работу
bd-start {issue-id}
# или быстро начать следующую
bd-start-next

# 4. Во время работы - если обнаружил проблему
bd-discover "проблема" --from {issue-id}

# 5. Завершить
bd-finish {issue-id}
# или
bd-complete {issue-id} && status-gen
git add . && git commit -m "feat: {issue-id}"
```

### Сценарий 3: Начало новой фичи
```bash
# 1. Spec-Driven (в Cursor)
/idea → /clarify → /plan → /tasks

# 2. Создать issues
/create-issues

# 3. Начать реализацию
bd-ready
bd-start {issue-id}
# или быстро начать следующую
bd-start-next
```

### Сценарий 4: Продолжение работы после перерыва
```bash
# 1. Прочитать якорь
status-read

# 2. Проверить активные задачи
issues-active
# или
cat .beads/issues.jsonl | jq 'select(.status == "in_progress")'

# 3. Продолжить или начать новую
bd-ready
bd-start {issue-id}
# или быстро начать следующую
bd-start-next
```

---

## 🚨 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: Задача не показывается как ready
```bash
# Проверить блокировки
bd-show {issue-id} | jq '.blocked_by'
# или
./scripts/bd.sh show {issue-id} | jq '.blocked_by'

# Проверить статус блокирующих задач
for blocker in $(bd-show {issue-id} | jq -r '.blocked_by[]?'); do
  bd-show $blocker | jq '.status'
done
```

### Проблема: bd.sh не работает
```bash
# Проверить права
chmod +x scripts/bd.sh

# Проверить jq
which jq
# Если нет: sudo apt install jq (Linux) или brew install jq (Mac)
```

### Проблема: STATUS.md не обновляется
```bash
# Перегенерировать
status-gen
# или
./scripts/generate-status.sh

# Проверить что issues.jsonl существует
ls -la .beads/issues.jsonl
```

---

## 📝 БЫСТРЫЕ КОМАНДЫ

```bash
# Показать следующую задачу
bd-ready

# Показать следующую задачу (только ID)
bd-next
# или
bd-ready-json | jq -r '.[0].id // empty'

# Начать работу над первой готовой задачей
bd-start-next
# или
bd-start $(bd-next)

# Завершение и коммит (замените {issue-id} на реальный ID)
bd-finish {issue-id} && git add . && git commit -m "feat: {issue-id}"
# или
bd-complete {issue-id} && status-gen && git add . && git commit -m "feat: {issue-id}"

# Показать текущий статус проекта (JSON)
bd-status | jq .
```

---

## 🎯 КЛЮЧЕВЫЕ ПРАВИЛА

1. ✅ **Всегда читай STATUS.md** в начале сессии
2. ✅ **Одна задача на сессию** (избегай перегрузки)
3. ✅ **Всегда логируй проблемы** через `bd discover`
4. ✅ **Обновляй статус** перед завершением
5. ✅ **Коммить .beads/** вместе с кодом

---

---

## 🚀 DEPLOYMENT СКРИПТЫ

### Post-deployment проверка
```bash
# Проверка работоспособности после деплоя
post-deploy [production|staging|dev] [API_URL]
# или
./scripts/post_deploy.sh [production|staging|dev] [API_URL]

# Примеры:
post-deploy production
post-deploy staging
post-deploy dev https://custom-api-url.com
```

**Сценарии использования:**
- После деплоя на production
- После деплоя на staging
- После локального тестирования

### Smoke tests
```bash
# Быстрые тесты для проверки работоспособности
smoke-tests [production|staging|dev] [API_URL]
# или
./scripts/smoke_tests.sh [production|staging|dev] [API_URL]

# Примеры:
smoke-tests production
smoke-tests staging
```

**Сценарии использования:**
- После деплоя для быстрой проверки
- Перед production release
- В CI/CD pipeline

---

## 🔧 LEGACY LLM-OS (только для scenarios)

> ⚠️ **ВАЖНО:** Эти скрипты используются **только** в legacy LLM-OS scenarios (`scenarios/*.yml`), **НЕ** в основном Spec-Driven + Issue Tracking workflow.
>
> **Для основной работы используйте разделы выше:** "НОВАЯ ФИЧА (Spec-Driven)" и "УПРАВЛЕНИЕ ЗАДАЧАМИ".

### LLM-OS Система

**Инициализация:**
```bash
# Первоначальная настройка проекта
llmos-setup
# или
./setup_workflow.sh

# Запуск LLM-OS системы
llmos-launch
# или
./launch-llmos.sh

# Показать быстрые команды
./quick_commands.sh
```

**Мониторинг и коммиты:**
```bash
# Мониторинг текущего состояния (WORKFLOW_STATE.md)
llmos-monitor
# или
./monitor.sh

# Атомарный коммит (обновляет WORKFLOW_STATE.md)
llmos-step
# или
./step.sh

# Генерация отчета о прогрессе
llmos-report
# или
./generate_report.sh
```

**Использование:** Только для legacy LLM-OS scenarios, не для основного workflow.

---

### Feature Management (Legacy)

**Создание фичи:**
```bash
# Создать новую фичу (legacy workflow)
feature-new <feature_name> [description]
# или
./scripts/feature_new.sh <feature_name> [description]
```

**Анализ влияния:**
```bash
# Анализ влияния фичи на компоненты
feature-impact <feature_slug>
# или
./scripts/feature_impact.sh <feature_slug>
```

**Проверка feature flags:**
```bash
# Проверка feature flags
feature-flag <flag_name>
# или
./scripts/feature_check_flag.sh <flag_name>
```

**Использование:** Только в `scenarios/FEATURE_DEVELOPMENT.yml`, не в Spec-Driven workflow.

---

### Scenario Management

**Quality Gate:**
```bash
# Quality gate проверка
quality-gate
# или
./scripts/quality_gate.sh
```
Используется в `scenarios/QUALITY_GATE.yml`

**Rollback:**
```bash
# Rollback стадии
rollback [stage]
# или
./scripts/rollback_stage.sh [stage]
```
Используется в `scenarios/ROLLBACK.yml`

**Incident Recovery:**
```bash
# Детектор инцидентов
incident-detect
# или
./scripts/incident_detector.sh
```
Используется в `scenarios/INCIDENT_RECOVERY.yml`

---

### Context Collection (PLAN/BUILD)

**Сбор контекста:**
```bash
# Backend auth
./scripts/collect/backend-auth.sh > artifacts/collected_backend_auth.md

# Frontend UI
./scripts/collect/frontend-ui.sh > artifacts/collected_frontend_ui.md
```

**Использование:** Только для legacy PLAN/BUILD workflow (большие рефакторинги).

---

## 🔧 UTILITY СКРИПТЫ

### Pre-commit hooks
```bash
# Настройка pre-commit hooks (проверка секретов)
setup-precommit
# или
./scripts/setup_pre_commit.sh

# Проверка SSM параметров
check-ssm
# или
./scripts/check_ssm_params.sh
```

**Сценарии использования:**
- Первоначальная настройка проекта
- Проверка конфигурации перед деплоем

### Infrastructure setup
```bash
# Настройка IAM ролей
setup-iam
# или
./infra/iam/setup.sh

# Настройка мониторинга
setup-monitoring
# или
./scripts/setup_monitoring.sh
```

**Сценарии использования:**
- Первоначальная настройка инфраструктуры
- Обновление IAM политик

---

## 📚 ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ

- **`AGENTS.md`** - Правила для AI агентов
- **`CONTRIBUTING.md`** - Полный workflow
- **`docs/planning/hybrid_system_migration.md`** - Описание системы
- **`STATUS.md`** - Текущее состояние (автогенерация)
- **`docs/analysis/project_optimization_report.md`** - Анализ оптимизации

---

## ⚠️ АРХИВНЫЕ СКРИПТЫ

**Неиспользуемые скрипты перемещены в:**
- `scripts/archive/llm-os-legacy/` - Legacy LLM-OS скрипты
- `scripts/archive/feature-management/` - Legacy feature management
- `scripts/archive/utilities/` - Утилиты (проверить использование)

**Для восстановления:** Скопировать из архива обратно в `scripts/`

---

**Последнее обновление:** 2026-01-08


# 🚀 CHEATSHEET - OpenSpec + Beads



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
bd ready

# Показать готовые задачи (JSON для агентов)
bd ready --json

# Показать детали конкретной задачи
bd show {issue-id}

# Пример:
bd show TASK-1234567890-1234
```

### 3. Начать работу
```bash
# Начать работу над задачей
bd start {issue-id}

# Пример:
bd start DS-4
```

---

## 💻 ВО ВРЕМЯ РАБОТЫ

### Работа над задачей
```bash
# Проверить детали задачи
bd show {issue-id}

# Проверить блокировки
bd show {issue-id} | jq '.blocked_by'

# Проверить что блокирует эта задача
bd show {issue-id} | jq '.blocks'
```

### Обнаружение проблем
```bash
# Создать новую задачу из обнаруженной проблемы
bd discover "Описание проблемы" --from {issue-id}

# Пример:
bd discover "Нужна валидация email" --from DS-9
```

### Проверка статуса
```bash
# Показать только активные задачи
cat .beads/issues.jsonl | jq 'select(.status == "in_progress")'

# Обновить STATUS.md
status-gen
# или
./scripts/generate-status.sh
```

**Примечание:** Команда `bd status` не существует. Используйте `status-gen` для обновления `STATUS.md`.

---

## ✅ ЗАВЕРШЕНИЕ РАБОТЫ

### Завершить задачу
```bash
# Отметить задачу как выполненную
bd complete {issue-id}

# Обновить статус после завершения
bd complete {issue-id} && status-gen
# или
bd complete {issue-id} && ./scripts/generate-status.sh

# Пример:
bd complete DS-4 && status-gen
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

## 🆕 НОВАЯ ФИЧА (OpenSpec)

### 0. Pre-work Checklist (ПЕРЕД созданием proposal)

```bash
# 1. Проверить текущее состояние
openspec list                    # Активные изменения
openspec list --specs            # Существующие спецификации
openspec show <spec-id>          # Детали конкретной спецификации

# 2. Поиск существующей работы
openspec spec list --long        # Все спецификации с деталями
rg -n "Requirement:|Scenario:" openspec/specs  # Полнотекстовый поиск

# 3. Проверка конфликтов
openspec list                    # Ожидающие изменения
rg -n "^#|Requirement:" openspec/changes  # Изменения в процессе

# 4. Прочитать контекст проекта
cat openspec/project.md
```

**Вопросы для проверки:**
- Существует ли уже эта capability?
- Есть ли конфликтующие pending changes?
- Нужно ли модифицировать существующую spec vs создать новую?
- Нужны ли уточняющие вопросы (2 максимум) перед началом?

### 1. Создать предложение об изменении

**Выбор Change ID:**
- Формат: `<verb>-<noun>-<noun>` (kebab-case)
- Примеры: `add-two-factor-auth`, `update-payment-flow`, `remove-legacy-api`, `refactor-video-processing`
- Префиксы: `add-`, `update-`, `remove-`, `refactor-`, `fix-`
- Уникальность: Проверить через `openspec list`, при необходимости добавить `-2`, `-3`

```bash
# В Cursor:
/openspec-proposal

Change: add-user-dashboard-redesign

Description: Redesign user dashboard with modern UI, better navigation, and real-time stats.

Why:
Current dashboard is outdated and doesn't provide real-time statistics.

What Changes:
- Modern card-based layout
- Real-time statistics display
- Quick action buttons
- Responsive design (mobile-first)
- Dark mode support

Impact:
- Affected specs: user-dashboard, notifications
- Affected code: src/frontend/components/Dashboard/
```

**Процесс создания proposal:**
1. Review `openspec/project.md`, run `openspec list` и `openspec list --specs`
2. Choose unique verb-led `change-id` и scaffold структуру
3. Write `proposal.md` (Why, What Changes, Impact)
4. Write `tasks.md` (ordered checklist)
5. Write `design.md` (optional - только если cross-cutting changes, новые зависимости, архитектурные решения)
6. Write spec deltas в `specs/<capability>/spec.md` с `## ADDED|MODIFIED|REMOVED Requirements` и `#### Scenario:`
7. Validate: `openspec validate <id> --strict`

**Результат:** 
- `openspec/changes/add-user-dashboard-redesign/proposal.md` (REQUIRED)
- `openspec/changes/add-user-dashboard-redesign/tasks.md` (REQUIRED)
- `openspec/changes/add-user-dashboard-redesign/design.md` (OPTIONAL - только если нужно)
- `openspec/changes/add-user-dashboard-redesign/specs/**/spec.md` (REQUIRED)

**ВАЖНО:** На этапе proposal НЕ пишем код! Только документы.

### 2. Валидация предложения

```bash
# Проверить валидность предложения
openspec validate add-user-dashboard-redesign --strict

# Показать детали предложения
openspec show add-user-dashboard-redesign

# Показать только deltas
openspec show add-user-dashboard-redesign --json --deltas-only
```

**Если валидация не проходит:** Исправить все ошибки перед отправкой на approval.

### 3. Реализация (после approval)

**ВАЖНО:** Реализация начинается ТОЛЬКО после явного approval ("Go!").

```bash
# В Cursor:
/openspec-apply

@openspec/changes/add-user-dashboard-redesign/proposal.md
@openspec/changes/add-user-dashboard-redesign/design.md  # если есть
@openspec/changes/add-user-dashboard-redesign/tasks.md
@openspec/changes/add-user-dashboard-redesign/specs/**/spec.md

Implement changes according to proposal and tasks.
```

**Процесс реализации:**
1. Read `proposal.md`, `design.md` (if present), и `tasks.md` для подтверждения scope
2. Work through tasks sequentially из `tasks.md`
3. Keep edits minimal и focused на requested change
4. После завершения всех задач: update checklist (`- [ ]` → `- [x]`)
5. Reference `openspec show <id> --json --deltas-only` если нужен дополнительный контекст

**Или использовать Beads для структурированной работы:**

### 3a. Конвертировать tasks.md в Beads issues (опционально)
```bash
# В Cursor:
/openspec-to-beads

add-user-dashboard-redesign
```

**Результат:** Задачи в `.beads/issues.jsonl` (структурированные для Issue Tracking)

### 3b. Работа через Beads
```bash
# Найти задачу
bd ready

# Начать работу
bd start {issue-id}

# В Cursor (для реализации конкретной задачи):
@openspec/changes/add-user-dashboard-redesign/tasks.md
@openspec/changes/add-user-dashboard-redesign/specs/**/spec.md

Task: {issue-id} from tasks.md
Implement according to spec and tasks.
```

### 4. Архивация (после deployment)

```bash
# В Cursor:
/openspec-archive

add-user-dashboard-redesign
```

**Процесс архивации:**
1. Validate change ID через `openspec list` (проверить что change существует и не заархивирован)
2. Run `openspec archive <id> --yes` (или `--skip-specs` для tooling-only work)
3. Review output - проверить что specs обновлены и change перемещен в archive
4. Validate: `openspec validate --strict` для подтверждения корректности

**Результат:** 
- `openspec/changes/archive/YYYY-MM-DD-add-user-dashboard-redesign/`
- Обновленные `openspec/specs/**/spec.md` (если были deltas)

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
bd ready --json

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
cat .beads/issues.jsonl | jq 'select(.status == "done")' | wc -l

# В работе
cat .beads/issues.jsonl | jq 'select(.status == "in_progress")' | wc -l

# Готово к работе
issues | jq 'select(.status == "ready")' | wc -l
```

---

## 🛠️ УПРАВЛЕНИЕ ЗАДАЧАМИ

### Создать задачу вручную
```bash
# Создать задачу
bd create "Название задачи" \
  --epic "epic-name" \
  --priority 1 \
  --estimated-time "1h"

# Пример с приоритетом
bd create "Fix bug" --priority 1 --estimated-time "30min"
```

**Примечание:** Параметры `--blocks` и `--blocked-by` не поддерживаются в текущей версии. Для установки зависимостей используйте редактирование через jq (см. раздел "Обновить задачу").
```

### Обновить задачу
```bash
# Показать задачу (для редактирования вручную)
bd show {issue-id}

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
bd ready | grep "30min\|1h"

# 3. Начать работу
bd start {issue-id}

# 4. Завершить
bd complete {issue-id} && status-gen
git add . && git commit -m "feat: {issue-id}"
```

### Сценарий 2: Длинная сессия (2+ часа)
```bash
# 1. Проверить статус
status-read

# 2. Найти задачу
bd ready

# 3. Начать работу
bd start {issue-id}

# 4. Во время работы - если обнаружил проблему
bd discover "проблема" --from {issue-id}

# 5. Завершить
bd complete {issue-id} && status-gen
git add . && git commit -m "feat: {issue-id}"
```

### Сценарий 3: Начало новой фичи
```bash
# 1. Создать предложение (в Cursor)
/openspec-proposal

Change: add-feature-name
Description: {описание изменения}
Why: {проблема/возможность}
What Changes: {список изменений}
Impact: {затронутые specs и код}

# 2. Валидация
openspec validate add-feature-name --strict

# 3. После approval - реализация
/openspec-apply

@openspec/changes/add-feature-name/proposal.md
@openspec/changes/add-feature-name/tasks.md
@openspec/changes/add-feature-name/specs/**/spec.md

# 4. Опционально - конвертировать в Beads issues
/openspec-to-beads add-feature-name

# 5. Начать реализацию через Beads
bd ready
bd start {issue-id}
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
bd ready
bd start {issue-id}
```

---

## 🚨 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: Задача не показывается как ready
```bash
# Проверить блокировки
bd show {issue-id} | jq '.blocked_by'

# Проверить статус блокирующих задач
for blocker in $(bd show {issue-id} | jq -r '.blocked_by[]?'); do
  bd show $blocker | jq '.status'
done
```

### Проблема: bd не работает
```bash
# Проверить установку Beads CLI
which bd
# Если нет: npm install -g @beads/bd@latest

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

### OpenSpec CLI

```bash
# Pre-work (перед созданием proposal)
openspec list                    # Активные изменения
openspec list --specs            # Существующие спецификации
openspec show <spec-id>          # Детали спецификации
rg -n "Requirement:" openspec/specs  # Поиск требований

# Работа с изменениями
openspec show <change-id>        # Детали изменения
openspec show <change-id> --json --deltas-only  # Только deltas
openspec validate <change-id> --strict  # Валидация (ВСЕГДА --strict!)
openspec validate --strict      # Bulk validation всех изменений

# Архивирование
openspec archive <change-id> --yes  # С обновлением specs
openspec archive <change-id> --skip-specs --yes  # Без обновления specs
```

### Beads CLI

```bash
# Показать готовые задачи
bd ready

# Показать следующую задачу (только ID)
bd ready --json | jq -r '.[0].id // empty'

# Начать работу над первой готовой задачей
NEXT_ID=$(bd ready --json | jq -r '.[0].id // empty')
bd start $NEXT_ID

# Завершение и коммит (замените {issue-id} на реальный ID)
bd complete {issue-id} && status-gen && git add . && git commit -m "feat: {issue-id}"

# Показать текущий статус проекта (JSON)
bd status | jq .
```

---

## 🎯 КЛЮЧЕВЫЕ ПРАВИЛА

### OpenSpec Workflow

1. ✅ **Pre-work перед proposal:** Проверяй `openspec list`, `openspec list --specs`, контекст проекта
2. ✅ **Decision Tree:** Новая фича/breaking change/архитектура → CREATE PROPOSAL, Bug fix/typo/config → Fix directly
3. ✅ **Создавай proposal** для новых фич, breaking changes, архитектурных изменений
4. ✅ **НЕ пиши код на этапе proposal!** Только документы (proposal.md, tasks.md, design.md optional, spec deltas)
5. ✅ **Валидируй proposal** через `openspec validate <id> --strict` - исправляй ВСЕ ошибки перед approval
6. ✅ **Жди явного approval ("Go!")** - 🚫 NO CODE before explicit approval
7. ✅ **Реализуй последовательно** по tasks.md после approval через `/openspec-apply`
8. ✅ **Обновляй checklist** после завершения: `- [ ]` → `- [x]` в tasks.md
9. ✅ **Архивируй после deployment** через `/openspec-archive` с `--yes`

### Beads Issue Tracking

10. ✅ **Всегда читай STATUS.md** в начале сессии
11. ✅ **Одна задача на сессию** (избегай перегрузки)
12. ✅ **Всегда логируй проблемы** через `bd discover`
13. ✅ **Обновляй статус** перед завершением через `status-gen`
14. ✅ **Коммить .beads/** вместе с кодом
15. ✅ **Работай только с ready задачами** - используй `bd ready`

### Decision Tree

**Создавать proposal?**
- ✅ **CREATE PROPOSAL:** Новая фича/функциональность, Breaking changes, Архитектурные изменения, Оптимизация производительности, Security enhancements
- ❌ **Fix directly:** Bug fix (restore intended behavior), Typo/format/comment, Dependency update (non-breaking), Configuration change, Tests for existing behavior

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

> ⚠️ **ВАЖНО:** Эти скрипты используются **только** в legacy LLM-OS scenarios (архивированы в `.archive/legacy-llm-os/scenarios/`), **НЕ** в основном OpenSpec+Beads workflow.
>
> **Для основной работы используйте разделы выше:** "НОВАЯ ФИЧА (OpenSpec)" и "УПРАВЛЕНИЕ ЗАДАЧАМИ".

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

**Мониторинг и коммиты (Legacy):**
```bash
# Мониторинг текущего состояния (legacy - использовал WORKFLOW_STATE.md, теперь заменено на STATUS.md)
llmos-monitor
# или
./monitor.sh

# Атомарный коммит (legacy - использовал WORKFLOW_STATE.md, теперь используем STATUS.md через status-gen)
llmos-step
# или
./step.sh

# Генерация отчета о прогрессе (legacy)
llmos-report
# или
./generate_report.sh
```

**Использование:** Только для legacy LLM-OS scenarios (архивированы в `.archive/legacy-llm-os/scenarios/`), **НЕ** для основного OpenSpec+Beads workflow.

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

**Использование:** Только в legacy LLM-OS scenarios (архивированы), не в OpenSpec+Beads workflow.

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

### OpenSpec + Beads
- **`openspec/AGENTS.md`** - Полные инструкции для AI агентов по OpenSpec
- **`openspec/project.md`** - Контекст проекта и технические стандарты (заменяет `.specify/constitution.md`)
- **`CONTRIBUTING.md`** - Руководство по вкладу в проект (OpenSpec+Beads workflow)
- **`примеры-мультиагентс-воркфлоу.md`** - Примеры мультиагентной разработки
- **`STATUS.md`** - Текущее состояние проекта (генерируется автоматически из Beads)

### Миграция и история
- **`docs/migration-to-openspec-beads.md`** - Описание миграции на OpenSpec+Beads
- **`.archive/legacy-llm-os/`** - Архив старой LLM-OS системы
- **`.archive/legacy-spec-driven/`** - Архив старой Spec-Driven системы (`.specify/constitution.md`)

---

## ⚠️ АРХИВНЫЕ СКРИПТЫ

**Неиспользуемые скрипты перемещены в:**
- `scripts/archive/llm-os-legacy/` - Legacy LLM-OS скрипты
- `scripts/archive/feature-management/` - Legacy feature management
- `scripts/archive/utilities/` - Утилиты (проверить использование)

**Для восстановления:** Скопировать из архива обратно в `scripts/`

---

**Последнее обновление:** 2026-01-08


# 🎯 PROJECT_CONFIG - ROM системы

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

Система построена по принципу "файлы как регистры состояния":
- `PROJECT_CONFIG.md` = ROM (Read-Only Memory) - неизменяемые правила
- `WORKFLOW_STATE.md` = RAM (Random Access Memory) - текущее состояние
- `ROLES/*.md` = Instruction Set - команды для процессоров (агентов)
- `docs/` = Persistent Storage - артефакты проекта

## 🎭 РОЛИ (PROCESSORS)

Каждая роль = специализированный процессор:

| # | Процессор | Инструкции | Выходные регистры |
|---|-----------|------------|-------------------|
| 1 | ANALYST | ROLES/01_analyst.md | docs/requirements/ |
| 2 | ARCHITECT | ROLES/02_architect.md | docs/architecture/ |
| 3 | PM | ROLES/03_pm.md | docs/planning/ |
| 4 | BACKEND_DEV | ROLES/04_backend_dev.md | src/backend/ |
| 5 | FRONTEND_DEV | ROLES/05_frontend_dev.md | src/frontend/ |
| 6 | INFRA_DEVOPS | ROLES/06_infra_devops.md | infra/ |
| 7 | SECURITY | ROLES/09_security.md | docs/security/ |
| 8 | QA | ROLES/07_qa.md | tests/ |
| 9 | DOCS | ROLES/08_docs.md | docs/ |

## 🎭 РОЛИ + РЕВЬЮ (18 этапов)

Каждый этап разработки имеет два подэтапа: EXECUTE (создание артефактов) и REVIEW (проверка качества).

| Этап | Роль | Режим | Статус | Выходные регистры |
|------|------|-------|--------|-------------------|
| 1.1  | ANALYST | EXECUTE | docs/requirements/ |
| 1.2  | ANALYST_REVIEW | REVIEW | docs/requirements/review_report.md |
| 2.1  | ARCHITECT | EXECUTE | docs/architecture/ |
| 2.2  | ARCHITECT_REVIEW | REVIEW | docs/architecture/review_report.md |
| 3.1  | PM | EXECUTE | docs/planning/ |
| 3.2  | PM_REVIEW | REVIEW | docs/planning/review_report.md |
| 4.1  | BACKEND_DEV | EXECUTE | src/backend/ |
| 4.2  | BACKEND_DEV_REVIEW | REVIEW | src/backend/review_report.md |
| 5.1  | FRONTEND_DEV | EXECUTE | src/frontend/ |
| 5.2  | FRONTEND_DEV_REVIEW | REVIEW | src/frontend/review_report.md |
| 6.1  | INFRA_DEVOPS | EXECUTE | infra/ |
| 6.2  | INFRA_DEVOPS_REVIEW | REVIEW | infra/review_report.md |
| 7.1  | SECURITY | EXECUTE | docs/security/ |
| 7.2  | SECURITY_REVIEW | REVIEW | docs/security/review_report.md |
| 8.1  | QA | EXECUTE | tests/ |
| 8.2  | QA_REVIEW | REVIEW | tests/review_report.md |
| 9.1  | DOCS | EXECUTE | docs/ |
| 9.2  | DOCS_REVIEW | REVIEW | docs/review_report.md |

### Правила ревью:

1. **REVIEW выполняется той же ролью**, что и EXECUTE (само-ревью)
2. **Вердикт ревью:**
   - `APPROVED` → переход к следующему этапу
   - `NEEDS_REVISION` → возврат к EXECUTE с комментариями
   - `BLOCKED` → требуется вмешательство OWNER
3. **Артефакт ревью:** `{artifact_dir}/review_report.md` с детальным анализом
4. **Критерии ревью:** указаны в каждом `ROLES/{role}.md` в разделе REVIEW

## 🔄 ЦИКЛ ИСПОЛНЕНИЯ (Fetch-Decode-Execute)

Для каждого агента:
```
FETCH: Читает PROJECT_CONFIG + WORKFLOW_STATE
DECODE: Определяет роль и текущий этап
EXECUTE: Выполняет инструкции из ROLES/
WRITEBACK: Обновляет WORKFLOW_STATE и создает артефакты
```

## 📊 УПРАВЛЕНИЕ СОСТОЯНИЕМ

### Статусы этапов (FSM):
```
EXECUTE: NOT_STARTED → IN_PROGRESS → DONE
REVIEW: NOT_STARTED → IN_PROGRESS → APPROVED / NEEDS_REVISION / BLOCKED
```

### Обработка исключений:
- `BLOCKED` - требуется вмешательство человека
- `NEEDS_REVISION` - найдены ошибки
- `ROLLBACK` - откат к предыдущему состоянию

## 🔐 СТРОГИЕ ПРАВИЛА

### 1. Strict Context Control
- Каждое взаимодействие начинается с чтения WORKFLOW_STATE.md
- Нет "памяти чата" - вся память в файлах
- ИИ не может помнить дольше одной сессии

### 2. Role Separation
- Жесткие границы ответственности
- Нет доступа к чужим артефактам
- Интерфейсы только через WORKFLOW_STATE.md

### 3. Audit Trail
- Все изменения через Git
- Каждый коммит = действие агента
- WORKFLOW_STATE.md = лог транзакций

## 🚀 ПРОТОКОЛ РАБОТЫ

1. **Инициализация**: `git checkout -b feat/{stage}`
2. **Контекстуализация**: Чтение WORKFLOW_STATE.md
3. **Исполнение**: По инструкциям из ROLES/
4. **Фиксация**: Коммит с тегом [ROLE]
5. **Синхронизация**: Обновление WORKFLOW_STATE.md
6. **Передача**: PR + смена current_role

## 📈 МЕТРИКИ КАЧЕСТВА

- **Время на этап**: от NOT_STARTED до DONE
- **Коэффициент переделок**: коммиты revert / всего коммитов
- **Плотность вопросов**: open_questions / выполненные задачи
- **Скорость прогресса**: выполнено задач / время

---

**Версия**: 1.0.0  
**Дата создания**: 2024-01-15  
**Автор**: LLM-OS System


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

## 🎭 ОПТИМИЗИРОВАННАЯ СИСТЕМА: 27 ПРОМПТОВ (TZ + 9 ролей × 2 + OWNER)

Каждый этап разработки имеет **двойной контроль качества**: EXECUTE → PEER-REVIEW

**Оптимизация:** SELF-REVIEW удален (0 ценность, галлюцинации агента). PEER-REVIEW обеспечивает 95% качества.

### Структура (27 этапов):

| # | Этап | Роль | Режим | Промпт | Выходные регистры |
|---|------|------|-------|--------|-------------------|
| **TZ Pipeline (2 этапа)** |
| 0.1 | TZ Analyst | TZ_ANALYST | EXECUTE | `00_tz_analyst.md` | `docs/tz/` |
| 0.2 | TZ Reviewer | TZ_REVIEWER | REVIEW | `00_tz_reviewer.md` | `docs/tz/review_report.md` |
| **ANALYST (2 этапа)** |
| 1.1 | Requirements Execute | ANALYST | EXECUTE | `01_analyst_execute.md` | `docs/requirements/` |
| 1.2 | Requirements Peer-Review | ARCHITECT | PEER-REVIEW | `02_architect_peer_review.md` | `docs/requirements/peer_review_report.md` |
| **ARCHITECT (2 этапа)** |
| 2.1 | Architecture Execute | ARCHITECT | EXECUTE | `03_architect_execute.md` | `docs/architecture/` |
| 2.2 | Architecture Peer-Review | PM | PEER-REVIEW | `04_pm_peer_review.md` | `docs/architecture/peer_review_report.md` |
| **PM (2 этапа)** |
| 3.1 | Planning Execute | PM | EXECUTE | `05_pm_execute.md` | `docs/planning/` |
| 3.2 | Planning Peer-Review | BACKEND_DEV | PEER-REVIEW | `06_backend_peer_review.md` | `docs/planning/peer_review_report.md` |
| **BACKEND_DEV (2 этапа)** |
| 4.1 | Backend Execute | BACKEND_DEV | EXECUTE | `07_backend_execute.md` | `src/backend/` |
| 4.2 | Backend Peer-Review | FRONTEND_DEV | PEER-REVIEW | `08_frontend_peer_review.md` | `src/backend/peer_review_report.md` |
| **FRONTEND_DEV (2 этапа)** |
| 5.1 | Frontend Execute | FRONTEND_DEV | EXECUTE | `09_frontend_execute.md` | `src/frontend/` |
| 5.2 | Frontend Peer-Review | INFRA_DEVOPS | PEER-REVIEW | `10_infra_peer_review.md` | `src/frontend/peer_review_report.md` |
| **INFRA_DEVOPS (2 этапа)** |
| 6.1 | Infra Execute | INFRA_DEVOPS | EXECUTE | `11_infra_execute.md` | `infra/` |
| 6.2 | Infra Peer-Review | QA | PEER-REVIEW | `12_qa_peer_review.md` | `infra/peer_review_report.md` |
| **QA (2 этапа)** |
| 7.1 | QA Execute | QA | EXECUTE | `13_qa_execute.md` | `tests/` |
| 7.2 | QA Peer-Review | SECURITY | PEER-REVIEW | `14_security_peer_review.md` | `tests/peer_review_report.md` |
| **SECURITY (2 этапа)** |
| 8.1 | Security Execute | SECURITY | EXECUTE | `15_security_execute.md` | `docs/security/` |
| 8.2 | Security Peer-Review | DOCS | PEER-REVIEW | `16_docs_peer_review.md` | `docs/security/peer_review_report.md` |
| **DOCS (2 этапа)** |
| 9.1 | Docs Execute | DOCS | EXECUTE | `17_docs_execute.md` | `docs/` |
| 9.2 | Docs Peer-Review | OWNER | PEER-REVIEW | `18_owner_peer_review.md` | `docs/peer_review_report.md` |
| **OWNER (1 этап)** |
| 10.0 | Owner Final Approve | OWNER | FINAL_APPROVE | `19_owner_approve.md` | `docs/owner_final_approval.md` |

**ИТОГО: 2 + 18 + 7 = 27 промптов**

### Правила двойного контроля:

1. **EXECUTE** — создание артефактов (роль создает свои артефакты)
2. **PEER-REVIEW** — кросс-проверка (следующая роль проверяет предыдущую)

**SELF-REVIEW удален:** Агенты не видят свои ошибки (галлюцинации "всё OK"), не генерируют новые insights. PEER-REVIEW обеспечивает 95% качества, что достаточно для production.

### PEER-REVIEW Mapping (цепочка контроля):

- ANALYST → ARCHITECT (проверяет требования)
- ARCHITECT → PM (проверяет архитектуру)
- PM → BACKEND_DEV (проверяет план)
- BACKEND_DEV → FRONTEND_DEV (проверяет API)
- FRONTEND_DEV → INFRA_DEVOPS (проверяет UI)
- INFRA_DEVOPS → QA (проверяет деплой)
- QA → SECURITY (проверяет тесты)
- SECURITY → DOCS (проверяет безопасность)
- DOCS → OWNER (финальная проверка)

### Вердикты:

- **APPROVED** → переход к следующему этапу
- **NEEDS_REVISION** → возврат к EXECUTE с комментариями
- **BLOCKED** → требуется вмешательство OWNER

### Промпты:

Все промпты находятся в `PROMPTS/` и следуют нумерации: `{номер}_{роль}_{режим}.md`

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
PEER-REVIEW: NOT_STARTED → IN_PROGRESS → APPROVED / NEEDS_REVISION / BLOCKED
FINAL_APPROVE: NOT_STARTED → IN_PROGRESS → APPROVED / REJECTED
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


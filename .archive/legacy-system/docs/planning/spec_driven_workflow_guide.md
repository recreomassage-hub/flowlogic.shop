# Spec-Driven Development Workflow Guide

**Версия:** 2.0  
**Дата:** 2025-01-03  
**Статус:** Единый источник истины для всех стадий проекта

---

## 📋 СОДЕРЖАНИЕ

1. [Философия системы](#философия-системы)
2. [Базовый workflow](#базовый-workflow)
3. [Стадии проекта](#стадии-проекта)
   - [MVP (Minimum Viable Product)](#mvp-minimum-viable-product)
   - [Фаза 1 (Post-MVP)](#фаза-1-post-mvp)
   - [Рефакторинг](#рефакторинг)
   - [Мониторинг проекта](#мониторинг-проекта)
   - [Добавление новых фич](#добавление-новых-фич)
   - [Временные изменения в тарифных планах](#временные-изменения-в-тарифных-планах)
   - [Добавление новых упражнений в БД](#добавление-новых-упражнений-в-бд)
   - [Багфиксы](#багфиксы)
   - [Горячие исправления (Hotfix)](#горячие-исправления-hotfix)
   - [Оптимизация производительности](#оптимизация-производительности)
   - [Миграции данных](#миграции-данных)
4. [Интеграция с LLM-OS](#интеграция-с-llm-os)
5. [Чек-листы для каждой стадии](#чек-листы-для-каждой-стадии)

---

## 🎯 ФИЛОСОФИЯ СИСТЕМЫ

### Принципы Spec-Driven Development

1. **Спецификация → План → Задачи → Реализация**
   - Никакого кода без спецификации
   - Никакой реализации без плана
   - Никаких задач без критериев завершения

2. **Единый источник истины**
   - `.specify/constitution.md` = Технические стандарты кода
   - `PROJECT_CONFIG.md` = Правила LLM-OS системы
   - `.specify/features/{name}/spec.md` = Требования фичи

3. **Контроль изменений**
   - Все изменения через Spec-Driven workflow
   - Рефакторинги через PLAN/BUILD (legacy, но совместим)
   - Мелкие правки через diff/patch

4. **Документирование как код**
   - Спецификация = живой документ
   - План = архитектурное решение
   - Задачи = трекинг прогресса

---

## 🔄 БАЗОВЫЙ WORKFLOW

### Текущая стадия проекта: PRODUCTION_READY (Post-MVP)

**Статус:** Проект в production, все базовые фичи реализованы  
**Дата:** 2026-01-06  
**Workflow:** Spec-Driven Development для всех новых фич и изменений

**Характеристики стадии:**
- ✅ MVP завершен и задеплоен в production
- ✅ Базовая инфраструктура работает (AWS Lambda, DynamoDB, S3, Vercel)
- ✅ Core фичи реализованы (Auth, Assessments, Subscriptions, User Management)
- 🔄 Активная разработка новых фич через Spec-Driven workflow
- 🔄 Поддержка и оптимизация существующих фич

**Принципы работы на этой стадии:**
1. **Все новые фичи** → через Spec-Driven (specify → clarify → plan → tasks → implement)
2. **Изменения существующих фич** → через Spec-Driven (если затрагивают 3+ файла)
3. **Мелкие багфиксы** → напрямую (1-2 файла, без изменения API)
4. **Горячие исправления** → напрямую (требуют быстрого деплоя)
5. **Рефакторинги** → через PLAN/BUILD (для больших изменений без новой функциональности)

**Примеры недавних фич:**
- ✅ Export Assessment Report (полный Spec-Driven цикл завершен)
- 🔄 Video Recording для Assessments (в разработке)

### Стандартный цикл (Spec-Driven)

```
1. IDEA → 2. SPECIFY → 3. RESEARCH (опционально) → 4. CLARIFY → 5. PLAN → 6. TASKS → 7. IMPLEMENT → 8. QA → 9. VALIDATE → 10. REVIEW
```

**Примечание:** 
- `/idea` - быстрый старт для начальной идеи (создает базовую структуру spec.md)
- `/specify` - полная спецификация с детальными требованиями
- `research.md` - опциональный этап для сложных интеграций (создается ANALYST ролью)
- `/qa` - QA проверка после реализации
- `/validate` - проверка quality gates перед переходом к следующему этапу

#### Этап 1: SPECIFY (Спецификация)

**Когда:** Для новых фич, изменений в существующих фичах

**Команда:**
```
/specify

Feature: {название фичи}

REQUIREMENTS:
{детальные требования}

SUCCESS CRITERIA:
{критерии успеха}

EDGE CASES:
{граничные случаи}
```

**Результат:** `.specify/features/{name}/spec.md`

**Пример:**
```markdown
Feature: Video Recording for Assessments

REQUIREMENTS:
- User can record video directly in browser (WebRTC)
- Video max duration: 60 seconds
- Video format: WebM (fallback to MP4)
- Upload to S3 using presigned URL from backend
- Show recording progress
- Allow retry if upload fails

SUCCESS CRITERIA:
- Recording starts within 1 second
- Upload completes within 5 seconds for 60s video
- Error handling for camera permissions
- Mobile responsive
```

#### Этап 2: CLARIFY (Уточнение)

**Когда:** После создания spec.md, если есть неясности

**Команда:**
```
/clarify

@spec.md

Review the specification and clarify:
1. Should video be stored permanently or deleted after processing?
2. What happens if user closes browser during recording?
3. Maximum file size for upload?
```

**Результат:** `.specify/features/{name}/clarifications.md`

**Важно:** Все неясности должны быть разрешены ДО создания плана

#### Этап 3: PLAN (Технический план)

**Когда:** После уточнения спецификации

**Команда:**
```
/plan

@constitution.md @spec.md @clarifications.md

Create technical plan for {feature name}
```

**Результат:** `.specify/features/{name}/plan.md`

**Содержание плана:**
- Architecture (архитектурные решения)
- Database Schema (изменения схемы БД)
- API Endpoints (новые/измененные эндпоинты)
- Components (структура компонентов)
- State Management (управление состоянием)
- Integration Points (точки интеграции)
- Dependencies (новые зависимости)

#### Этап 4: TASKS (Разбивка на задачи)

**Когда:** После создания плана

**Команда:**
```
/tasks

@constitution.md @spec.md @plan.md

Break down into implementation tasks.

Each task should:
- Modify 1-3 files max
- Have clear completion criteria
- Be testable independently
```

**Результат:** `.specify/features/{name}/tasks.md`

**Формат задачи:**
```markdown
## Task 1: Database Schema Setup
FILES TO MODIFY:
- src/backend/db/models/Video.ts (create)
DO NOT TOUCH: Other files

COMPLETION CRITERIA:
- Video model created with all required fields
- Migration script created
- Test data seeded

DEPENDENCIES: None
```

#### Этап 5: IMPLEMENT (Реализация)

**Когда:** После создания tasks.md

**Команда:**
```
/implement

@constitution.md @spec.md @plan.md @tasks.md

Task: 1

Implement Task 1: Database Schema Setup
```

**Правила:**
- ✅ Следуй плану ТОЧНО
- ✅ Используй только указанные файлы
- ✅ Следуй naming conventions из constitution
- ❌ НЕ добавляй фичи не из спецификации
- ❌ НЕ используй запрещенные библиотеки

#### Этап 6: QA (QA Проверка) - НОВОЕ

**Когда:** После реализации задачи или всей фичи

**Команда:**
```
/qa

Feature: {название фичи}

Scope: {feature|project|release}
```

**Процесс:**
1. Проверка соответствия реализации spec.md
2. Поиск потенциальных багов и edge cases
3. Проверка покрытия тестами
4. Валидация качества кода

**Результат:** `.specify/features/{name}/qa_report.md`

**Связь с ролью:** Использует инструкции из `ROLES/07_qa.md`

#### Этап 7: VALIDATE (Проверка Quality Gates) - НОВОЕ

**Когда:** После каждого этапа или перед переходом к следующему

**Команда:**
```
/validate

Feature: {название фичи}

Gate: {all|prd|plan|tasks|implementation|review|release}
```

**Процесс:**
1. Проверка quality gates для указанного этапа
2. Валидация готовности к переходу к следующему этапу
3. Создание отчета о статусе gates

**Quality Gates:**
- **PRD_READY**: spec.md заполнен, нет блокирующих вопросов
- **PLAN_APPROVED**: plan.md создан, архитектура описана
- **TASKLIST_READY**: tasks.md создан, задачи разбиты
- **IMPLEMENTATION_OK**: код реализован, тесты написаны
- **REVIEW_OK**: изменения прошли review
- **RELEASE_READY**: фича готова к релизу

**Результат:** Отчет о статусе gates и рекомендации (если gates не пройдены)

#### Этап 8: REVIEW (Ревью)

**Когда:** После реализации каждой задачи или всей фичи

**Процесс:**
1. Проверка кода на соответствие плану
2. Проверка на соответствие constitution
3. Запуск тестов
4. Обновление tasks.md (отметка задачи как выполненной)
5. PEER-REVIEW согласно PROJECT_CONFIG.md

---

## 📊 СТАДИИ ПРОЕКТА

### MVP (Minimum Viable Product)

**Цель:** Создать минимально рабочую версию продукта

**Workflow:**
1. **ANALYST** → Создает PRD с MVP требованиями
2. **ARCHITECT** → Создает архитектуру для MVP
3. **PM** → Планирует MVP спринты
4. **BACKEND_DEV / FRONTEND_DEV** → Реализуют через Spec-Driven

**Пример для MVP фичи "User Authentication":**

#### 1. SPECIFY
```markdown
Feature: User Authentication (MVP)

REQUIREMENTS:
- User can register with email/password
- User can login with email/password
- User can logout
- JWT tokens for authentication
- Email verification (optional for MVP)

SUCCESS CRITERIA:
- Registration completes in < 2 seconds
- Login completes in < 1 second
- Tokens expire after 15 minutes
- Secure password storage (bcrypt)
```

**Файл:** `.specify/features/user-auth-mvp/spec.md`

#### 2. CLARIFY
```markdown
Clarifications:
1. Email verification: Required or optional for MVP?
   → Optional for MVP, required for production

2. Password requirements: Min length, complexity?
   → Min 8 chars, at least 1 letter and 1 number

3. Rate limiting: How many login attempts?
   → 5 attempts per 15 minutes
```

**Файл:** `.specify/features/user-auth-mvp/clarifications.md`

#### 3. PLAN
```markdown
## Architecture

### Database Schema
- Users table: id, email, password_hash, verified, created_at
- Sessions table: id, user_id, token, expires_at

### API Endpoints
- POST /v1/auth/register
- POST /v1/auth/login
- POST /v1/auth/logout
- POST /v1/auth/refresh

### Components
- <RegisterForm /> - Registration form
- <LoginForm /> - Login form
- <AuthProvider /> - Context provider for auth state
```

**Файл:** `.specify/features/user-auth-mvp/plan.md`

#### 4. TASKS
```markdown
## Task 1: Database Schema
FILES: src/backend/db/models/User.ts

## Task 2: Backend API
FILES: src/backend/api/routes/authRoutes.ts, src/backend/api/controllers/authController.ts

## Task 3: Frontend Components
FILES: src/frontend/src/pages/RegisterPage.tsx, src/frontend/src/pages/LoginPage.tsx
```

**Файл:** `.specify/features/user-auth-mvp/tasks.md`

#### 5. IMPLEMENT
Реализация task-by-task через `/implement`

---

### Фаза 1 (Post-MVP)

**Цель:** Добавить фичи после MVP релиза

**Workflow:** Аналогичен MVP, но с учетом существующей кодовой базы

**Особенности:**
- Обязательная проверка интеграции с существующими фичами
- Обязательное тестирование регрессий
- Обновление документации

**Пример: Добавление "Video Recording" после MVP**

#### 1. SPECIFY
```markdown
Feature: Video Recording for Assessments

REQUIREMENTS:
- User can record video during assessment
- Video uploaded to S3
- Video linked to assessment record
- Integration with existing assessment flow

INTEGRATION POINTS:
- Existing: Assessment creation flow
- Existing: S3 bucket configuration
- New: Video recording component
```

**Важно:** Указать все точки интеграции с существующими фичами

#### 2. CLARIFY
Особое внимание на:
- Как интегрируется с существующим assessment flow?
- Используется ли существующий S3 bucket?
- Нужны ли изменения в существующих компонентах?

#### 3. PLAN
Включить:
- Изменения в существующие файлы
- Новые файлы
- Миграции БД (если нужны)
- Обновление существующих API endpoints

#### 4. TASKS
Разбить на задачи с учетом зависимостей от существующего кода

---

### Рефакторинг

**Цель:** Улучшить существующий код без изменения функциональности

**Workflow:** Используется **legacy PLAN/BUILD** (совместим с Spec-Driven)

**Когда использовать PLAN/BUILD:**
- Большие рефакторинги (>10 файлов)
- Миграции архитектуры
- Оптимизация производительности кода

**Когда использовать Spec-Driven:**
- Рефакторинг с добавлением новой функциональности
- Рефакторинг с изменением API

#### Пример: Рефакторинг Authentication Service

**Вариант A: Чистый рефакторинг (PLAN/BUILD)**

```bash
# 1. Сбор контекста
./llmos collect backend-auth

# 2. Создание плана
# Читаем artifacts/PLAN_backend-auth-refactor.md
# Создаем artifacts/PLAN_backend-auth-refactor_plan.md

# 3. Реализация
./llmos build backend-auth-refactor phase-1
```

**Вариант B: Рефакторинг с изменениями (Spec-Driven)**

```
1. /specify → Feature: Authentication Service Refactor
   - Требования: Улучшить структуру, добавить rate limiting
   
2. /plan → План рефакторинга с новыми фичами
   
3. /tasks → Разбивка на задачи
   
4. /implement → Реализация
```

---

### Мониторинг проекта

**Цель:** Отслеживание состояния проекта, метрик, проблем

**Workflow:** Используется **упрощенный workflow** (без Spec-Driven)

**Когда:** Регулярные проверки, не требуют изменений кода

**Процесс:**

1. **Сбор метрик:**
   - CloudWatch Logs
   - Error rates
   - Performance metrics
   - User analytics

2. **Анализ:**
   - Выявление проблем
   - Тренды
   - Аномалии

3. **Документирование:**
   - `docs/monitoring/reports/{date}.md`
   - Обновление `WORKFLOW_STATE.md` если найдены проблемы

**Пример:**

```markdown
# Monitoring Report - 2025-01-03

## Metrics
- API Response Time (p95): 450ms ✅
- Error Rate: 0.1% ✅
- Active Users: 150
- Video Processing Time: 2.3s (avg)

## Issues Found
- None

## Recommendations
- Monitor video processing time (approaching threshold)
```

**Если найдены проблемы:**
- Критичные → Создать Spec-Driven задачу для исправления
- Некритичные → Добавить в backlog

---

### Добавление новых фич

**Цель:** Добавить новую функциональность в продукт

**Workflow:** Полный Spec-Driven цикл

**Процесс:** См. [Базовый workflow](#базовый-workflow)

**Примеры новых фич:**
- Social sharing
- Export reports
- Advanced analytics
- Multi-language support
- Mobile app

**Важно:**
- Всегда начинать с `/specify`
- Проверять интеграцию с существующими фичами
- Обновлять документацию

---

### Временные изменения в тарифных планах

**Цель:** Временно изменить тарифные планы (промо, A/B тест)

**Workflow:** Упрощенный Spec-Driven (без полного цикла)

**Когда:** Временные изменения (< 1 месяца)

**Процесс:**

#### 1. SPECIFY (краткая спецификация)
```markdown
Feature: Temporary Promo Pricing

REQUIREMENTS:
- Basic plan: $2.99/month (was $4.99) for 30 days
- Pro plan: $7.99/month (was $9.99) for 30 days
- Auto-revert after 30 days
- Track promo subscriptions separately

SUCCESS CRITERIA:
- Pricing changes visible immediately
- Auto-revert works correctly
- Analytics track promo vs regular
```

**Файл:** `.specify/features/temp-promo-pricing/spec.md`

#### 2. PLAN (упрощенный)
```markdown
## Changes Required

### Backend
- Update Stripe product prices (temporary)
- Add `is_promo` flag to subscriptions
- Add scheduled job for auto-revert

### Frontend
- Update pricing display
- Add "Limited Time" badge

### Database
- Add `promo_end_date` to subscriptions table
```

**Файл:** `.specify/features/temp-promo-pricing/plan.md`

#### 3. TASKS
```markdown
## Task 1: Backend Price Update
FILES: src/backend/services/subscriptionService.ts

## Task 2: Frontend Display
FILES: src/frontend/src/pages/TiersPage.tsx

## Task 3: Auto-revert Job
FILES: src/backend/jobs/promoRevertJob.ts
```

#### 4. IMPLEMENT
Реализация через `/implement`

**Важно:**
- Документировать дату окончания промо
- Настроить автоматический реверт
- Уведомить пользователей

---

### Добавление новых упражнений в БД

**Цель:** Добавить новые упражнения в базу данных

**Workflow:** Минимальный Spec-Driven (только для структурирования)

**Когда:** Добавление контента, не требует изменений кода

**Процесс:**

#### 1. SPECIFY (минимальная спецификация)
```markdown
Feature: Add New Exercises to Database

REQUIREMENTS:
- Add 10 new exercises to exercises table
- Categories: Strength, Cardio, Flexibility
- Each exercise: name, description, category, difficulty, instructions

SUCCESS CRITERIA:
- All exercises added to database
- Data validated (no duplicates)
- Exercises visible in UI
```

**Файл:** `.specify/features/add-exercises-2025-01/spec.md`

#### 2. PLAN (минимальный)
```markdown
## Changes Required

### Database
- Insert 10 new records into exercises table
- Validate data (no duplicates, valid categories)

### Migration
- Create migration script: migrations/015_add_exercises_2025_01.ts
```

**Файл:** `.specify/features/add-exercises-2025-01/plan.md`

#### 3. TASKS
```markdown
## Task 1: Create Migration Script
FILES: src/backend/db/migrations/015_add_exercises_2025_01.ts

## Task 2: Run Migration
COMMAND: npm run migrate:up

## Task 3: Verify Data
COMMAND: Check exercises in database
```

#### 4. IMPLEMENT
```bash
# Создать migration script
/implement Task 1

# Запустить migration
npm run migrate:up

# Проверить данные
```

**Альтернатива (если не требует кода):**
- Прямое добавление через admin panel
- Импорт через CSV
- Но все равно документировать в `.specify/features/`

---

### Багфиксы

**Цель:** Исправить ошибки в существующем коде

**Workflow:** Упрощенный (без полного Spec-Driven)

**Когда:** Исправление багов, не требует новой функциональности

**Процесс:**

#### 1. Идентификация бага
```markdown
Bug: User cannot login after password reset

Steps to reproduce:
1. Request password reset
2. Click reset link
3. Set new password
4. Try to login
5. Error: "Invalid credentials"

Expected: User can login
Actual: Error message
```

#### 2. Анализ (без Spec-Driven)
- Найти причину в коде
- Определить файлы для изменения
- Создать план исправления (устно или в комментарии)

#### 3. Исправление
- Исправить код
- Добавить тест для бага
- Проверить регрессии

#### 4. Документирование
```markdown
# Bug Fix: Password Reset Login Issue

## Problem
User cannot login after password reset due to token validation issue.

## Solution
Fixed token validation in authController.ts to properly handle reset tokens.

## Files Changed
- src/backend/api/controllers/authController.ts
- src/backend/tests/authController.test.ts

## Test
Added test case for password reset login flow.
```

**Файл:** `docs/bugfixes/2025-01-03-password-reset-login.md`

**Важно:**
- Багфиксы не требуют полного Spec-Driven цикла
- Но должны быть задокументированы
- Критичные баги → могут потребовать Spec-Driven для анализа

---

### Горячие исправления (Hotfix)

**Цель:** Срочное исправление критичных проблем в production

**Workflow:** Минимальный, быстрый процесс

**Когда:** Критичные баги в production, требуют немедленного исправления

**Процесс:**

1. **Идентификация проблемы**
   - Error logs
   - User reports
   - Monitoring alerts

2. **Быстрое исправление**
   - Минимальные изменения
   - Фокус на исправлении, не на рефакторинге
   - Тестирование критичного пути

3. **Деплой**
   - Быстрый деплой в production
   - Мониторинг после деплоя

4. **Документирование (после исправления)**
   ```markdown
   # Hotfix: Critical Authentication Bug
   
   Date: 2025-01-03
   Severity: Critical
   
   Problem: Users cannot login due to JWT validation error
   Solution: Fixed JWT secret validation
   Files: src/backend/config/jwt.ts
   
   Post-deploy: Monitor error rates for 24 hours
   ```

5. **Последующее улучшение (опционально)**
   - После стабилизации → создать Spec-Driven задачу для улучшения
   - Рефакторинг для предотвращения подобных проблем

---

### Оптимизация производительности

**Цель:** Улучшить производительность системы

**Workflow:** Spec-Driven с акцентом на метрики

**Когда:** Производительность ниже целевых показателей

**Процесс:**

#### 1. SPECIFY
```markdown
Feature: API Response Time Optimization

REQUIREMENTS:
- Reduce API response time (p95) from 800ms to 400ms
- Optimize database queries
- Add caching where appropriate
- Maintain functionality (no breaking changes)

SUCCESS CRITERIA:
- API response time (p95) < 400ms
- No increase in error rate
- No breaking changes
- Cache hit rate > 70%
```

#### 2. CLARIFY
```markdown
Clarifications:
1. Which endpoints need optimization?
   → All endpoints with p95 > 500ms

2. Caching strategy?
   → Redis for frequently accessed data

3. Database optimization?
   → Add indexes, optimize queries
```

#### 3. PLAN
```markdown
## Optimization Strategy

### Database
- Add indexes on frequently queried fields
- Optimize N+1 queries
- Add query result caching

### API
- Add response caching (Redis)
- Optimize serialization
- Reduce payload size

### Frontend
- Lazy load components
- Optimize bundle size
- Add service worker caching
```

#### 4. TASKS
Разбить на задачи по областям оптимизации

#### 5. IMPLEMENT
Реализация с постоянным мониторингом метрик

---

### Миграции данных

**Цель:** Изменить структуру данных или перенести данные

**Workflow:** Spec-Driven с акцентом на безопасность

**Когда:** Изменение схемы БД, перенос данных

**Процесс:**

#### 1. SPECIFY
```markdown
Feature: Migrate User Data to New Schema

REQUIREMENTS:
- Add new field `preferred_language` to users table
- Migrate existing data (default: 'en')
- Backward compatible during migration
- Rollback plan if migration fails

SUCCESS CRITERIA:
- All users have preferred_language field
- No data loss
- Migration can be rolled back
- Zero downtime
```

#### 2. CLARIFY
```markdown
Clarifications:
1. Default value for existing users?
   → 'en' (English)

2. Migration strategy?
   → Add column with default, then update in batches

3. Rollback plan?
   → Remove column if migration fails
```

#### 3. PLAN
```markdown
## Migration Strategy

### Phase 1: Add Column
- Add `preferred_language` column with default 'en'
- Deploy code that handles both old and new schema

### Phase 2: Data Migration
- Migrate data in batches (1000 users at a time)
- Monitor for errors

### Phase 3: Cleanup
- Remove backward compatibility code
- Update all queries to use new field
```

#### 4. TASKS
```markdown
## Task 1: Create Migration Script
FILES: src/backend/db/migrations/016_add_preferred_language.ts

## Task 2: Update Models
FILES: src/backend/db/models/User.ts

## Task 3: Data Migration Script
FILES: scripts/migrate_preferred_language.ts

## Task 4: Update API
FILES: src/backend/api/controllers/userController.ts
```

#### 5. IMPLEMENT
Реализация с тестированием на staging перед production

---

## 🔗 ИНТЕГРАЦИЯ С LLM-OS

### Роли и их использование Spec-Driven

#### ANALYST
- **Использует:** `/specify` для создания требований
- **Создает:** `.specify/features/{name}/spec.md` (если нужно)
- **Или:** Создает `docs/requirements/PRD.md` (традиционный подход)

#### ARCHITECT
- **Использует:** `/plan` для создания технических планов
- **Создает:** `.specify/features/{name}/plan.md`
- **Или:** `artifacts/PLAN_{task}_plan.md` (для рефакторингов)

#### PM
- **Использует:** Spec-Driven для планирования фич
- **Создает:** `docs/planning/epics.md` с ссылками на `.specify/features/`

#### BACKEND_DEV / FRONTEND_DEV
- **Использует:** `/tasks` и `/implement` для реализации
- **Следует:** `.specify/constitution.md` для стандартов кода

#### QA
- **Использует:** Spec для создания тестов
- **Проверяет:** Соответствие реализации спецификации

---

## ✅ ЧЕК-ЛИСТЫ ДЛЯ КАЖДОЙ СТАДИИ

### Чек-лист: Новая фича

- [ ] `/specify` → создан spec.md
- [ ] `/clarify` → все неясности разрешены
- [ ] `/plan` → создан plan.md
- [ ] `/tasks` → создан tasks.md
- [ ] `/implement` → все задачи выполнены
- [ ] Тесты написаны и проходят
- [ ] Документация обновлена
- [ ] Code review пройден
- [ ] Деплой на staging
- [ ] Smoke tests пройдены
- [ ] Деплой на production

### Чек-лист: Рефакторинг

- [ ] Определен scope рефакторинга
- [ ] Выбран подход: PLAN/BUILD или Spec-Driven
- [ ] План создан
- [ ] Тесты покрывают существующую функциональность
- [ ] Рефакторинг выполнен
- [ ] Все тесты проходят
- [ ] Производительность не ухудшилась
- [ ] Документация обновлена

### Чек-лист: Багфикс

- [ ] Баг воспроизведен
- [ ] Причина найдена
- [ ] Исправление реализовано
- [ ] Тест для бага добавлен
- [ ] Регрессии проверены
- [ ] Документация обновлена (если нужно)

### Чек-лист: Горячее исправление

- [ ] Проблема идентифицирована
- [ ] Исправление реализовано
- [ ] Критичный путь протестирован
- [ ] Деплой в production
- [ ] Мониторинг после деплоя
- [ ] Документация создана (после стабилизации)

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- `.specify/constitution.md` - Технические стандарты
- `.specify/README.md` - Краткий обзор Spec-Driven
- `.cursor/commands/` - Команды для Cursor
- `docs/planning/spec_driven_integration_plan.md` - План интеграции
- `docs/planning/spec_driven_audit_report.md` - Аудит системы

---

**Этот документ - живой. Обновляйте его при изменении процессов.**

**Последнее обновление:** 2025-01-03


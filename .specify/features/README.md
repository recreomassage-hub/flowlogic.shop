# Features - Retrospective Specifications

**Дата создания:** 2025-01-03  
**Статус:** Ретроспективная документация существующих фич

---

## 📋 СПИСОК ФИЧ

### 1. User Authentication
**Путь:** `.specify/features/user-authentication/spec.md`  
**Статус:** ✅ Документировано  
**Строк:** 256

**Описание:** Система аутентификации через AWS Cognito (регистрация, логин, верификация email, refresh токены).

**Основные компоненты:**
- Registration (POST /v1/auth/register)
- Login (POST /v1/auth/login)
- Email Verification (POST /v1/auth/verify)
- Token Refresh (POST /v1/auth/refresh)
- Logout (POST /v1/auth/logout)

**Файлы:**
- Backend: `src/backend/api/routes/authRoutes.ts`, `src/backend/api/controllers/authController.ts`
- Frontend: `src/frontend/src/pages/RegisterPage.tsx`, `src/frontend/src/pages/LoginPage.tsx`

---

### 2. Assessments
**Путь:** `.specify/features/assessments/spec.md`  
**Статус:** ✅ Документировано  
**Строк:** 315

**Описание:** Система создания и управления оценками движения (MediaPipe тесты). Создание оценок, загрузка видео, получение результатов.

**Основные компоненты:**
- Get Assessments List (GET /v1/assessments)
- Create Assessment (POST /v1/assessments)
- Get Assessment Details (GET /v1/assessments/:id)
- Update Assessment (PUT /v1/assessments/:id)

**Файлы:**
- Backend: `src/backend/api/routes/assessmentRoutes.ts`, `src/backend/api/controllers/assessmentController.ts`
- Frontend: `src/frontend/src/pages/AssessmentsPage.tsx`, `src/frontend/src/pages/AssessmentDetailPage.tsx`

---

### 3. Subscriptions
**Путь:** `.specify/features/subscriptions/spec.md`  
**Статус:** ✅ Документировано  
**Строк:** 283

**Описание:** Система управления подписками через Stripe. Подписка на тарифы (Basic, Pro, Pro+), управление подпиской, отмена.

**Основные компоненты:**
- Get Current Subscription (GET /v1/subscriptions)
- Create Subscription (POST /v1/subscriptions)
- Cancel Subscription (POST /v1/subscriptions/cancel)

**Файлы:**
- Backend: `src/backend/api/routes/subscriptionRoutes.ts`, `src/backend/api/controllers/subscriptionController.ts`
- Frontend: `src/frontend/src/pages/TiersPage.tsx`

---

### 4. User Management
**Путь:** `.specify/features/user-management/spec.md`  
**Статус:** ✅ Документировано  
**Строк:** 183

**Описание:** Управление профилем пользователя: получение текущего пользователя, обновление профиля.

**Основные компоненты:**
- Get Current User (GET /v1/users/me)
- Update Current User (PATCH /v1/users/me)

**Файлы:**
- Backend: `src/backend/api/routes/userRoutes.ts`, `src/backend/api/controllers/userController.ts`
- Frontend: `src/frontend/src/pages/DashboardPage.tsx`

---

## 📊 СТАТИСТИКА

- **Всего фич:** 5 (4 завершено, 1 в разработке)
- **Документировано:** 4 (100% завершенных)
- **В разработке:** 1 (Video Recording - SPEC создан)
- **Всего строк документации:** 1,037+ (Video Recording spec: ~400 строк)

---

## 🔄 ОБНОВЛЕНИЕ СПЕЦИФИКАЦИЙ

**Правило:** При изменении существующей фичи:
1. Обновить соответствующий `spec.md`
2. Добавить новые требования
3. Обновить "KNOWN ISSUES" если проблемы решены
4. Обновить "FUTURE IMPROVEMENTS" если реализовано

**Пример:**
```markdown
# При добавлении OAuth login к аутентификации

1. Открыть .specify/features/user-authentication/spec.md
2. Добавить в REQUIREMENTS:
   - OAuth login (Google, Apple)
3. Обновить FUTURE IMPROVEMENTS (убрать OAuth из списка)
4. Создать tasks.md для реализации
```

---

## 📝 ПРИОРИТЕТЫ ДОКУМЕНТИРОВАНИЯ

### ✅ Завершено (Приоритет 1)
- [x] User Authentication
- [x] Assessments
- [x] Subscriptions
- [x] User Management

### 🔄 В процессе (Приоритет 2)
- [ ] Dashboard (детальная спецификация)
- [x] **Video Recording** ✅ SPEC создан (2026-01-06)
  - Путь: `.specify/features/video-recording/spec.md`
  - Статус: SPEC создан, следующий шаг: CLARIFY
- [x] **Design System** ✅ SPEC создан (2026-01-06)
  - Путь: `.specify/features/design-system/spec.md`
  - Статус: SPEC создан через /idea, следующий шаг: CLARIFY или /specify для расширения
- [ ] MediaPipe Processing (если реализовано)

### 📋 Планируется (Приоритет 3)
- [ ] Progress Tracking
- [ ] Calendar/Tasks
- [ ] Charts/Analytics

---

## 🔗 СВЯЗАННЫЕ ДОКУМЕНТЫ

- `docs/planning/spec_driven_workflow_guide.md` - Workflow для всех стадий
- `docs/planning/migration_to_spec_driven.md` - План миграции
- `.specify/constitution.md` - Технические стандарты

---

**Последнее обновление:** 2025-01-03


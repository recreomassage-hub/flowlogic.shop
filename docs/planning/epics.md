# 📋 Epics & Tasks — Flow Logic

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Основано на:** Architecture Peer-Review, User Stories, PRD 2.1

---

## 📊 Общая статистика

- **Всего эпиков:** 9
- **Всего задач:** 45
- **Общая оценка:** 144 Story Points
- **Временная оценка:** 20-28 недель (реалистично: 24 недели / 6 месяцев)

---

## 🎯 Epic 1: Infrastructure & Foundation

**Приоритет:** P0 (критический путь)  
**Оценка:** 13 SP  
**Время:** 2-3 недели  
**Зависимости:** Нет (блокирует все остальные)

### Задачи:

1. **INFRA-1.1:** AWS Account Setup & IAM Roles
   - Создание AWS аккаунта
   - Настройка IAM ролей и политик
   - Настройка billing alerts
   - **Оценка:** 2 SP
   - **Время:** 2-3 дня

2. **INFRA-1.2:** Serverless Framework Setup
   - Инициализация проекта
   - Настройка serverless.yml
   - Конфигурация environments (dev/staging/prod)
   - **Оценка:** 2 SP
   - **Время:** 2-3 дня

3. **INFRA-1.3:** CI/CD Pipeline (GitHub Actions)
   - Настройка GitHub Actions workflows
   - Автоматический деплой на staging
   - Автоматический деплой на production (с approval)
   - Rollback механизм
   - **Оценка:** 5 SP
   - **Время:** 1 неделя

4. **INFRA-1.4:** Monitoring & Observability Setup
   - CloudWatch dashboards
   - Sentry integration
   - Cost monitoring alerts
   - X-Ray tracing (опционально)
   - **Оценка:** 4 SP
   - **Время:** 1 неделя

---

## 🎯 Epic 2: Database & Data Layer

**Приоритет:** P0 (критический путь)  
**Оценка:** 8 SP  
**Время:** 1-2 недели  
**Зависимости:** Epic 1 (Infrastructure)

### Задачи:

5. **DB-2.1:** DynamoDB Tables Creation
   - Создание 8 таблиц (users, subscriptions, assessments, plans, calendar-tasks, progress, user-limits, migrations)
   - Настройка GSI для всех access patterns
   - KMS encryption setup
   - **Оценка:** 3 SP
   - **Время:** 3-4 дня

6. **DB-2.2:** Migrations Framework
   - Создание migration scripts
   - Versioning system
   - Rollback support
   - Testing migrations
   - **Оценка:** 3 SP
   - **Время:** 3-4 дня

7. **DB-2.3:** Access Patterns Implementation
   - Реализация всех access patterns из db_schema.md
   - Тестирование queries
   - Оптимизация hot partitions
   - **Оценка:** 2 SP
   - **Время:** 2-3 дня

---

## 🎯 Epic 3: Authentication & User Management

**Приоритет:** P0  
**Оценка:** 8 SP  
**Время:** 1 неделя  
**Зависимости:** Epic 2 (Database)

### Задачи:

8. **AUTH-3.1:** AWS Cognito Setup
   - Настройка User Pool
   - Настройка Identity Pool (опционально)
   - JWT token configuration
   - **Оценка:** 2 SP
   - **Время:** 2 дня

9. **AUTH-3.2:** Registration Endpoint
   - POST /auth/register
   - Email validation
   - Password validation (min 8 chars)
   - Wellness disclaimer acceptance
   - Auto-assign Free tier
   - **Оценка:** 2 SP
   - **Время:** 2 дня

10. **AUTH-3.3:** Login Endpoint
    - POST /auth/login
    - JWT token generation (TTL 15 min)
    - Refresh token in httpOnly cookie
    - Error handling
    - **Оценка:** 2 SP
    - **Время:** 2 дня

11. **AUTH-3.4:** User Profile Endpoints
    - GET /users/me
    - PUT /users/me
    - Tier information
    - **Оценка:** 2 SP
    - **Время:** 1 день

---

## 🎯 Epic 4: Subscriptions & Billing (Stripe)

**Приоритет:** P0  
**Оценка:** 13 SP  
**Время:** 2 недели  
**Зависимости:** Epic 3 (Authentication)

### Задачи:

12. **SUB-4.1:** Stripe Integration Setup
    - Stripe account setup
    - API keys configuration
    - Webhook endpoint setup
    - **Оценка:** 2 SP
    - **Время:** 2 дня

13. **SUB-4.2:** Tier Management Endpoints
    - GET /subscriptions/tiers (view available tiers)
    - Tier comparison logic
    - **Оценка:** 2 SP
    - **Время:** 2 дня

14. **SUB-4.3:** Subscription Creation
    - POST /subscriptions (upgrade to paid tier)
    - Stripe Checkout integration
    - Subscription activation
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

15. **SUB-4.4:** Subscription Management
    - POST /subscriptions/cancel
    - Webhook handlers (payment success, failure, cancellation)
    - Auto-downgrade to Free tier
    - Tier gating logic
    - **Оценка:** 4 SP
    - **Время:** 1 неделя

---

## 🎯 Epic 5: Video Upload & S3 Storage

**Приоритет:** P0  
**Оценка:** 8 SP  
**Время:** 1-2 недели  
**Зависимости:** Epic 3 (Authentication), Epic 2 (Database)

### Задачи:

16. **VIDEO-5.1:** S3 Bucket Setup
    - S3 bucket creation
    - CORS configuration
    - Lifecycle policies (Glacier для старых видео)
    - **Оценка:** 2 SP
    - **Время:** 1-2 дня

17. **VIDEO-5.2:** Presigned URL Generation
    - POST /assessments/{id}/upload-url
    - Presigned S3 URL generation
    - Expiration handling
    - **Оценка:** 2 SP
    - **Время:** 2 дня

18. **VIDEO-5.3:** Video Upload Frontend
    - Camera activation
    - Video recording (max 45 sec)
    - Client-side validation (duration, size, motion)
    - Preview & re-record functionality
    - Upload to S3 via presigned URL
    - **Оценка:** 4 SP
    - **Время:** 1 неделя

---

## 🎯 Epic 6: MediaPipe Video Processing

**Приоритет:** P0  
**Оценка:** 34 SP  
**Время:** 4-6 недель  
**Зависимости:** Epic 5 (Video Upload)

### Задачи:

19. **MP-6.1:** MediaPipe Lambda Setup
    - Lambda function creation (Python)
    - ARM64 architecture setup
    - Provisioned concurrency configuration
    - Memory optimization
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

20. **MP-6.2:** MediaPipe Integration
    - MediaPipe pose estimation integration
    - Video processing pipeline
    - Error handling (INVALID, LOW_CONFIDENCE, etc.)
    - **Оценка:** 13 SP
    - **Время:** 2-3 недели

21. **MP-6.3:** Event-Driven Processing
    - EventBridge event publishing (video uploaded)
    - SQS FIFO queue setup
    - Lambda trigger from SQS
    - Retry logic
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

22. **MP-6.4:** Results Processing & Storage
    - Score calculation
    - Problem areas identification
    - Normalized output (pass/limited/significant + confidence)
    - Save to DynamoDB
    - **Оценка:** 8 SP
    - **Время:** 1 неделя

23. **MP-6.5:** Processing Status Endpoints
    - GET /assessments/{id}/status
    - Real-time status updates (polling)
    - Error handling & user notifications
    - **Оценка:** 3 SP
    - **Время:** 3-4 дня

---

## 🎯 Epic 7: Assessment Management & Results

**Приоритет:** P0  
**Оценка:** 13 SP  
**Время:** 2 недели  
**Зависимости:** Epic 6 (MediaPipe Processing)

### Задачи:

24. **ASSESS-7.1:** Assessment Endpoints
    - POST /assessments (start assessment)
    - GET /assessments (list assessments)
    - GET /assessments/{id} (get assessment details)
    - Tier gating (3/3/7/15 tests per month)
    - Attempt limit (3 attempts/test/day)
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

25. **ASSESS-7.2:** Results Display
    - GET /assessments/{id}/results
    - Score visualization
    - Problem areas visualization
    - History view
    - Pro+ detailed breakdown
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

26. **ASSESS-7.3:** Invalid Video Handling
    - Error message display (TOO_LONG, NO_MOTION, BAD_LIGHTING, etc.)
    - Instructions for re-recording
    - Attempt counter
    - Re-record functionality
    - **Оценка:** 3 SP
    - **Время:** 3-4 дня

---

## 🎯 Epic 8: AI Plan Generator (Basic+)

**Приоритет:** P1 (MVP+, не блокирует MVP)  
**Оценка:** 21 SP  
**Время:** 3-4 недели  
**Зависимости:** Epic 7 (Assessment Results)

### Задачи:

27. **PLAN-8.1:** Rule-Based Plan Generator (MVP)
    - Rule engine setup
    - Exercise database
    - Plan generation based on test results (3/7/15)
    - Problem areas mapping to exercises
    - **Оценка:** 13 SP
    - **Время:** 2-3 недели

28. **PLAN-8.2:** Plan Endpoints
    - POST /plans/generate
    - GET /plans/{id}
    - PUT /plans/{id}
    - Tier gating (Basic+ only)
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

29. **PLAN-8.3:** LLM Integration (Optional, Post-MVP)
    - OpenAI/Anthropic API integration
    - Prompt engineering
    - Fallback to rule-based
    - **Оценка:** 3 SP
    - **Время:** 1 неделя (опционально)

---

## 🎯 Epic 9: Smart Calendar (Basic+)

**Приоритет:** P1 (MVP+)  
**Оценка:** 13 SP  
**Время:** 2 недели  
**Зависимости:** Epic 8 (Plan Generator)

### Задачи:

30. **CAL-9.1:** Calendar Endpoints
    - GET /calendar/tasks (daily tasks)
    - POST /calendar/tasks/{id}/complete
    - Task generation (2-4 tasks/day)
    - Streak calculation
    - **Оценка:** 8 SP
    - **Время:** 1-2 недели

31. **CAL-9.2:** Calendar Frontend
    - Daily task list
    - Checkbox completion
    - Streak display
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

---

## 🎯 Epic 10: Progress Dashboard & Charts (Basic+)

**Приоритет:** P1 (MVP+)  
**Оценка:** 8 SP  
**Время:** 2 недели  
**Зависимости:** Epic 9 (Calendar)

### Задачи:

32. **PROG-10.1:** Progress Endpoints
    - GET /progress/stats
    - GET /progress/charts
    - Streak tracking
    - Completion rate
    - Improvements tracking
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

33. **PROG-10.2:** Progress Dashboard Frontend
    - Charts visualization
    - Stats display
    - Progress trends
    - **Оценка:** 3 SP
    - **Время:** 1 неделя

---

## 🎯 Epic 11: Retention Improvements (Pro+)

**Приоритет:** P2 (Post-MVP)  
**Оценка:** 5 SP  
**Время:** 1-2 недели  
**Зависимости:** Epic 10 (Progress Dashboard)

### Задачи:

34. **RET-11.1:** Micro-Reflection & Micro-Coaching
    - Reflection prompts
    - Coaching messages
    - **Оценка:** 2 SP
    - **Время:** 1 неделя

35. **RET-11.2:** Badges & Thresholds
    - Badge system
    - Achievement thresholds
    - **Оценка:** 2 SP
    - **Время:** 1 неделя

36. **RET-11.3:** Auto-Adaptation & Share Card
    - Load auto-adaptation
    - Share card generation
    - **Оценка:** 1 SP
    - **Время:** 3-4 дня

---

## 🎯 Epic 12: Frontend Application

**Приоритет:** P0  
**Оценка:** 13 SP  
**Время:** 2-3 недели  
**Зависимости:** Epic 3 (Auth), Epic 4 (Subscriptions), Epic 7 (Assessments)

### Задачи:

37. **FE-12.1:** React SPA Setup
    - Vercel project setup
    - Routing (React Router)
    - State management (Context API или Zustand)
    - **Оценка:** 3 SP
    - **Время:** 3-4 дня

38. **FE-12.2:** Authentication UI
    - Registration form
    - Login form
    - Wellness disclaimer modal
    - **Оценка:** 2 SP
    - **Время:** 2-3 дня

39. **FE-12.3:** Tier Selection & Subscription UI
    - Tier comparison page
    - Upgrade flow
    - Stripe Checkout integration
    - **Оценка:** 3 SP
    - **Время:** 1 неделя

40. **FE-12.4:** Assessment UI
    - Test list
    - Video recording interface
    - Processing status screen
    - Results display
    - **Оценка:** 5 SP
    - **Время:** 1-2 недели

---

## 🎯 Epic 13: Testing & QA

**Приоритет:** P0  
**Оценка:** 21 SP  
**Время:** 3 недели (параллельно с разработкой)

### Задачи:

41. **QA-13.1:** Unit Tests
    - Backend unit tests (80% coverage)
    - Frontend unit tests
    - **Оценка:** 8 SP
    - **Время:** 1-2 недели

42. **QA-13.2:** Integration Tests
    - API integration tests
    - Database integration tests
    - **Оценка:** 8 SP
    - **Время:** 1-2 недели

43. **QA-13.3:** E2E Tests
    - Critical user flows
    - Video upload flow
    - Subscription flow
    - **Оценка:** 5 SP
    - **Время:** 1 неделя

---

## 📊 Зависимости между эпиками

```
Epic 1 (Infrastructure) → Epic 2 (Database) → Epic 3 (Auth) → Epic 4 (Subscriptions)
                                                              ↓
Epic 5 (Video Upload) → Epic 6 (MediaPipe) → Epic 7 (Assessments) → Epic 8 (Plans)
                                                                          ↓
Epic 9 (Calendar) → Epic 10 (Progress) → Epic 11 (Retention)

Epic 3 (Auth) → Epic 12 (Frontend) ← Epic 4 (Subscriptions)
Epic 7 (Assessments) → Epic 12 (Frontend)

Epic 13 (Testing) - параллельно со всеми эпиками
```

---

## 🎯 Приоритизация для MVP

**P0 (MVP - обязательные):**
- Epic 1: Infrastructure
- Epic 2: Database
- Epic 3: Authentication
- Epic 4: Subscriptions
- Epic 5: Video Upload
- Epic 6: MediaPipe Processing
- Epic 7: Assessment Results
- Epic 12: Frontend (базовая версия)
- Epic 13: Testing

**P1 (MVP+ - после MVP):**
- Epic 8: AI Plan Generator
- Epic 9: Smart Calendar
- Epic 10: Progress Dashboard

**P2 (Post-MVP):**
- Epic 11: Retention Improvements

---

**Итого для MVP:** 109 SP (Epic 1-7, 12-13)  
**Время для MVP:** 16-20 недель (реалистично: 18 недель / 4.5 месяца)




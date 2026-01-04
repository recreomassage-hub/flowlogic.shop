# 📅 Sprint Plan — Flow Logic

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Длительность спринта:** 2 недели  
**Всего спринтов:** 12 (для MVP)

---

## 📊 Общая информация

- **MVP спринтов:** 9 (18 недель)
- **MVP+ спринтов:** 3 (6 недель)
- **Всего:** 12 спринтов (24 недели / 6 месяцев)

---

## 🎯 Sprint 1: Infrastructure Foundation (Weeks 1-2)

**Цель:** Настроить базовую инфраструктуру и CI/CD

### Задачи:
- Epic 1: Infrastructure & Foundation (INFRA-1.1, INFRA-1.2, INFRA-1.3, INFRA-1.4)
- **Story Points:** 13 SP
- **Команда:** DevOps Engineer, Backend Developer

### Deliverables:
- ✅ AWS Account & IAM Roles настроены
- ✅ Serverless Framework проект инициализирован
- ✅ CI/CD Pipeline (GitHub Actions) работает
- ✅ Monitoring & Observability настроены

### Критерии приемки:
- [ ] Автоматический деплой на staging работает
- [ ] Rollback механизм протестирован
- [ ] Cost monitoring alerts настроены
- [ ] CloudWatch dashboards созданы

---

## 🎯 Sprint 2: Database Setup (Weeks 3-4)

**Цель:** Создать базу данных и миграции

### Задачи:
- Epic 2: Database & Data Layer (DB-2.1, DB-2.2, DB-2.3)
- **Story Points:** 8 SP
- **Команда:** Backend Developer

### Deliverables:
- ✅ 8 таблиц DynamoDB созданы
- ✅ Migrations framework работает
- ✅ Access patterns реализованы

### Критерии приемки:
- [ ] Все таблицы созданы с правильными GSI
- [ ] Миграции протестированы (rollback работает)
- [ ] Access patterns покрывают все use cases

---

## 🎯 Sprint 3: Authentication (Weeks 5-6)

**Цель:** Реализовать аутентификацию и управление пользователями

### Задачи:
- Epic 3: Authentication & User Management (AUTH-3.1, AUTH-3.2, AUTH-3.3, AUTH-3.4)
- **Story Points:** 8 SP
- **Команда:** Backend Developer, Frontend Developer

### Deliverables:
- ✅ AWS Cognito настроен
- ✅ Registration endpoint работает
- ✅ Login endpoint работает
- ✅ User profile endpoints работают

### Критерии приемки:
- [ ] Регистрация работает (email validation, password validation, wellness disclaimer)
- [ ] Login работает (JWT + refresh token)
- [ ] User profile endpoints работают
- [ ] Frontend формы регистрации/логина готовы

---

## 🎯 Sprint 4: Subscriptions & Billing (Weeks 7-8)

**Цель:** Интегрировать Stripe и реализовать управление подписками

### Задачи:
- Epic 4: Subscriptions & Billing (SUB-4.1, SUB-4.2, SUB-4.3, SUB-4.4)
- **Story Points:** 13 SP
- **Команда:** Backend Developer, Frontend Developer

### Deliverables:
- ✅ Stripe интеграция работает
- ✅ Tier management endpoints работают
- ✅ Subscription creation работает
- ✅ Subscription management работает

### Критерии приемки:
- [ ] Пользователь может просмотреть доступные тарифы
- [ ] Пользователь может обновить тариф через Stripe
- [ ] Webhooks обрабатываются корректно
- [ ] Tier gating работает

---

## 🎯 Sprint 5: Video Upload (Weeks 9-10)

**Цель:** Реализовать загрузку видео в S3

### Задачи:
- Epic 5: Video Upload & S3 Storage (VIDEO-5.1, VIDEO-5.2, VIDEO-5.3)
- **Story Points:** 8 SP
- **Команда:** Backend Developer, Frontend Developer

### Deliverables:
- ✅ S3 bucket настроен
- ✅ Presigned URL generation работает
- ✅ Video upload frontend готов

### Критерии приемки:
- [ ] Пользователь может записать видео (max 45 sec)
- [ ] Client-side validation работает
- [ ] Видео загружается в S3 через presigned URL
- [ ] Preview & re-record функциональность работает

---

## 🎯 Sprint 6-7: MediaPipe Processing (Weeks 11-14)

**Цель:** Интегрировать MediaPipe и обработать видео

**⚠️ Двойной спринт из-за высокой сложности**

### Задачи:
- Epic 6: MediaPipe Video Processing (MP-6.1, MP-6.2, MP-6.3, MP-6.4, MP-6.5)
- **Story Points:** 34 SP
- **Команда:** Backend Developer (Python), DevOps Engineer

### Deliverables:
- ✅ MediaPipe Lambda настроен (ARM64, provisioned concurrency)
- ✅ MediaPipe интеграция работает
- ✅ Event-driven processing работает
- ✅ Results processing & storage работает
- ✅ Processing status endpoints работают

### Критерии приемки:
- [ ] Видео обрабатывается через MediaPipe
- [ ] Результаты сохраняются в DynamoDB
- [ ] Обработка ошибок работает (INVALID, LOW_CONFIDENCE, etc.)
- [ ] Пользователь видит статус обработки в реальном времени

### Риски:
- ⚠️ MediaPipe на Lambda может иметь проблемы с производительностью
- **Митигация:** Тестирование на раннем этапе, provisioned concurrency, ARM64

---

## 🎯 Sprint 8: Assessment Management (Weeks 15-16)

**Цель:** Реализовать управление тестами и отображение результатов

### Задачи:
- Epic 7: Assessment Management & Results (ASSESS-7.1, ASSESS-7.2, ASSESS-7.3)
- **Story Points:** 13 SP
- **Команда:** Backend Developer, Frontend Developer

### Deliverables:
- ✅ Assessment endpoints работают
- ✅ Results display готов
- ✅ Invalid video handling работает

### Критерии приемки:
- [ ] Пользователь может начать тест
- [ ] Tier gating работает (3/3/7/15 tests per month)
- [ ] Attempt limit работает (3 attempts/test/day)
- [ ] Результаты отображаются корректно
- [ ] Invalid video handling работает с понятными сообщениями

---

## 🎯 Sprint 9: Frontend Integration & MVP Polish (Weeks 17-18)

**Цель:** Интегрировать frontend и завершить MVP

### Задачи:
- Epic 12: Frontend Application (FE-12.1, FE-12.2, FE-12.3, FE-12.4)
- Epic 13: Testing & QA (QA-13.1, QA-13.2, QA-13.3) - параллельно
- **Story Points:** 34 SP (13 FE + 21 QA)
- **Команда:** Frontend Developer, QA Engineer

### Deliverables:
- ✅ React SPA полностью интегрирован
- ✅ Все UI компоненты готовы
- ✅ Unit tests написаны (80% coverage)
- ✅ Integration tests написаны
- ✅ E2E tests покрывают ключевые сценарии

### Критерии приемки:
- [ ] Все user flows работают end-to-end
- [ ] Unit tests покрывают 80% кода
- [ ] Integration tests проходят
- [ ] E2E tests проходят
- [ ] MVP готов к релизу

---

## 🎯 Sprint 10: AI Plan Generator (Weeks 19-20) - MVP+

**Цель:** Реализовать rule-based план генератор

### Задачи:
- Epic 8: AI Plan Generator (PLAN-8.1, PLAN-8.2)
- **Story Points:** 18 SP
- **Команда:** Backend Developer

### Deliverables:
- ✅ Rule-based plan generator работает
- ✅ Plan endpoints работают

### Критерии приемки:
- [ ] План генерируется на основе результатов тестов (3/7/15)
- [ ] Plan endpoints работают
- [ ] Tier gating работает (Basic+ only)

---

## 🎯 Sprint 11: Smart Calendar (Weeks 21-22) - MVP+

**Цель:** Реализовать умный календарь

### Задачи:
- Epic 9: Smart Calendar (CAL-9.1, CAL-9.2)
- **Story Points:** 13 SP
- **Команда:** Backend Developer, Frontend Developer

### Deliverables:
- ✅ Calendar endpoints работают
- ✅ Calendar frontend готов

### Критерии приемки:
- [ ] Daily tasks генерируются (2-4 tasks/day)
- [ ] Task completion работает
- [ ] Streak calculation работает

---

## 🎯 Sprint 12: Progress Dashboard (Weeks 23-24) - MVP+

**Цель:** Реализовать dashboard прогресса

### Задачи:
- Epic 10: Progress Dashboard & Charts (PROG-10.1, PROG-10.2)
- **Story Points:** 8 SP
- **Команда:** Backend Developer, Frontend Developer

### Deliverables:
- ✅ Progress endpoints работают
- ✅ Progress dashboard frontend готов

### Критерии приемки:
- [ ] Charts отображаются корректно
- [ ] Stats отображаются корректно
- [ ] Progress trends визуализированы

---

## 📊 Sprint Summary

| Sprint | Недели | Epic | SP | Статус |
|--------|--------|------|-----|--------|
| 1 | 1-2 | Infrastructure | 13 | NOT_STARTED |
| 2 | 3-4 | Database | 8 | NOT_STARTED |
| 3 | 5-6 | Authentication | 8 | NOT_STARTED |
| 4 | 7-8 | Subscriptions | 13 | NOT_STARTED |
| 5 | 9-10 | Video Upload | 8 | NOT_STARTED |
| 6-7 | 11-14 | MediaPipe | 34 | NOT_STARTED |
| 8 | 15-16 | Assessments | 13 | NOT_STARTED |
| 9 | 17-18 | Frontend + QA | 34 | NOT_STARTED |
| **MVP Total** | **1-18** | **MVP** | **109** | **NOT_STARTED** |
| 10 | 19-20 | Plan Generator | 18 | NOT_STARTED |
| 11 | 21-22 | Calendar | 13 | NOT_STARTED |
| 12 | 23-24 | Progress | 8 | NOT_STARTED |
| **MVP+ Total** | **19-24** | **MVP+** | **39** | **NOT_STARTED** |
| **Grand Total** | **1-24** | **All** | **148** | **NOT_STARTED** |

---

## 🎯 Критический путь

```
Sprint 1 (Infrastructure) 
  → Sprint 2 (Database) 
    → Sprint 3 (Auth) 
      → Sprint 4 (Subscriptions)
        → Sprint 5 (Video Upload)
          → Sprint 6-7 (MediaPipe)
            → Sprint 8 (Assessments)
              → Sprint 9 (Frontend + QA)
```

**Параллельная работа:**
- Sprint 3-4: Frontend разработка может начаться параллельно с Backend
- Sprint 5-8: Frontend разработка продолжается параллельно
- Sprint 9: QA работает параллельно с Frontend integration

---

## ⚠️ Риски и митигация

1. **MediaPipe на Lambda (Sprint 6-7)**
   - **Риск:** Проблемы с производительностью
   - **Митигация:** Тестирование на раннем этапе, provisioned concurrency, ARM64
   - **Buffer:** +1 неделя в Sprint 6-7

2. **Cost превышение**
   - **Риск:** Превышение $50/мес для MVP
   - **Митигация:** Cost monitoring, alerts, optimization strategies
   - **Buffer:** Регулярный review cost

3. **AI Plan Generator (Sprint 10)**
   - **Риск:** Сложность реализации недооценена
   - **Митигация:** Начать с rule-based, опционально LLM API
   - **Buffer:** +1 неделя в Sprint 10

---

## 📈 Метрики успеха

- **Sprint Velocity:** 13-18 SP per sprint (реалистично)
- **MVP Completion:** 18 недель (9 спринтов)
- **MVP+ Completion:** 24 недели (12 спринтов)
- **Cost Target:** ≤ $50/мес для MVP







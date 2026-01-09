# 🏗️ C4 Diagrams — Flow Logic Architecture

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Источник требований:** `docs/requirements/PRD.md` (PRD 2.1) — **единственный источник истины для всех агентов**

---

## 📊 Level 1: System Context Diagram

```mermaid
C4Context
    title System Context - Flow Logic Platform

    Person(user, "User", "B2C пользователь 18-65 лет, использует платформу для оценки качества движения")
    
    System(flowlogic, "Flow Logic", "B2C платформа для оценки качества движения через MediaPipe и коррекции через AI-план")
    
    System_Ext(stripe, "Stripe", "Платежная система для обработки подписок")
    System_Ext(cognito, "AWS Cognito", "Сервис аутентификации и управления пользователями")
    System_Ext(s3, "AWS S3", "Хранилище видео файлов")
    System_Ext(mediapipe, "MediaPipe", "Google CV решение для оценки позы (внешняя библиотека)")
    
    Rel(user, flowlogic, "Использует", "HTTPS")
    Rel(flowlogic, stripe, "Обрабатывает платежи", "HTTPS/API")
    Rel(flowlogic, cognito, "Аутентификация", "HTTPS/API")
    Rel(flowlogic, s3, "Хранит видео", "HTTPS/API")
    Rel(flowlogic, mediapipe, "Анализирует видео", "Library")
```

---

## 📦 Level 2: Container Diagram

```mermaid
C4Container
    title Container Diagram - Flow Logic Platform
    
    Person(user, "User", "B2C пользователь")
    
    Container_Boundary(web, "Web Application") {
        Container(spa, "React SPA", "React, TypeScript", "Пользовательский интерфейс, загружается на Vercel")
    }
    
    Container_Boundary(api, "API Layer") {
        Container(apigw, "API Gateway", "AWS API Gateway", "REST API endpoint, rate limiting, WAF")
        Container(lambda_api, "API Lambda", "Node.js/TypeScript", "Обработка API запросов, бизнес-логика")
        Container(lambda_test, "Test Engine Lambda", "Python", "Обработка видео через MediaPipe")
        Container(lambda_plan, "Plan Generator Lambda", "Python/Node.js", "Генерация AI планов коррекции")
    }
    
    Container_Boundary(data, "Data Layer") {
        ContainerDb(dynamodb, "DynamoDB", "NoSQL Database", "Хранит пользователей, подписки, результаты тестов, планы")
        Container(s3_videos, "S3 Videos", "AWS S3", "Хранит видео файлы пользователей")
    }
    
    Container_Boundary(auth, "Authentication") {
        Container(cognito_auth, "Cognito", "AWS Cognito", "Аутентификация, JWT токены")
    }
    
    Container_Boundary(messaging, "Messaging") {
        Container(eventbridge, "EventBridge", "AWS EventBridge", "Event-driven архитектура, триггеры")
        Container(sqs, "SQS FIFO", "AWS SQS", "Очередь для обработки видео с retry логикой")
    }
    
    Container_Boundary(monitoring, "Observability") {
        Container(cloudwatch, "CloudWatch", "AWS CloudWatch", "Метрики, логи, алерты")
        Container(sentry, "Sentry", "Sentry.io", "Error tracking и мониторинг")
    }
    
    Container_Boundary(payment, "Payment") {
        System_Ext(stripe_api, "Stripe API", "Stripe", "Обработка подписок и платежей")
    }
    
    Rel(user, spa, "Использует", "HTTPS")
    Rel(spa, apigw, "API Calls", "HTTPS/REST")
    Rel(apigw, lambda_api, "Routes requests", "Lambda Invoke")
    Rel(apigw, cognito_auth, "Validates JWT", "HTTPS")
    Rel(lambda_api, dynamodb, "Reads/Writes", "DynamoDB API")
    Rel(lambda_api, s3_videos, "Uploads videos", "S3 API")
    Rel(lambda_api, eventbridge, "Publishes events", "EventBridge API")
    Rel(eventbridge, lambda_test, "Triggers processing", "Lambda Invoke")
    Rel(eventbridge, sqs, "Sends to queue", "SQS API")
    Rel(sqs, lambda_test, "Processes video", "Lambda Invoke")
    Rel(lambda_test, s3_videos, "Reads video", "S3 API")
    Rel(lambda_test, dynamodb, "Saves results", "DynamoDB API")
    Rel(lambda_api, lambda_plan, "Generates plan", "Lambda Invoke")
    Rel(lambda_plan, dynamodb, "Saves plan", "DynamoDB API")
    Rel(lambda_api, stripe_api, "Creates subscription", "HTTPS/API")
    Rel(lambda_api, cloudwatch, "Publishes metrics", "CloudWatch API")
    Rel(lambda_api, sentry, "Reports errors", "HTTPS/API")
```

---

## 🔧 Level 3: Component Diagram (API Lambda)

```mermaid
C4Component
    title Component Diagram - API Lambda
    
    Container(api_lambda, "API Lambda", "Node.js/TypeScript", "Обработка API запросов")
    
    Component(router, "Router", "Express/Serverless", "Маршрутизация запросов")
    Component(auth_middleware, "Auth Middleware", "JWT validation", "Проверка аутентификации")
    Component(tier_middleware, "Tier Middleware", "Tier gating", "Проверка доступа по тарифу")
    
    Component(users_handler, "Users Handler", "Business logic", "Управление пользователями")
    Component(assessments_handler, "Assessments Handler", "Business logic", "Управление тестами")
    Component(results_handler, "Results Handler", "Business logic", "Управление результатами")
    Component(plans_handler, "Plans Handler", "Business logic", "Управление планами (Basic+)")
    Component(calendar_handler, "Calendar Handler", "Business logic", "Управление календарем (Basic+)")
    Component(subscriptions_handler, "Subscriptions Handler", "Business logic", "Управление подписками")
    
    Component(users_repo, "Users Repository", "Data access", "Доступ к таблице users")
    Component(assessments_repo, "Assessments Repository", "Data access", "Доступ к таблице assessments")
    Component(plans_repo, "Plans Repository", "Data access", "Доступ к таблице plans")
    Component(subscriptions_repo, "Subscriptions Repository", "Data access", "Доступ к таблице subscriptions")
    
    Component(stripe_service, "Stripe Service", "External API", "Интеграция со Stripe")
    Component(s3_service, "S3 Service", "AWS SDK", "Загрузка видео в S3")
    Component(eventbridge_service, "EventBridge Service", "AWS SDK", "Публикация событий")
    
    Rel(router, auth_middleware, "Validates")
    Rel(auth_middleware, tier_middleware, "Checks tier")
    Rel(tier_middleware, users_handler, "Routes")
    Rel(tier_middleware, assessments_handler, "Routes")
    Rel(tier_middleware, results_handler, "Routes")
    Rel(tier_middleware, plans_handler, "Routes (Basic+)")
    Rel(tier_middleware, calendar_handler, "Routes (Basic+)")
    Rel(tier_middleware, subscriptions_handler, "Routes")
    
    Rel(users_handler, users_repo, "Uses")
    Rel(assessments_handler, assessments_repo, "Uses")
    Rel(plans_handler, plans_repo, "Uses")
    Rel(subscriptions_handler, subscriptions_repo, "Uses")
    
    Rel(users_handler, stripe_service, "Creates subscription")
    Rel(assessments_handler, s3_service, "Uploads video")
    Rel(assessments_handler, eventbridge_service, "Publishes event")
```

---

## 📝 Примечания к диаграммам

### Ключевые компоненты:

1. **Frontend (React SPA)**
   - Развертывается на Vercel
   - Коммуницирует с API через REST
   - Управляет состоянием через React Context/Redux

2. **API Layer**
   - API Gateway: точка входа, rate limiting, WAF
   - API Lambda: основная бизнес-логика
   - Test Engine Lambda: обработка видео через MediaPipe
   - Plan Generator Lambda: генерация AI планов

3. **Data Layer**
   - DynamoDB: все данные приложения (users, assessments, plans, subscriptions)
   - S3: хранение видео файлов

4. **Messaging**
   - EventBridge: event-driven архитектура
   - SQS FIFO: очередь для обработки видео с retry логикой

5. **External Services**
   - Cognito: аутентификация
   - Stripe: платежи
   - MediaPipe: анализ видео (library)

### Потоки данных:

1. **Video Upload Flow:**
   - User → SPA → API Gateway → API Lambda → S3
   - S3 → EventBridge → Test Engine Lambda → MediaPipe → DynamoDB

2. **Plan Generation Flow:**
   - Assessment completed → EventBridge → Plan Generator Lambda → DynamoDB

3. **Subscription Flow:**
   - User → SPA → API Gateway → API Lambda → Stripe → DynamoDB

---

**Следующий уровень:** Component diagrams для каждого Lambda handler (опционально, для детального проектирования)


# 🛠️ Technology Stack — Flow Logic

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Источник требований:** `docs/requirements/PRD.md` (PRD 2.1) — **единственный источник истины для всех агентов**

---

## 📊 Обзор

Flow Logic построен на **serverless архитектуре AWS** с использованием современных технологий для обеспечения масштабируемости, надежности и низкой стоимости.

---

## 🎨 Frontend

### Основные технологии
- **Framework:** React 18+ (TypeScript)
- **Build Tool:** Vite / Next.js (опционально)
- **State Management:** React Context API / Zustand
- **UI Library:** Tailwind CSS + Headless UI / Radix UI
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios / Fetch API
- **Charts:** Recharts / Chart.js
- **Video Recording:** MediaRecorder API

### Deployment
- **Platform:** Vercel
- **CDN:** Vercel Edge Network (автоматически)
- **Domain:** flowlogic.shop

### Performance Targets
- **Page Load Time:** < 2s (mobile, 3G)
- **Dashboard Load Time:** < 3s (mobile)
- **Time to Interactive:** < 3.5s

---

## ⚙️ Backend

### API Layer
- **Runtime:** Node.js 20+ (TypeScript)
- **Framework:** Express.js / Serverless Framework
- **API Gateway:** AWS API Gateway (REST)
- **Authentication:** AWS Cognito (JWT)
- **Rate Limiting:** API Gateway throttling + WAF

### Lambda Functions

#### API Lambda
- **Runtime:** Node.js 20.x (ARM64)
- **Memory:** 512MB - 1024MB (в зависимости от tier)
- **Timeout:** 15-30s
- **Architecture:** ARM64 (для Pro+)
- **Framework:** Serverless Framework / AWS SAM

#### Test Engine Lambda
- **Runtime:** Python 3.11+
- **Memory:** 1024MB - 2048MB
- **Timeout:** 30-60s
- **Libraries:**
  - MediaPipe Pose
  - MediaPipe Face Mesh (опционально)
  - NumPy, OpenCV
- **Architecture:** ARM64 (для оптимизации стоимости)

#### Plan Generator Lambda
- **Runtime:** Python 3.11+ / Node.js 20.x
- **Memory:** 512MB - 1024MB
- **Timeout:** 20-30s
- **AI/ML:** 
  - Rule-based engine (MVP)
  - Опционально: OpenAI API / Anthropic Claude (для Pro+)

---

## 🗄️ Data Layer

### Primary Database
- **Database:** AWS DynamoDB
- **Billing Mode:** PAY_PER_REQUEST (on-demand)
- **Encryption:** KMS (SSE-KMS)
- **Streams:** Enabled (для event-driven архитектуры)
- **Backup:** Point-in-time recovery (PITR)

### Storage
- **Video Storage:** AWS S3
- **Bucket:** `flowlogic-{stage}-videos`
- **Encryption:** SSE-S3 (KMS для production)
- **Lifecycle:** 
  - Transition to Glacier после 30 дней
  - Delete после 90 дней (GDPR compliance)
- **CDN:** CloudFront (для статических ассетов)

---

## 🔐 Authentication & Authorization

- **Service:** AWS Cognito
- **User Pools:** Email/Password authentication
- **JWT Tokens:**
  - Access Token: 15 минут TTL
  - Refresh Token: 30 дней (httpOnly cookie)
- **MFA:** Опционально (для будущих версий)

---

## 💳 Payment Processing

- **Provider:** Stripe
- **Products:** 
  - Basic: $4.99/month
  - Pro: $9.99/month
  - Pro+: $19.99/month
- **Webhooks:** Stripe → API Gateway → Lambda
- **Subscription Management:** Stripe Billing Portal

---

## 📨 Messaging & Events

### Event-Driven Architecture
- **Event Bus:** AWS EventBridge
- **Rules:** Event routing для Lambda triggers
- **Event Types:**
  - `video.uploaded` → Test Engine Lambda
  - `assessment.completed` → Plan Generator Lambda
  - `subscription.updated` → User Limits Lambda

### Queue
- **Service:** AWS SQS FIFO
- **Use Case:** Video processing retry logic
- **Dead Letter Queue:** Для failed processing

---

## 📊 Observability & Monitoring

### Logging
- **Service:** AWS CloudWatch Logs
- **Log Groups:** По Lambda функциям
- **Retention:** 7 дней (staging), 30 дней (production)
- **Structured Logging:** JSON format

### Metrics
- **Service:** AWS CloudWatch Metrics
- **Custom Metrics:**
  - API latency (p50, p95, p99)
  - Video processing time
  - Error rates
  - Tier distribution
- **Alarms:** SNS notifications для критических метрик

### Error Tracking
- **Service:** Sentry.io
- **Integration:** Lambda layers
- **Features:**
  - Error aggregation
  - Performance monitoring
  - Release tracking

### Tracing (Optional)
- **Service:** AWS X-Ray
- **Use Case:** Distributed tracing для сложных flows

---

## 🚀 CI/CD

### Frontend
- **Platform:** Vercel
- **Git Integration:** GitHub
- **Deployment:** Автоматический при push в `main`
- **Preview:** Автоматические preview для PR
- **Build:** `npm run build`

### Backend
- **Platform:** GitHub Actions
- **Framework:** Serverless Framework
- **Stages:** `dev`, `staging`, `production`
- **Deployment Steps:**
  1. Lint & Test
  2. Build
  3. Deploy to AWS (Serverless Framework)
  4. Run smoke tests
  5. Rollback при ошибках

### Infrastructure
- **IaC:** Serverless Framework (DynamoDB, Lambda, API Gateway)
- **Terraform:** Опционально для сложной инфраструктуры

---

## 🔒 Security

### Encryption
- **At Rest:** KMS (DynamoDB, S3)
- **In Transit:** TLS 1.3
- **Secrets:** AWS Secrets Manager / Parameter Store

### Network
- **WAF:** AWS WAF (API Gateway)
- **Rate Limiting:** API Gateway throttling
- **CORS:** Настроен для flowlogic.shop

### Compliance
- **GDPR:** Data retention policies, right to deletion
- **Wellness Disclaimer:** Обязательное согласие пользователя

---

## 📦 Dependencies Management

### Frontend
- **Package Manager:** npm / pnpm
- **Lock File:** `package-lock.json` / `pnpm-lock.yaml`
- **Dependency Updates:** Dependabot (GitHub)

### Backend
- **Package Manager:** npm (Node.js) / pip (Python)
- **Lock Files:** `package-lock.json`, `requirements.txt`
- **Dependency Updates:** Dependabot

---

## 🧪 Testing

### Frontend
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright / Cypress
- **Coverage Target:** 80%+

### Backend
- **Unit Tests:** Jest (Node.js) / pytest (Python)
- **Integration Tests:** AWS SAM Local / LocalStack
- **Smoke Tests:** Post-deployment validation

---

## 💰 Cost Optimization

### Targets (из PRD)
- **MVP (0-100 users):** ≤ $50/мес
- **Early Stage (100-1000 users):** ≤ $100/мес
- **Growth (1000-5000 users):** ≤ $320/мес

### Strategies
- **DynamoDB:** PAY_PER_REQUEST (автоматическое масштабирование)
- **Lambda:** ARM64 архитектура (до 20% экономии)
- **S3:** Lifecycle policies (Glacier для старых видео)
- **CloudFront:** Кэширование статических ассетов
- **Reserved Capacity:** Опционально для стабильных нагрузок

---

## 🔄 Migration & Versioning

### Database Migrations
- **Framework:** Custom migration scripts (JavaScript)
- **Location:** `packages/backend/migrations/`
- **Versioning:** Sequential (001, 002, ...)
- **Rollback:** Supported

### API Versioning
- **Strategy:** URL versioning (`/v1/`, `/v2/`)
- **Backward Compatibility:** Минимум 1 версия назад

---

## 📚 Documentation

### API Documentation
- **Format:** OpenAPI 3.0 (Swagger)
- **Location:** `docs/architecture/api_spec.yaml`
- **Hosting:** Swagger UI (опционально)

### Code Documentation
- **TypeScript:** JSDoc comments
- **Python:** Docstrings (Google style)

---

## 🎯 Future Considerations

### Potential Additions
- **GraphQL API:** Опционально для сложных queries
- **Redis Cache:** Для часто запрашиваемых данных
- **Elasticsearch:** Для поиска и аналитики
- **Multi-language:** i18n поддержка (после MVP)

---

**Следующий шаг:** ADR (Architecture Decision Records)


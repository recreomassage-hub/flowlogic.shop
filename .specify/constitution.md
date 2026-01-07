# Constitution - Flow Logic Platform

**Версия:** 1.0  
**Дата создания:** 2025-01-03  
**Источник:** Извлечено из существующей кодовой базы

**ВАЖНО:** Этот документ содержит технические стандарты кода.  
Для правил LLM-OS системы см. `PROJECT_CONFIG.md`.  
Для workflow всех стадий проекта см. `docs/planning/spec_driven_workflow_guide.md`.

---

## STACK & VERSIONS

### Frontend
- **Framework:** React 18.2.0
- **Language:** TypeScript 5.3.3
- **Build Tool:** Vite 5.0.8
- **Styling:** Tailwind CSS 3.3.6
- **State Management:** Zustand 4.4.7
- **Routing:** React Router DOM 6.20.1
- **HTTP Client:** Axios 1.6.2
- **Forms:** React Hook Form 7.48.2 + Zod 3.22.4
- **Charts:** Recharts 2.10.3
- **Node.js:** >= 22.0.0

### Backend
- **Runtime:** Node.js 20.x (ARM64)
- **Language:** TypeScript 5.3.3
- **Framework:** Express 4.18.2
- **Serverless:** Serverless Framework 3.38.0
- **AWS SDK:** v3 (@aws-sdk/client-*)
- **Authentication:** AWS Cognito + JWT
- **Database:** AWS DynamoDB
- **Storage:** AWS S3
- **Memory:** 512MB - 1024MB
- **Timeout:** 30s

### Infrastructure
- **Cloud Provider:** AWS
- **Region:** us-east-1
- **API Gateway:** REST API
- **Lambda:** Node.js 20.x ARM64
- **Database:** DynamoDB (PAY_PER_REQUEST)
- **Storage:** S3 (SSE-S3/KMS encryption)
- **Auth:** Cognito User Pools
- **Payment:** Stripe 14.7.0
- **Deployment:** Serverless Framework + Vercel (frontend)

### Testing
- **Unit Tests:** Jest 29.7.0
- **E2E Tests:** Playwright 1.40.1
- **Coverage Target:** 70% business logic, 50% UI

---

## NAMING CONVENTIONS

### Files
- **Components:** PascalCase (AssessmentsPage.tsx, AssessmentDetailPage.tsx)
- **Utilities:** camelCase (client.ts, auth.ts)
- **API Routes:** kebab-case (/api/v1/auth/register)
- **Database Tables:** kebab-case (flowlogic-production-users)
- **Config Files:** lowercase (serverless.yml, package.json)

### Code
- **Functions:** camelCase (getAssessments, createAssessment)
- **Classes:** PascalCase (SubscriptionModel)
- **Types/Interfaces:** PascalCase (Assessment, CreateAssessmentRequest)
- **Constants:** UPPER_SNAKE_CASE (COGNITO_CLIENT_ID, API_BASE_URL)
- **Variables:** camelCase (assessmentId, uploadUrl)
- **Props:** camelCase (assessmentId, onComplete)

### Exports
- **Named exports:** Preferred (export function, export const)
- **Default exports:** Only for routes (export default router)
- **Type exports:** export interface, export type

---

## ARCHITECTURE PRINCIPLES

### Backend Structure
```
src/backend/
├── api/
│   ├── controllers/    # Request handlers (authController.ts)
│   ├── routes/         # Route definitions (authRoutes.ts)
│   └── middleware/     # Auth, validation, error handling
├── services/           # Business logic
├── config/             # Configuration (cognito.ts, s3.ts, database.ts)
├── db/
│   └── models/         # DynamoDB models (Subscription.ts)
└── utils/              # Pure utilities
```

**Rules:**
- Business logic ONLY in `/services/`
- Controllers handle HTTP, delegate to services
- Config files export clients and constants
- Models encapsulate database operations
- NO business logic in controllers

### Frontend Structure
```
src/frontend/src/
├── api/                # API client functions (client.ts, auth.ts, assessments.ts)
├── components/
│   ├── common/         # Shared components (Layout.tsx, ProtectedRoute.tsx)
│   └── features/       # Feature-specific components
├── pages/              # Page components (AssessmentsPage.tsx)
├── store/              # Zustand stores (authStore.ts)
├── hooks/              # Custom React hooks
├── utils/              # Pure utilities
└── styles/             # Global styles (index.css)
```

**Rules:**
- Pages in `/pages/`, components in `/components/`
- API client in `/api/` with typed interfaces
- State management: Zustand stores in `/store/`
- NO prop drilling beyond 2 levels - use Zustand
- NO business logic in components - use services/hooks

### API Design
- **Base URL:** Environment-based (VITE_API_URL or fallback)
- **Versioning:** `/v1/` prefix (e.g., `/v1/auth/register`)
- **Routes:** Express Router with controller functions
- **Response Format:** JSON with consistent structure
- **Error Handling:** Express error middleware
- **Authentication:** JWT in Authorization header or httpOnly cookies

### State Management
- **Frontend:** Zustand for shared state
- **Local State:** useState for component-specific state
- **Form State:** react-hook-form
- **URL State:** useSearchParams, useLocation
- **NO Redux, NO Context API for global state**

---

## FILE ORGANIZATION

### Backend Files
- **Controllers:** `{feature}Controller.ts` (authController.ts)
- **Routes:** `{feature}Routes.ts` (authRoutes.ts)
- **Services:** `{feature}Service.ts` (if needed)
- **Models:** `{Model}.ts` (Subscription.ts)
- **Config:** `{service}.ts` (cognito.ts, s3.ts, database.ts)

### Frontend Files
- **Pages:** `{Feature}Page.tsx` (AssessmentsPage.tsx)
- **Components:** `{Component}.tsx` (Layout.tsx)
- **API:** `{feature}.ts` (auth.ts, assessments.ts)
- **Stores:** `{feature}Store.ts` (authStore.ts)
- **Types:** In same file or `types.ts` if shared

### Import Order
1. React/React Router imports
2. Third-party libraries
3. API clients
4. Components
5. Utils/hooks
6. Types/interfaces
7. Styles (if needed)

---

## LIBRARY RULES

### ✅ ALLOWED Libraries

**Frontend:**
- React 18.2+ (core)
- React Router DOM 6.20+ (routing)
- Zustand 4.4+ (state management)
- Axios 1.6+ (HTTP client)
- React Hook Form 7.48+ (forms)
- Zod 3.22+ (validation)
- Recharts 2.10+ (charts)
- Tailwind CSS 3.3+ (styling)
- clsx, tailwind-merge (utilities)

**Backend:**
- Express 4.18+ (web framework)
- AWS SDK v3 (AWS services)
- Zod 3.22+ (validation)
- uuid 9.0+ (ID generation)
- jsonwebtoken 9.0+ (JWT)
- serverless-http 3.2+ (Lambda adapter)

**Infrastructure:**
- Serverless Framework 3.38+ (deployment)
- Stripe 14.7+ (payments)

### ❌ FORBIDDEN Libraries

- **Redux** (use Zustand)
- **Moment.js** (use native Date or date-fns if needed)
- **jQuery** (obviously)
- **CSS-in-JS libraries** (use Tailwind CSS)
- **Any state management except Zustand**
- **Axios in backend** (use native fetch or AWS SDK)
- **Any deprecated packages**

---

## SECURITY & COMPLIANCE

### Authentication
- **Service:** AWS Cognito User Pools
- **JWT Tokens:** Access token (15min) + Refresh token (30 days)
- **Storage:** httpOnly cookies (preferred) or Authorization header
- **Token Refresh:** Automatic via Axios interceptor (frontend)

### Validation
- **All user inputs:** MUST be validated with Zod
- **Backend:** Zod schemas in controllers
- **Frontend:** Zod schemas with react-hook-form
- **API:** Validate all request bodies

### Data Protection
- **Encryption at Rest:** KMS (DynamoDB), SSE-S3/KMS (S3)
- **Encryption in Transit:** TLS 1.3
- **Secrets:** AWS SSM Parameter Store, NOT in code
- **PII Data:** Encrypted, GDPR compliant retention policies

### API Security
- **CORS:** Configured per environment in API Gateway
- **Rate Limiting:** API Gateway throttling
- **WAF:** AWS WAF (optional, for production)
- **Error Messages:** No stack traces to frontend

### Compliance
- **GDPR:** Data retention policies, right to deletion
- **Wellness Disclaimer:** Required user consent
- **Audit Logs:** CloudWatch Logs (7-30 days retention)

---

## ERROR HANDLING

### Backend
- **Express Error Middleware:** Centralized error handling
- **Error Types:** Custom error classes if needed
- **Logging:** CloudWatch Logs with structured JSON
- **Response Format:** `{ error: string, message: string }`

### Frontend
- **Axios Interceptors:** Handle 401/403 redirects
- **Error Boundaries:** React error boundaries for UI errors
- **User Messages:** User-friendly messages, no technical details
- **Console Logging:** Development only, remove in production

### Error Flow
1. Backend catches error
2. Logs to CloudWatch
3. Returns user-friendly message
4. Frontend displays message
5. Critical errors trigger alerts

---

## TESTING

### Unit Tests
- **Framework:** Jest 29.7.0
- **Location:** `tests/unit/`
- **Naming:** `{feature}.test.ts`
- **Coverage:** 70% for business logic

### Integration Tests
- **Framework:** Jest with test AWS resources
- **Location:** `tests/integration/`
- **Setup:** Test DynamoDB tables, mock AWS services

### E2E Tests
- **Framework:** Playwright 1.40.1
- **Location:** `tests/e2e/`
- **Scenarios:** Critical user flows

### Test Data
- **Fixtures:** Reusable test data
- **Mocks:** AWS SDK mocks for unit tests
- **Cleanup:** Automatic cleanup after tests

---

## DEPLOYMENT

### Backend Deployment
- **Tool:** Serverless Framework
- **Stages:** dev, staging, production
- **Command:** `serverless deploy --stage {stage}`
- **Location:** `infra/serverless/`
- **Config:** `serverless.yml`
- **Environment Variables:** AWS SSM Parameter Store

### Frontend Deployment
- **Platform:** Vercel
- **Preview:** Automatic for `develop` branch
- **Production:** Automatic for `main` branch
- **Environment Variables:** Vercel Dashboard
- **Build:** `npm run build` in `src/frontend/`

### CI/CD
- **Platform:** GitHub Actions
- **Workflows:** `.github/workflows/`
- **Backend:** `backend-deploy.yml`
- **Frontend:** `frontend-deploy.yml`
- **Post-Deploy:** `scripts/post_deploy.sh` (smoke tests)

### Environment Variables

**Frontend (Vercel):**
- `VITE_API_URL` - API base URL
- `VITE_COGNITO_CLIENT_ID` - Cognito client ID

**Backend (SSM Parameter Store):**
- `/flowlogic/{stage}/cognito/user-pool-id`
- `/flowlogic/{stage}/cognito/client-id`
- `/flowlogic/{stage}/stripe/secret-key`

---

## CODE QUALITY

### TypeScript
- **Strict Mode:** Enabled
- **No Any:** Avoid `any`, use `unknown` if needed
- **Type Safety:** All functions typed
- **Interfaces:** Prefer interfaces over types for objects

### Linting
- **ESLint:** Configured for TypeScript
- **Rules:** Enforced in CI/CD
- **Auto-fix:** `npm run lint:fix`

### Formatting
- **Prettier:** If configured
- **Consistency:** Follow existing code style

### Code Review
- **Required:** For all PRs
- **Checklist:** Follow plan, check types, test coverage

---

## LLM-OS INTEGRATION

### State Management
- **PROJECT_CONFIG.md:** ROM (Read-Only Memory) - project rules
- **WORKFLOW_STATE.md:** RAM (Random Access Memory) - current state
- **ROLES/*.md:** Instruction Set - role definitions
- **docs/:** Persistent Storage - artifacts
- **.specify/:** Spec-Driven Development context

### Workflow
**Основной подход: Spec-Driven Development**
- **Spec-Driven:** Используется для всех новых фич и изменений
- Workflow: `/specify` → `/clarify` → `/plan` → `/tasks` → `/implement`
- Документация: `docs/planning/spec_driven_workflow_guide.md`

**Legacy подход (совместим):**
- **PLAN/BUILD:** Для больших рефакторингов (>10 файлов) через `./llmos plan/build`
- **Diff/Patch:** Для мелких правок (1-2 файла)
- **Context Collection:** Use `./llmos collect` scripts для сбора контекста

### Role Responsibilities
- **ANALYST:** Requirements → `docs/requirements/`
- **ARCHITECT:** Architecture → `docs/architecture/`
- **PM:** Planning → `docs/planning/`
- **BACKEND_DEV:** Backend code → `src/backend/`
- **FRONTEND_DEV:** Frontend code → `src/frontend/`
- **INFRA_DEVOPS:** Infrastructure → `infra/`
- **QA:** Tests → `tests/`
- **SECURITY:** Security docs → `docs/security/`
- **DOCS:** Documentation → `docs/`

---

## ANTI-PATTERNS TO AVOID

### ❌ DO NOT:
- Mix business logic in components/controllers
- Use prop drilling beyond 2 levels
- Add dependencies without approval
- Skip validation
- Hardcode secrets or URLs
- Use `any` type in TypeScript
- Create circular dependencies
- Ignore error handling
- Skip tests for business logic
- Make architectural decisions without plan

### ✅ DO:
- Follow file organization strictly
- Use Zustand for shared state
- Validate all inputs with Zod
- Store secrets in SSM Parameter Store
- Use TypeScript types everywhere
- Handle errors gracefully
- Write tests for critical paths
- Follow PLAN/BUILD for complex tasks
- Reference constitution before coding

---

## PERFORMANCE TARGETS

### Frontend
- **Page Load:** < 2s (mobile, 3G)
- **Dashboard Load:** < 3s (mobile)
- **Time to Interactive:** < 3.5s
- **Bundle Size:** Optimize with Vite

### Backend
- **API Response:** < 500ms (p95)
- **Lambda Cold Start:** < 2s
- **Database Queries:** < 100ms (p95)

### Infrastructure
- **Cost Target:** ≤ $50/month (MVP), ≤ $100/month (early stage)

---

## DOCUMENTATION

### Code Documentation
- **TypeScript:** JSDoc comments for public APIs
- **Functions:** Document parameters and return types
- **Complex Logic:** Inline comments explaining "why"

### API Documentation
- **Format:** OpenAPI 3.0 (Swagger)
- **Location:** `docs/architecture/api_spec.yaml`

### Feature Documentation
- **Spec-Driven:** `.specify/features/{name}/spec.md`
- **Architecture:** `docs/architecture/`
- **Requirements:** `docs/requirements/`

---

## VERSIONING & MIGRATIONS

### API Versioning
- **Strategy:** URL versioning (`/v1/`, `/v2/`)
- **Backward Compatibility:** Minimum 1 version back

### Database Migrations
- **Framework:** Custom migration scripts
- **Location:** `src/backend/db/migrations/`
- **Versioning:** Sequential (001, 002, ...)
- **Rollback:** Supported

---

## FUTURE CONSIDERATIONS

### Potential Additions (Post-MVP)
- **GraphQL API:** For complex queries
- **Redis Cache:** For frequently accessed data
- **Multi-language:** i18n support
- **Mobile App:** React Native

### Current Limitations
- **Server Components:** Not applicable (Vite, not Next.js)
- **SSR:** Not used (SPA architecture)
- **Edge Functions:** Not used (Vercel Edge optional)

---

## QUICK REFERENCE

### Creating New Feature
1. Read `@constitution.md`
2. Create spec in `.specify/features/{name}/spec.md`
3. Create plan in `.specify/features/{name}/plan.md`
4. Break into tasks in `.specify/features/{name}/tasks.md`
5. Implement task-by-task following plan

### Common Patterns
- **API Client:** `src/frontend/src/api/{feature}.ts`
- **Page Component:** `src/frontend/src/pages/{Feature}Page.tsx`
- **Backend Route:** `src/backend/api/routes/{feature}Routes.ts`
- **Backend Controller:** `src/backend/api/controllers/{feature}Controller.ts`
- **Zustand Store:** `src/frontend/src/store/{feature}Store.ts`

---

**Этот constitution - живой документ. Обновляйте его при изменении стандартов проекта.**

**Последнее обновление:** 2025-01-03


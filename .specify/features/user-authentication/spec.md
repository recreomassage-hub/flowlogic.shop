# User Authentication - Retrospective Specification

**Тип:** Ретроспективная спецификация  
**Дата создания:** 2025-01-03  
**Статус:** Существующая фича

---

## OVERVIEW

Система аутентификации пользователей через AWS Cognito с поддержкой регистрации, логина, верификации email и refresh токенов.

---

## CURRENT IMPLEMENTATION

### Backend
- **Routes:** `src/backend/api/routes/authRoutes.ts`
- **Controller:** `src/backend/api/controllers/authController.ts`
- **Model:** `src/backend/db/models/User.ts`
- **Config:** `src/backend/config/cognito.ts`

### Frontend
- **Pages:** 
  - `src/frontend/src/pages/RegisterPage.tsx`
  - `src/frontend/src/pages/LoginPage.tsx`
  - `src/frontend/src/pages/VerifyEmailPage.tsx`
- **API:** `src/frontend/src/api/auth.ts`
- **Client:** `src/frontend/src/api/client.ts` (Axios interceptors)

---

## REQUIREMENTS

### 1. User Registration
- **Endpoint:** `POST /v1/auth/register`
- **Input:**
  - `email` (required, string)
  - `password` (required, string, min 8 chars)
  - `name` (optional, string)
  - `wellness_disclaimer_accepted` (required, boolean, must be true)
- **Process:**
  1. Валидация входных данных
  2. Проверка существования пользователя по email
  3. Создание пользователя в AWS Cognito
  4. Автоподтверждение для dev/staging (skip email verification)
  5. Создание записи в DynamoDB (Users table)
- **Output:**
  - `user_id` (UUID)
  - `email`
  - `name`
  - `tier` (default: 'free')
  - `wellness_disclaimer_accepted`
- **Errors:**
  - 400: Missing required fields, password too short
  - 409: Email already registered
  - 500: Internal server error

### 2. Email Verification
- **Endpoint:** `POST /v1/auth/verify`
- **Input:**
  - `email` (required)
  - `verification_code` (required)
- **Process:**
  1. Подтверждение email через Cognito
  2. Обновление статуса пользователя
- **Output:** Success message
- **Note:** В dev/staging автоподтверждение включено

### 3. User Login
- **Endpoint:** `POST /v1/auth/login`
- **Input:**
  - `email` (required)
  - `password` (required)
- **Process:**
  1. Аутентификация через Cognito (InitiateAuth)
  2. Получение JWT токенов (Access + Refresh)
  3. Сохранение токенов в httpOnly cookies или localStorage
  4. Обновление `last_login_at` в DynamoDB
- **Output:**
  - `access_token` (JWT, 15 min TTL)
  - `refresh_token` (JWT, 30 days TTL)
  - User info
- **Errors:**
  - 401: Invalid credentials
  - 403: Email not verified (production)
  - 500: Internal server error

### 4. Token Refresh
- **Endpoint:** `POST /v1/auth/refresh`
- **Input:**
  - `refresh_token` (from httpOnly cookie or body)
- **Process:**
  1. Валидация refresh token через Cognito
  2. Генерация нового access token
- **Output:**
  - `access_token` (new JWT)
- **Errors:**
  - 401: Invalid or expired refresh token

### 5. User Logout
- **Endpoint:** `POST /v1/auth/logout`
- **Process:**
  1. Инвалидация токенов (опционально)
  2. Очистка cookies на клиенте
- **Output:** Success message

---

## DATABASE SCHEMA

### Users Table (DynamoDB)
- **Primary Key:** `user_id` (UUID)
- **GSI:** `email` (unique)
- **Fields:**
  - `user_id`: string (PK)
  - `email`: string (GSI, unique)
  - `name`: string (optional)
  - `tier`: 'free' | 'basic' | 'pro' | 'proplus'
  - `wellness_disclaimer_accepted`: boolean
  - `wellness_disclaimer_accepted_at`: ISO timestamp
  - `created_at`: ISO timestamp
  - `updated_at`: ISO timestamp
  - `last_login_at`: ISO timestamp (optional)

---

## AUTHENTICATION FLOW

### Registration Flow
```
1. User fills registration form
2. Frontend sends POST /v1/auth/register
3. Backend creates user in Cognito + DynamoDB
4. Backend returns user info
5. (Production) User receives verification email
6. (Dev/Staging) User auto-confirmed
```

### Login Flow
```
1. User fills login form
2. Frontend sends POST /v1/auth/login
3. Backend authenticates via Cognito
4. Backend returns JWT tokens
5. Frontend stores tokens (httpOnly cookies preferred)
6. Frontend redirects to dashboard
```

### Token Refresh Flow
```
1. Access token expires (15 min)
2. Axios interceptor catches 401
3. Frontend sends POST /v1/auth/refresh
4. Backend validates refresh token
5. Backend returns new access token
6. Frontend retries original request
```

---

## SECURITY

### Password Requirements
- Minimum 8 characters
- Stored as hash in Cognito (not in DynamoDB)

### Token Management
- Access token: 15 minutes TTL
- Refresh token: 30 days TTL
- Stored in httpOnly cookies (preferred) or localStorage
- Automatic refresh via Axios interceptor

### Email Verification
- Required in production
- Auto-confirmed in dev/staging
- Verification code sent via Cognito

### Wellness Disclaimer
- Required acceptance during registration
- Stored in DynamoDB with timestamp
- Cannot proceed without acceptance

---

## INTEGRATION POINTS

### With Other Features
- **Assessments:** Requires authenticated user
- **Subscriptions:** Uses user_id from auth
- **User Management:** Updates user profile

### External Services
- **AWS Cognito:** User pool management, JWT tokens
- **DynamoDB:** User data storage

---

## KNOWN ISSUES / LIMITATIONS

1. **Email verification:** Auto-confirmed in dev/staging (bypass for testing)
2. **Password validation:** Only length check, no complexity requirements
3. **Token storage:** Mixed approach (cookies vs localStorage)
4. **Error messages:** Some errors may expose internal details
5. **Rate limiting:** Not implemented (should add for production)

---

## FUTURE IMPROVEMENTS

1. **MFA (Multi-Factor Authentication):** Optional 2FA for Pro+ users
2. **Social login:** OAuth (Google, Apple) integration
3. **Password reset:** Forgot password flow
4. **Account recovery:** Email-based account recovery
5. **Session management:** Multiple device sessions
6. **Rate limiting:** API rate limiting for auth endpoints
7. **Password complexity:** Enforce stronger password rules

---

## TESTING

### Test Cases
- [ ] Registration with valid data
- [ ] Registration with duplicate email
- [ ] Registration with weak password
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token refresh flow
- [ ] Logout flow
- [ ] Email verification (production)
- [ ] Auto-confirmation (dev/staging)

---

## RELATED FILES

### Backend
- `src/backend/api/routes/authRoutes.ts`
- `src/backend/api/controllers/authController.ts`
- `src/backend/api/middleware/auth.ts` (authentication middleware)
- `src/backend/config/cognito.ts`
- `src/backend/db/models/User.ts`

### Frontend
- `src/frontend/src/pages/RegisterPage.tsx`
- `src/frontend/src/pages/LoginPage.tsx`
- `src/frontend/src/pages/VerifyEmailPage.tsx`
- `src/frontend/src/api/auth.ts`
- `src/frontend/src/api/client.ts`
- `src/frontend/src/components/common/ProtectedRoute.tsx`

---

**Это ретроспективная спецификация. Обновляйте при изменении фичи.**




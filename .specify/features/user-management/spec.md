# User Management - Retrospective Specification

**Тип:** Ретроспективная спецификация  
**Дата создания:** 2025-01-03  
**Статус:** Существующая фича

---

## OVERVIEW

Управление профилем пользователя: получение текущего пользователя, обновление профиля.

---

## CURRENT IMPLEMENTATION

### Backend
- **Routes:** `src/backend/api/routes/userRoutes.ts`
- **Controller:** `src/backend/api/controllers/userController.ts`
- **Model:** `src/backend/db/models/User.ts`

### Frontend
- **Pages:**
  - `src/frontend/src/pages/DashboardPage.tsx` (отображение профиля)
- **API:** (TODO: проверить наличие user API в frontend)

---

## REQUIREMENTS

### 1. Get Current User
- **Endpoint:** `GET /v1/users/me`
- **Authentication:** Required
- **Process:**
  1. Authenticate user (get user_id from JWT)
  2. Query DynamoDB for user by user_id
  3. Return user profile (excluding sensitive data)
- **Output:**
  - User object:
    - `user_id`
    - `email`
    - `name`
    - `tier`
    - `wellness_disclaimer_accepted`
    - `wellness_disclaimer_accepted_at`
    - `created_at`
    - `last_login_at`
- **Errors:**
  - 401: Unauthorized
  - 404: User not found
  - 500: Internal server error

### 2. Update Current User
- **Endpoint:** `PATCH /v1/users/me`
- **Authentication:** Required
- **Input:**
  - `name` (optional, string)
  - Other fields (if allowed)
- **Process:**
  1. Authenticate user
  2. Validate input
  3. Update user in DynamoDB
  4. Update `updated_at` timestamp
  5. Return updated user
- **Output:**
  - Updated user object
- **Restrictions:**
  - Cannot update `email` (managed by Cognito)
  - Cannot update `tier` (managed by subscriptions)
  - Cannot update `user_id` (immutable)
- **Errors:**
  - 400: Invalid input
  - 401: Unauthorized
  - 404: User not found
  - 500: Internal server error

---

## DATABASE SCHEMA

### Users Table (DynamoDB)
- **Primary Key:** `user_id` (UUID)
- **GSI:** `email` (unique)
- **Updatable Fields:**
  - `name`: string (optional)
  - `updated_at`: ISO timestamp (auto-updated)
- **Immutable Fields:**
  - `user_id`: string (PK)
  - `email`: string (managed by Cognito)
  - `tier`: string (managed by subscriptions)
  - `wellness_disclaimer_accepted`: boolean
  - `wellness_disclaimer_accepted_at`: ISO timestamp
  - `created_at`: ISO timestamp

---

## USER PROFILE DATA

### Public Profile (Returned by API)
- `user_id`: UUID
- `email`: Email address
- `name`: Display name (optional)
- `tier`: Current subscription tier
- `wellness_disclaimer_accepted`: Boolean
- `wellness_disclaimer_accepted_at`: Timestamp
- `created_at`: Account creation date
- `last_login_at`: Last login timestamp

### Not Returned (Sensitive)
- Password (stored in Cognito, not in DynamoDB)
- Internal metadata
- Payment information (handled by Stripe)

---

## INTEGRATION POINTS

### With Other Features
- **User Authentication:** Uses user_id from JWT token
- **Subscriptions:** Tier field synced with subscriptions
- **Assessments:** User_id used for assessment ownership

### External Services
- **AWS Cognito:** Email management (cannot update via API)
- **DynamoDB:** User data storage

---

## KNOWN ISSUES / LIMITATIONS

1. **Email Update:** Cannot update email (must be done via Cognito)
2. **Tier Update:** Cannot update tier directly (managed by subscriptions)
3. **Profile Picture:** Not implemented
4. **Preferences:** No user preferences/settings
5. **Account Deletion:** No account deletion endpoint
6. **Password Change:** Handled by Cognito, not this API
7. **Profile Completeness:** No validation for profile completeness

---

## FUTURE IMPROVEMENTS

1. **Profile Picture:** Upload and manage profile picture (S3)
2. **User Preferences:** Settings/preferences management
3. **Account Deletion:** GDPR-compliant account deletion
4. **Email Update:** Flow for updating email (via Cognito)
5. **Password Change:** API endpoint for password change
6. **Profile Completeness:** Track and encourage profile completion
7. **Activity History:** View user activity history
8. **Privacy Settings:** Manage privacy preferences
9. **Notification Settings:** Manage notification preferences
10. **Data Export:** Export user data (GDPR compliance)

---

## TESTING

### Test Cases
- [ ] Get current user (authenticated)
- [ ] Get current user (unauthorized - 401)
- [ ] Update user name
- [ ] Update user with invalid data
- [ ] Verify updated_at timestamp updated
- [ ] Verify immutable fields cannot be updated
- [ ] Verify email cannot be updated via this endpoint

---

## RELATED FILES

### Backend
- `src/backend/api/routes/userRoutes.ts`
- `src/backend/api/controllers/userController.ts`
- `src/backend/db/models/User.ts`
- `src/backend/api/middleware/auth.ts` (authentication)

### Frontend
- `src/frontend/src/pages/DashboardPage.tsx`

---

**Это ретроспективная спецификация. Обновляйте при изменении фичи.**




# 📡 API Documentation — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Base URL:** `https://api.flowlogic.shop/v1`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Subscriptions](#subscriptions)
4. [Assessments](#assessments)
5. [Plans](#plans) (Basic+)
6. [Calendar](#calendar) (Basic+)
7. [Progress](#progress) (Basic+)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require authentication via JWT Bearer token.

### Register

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "wellness_disclaimer_accepted": true
}
```

**Response:** `201 Created`
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "free",
  "wellness_disclaimer_accepted": true,
  "created_at": "2025-12-22T10:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid input (email format, password strength)
- `409 Conflict` - Email already registered

---

### Login

**POST** `/auth/login`

Authenticate and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "tier": "free"
  }
}
```

**Headers:**
- `Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict`

**Errors:**
- `401 Unauthorized` - Invalid email or password

---

### Logout

**POST** `/auth/logout`

Logout and invalidate refresh token.

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:** `200 OK`

---

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Headers:**
- `Cookie: refreshToken=xxx`

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

---

## 👤 Users

### Get Current User

**GET** `/users/me`

Get current authenticated user's profile.

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "free",
  "wellness_disclaimer_accepted": true,
  "created_at": "2025-12-22T10:00:00Z",
  "updated_at": "2025-12-22T10:00:00Z"
}
```

---

### Update Profile

**PATCH** `/users/me`

Update current user's profile.

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "name": "John Smith"
}
```

**Response:** `200 OK`
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Smith",
  "tier": "free",
  "updated_at": "2025-12-22T11:00:00Z"
}
```

---

## 💳 Subscriptions

### Get Subscription

**GET** `/subscriptions`

Get current user's subscription information.

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:** `200 OK` (if subscription exists)
```json
{
  "subscription_id": "sub_123",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "tier": "basic",
  "status": "active",
  "current_period_start": "2025-12-22T10:00:00Z",
  "current_period_end": "2026-01-22T10:00:00Z",
  "stripe_customer_id": "cus_test_123",
  "stripe_subscription_id": "sub_test_123"
}
```

**Response:** `404 Not Found` (if Free tier, no subscription)

---

### Create Subscription

**POST** `/subscriptions`

Create a new subscription (upgrade tier).

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "tier": "basic",
  "payment_method_id": "pm_test_123"
}
```

**Response:** `201 Created`
```json
{
  "subscription_id": "sub_123",
  "tier": "basic",
  "status": "active",
  "current_period_start": "2025-12-22T10:00:00Z",
  "current_period_end": "2026-01-22T10:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid tier or payment method
- `402 Payment Required` - Payment failed

---

### Cancel Subscription

**POST** `/subscriptions/cancel`

Cancel current subscription.

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "subscription_id": "sub_123",
  "status": "cancelled",
  "current_period_end": "2026-01-22T10:00:00Z"
}
```

**Note:** Access is retained until `current_period_end`.

---

## 🎬 Assessments

### List Assessments

**GET** `/assessments`

Get list of user's assessments (tests).

**Headers:**
- `Authorization: Bearer {access_token}`

**Query Parameters:**
- `month` (optional): Filter by month (format: `YYYY-MM`, e.g., `2025-12`)
- `test_id` (optional): Filter by test type (1-15)

**Response:** `200 OK`
```json
{
  "assessments": [
    {
      "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "test_id": 1,
      "status": "completed",
      "score": 85,
      "problem_areas": ["neck", "shoulders"],
      "created_at": "2025-12-22T10:00:00Z",
      "completed_at": "2025-12-22T10:05:00Z"
    }
  ]
}
```

---

### Create Assessment

**POST** `/assessments`

Start a new assessment test.

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "test_id": 1
}
```

**Response:** `201 Created`
```json
{
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "upload_url": "https://s3.amazonaws.com/bucket/video.mp4?X-Amz-Signature=...",
  "expires_in": 3600
}
```

**Errors:**
- `403 Forbidden` - Monthly test limit exceeded
- `429 Too Many Requests` - Daily attempt limit exceeded (3 attempts/day/test)

---

### Get Assessment

**GET** `/assessments/{assessment_id}`

Get assessment details and results.

**Headers:**
- `Authorization: Bearer {access_token}`

**Path Parameters:**
- `assessment_id` (required): UUID of assessment

**Response:** `200 OK`
```json
{
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "test_id": 1,
  "status": "completed",
  "score": 85,
  "problem_areas": ["neck", "shoulders"],
  "video_url": "https://s3.amazonaws.com/bucket/video.mp4",
  "created_at": "2025-12-22T10:00:00Z",
  "completed_at": "2025-12-22T10:05:00Z"
}
```

**Errors:**
- `404 Not Found` - Assessment not found

---

### Complete Video Upload

**PUT** `/assessments/{assessment_id}`

Mark video as uploaded and trigger processing.

**Headers:**
- `Authorization: Bearer {access_token}`

**Path Parameters:**
- `assessment_id` (required): UUID of assessment

**Request Body:**
```json
{
  "video_uploaded": true
}
```

**Response:** `200 OK`
```json
{
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing",
  "created_at": "2025-12-22T10:00:00Z"
}
```

---

### Get Results Summary

**GET** `/assessments/results`

Get overall results summary (score + problem areas).

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "overall_score": "limited",
  "problem_areas": {
    "p1": ["neck_tension", "shoulder_imbalance"],
    "p2": ["forward_head", "rounded_shoulders"]
  },
  "tests_completed": 3,
  "tests_available": 3
}
```

---

## 📋 Plans (Basic+)

**Note:** Plans endpoints require Basic, Pro, or Pro+ subscription.

### Get Plan

**GET** `/plans`

Get active training plan.

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "plan_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "exercises": [
    {
      "exercise_id": "ex_123",
      "name": "Neck Stretch",
      "instructions": "...",
      "repetitions": 10,
      "sets": 3
    }
  ],
  "created_at": "2025-12-22T10:00:00Z"
}
```

**Errors:**
- `403 Forbidden` - Basic+ subscription required
- `404 Not Found` - Plan not found

---

### Generate Plan

**POST** `/plans`

Generate a new training plan using AI Plan Generator.

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "based_on_tests": [1, 2, 3]
}
```

**Response:** `201 Created`
```json
{
  "plan_id": "123e4567-e89b-12d3-a456-426614174000",
  "exercises": [...],
  "created_at": "2025-12-22T10:00:00Z"
}
```

**Errors:**
- `403 Forbidden` - Basic+ subscription required

---

## 📅 Calendar (Basic+)

**Note:** Calendar endpoints require Basic, Pro, or Pro+ subscription.

### Get Tasks

**GET** `/calendar/tasks`

Get calendar tasks for a date or date range.

**Headers:**
- `Authorization: Bearer {access_token}`

**Query Parameters:**
- `date` (optional): Single date (format: `YYYY-MM-DD`, default: today)
- `start_date` (optional): Start of range (format: `YYYY-MM-DD`)
- `end_date` (optional): End of range (format: `YYYY-MM-DD`)

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "date": "2025-12-22",
      "exercise_id": "ex_123",
      "status": "pending",
      "created_at": "2025-12-22T10:00:00Z"
    }
  ]
}
```

**Errors:**
- `403 Forbidden` - Basic+ subscription required

---

### Complete Task

**POST** `/calendar/tasks/{task_id}/complete`

Mark a calendar task as completed.

**Headers:**
- `Authorization: Bearer {access_token}`

**Path Parameters:**
- `task_id` (required): UUID of task

**Response:** `200 OK`
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "completed_at": "2025-12-22T10:00:00Z"
}
```

---

## 📈 Progress (Basic+)

**Note:** Progress endpoints require Basic, Pro, or Pro+ subscription.

### Get Progress

**GET** `/progress`

Get user's progress metrics and charts data.

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "streak": 5,
  "completion_rate": 0.85,
  "improvements": [
    {
      "date": "2025-12-22",
      "score": 85,
      "test_id": 1
    }
  ],
  "charts": {
    "streak": [...],
    "completion": [...],
    "improvements": [...]
  }
}
```

**Errors:**
- `403 Forbidden` - Basic+ subscription required

---

## ⚠️ Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error code",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions (tier gating)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Errors

**401 Unauthorized:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**403 Forbidden (Tier Gating):**
```json
{
  "error": "TIER_REQUIRED",
  "message": "Basic+ subscription required for this feature"
}
```

**429 Too Many Requests:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Daily attempt limit exceeded. Try again tomorrow."
}
```

---

## 🚦 Rate Limiting

### Rate Limits

- **Authentication endpoints:** 10 requests/minute
- **User endpoints:** 60 requests/minute
- **Assessment endpoints:** 30 requests/minute
- **Subscription endpoints:** 10 requests/minute

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640000000
```

### Exceeding Rate Limits

When rate limit is exceeded, you will receive:
- **Status Code:** `429 Too Many Requests`
- **Retry-After Header:** Seconds until retry is allowed

---

## 🔗 Related Documentation

- **OpenAPI Specification:** [docs/architecture/api_spec.yaml](docs/architecture/api_spec.yaml)
- **Architecture:** [docs/architecture/](docs/architecture/)
- **Developer Guide:** [docs/developer_guide.md](docs/developer_guide.md)

---

**Last Updated:** 2025-12-22  
**Version:** 1.0


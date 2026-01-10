# Subscriptions - Retrospective Specification

**Тип:** Ретроспективная спецификация  
**Дата создания:** 2025-01-03  
**Статус:** Существующая фича

---

## OVERVIEW

Система управления подписками через Stripe. Пользователи могут подписываться на платные тарифы (Basic, Pro, Pro+), управлять подпиской и отменять её.

---

## CURRENT IMPLEMENTATION

### Backend
- **Routes:** `src/backend/api/routes/subscriptionRoutes.ts`
- **Controller:** `src/backend/api/controllers/subscriptionController.ts`
- **Model:** `src/backend/db/models/Subscription.ts`
- **Payment:** Stripe API

### Frontend
- **Pages:**
  - `src/frontend/src/pages/TiersPage.tsx` (выбор тарифа)
  - `src/frontend/src/pages/DashboardPage.tsx` (отображение текущей подписки)
- **API:** (TODO: проверить наличие subscription API в frontend)

---

## REQUIREMENTS

### 1. Get Current Subscription
- **Endpoint:** `GET /v1/subscriptions`
- **Authentication:** Required
- **Process:**
  1. Authenticate user
  2. Query DynamoDB for user's subscription
  3. Return subscription or 404 if Free tier
- **Output:**
  - Subscription object (if exists)
  - 404 if Free tier (no subscription)
- **Errors:**
  - 401: Unauthorized
  - 404: No subscription (Free tier)
  - 500: Internal server error

### 2. Create Subscription (Upgrade)
- **Endpoint:** `POST /v1/subscriptions`
- **Authentication:** Required
- **Input:**
  - `tier` (required): 'basic' | 'pro' | 'proplus'
  - `payment_method_id` (required): Stripe payment method ID
- **Process:**
  1. Authenticate user
  2. Validate tier
  3. Get or create Stripe customer
  4. Attach payment method to customer
  5. Create Stripe subscription
  6. Create subscription record in DynamoDB
  7. Update user tier in Users table
  8. Return subscription details
- **Output:**
  - Subscription object with Stripe details
- **Errors:**
  - 400: Invalid tier or missing payment_method_id
  - 401: Unauthorized
  - 404: User not found
  - 500: Stripe error or internal error

### 3. Cancel Subscription
- **Endpoint:** `POST /v1/subscriptions/cancel`
- **Authentication:** Required
- **Process:**
  1. Authenticate user
  2. Get user's subscription
  3. Cancel Stripe subscription (at period end)
  4. Update subscription status in DynamoDB
  5. Return updated subscription
- **Output:**
  - Updated subscription object
- **Note:** Subscription remains active until period end
- **Errors:**
  - 401: Unauthorized
  - 404: No subscription found
  - 500: Internal server error

---

## TIER STRUCTURE

### Free Tier
- **Price:** $0/month
- **Assessments:** 3 per month
- **Features:** Results only, no training plans
- **No Stripe subscription:** User tier = 'free' in Users table

### Basic Tier
- **Price:** $4.99/month
- **Assessments:** 3 per month
- **Features:** Training plans, basic exercises
- **Stripe Product:** Basic subscription

### Pro Tier
- **Price:** $9.99/month
- **Assessments:** 7 per month
- **Features:** Advanced training plans, progress tracking
- **Stripe Product:** Pro subscription

### Pro+ Tier
- **Price:** $19.99/month
- **Assessments:** 15 per month
- **Features:** All features, retention improvements
- **Stripe Product:** Pro+ subscription

---

## DATABASE SCHEMA

### Subscriptions Table (DynamoDB)
- **Primary Key:**
  - `user_id` (PK)
  - `subscription_id` (SK, Stripe subscription ID)
- **GSI:**
  - `stripe_customer_id` (for Stripe webhook lookups)
- **Fields:**
  - `user_id`: string (PK)
  - `subscription_id`: string (SK, Stripe subscription ID)
  - `stripe_customer_id`: string (GSI)
  - `tier`: 'basic' | 'pro' | 'proplus'
  - `status`: 'active' | 'canceled' | 'past_due' | 'expired'
  - `current_period_start`: ISO timestamp
  - `current_period_end`: ISO timestamp
  - `cancel_at_period_end`: boolean
  - `canceled_at`: ISO timestamp (optional)
  - `created_at`: ISO timestamp
  - `updated_at`: ISO timestamp

### Users Table (Updated)
- When subscription created: `tier` field updated to match subscription tier
- When subscription canceled: `tier` remains until period end, then reverts to 'free'

---

## STRIPE INTEGRATION

### Customer Management
- Customer created on first subscription
- Customer ID stored in user metadata (TODO: should be in Users table)
- Customer reused for subscription changes

### Payment Method
- Payment method attached to customer
- Set as default payment method
- Used for recurring charges

### Subscription Creation
- Stripe subscription created with:
  - Customer ID
  - Payment method
  - Product/Price based on tier
  - Billing cycle: monthly

### Subscription Cancellation
- Canceled at period end (not immediately)
- User retains access until period end
- Status updated to 'canceled'
- `cancel_at_period_end` = true

---

## SUBSCRIPTION FLOW

### Upgrade Flow
```
1. User selects tier on TiersPage
2. Frontend collects payment method (Stripe Elements)
3. Frontend calls POST /v1/subscriptions
4. Backend creates Stripe customer (if needed)
5. Backend creates Stripe subscription
6. Backend creates DynamoDB record
7. Backend updates user tier
8. Frontend shows success, redirects to dashboard
```

### Cancel Flow
```
1. User clicks "Cancel Subscription"
2. Frontend calls POST /v1/subscriptions/cancel
3. Backend cancels Stripe subscription (at period end)
4. Backend updates DynamoDB status
5. Frontend shows confirmation
6. User retains access until period end
```

### Expiration Flow
```
(Handled by Stripe webhook or scheduled job)
1. Subscription period ends
2. If canceled: Update user tier to 'free'
3. If past_due: Update status, send notification
4. If expired: Update user tier to 'free'
```

---

## INTEGRATION POINTS

### With Other Features
- **User Authentication:** Uses user_id from auth
- **Assessments:** Tier affects assessment limits
- **User Management:** Updates user tier field

### External Services
- **Stripe:** Payment processing, subscription management
- **DynamoDB:** Subscription data storage
- **Stripe Webhooks:** (Future) Handle subscription events

---

## KNOWN ISSUES / LIMITATIONS

1. **Stripe Customer ID:** Not stored in Users table (uses email as placeholder)
2. **Webhook Handling:** Stripe webhooks not implemented
3. **Tier Reversion:** Automatic tier reversion on expiration not implemented
4. **Payment Method Management:** No UI for managing payment methods
5. **Subscription History:** No history of past subscriptions
6. **Downgrade:** No downgrade flow (only cancel + new subscription)
7. **Trial Period:** No trial period support
8. **Proration:** No proration for mid-cycle changes

---

## FUTURE IMPROVEMENTS

1. **Stripe Webhooks:** Handle subscription events (renewal, cancellation, payment failure)
2. **Payment Method Management:** UI for adding/removing payment methods
3. **Subscription History:** View past subscriptions
4. **Downgrade Flow:** Allow downgrading without canceling
5. **Trial Period:** Free trial for new users
6. **Proration:** Handle mid-cycle tier changes
7. **Invoice Management:** View and download invoices
8. **Billing Portal:** Stripe Customer Portal integration
9. **Usage Tracking:** Track assessment usage against tier limits
10. **Auto-renewal Reminders:** Email reminders before renewal

---

## TESTING

### Test Cases
- [ ] Get subscription (active)
- [ ] Get subscription (Free tier - 404)
- [ ] Create subscription (Basic)
- [ ] Create subscription (Pro)
- [ ] Create subscription (Pro+)
- [ ] Create subscription with invalid tier
- [ ] Cancel subscription
- [ ] Verify user tier updated on subscription
- [ ] Verify Stripe customer creation
- [ ] Verify payment method attachment

---

## RELATED FILES

### Backend
- `src/backend/api/routes/subscriptionRoutes.ts`
- `src/backend/api/controllers/subscriptionController.ts`
- `src/backend/db/models/Subscription.ts`

### Frontend
- `src/frontend/src/pages/TiersPage.tsx`
- `src/frontend/src/pages/DashboardPage.tsx`

### Configuration
- Stripe API keys in environment variables
- Stripe products configured in Stripe Dashboard

---

**Это ретроспективная спецификация. Обновляйте при изменении фичи.**




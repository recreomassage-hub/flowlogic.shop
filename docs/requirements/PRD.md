# 📘 PRD 2.1 — Flow Logic (MediaPipe Assessment + Plans)

*(Production-ready style: CI/CD + Rollback + Env + Migrations + Security + Monitoring, based on PRD‑7.1 structure)*

**Версия:** 2.1  
**Дата:** 2025-12-18  
**Основано на:** `docs/PRD-7.1-Enterprise-Fitness-Assessment-Platform.md` (как эталон структуры) + требования по тарифам Flow Logic (Free/Basic/Pro/Pro+)  
**MVP language:** **English only** (UI, emails, system messages)

---

# 1. EXECUTIVE SUMMARY

## 1.1. Product Overview

**Flow Logic** — B2C платформа для оценки качества движения через **MediaPipe pose estimation** и последующей коррекции через **AI‑план**, **умный календарь**, **графики прогресса (charts)** и **набор retention‑улучшений** (tier‑gated).

**Ключевые характеристики:**
- Не является медицинским продуктом (wellness only)
- 4 тарифа **Free / Basic / Pro / Pro+**
- Чёткое разделение по количеству тестов (MediaPipe) и наличию тренировок
- Production-grade CI/CD с автоматическим тестированием и rollback

## 1.2. Business Value

- **Быстрый результат:** пользователь получает оценку и problem areas сразу после тестов
- **Монетизация через ценность:** **Free без плана**, **Basic+ с упражнениями/планом**
- **Retention драйвер:** план + трекинг прогресса (в рамках paid tiers)

## 1.3. Technical Foundation

- **Frontend:** React (Vercel)
- **Backend:** AWS Lambda + API Gateway
- **Auth:** AWS Cognito
- **DB:** DynamoDB (KMS encryption)
- **Storage/CDN:** S3 + CloudFront
- **Messaging:** EventBridge + SQS FIFO (для тяжёлых сценариев/ретраев)
- **Monitoring:** Sentry + CloudWatch (+ X-Ray опционально)
- **CI/CD:** GitHub Actions + Vercel + Serverless Framework

---

# 2. PRODUCT SCOPE

## 2.1. Target Users

- B2C пользователи 18–65
- Офисные работники (шея/спина), фитнес‑любители (профилактика травм)

## 2.2. Key User Goals

- Пройти тесты качества движения
- Получить понятный результат (оценка + problem areas)
- Для **Basic+**: получить упражнения и план коррекции по результатам

## 2.3. Non-Goals

- Диагностика заболеваний / medical claims
- Медицинские заключения
- Live coaching / видео‑звонки
- Мультиязычность в MVP (в MVP только English)

---

# 3. BUSINESS REQUIREMENTS

## 3.1. Core Features

1. **Onboarding**: регистрация/логин (email/password), consent + wellness disclaimer
2. **Tier selection**: Free / Basic / Pro / Pro+
3. **MediaPipe assessment**: 3/3/7/15 тестов
4. **Results**: score + problem areas (все tiers)
5. **Exercises + training plan**: только **Basic+** (на основе 3/7/15 тестов)
6. **Billing & subscriptions**: Stripe
7. **Account lifecycle**: отмена подписки, блокировка paid фич при истечении
8. **Observability**: monitoring/alerts/releases
9. **AI Plan Generator** (Basic+) — автогенерация упражнений и плана коррекции по результатам тестов (3/7/15)
10. **Smart Calendar** (Basic+) — 2–4 задачи в день, чек-лист выполнения, streak
11. **Charts / Progress Dashboard** (Basic+) — визуализация прогресса (streak, completion, improvements)
12. **Retention Improvements** (Pro+) — микро-рефлексия, микро-коучинг, бейджи/пороги, авто-адаптация нагрузки, share card

## 3.2. KPIs

- Activation Rate: > 65%
- Test completion rate: > 75%
- Time to results: сразу после завершения тестов
- Deploy Time: < 4 минуты
- Rollback Time: < 1 минута

## 3.3. Cost Optimization Targets

- MVP (0–100 users): ≤ $50/мес
- Early Stage (100–1000 users): ≤ $100/мес
- Growth (1000–5000 users): ≤ $320/мес


---

## 3.4. (ИИ + Календарь + Charts + Улучшения) — требования полного продукта

> Важно: наличие тренировок/плана начинается с **Basic**. Free остаётся **только тесты + результаты**.

### 3.4.1. AI Plan Generator (Basic+)

- **Input:** результаты тестов (tier: 3/7/15), problem areas, базовые preferences (опционально)
- **Output:**
  - список упражнений (exercise list)
  - базовый план коррекции (Basic — lite) / расширенный (Pro/Pro+)

**Tier logic:**
- **Basic:** план на основе **3 тестов** (lite)
- **Pro:** план на основе **7 тестов**
- **Pro+:** план на основе **15 тестов** + более детальная расшифровка

### 3.4.2. Smart Calendar (Basic+)

- Система должна формировать ежедневные задачи по плану:
  - **2–4 задачи в день**
  - приоритеты: must/should (опционально)
  - отметка выполнения задач (checkbox)

**Streak rules (MVP):**
- 100% выполнено за день → +2
- 70–99% → +1
- <70% → +0

### 3.4.3. Charts / Progress Dashboard (Basic+)

Минимальный набор графиков:
- streak (line)
- completion (bar)
- test improvements (trend по ключевым тестам)

**Performance target:** chart/dashboard load < 3s (mobile).

### 3.4.4. Улучшения (Retention Improvements) (Pro+)

- микро-рефлексия (после сессии): self-report (например 0–10)
- микро-коучинг (insights под дашбордом)
- бейджи/пороги
- авто-адаптация нагрузки (например снижение объёма при серии «красных» дней)
- share card прогресса

---

# 4. PRODUCT SCOPE & TIERS (UPDATED WITH BASIC)

## 4.1. Pricing Matrix (Mandatory)

| Tier | Тестов (MediaPipe) | Что получает пользователь | CPU | Pose Accuracy | Цена | Lambda |
|---|---:|---|---:|---:|---:|---|
| **Free** | 3 | Только прохождение 3 тестов и экран результатов (оценка и проблемные зоны), **без упражнений и плана** | 20% | 94–96% | $0 | 512MB, 15s |
| **Basic** | 3 | То же, что Free, плюс: **подбор упражнений** и **базовый план коррекции** по результатам 3 тестов | 25–30% | 94–96% | $4.99 | 512MB, 15–20s |
| **Pro** | 7 | 7 тестов с MediaPipe, расширенный отчёт + **упражнения и план** (как у Basic, но на основе 7 тестов) | 45% | 92–94% | $9.99 | 768MB, 20s |
| **Pro+** | 15 | 15 тестов с MediaPipe, полный отчёт + **упражнения и план** (как у Pro, но на основе 15 тестов) | 100% | 91–93% | $19.99 | 1024MB ARM64, 30s |

## 4.2. Tier gating rules (Mandatory)
- **Monthly tests cap (all tiers, must):** a user can complete at most the plan’s number of **distinct tests per calendar month** (Free=3, Basic=3, Pro=7, Pro+=15), unless explicitly stated otherwise in this PRD.
- **Attempts cap (must):** each test has up to **3 video attempts per day** (re-records/submissions) to pass MediaPipe quality gates.
- **3‑tests plan math (must):** if a plan has **3 tests/month**, then the daily attempt ceiling is **9 attempts/day** (3 tests × 3 attempts).




- **MediaPipe-only (all tiers):** any test available in **Free/Basic/Pro/Pro+** must be **executed and scored via MediaPipe**. Tier only changes **how many tests** are available.
- **No fallback scoring (all tiers):** if MediaPipe quality gates fail, the test is **not completed** (user must retry); **no manual scoring** and **no non‑MediaPipe scoring**. After max retries, an optional questionnaire may be offered for **generic guidance only**, but it **does not count as completing the test**.


- **Free:** `assessments` + `results` only; **NO** `exercises` / `plans`
- **Basic:** `assessments(3)` + `results` + `exercises` + `plans(lite)`
- **Pro:** `assessments(7)` + `results(extended)` + `exercises` + `plans`
- **Pro+:** `assessments(15)` + `results(full + poseAccuracy)` + `exercises` + `plans`


## 4.3. Assessment Tests Catalog (15) — Elite (canonical)

**Source of truth:** the following 15 tests list (Elite). This replaces any previous 15-tests catalog.

### 4.3.1. Canonical catalog (Pro+ = 15/15)

**Hard requirement (must):** **All 15 tests must be executed and scored via MediaPipe** (no “manual self‑report scoring” and no non‑MediaPipe CV pipeline).

**Allowed MediaPipe modules (MVP):**
- **MediaPipe Pose** (primary) for full‑body landmarks
- **MediaPipe Face Mesh** (only if needed for neck/chin precision)

**Quality gates (must):** a test result can be finalized only if:
- Pose/Face tracking confidence is above threshold for the required landmarks for **≥ 80%** of frames
- Camera framing is correct (full body or upper body as required)
- Lighting/occlusion checks pass (no missing hips/shoulders for body tests)

**If quality gate fails (must):**
- Do **not** mark the test as completed.
- Show user an actionable instruction screen (reposition, distance, lighting) and allow retry.
- Store an audit event: `assessment.measurement_failed` with reason (low_confidence / occlusion / out_of_frame).

**MediaPipe output normalization (must):** even when exact cm/deg is unreliable, the system must output the normalized bucket + confidence.

**Landmark/metric mapping (MVP, minimum):**
- Neck Flexion/Extension (1) + Chin Tuck (13): Face Mesh + Pose (ears/nose/shoulders) to estimate head pitch and head‑neck translation.
- Plank Endurance (2), Dead Bug (11), Bird Dog (14): Pose angles + trunk alignment + stability over time.
- Clamshell (15), Glute Bridge (12): hip/knee/ankle landmarks + pelvis alignment to score ROM/control.


| ID | Test | Primary signal (MediaPipe) | Output (normalized) | Notes |
|---:|---|---|---|---|
| 1 | Neck Flexion/Extension | cervical ROM | pass / limited / significant + confidence | front/side camera options |
| 2 | Plank Endurance | time under correct alignment | seconds + pass/fail thresholds | form quality gating |
| 3 | Y-Balance | dynamic reach symmetry | symmetric / asymmetric + severity | side-to-side delta |
| 4 | Overhead Squat | knee valgus, heel lift, trunk angle, depth | good / compensation / significant + flags | key global pattern |
| 5 | 90-90 Hip/Shoulder | hip IR/ER + shoulder ER/IR proxy | within-range / limited + side | combined test (one ID) |
| 6 | Ankle Mobility | dorsiflexion ROM | pass / limited / significant + confidence | **see comparison below** |
| 7 | Single-Leg Balance | static balance stability | seconds + quality score | eyes open (MVP) |
| 8 | Lateral Lunge | frontal-plane control + hip mobility | good / compensation / significant + side | knee tracking flags |
| 9 | Shoulder Flexion | overhead ROM | pass / limited + side | scap compensation flag |
| 10 | Wall Slide | scapular control + thoracic mobility | pass / needs-work | quality score |
| 11 | Dead Bug | core stability under limb motion | pass / needs-work | lumbar control |
| 12 | Glute Bridge | posterior chain + pelvic control | pass / needs-work + side | asymmetry flag |
| 13 | Chin Tuck | deep neck flexor control | pass / needs-work | posture cue |
| 14 | Bird Dog | cross-body core + stability | pass / needs-work + side | balance drift |
| 15 | Clamshell | hip abductor activation/control | pass / needs-work + side | glute med proxy |

### 4.3.2. Tier subsets (must be fixed and consistent)

- **Free (3 tests):** 4 (Overhead Squat), 3 (Y-Balance), 7 (Single-Leg Balance)
- **Basic (3 tests):** same as Free (4, 3, 7) + unlocks exercises/plan (lite)
- **Pro (7 tests):** 4 (Overhead Squat), 3 (Y-Balance), 7 (Single-Leg Balance), 6 (Ankle Mobility), 9 (Shoulder Flexion), 2 (Plank Endurance), 11 (Dead Bug)
- **Pro+ (15 tests):** 1–15

### 4.3.3. Interpretation → “problem areas” + priorities (P1/P2)

- **P1 (root cause candidates):** ankle mobility (6), hip control/activation (12/15), core control (11/14/2), shoulder/scap control (9/10)
- **P2 (often consequence patterns):** compensations in overhead squat (4), lateral lunge (8), balance asymmetries (3/7)

**Example rule (non-exhaustive):**
- If knee valgus in **Overhead Squat (4)** AND **Ankle Mobility (6)** is limited AND **Clamshell (15)** shows poor control → priorities: P1=ankle, P1=hip abduction control; knee valgus = P2 consequence.

### 4.3.4. Ankle Mobility — сравнить тесты (decision)

**Decision for MVP:** use **knee-to-wall** (dorsiflexion) protocol as the canonical implementation for Test 6.

- **Why:** robust, simple, maps well to video-based estimation, and directly correlates with squat/lunge mechanics.
- **Normalization:** output remains **pass / limited / significant** + confidence.
- **Optional metric:** if reliable, system may also output estimated cm-equivalent, but must not block results.

### 4.3.5. Retesting cadence + progress thresholds

- **Every 2 weeks:** quick re-check for key limitations
- **Every 4–6 weeks:** full reassessment

**Progress heuristic (MVP):**
- **≥20%** improvement in 2 weeks → good
- **<10%** improvement in 2 weeks → adjust program
- worsening → stop / advise specialist

### 4.3.6. Report template (Pro/Pro+)

System must support generation of a structured report containing:
- identified limitations grouped by P1/P2
- recommended plan phases (2 weeks local work → 2 weeks integration)
- progress tracking table per key tests

### 4.3.7. Обработка некорректного видео в MediaPipe (Client validation + Lambda retry)

**Goal:** гарантировать, что тесты на всех тарифах корректно проходят через MediaPipe даже при плохом видео.

#### 4.3.7.1. Client-side валидация (React, до отправки)

- **Max duration:** 45s
- **Max size:** 50MB
- **No motion check:** motion variance < threshold

```javascript
// packages/frontend/src/components/TestRecorder.jsx
const validateVideo = async (videoBlob) => {
  const issues = [];

  // Duration > 45s (obtained from <video> metadata)
  if (videoBlob.duration > 45) issues.push('TOO_LONG');

  // Size > 50MB
  if (videoBlob.size > 50 * 1024 * 1024) issues.push('TOO_LARGE');

  // No motion (variance < threshold)
  const motionScore = await analyzeMotion(videoBlob);
  if (motionScore < 0.1) issues.push('NO_MOTION');

  return issues;
};

// UI: toast with reasons + retry
const issues = await validateVideo(videoBlob);
if (issues.length) {
  toast.error(`Please re-record: ${issues.join(', ')}`);
  return;
}
```

#### 4.3.7.2. Lambda MediaPipe обработка (Event-Driven)

**Pipeline (MVP):**
1. S3 upload → EventBridge → `test-engine` Lambda
2. Pre-process: crop/resize/normalize (**45s max**)
3. MediaPipe Pose (and Face Mesh if required): ~450 frames × 33 keypoints (Pose)
4. Apply quality gates

**Quality gates (minimum 5 checks):**

| Check | Criterion | Action |
|---|---|---|
| No keypoints | <10% frames with pose | `status = INVALID_NO_PERSON` |
| Low confidence | avg confidence < 0.5 | `status = LOW_CONFIDENCE` |
| No motion | variance keypoints < 0.05 | `status = NO_MOTION` |
| Bad lighting | brightness < 30 OR > 250 | `status = BAD_LIGHTING` |
| Wrong angle | shoulders/hips angle > 45° | `status = WRONG_ANGLE` |

#### 4.3.7.3. Retry логика (SQS FIFO, max 3 attempts/test/day)

```javascript
// packages/backend/src/handlers/test-engine.js
export async function processVideo(event) {
  const { videoUrl, attempt = 1, userId, testId } = event;

  try {
    const keypoints = await mediapipeAnalyze(videoUrl);
    const quality = assessQuality(keypoints);

    if (!quality.valid && attempt < 3) {
      await sqs.send({
        QueueUrl: PROCESS_QUEUE,
        MessageBody: JSON.stringify({
          ...event,
          attempt: attempt + 1,
          feedback: quality.feedback
        })
      });
      return { status: 'RETRYING', feedback: quality.feedback };
    }

    if (!quality.valid) {
      // max retries reached
      await saveAssessmentFailure(userId, testId, quality);
      return { status: 'INVALID', feedback: quality.feedback };
    }

    // ✅ Valid → DynamoDB + results
    await saveAssessment(userId, testId, keypoints);
    return { status: 'SUCCESS', scores: quality.scores };

  } catch (error) {
    await dlq.send({ videoUrl, error: error.message });
    return { status: 'FAILED', error };
  }
}
```

#### 4.3.7.4. UX (Results page)

- ✅ **VALID** → показать результаты (и план только для Basic+)
- ❌ **INVALID** → modal “Video is invalid” + **specific reason** + 1‑click “Re-record”
- **Retry count:** максимум 3
- **Important:** fallback questionnaire (если используется) **не засчитывает тест** и не заменяет MediaPipe-оценку; это только общий совет/триаж.

#### 4.3.7.5. Метрики качества (DynamoDB)

| Field | Value | Action |
|---|---|---|
| `qualityScore` | 0.0–1.0 | <0.3 = invalid |
| `confidenceAvg` | 0.0–1.0 | <0.5 = retry |
| `motionVariance` | 0.0–1.0 | <0.1 = no motion |
| `status` | VALID / INVALID / RETRYING | workflow trigger |
| `feedback` | string | UX hint |

**TCO impact (example):** 20% retry → +~20% Lambda usage; mitigate with strong client-side validation.



### 4.3.8. Защита MediaPipe пайпа от абьюза (100+ видео/день)

**Threat model:** 1 аккаунт пытается отправлять **100+ видео/день** вместо нормального объёма → резкий рост Lambda cost и деградация сервиса.

**Principle (must):** tier меняет только **количество доступных тестов**, но **любой видео‑сабмит** обязан проходить через одинаковые security/quality gates и quota enforcement.

#### 4.3.8.1. Client-side лимиты (React, до S3)

```javascript
// packages/frontend/src/lib/videoLimiter.js
const VIDEO_LIMITS = {
  perTest: 3,      // max 3 attempts / test/day
  // Plan-aware daily quota (previous PRD)
  // Free/Basic: 9 videos/day (3×3)
  // Pro:        21 videos/day (7×3)
  // Pro+:      45 videos/day (15×3)
  perDayMin: 9,      // Free/Basic: 9 videos/day (3 tests × 3 attempts)
  perHour: 5       // baseline, server is the source of truth
};

export const canRecord = async (testId) => {
  const { data } = await api.get('/limits/status');

  if (data.banned) {
    toast.error(`Video submissions temporarily blocked: ${data.banReason}`);
    return false;
  }

  if (data.perDayRemaining <= 0) {
    toast.error('Daily video limit reached. Please continue tomorrow.');
    return false;
  }

  if (data.perTestRemaining[testId] <= 0) {
    toast.error('Max attempts for this test reached.');
    return false;
  }

  return true;
};
```

**Note:** client-side limits are UX only; **server-side enforcement is mandatory**.

#### 4.3.8.2. API Gateway + WAF (Tier 1 defense)

| Level | Limit | Action | Alarm |
|---|---:|---|---|
| Per User | 5 videos/hour (baseline) | HTTP 429 | P1: `videoSubmissions > 5/hour` |
| Per IP | 20 videos/hour | WAF block 1h | P0: `IP abuse detected` |
| Per Test | 3 attempts/test | HTTP 400 | - |
| Global | 1000 videos/hour | API GW throttle | P0: `429 rate > 5%` |

**Terraform example (if using API keys):**

```hcl
resource "aws_api_gateway_usage_plan" "video_plan" {
  name = "video-submissions"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = "prod"
  }

  quota_settings {
    # daily videos per user (plan-aware is enforced in backend)
    limit   = 10
    period  = "DAY"
  }

  throttle_settings {
    rate_limit  = 5
    burst_limit = 10
  }
}
```

**Implementation note (Flow Logic):** если API keys не используются (Cognito JWT), то per-user quota must be enforced в Lambda authorizer / middleware (DynamoDB token bucket).

#### 4.3.8.3. Lambda Reserved Concurrency (Tier 2 defense)

- `test-engine` Lambda: `reservedConcurrency = 10`
- Абьюзер не может “съесть” весь compute.

```javascript
// CDK: packages/infra/lib/compute-stack.ts
new lambda.Function(this, 'TestEngine', {
  reservedConcurrentExecutions: 10,
  memorySize: 512,
  timeout: Duration.seconds(30)
});
```

#### 4.3.8.4. SQS FIFO + Circuit Breaker (Tier 3 defense)

- Видео → SQS FIFO
- **Deduplication** по `userId + testId + attempt` (или hash video)
- Consumer enforces **max 3 messages/test** and **plan-aware daily quota**.
- При превышении → DLQ + ban.

```javascript
// packages/backend/src/handlers/video-queue.js
export async function processVideoQueue(event) {
  const messages = event.Records;

  const userVideos = groupBy(messages, 'userId');

  for (const [userId, videos] of Object.entries(userVideos)) {
    // Tier 3 guard: per-batch abuse
    if (videos.length > 3) {
      await banUser(userId, 'VIDEO_ABUSE', 24*60*60);
      continue;
    }

    // normal MediaPipe processing...
  }
}
```

**Circuit breaker (must):**
- if `429 rate > 5%` OR `Lambda cost spike > $10/hour` → emergency throttle video submission endpoints (and alert on-call).

#### 4.3.8.5. Автоматический ban (Tier 4)

**Important:** ban never “switches” test scoring to non‑MediaPipe. It only blocks submissions.

| Abuse | Action | Duration |
|---|---|---|
| `> perDayQuota(plan)` | Soft ban: block video submissions | 24h |
| `> 50/day` (clearly abusive; violates monthly rule) | Hard ban: block account features | 7 days |
| `> 100/day` (clearly abusive; violates monthly rule) | Permanent ban + report | forever |

#### 4.3.8.6. DynamoDB `userLimits` (source of truth)

Minimal schema (example):

```
userId: "abc123"
plan: "proplus"
videoQuotaUsedDaily: 105
videoQuotaDay: 45  // Pro+: 15 tests × 3 attempts
videoQuotaUsedHourly: 6
banUntil: "2025-12-18T23:59Z"
banReason: "VIDEO_ABUSE"
updatedAt: "..."
```

#### 4.3.8.7. Monitoring + Alerting

| Metric | Threshold | Action |
|---|---|---|
| `videoSubmissions/user > perDayQuota(plan)` | P0 | auto-ban + Slack |
| `429 errors > 5%` | P1 | tighten WAF / throttle |
| `Lambda cost spike > $10/hour` | P0 | emergency throttle |

#### 4.3.8.8. TCO impact (example)

- Without protection: 1% abusers × 100 videos/day → high cost.
- With protection: enforce plan-aware daily quota + reserved concurrency + WAF → **-90%** abuse cost.

---

# 5. CI/CD STRATEGY

## 5.1. Repository Structure (Monorepo)

**Рекомендация:** Turborepo.

```
musclebalance/
├── packages/
│   ├── frontend/          # Flow Logic React app
│   ├── backend/           # Lambda handlers (API)
│   ├── shared/            # Shared types/schemas
│   └── infrastructure/    # Terraform/IaC
├── .github/
│   └── workflows/
├── .env.example
├── package.json
└── turbo.json
```

## 5.2. Environment Strategy

| Environment | Branch | Auto-deploy | URL | Purpose |
|-------------|--------|-------------|-----|---------|
| Development | feature/* | ❌ | localhost:3000 | Local dev |
| Preview | PR | ✅ | pr-*.vercel.app | Code review |
| Staging | develop | ✅ | staging.flowlogic.app | QA |
| Production | main | ⚠️ Manual approval | flowlogic.app | Live users |

## 5.3. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '20'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run type-check
      - name: Unit tests
        run: npm run test:unit
      - name: Integration tests
        run: npm run test:integration

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Dependency vulnerability scan
        run: npm audit --production
      - name: SAST (Static Analysis)
        uses: github/codeql-action/analyze@v2
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./

  build:
    needs: [validate, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Build frontend
        run: npm run build --workspace=frontend
      - name: Build backend
        run: npm run build --workspace=backend
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            packages/frontend/dist
            packages/backend/.serverless

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts
      - name: Deploy frontend to Vercel
        run: vercel deploy --prebuilt
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      - name: Deploy backend (Serverless)
        run: |
          cd packages/backend
          serverless deploy --stage staging
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      - name: Run smoke tests
        run: npm run test:smoke -- --env=staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://flowlogic.app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts
      - name: Deploy frontend
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      - name: Deploy backend
        run: |
          cd packages/backend
          serverless deploy --stage production
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      - name: Run migrations
        run: npm run migrate:up
        env:
          AWS_REGION: us-east-1
          STAGE: production
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      - name: Run smoke tests
        run: npm run test:smoke -- --env=production
        timeout-minutes: 5
      - name: Rollback on failure
        if: failure()
        run: |
          echo "Deployment failed, rolling back..."
          vercel rollback --token=${{ secrets.VERCEL_TOKEN }}
          cd packages/backend
          serverless rollback --stage production
```

## 5.4. Performance Targets

- Build time: ~3–4 min (cache)
- Deploy time: FE ~30s, BE ~2–3 min
- Rollback time: < 1 min

---

# 6. DEPLOYMENT ROLLBACK POLICY

## 6.1. Automatic Rollback Triggers

Автоматический rollback при:
- Smoke tests fail (timeout 5 min)
- Error rate > 5 ошибок за 5 минут
- `/health` = unhealthy
- Sentry critical alerts

## 6.2. Manual Rollback Procedures

```bash
#!/bin/bash
# scripts/rollback.sh

STAGE=$1
VERSION=$2

if [ -z "$STAGE" ] || [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh <stage> <version>"
  echo "Example: ./rollback.sh production v1.2.3"
  exit 1
fi

echo "Rolling back $STAGE to version $VERSION"

# Rollback frontend (Vercel)
vercel rollback --token=$VERCEL_TOKEN

# Rollback backend (Serverless)
cd packages/backend
serverless deploy --stage $STAGE --package .serverless-$VERSION

# Verify health
HEALTH_CHECK=$(curl -s https://api.flowlogic.app/health | jq -r '.status')
if [ "$HEALTH_CHECK" != "healthy" ]; then
  echo "Rollback verification failed"
  exit 1
fi

echo "Rollback complete and verified"
```

## 6.3. Health Check Endpoint

```javascript
// packages/backend/src/handlers/health.js
export const handler = async () => {
  const checks = {
    database: await checkDynamoDB(),
    s3: await checkS3(),
    cognito: await checkCognito(),
    eventbridge: await checkEventBridge()
  };

  const allHealthy = Object.values(checks).every(c => c.status === 'ok');

  return {
    statusCode: allHealthy ? 200 : 503,
    body: JSON.stringify({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERSION,
      environment: process.env.STAGE,
      checks
    })
  };
};
```

## 6.4. Rollback Testing

- Frequency: monthly
- Procedure: deploy staging → rollback → verify `/health` + ключевые флоу → document

---

# 7. ENVIRONMENT VARIABLES MANAGEMENT

## 7.1. Environment Variables Structure

```bash
# .env.example

AWS_REGION=us-east-1
STAGE=local

# Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx

# DynamoDB
DYNAMODB_USERS_TABLE=flowlogic-${STAGE}-users
DYNAMODB_SUBSCRIPTIONS_TABLE=flowlogic-${STAGE}-subscriptions
DYNAMODB_ASSESSMENTS_TABLE=flowlogic-${STAGE}-assessments
DYNAMODB_PLANS_TABLE=flowlogic-${STAGE}-plans
DYNAMODB_EXERCISES_TABLE=flowlogic-${STAGE}-exercises

# S3/CDN
S3_VIDEOS_BUCKET=flowlogic-${STAGE}-videos

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# API
API_BASE_URL=https://api.flowlogic.app
```

## 7.2. Secrets Management Strategy

- GitHub Secrets: deploy keys/tokens
- AWS Secrets Manager: runtime secrets

```javascript
// packages/backend/src/config/secrets.js
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: process.env.AWS_REGION });
let cachedSecrets = null;

export async function getSecrets() {
  if (cachedSecrets) return cachedSecrets;
  const response = await client.getSecretValue({
    SecretId: `flowlogic/${process.env.STAGE}/secrets`
  });
  cachedSecrets = JSON.parse(response.SecretString);
  return cachedSecrets;
}
```

## 7.3. Environment-specific Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| AWS_REGION | us-east-1 | us-east-1 | us-east-1 |
| LOG_LEVEL | debug | info | error |
| CACHE_TTL | 60s | 300s | 3600s |
| RATE_LIMIT | 1000/min | 100/min | 50/min |

---

# 8. LOCAL DEVELOPMENT SETUP

## 8.1. Docker Compose Environment

```yaml
# docker-compose.yml
version: '3.8'
services:
  dynamodb-local:
    image: amazon/dynamodb-local:latest
    ports: ["8000:8000"]
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
  dynamodb-admin:
    image: aaronshaf/dynamodb-admin:latest
    ports: ["8001:8001"]
    environment:
      DYNAMO_ENDPOINT: http://dynamodb-local:8000
    depends_on: [dynamodb-local]
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3,sqs,lambda,secretsmanager,eventbridge
      - DEBUG=1
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## 8.2. Development Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:services": "docker-compose up -d",
    "dev:frontend": "cd packages/frontend && vite",
    "dev:backend": "cd packages/backend && serverless offline --stage local",
    "setup:local": "node scripts/setup-local-tables.js",
    "seed:local": "node scripts/seed-local-data.js",
    "test:smoke": "node scripts/smoke.js"
  }
}
```

---

# 9. DATABASE MIGRATION STRATEGY

## 9.1. Migration Framework

### Структура миграций

```
packages/backend/migrations/
├── 001_create_users_table.js
├── 002_create_subscriptions_table.js
├── 003_create_assessments_table.js
├── 004_create_plans_table.js
└── migrate.js
```

### Migration Template

```javascript
// packages/backend/migrations/001_create_users_table.js
export const up = async (dynamodb) => {
  console.log('Running migration: 001_create_users_table');

  const params = {
    TableName: `flowlogic-${process.env.STAGE}-users`,
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    },
    SSESpecification: {
      Enabled: true,
      SSEType: 'KMS',
      KMSMasterKeyId: process.env.KMS_KEY_ID
    }
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('✅ Table created successfully');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('⚠️ Table already exists, skipping');
    } else {
      throw error;
    }
  }
};

export const down = async (dynamodb) => {
  console.log('Rolling back migration: 001_create_users_table');

  try {
    await dynamodb.deleteTable({
      TableName: `flowlogic-${process.env.STAGE}-users`
    }).promise();
    console.log('✅ Table deleted successfully');
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.log('⚠️ Table does not exist, skipping');
    } else {
      throw error;
    }
  }
};

export const metadata = {
  version: '001',
  description: 'Create users table with email GSI',
  author: 'team@flowlogic.app',
  createdAt: '2025-12-18'
};
```

## 9.2. Migration Runner

```javascript
// packages/backend/migrations/migrate.js
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const dynamodb = new AWS.DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1'
});

const MIGRATIONS_TABLE = `flowlogic-${process.env.STAGE}-migrations`;

async function ensureMigrationsTable() {
  try {
    await dynamodb.describeTable({ TableName: MIGRATIONS_TABLE }).promise();
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      await dynamodb.createTable({
        TableName: MIGRATIONS_TABLE,
        KeySchema: [{ AttributeName: 'version', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'version', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
      }).promise();

      console.log('✅ Migrations table created');
    } else {
      throw error;
    }
  }
}

async function getAppliedMigrations() {
  const result = await dynamodb.scan({ TableName: MIGRATIONS_TABLE }).promise();
  return (result.Items || []).map(item => item.version.S);
}

async function recordMigration(version, metadata) {
  await dynamodb.putItem({
    TableName: MIGRATIONS_TABLE,
    Item: {
      version: { S: version },
      appliedAt: { S: new Date().toISOString() },
      description: { S: metadata.description },
      author: { S: metadata.author }
    }
  }).promise();
}

async function loadMigrations() {
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.match(/^\d{3}_.*\.js$/) && f !== 'migrate.js')
    .sort();

  const migrations = [];
  for (const file of files) {
    const migration = await import(`./${file}`);
    migrations.push({
      file,
      version: migration.metadata.version,
      up: migration.up,
      down: migration.down,
      metadata: migration.metadata
    });
  }

  return migrations;
}

async function migrateUp() {
  console.log('🚀 Running database migrations...');

  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const all = await loadMigrations();

  const pending = all.filter(m => !applied.includes(m.version));

  if (pending.length === 0) {
    console.log('✨ No pending migrations');
    return;
  }

  for (const migration of pending) {
    console.log(`Applying: ${migration.version} - ${migration.metadata.description}`);
    await migration.up(dynamodb);
    await recordMigration(migration.version, migration.metadata);
    console.log(`✅ Applied: ${migration.version}`);
  }

  console.log('✨ All migrations applied successfully');
}

const command = process.argv[2];

if (command === 'up') {
  migrateUp().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
} else {
  console.log('Usage: npm run migrate:up');
  process.exit(1);
}
```

## 9.3. Migration Scripts in package.json

```json
{
  "scripts": {
    "migrate:up": "node packages/backend/migrations/migrate.js up"
  }
}
```

## 9.4. Migration in CI/CD

```yaml
# В deploy pipeline после deploy backend и до smoke tests
- name: Run migrations
  run: npm run migrate:up
  env:
    AWS_REGION: us-east-1
    STAGE: ${{ github.event.inputs.environment }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

# 10. SECURITY REQUIREMENTS

## 10.1. Security Scanning in CI/CD (полный workflow)

```yaml
# .github/workflows/security.yml
name: Security Scanning

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'   # weekly

jobs:
  sast:
    name: SAST (CodeQL)
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  dependency-scan:
    name: Dependency Vulnerabilities
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: npm audit
        run: npm audit --production --audit-level=moderate
        continue-on-error: true

  secret-scan:
    name: Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --debug --only-verified
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  iac-scan:
    name: IaC Security (tfsec/checkov)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: tfsec
        uses: aquasecurity/tfsec-action@v1.0.3
        with:
          soft_fail: true
      - name: checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: packages/infrastructure/
          framework: terraform
          quiet: true

  container-scan:
    name: Container Security (Trivy)
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t flowlogic:test .
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: flowlogic:test
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

## 10.2. Security Hardening Checklist (MVP)

### Application Security

- Authentication:
  - AWS Cognito
  - JWT access token TTL 15 min
  - Refresh token storage (httpOnly cookie)
- Authorization:
  - Tier-gating enforcement on backend (Free cannot access plans/exercises)
  - IAM least privilege
- Data protection:
  - KMS encryption for PII at rest
  - TLS 1.3 in transit
  - No PII in logs (masking)
- Input validation:
  - Schema validation
  - Rate limiting

### Secrets Management

- No secrets in repo
- GitHub Secrets for CI/CD
- AWS Secrets Manager for runtime

## 10.3. Security Response Plan

- Phase 1: Detection (0–15 min)
- Phase 2: Assessment (15–30 min)
- Phase 3: Containment (30–60 min)
- Phase 4: Eradication (1–4 h)
- Phase 5: Recovery (4–24 h)
- Phase 6: Post‑Mortem (1–3 d)

---

# 11. MONITORING & ALERTING

## 11.1. CloudWatch Alarms Configuration

### 11.1.1. Critical Alarms (P0)

```hcl
# infrastructure/terraform/monitoring.tf

# Lambda Critical Errors
resource "aws_cloudwatch_metric_alarm" "lambda_critical_errors" {
  alarm_name          = "flowlogic-${var.environment}-lambda-critical-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "P0: Lambda error rate > 10/min"
  treat_missing_data  = "notBreaching"

  alarm_actions = [
    aws_sns_topic.slack_critical.arn
  ]

  dimensions = {
    FunctionName = "flowlogic-${var.environment}-api"
  }
}

# API Gateway 5xx Errors
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "flowlogic-${var.environment}-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "20"
  alarm_description   = "P0: API 5xx errors > 20 in 5 min"

  alarm_actions = [aws_sns_topic.slack_critical.arn]
}

# DynamoDB Throttling
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "flowlogic-${var.environment}-dynamodb-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "P0: DynamoDB throttling detected"

  alarm_actions = [aws_sns_topic.slack_critical.arn]

  dimensions = {
    TableName = "flowlogic-${var.environment}-users"
  }
}

# Payment Processing Failures (custom metric)
resource "aws_cloudwatch_metric_alarm" "payment_failures" {
  alarm_name          = "flowlogic-${var.environment}-payment-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "PaymentFailed"
  namespace           = "FlowLogic"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "P0: Payment failures > 5 in 5 min"

  alarm_actions = [aws_sns_topic.slack_critical.arn]
}
```

### 11.1.2. High Priority Alarms (P1)

```hcl
# API Latency P95
resource "aws_cloudwatch_metric_alarm" "api_latency_p95" {
  alarm_name          = "flowlogic-${var.environment}-api-latency-p95"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"

  metric_query {
    id          = "p95"
    return_data = true

    metric {
      metric_name = "Duration"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "p95"

      dimensions = {
        FunctionName = "flowlogic-${var.environment}-api"
      }
    }
  }

  threshold         = 1000
  alarm_description = "P1: API P95 latency > 1s"

  alarm_actions = [aws_sns_topic.slack_high.arn]
}

# CloudFront cache hit rate (low)
resource "aws_cloudwatch_metric_alarm" "cloudfront_cache_hit_rate" {
  alarm_name          = "flowlogic-${var.environment}-cache-hit-rate"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CacheHitRate"
  namespace           = "AWS/CloudFront"
  period              = "3600"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "P1: CloudFront cache hit rate < 80%"

  alarm_actions = [aws_sns_topic.slack_high.arn]
}
```

## 11.2. Custom Metrics

### 11.2.1 Business Metrics Publisher

```javascript
// packages/backend/src/utils/metrics.js
import { CloudWatch } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION || 'us-east-1' });

export class MetricsPublisher {
  constructor(namespace = 'FlowLogic') {
    this.namespace = namespace;
    this.buffer = [];
  }

  async publish(metricName, value, unit = 'Count', dimensions = {}) {
    const metric = {
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date(),
      Dimensions: [
        { Name: 'Environment', Value: process.env.STAGE || 'unknown' },
        ...Object.entries(dimensions).map(([k, v]) => ({ Name: k, Value: String(v) }))
      ]
    };

    this.buffer.push(metric);

    if (this.buffer.length >= 20) {
      await this.flush();
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;

    await cloudwatch.putMetricData({
      Namespace: this.namespace,
      MetricData: this.buffer
    });

    this.buffer = [];
  }
}

export const metrics = new MetricsPublisher();
```

## 11.3. Dashboard Configuration

### 11.3.1 Operational Dashboard

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "API Performance",
        "metrics": [
          ["AWS/Lambda", "Invocations", { "stat": "Sum" }],
          [".", "Errors", { "stat": "Sum", "color": "#d62728" }],
          [".", "Duration", { "stat": "p95", "label": "P95 Latency" }]
        ],
        "period": 300,
        "region": "us-east-1"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Business Metrics",
        "metrics": [
          ["FlowLogic", "UserRegistration", { "stat": "Sum" }],
          [".", "TestCompleted", { "stat": "Sum" }],
          [".", "PaymentSuccess", { "stat": "Sum" }],
          [".", "PlanGenerated", { "stat": "Sum" }]
        ],
        "period": 3600,
        "region": "us-east-1"
      }
    }
  ]
}
```

## 11.4. Alerting Channels

### 11.4.1 SNS Topics Configuration

```hcl
# infrastructure/terraform/alerting.tf
resource "aws_sns_topic" "slack_critical" {
  name = "flowlogic-${var.environment}-slack-critical"
}

resource "aws_sns_topic" "slack_high" {
  name = "flowlogic-${var.environment}-slack-high"
}

resource "aws_sns_topic" "slack_medium" {
  name = "flowlogic-${var.environment}-slack-medium"
}
```

### 11.4.2 Slack Integration (SNS → Lambda)

```javascript
// packages/backend/src/handlers/slack-notifier.js
export async function handler(event) {
  const message = JSON.parse(event.Records[0].Sns.Message);

  const severity = message.AlarmName.includes('critical') ? '🔴 CRITICAL' :
                   message.AlarmName.includes('high') ? '🟠 HIGH' :
                   '🟡 MEDIUM';

  const slackMessage = {
    text: `${severity}: ${message.AlarmName}`
  };

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackMessage)
  });
}
```

---

# 12. CHANGELOG & VERSION CONTROL

## 12.1. Semantic Versioning

Проект следует Semantic Versioning 2.0.0:
- **MAJOR:** breaking changes
- **MINOR:** backward compatible features
- **PATCH:** backward compatible bug fixes

Формат: **MAJOR.MINOR.PATCH** (например, 1.2.3)

## 12.2. Release Process

### 12.2.1. Manual steps (release branch)

```bash
# 1) create release branch
git checkout -b release/v1.2.0

# 2) bump version
npm version minor --no-git-tag-version

# 3) update CHANGELOG.md
# 4) commit
git commit -am "chore: release v1.2.0"

# 5) open PR to main
gh pr create --title "Release v1.2.0" --base main --body "$(cat CHANGELOG.md | head -80)"

# 6) merge -> CI deploys to production

# 7) merge main back to develop
git checkout develop
git merge main
git push origin develop
```

### 12.2.2. GitHub Actions Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    if: startsWith(github.event.head_commit.message, 'chore: release v')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Extract version
        id: version
        run: |
          VERSION=$(cat package.json | python3 -c "import json,sys; print(json.load(sys.stdin).get('version','0.0.0'))")
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Create git tag
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git tag -a v${{ steps.version.outputs.version }} -m "Release v${{ steps.version.outputs.version }}"
          git push origin v${{ steps.version.outputs.version }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ steps.version.outputs.version }}
          name: Release v${{ steps.version.outputs.version }}
          generate_release_notes: true
```

## 12.3. CHANGELOG.md Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog,
and this project adheres to Semantic Versioning.

## [Unreleased]

### Added
- Feature in progress

## [1.2.0] - 2025-02-15

### Added
- CI/CD pipeline with automatic rollback
- Database migration framework
- Security scanning (SAST/secret scanning/IaC)
- Monitoring dashboards and alerts

### Changed
- Improved deploy performance with caching

### Fixed
- Bug fixes

### Security
- Dependency updates
```

## 12.4. Infrastructure and Database Versioning

- IaC changes are versioned with code.
- DB migrations must be backwards compatible.

## 12.5. Guaranteed Rollback Strategy

Любая потенциально breaking миграция делается в 2 релиза (expand/contract), чтобы был гарантированный rollback.

## 12.6. Hotfix Flow

1. `hotfix/v1.2.1` from `main`
2. fix + tests
3. merge into `main`
4. auto deploy
5. merge `main` back into `develop`

## 12.7. Git Best Practices

- No direct commits to `main`/`develop`
- PRs only, squash merge preferred
- Conventional Commits: `type(scope): summary`

---

# 13. LEGAL & COMPLIANCE

- Wellness only disclaimer (mandatory consent)
- GDPR/CCPA delete/export
- Accessibility: WCAG 2.1 AA (target)
- COPPA: 18+ (MVP)


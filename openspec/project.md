# Project Context

## Purpose

**Flow Logic** is a B2C platform for movement quality assessment through MediaPipe pose estimation and correction through AI-generated training plans.

**Key Characteristics:**
- Wellness platform (not a medical product)
- **Current System:** Activity-Based Tier System (Casual/Committed/Dedicated) for Premium users
- **MVP System:** Legacy tiers (Free/Basic/Pro) - Free tier is separate from Activity-Based (premium feature)
- MediaPipe-based assessment tests:
  - Activity-Based: 4/7/11 tests (Casual/Committed/Dedicated)
  - Legacy/MVP: 3/3/7 tests (Free/Basic/Pro)
- AI-generated exercises and training plans (exercises and tests sourced from existing database)
- Smart calendar with daily tasks
- Progress tracking with charts and visualizations

**Business Value:**
- Quick results: users get assessment and problem areas immediately after tests
- Monetization through value: Free without plan, Basic+ with exercises/plans
- Retention driver: training plans + progress tracking (paid tiers)

## Tech Stack

### Frontend
- **React 18+** (TypeScript)
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Zustand** (state management)
- **React Router** (routing)
- **Axios** (HTTP client)
- **Deployment:** Vercel

### Backend
- **Node.js 20+** (TypeScript)
- **Express.js** (API framework)
- **Serverless Framework** (IaC)
- **AWS Lambda** (compute)
- **AWS API Gateway** (API management)
- **AWS DynamoDB** (database, 9 tables including migrations, KMS encryption)
- **AWS Cognito** (authentication, JWT)
- **AWS S3** (video storage)
- **AWS CloudWatch** (monitoring)

### Infrastructure
- **AWS** (Lambda, API Gateway, DynamoDB, S3, Cognito, CloudWatch, CloudTrail)
- **Vercel** (frontend hosting)
- **GitHub Actions** (CI/CD)
- **Serverless Framework** (Infrastructure as Code - primary tool for serverless components)
- **Terraform** (Infrastructure as Code - used only when needed: VPC, complex infrastructure, centralized IAM, multi-cloud)
- **AWS Infrastructure Hygiene System** (Compliance and governance for all resources)

**IaC Tool Selection Strategy:**
- **Serverless Framework:** Used for Lambda, API Gateway, DynamoDB, S3, Cognito (current stack)
- **Terraform:** Added only when criteria are met (VPC, complex infrastructure, centralized IAM, multi-cloud)
- **Decision Criteria:** See `docs/infrastructure/iac-strategy.md` for detailed guidelines
- **Compliance:** AWS Infrastructure Hygiene System monitors all resources regardless of creation tool

### External Services
- **Stripe** (payment processing)
- **MediaPipe** (pose estimation)
- **AWS SSM Parameter Store** (secrets management)

## Project Conventions

### Code Style

**TypeScript:**
- Strict mode enabled
- ESLint + Prettier for formatting
- Naming conventions:
  - Components: PascalCase (`UserProfile.tsx`)
  - Functions: camelCase (`getUserData`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
  - Types/Interfaces: PascalCase (`UserData`, `ApiResponse`)

**File Organization:**
- Components: `src/frontend/components/`
- Pages: `src/frontend/pages/`
- Utils: `src/frontend/utils/`
- API: `src/backend/api/`
- Services: `src/backend/services/`
- Models: `src/backend/models/`

**Import Order:**
1. External dependencies
2. Internal modules
3. Types/interfaces
4. Constants

### Architecture Patterns

**Frontend:**
- Component-based architecture
- State management with Zustand
- API calls through Axios with interceptors
- Route-based code splitting

**Backend:**
- Serverless architecture (AWS Lambda)
- RESTful API design
- Service layer pattern
- Repository pattern for data access

**Database:**
- DynamoDB with single-table design where possible
- KMS encryption at rest
- GSI (Global Secondary Index) for queries
- **Anti-Abuse Tables:**
  - `devices` - Device fingerprinting (device_id, last_trial_at, user_id)
  - `phones` - Phone verification (user_id, phone_number, verified)
  - `abuse-flags` - Behavioral monitoring (user_id, flags, reviewed)

**Security:**
- JWT authentication with refresh tokens
- Tier-based access control
- Encryption at rest (DynamoDB KMS)
- Encryption in transit (HTTPS)
- AWS SSM Parameter Store for secrets

### Testing Strategy

**Test Types:**
- Unit tests: Jest + React Testing Library
- Integration tests: API endpoints
- E2E tests: Playwright (optional)

**Test Coverage:**
- Minimum 80% for critical paths
- 100% for authentication and payment flows

**Test Commands:**
```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e      # E2E tests
```

### Git Workflow

**Branching Strategy:**
- `main` - production branch
- `develop` - development branch
- `feature/*` - feature branches
- `fix/*` - bugfix branches

**Commit Conventions:**
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(auth): add JWT refresh token support`

**Pull Request Process:**
1. Create feature branch from `develop`
2. Implement changes
3. Run tests and linting
4. Create PR with description
5. Code review required
6. Merge to `develop` after approval
7. Deploy to staging
8. Merge to `main` after QA approval

**Spec-Driven Development:**
- All new features use Spec-Driven workflow
- Commands: `/specify`, `/plan`, `/tasks`, `/implement`
- Documentation: `.specify/features/{name}/spec.md`
- See: `docs/planning/spec_driven_workflow_guide.md`

## Domain Context

### Core Concepts

**Assessment Test:**
- MediaPipe-based pose estimation test
- User records video performing specific movement
- System analyzes movement quality
- Returns scores and problem areas (hidden from user in MVP)
- **First Test (MVP):** Overhead Squat - teaches recording, not measurement
- **MVP Rule:** User never sees total test count during assessment flow
- **Quality Gate Failures:** Show helpful suggestions, not error codes (e.g., "Try moving camera higher" instead of "WRONG_ANGLE")

**Tier System:**

**CRITICAL: Activity-Based Tier System**

Users do NOT choose tier upfront. System assigns tier dynamically based on observed activity over 2-3 weeks.

**Core Principle:** Test volume correlates with activity level.

**Why This Makes Sense:**
- **Casual tier:** Limited training volume → limited testing (3+1 retest = 4 tests)
- **Committed tier:** Moderate volume → moderate testing (7 tests)
- **Dedicated tier:** High volume → comprehensive testing (11 tests)
- Users doing 1 exercise/day don't need 7-9 tests

| Tier | Completion Rate | Tests (2mo) | Plan | Price |
|------|----------------|-------------|------|-------|
| **Casual** | 30-50% | 4 | 1 exercise/day, 1 main focus | Free or $4.99 |
| **Committed** | 60-80% | 7 | 2-3 exercises/day, 2-3 focus areas | $9.99 |
| **Dedicated** | 80%+ | 11 | 3-4 exercises/day, comprehensive | $9.99 |

**Tier Assignment Logic:**

**Week 1-2:** Everyone starts with same baseline plan (2-3 exercises/day)

**Week 3:** System evaluates activity:
```javascript
if (completionRate < 0.5) {
  tier = 'casual';
  plan = simplifyPlan(currentPlan);  // 1 exercise/day
  testsRemaining = 1;  // only 1 retest at week 7
}
else if (completionRate < 0.8) {
  tier = 'committed';
  plan = currentPlan;  // keep 2-3 exercises/day
  testsRemaining = 4;  // +2 now, +1 week 5, +1 week 7
}
else {
  tier = 'dedicated';
  plan = expandPlan(currentPlan);  // 3-4 exercises/day
  testsRemaining = 8;  // +2 now, +2 week 4, +2 week 6, +2 week 8
}
```

**Test Schedule by Tier:**

**Casual (30-50% completion):**
- Week 1: 3 baseline tests
- Week 3: NO new tests (system adapts plan to 1 exercise/day)
- Week 7: 1 retest (main problem only)
- **Total: 4 tests over 2 months**

**Committed (60-80%):**
- Week 1: 3 baseline tests
- Week 3: +2 targeted tests (unlocked by 70%+ completion)
- Week 5: +1 validation test
- Week 7: +1 final retest
- **Total: 7 tests over 2 months**

**Dedicated (80%+):**
- Week 1: 3 baseline tests
- Week 2: +2 early diagnostic (fast unlock due to high activity)
- Week 4: +2 targeted tests
- Week 6: +2 validation tests
- Week 8: +2 comprehensive retest
- **Total: 11 tests over 2 months**

**Tier Transitions:**

**Upward (Casual → Committed):**
- If Casual user increases to 60%+ completion for 2 consecutive weeks
- Offer upgrade: "Ready for more? Unlock advanced plan"
- Unlock additional tests
- Increase exercise variety

**Downward (Committed → Casual):**
- If Committed user drops to <40% completion for 2 consecutive weeks
- Auto-simplify: "Let's make this easier"
- Reduce to 1 exercise/day
- Lock remaining progressive tests

**UX Messages (Week 3 Tier Assignment):**

**Casual Assignment (30-50% completion):**
```
Let's adjust your plan

You completed: 5/14 days (36%)

That's okay! Let's make it easier:

New Plan:
- 1 key exercise per day
- 5 minutes max
- Focus on your main issue

Goal: 4-5 days per week

Next check-in: Week 7 (1 quick retest)
```

**Committed Assignment (60-80% completion):**
```
Great progress! 🎉

You completed: 11/14 days (79%)

Time to check specific areas:

We'll test 2 areas now, and plan check-ins every 2 weeks.

[Start Check-in]
```

**Dedicated Assignment (80%+ completion):**
```
Amazing consistency! 🔥

You completed: 13/14 days (93%)

You're ready for comprehensive assessment.

We'll test 2 areas now, 2 more in 2 weeks, building a detailed profile.

[Start Advanced Check-in]
```

**Free vs Premium:**

**Free Tier (Separate from Activity-Based):**
- 3 baseline tests only
- Static plan (doesn't adapt to activity)
- No exercises/plans (assessment only)
- Separate from Activity-Based system (premium feature)

**Premium (Activity-Based Tier System):**
- 3 baseline + adaptive testing
- Plan adapts to your activity level
- All 3 Activity-Based tiers available (Casual/Committed/Dedicated)
- Progress tracking + charts

**Legacy Tier System (MVP Only - Deprecated for Full Version):**

| Tier | Tests | Features | CPU | Pose Accuracy | Price | Lambda Config |
|------|-------|----------|-----|---------------|-------|---------------|
| **Free** | 3 | Tests + results only (no exercises/plan) | 20% | 94-96% | $0 | 512MB, 15s |
| **Basic** | 3 | Tests + results + exercises + plan (lite) | 25-30% | 94-96% | $4.99 | 512MB, 15-20s |
| **Pro** | 7 | Tests + extended results + exercises + plan | 45% | 92-94% | $9.99 | 768MB, 20s |
| **Pro+** | 15 | All tests + full results + exercises + plan + advanced features | 100% | 91-93% | $19.99 | 1024MB ARM64, 30s |

**Tier Gating Rules (Mandatory):**
- Activity-Based tier assignment at Week 3 based on completion rate (Premium only)
- Attempts cap: 3 video attempts per test per day
- MediaPipe-only: All tests must be executed and scored via MediaPipe (no fallback scoring)
- No fallback: If MediaPipe quality gates fail, test is not completed (user must retry)

**Training Plan:**
- AI-generated exercises based on assessment results
- Personalized to user's problem areas
- **Activity-adaptive:** Plan complexity adjusts based on completion rate
  - Casual (30-50%): 1 exercise/day, 1 main focus, 5 minutes max
  - Committed (60-80%): 2-3 exercises/day, 2-3 focus areas
  - Dedicated (80%+): 3-4 exercises/day, comprehensive plan
- Smart calendar with daily tasks (2-4 tasks/day depending on tier)
- Progress tracking with charts
- **Streak rules:** 100% completed → +2, 70-99% → +1, <70% → +0

## MVP User Flow & UX Rules

### MVP Core Principle

**1 экран = 1 решение пользователя**

- ❌ Никаких списков
- ❌ Никаких "панелей управления"
- ✅ Один фокус на каждом экране

### MVP Flow: 5 Critical Screens

#### 🟢 Screen 1: Welcome / Promise (10 seconds)

**Goal:** Remove anxiety and set expectations

**Content:**
- **Headline:** "Check how your body moves — in 5 minutes"
- **Subheadline:** "No diagnosis. No equipment. Just your camera."
- **CTA:** "Start assessment"

**❌ FORBIDDEN:**
- Tiers/pricing
- MediaPipe mentions
- AI mentions
- "15 tests" mention

#### 🟢 Screen 2: What Will Happen (Expectation Setup)

**Goal:** Prevent frustration before it happens

**Content:**
- **3 Cards:**
  1. "Record short movements"
  2. "We analyze how you move"
  3. "You get clear next steps"
- **Small text:** "If a video needs adjustment, we'll guide you."
  - This is insurance against INVALID before starting
- **CTA:** "Continue"

#### 🟢 Screen 3: Assessment Flow (CRITICAL)

**Rule:** User NEVER knows how many tests total.

**User sees only:**
- **Progress bar:** "Step 1 of 3"
- **Block name:** "Lower body movement"
- **Timing:** ~60 sec

**If video fails quality gates:**

❌ **DON'T show:** "Invalid video", "LOW_CONFIDENCE", "WRONG_ANGLE"

✅ **DO show:** "Almost there — try stepping a bit farther back"
- One suggestion. Not a list.
- User must think: "I almost got it"

**Critical UX Rule:**
- User should always think: "I almost succeeded"
- If user thinks: "I don't fit this app" → product failed

#### 🟢 Screen 4: Results → Action (NO REPORT!)

**❌ FORBIDDEN to show:**
- Scores
- Percentages
- Charts
- P1 / P2 labels
- PDF reports
- Detailed breakdowns

**✅ ALLOWED:**
- **Headline:** "Here's what matters most right now"
- **2-3 Cards:**
  - "Ankle mobility limits squat depth"
  - "Hip control affects balance"
- **🔥 "Today's Plan" Block:**
  - "Today: 3 simple exercises (5–7 min)"
  - **CTA:** "Start today"

**Critical Rule:** Result without action = failure

#### 🟢 Screen 5: Calendar (After First Action)

**Only shown AFTER user:**
- Started exercises
- Checked at least one checkbox

**Then show:**
- Streak counter
- Calendar view
- Progress tracking

### MVP Success Criteria

**If user completed:**
1. Welcome screen
2. 1 block of tests (3 baseline)
3. Got today's plan
4. Started exercises

**→ Product already won.**

### First Test: Overhead Squat (CRITICAL)

**🎯 Goal of first test:**
- NOT to measure
- TO teach user how to successfully record video

**Why Overhead Squat first:**
- Intuitive movement
- Shows full body
- Easy to understand errors
- Most recognizable test

**Screen Structure:**

**Top:**
- **Name:** "Simple movement check"
- **Caption:** "Stand back so your full body fits the frame"

**Center:**
- **Loop video (5 sec):** Regular person, not perfect athlete

**Bottom:**
- **Button:** "Record (10 sec)"

**If MediaPipe fails:**

❌ **DON'T show:** "LOW_CONFIDENCE", "WRONG_ANGLE"

✅ **DO show:**
- "We couldn't clearly see your hips"
- "Try moving the camera a bit higher"
- **One suggestion. Not a list.**

### What to REMOVE from MVP (Mandatory)

**❌ Remove from MVP:**

1. **Pro+ tier**
   - Keep: Free, Basic, Pro
   - Pro+ = later feature

2. **15 tests**
   - MVP maximum:
     - 3 tests (Free / Basic)
     - 7 tests (Pro)
   - 15 tests = enterprise level, not MVP

3. **Share cards / badges**
   - Not needed to prove value

4. **Auto-adaptation of load**
   - Manual rules → sufficient

5. **Large reports**
   - No PDFs
   - No tables
   - No "detailed breakdowns"

### What to KEEP in MVP (Mandatory)

| Element | Why |
|---------|-----|
| Quality gates | Without them, no trust |
| Retry UX | Critical for success |
| Today plan | Core value proposition |
| Calendar | Retention mechanism |
| P1/P2 under the hood | System brain (not shown to user) |

### MVP Tier Structure

**MVP Tiers:**
- **Free:** 3 baseline tests only
- **Basic:** 3 tests + exercises + plan
- **Pro:** 7 tests + exercises + plan

**NOT in MVP:**
- Pro+ tier (15 tests)
- Activity-Based tier assignment (manual rules for MVP)
- Tier transitions (manual for MVP)

**Problem Areas:**
- Identified movement issues from assessment
- Prioritized as P1 (root cause) or P2 (consequence)
- P1 candidates: ankle mobility, hip control/activation, core control, shoulder/scap control
- P2 patterns: compensations in overhead squat, lateral lunge, balance asymmetries
- Used to generate targeted exercises
- Tracked over time for progress

**Assessment Tests Catalog (15 tests - Elite):**

All 15 tests must be executed and scored via MediaPipe (MediaPipe Pose + Face Mesh if needed).

| ID | Test Name | Primary Signal | Output | Notes |
|----|-----------|----------------|--------|-------|
| 1 | Neck Flexion/Extension | cervical ROM | pass/limited/significant + confidence | front/side camera |
| 2 | Plank Endurance | time under correct alignment | seconds + pass/fail | form quality gating |
| 3 | Y-Balance | dynamic reach symmetry | symmetric/asymmetric + severity | side-to-side delta |
| 4 | Overhead Squat | knee valgus, heel lift, trunk angle, depth | good/compensation/significant + flags | key global pattern |
| 5 | 90-90 Hip/Shoulder | hip IR/ER + shoulder ER/IR | within-range/limited + side | combined test |
| 6 | Ankle Mobility | dorsiflexion ROM | pass/limited/significant + confidence | knee-to-wall protocol |
| 7 | Single-Leg Balance | static balance stability | seconds + quality score | eyes open (MVP) |
| 8 | Lateral Lunge | frontal-plane control + hip mobility | good/compensation/significant + side | knee tracking flags |
| 9 | Shoulder Flexion | overhead ROM | pass/limited + side | scap compensation flag |
| 10 | Wall Slide | scapular control + thoracic mobility | pass/needs-work | quality score |
| 11 | Dead Bug | core stability under limb motion | pass/needs-work | lumbar control |
| 12 | Glute Bridge | posterior chain + pelvic control | pass/needs-work + side | asymmetry flag |
| 13 | Chin Tuck | deep neck flexor control | pass/needs-work | posture cue |
| 14 | Bird Dog | cross-body core + stability | pass/needs-work + side | balance drift |
| 15 | Clamshell | hip abductor activation/control | pass/needs-work + side | glute med proxy |

**Tier Test Subsets (Activity-Based):**

**Baseline Tests (All tiers, Week 1):**
- 4 (Overhead Squat), 3 (Y-Balance), 7 (Single-Leg Balance)

**Casual Tier (30-50% completion):**
- Week 1: 3 baseline tests
- Week 7: 1 retest (main problem area only)
- Total: 4 tests

**Committed Tier (60-80% completion):**
- Week 1: 3 baseline tests
- Week 3: +2 targeted tests (based on problem areas)
- Week 5: +1 validation test
- Week 7: +1 final retest
- Total: 7 tests

**Dedicated Tier (80%+ completion):**
- Week 1: 3 baseline tests
- Week 2: +2 early diagnostic tests
- Week 4: +2 targeted tests
- Week 6: +2 validation tests
- Week 8: +2 comprehensive retest
- Total: 11 tests

**Legacy Tier Test Subsets (for reference):**
- **Free/Basic (3 tests):** 4 (Overhead Squat), 3 (Y-Balance), 7 (Single-Leg Balance)
- **Pro (7 tests):** 4, 3, 7, 6 (Ankle Mobility), 9 (Shoulder Flexion), 2 (Plank Endurance), 11 (Dead Bug)
- **Pro+ (15 tests):** All 1-15

**MediaPipe Quality Gates (Mandatory):**
- Pose/Face tracking confidence ≥ 80% of frames for required landmarks
- Correct camera framing (full body or upper body as required)
- Lighting/occlusion checks pass (no missing hips/shoulders)
- If quality gate fails: do NOT mark test as completed, show actionable instructions, allow retry
- Store audit event: `assessment.measurement_failed` with reason

### Business Rules

1. **Tier Access:**
   - **Free Tier (Legacy/MVP):** Static plan, 3 baseline tests only, no exercises/plans
   - **Premium (Activity-Based Tier System):**
     - **Week 1-2:** All users start with same baseline plan (2-3 exercises/day)
     - **Week 3:** System evaluates completion rate and assigns tier:
       - Casual (30-50%): Simplifies to 1 exercise/day, 4 tests total
       - Committed (60-80%): Keeps 2-3 exercises/day, 7 tests total
       - Dedicated (80%+): Expands to 3-4 exercises/day, 11 tests total
     - **Tier Transitions:** Users can move between tiers based on activity changes
   - **Note:** Free tier is separate from Activity-Based system (premium feature)

2. **Assessment Limits:**
   - **Free Tier (Legacy/MVP):** 3 baseline tests only
   - **Activity-Based (Premium):**
     - **Casual tier:** 4 tests over 2 months (3 baseline + 1 retest at week 7)
     - **Committed tier:** 7 tests over 2 months (3 baseline + 2 week 3 + 1 week 5 + 1 week 7)
     - **Dedicated tier:** 11 tests over 2 months (3 baseline + 2 week 2 + 2 week 4 + 2 week 6 + 2 week 8)
   - Attempts: 3 video attempts per test per day
   - Tier assignment (Activity-Based): Based on completion rate at Week 3 (30-50% = Casual, 60-80% = Committed, 80%+ = Dedicated)
   - Tier transitions (Activity-Based): Can move up/down based on activity changes

3. **Subscription:**
   - Stripe integration for payments
   - Automatic renewal
   - Cancellation allowed anytime
   - No refunds (clearly stated)

4. **Wellness Disclaimer:**
   - Not a medical product
   - Users must accept disclaimer before use
   - No medical advice provided

## Important Constraints

### Technical Constraints

1. **AWS Services:**
   - Must use AWS services (Lambda, DynamoDB, S3, Cognito)
   - Serverless architecture required
   - KMS encryption mandatory for sensitive data

2. **Performance:**
   - API response time: < 500ms (p95)
   - Video processing: < 30 seconds
   - Frontend load time: < 2 seconds
   - Chart/dashboard load: < 3s (mobile)
   - Build time: ~3-4 min (with cache)
   - Deploy time: FE ~30s, BE ~2-3 min
   - Rollback time: < 1 min

3. **Scalability:**
   - Must handle 10,000+ concurrent users
   - Auto-scaling Lambda functions
   - DynamoDB on-demand capacity

4. **Security:**
   - JWT tokens with 15-minute expiry
   - Refresh tokens with 7-day expiry
   - All API endpoints require authentication (except public)
   - Tier-based access control enforced
   - **Anti-Abuse System (6 layers):**
     - Device fingerprinting (1 trial per device/30 days)
     - Email validation (block disposable emails)
     - Phone verification (Free tier mandatory)
     - Payment validation (Paid tier identity proof)
     - Behavioral monitoring (detect abuse patterns)
     - Rate limiting (all endpoints)

### Business Constraints

1. **Language:**
   - MVP: English only (UI, emails, system messages)
   - Multi-language support: future feature

2. **Compliance:**
   - GDPR compliance required
   - Wellness disclaimer mandatory
   - Terms of Service and Privacy Policy required

3. **Monetization:**
   - Free tier: Limited features (no exercises)
   - Paid tiers: Stripe integration required
   - Subscription management required

### Regulatory Constraints

1. **Medical Disclaimer:**
   - Not a medical product
   - No medical advice
   - Wellness only

2. **Data Privacy:**
   - User data encryption required
   - GDPR compliance
   - Data retention policies

## External Dependencies

### AWS Services

1. **AWS Lambda:**
   - Backend API functions
   - Video processing functions
   - Scheduled tasks

2. **AWS DynamoDB:**
   - User data (`users` table)
   - Assessment results (`assessments` table)
   - Training plans (`plans` table)
   - Subscription data (`subscriptions` table)
   - Device tracking (`devices` table) - for anti-abuse
   - Phone verification (`phones` table) - for anti-abuse
   - Abuse flags (`abuse-flags` table) - for behavioral monitoring

3. **AWS S3:**
   - Video storage
   - Static assets

4. **AWS Cognito:**
   - User authentication
   - JWT token management

5. **AWS API Gateway:**
   - REST API endpoints
   - Request/response handling

6. **AWS CloudWatch:**
   - Logging
   - Metrics
   - Alarms

### Third-Party Services

1. **Stripe:**
   - Payment processing
   - Subscription management
   - Webhook handling
   - Fraud detection (Stripe Radar)
   - 3D Secure for risky transactions

2. **Vercel:**
   - Frontend hosting
   - CDN
   - Automatic deployments

3. **MediaPipe:**
   - Pose estimation (MediaPipe Pose for full-body landmarks)
   - Face Mesh (for neck/chin precision if needed)
   - Movement analysis
   - Output normalization: pass/limited/significant + confidence

4. **GitHub:**
   - Version control
   - CI/CD (GitHub Actions)

5. **EventBridge:**
   - Event-driven architecture
   - Video processing triggers

6. **SQS FIFO:**
   - Video processing queue
   - Retry logic (max 3 attempts/test/day)
   - Deduplication by userId + testId + attempt

7. **FingerprintJS:**
   - Device fingerprinting
   - Multi-account detection
   - Accuracy: ~99.5%

8. **AWS SNS:**
   - SMS delivery for phone verification
   - Cost: ~$0.00645 per message (US)

9. **Abstract API (optional):**
   - Email validation (disposable email detection)
   - Advanced email quality checks

### Development Tools

1. **OpenSpec:**
   - Spec-Driven Development framework
   - Change management
   - Proposal → Spec → Implementation workflow

2. **Beads:**
   - Issue tracking
   - Task dependency graph
   - Work management

3. **Cursor:**
   - AI-powered IDE
   - Integration with OpenSpec and Beads

## Development Workflow

### Spec-Driven Development

**For New Features:**
1. `/openspec-proposal` - Create proposal
2. Edit `proposal.md`, `tasks.md`, `spec.md`
3. `/openspec-to-beads` - Transform to Beads tasks
4. `bd ready` - Find ready tasks
5. `bd start {task-id}` - Start work
6. Implement task
7. `bd close {task-id}` - Complete task
8. `/openspec-apply` - Verify against spec
9. `/openspec-archive` - Archive change

**For Existing Features:**
- Update/create retrospective spec
- Follow same workflow

### Code Quality

**Linting:**
- ESLint for TypeScript/JavaScript
- Prettier for code formatting
- Pre-commit hooks for validation

**Code Review:**
- All PRs require review
- Automated tests must pass
- Security checks required

**Documentation:**
- Code comments for complex logic
- README files for modules
- API documentation in `docs/api_documentation.md`

## Project Structure

```
flowlogic-platform/
├── docs/                    # Documentation
│   ├── requirements/       # PRD, User Stories, Glossary
│   ├── architecture/       # C4 diagrams, DB schema, API spec
│   ├── planning/           # Epics, Sprint plan, Roadmap
│   ├── security/           # Threat model, Security checklist
│   └── testing/            # Test plan, Test reports
├── src/
│   ├── backend/           # Backend API (Lambda)
│   └── frontend/          # Frontend (React)
├── infra/                  # Infrastructure as Code
│   ├── serverless/        # Serverless Framework config
│   └── ci-cd/             # GitHub Actions workflows
├── tests/                  # Tests
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # E2E tests
├── openspec/               # OpenSpec changes
│   ├── changes/           # Active and archived changes
│   └── project.md         # This file
├── .beads/                 # Beads issue tracker
│   ├── beads.db           # SQLite database
│   └── issues.jsonl       # JSONL format
└── .archive/               # Archived legacy system
```

## Key Documents

- **PRD:** `docs/requirements/PRD.md` - Product Requirements Document
- **Architecture:** `docs/architecture/` - System architecture
- **API Docs:** `docs/api_documentation.md` - API documentation
- **Deployment:** `docs/deployment_guide.md` - Deployment guide
- **Developer Guide:** `docs/developer_guide.md` - Developer guide
- **Constitution:** `.specify/constitution.md` - Technical standards

## Video Processing & Validation

### Client-Side Validation (React, before S3 upload)

**Requirements:**
- Max duration: 45s
- Max size: 50MB
- Motion check: motion variance must be above threshold
- No motion → reject with actionable feedback

**Implementation:**
```javascript
const validateVideo = async (videoBlob) => {
  const issues = [];
  if (videoBlob.duration > 45) issues.push('TOO_LONG');
  if (videoBlob.size > 50 * 1024 * 1024) issues.push('TOO_LARGE');
  const motionScore = await analyzeMotion(videoBlob);
  if (motionScore < 0.1) issues.push('NO_MOTION');
  return issues;
};
```

### Server-Side Processing (Lambda + MediaPipe)

**Pipeline:**
1. S3 upload → EventBridge → `test-engine` Lambda
2. Pre-process: crop/resize/normalize (45s max)
3. MediaPipe Pose/Face Mesh: ~450 frames × 33 keypoints
4. Apply quality gates (5 minimum checks)

**Quality Gates:**
- No keypoints: <10% frames with pose → `INVALID_NO_PERSON`
- Low confidence: avg confidence < 0.5 → `LOW_CONFIDENCE`
- No motion: variance keypoints < 0.05 → `NO_MOTION`
- Bad lighting: brightness < 30 OR > 250 → `BAD_LIGHTING`
- Wrong angle: shoulders/hips angle > 45° → `WRONG_ANGLE`

**Retry Logic:**
- SQS FIFO queue for retries
- Max 3 attempts per test per day
- Deduplication by userId + testId + attempt
- After max retries: optional questionnaire (generic guidance only, does NOT count as test completion)

## Abuse Protection (Video Submission)

### Rate Limiting (Multi-Tier Defense)

**Tier 1: API Gateway + WAF**
- Per user: 5 videos/hour (baseline)
- Per IP: 20 videos/hour → WAF block 1h
- Per test: 3 attempts/test → HTTP 400
- Global: 1000 videos/hour → API GW throttle

**Tier 2: Lambda Reserved Concurrency**
- `test-engine` Lambda: `reservedConcurrency = 10`
- Prevents compute exhaustion

**Tier 3: SQS FIFO + Circuit Breaker**
- Deduplication by userId + testId + attempt
- Max 3 messages/test enforcement
- Plan-aware daily quota enforcement
- Circuit breaker: if 429 rate > 5% OR cost spike > $10/hour → emergency throttle

**Tier 4: Automatic Ban**
- > perDayQuota(plan): Soft ban (24h)
- > 50/day: Hard ban (7 days)
- > 100/day: Permanent ban

**DynamoDB `userLimits` Table (Source of Truth):**
- `userId`, `plan`, `videoQuotaUsedDaily`, `videoQuotaDay`, `videoQuotaUsedHourly`, `banUntil`, `banReason`

## CI/CD Strategy

### CI/CD Credentials Configuration

FlowLogic uses a unified approach for managing AWS credentials across all environments:

- **OIDC (OpenID Connect):** Mandatory for all environments (dev, staging, production)
  - OIDC Identity Provider configured in AWS IAM
  - IAM roles: `flowlogic-ci-cd-dev`, `flowlogic-ci-cd-staging`, `flowlogic-ci-cd-production`
  - Trust policies restrict access to specific repository and environments
  - Permissions policies provide minimal necessary access
- **GitHub Environments:** For environment-specific secrets (dev/staging)
  - Environments: `dev`, `staging`, `production`
  - Required secrets: `AWS_ROLE_ARN` (for OIDC)
  - Optional secrets: `DATABASE_URL`, `API_KEY_PREFIX` (TIER 3)
  - Protection rules: Required reviewers for production
- **AWS Secrets Manager:** For production secrets (TIER 1/2)
  - TIER 1 (critical): Payment, database, encryption, authentication secrets
  - TIER 2 (sensitive): External APIs, service accounts, business-critical keys
  - Path structure: `/flowlogic/production/{category}/{secret-name}`
  - Production role has read-only access
- **Fallback Strategy:** Temporary fallback to Access Keys (14 days, with monitoring)
  - Available only if OIDC fails AND <14 days since first successful OIDC deployment
  - Automatic expiry after 14 days (workflow fails, forcing OIDC fix)
  - CloudWatch metrics and alarms for monitoring
  - SNS notifications for alerts
  - Weekly reports on fallback usage

**Quick Setup:**
1. OIDC Setup: See `docs/deployment/aws-oidc-setup.md`
2. GitHub Environments: Add `AWS_ROLE_ARN` to each environment
3. AWS Secrets Manager: Create TIER 1 secrets for production

**Documentation:**
- Quick Start: `docs/deployment/quick-start-aws-credentials.md`
- Full Setup: `docs/deployment/aws-credentials-setup.md`
- OIDC Setup: `docs/deployment/aws-oidc-setup.md`
- GitHub Environments: `docs/deployment/github-environments-setup.md`
- Secrets Classification: `docs/deployment/secrets-classification.md`
- Fallback Strategy: `docs/deployment/fallback-strategy.md`
- Migration Guide: `docs/deployment/migration-guide.md`
- Troubleshooting: `docs/deployment/troubleshooting-aws-credentials.md`
- Workflow Unification: `docs/deployment/workflow-unification-guide.md`
- New Environment Checklist: `docs/deployment/new-environment-checklist.md`
- Testing Plan: `docs/deployment/testing-plan.md`

**Validation:**
- Pre-deploy validation: `scripts/validate-aws-credentials.sh`
- Checks: AWS_ROLE_ARN, OIDC authentication, SSM access, Secrets Manager access, fallback expiry

**Monitoring:**
- CloudWatch metrics: `CICD/FallbackAccessKeysUsed`
- CloudWatch alarms: Alert on fallback usage
- CloudWatch Logs: `/aws/cicd/fallback-usage`
- SNS notifications: Email alerts
- Weekly reports: GitHub Issues on fallback usage

**Fallback Mechanism:**
A temporary fallback to Access Keys is available for 14 days after successful OIDC deployment, with CloudWatch monitoring and automatic expiry.

### Environment Strategy

| Environment | Branch | Auto-deploy | URL | Purpose |
|-------------|--------|-------------|-----|---------|
| Development | feature/* | ❌ | localhost:3000 | Local dev |
| Preview | PR | ✅ | pr-*.vercel.app | Code review |
| Staging | develop | ✅ | staging.flowlogic.app | QA |
| Production | main | ⚠️ Manual approval | flowlogic.app | Live users |

### CI/CD Pipeline Stages

1. **Validate:** Lint, type-check, unit tests, integration tests
2. **Security Scan:** Dependency vulnerabilities, SAST (CodeQL), secret scanning (TruffleHog), IaC scan
3. **Build:** Frontend + Backend artifacts
4. **Deploy Staging:** (if develop branch) → Vercel + Serverless → Smoke tests
5. **Deploy Production:** (if main branch, manual approval) → Vercel + Serverless → Migrations → Smoke tests → Rollback on failure

### Rollback Policy

**Automatic Rollback Triggers:**
- Smoke tests fail (timeout 5 min)
- Error rate > 5 errors in 5 minutes
- `/health` endpoint = unhealthy
- Sentry critical alerts

**Manual Rollback:**
```bash
vercel rollback
serverless deploy --stage production --package .serverless-{version}
```

## Database Migration Strategy

### Migration Framework

**Structure:**
```
packages/backend/migrations/
├── 001_create_users_table.js
├── 002_create_subscriptions_table.js
└── migrate.js
```

**Migration Template:**
- `up()` function: creates/updates table
- `down()` function: rollback
- `metadata`: version, description, author, createdAt

**Migration Runner:**
- DynamoDB `migrations` table tracks applied migrations
- Run in CI/CD after backend deploy, before smoke tests
- Guaranteed rollback: expand/contract pattern for breaking changes

## Anti-Abuse & Fraud Prevention

**CRITICAL:** Multi-layered defense system to prevent abuse and fraud.

### Threat Model

**Primary abuse vectors:**

| Vector | Risk | Impact |
|--------|------|--------|
| Multi-account creation | 🔴 High | Free tier abuse, cost inflation |
| Disposable email registration | 🔴 High | Untraceable accounts, spam |
| Device spoofing | 🟡 Medium | Multi-device abuse |
| Family sharing | 🟡 Medium | Revenue leakage |
| Credential sharing | 🟡 Medium | Account compromise |
| Bot registration | 🟡 Medium | Fake accounts, data pollution |

**Cost impact without protection:**
- 10% abuse rate × 1000 users = 100 abusers
- 100 abusers × 5 fake accounts = 500 fake accounts
- 500 accounts × 3 tests × $0.02 = **$30/month** waste
- Annual: **$360** + support overhead + reputation damage

### Defense Strategy (Multi-Layered)

**6-Layer Defense:**

1. **Layer 1: Device Fingerprinting (P0)** - Prevent multi-account abuse
2. **Layer 2: Email Validation (P0)** - Block disposable emails
3. **Layer 3: Phone Verification (P0 for Free, P1)** - Prevent multi-account for Free tier
4. **Layer 4: Payment Validation (P0)** - Paid tier as identity verification
5. **Layer 5: Behavioral Monitoring (P1)** - Detect post-registration abuse
6. **Layer 6: Rate Limiting** - All endpoints (already covered in Abuse Protection section)

**Expected effectiveness:**
- Combined reduction: **85-90%** of abuse attempts
- Residual abuse: **<2%** of user base
- Cost savings: **~$300/year** (at 1000 users)

### Layer 1: Device Fingerprinting

**Purpose:** Prevent multi-account abuse via device tracking.

**Implementation:**
- Frontend: FingerprintJS library (`@fingerprintjs/fingerprintjs`)
- Backend: DynamoDB `devices` table tracking device IDs
- Rule: 1 trial test per device per 30 days
- Accuracy: ~99.5% device identification
- Persistent: across sessions, resistant to incognito

**DynamoDB Schema:**
- Table: `flowlogic-{stage}-devices`
- Key: `device_id` (HASH)
- GSI: `user-index` on `user_id`
- Fields: `device_id`, `last_trial_at`, `trial_count`, `user_id`, `created_at`

**UX when device blocked:**
- Show message: "Trial Already Used"
- Prompt: "Create an account to continue"
- Link to registration/login

### Layer 2: Email Validation

**Purpose:** Block disposable/temporary email addresses.

**Implementation:**
- Blocklist: 500+ known disposable email domains
- Source: `packages/backend/data/blocked-email-domains.json`
- Client-side validation: Immediate feedback on registration form
- Server-side validation: Mandatory check before account creation
- Unknown domains: Allow but flag for review

**Blocked domains (examples):**
- tempmail.com, 10minutemail.com, guerrillamail.com
- mailinator.com, throwaway.email, maildrop.cc
- Full list: 500+ domains

**Advanced validation (optional, P1):**
- External API: Abstract API, EmailListVerify
- Check: disposable status, deliverability, quality score

### Layer 3: Phone Verification

**Purpose:** Prevent multi-account creation for Free tier.

**When required:**
- **Free tier:** MANDATORY before 2nd test
- **Paid tier:** OPTIONAL (payment method is sufficient)

**Implementation:**
- AWS SNS for SMS delivery
- 6-digit verification code
- Code expiration: 10 minutes
- Phone uniqueness: One phone per account
- DynamoDB table: `flowlogic-{stage}-phones`

**Cost:**
- AWS SNS SMS: ~$0.00645 per message (US)
- Free tier verification: $0.00645 per user
- 1000 Free users/month: **~$6.45/month**

**UX Flow:**
1. Enter phone number
2. Receive SMS with 6-digit code
3. Enter code to verify
4. Continue with assessment

### Layer 4: Payment Validation

**Purpose:** Paid tier serves as strong identity verification.

**Implementation:**
- Stripe payment method validation
- $0.01 authorization hold (not charged)
- Stripe Radar: Automatic fraud detection
- 3D Secure: Required for risky transactions
- Payment method = identity proof

**Fraud detection:**
- Stripe Radar flags suspicious cards
- Decline high-risk payments
- Require 3D Secure for risky transactions

### Layer 5: Behavioral Monitoring

**Purpose:** Detect post-registration abuse patterns.

**Signals tracked:**

| Signal | Threshold | Action |
|--------|-----------|--------|
| Accounts from same IP | >5 in 24h | Flag + review |
| Accounts from same device | >2 | Flag + review |
| Zero activity after registration | 7 days | Flag as dormant |
| Tests completed, never logged in again | 1 login only | Flag as one-time use |
| Rapid test completion | All 3 in <10 min | Flag as bot |
| Multiple failed payment attempts | >3 | Block new attempts |

**Implementation:**
- DynamoDB table: `flowlogic-{stage}-abuse-flags`
- Real-time detection: After registration, tests, login
- Auto-action: Suspend account if 2+ flags or critical flag
- Admin notification: Slack/email alert
- Admin dashboard: Review flagged accounts

**Abuse detection checks:**
1. Multiple accounts from same device (>2)
2. Multiple accounts from same IP (>5 in 24h)
3. Rapid registration pattern (>3 accounts from IP in 1h)
4. One-time use pattern (7+ days, 1 login, tests completed)
5. Bot-like behavior (all 3 tests in <10 minutes)

**Actions:**
- Flag account for review
- Notify admin via Slack
- Auto-suspend for critical flags
- Admin dashboard for manual review

## Security Requirements

### Security Scanning (CI/CD)

**Automated Scans:**
- SAST: CodeQL (JavaScript/TypeScript)
- Dependency vulnerabilities: npm audit
- Secret scanning: TruffleHog + Gitleaks
- IaC security: tfsec + checkov
- Container security: Trivy (if using Docker)

### Security Hardening Checklist

**Application Security:**
- Authentication: AWS Cognito, JWT access token TTL 15 min, refresh token in httpOnly cookie
- Authorization: Tier-gating enforcement on backend, IAM least privilege
- Data protection: KMS encryption for PII at rest, TLS 1.3 in transit, no PII in logs (masking)
- Input validation: Schema validation (Zod), rate limiting

**Secrets Management:**
- No secrets in repo
- GitHub Secrets for CI/CD
- AWS Secrets Manager for runtime

### Security Response Plan

- Phase 1: Detection (0-15 min)
- Phase 2: Assessment (15-30 min)
- Phase 3: Containment (30-60 min)
- Phase 4: Eradication (1-4 h)
- Phase 5: Recovery (4-24 h)
- Phase 6: Post-Mortem (1-3 d)

## Monitoring & Alerting

### CloudWatch Alarms

**Critical (P0):**
- Lambda critical errors: > 10/min
- API Gateway 5xx errors: > 20 in 5 min
- DynamoDB throttling: > 5 in 5 min
- Payment failures: > 5 in 5 min

**High Priority (P1):**
- API P95 latency: > 1s
- CloudFront cache hit rate: < 80%

### Custom Metrics

**Business Metrics (CloudWatch):**
- UserRegistration
- TestCompleted
- PaymentSuccess
- PlanGenerated

### Alerting Channels

- SNS Topics: slack_critical, slack_high, slack_medium
- Slack integration via Lambda (SNS → Lambda → Slack webhook)

## Environment Variables Management

### Environment Variables Structure

**Required Variables:**
- AWS_REGION, STAGE
- COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID
- DYNAMODB_*_TABLE (8 tables)
- S3_VIDEOS_BUCKET
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- SENTRY_DSN (optional)
- API_BASE_URL

**Secrets Management:**
- GitHub Secrets: deploy keys/tokens
- AWS Secrets Manager: runtime secrets (cached)

### Environment-Specific Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| LOG_LEVEL | debug | info | error |
| CACHE_TTL | 60s | 300s | 3600s |
| RATE_LIMIT | 1000/min | 100/min | 50/min |

## Local Development Setup

### Docker Compose Environment

**Services:**
- DynamoDB Local (port 8000)
- DynamoDB Admin (port 8001)
- LocalStack (S3, SQS, Lambda, Secrets Manager, EventBridge)

### Development Scripts

```json
{
  "dev": "concurrently \"npm:dev:*\"",
  "dev:services": "docker-compose up -d",
  "dev:frontend": "cd packages/frontend && vite",
  "dev:backend": "cd packages/backend && serverless offline --stage local",
  "setup:local": "node scripts/setup-local-tables.js",
  "seed:local": "node scripts/seed-local-data.js"
}
```

## KPIs & Business Metrics

### Key Performance Indicators

- **Activation Rate:** > 65% (users who complete onboarding + at least 1 test)
- **Test Completion Rate:** > 75% (started tests that are successfully completed)
- **Time to Results:** Immediately after test completion
- **Deploy Time:** < 4 minutes
- **Rollback Time:** < 1 minute

### Cost Optimization Targets

- MVP (0-100 users): ≤ $50/month
- Early Stage (100-1000 users): ≤ $100/month
- Growth (1000-5000 users): ≤ $320/month

## Legal & Compliance

- **Wellness Disclaimer:** Mandatory consent (not a medical product)
- **GDPR/CCPA:** Delete/export user data
- **Accessibility:** WCAG 2.1 AA (target)
- **COPPA:** 18+ (MVP)

## Notes for AI Assistants

1. **Always check PRD first** - `docs/requirements/PRD.md` is the source of truth
2. **Follow Spec-Driven workflow** - Use OpenSpec for all new features
3. **Use Beads for task tracking** - `bd ready` to find work, `bd start` to begin
4. **Respect tier constraints:**
   - **Free Tier (Legacy/MVP):** 3 baseline tests only, no exercises/plans
   - **Activity-Based Tier System (Premium):**
     - Week 1-2: All users get baseline plan
     - Week 3: Tier assigned based on completion rate (30-50% = Casual, 60-80% = Committed, 80%+ = Dedicated)
     - Plan complexity adapts to tier (1 exercise/day for Casual, 2-3 for Committed, 3-4 for Dedicated)
     - Test schedule adapts to tier (4/7/11 tests over 2 months)
5. **MediaPipe-only scoring** - All tests must use MediaPipe, no fallback scoring
6. **Quality gates mandatory** - Tests must pass quality gates to be completed
7. **Security first** - Always validate authentication, authorization, and tier access
8. **Test coverage** - Maintain minimum 80% coverage for critical paths
9. **Video validation** - Client-side validation before upload, server-side quality gates
10. **Abuse protection** - Enforce rate limits and quotas at multiple tiers
11. **Activity-Based Tier System** - CRITICAL:
    - Users do NOT choose tier upfront
    - Tier assigned at Week 3 based on completion rate
    - Plan complexity adapts to activity level
    - Test schedule adapts to tier (4/7/11 tests)
    - Tier transitions possible based on activity changes
12. **Anti-Abuse System** - CRITICAL:
    - Device fingerprinting: 1 trial per device per 30 days (FingerprintJS)
    - Email validation: Block disposable emails (500+ domains blocklist)
    - Phone verification: Mandatory for Free tier before 2nd test (AWS SNS)
    - Payment validation: Stripe Radar for fraud detection (Paid tier)
    - Behavioral monitoring: Detect multi-account, bot patterns (real-time)
    - Rate limiting: Enforce at all layers (API Gateway, Lambda, SQS)
    - Admin dashboard: Review flagged accounts
    - Expected reduction: 85-90% of abuse attempts
13. **MVP UX Rules** - CRITICAL:
    - 1 screen = 1 user decision (no lists, no dashboards)
    - 5-screen flow: Welcome → Expectation → Assessment → Results/Action → Calendar
    - First test: Overhead Squat (teach recording, not measure)
    - Never show total test count during assessment
    - Quality gate failures: One helpful suggestion, not error codes
    - Results screen: NO scores/charts/reports, only "what matters" + today's plan
    - Calendar only shown after first action (user started exercises)
    - MVP tiers: Free (3), Basic (3), Pro (7) - NO Pro+ in MVP
    - Remove from MVP: 15 tests, share cards, auto-adaptation, large reports
    - Keep in MVP: Quality gates, retry UX, today plan, calendar, P1/P2 (hidden)
14. **Documentation** - Update docs when adding features

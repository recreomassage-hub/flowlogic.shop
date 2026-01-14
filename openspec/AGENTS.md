OpenSpec Unified Workflow Guide
Version: 2.0
Date: 2025-01-10
For: AI assistants and development teams

🎯 TL;DR: The Complete Loop
┌─────────────────────────────────────────────────────────────┐
│ 1. INTENT (OpenSpec)  → Create spec, wait for "Go!"        │
│ 2. PLAN (Beads)       → Auto-generate task graph           │
│ 3. EXECUTE (Code)     → Work only on `bd ready` tasks      │
│ 4. VALIDATE (Checks)  → Verify spec ↔ code alignment       │
│ 5. ARCHIVE (Clean up) → Move to archive, update main specs │
└─────────────────────────────────────────────────────────────┘
Critical Rule: 🚫 NO CODE before explicit "Go!" approval

📋 Quick Decision Tree
New request received?
├─ Bug fix (restores intended behavior)? → Fix directly, no spec
├─ Typo/format/comment? → Fix directly, no spec
├─ Config/dependency update (non-breaking)? → Fix directly, no spec
├─ New feature/capability? → CREATE PROPOSAL
├─ Breaking change? → CREATE PROPOSAL
├─ Architecture change? → CREATE PROPOSAL
├─ Unclear? → Ask 2 clarifying questions, then CREATE PROPOSAL

STAGE 1: Intent Formation (OpenSpec)
1.1. When to Create Proposals
Create proposal for:

✅ New features or functionality
✅ Breaking changes (API, schema, behavior)
✅ Architecture or pattern changes
✅ Performance optimization (changes behavior)
✅ Security enhancements

Skip proposal for:

❌ Bug fixes (restore intended behavior)
❌ Typos, formatting, comments
❌ Dependency updates (non-breaking)
❌ Configuration changes
❌ Tests for existing behavior


1.2. Pre-Work Checklist
Before creating any spec:
bash# 1. Understand current state
openspec list                    # Active changes
openspec list --specs            # Existing capabilities
openspec show <spec-id>          # Review specific spec

# 2. Search for existing work
openspec spec list --long        # All specs with details
rg -n "Requirement:|Scenario:" openspec/specs  # Full-text search

# 3. Check for conflicts
openspec list                    # Pending changes
rg -n "^#|Requirement:" openspec/changes  # Changes in progress

# 4. Read project conventions
cat openspec/project.md
Key questions:

 Does this capability already exist?
 Are there pending changes that conflict?
 Should I modify existing spec vs create new?
 Do I need 2 clarifying questions before starting?


1.3. Creating the Proposal
Step 1: Choose Change ID
Format: <verb>-<noun>-<noun> (kebab-case)
Examples:

✅ add-two-factor-auth
✅ update-payment-flow
✅ remove-legacy-api
✅ refactor-video-processing

Prefixes:

add- — new functionality
update- — modify existing
remove- — deprecate/delete
refactor- — restructure without behavior change
fix- — bug fix (if complex enough for proposal)

Uniqueness: Check openspec list, append -2, -3 if needed.

Step 2: Scaffold Structure
bashCHANGE_ID="add-anti-abuse"

mkdir -p openspec/changes/$CHANGE_ID/specs
```

**Directory structure:**
```
openspec/changes/add-anti-abuse/
├── proposal.md      # Why, what, impact (REQUIRED)
├── tasks.md         # Implementation checklist (REQUIRED)
├── design.md        # Technical decisions (OPTIONAL)
└── specs/           # Delta changes (REQUIRED)
    ├── auth/
    │   └── spec.md
    └── monitoring/
        └── spec.md

Step 3: Write proposal.md
Template:
markdown# Change: [Brief one-line description]

## Why

[1-2 sentences explaining the problem or opportunity]

**Problem:** Users can create unlimited free accounts via disposable emails.

**Opportunity:** Reduce abuse by 85% while maintaining good UX.

## What Changes

- [Bullet list of specific changes]
- [Mark breaking changes with **BREAKING**]

**Additions:**
- Device fingerprinting (1 trial per device)
- Disposable email blocking (500+ domain blocklist)
- Phone verification (Free tier only)
- Rate limiting (3 registrations per IP per 24h)

**BREAKING:**
- Free tier now requires phone verification before 2nd test

## Impact

**Affected specs:**
- `auth` — ADDED phone verification requirements
- `monitoring` — ADDED abuse detection metrics

**Affected code:**
- `packages/backend/src/handlers/auth-register.js`
- `packages/backend/src/middleware/deviceFingerprint.js`
- `packages/frontend/src/components/PhoneVerification.jsx`

**Migration:**
- Existing Free users: grandfather them (no phone required)
- New Free users: phone required after trial test

**Risks:**
- Increased onboarding friction (mitigated by trial test)
- SMS costs (~$6/month for 1000 Free users)

## Open Questions

- [ ] Do we need email verification API or blocklist sufficient?
- [ ] Should phone verification be SMS or app-based (Authy)?

Step 4: Write tasks.md
Format: Grouped checklist with clear dependencies.
Template:
markdown# Implementation Tasks

## 1. Infrastructure & Setup
- [ ] 1.1 Create DynamoDB `devices` table
- [ ] 1.2 Create DynamoDB `phones` table
- [ ] 1.3 Set up SNS for SMS sending
- [ ] 1.4 Add FingerprintJS dependency

## 2. Backend Implementation
- [ ] 2.1 Implement device fingerprinting service
- [ ] 2.2 Implement email domain validation
- [ ] 2.3 Implement phone verification flow
- [ ] 2.4 Add rate limiting middleware
- [ ] 2.5 Create abuse detection service

## 3. Frontend Implementation
- [ ] 3.1 Add device fingerprinting on trial page
- [ ] 3.2 Add email validation feedback
- [ ] 3.3 Create PhoneVerification component
- [ ] 3.4 Handle rate limit errors (429)

## 4. Testing
- [ ] 4.1 Unit tests: device fingerprinting
- [ ] 4.2 Unit tests: email validation
- [ ] 4.3 Integration tests: phone verification flow
- [ ] 4.4 E2E test: complete abuse prevention flow

## 5. Monitoring & Documentation
- [ ] 5.1 Add CloudWatch metrics (abuse events)
- [ ] 5.2 Create abuse detection dashboard
- [ ] 5.3 Update API documentation
- [ ] 5.4 Update privacy policy (device data collection)

## 6. Deployment
- [ ] 6.1 Database migrations (staging)
- [ ] 6.2 Deploy to staging
- [ ] 6.3 Verify in staging
- [ ] 6.4 Deploy to production
- [ ] 6.5 Monitor abuse metrics for 48h

## Dependencies
```
1.x (Infra) → blocks 2.x (Backend)
2.x (Backend) → blocks 3.x (Frontend)
{2.x, 3.x} → blocks 4.x (Testing)
4.x (Testing) → blocks 5.x, 6.x (Deploy)
```
Key principles:

Each task is atomic (1 PR or less)
Dependencies are explicit
Includes verification steps
Has rollback plan (implicit in staging)


Step 5: Write design.md (if needed)
When to create design.md:

✅ Cross-cutting change (multiple services/modules)
✅ New architectural pattern
✅ New external dependency
✅ Significant data model changes
✅ Security/performance/migration complexity
✅ Ambiguity requiring upfront decisions

When to skip:

❌ Simple CRUD endpoint
❌ UI-only component
❌ Straightforward bug fix
❌ Change is self-explanatory from spec

Template:
markdown# Design: [Feature Name]

## Context

**Background:**
- Current system has no abuse prevention
- 10% abuse rate observed in analytics
- Estimated cost: $360/year in wasted resources

**Constraints:**
- Must not block legitimate users
- SMS budget: <$10/month for MVP
- No additional infra (use existing AWS services)

**Stakeholders:**
- PM: wants <2% false positive rate
- Security: wants comprehensive logging
- Finance: wants cost control

## Goals / Non-Goals

**Goals:**
- Reduce abuse by 85%
- Maintain activation rate >65%
- Keep SMS costs <$10/month

**Non-Goals:**
- Perfect abuse prevention (100%)
- Real-time fraud scoring (MVP)
- Machine learning detection (v2)

## Technical Decisions

### Decision 1: Device Fingerprinting

**Choice:** FingerprintJS (client-side)

**Alternatives considered:**
- Canvas fingerprinting (custom) — too brittle
- IP-based only — VPNs bypass easily
- No fingerprinting — insufficient protection

**Rationale:**
- 99.5% accuracy
- Works across incognito
- Free tier sufficient for MVP
- Minimal privacy concerns (hashed)

### Decision 2: Phone Verification

**Choice:** AWS SNS (SMS)

**Alternatives considered:**
- Twilio — more expensive ($0.0075 vs $0.00645)
- Email verification — insufficient (disposable emails)
- CAPTCHA only — bots bypass
- No verification — abuse continues

**Rationale:**
- Integrated with AWS (no new vendor)
- Cheapest option
- High deliverability
- Required only for Free tier (cost control)

### Decision 3: Email Blocklist vs API

**Choice:** Blocklist (500+ domains)

**Alternatives:**
- Abstract API ($9/month for 250 checks) — too expensive for MVP
- No blocking — insufficient

**Rationale:**
- Zero cost
- Covers 95% of disposable domains
- Can add API later if needed

## Data Model

### New Tables

**`devices` (DynamoDB):**
```
PK: device_id (S)
Attributes:
  - last_trial_at (S, ISO timestamp)
  - trial_count (N)
  - user_id (S, optional)
  - created_at (S)

GSI: user-index (user_id)
```

**`phones` (DynamoDB):**
```
PK: user_id (S)
Attributes:
  - phone_number (S)
  - code (S)
  - verified (BOOL)
  - expires_at (S)
  - verified_at (S, optional)

GSI: phone-index (phone_number)
```

## Architecture
```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Get fingerprint
       ▼
┌─────────────────┐
│ FingerprintJS   │
│   (client-side) │
└──────┬──────────┘
       │ 2. deviceId
       ▼
┌─────────────────┐         ┌──────────────┐
│  API Gateway    │────────▶│  DynamoDB    │
│  + Rate Limit   │         │  (devices)   │
└──────┬──────────┘         └──────────────┘
       │ 3. Check eligibility
       ▼
┌─────────────────┐
│ Lambda:         │
│ auth-register   │
└──────┬──────────┘
       │ 4. Validate email
       ▼
┌─────────────────┐
│ Email Blocklist │
│ (in-memory)     │
└──────┬──────────┘
       │ 5. Send SMS (if Free)
       ▼
┌─────────────────┐         ┌──────────────┐
│   AWS SNS       │────────▶│  DynamoDB    │
│                 │         │  (phones)    │
└─────────────────┘         └──────────────┘
```

## Security Considerations

**Threats mitigated:**
- Multi-account abuse → device fingerprint + phone
- Disposable emails → blocklist
- Automated attacks → rate limiting
- Payment fraud → Stripe Radar (existing)

**Privacy:**
- Device fingerprint: hashed, no PII
- Phone numbers: encrypted at rest (KMS)
- Retention: deleted after 90 days if unverified

**Compliance:**
- GDPR: right to erasure supported
- CCPA: opt-out in privacy policy
- Disclosure: privacy policy updated

## Performance

**Targets:**
- Device check: <100ms (DynamoDB get)
- Email validation: <10ms (in-memory lookup)
- Phone verification: <3s (SMS send)

**Load estimates:**
- 1000 users/month = ~1000 device checks
- DynamoDB: well within free tier
- SNS: ~300 SMS/month (30% Free tier) = $1.94/month

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| False positives (legitimate users blocked) | Medium | High | Trial test without registration, clear error messages |
| SMS deliverability issues | Low | Medium | Retry logic, alternative verification (email) in v2 |
| Cost overrun (SMS) | Low | Low | Monitor daily, cap at 1000 SMS/month |
| Privacy concerns (fingerprinting) | Low | Medium | Clear disclosure, GDPR compliance |

**Trade-offs:**
- ✅ UX friction (+phone verification) → ❌ Lower activation rate
- ✅ Cost control (blocklist) → ❌ 5% disposable emails slip through
- ✅ Simple architecture → ❌ Can't detect sophisticated abuse (ML)

## Migration Plan

### Phase 1: Soft Launch (Week 1)
```
1. Deploy infrastructure (DynamoDB tables, SNS)
2. Deploy backend (no enforcement yet)
3. Log abuse events, don't block
4. Verify metrics in CloudWatch
```

### Phase 2: Gradual Rollout (Week 2)
```
1. Enable device fingerprinting (trial only)
2. Enable email blocklist (registration)
3. Monitor false positive rate
4. Adjust thresholds if needed
```

### Phase 3: Full Enforcement (Week 3)
```
1. Enable phone verification (Free tier)
2. Enable rate limiting
3. Monitor activation rate
4. Grandfather existing Free users (no phone required)
```

### Rollback Plan
```
If activation rate drops >10%:
1. Disable phone verification (keep device fingerprint)
2. Investigate user feedback
3. Iterate on UX
```

## Open Questions

- [ ] **Q:** Should we use Authy/Google Authenticator instead of SMS?
  - **A (pending):** Research cost/UX trade-off
  
- [ ] **Q:** What's acceptable false positive rate?
  - **A (pending):** PM to provide target (<2%?)

- [ ] **Q:** Do we need CAPTCHA in addition to phone verification?
  - **A (pending):** Start without, add if bots persist

## Appendix: Cost Breakdown

**Monthly costs (1000 users, 30% Free tier):**
```
SMS (300 Free users): 300 × $0.00645 = $1.94
DynamoDB (devices): free tier
DynamoDB (phones): free tier
FingerprintJS: free tier
Total: ~$2/month
```

**Annual savings from abuse reduction:**
```
Without: $360/year
With: $360 × 0.15 = $54/year
Savings: $306/year
ROI: $306 - ($2 × 12) = $282/year
```

Step 6: Write Spec Deltas
Critical rules:

Use #### Scenario: format (4 hashtags)
Every requirement MUST have ≥1 scenario
Scenarios use **WHEN** / **THEN** format
Delta headers: ## ADDED|MODIFIED|REMOVED|RENAMED Requirements

Example: specs/auth/spec.md
markdown## ADDED Requirements

### Requirement: Device Fingerprinting

The system SHALL track device fingerprints to prevent multi-account abuse.

**Rationale:** Prevent users from creating multiple free accounts from the same device.

#### Scenario: First trial from device

- **GIVEN** user has never tried the product on this device
- **WHEN** user completes trial test
- **THEN** device fingerprint is recorded
- **AND** trial is allowed

#### Scenario: Second trial from same device

- **GIVEN** device fingerprint exists in database
- **WHEN** user attempts another trial (different email)
- **THEN** system returns error "Trial already used on this device"
- **AND** user is prompted to create account

#### Scenario: Trial expired (30 days)

- **GIVEN** device fingerprint exists but >30 days old
- **WHEN** user attempts trial
- **THEN** trial is allowed
- **AND** fingerprint timestamp is updated

---

### Requirement: Disposable Email Blocking

The system SHALL reject registration attempts using disposable email domains.

**Rationale:** Prevent abuse via temporary email services.

#### Scenario: Disposable email detected

- **GIVEN** user attempts registration
- **WHEN** email domain is in blocklist (e.g., `tempmail.com`)
- **THEN** system returns error "Temporary emails not allowed"
- **AND** registration is blocked

#### Scenario: Trusted email domain

- **GIVEN** user attempts registration
- **WHEN** email domain is trusted (e.g., `gmail.com`)
- **THEN** registration proceeds
- **AND** no additional validation

#### Scenario: Unknown email domain

- **GIVEN** user attempts registration
- **WHEN** email domain is unknown (not in blocklist or trusted list)
- **THEN** registration proceeds
- **AND** account is flagged for review

---

### Requirement: Phone Verification (Free Tier)

The system SHALL require phone verification for Free tier users before 2nd test.

**Rationale:** Prevent multi-account creation while minimizing friction.

#### Scenario: Phone verification required

- **GIVEN** Free tier user completed trial test
- **WHEN** user attempts 2nd test
- **THEN** system prompts for phone number
- **AND** sends 6-digit SMS code

#### Scenario: Phone already used

- **GIVEN** phone number is already verified by another account
- **WHEN** user attempts to verify same phone
- **THEN** system returns error "Phone already in use"
- **AND** verification fails

#### Scenario: SMS code validation

- **GIVEN** user received SMS code
- **WHEN** user enters correct code within 10 minutes
- **THEN** phone is marked verified
- **AND** user can proceed to 2nd test

#### Scenario: SMS code expired

- **GIVEN** user received SMS code 11 minutes ago
- **WHEN** user enters code
- **THEN** system returns error "Code expired"
- **AND** user must request new code

#### Scenario: Paid tier bypass

- **GIVEN** user selects Paid tier
- **WHEN** user registers
- **THEN** phone verification is skipped
- **AND** payment validation is sufficient

---

### Requirement: Rate Limiting

The system SHALL enforce rate limits to prevent automated attacks.

**Rationale:** Block bot attacks and rapid account creation.

#### Scenario: Registration rate limit

- **GIVEN** 3 accounts registered from IP in last 24h
- **WHEN** 4th registration attempt from same IP
- **THEN** system returns HTTP 429
- **AND** error message "Too many registrations, try tomorrow"

#### Scenario: Video upload rate limit (unauthenticated)

- **GIVEN** user uploaded 1 video from IP in last hour (no account)
- **WHEN** user attempts 2nd upload
- **THEN** system returns HTTP 429
- **AND** error message "Create account to upload more"

#### Scenario: Video upload rate limit (authenticated)

- **GIVEN** user uploaded 5 videos in last hour
- **WHEN** user attempts 6th upload
- **THEN** system returns HTTP 429
- **AND** error message "Upload limit reached, wait 1 hour"

## MODIFIED Requirements

### Requirement: User Registration

The system SHALL register users with email and password validation, **and** SHALL enforce anti-abuse checks.

**Changes:** Added device fingerprinting, email validation, and rate limiting to existing registration flow.

#### Scenario: Successful registration (existing)

- **GIVEN** valid email and password
- **WHEN** user submits registration
- **THEN** account is created
- **AND** confirmation email sent

#### Scenario: Registration with abuse checks (new)

- **GIVEN** valid email and password
- **WHEN** user submits registration
- **THEN** system checks device fingerprint (not used for trial >30 days)
- **AND** validates email domain (not disposable)
- **AND** checks rate limit (<3 from IP in 24h)
- **AND** only then creates account

#### Scenario: Registration blocked by abuse check (new)

- **GIVEN** user's IP exceeded rate limit
- **WHEN** user attempts registration
- **THEN** system returns HTTP 429
- **AND** account is NOT created
- **AND** user sees clear error message

## REMOVED Requirements

_None for this change._

## RENAMED Requirements

_None for this change._

1.4. Validation & Approval
Step 1: Validate Spec
bash# Strict validation (catches all errors)
openspec validate add-anti-abuse --strict

# Check delta parsing
openspec show add-anti-abuse --json --deltas-only | jq '.deltas'

# Verify scenarios parsed correctly
openspec show add-anti-abuse --json | jq '.deltas[].requirements[].scenarios'
Common errors:

"Change must have at least one delta" → missing specs/ directory
"Requirement must have at least one scenario" → missing ####Scenario:
"Invalid scenario format" → not using **WHEN** / **THEN**


Step 2: Request Approval
Present to stakeholders:
markdown## Approval Request: add-anti-abuse

**Summary:** Add device fingerprinting, email validation, phone verification, and rate limiting to reduce abuse by 85%.

**Files to review:**
- `openspec/changes/add-anti-abuse/proposal.md` — Why and what
- `openspec/changes/add-anti-abuse/tasks.md` — Implementation plan
- `openspec/changes/add-anti-abuse/design.md` — Technical decisions
- `openspec/changes/add-anti-abuse/specs/auth/spec.md` — Requirements

**Key decisions:**
1. Phone verification required for Free tier (not Paid)
2. Email blocklist (500+ domains) vs API ($0 vs $9/month)
3. Device fingerprinting via FingerprintJS (free tier)

**Risks:**
- Increased onboarding friction (mitigated by trial-first flow)
- SMS costs ~$2/month (acceptable)

**Next steps:**
- [ ] PM approves approach
- [ ] Security reviews privacy/compliance
- [ ] Finance approves budget
- [ ] **Say "Go!" to proceed with implementation**
```

---

### Step 3: Approval Gate

**🚨 CRITICAL: DO NOT START IMPLEMENTATION UNTIL "Go!"**
```
❌ BAD:
AI: "I created the spec. Starting implementation..."
   (writes code without approval)

✅ GOOD:
AI: "I created the spec. Please review and say 'Go!' to proceed."
PM: "Looks good, Go!"
AI: "Generating task graph..."
Why this matters:

Prevents wasted work on wrong approach
Ensures stakeholder alignment
Allows iteration on spec (cheap) before code (expensive)


STAGE 2: Plan Transformation (Beads)
2.1. Generate Task Graph
Trigger: After explicit "Go!" approval.
Command:
bash/openspec-to-beads add-anti-abuse
What it does:

Reads spec files:

proposal.md → epic description
tasks.md → task list
design.md → technical context


Creates Beads epic:

bash   bd create "Anti-abuse System" \
     --type epic \
     --priority 0 \
     --description "See openspec/changes/add-anti-abuse/ for full spec. Implements device fingerprinting, email validation, phone verification, and rate limiting to reduce abuse by 85%."

Creates tasks from tasks.md:

bash   # From tasks.md section "1. Infrastructure"
   bd create "Create DynamoDB devices table" \
     --type task \
     --parent <epic-id> \
     --priority 1 \
     --description "Create table for device fingerprint tracking. Schema: device_id (PK), last_trial_at, trial_count, user_id. GSI on user_id."
   
   bd create "Create DynamoDB phones table" \
     --type task \
     --parent <epic-id> \
     --priority 1 \
     --description "Create table for phone verification. Schema: user_id (PK), phone_number, code, verified, expires_at. GSI on phone_number to check uniqueness."
   
   # ... for each task in tasks.md

Sets dependencies:

bash   # Infra blocks backend
   bd dep add <backend-task-1> <infra-task-1>
   bd dep add <backend-task-1> <infra-task-2>
   
   # Backend blocks frontend
   bd dep add <frontend-task-1> <backend-task-1>
   bd dep add <frontend-task-1> <backend-task-2>
   
   # Implementation blocks testing
   bd dep add <test-task-1> <backend-task-1>
   bd dep add <test-task-1> <frontend-task-1>

Shows ready tasks:

bash   bd ready
   
   # Output:
   Ready to work on:
   - task-123: Create DynamoDB devices table
   - task-124: Create DynamoDB phones table
```

---

## 2.2. Task Graph Structure

**Example graph:**
```
Epic: Anti-abuse System (epic-42)
│
├─ 1. Infra
│  ├─ task-123: Create devices table (READY)
│  ├─ task-124: Create phones table (READY)
│  └─ task-125: Set up SNS (READY)
│
├─ 2. Backend (BLOCKED by 1.x)
│  ├─ task-126: Device fingerprinting service
│  ├─ task-127: Email validation service
│  ├─ task-128: Phone verification flow
│  ├─ task-129: Rate limiting middleware
│  └─ task-130: Abuse detection service
│
├─ 3. Frontend (BLOCKED by 2.x)
│  ├─ task-131: Device fingerprint client
│  ├─ task-132: Email validation feedback
│  ├─ task-133: PhoneVerification component
│  └─ task-134: Rate limit error handling
│
├─ 4. Testing (BLOCKED by 2.x, 3.x)
│  ├─ task-135: Unit tests (device fingerprint)
│  ├─ task-136: Unit tests (email validation)
│  ├─ task-137: Integration tests (phone flow)
│  └─ task-138: E2E test (full abuse flow)
│
└─ 5. Deploy (BLOCKED by 4.x)
   ├─ task-139: Deploy to staging
   ├─ task-140: Verify in staging
   └─ task-141: Deploy to production

STAGE 3: Execution (Code)
3.1. Work Loop
Rule: Only work on tasks from bd ready.
bash# Check what's ready
bd ready

# Output:
Ready to work on:
- task-123: Create DynamoDB devices table

# Get task context
bd show task-123

# Output:
Task: Create DynamoDB devices table
Epic: Anti-abuse System
Description: Create table for device fingerprint tracking...
Spec: openspec/changes/add-anti-abuse/specs/auth/spec.md
Files: packages/backend/migrations/005_create_devices_table.js

# Implement
# ... write code ...

# Mark complete
bd close task-123

# Check next ready task
bd ready

# Output:
Ready to work on:
- task-124: Create DynamoDB phones table
- task-125: Set up SNS

3.2. Implementation Guidelines
For each task:

Read task description → understand what/why
Read relevant spec → understand requirements
Read design.md → understand technical decisions
Implement code → follow spec exactly
Write tests → cover scenarios from spec
Update checklist → mark - [x] in tasks.md
Close task → bd close <task-id>

Code quality gates:
bash# Before closing task
npm run lint        # No lint errors
npm run test        # All tests pass
npm run build       # Builds successfully
git status          # No uncommitted changes

3.3. Staying Aligned
Mental checklist:

 Am I working on a bd ready task?
 Does my code match the spec requirement?
 Did I cover all scenarios in tests?
 Did I update tasks.md checklist?

If stuck:

Check bd show <task-id> for context
Re-read spec requirement
Re-read design decision
Ask clarifying question (don't guess)


STAGE 4: Validation & Archiving
4.1. Apply Changes
When all tasks complete:
bash# Verify all tasks closed
bd list --epic epic-42 --status closed

# Apply changes (verify code matches spec)
/openspec-apply add-anti-abuse
```

**What `/openspec-apply` does:**

1. **Reads spec deltas:**
   - `specs/auth/spec.md` → ADDED requirements

2. **Searches codebase:**
   - Finds files mentioned in spec
   - Verifies implementation exists

3. **Checks scenarios:**
   - Each scenario → has corresponding test?
   - Test covers WHEN/THEN conditions?

4. **Reports mismatches:**
```
   ✅ Requirement "Device Fingerprinting" implemented
   ✅ Scenario "First trial from device" covered in test
   ✅ Scenario "Second trial from same device" covered in test
   ❌ Scenario "Trial expired (30 days)" NOT covered in test
   
   Files checked:
   - packages/backend/src/services/deviceFingerprint.js
   - packages/backend/tests/deviceFingerprint.test.js

Blocks archiving if mismatches found


4.2. Final Quality Gates
Before archiving:
bash# 1. All tests pass
npm run test

# 2. No lint errors
npm run lint

# 3. Build succeeds
npm run build

# 4. Spec validation
openspec validate add-anti-abuse --strict

# 5. Code coverage (optional)
npm run test:coverage
# TargetContinue2:26 PM: >80% for new code
6. Manual verification
- Deploy to staging
- Test key scenarios manually
- Check monitoring dashboards

---

## 4.3. Archive Change

**After all gates pass:**
```bash
# Archive (moves to archive/, updates specs/)
/openspec-archive add-anti-abuse

# Or manual:
openspec archive add-anti-abuse --yes
```

**What archiving does:**

1. **Moves change directory:**
changes/add-anti-abuse/
→ changes/archive/2025-01-10-add-anti-abuse/

2. **Applies deltas to main specs:**
changes/add-anti-abuse/specs/auth/spec.md
→ specs/auth/spec.md (ADDED requirements merged in)

3. **Validates result:**
```bash
   openspec validate --strict
   # Ensures archived change passes all checks
```

4. **Git workflow:**
```bash
   git add openspec/
   git commit -m "feat: anti-abuse system

   Implements device fingerprinting, email validation, phone verification, and rate limiting.
   
   Closes epic-42
   Spec: openspec/changes/archive/2025-01-10-add-anti-abuse/"
   
   git pull --rebase
   bd sync
   git push
```

---

## 4.4. Landing the Plane (Session Completion)

**🚨 MANDATORY: Work is NOT complete until `git push` succeeds**

**Checklist:**
```bash
# 1. File issues for remaining work
bd create "Investigate SMS deliverability" \
  --type task \
  --priority 2 \
  --description "3% of SMS codes not delivered. Research alternatives."

# 2. Run quality gates (if code changed)
npm run lint
npm run test
npm run build

# 3. Update issue status
bd close task-141  # Last task
bd sync            # Sync with git

# 4. PUSH TO REMOTE (MANDATORY)
git pull --rebase
git status         # Verify clean
git push           # MUST succeed

# 5. Verify push succeeded
git status
# Output: "Your branch is up to date with 'origin/main'"

# 6. Clean up
git stash list     # Should be empty
git branch -vv     # Check remote tracking

# 7. Hand off
# - Summary of completed work
# - Link to deployed feature
# - Any open questions/issues
```

**Critical rules:**
- ❌ NEVER stop before `git push`
- ❌ NEVER say "ready to push when you are"
- ✅ YOU must push
- ✅ Resolve conflicts and retry until push succeeds
- ✅ Work is incomplete if changes are only local

---

# REFERENCE

## Spec File Format

### Requirement Structure
```markdown
### Requirement: [Name]

[One sentence SHALL/MUST statement]

**Rationale:** [Why this requirement exists]

#### Scenario: [Name]

- **GIVEN** [preconditions]
- **WHEN** [action]
- **THEN** [expected result]
- **AND** [additional assertions]

#### Scenario: [Another name]

...
```

---

### Delta Operations

**Headers (exact match, whitespace-insensitive):**
```markdown
## ADDED Requirements
## MODIFIED Requirements
## REMOVED Requirements
## RENAMED Requirements
```

**ADDED:**
- Use for new capabilities
- Full requirement text
- At least 1 scenario

**MODIFIED:**
- Use for changed behavior
- **Copy entire existing requirement**, then edit
- Include ALL previous scenarios + new ones
- At archive time, replaces entire requirement

**REMOVED:**
- Use for deprecated features
- Include reason + migration path
- No scenarios needed

**RENAMED:**
- Use for name-only changes
- Format:
```markdown
  ## RENAMED Requirements
  - FROM: `### Requirement: Old Name`
  - TO: `### Requirement: New Name`
```
- If also changing behavior, use RENAMED + MODIFIED (new name)

---

### Critical Formatting Rules

✅ **CORRECT:**
```markdown
#### Scenario: User login success
- **WHEN** valid credentials provided
- **THEN** return JWT token
```

❌ **WRONG:**
```markdown
- **Scenario: User login**      # ❌ bullet point
**Scenario:** User login         # ❌ bold only
### Scenario: User login         # ❌ wrong header level
```

**Rule:** Scenarios MUST use `####` (4 hashtags)

---

## CLI Quick Reference
```bash
# Discovery
openspec list                    # Active changes
openspec list --specs            # Existing capabilities
openspec spec list --long        # Detailed spec list
openspec show <item>             # View change or spec
openspec show <item> --json      # Machine-readable

# Creation
# (use /openspec-proposal instead of manual creation)

# Validation
openspec validate <change> --strict     # Full validation
openspec validate --strict              # Validate all

# Workflow
/openspec-proposal "Feature name"       # Create proposal
# ... wait for "Go!" ...
/openspec-to-beads <change-id>          # Generate tasks
bd ready                                # Check ready tasks
bd close <task-id>                      # Complete task
/openspec-apply <change-id>             # Verify implementation
/openspec-archive <change-id>           # Archive change

# Debugging
openspec show <change> --json --deltas-only
rg -n "Requirement:|Scenario:" openspec/specs
```

---

## Directory Structure
openspec/
├── project.md              # Project conventions
│
├── specs/                  # Current truth (what IS built)
│   └── [capability]/
│       ├── spec.md         # Requirements + scenarios
│       └── design.md       # Technical patterns
│
├── changes/                # Proposals (what SHOULD change)
│   ├── [change-id]/
│   │   ├── proposal.md     # Why, what, impact
│   │   ├── tasks.md        # Implementation checklist
│   │   ├── design.md       # Technical decisions (optional)
│   │   └── specs/          # Delta changes
│   │       └── [capability]/
│   │           └── spec.md # ADDED/MODIFIED/REMOVED
│   │
│   └── archive/            # Completed changes
│       └── YYYY-MM-DD-[change-id]/
│
.beads/                     # Task tracking (generated)
└── [epic-id]/
└── tasks/
└── [task-id].json

---

## Common Errors & Fixes

### "Change must have at least one delta"

**Cause:** Missing `specs/` directory or no .md files

**Fix:**
```bash
mkdir -p openspec/changes/my-change/specs/auth
echo "## ADDED Requirements" > openspec/changes/my-change/specs/auth/spec.md
```

---

### "Requirement must have at least one scenario"

**Cause:** Missing `#### Scenario:` or wrong format

**Fix:**
```markdown
### Requirement: My Feature

System SHALL do something.

#### Scenario: Success case
- **WHEN** action happens
- **THEN** result occurs
```

---

### "Scenario parse failed"

**Cause:** Not using exact format

**Debug:**
```bash
openspec show my-change --json --deltas-only | jq '.deltas[].requirements[].scenarios'
```

**Fix:** Use `####` (4 hashtags), not bullets or bold

---

### "Spec validation failed after archive"

**Cause:** Corrupted merge or missing scenarios in MODIFIED

**Fix:**
1. Check `specs/[capability]/spec.md` for duplicates
2. Ensure MODIFIED included full requirement text
3. Run `openspec validate --strict` to find specific error

---

## Workflow Diagram
┌──────────────────────────────────────────────────────────────┐
│                     UNIFIED WORKFLOW                         │
└──────────────────────────────────────────────────────────────┘

INTENT FORMATION (OpenSpec)
┌─────────────────────────────────┐
│ User Request                    │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ Create Proposal                 │
│ - proposal.md                   │
│ - tasks.md                      │
│ - design.md (optional)          │
│ - specs/[cap]/spec.md           │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ Validate Spec                   │
│ openspec validate --strict      │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ Request Approval                │
│ WAIT FOR "Go!"                  │◀── 🚫 GATE
└────────────┬────────────────────┘
│
│ "Go!" received
▼
PLAN TRANSFORMATION (Beads)
┌─────────────────────────────────┐
│ /openspec-to-beads <change-id>  │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ Generate Task Graph             │
│ - Create Epic                   │
│ - Create Tasks from tasks.md    │
│ - Set Dependencies              │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ bd ready                        │
│ Show actionable tasks           │
└────────────┬────────────────────┘
│
▼
EXECUTION (Code)
┌─────────────────────────────────┐
│ Work Loop                       │
│                                 │
│ while (tasks remain):           │
│   task = bd ready               │
│   implement(task)               │
│   test(task)                    │
│   bd close task                 │
└────────────┬────────────────────┘
│
│ All tasks closed
▼
VALIDATION & FIXATION
┌─────────────────────────────────┐
│ /openspec-apply <change-id>     │
│ Verify code matches spec        │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ Quality Gates                   │
│ - npm run test                  │
│ - npm run lint                  │
│ - npm run build                 │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ /openspec-archive <change-id>   │
│ Move to archive/                │
│ Update specs/                   │
└────────────┬────────────────────┘
│
▼
┌─────────────────────────────────┐
│ Landing the Plane               │
│ - File remaining issues         │
│ - bd sync                       │
│ - git push                      │◀── 🚫 MANDATORY
└─────────────────────────────────┘


---

## Best Practices

### Simplicity First

- ✅ Default to <100 lines of new code
- ✅ Single-file implementations until proven insufficient
- ✅ Avoid frameworks without clear justification
- ✅ Choose boring, proven patterns

**Complexity triggers:**
- Performance data showing current solution too slow
- Concrete scale requirements (>1000 users, >100MB data)
- Multiple proven use cases requiring abstraction

---

### Capability Naming

- ✅ Use verb-noun: `user-auth`, `payment-capture`
- ✅ Single purpose per capability
- ✅ 10-minute understandability rule
- ✅ Split if description needs "AND"

**Examples:**
- ✅ `user-registration`
- ✅ `video-processing`
- ✅ `abuse-prevention`
- ❌ `user-management-and-video-processing` (too broad)

---

### Change ID Naming

- ✅ Kebab-case, short, descriptive
- ✅ Verb-led prefixes: `add-`, `update-`, `remove-`, `refactor-`
- ✅ Ensure uniqueness (append `-2` if needed)

**Examples:**
- ✅ `add-two-factor-auth`
- ✅ `update-payment-flow`
- ✅ `remove-legacy-api`
- ❌ `authentication-improvements` (too vague)

---

### Clear References

- ✅ Use `file.ts:42` for code locations
- ✅ Reference specs as `specs/auth/spec.md`
- ✅ Link related changes: `See also: add-2fa`
- ✅ Link PRs: `Implements #123`

---

## Troubleshooting Guide

### I created a spec but can't start coding

**Expected behavior.** Wait for explicit "Go!" approval.

**Why:** Prevents wasted work on wrong approach.

**Solution:** Present proposal to stakeholders, iterate on spec (cheap), get approval, then code.

---

### Tasks showing as BLOCKED in `bd ready`

**Cause:** Dependencies not met.

**Check:**
```bash
bd show <task-id>
# Look for "Blocked by: task-X, task-Y"

bd list --status open
# See which tasks need to be closed first
```

**Solution:** Complete blocking tasks first, or remove dependency if incorrect.

---

### Spec validation passes but `/openspec-apply` fails

**Cause:** Code doesn't match spec requirements.

**Debug:**
```bash
/openspec-apply my-change

# Output shows which requirements/scenarios not covered
```

**Solution:**
1. Implement missing code
2. Add missing tests
3. Update spec if requirement changed

---

### Archive failed: "Spec validation failed"

**Cause:** Delta merge created invalid spec.

**Debug:**
```bash
openspec validate my-change --strict
# Shows specific error

# Check merged spec
cat specs/[capability]/spec.md | grep -A 5 "Requirement:"
```

**Solution:**
1. Fix delta spec (ensure MODIFIED includes full text)
2. Re-validate
3. Retry archive

---

## Advanced: Multi-Capability Changes

**Example:** Feature affects `auth` and `notifications`.

**Structure:**
changes/add-2fa-notify/
├── proposal.md
├── tasks.md
├── design.md
└── specs/
├── auth/
│   └── spec.md        # ADDED: Two-Factor Authentication
└── notifications/
└── spec.md        # ADDED: OTP Email Notification

**auth/spec.md:**
```markdown
## ADDED Requirements

### Requirement: Two-Factor Authentication

System SHALL require OTP for login.

#### Scenario: OTP required
...
```

**notifications/spec.md:**
```markdown
## ADDED Requirements

### Requirement: OTP Email Notification

System SHALL send OTP via email when 2FA is triggered.

#### Scenario: Email sent
...
```

**Archive result:**
- `specs/auth/spec.md` updated
- `specs/notifications/spec.md` updated
- Both changes tracked in one archive folder

---

## Cheat Sheet
```bash
# Start new feature
/openspec-proposal "My feature"
# Edit proposal.md, tasks.md, design.md, specs/
openspec validate my-feature --strict
# Request approval, WAIT for "Go!"

# Generate tasks (after "Go!")
/openspec-to-beads my-feature

# Work loop
bd ready
bd show <task-id>
# ... implement ...
bd close <task-id>

# Finish
/openspec-apply my-feature
npm run test && npm run lint && npm run build
/openspec-archive my-feature
bd sync
git push
```

---

## Mental Model
OpenSpec (Specs)  = CONTRACT (what we agreed to build)
Beads (Tasks)     = PLAN (how we'll build it)
Code              = REALITY (what we actually built)
Keep them in sync:

Spec changes → regenerate tasks → update code
Code changes → verify vs spec → archive when done


---

## Available Agents

### Bug Hunter Agent

**Location:** `.claude/agents/bug-hunter.md`

**Purpose:** Automatically find bugs through static analysis, test failures, and log analysis.

**Usage:**
- Run manually: `./scripts/bug-hunter.sh`
- Creates Beads issues for found bugs
- Prioritizes bugs (CRITICAL, HIGH, MEDIUM, LOW)

**Integration:**
- Beads: Creates issues
- Bug Fixer Agent: Consumes issues
- OpenSpec: Architectural bugs can trigger proposals

### Bug Fixer Agent

**Location:** `.claude/agents/bug-fixer.md`

**Purpose:** Apply systematic-debugging methodology to fix bugs.

**Usage:**
- Reads bug issues from Beads
- Applies 4-phase systematic debugging:
  1. Root Cause Analysis
  2. Pattern Analysis
  3. Fix Strategy
  4. Quality Gates
- Updates issues with fix details
- Escalates to architectural review when needed (rule: "3 fixes = architectural review")

**Integration:**
- Systematic Debugging Skill: Core methodology
- Beads: Reads and updates issues
- OpenSpec: Creates proposals for architectural bugs

### Systematic Debugging Skill

**Location:** `.claude/skills/systematic-debugging.md`

**Purpose:** 4-phase systematic debugging methodology.

**Phases:**
1. **Root Cause Analysis** - Understand cause, not symptom
2. **Pattern Analysis** - Isolated vs systemic bug
3. **Fix Strategy** - Quick fix vs architectural review
4. **Quality Gates** - Verify fix and check regression

**Usage:**
- Invoked by Bug Fixer Agent
- Can be used manually for interactive debugging
- Script: `./scripts/systematic-debug.sh <bug-id>`

**References:**
- Source: https://habr.com/ru/articles/984882/
- Proposal: `openspec/changes/add-systematic-bug-fixing/`
- Documentation: `docs/operations/bug-fixing-workflow.md`

---

**End of Unified Workflow Guide** ✅
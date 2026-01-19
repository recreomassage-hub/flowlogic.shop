# Change: Change Quota System to Valid Tests (P0)

## Why

**Problem:** Current quota system counts all video uploads (including failed/invalid attempts), which is unfair to users:
- New users (2-3 attempts per test) consume 2-3x more quota than experienced users
- Users are penalized for poor camera/lighting conditions (factors outside their control)
- Creates stress from attempt counter ("8 / 20 used")
- Users think "I'm wasting my quota" instead of focusing on recording quality

**Current State:**
- Quota system tracks `videoQuotaUsedDaily` (all uploads count)
- Limits: Free=9 videos/day, Basic=9 videos/day, Pro=21 videos/day
- Every upload attempt counts against quota, even if invalid
- Users see "Uploads: X / Y used" which creates pressure

**Example Problem:**
```
Free tier user:
- Quota: 9 videos/day
- Test 1: 3 attempts (invalid → invalid → valid) = 3 videos used
- Test 2: 3 attempts = 3 videos used
- Test 3: 3 attempts = 3 videos used
Total: 9 videos exhausted, but only 3 valid tests obtained

Experienced user (same tier):
- Quota: 9 videos/day
- Test 1: 1 attempt (valid) = 1 video used
- Test 2: 1 attempt (valid) = 1 video used
- Test 3: 1 attempt (valid) = 1 video used
Total: 3 videos used, 6 videos remaining (unused value)
```

**Opportunity:** Change quota system to count only valid tests (primary limit) + total uploads (abuse protection):
- Users pay for results, not attempts
- New users and experienced users get equal value
- Retries are "free" (within abuse limits)
- Reduces UX friction and stress
- Better aligns with user value perception

**Business Value:**
- Fairer system → higher user satisfaction
- Reduced UX friction → higher completion rates
- Better retention (users don't feel penalized)
- Natural fit for progressive assessment model
- Cost control still maintained via abuse limits

## What Changes

**Modifications:**

1. **Quota tracking logic** — Change from upload-based to valid-test-based
   - **Primary limit:** Valid tests per month (Free=3, Basic=7, Pro=15)
   - **Secondary limit:** Total uploads per month (abuse protection)
     - Free: 20 uploads/month (hard limit)
     - Basic: 50 uploads/month (hard limit)
     - Pro: 100 uploads/month (hard limit)
   - Retries don't count toward valid test limit (but do count toward upload limit)

2. **Database schema** — Update `userLimits` table
   - Add `validTestsCount` (current month)
   - Add `validTestsLimit` (tier-based: 3/7/15)
   - Add `totalUploadsCount` (current month)
   - Add `hardUploadLimit` (tier-based: 20/50/100)
   - Keep existing fields for backward compatibility during migration
   - Add `softLimitWarningShown` (boolean, for soft limit warnings)

3. **Backend quota logic** — Update quota checking and tracking
   - Check valid tests limit before starting new test
   - Check upload limit before allowing upload (abuse protection)
   - Increment `validTestsCount` only on successful test completion
   - Increment `totalUploadsCount` on every upload attempt
   - Show soft limit warning at 75% of upload limit (with helpful tips)
   - Block uploads at hard upload limit

4. **Frontend UX** — Update quota display
   - **Show users:** "Movement checks: X / Y completed this month"
   - **Hide from users:** "Uploads: X / Y used" (unless approaching soft limit)
   - At soft limit (75%): Show helpful tips instead of warning
   - At hard limit: Block upload + offer upgrade or support

5. **Documentation updates** — Update PRD and project.md
   - Update quota system description
   - Update tier communication (remove "videos/day" language)
   - Update pricing page copy (use "movement checks/month")

**BREAKING:** None (all changes are additive or modifications to internal logic)

## Impact

**Affected specs:**
- `quota-system` — MODIFIED quota tracking logic
- `tier-communication` — MODIFIED user-facing quota language
- `abuse-protection` — MODIFIED abuse detection thresholds

**Affected code:**

**Backend:**
- `src/backend/services/quotaService.ts` — MODIFIED quota checking logic
  - Add `checkValidTestsLimit(userId)` function
  - Add `checkUploadLimit(userId)` function
  - Modify `incrementQuota(userId, isValid)` to track both counters
- `src/backend/db/models/UserLimits.ts` — MODIFIED schema
  - Add `validTestsCount`, `validTestsLimit`
  - Add `totalUploadsCount`, `hardUploadLimit`
  - Add `softLimitWarningShown`
- `src/backend/api/quota/status.ts` — MODIFIED response format
  - Return `validTestsCompleted`, `validTestsLimit` (primary)
  - Return `totalUploads` only if approaching soft limit
- `src/backend/handlers/test-engine.ts` — MODIFIED quota increment
  - Increment `validTestsCount` only on successful completion
  - Increment `totalUploadsCount` on every upload

**Frontend:**
- `src/frontend/components/QuotaDisplay.tsx` — NEW or MODIFIED
  - Show "Movement checks: X / Y completed"
  - Hide upload counter (unless soft limit warning)
  - Add soft limit warning with tips
- `src/frontend/pages/PricingPage.tsx` — MODIFIED
  - Change "X videos/month" to "X movement checks/month"
  - Update tier descriptions
- `src/frontend/pages/SettingsPage.tsx` — MODIFIED
  - Update tier status display

**Documentation:**
- `docs/requirements/PRD.md` — MODIFIED Section 4.2 (Tier gating rules)
  - Change quota description to valid tests + upload limits
  - Update tier limits table
- `openspec/project.md` — MODIFIED Assessment Limits section
  - Update quota system description

**Migration:**
- **Data migration:** Update existing `userLimits` records
  - Initialize `validTestsCount` = 0 (start fresh)
  - Initialize `totalUploadsCount` from existing `videoQuotaUsedDaily` (preserve abuse tracking)
  - Set `validTestsLimit` based on tier
  - Set `hardUploadLimit` based on tier
- **Backward compatibility:** Keep existing fields during transition
- **Migration script:** `src/backend/migrations/XXXX_migrate_quota_to_valid_tests.ts`

**Risks:**
- **Medium risk:** Quota logic change affects all users
- **Testing:** Need thorough testing of quota checking logic
- **Communication:** Users may be confused by quota reset (valid tests start at 0)
- **Migration:** Need to handle existing users gracefully

## Open Questions

- [ ] Should we reset valid tests count at month start or allow carryover? (Recommended: reset at month start for simplicity)
- [ ] What should be the soft limit threshold for upload warnings? (Recommended: 75% = 15/20 for Free tier)
- [ ] Should we show upload counter in settings page for transparency? (Recommended: yes, but not in main flow)
- [ ] How to handle users mid-month when we deploy this change? (Recommended: reset valid tests, preserve upload count for abuse tracking)

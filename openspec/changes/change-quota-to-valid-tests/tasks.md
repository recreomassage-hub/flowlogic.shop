# Implementation Tasks

## 1. Database Schema Updates

- [ ] 1.1 Update `userLimits` table migration
  - ADD: `validTestsCount` (N, default 0, current month)
  - ADD: `validTestsLimit` (N, tier-based: Free=3, Basic=7, Pro=15)
  - ADD: `totalUploadsCount` (N, default 0, current month)
  - ADD: `hardUploadLimit` (N, tier-based: Free=20, Basic=50, Pro=100)
  - ADD: `softLimitWarningShown` (BOOL, default false)
  - Keep existing fields for backward compatibility
  - KMS encryption enabled

- [ ] 1.2 Create data migration script
  - Initialize `validTestsCount` = 0 (start fresh)
  - Initialize `totalUploadsCount` from existing `videoQuotaUsedDaily` (preserve abuse tracking)
  - Set `validTestsLimit` based on user tier
  - Set `hardUploadLimit` based on user tier
  - Reset `softLimitWarningShown` = false

## 2. Backend Quota Service

- [ ] 2.1 Create `src/backend/services/quotaService.ts`
  - `checkValidTestsLimit(userId)` - Check if user can start new test
  - `checkUploadLimit(userId)` - Check if user can upload (abuse protection)
  - `incrementValidTest(userId)` - Increment valid tests count
  - `incrementUpload(userId)` - Increment total uploads count
  - `getQuotaStatus(userId)` - Get current quota status
  - `resetMonthlyQuota(userId)` - Reset quotas at month start (scheduled)

- [ ] 2.2 Update `src/backend/db/models/UserLimits.ts`
  - Add new fields to UserLimits interface
  - Update model methods to handle new fields
  - Add GSI queries if needed

- [ ] 2.3 Update `src/backend/api/quota/status.ts`
  - Modify response format:
    - Return `validTestsCompleted`, `validTestsLimit` (primary)
    - Return `totalUploads`, `hardUploadLimit` only if approaching soft limit (75%)
    - Remove `videosUsed`, `videosLimit` from user-facing response

- [ ] 2.4 Update `src/backend/handlers/test-engine.ts`
  - Check valid tests limit before starting new test
  - Check upload limit before allowing upload (abuse protection)
  - Increment `validTestsCount` only on successful test completion
  - Increment `totalUploadsCount` on every upload attempt
  - Call quota service methods

- [ ] 2.5 Add soft limit warning logic
  - Check if `totalUploadsCount >= 75% of hardUploadLimit`
  - If yes and `softLimitWarningShown = false`, set flag and return warning
  - Warning includes helpful tips (camera positioning, lighting, distance)

- [ ] 2.6 Create scheduled Lambda for monthly quota reset
  - EventBridge rule: 1st of each month
  - Reset `validTestsCount = 0` for all users
  - Reset `totalUploadsCount = 0` for all users
  - Reset `softLimitWarningShown = false` for all users

## 3. Frontend Updates

- [ ] 3.1 Create/Update `src/frontend/components/QuotaDisplay.tsx`
  - Display: "Movement checks: X / Y completed this month"
  - Hide upload counter (unless soft limit warning active)
  - Add soft limit warning component with tips
  - Style: Clear, non-intimidating

- [ ] 3.2 Update `src/frontend/pages/PricingPage.tsx`
  - Change "X videos/month" to "X movement checks/month"
  - Update tier descriptions
  - Remove "videos/day" language
  - Update feature comparison table

- [ ] 3.3 Update `src/frontend/pages/SettingsPage.tsx`
  - Update tier status display
  - Show "Movement checks: X / Y completed"
  - Add upload counter in settings (optional, for transparency)
  - Update tier upgrade prompts

- [ ] 3.4 Update quota API calls
  - Update API response parsing (new format)
  - Handle soft limit warnings
  - Handle hard limit blocking

## 4. Documentation Updates

- [ ] 4.1 Update `docs/requirements/PRD.md`
  - Section 4.2 (Tier gating rules): Update quota description
  - Change from "videos/day" to "movement checks/month"
  - Update tier limits table
  - Document valid tests + upload limits structure

- [ ] 4.2 Update `openspec/project.md`
  - Assessment Limits section: Update quota system description
  - Update tier communication guidelines
  - Remove "videos/day" references

- [ ] 4.3 Update API documentation
  - Document new quota status response format
  - Document quota checking endpoints
  - Document monthly reset behavior

## 5. Testing

- [ ] 5.1 Unit tests: quotaService
  - Test valid tests limit checking
  - Test upload limit checking
  - Test quota increment logic
  - Test soft limit warning logic

- [ ] 5.2 Unit tests: UserLimits model
  - Test new fields
  - Test quota reset logic
  - Test backward compatibility

- [ ] 5.3 Integration tests: Quota enforcement
  - Test valid tests limit blocks new test start
  - Test upload limit blocks upload
  - Test soft limit warning appears at 75%
  - Test hard limit blocks upload completely

- [ ] 5.4 Integration tests: Monthly reset
  - Test scheduled Lambda resets quotas
  - Test quotas reset correctly for all tiers

- [ ] 5.5 E2E tests: User flow
  - Test quota display shows "Movement checks: X / Y"
  - Test soft limit warning appears
  - Test hard limit blocks upload
  - Test upgrade prompt appears when limit reached

## 6. Migration & Deployment

- [ ] 6.1 Run migration in staging
  - Verify table schema updates
  - Verify data migration (preserve upload counts)
  - Verify backward compatibility

- [ ] 6.2 Test in staging
  - Verify quota checking logic
  - Verify soft/hard limit behavior
  - Verify monthly reset schedule

- [ ] 6.3 Deploy to production
  - Run migration
  - Monitor quota service errors
  - Monitor user feedback

## Dependencies

```
1.x (Database Schema) → blocks 2.x (Backend Service)
2.x (Backend Service) → blocks 3.x (Frontend Updates)
{2.x, 3.x} → blocks 4.x (Documentation)
{2.x, 3.x} → blocks 5.x (Testing)
{5.x} → blocks 6.x (Migration & Deployment)
```

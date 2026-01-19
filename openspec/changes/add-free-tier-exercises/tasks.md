# Implementation Tasks

## 1. Database Schema Updates

- [ ] 1.1 Update `exercises` table migration
  - ADD: `youtubeUrl` (S, optional, for Free tier suggestions)
  - ADD: `suggestedForFreeTier` (BOOL, default false, mark exercises available for Free tier)
  - KMS encryption enabled

- [ ] 1.2 Create migration script
  - Add columns to existing exercises table
  - Backward compatible (both fields optional)

## 2. Backend Exercise Suggestion Service

- [ ] 2.1 Create `src/backend/services/exerciseSuggestionService.ts`
  - `getFreeTierSuggestions(assessmentId)` - Select 2 exercises for Free tier
  - Selection logic:
    - Priority: P1 problem areas first
    - Maximum 2 exercises
    - Only exercises with `suggestedForFreeTier = true`
    - Only exercises with `youtubeUrl` set
  - Returns exercises with YouTube links

- [ ] 2.2 Update `src/backend/db/models/Exercise.ts`
  - Add `youtubeUrl` field to Exercise interface
  - Add `suggestedForFreeTier` field to Exercise interface
  - Update model methods to handle new fields

- [ ] 2.3 Create `src/backend/api/assessments/free-tier-suggestions.ts`
  - GET `/api/assessments/:id/free-tier-suggestions`
  - Endpoint logic:
    - Get assessment problem areas
    - Call exercise suggestion service
    - Return 2 exercises with YouTube links
  - Error handling: Return empty array if no suggestions

- [ ] 2.4 Update assessment results endpoint
  - Add `freeTierSuggestions` field to response (if Free tier)
  - Include suggestions in assessment results response

## 3. Seed Data

- [ ] 3.1 Add YouTube links to common exercises
  - Ankle circles (ankle mobility)
  - Hip bridges (hip control)
  - Glute activation exercises
  - Core stability exercises
  - Shoulder mobility exercises
  - At least 10-15 exercises total

- [ ] 3.2 Mark exercises as `suggestedForFreeTier = true`
  - Mark exercises that are suitable for Free tier
  - Cover common problem areas (ankle, hip, core, shoulder)
  - Ensure good variety

- [ ] 3.3 Create seed script update
  - Add YouTube URLs to exercise seed data
  - Set `suggestedForFreeTier` flags
  - Verify all common problem areas covered

## 4. Frontend Updates

- [ ] 4.1 Update `src/frontend/components/ResultsScreen.tsx`
  - Add Free tier exercise suggestions section
  - Display 2 exercises with:
    - Name
    - Sets × Reps or Duration
    - Reason (1 sentence)
    - "Watch on YouTube ↗" link (opens in new tab)
  - Show section only for Free tier users

- [ ] 4.2 Create/Update `src/frontend/components/ExerciseCard.tsx`
  - Display exercise with YouTube link
  - Handle external link (opens in new tab)
  - Style: Clean, clear, accessible

- [ ] 4.3 Update upgrade prompt
  - Change from: "Want exercises? Upgrade to Basic"
  - Change to: "Want a personalized plan with progress tracking? Upgrade to Basic • $4.99/mo"
  - Update copy in ResultsScreen

- [ ] 4.4 Update `src/frontend/pages/PricingPage.tsx`
  - Update Free tier description: "Tests + results + 2 exercise suggestions (YouTube links)"
  - Update feature comparison table
  - Add exercise suggestions to Free tier features

## 5. Documentation Updates

- [ ] 5.1 Update `docs/requirements/PRD.md`
  - Section 4.1 (Pricing Matrix): Update Free tier description
  - Change to: "Tests + results + 2 exercise suggestions (YouTube links)"
  - Update tier comparison table

- [ ] 5.2 Update `openspec/project.md`
  - Free Tier section: Update description
  - Add exercise suggestions to Free tier features
  - Update UX copy guidelines

- [ ] 5.3 Update API documentation
  - Document free-tier-suggestions endpoint
  - Document exercise suggestion response format

## 6. Testing

- [ ] 6.1 Unit tests: exerciseSuggestionService
  - Test exercise selection logic (P1 priority, max 2)
  - Test only exercises with YouTube links selected
  - Test only exercises with `suggestedForFreeTier = true` selected

- [ ] 6.2 Unit tests: Exercise model
  - Test new fields (youtubeUrl, suggestedForFreeTier)
  - Test backward compatibility

- [ ] 6.3 Integration tests: Free tier suggestions endpoint
  - Test endpoint returns 2 exercises
  - Test exercises have YouTube links
  - Test exercises match problem areas
  - Test empty array if no suggestions available

- [ ] 6.4 E2E tests: Free tier results screen
  - Test exercise suggestions display correctly
  - Test YouTube links open in new tab
  - Test upgrade prompt copy
  - Test suggestions only show for Free tier

- [ ] 6.5 Manual testing: YouTube links
  - Verify all YouTube links work
  - Verify videos are appropriate
  - Verify links open in new tab

## 7. Migration & Deployment

- [ ] 7.1 Run migration in staging
  - Verify table schema updates
  - Verify seed data (YouTube links added)
  - Verify backward compatibility

- [ ] 7.2 Test in staging
  - Verify exercise suggestions work
  - Verify YouTube links work
  - Verify upgrade prompt displays correctly

- [ ] 7.3 Deploy to production
  - Run migration
  - Run seed data updates
  - Monitor for errors

## Dependencies

```
1.x (Database Schema) → blocks 2.x (Backend Service)
2.x (Backend Service) → blocks 3.x (Seed Data)
{2.x, 3.x} → blocks 4.x (Frontend Updates)
{2.x, 3.x, 4.x} → blocks 5.x (Documentation)
{2.x, 3.x, 4.x} → blocks 6.x (Testing)
{6.x} → blocks 7.x (Migration & Deployment)
```

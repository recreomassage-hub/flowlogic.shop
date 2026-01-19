# Change: Add Exercise Suggestions for Free Tier (P0)

## Why

**Problem:** Free tier currently provides only assessment insights without actionable exercises, which creates poor user experience:
- Users complete 3 tests → get insights → see "Upgrade to get exercises"
- Users feel deceived ("Did I waste my time?")
- No immediate value delivered (value is deferred to paid tier)
- Low conversion rate (users don't see product value)
- Free tier feels like "teaser" instead of "valuable entry point"

**Current State:**
- Free tier: 3 baseline tests only
- Results screen shows problem areas (insights only)
- No exercises/plans for Free tier
- Upgrade prompt: "Want exercises? Upgrade to Basic"
- Users get assessment but no action items

**User Journey Problem:**
```
Free tier user:
1. Completes 3 tests (5-7 minutes)
2. Sees results: "Ankle mobility limits squat depth"
3. Sees: "Want a personalized plan? Upgrade to Basic"
4. Thinks: "So I did all this for nothing?"
5. Leaves without upgrading (no value delivered)
```

**Opportunity:** Add 2 exercise suggestions with YouTube links for Free tier:
- Users get minimal actionable value (2 exercises)
- Users don't feel deceived (they get something useful)
- Upgrade feels like "more" instead of "something at all"
- Better conversion rate (users see product value first)
- Free tier becomes valuable entry point, not teaser

**Business Value:**
- Higher Free → Basic conversion (users see value before upgrade)
- Better user satisfaction (Free tier delivers value)
- Reduced churn (users have something to do)
- Better product-market fit validation (users use exercises)
- Natural upgrade path (2 exercises → full plan = upgrade incentive)

## What Changes

**Additions:**

1. **Exercise suggestion logic** — Add logic to suggest 2 exercises for Free tier
   - Select 2 exercises based on top problem areas from assessment
   - Exercise selection rules:
     - Priority: P1 problem areas first
     - Maximum 2 exercises
     - Always include YouTube link
     - Always include reason (1 sentence: "Improves ankle mobility for deeper squats")
   - Exercise format:
     - Name (e.g., "Ankle circles")
     - Sets × Reps (e.g., "2 sets × 10 reps each side")
     - Reason (1 sentence)
     - YouTube link (external)

2. **Database schema** — Add YouTube links to exercises
   - Add `youtubeUrl` field to `exercises` table (optional, for Free tier suggestions)
   - Add `suggestedForFreeTier` field (boolean, mark exercises available for Free tier)
   - Or: Create `exercise-suggestions` mapping table (Free tier → exercise IDs)

3. **Backend API** — Add endpoint for Free tier suggestions
   - `GET /api/assessments/:id/free-tier-suggestions`
   - Returns 2 exercises with YouTube links
   - Based on assessment problem areas
   - Selection logic: P1 areas first, max 2

4. **Frontend Results screen** — Update Free tier results display
   - Show problem areas (existing, unchanged)
   - **NEW:** Show "Here are 2 exercises you can try today:"
   - Display 2 exercises with:
     - Name
     - Sets × Reps or Duration
     - Reason (1 sentence)
     - "Watch on YouTube ↗" link (opens in new tab)
   - **NEW:** Update upgrade prompt:
     - Change from: "Want exercises? Upgrade"
     - Change to: "Want a personalized plan with progress tracking? Upgrade to Basic"

5. **Documentation updates** — Update PRD and project.md
   - Update Free tier description (adds 2 exercise suggestions)
   - Update pricing page (Free tier includes exercise suggestions)
   - Update UX copy guidelines

**BREAKING:** None (all changes are additive)

## Impact

**Affected specs:**
- `free-tier-value` — ADDED exercise suggestions
- `exercise-library` — ADDED YouTube links support
- `results-screen` — MODIFIED Free tier display

**Affected code:**

**Backend:**
- `src/backend/services/exerciseSuggestionService.ts` — NEW service
  - `getFreeTierSuggestions(assessmentId)` function
  - Selects 2 exercises based on problem areas
  - Returns exercises with YouTube links
- `src/backend/db/models/Exercise.ts` — MODIFIED schema
  - Add `youtubeUrl` field (optional string)
  - Add `suggestedForFreeTier` field (optional boolean)
- `src/backend/api/assessments/free-tier-suggestions.ts` — NEW endpoint
  - GET `/api/assessments/:id/free-tier-suggestions`
  - Returns 2 exercises with YouTube links
- `src/backend/db/migrations/XXXX_add_youtube_to_exercises.ts` — NEW migration
  - Add `youtubeUrl` column to exercises table
  - Add `suggestedForFreeTier` column

**Frontend:**
- `src/frontend/components/ResultsScreen.tsx` — MODIFIED
  - Add Free tier exercise suggestions section
  - Display 2 exercises with YouTube links
  - Update upgrade prompt copy
- `src/frontend/components/ExerciseCard.tsx` — NEW or MODIFIED
  - Display exercise with YouTube link
  - Handle external link (opens in new tab)
- `src/frontend/pages/PricingPage.tsx` — MODIFIED
  - Update Free tier description (adds exercise suggestions)
  - Update feature comparison table

**Documentation:**
- `docs/requirements/PRD.md` — MODIFIED Section 4.1 (Pricing Matrix)
  - Update Free tier: "Tests + results + 2 exercise suggestions (YouTube links)"
- `openspec/project.md` — MODIFIED Free Tier section
  - Update description to include exercise suggestions
- `docs/analysis/UX-improvements-analysis.md` — REFERENCE
  - Analysis document with recommendations

**Migration:**
- **Data migration:** Add YouTube links to existing exercises
  - Populate `youtubeUrl` for common exercises (ankle circles, hip bridges, etc.)
  - Mark exercises as `suggestedForFreeTier = true` for suitable exercises
- **Seed data:** Add YouTube links to exercise seed data
  - Ensure at least 10-15 exercises have YouTube links
  - Cover common problem areas (ankle mobility, hip control, core stability)

**Risks:**
- **Low risk:** All changes are additive
- **YouTube links:** External dependency (if YouTube changes URLs, links break)
- **Exercise selection:** Need to ensure good exercise suggestions (test with users)
- **Content:** Need YouTube links for exercises (may require creating videos or finding existing ones)

## Open Questions

- [ ] Should YouTube links be required or optional for Free tier suggestions? (Recommended: required, fail gracefully if missing)
- [ ] How many exercises should have YouTube links in seed data? (Recommended: 15-20 minimum, covering all common problem areas)
- [ ] Should we track YouTube link clicks for analytics? (Recommended: yes, but low priority for MVP)
- [ ] What if user has only 1 problem area? (Recommended: suggest 2 exercises for same area, or add secondary area)

# Change: Add Movement Assessment Databases

## Why

**Problem:** The platform needs comprehensive database structures to support the Movement Quality Assessment System based on the two provided documents:
- **Part 1:** Test catalog (15 assessment tests) with detailed evaluation criteria
- **Part 2:** Exercise catalog and training plans for movement correction

**Current State:**
- Basic `assessments` table exists but lacks detailed test metadata and results structure
- No exercises catalog database
- No training plan templates database
- No user exercise progress tracking
- Missing P1/P2 priority classification for problem areas

**Opportunity:** Create a complete database schema that enables:
- Full catalog of 15 assessment tests with evaluation criteria
- Exercise library mapped to specific movement limitations
- Training plan templates based on assessment results
- User progress tracking for exercises and tests
- Priority-based problem area classification (P1/P2)

**Business Value:**
- Enables AI-generated training plans based on assessment results
- Supports personalized exercise recommendations
- Allows progress tracking and analytics
- Foundation for tier-based plan complexity (Casual/Committed/Dedicated)

## What Changes

**Additions:**

1. **`movement-tests` table** — Catalog of 15 assessment tests
   - Test metadata (ID, name, description, body region, evaluation criteria)
   - **Detailed description** — Comprehensive test description from Part 1 document for user-facing pages
   - **Example video/GIF URL** — Short demonstration video showing correct execution technique for user reference
   - Scoring rules (pass/limited/significant thresholds)
   - MediaPipe requirements (pose landmarks, quality gates)
   - Test instructions and visual guides

2. **`exercises` table** — Exercise library for movement correction
   - Exercise metadata (ID, name, description, target area)
   - Difficulty levels and progressions
   - Instructions, cues, and modifications
   - MediaPipe validation (if applicable)

3. **`training-plan-templates` table** — Predefined plan structures
   - Template metadata (ID, name, tier, complexity)
   - Exercise sequences and schedules
   - Progression rules
   - Phase definitions (local improvement → integration → function)

4. **`user-exercise-progress` table** — User exercise completion tracking
   - Daily exercise logs
   - Completion status and notes
   - Progress metrics (reps, sets, duration, difficulty)
   - Streak tracking

5. **Enhanced `assessments` table** — Add detailed results structure
   - Problem areas with P1/P2 priorities
   - Detailed scoring per test component
   - Compensation patterns detected
   - Recommendations mapping

6. **`exercise-assessments-mapping` table** — Links exercises to assessment limitations
   - Maps exercises to specific test failures
   - Maps exercises to problem areas (P1/P2)
   - Exercise selection rules

**BREAKING:** None (all additions are new tables or additive fields)

## Impact

**Affected specs:**
- `assessment-tests` — ADDED test catalog requirements
- `exercises` — ADDED exercise library requirements
- `training-plans` — ADDED plan template requirements
- `user-progress` — ADDED progress tracking requirements

**Affected code:**
- `src/backend/db/models/Assessment.ts` — MODIFIED to include P1/P2 priorities and detailed results
- `src/backend/db/models/MovementTest.ts` — NEW model for test catalog (includes detailed description and example video)
- `src/backend/db/models/Exercise.ts` — NEW model for exercise library
- `src/backend/db/models/TrainingPlanTemplate.ts` — NEW model for plan templates
- `src/backend/db/models/UserExerciseProgress.ts` — NEW model for progress tracking
- `src/backend/db/models/ExerciseAssessmentMapping.ts` — NEW model for mappings
- `src/backend/db/config/database.ts` — ADDED table names and GSI definitions
- Migration files — NEW migrations for all tables
- Frontend: Test pages will display detailed descriptions and example videos from database

**Migration:**
- No data migration required (new tables)
- Existing `assessments` table: Add optional fields (backward compatible)
- Seed data: Populate `movement-tests` with 15 tests from Part 1
  - Include detailed descriptions from Part 1 document
  - Include example video/GIF URLs (to be created/provided)
- Seed data: Populate `exercises` and `training-plan-templates` from Part 2

**Risks:**
- **Low risk:** All changes are additive
- **Data consistency:** Need to ensure exercise-assessment mappings are comprehensive
- **Performance:** GSI usage for queries (test lookup, exercise lookup by problem area)
- **Seed data quality:** Comprehensive seed data required from documents

## Open Questions

- [x] Should exercises be stored as JSON documents (more flexible) or normalized tables (better queries)?
  - **Decision:** Normalized approach for better query performance
- [x] Do we need versioning for test catalog and exercise library?
  - **Decision:** Yes, for future updates without breaking existing assessments
- [x] How to handle exercise difficulty progressions (levels 1-3)?
  - **Decision:** Array field with progression steps
- [x] Should training plan templates be tier-specific (Casual/Committed/Dedicated)?
  - **Decision:** Yes, plan complexity varies by tier (from Part 2 document)
- [x] Should test pages show detailed descriptions and example videos?
  - **Decision:** Yes, detailed descriptions from Part 1 document and GIF/example videos for user reference before recording

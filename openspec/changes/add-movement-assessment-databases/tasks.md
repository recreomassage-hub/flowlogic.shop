# Implementation Tasks

## 1. Database Schema Design & Migrations

- [ ] 1.1 Create migration for `movement-tests` table
  - PK: `test_id` (N, 1-15)
  - Attributes: name, description, body_region, test_category, evaluation_criteria, scoring_rules, mediapipe_requirements, instructions
  - GSI: `body-region-index` (body_region)
  - GSI: `category-index` (test_category: "local" | "functional" | "balance")
  - KMS encryption enabled

- [ ] 1.2 Create migration for `exercises` table
  - PK: `exercise_id` (S, UUID)
  - Attributes: name, description, target_area, body_region, difficulty_levels (array), instructions, cues, modifications, duration_estimate, equipment_needed
  - GSI: `target-area-index` (target_area)
  - GSI: `body-region-index` (body_region)
  - KMS encryption enabled

- [ ] 1.3 Create migration for `training-plan-templates` table
  - PK: `template_id` (S, UUID)
  - SK: `phase` (S, "local" | "integration" | "function")
  - Attributes: name, tier, complexity, exercise_sequence (array), schedule, progression_rules, duration_weeks
  - GSI: `tier-index` (tier)
  - KMS encryption enabled

- [ ] 1.4 Create migration for `user-exercise-progress` table
  - PK: `user_id` (S)
  - SK: `progress_id` (S, UUID)
  - Attributes: exercise_id, completed_at, status, reps, sets, duration_seconds, difficulty_level, notes, date_key (YYYY-MM-DD)
  - GSI: `exercise-index` (exercise_id, completed_at)
  - GSI: `date-index` (date_key, user_id)
  - KMS encryption enabled

- [ ] 1.5 Create migration for `exercise-assessments-mapping` table
  - PK: `mapping_id` (S, UUID)
  - Attributes: exercise_id, test_id, problem_area, priority (P1 | P2), condition_type (restriction | weakness | compensation)
  - GSI: `exercise-index` (exercise_id)
  - GSI: `test-index` (test_id)
  - GSI: `problem-area-index` (problem_area, priority)
  - KMS encryption enabled

- [ ] 1.6 Modify `assessments` table migration (add fields)
  - ADD: `problem_areas` (array of objects: { area, priority: P1|P2, details })
  - ADD: `detailed_results` (object: { components, compensations, recommendations })
  - ADD: `test_version` (N, for future test catalog versioning)
  - Backward compatible (all new fields optional)

## 2. TypeScript Models & Interfaces

- [ ] 2.1 Create `src/backend/db/models/MovementTest.ts`
  - MovementTest interface
  - MovementTestModel class (CRUD operations)
  - Methods: getById, getByBodyRegion, getByCategory, getAll

- [ ] 2.2 Create `src/backend/db/models/Exercise.ts`
  - Exercise interface
  - ExerciseModel class (CRUD operations)
  - Methods: getById, getByTargetArea, getByBodyRegion, getByDifficulty

- [ ] 2.3 Create `src/backend/db/models/TrainingPlanTemplate.ts`
  - TrainingPlanTemplate interface
  - TrainingPlanTemplateModel class (CRUD operations)
  - Methods: getById, getByTier, getByComplexity

- [ ] 2.4 Create `src/backend/db/models/UserExerciseProgress.ts`
  - UserExerciseProgress interface
  - UserExerciseProgressModel class (CRUD operations)
  - Methods: create, getByUserId, getByExerciseId, getByDate, getStreak

- [ ] 2.5 Create `src/backend/db/models/ExerciseAssessmentMapping.ts`
  - ExerciseAssessmentMapping interface
  - ExerciseAssessmentMappingModel class (CRUD operations)
  - Methods: getByExerciseId, getByTestId, getByProblemArea, getRecommendedExercises

- [ ] 2.6 Update `src/backend/db/models/Assessment.ts`
  - ADD: problem_areas field to Assessment interface
  - ADD: detailed_results field to Assessment interface
  - ADD: test_version field to Assessment interface
  - Update methods to handle new fields

- [ ] 2.7 Update `src/backend/db/config/database.ts`
  - ADD: Table names constants (MOVEMENT_TESTS, EXERCISES, TRAINING_PLAN_TEMPLATES, USER_EXERCISE_PROGRESS, EXERCISE_ASSESSMENTS_MAPPING)
  - ADD: GSI definitions for all new tables

## 3. Seed Data Scripts

- [ ] 3.1 Create seed script for `movement-tests` (15 tests from Part 1)
  - Test 1: Ankle Mobility
  - Test 2: Glute Activation
  - Test 3: Hip Flexor Length
  - Test 4: Hip Rotation
  - Test 5: Thoracic Rotation
  - Test 6: Scapular Stability
  - Test 7: Shoulder Flexion
  - Test 8: Core Stability
  - Test 9: Lower Back Mobility vs Stability
  - Test 10: Overhead Squat (functional)
  - Test 11: Lunge (functional)
  - Test 12: Straight Leg Raise (functional)
  - Test 13: Shoulder Mobility Behind Back (functional)
  - Test 14: Single-Leg Balance (balance)
  - Test 15: Y-Balance (balance)
  - Include evaluation criteria, scoring rules, instructions
  - Include detailed_description from Part 1 document for each test
  - Include example_video_url field (placeholder URLs initially, to be replaced with actual video assets)

- [ ] 3.2 Create seed script for `exercises` (from Part 2)
  - Exercises mapped to specific limitations:
    - Ankle mobility exercises
    - Glute activation exercises
    - Hip flexor stretches
    - Core stability exercises
    - Upper back mobility exercises
    - Scapular stability exercises
    - Balance exercises
  - Include difficulty progressions (Level 1-3)
  - Include instructions, cues, modifications

- [ ] 3.3 Create seed script for `training-plan-templates` (from Part 2)
  - Templates for Casual tier (1 exercise/day, 1 focus area)
  - Templates for Committed tier (2-3 exercises/day, 2-3 focus areas)
  - Templates for Dedicated tier (3-4 exercises/day, comprehensive)
  - Include 3-phase structure: Local → Integration → Function

- [ ] 3.4 Create seed script for `exercise-assessments-mapping`
  - Map exercises to test failures
  - Map exercises to problem areas (P1/P2)
  - Include condition types (restriction, weakness, compensation)

- [ ] 3.5 Create example video assets (GIF/MP4) for all 15 tests
  - Record or source demonstration videos (5-10 seconds each)
  - Show correct execution technique
  - Optimize for web playback (GIF or MP4 format)
  - Upload to S3 or CDN
  - Update seed script with actual video URLs

## 4. Validation & Testing

- [ ] 4.1 Unit tests: MovementTestModel
  - Test CRUD operations
  - Test GSI queries (by body region, by category)

- [ ] 4.2 Unit tests: ExerciseModel
  - Test CRUD operations
  - Test GSI queries (by target area, by body region)

- [ ] 4.3 Unit tests: TrainingPlanTemplateModel
  - Test CRUD operations
  - Test GSI queries (by tier)

- [ ] 4.4 Unit tests: UserExerciseProgressModel
  - Test CRUD operations
  - Test streak calculation
  - Test date-based queries

- [ ] 4.5 Unit tests: ExerciseAssessmentMappingModel
  - Test mapping queries
  - Test recommendation logic

- [ ] 4.6 Unit tests: Updated AssessmentModel
  - Test new fields (problem_areas, detailed_results)
  - Test backward compatibility (existing assessments without new fields)

- [ ] 4.7 Integration tests: Seed data validation
  - Verify all 15 tests are seeded
  - Verify exercise mappings are complete
  - Verify plan templates are tier-appropriate

## 5. Documentation

- [ ] 5.1 Update database schema documentation
  - Document new tables
  - Document relationships between tables
  - Document GSI usage patterns

- [ ] 5.2 Update API documentation
  - Document new model interfaces
  - Document query patterns

- [ ] 5.3 Create seed data documentation
  - Document seed data structure
  - Document how to update seed data
  - Document versioning strategy

## 6. Deployment

- [ ] 6.1 Run migrations in staging
  - Verify table creation
  - Verify GSI creation
  - Verify KMS encryption

- [ ] 6.2 Run seed scripts in staging
  - Verify all test data is seeded
  - Verify exercise data is seeded
  - Verify mappings are correct

- [ ] 6.3 Verify backward compatibility
  - Existing assessments still work
  - Existing code still queries correctly

- [ ] 6.4 Deploy to production
  - Run migrations
  - Run seed scripts
  - Monitor for errors

## Dependencies

```
1.x (Migrations) → blocks 2.x (Models)
2.x (Models) → blocks 3.x (Seed Data)
{2.x, 3.x} → blocks 4.x (Testing)
{4.x} → blocks 5.x, 6.x (Docs & Deploy)
```

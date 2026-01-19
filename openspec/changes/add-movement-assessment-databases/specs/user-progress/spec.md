## ADDED Requirements

### Requirement: Exercise Progress Tracking

The system SHALL track user exercise completion including status, reps, sets, duration, and difficulty level.

**Rationale:** Enables progress monitoring, streak calculation, and plan adaptation based on user activity.

#### Scenario: Record exercise completion

- **GIVEN** user completes exercise "glute-bridge-activation-001"
- **WHEN** system records progress
- **THEN** system stores:
  - Exercise ID
  - Status: "completed"
  - Difficulty level: 2
  - Reps: 12
  - Sets: 3
  - Duration seconds: 180
  - Completed timestamp
- **AND** progress is linked to user ID and date

#### Scenario: Record exercise skip

- **GIVEN** user skips exercise "core-stability-dead-bug-001"
- **WHEN** system records progress
- **THEN** system stores:
  - Exercise ID
  - Status: "skipped"
  - Notes: optional reason
  - Completed timestamp
- **AND** skip is tracked for completion rate calculation

#### Scenario: Record partial exercise completion

- **GIVEN** user completes only 2 of 3 sets
- **WHEN** system records progress
- **THEN** system stores:
  - Status: "partial"
  - Actual reps/sets completed
  - Notes: "Stopped early due to fatigue"
- **AND** partial completion counts toward progress tracking

---

### Requirement: Progress Query by Date

The system SHALL enable querying user progress by date range for calendar views and analytics.

**Rationale:** Enables daily/weekly progress visualization and completion rate calculation.

#### Scenario: Query progress for specific date

- **GIVEN** user completed 3 exercises on 2025-01-15
- **WHEN** system queries progress for date "2025-01-15"
- **THEN** system returns all exercise progress records for that date
- **AND** results include exercise details and completion status

#### Scenario: Query progress for date range

- **GIVEN** user has progress records for past 7 days
- **WHEN** system queries progress for date range "2025-01-10" to "2025-01-16"
- **THEN** system returns all progress records in range
- **AND** results are ordered by date and time

#### Scenario: Calculate daily completion rate

- **GIVEN** user plan has 3 exercises for day
- **WHEN** system calculates completion rate for date
- **THEN** system counts completed vs planned exercises
- **AND** returns percentage (e.g., 2/3 = 67%)

---

### Requirement: Exercise Streak Calculation

The system SHALL calculate user exercise streaks based on daily completion rates following the streak rules (100% = +2, 70-99% = +1, <70% = +0).

**Rationale:** Enables streak-based gamification and motivation, following project requirements.

#### Scenario: Calculate streak for 100% completion

- **GIVEN** user completed all 3 exercises (100% completion)
- **WHEN** system calculates streak
- **THEN** streak increases by 2
- **AND** new streak value is stored

#### Scenario: Calculate streak for 70-99% completion

- **GIVEN** user completed 2 of 3 exercises (67% completion)
- **WHEN** system calculates streak
- **THEN** streak increases by 1
- **AND** new streak value is stored

#### Scenario: Calculate streak for <70% completion

- **GIVEN** user completed 1 of 3 exercises (33% completion)
- **WHEN** system calculates streak
- **THEN** streak increases by 0
- **AND** streak resets to 0 if previous day was also <70%

#### Scenario: Query current streak

- **GIVEN** user has completed exercises daily for 5 days
- **WHEN** system queries current streak
- **THEN** system returns streak count: 5
- **AND** result includes last completion date

---

### Requirement: Progress Query by Exercise

The system SHALL enable querying progress history for specific exercises to track improvement over time.

**Rationale:** Enables exercise-specific progress tracking and difficulty progression decisions.

#### Scenario: Query progress for specific exercise

- **GIVEN** user has completed "glute-bridge-activation-001" 10 times
- **WHEN** system queries progress by exercise ID
- **THEN** system returns all completion records for that exercise
- **AND** results are ordered by date (most recent first)

#### Scenario: Track difficulty progression

- **GIVEN** user started at difficulty level 1, progressed to level 2, then level 3
- **WHEN** system queries exercise progress
- **THEN** system shows progression timeline:
  - Week 1: Level 1 (all records)
  - Week 3: Level 2 (first record)
  - Week 5: Level 3 (first record)
- **AND** progression pattern is visible

---

### Requirement: Exercise-Assessment Mapping

The system SHALL maintain mappings between exercises and assessment limitations (test failures, problem areas, priorities).

**Rationale:** Enables automatic exercise recommendation based on assessment results and P1/P2 priorities.

#### Scenario: Query exercises for test failure

- **GIVEN** user failed test ID 1 (Ankle Mobility) with "limited" score
- **WHEN** system queries recommended exercises
- **THEN** system returns exercises mapped to test ID 1 with condition type "restriction"
- **AND** exercises target "ankle-mobility" problem area

#### Scenario: Query exercises for P1 problem area

- **GIVEN** user has P1 priority problem area "ankle-mobility"
- **WHEN** system queries recommended exercises
- **THEN** system returns exercises mapped to "ankle-mobility" with priority "P1"
- **AND** results prioritize P1 exercises over P2

#### Scenario: Query exercises for compensation pattern

- **GIVEN** user shows "knee-valgus" compensation in overhead squat
- **WHEN** system queries recommended exercises
- **THEN** system returns exercises mapped to condition type "compensation"
- **AND** exercises target root cause (ankle or glute issues)

---

### Requirement: Enhanced Assessment Results

The system SHALL store detailed assessment results including problem areas with P1/P2 priorities and compensation patterns.

**Rationale:** Enables comprehensive assessment interpretation and targeted exercise recommendations.

#### Scenario: Store assessment with problem areas

- **GIVEN** user completes test ID 1 (Ankle Mobility) with "limited" score
- **WHEN** system stores assessment result
- **THEN** system includes problem_areas array:
  - Area: "ankle-mobility"
  - Priority: "P1"
  - Details: { score: "limited", side: "right", measurement: "7cm" }
- **AND** problem area links to exercise recommendations

#### Scenario: Store assessment with compensation patterns

- **GIVEN** user completes test ID 10 (Overhead Squat) showing compensations
- **WHEN** system stores assessment result
- **THEN** system includes detailed_results.compensations:
  - Pattern: "knee-valgus"
  - Severity: "moderate"
  - Side: "left"
- **AND** compensations link to root cause exercises

#### Scenario: Store assessment recommendations

- **GIVEN** system identifies problem areas from assessment
- **WHEN** system stores assessment result
- **THEN** system includes detailed_results.recommendations:
  - Exercise ID: "calf-stretch-ankle-001"
  - Priority: "P1"
  - Reason: "Addresses ankle mobility limitation"
- **AND** recommendations are queryable for plan generation

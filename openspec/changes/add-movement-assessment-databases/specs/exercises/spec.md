## ADDED Requirements

### Requirement: Exercise Catalog

The system SHALL maintain a catalog of corrective exercises with metadata, instructions, and difficulty progressions.

**Rationale:** Provides structured exercise library for movement correction, enabling personalized exercise recommendations based on assessment results.

#### Scenario: Retrieve exercise by ID

- **GIVEN** exercise catalog contains exercise "calf-stretch-ankle-001"
- **WHEN** system queries exercise by ID
- **THEN** system returns exercise metadata including name, description, target area, body region, difficulty levels, and instructions
- **AND** equipment requirements are included

#### Scenario: Query exercises by target area

- **GIVEN** exercise catalog contains exercises targeting "ankle", "glutes", "hip-flexors", "core"
- **WHEN** system queries exercises by target area "ankle"
- **THEN** system returns all exercises targeting ankle mobility
- **AND** results can be filtered by difficulty level

#### Scenario: Query exercises by body region

- **GIVEN** exercise catalog contains exercises for "lower", "upper", "core" regions
- **WHEN** system queries exercises by body region "lower"
- **THEN** system returns all lower body exercises
- **AND** results include target area information

---

### Requirement: Exercise Difficulty Progressions

The system SHALL store multiple difficulty levels (1-3) for each exercise with progressive instructions, cues, and modifications.

**Rationale:** Enables adaptive exercise prescription based on user progress and capability.

#### Scenario: Retrieve exercise with difficulty progressions

- **GIVEN** exercise "glute-bridge-activation-001" exists with 3 difficulty levels
- **WHEN** system queries exercise
- **THEN** system returns array of difficulty levels:
  - Level 1: Basic bridge (instructions, cues, duration)
  - Level 2: Single-leg bridge (instructions, cues, duration)
  - Level 3: Bridge with resistance (instructions, cues, duration)
- **AND** each level includes modifications for common limitations

#### Scenario: Select appropriate difficulty level

- **GIVEN** user has completed Level 1 exercise for 2 weeks with 90% completion rate
- **WHEN** system determines next difficulty level
- **THEN** system recommends Level 2 progression
- **AND** progression includes clear upgrade criteria

---

### Requirement: Exercise Instructions and Cues

The system SHALL store detailed instructions, movement cues, and modification options for each exercise.

**Rationale:** Ensures users perform exercises correctly with proper form and progression.

#### Scenario: Retrieve exercise instructions

- **GIVEN** exercise "hip-flexor-stretch-001" exists
- **WHEN** system queries exercise instructions
- **THEN** system returns:
  - Step-by-step instructions (array)
  - Movement cues (array): ["Keep spine neutral", "Feel stretch in front of hip"]
  - Common modifications (array): ["Use wall for support", "Reduce range if needed"]
- **AND** instructions are formatted for sequential display

#### Scenario: Retrieve exercise with equipment requirements

- **GIVEN** exercise "calf-stretch-wall-001" exists
- **WHEN** system queries exercise
- **THEN** system returns equipment needed: ["wall"]
- **AND** system indicates if exercise requires no equipment

---

### Requirement: Exercise Duration and Volume Estimates

The system SHALL store estimated duration and volume (reps, sets) for each exercise difficulty level.

**Rationale:** Enables accurate plan time estimation and user expectations.

#### Scenario: Retrieve exercise duration estimate

- **GIVEN** exercise "core-stability-dead-bug-001" exists with difficulty levels
- **WHEN** system queries exercise
- **THEN** system returns duration estimate per level:
  - Level 1: 60 seconds
  - Level 2: 90 seconds
  - Level 3: 120 seconds
- **AND** estimates include setup time

#### Scenario: Calculate daily plan duration

- **GIVEN** user plan contains 3 exercises with known duration estimates
- **WHEN** system calculates total daily plan duration
- **THEN** system sums duration estimates for all exercises
- **AND** result includes buffer time for transitions

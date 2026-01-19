## ADDED Requirements

### Requirement: Training Plan Templates

The system SHALL maintain training plan templates organized by tier (Casual/Committed/Dedicated) with exercise sequences and progression rules.

**Rationale:** Enables consistent plan generation based on user tier and assessment results, following the Activity-Based tier system.

#### Scenario: Retrieve plan template by tier

- **GIVEN** plan templates exist for "casual", "committed", "dedicated" tiers
- **WHEN** system queries templates by tier "casual"
- **THEN** system returns all Casual tier templates
- **AND** templates include complexity: 1 exercise/day, 1 focus area, 5 minutes max

#### Scenario: Retrieve plan template phases

- **GIVEN** plan template "casual-ankle-focus-001" exists with 3 phases
- **WHEN** system queries template by ID
- **THEN** system returns all phases:
  - Phase "local": Local improvement exercises
  - Phase "integration": Integration exercises
  - Phase "function": Functional movement exercises
- **AND** each phase includes exercise sequence

---

### Requirement: Plan Template Complexity by Tier

The system SHALL store tier-specific complexity parameters including exercises per day, focus areas, and duration.

**Rationale:** Ensures plans match user activity level (30-50% completion = Casual, 60-80% = Committed, 80%+ = Dedicated).

#### Scenario: Retrieve Casual tier template complexity

- **GIVEN** Casual tier template exists
- **WHEN** system queries template complexity
- **THEN** system returns:
  - Exercises per day: 1
  - Focus areas: 1
  - Duration minutes: 5
- **AND** complexity matches 30-50% completion rate users

#### Scenario: Retrieve Committed tier template complexity

- **GIVEN** Committed tier template exists
- **WHEN** system queries template complexity
- **THEN** system returns:
  - Exercises per day: 2-3
  - Focus areas: 2-3
  - Duration minutes: 10-15
- **AND** complexity matches 60-80% completion rate users

#### Scenario: Retrieve Dedicated tier template complexity

- **GIVEN** Dedicated tier template exists
- **WHEN** system queries template complexity
- **THEN** system returns:
  - Exercises per day: 3-4
  - Focus areas: comprehensive
  - Duration minutes: 15-20
- **AND** complexity matches 80%+ completion rate users

---

### Requirement: Exercise Sequence in Templates

The system SHALL store ordered exercise sequences with frequency rules (daily, alternate, weekly) for each template phase.

**Rationale:** Enables structured daily plans with appropriate exercise progression.

#### Scenario: Retrieve exercise sequence for template phase

- **GIVEN** template "casual-ankle-focus-001" phase "local" exists
- **WHEN** system queries exercise sequence
- **THEN** system returns ordered array:
  - Exercise 1: "calf-stretch-ankle-001" (daily, difficulty 1)
  - Exercise 2: "ankle-mobility-wall-001" (daily, difficulty 1)
- **AND** sequence includes frequency and difficulty level per exercise

#### Scenario: Generate daily plan from template

- **GIVEN** user assigned Casual tier template with daily exercises
- **WHEN** system generates daily plan
- **THEN** system selects exercises marked "daily" from current phase
- **AND** exercises use appropriate difficulty level based on user progress

---

### Requirement: Plan Progression Rules

The system SHALL store progression and regression rules for templates including upgrade/downgrade conditions.

**Rationale:** Enables automatic plan adaptation based on user completion rate and activity level.

#### Scenario: Retrieve progression rules

- **GIVEN** template "committed-full-body-001" exists
- **WHEN** system queries progression rules
- **THEN** system returns:
  - Upgrade condition: "70%+ completion for 2 consecutive weeks"
  - Downgrade condition: "<40% completion for 2 consecutive weeks"
- **AND** rules specify tier transition triggers

#### Scenario: Apply progression rule

- **GIVEN** user on Casual tier with 75% completion rate for 2 weeks
- **WHEN** system evaluates progression
- **THEN** system recommends upgrade to Committed tier
- **AND** new template is assigned with higher complexity

---

### Requirement: Plan Duration and Schedule

The system SHALL store plan duration (weeks) and progression schedule (when to increase difficulty) for each template.

**Rationale:** Enables structured plan progression over time with clear milestones.

#### Scenario: Retrieve plan schedule

- **GIVEN** template "casual-ankle-focus-001" exists
- **WHEN** system queries schedule
- **THEN** system returns:
  - Duration weeks: 4
  - Progression weeks: [2, 4]
- **AND** schedule indicates when difficulty increases

#### Scenario: Determine current plan phase

- **GIVEN** user started plan 3 weeks ago
- **WHEN** system determines current phase
- **THEN** system calculates phase based on duration and progression schedule
- **AND** exercises match current phase requirements

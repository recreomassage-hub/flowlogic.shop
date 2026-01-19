## ADDED Requirements

### Requirement: Movement Test Catalog

The system SHALL maintain a catalog of assessment tests with metadata, evaluation criteria, and scoring rules.

**Rationale:** Provides structured test definitions for the 15-assessment test system, enabling consistent evaluation and scoring.

#### Scenario: Retrieve test catalog entry

- **GIVEN** test catalog contains test ID 1 (Ankle Mobility)
- **WHEN** system queries test by ID
- **THEN** system returns test metadata including name, description, body region, evaluation criteria, and scoring rules
- **AND** MediaPipe requirements are included

#### Scenario: Query tests by body region

- **GIVEN** test catalog contains tests for "lower", "upper", "core", and "balance" regions
- **WHEN** system queries tests by body region "lower"
- **THEN** system returns all tests in lower body region
- **AND** results include test IDs 1, 2, 3, 4, 10, 11, 12, 14, 15

#### Scenario: Query tests by category

- **GIVEN** test catalog contains tests categorized as "local", "functional", and "balance"
- **WHEN** system queries tests by category "functional"
- **THEN** system returns all functional movement tests
- **AND** results include test IDs 10, 11, 12, 13

#### Scenario: Test catalog versioning

- **GIVEN** test catalog has version 1
- **WHEN** test definitions are updated
- **THEN** version is incremented
- **AND** assessments can reference specific test version

---

### Requirement: Test Evaluation Criteria

The system SHALL store evaluation criteria for each test defining "good", "limited", and "significant" result thresholds.

**Rationale:** Enables consistent scoring and interpretation of test results across all assessments.

#### Scenario: Retrieve evaluation criteria for ankle mobility test

- **GIVEN** test ID 1 (Ankle Mobility) exists in catalog
- **WHEN** system queries test evaluation criteria
- **THEN** system returns thresholds:
  - Good: ≥10 cm distance (knee touches wall)
  - Limited: 5-10 cm distance (knee doesn't reach wall)
  - Significant: <5 cm distance
- **AND** criteria includes measurement units ("cm")

#### Scenario: Retrieve evaluation criteria for balance test

- **GIVEN** test ID 14 (Single-Leg Balance) exists in catalog
- **WHEN** system queries test evaluation criteria
- **THEN** system returns thresholds:
  - Good: ≥30 seconds stable
  - Limited: 10-30 seconds with slight instability
  - Significant: <10 seconds or multiple touches
- **AND** criteria includes time units ("seconds")

---

### Requirement: MediaPipe Requirements per Test

The system SHALL store MediaPipe pose estimation requirements for each test, including required landmarks and quality gates.

**Rationale:** Ensures consistent video quality validation and pose tracking requirements across tests.

#### Scenario: Retrieve MediaPipe requirements for overhead squat test

- **GIVEN** test ID 10 (Overhead Squat) exists in catalog
- **WHEN** system queries MediaPipe requirements
- **THEN** system returns:
  - Required landmarks: all 33 pose landmarks
  - Minimum confidence: 0.8
  - Minimum frames: 80% of video
  - Camera angle: front, side, rear (all views needed)
- **AND** requirements specify full-body pose tracking

#### Scenario: Retrieve MediaPipe requirements for neck flexion test

- **GIVEN** test ID 1 (Neck Flexion/Extension) exists in catalog
- **WHEN** system queries MediaPipe requirements
- **THEN** system returns:
  - Required landmarks: face mesh landmarks for neck/chin
  - Minimum confidence: 0.75
  - Camera angle: front or side
- **AND** requirements specify face mesh usage

---

### Requirement: Test Instructions Storage

The system SHALL store step-by-step instructions for each test including setup, execution, and observation points.

**Rationale:** Enables consistent test administration and user guidance.

#### Scenario: Retrieve instructions for ankle mobility test

- **GIVEN** test ID 1 (Ankle Mobility) exists in catalog
- **WHEN** system queries test instructions
- **THEN** system returns:
  - Setup: ["Stand facing wall", "Place toe 10cm from wall"]
  - Execution: ["Bend knee forward", "Try to touch wall", "Keep heel on floor"]
  - Observation points: ["Measure distance", "Check heel lift", "Note side differences"]
- **AND** instructions are in array format for sequential display

---

### Requirement: Detailed Test Description for User Pages

The system SHALL store comprehensive test descriptions based on Part 1 document content for display on test execution pages.

**Rationale:** Users need detailed understanding of what the test measures, why it's important, and what to expect before recording their video.

#### Scenario: Retrieve detailed description for test page

- **GIVEN** test ID 1 (Ankle Mobility) exists in catalog
- **WHEN** system queries test for user-facing page
- **THEN** system returns detailed_description field containing:
  - Purpose: "Why this test is important" (e.g., "Ankle mobility limitation affects squat quality, lunges, and can cause knee discomfort")
  - Full description from Part 1 document
  - Possible causes of limitations
  - What the test evaluates
- **AND** description is formatted for display on test execution page

#### Scenario: Display detailed description on test page

- **GIVEN** user navigates to test execution page for test ID 10 (Overhead Squat)
- **WHEN** page loads
- **THEN** page displays comprehensive description from detailed_description field
- **AND** description explains test purpose, importance, and evaluation criteria
- **AND** description helps user understand what they need to demonstrate

---

### Requirement: Example Video/GIF for Test Reference

The system SHALL store example video or GIF URLs demonstrating correct test execution technique for user reference before recording.

**Rationale:** Users need visual reference to understand proper execution technique and compare their own video before uploading to MediaPipe.

#### Scenario: Retrieve example video URL for test

- **GIVEN** test ID 10 (Overhead Squat) exists in catalog
- **WHEN** system queries test
- **THEN** system returns example_video_url field with:
  - URL to short GIF/video (5-10 seconds)
  - Shows correct execution technique
  - Demonstrates proper form for comparison
- **AND** video format is suitable for web playback (GIF, MP4, or WebM)

#### Scenario: Display example video on test page

- **GIVEN** user navigates to test execution page
- **WHEN** page loads
- **THEN** page displays example video/GIF prominently
- **AND** video shows correct execution technique
- **AND** user can compare their recorded video against example before submission
- **AND** video helps user understand expected camera angle and framing

#### Scenario: Example video before MediaPipe upload

- **GIVEN** user views test page with example video
- **WHEN** user records their own video
- **THEN** user can preview their recording and compare to example
- **AND** example video helps ensure proper camera setup and body positioning
- **AND** user understands expected movement pattern before upload

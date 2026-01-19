# Design: Movement Assessment Databases

## Context

**Background:**
- System needs comprehensive database structures to support Movement Quality Assessment System
- Two documents provide requirements:
  - **Part 1:** 15 assessment tests with detailed evaluation criteria
  - **Part 2:** Exercise library and training plan templates for movement correction
- Current `assessments` table exists but lacks detailed structure for problem areas, priorities, and exercise recommendations

**Constraints:**
- Must use DynamoDB (existing infrastructure)
- Must maintain backward compatibility with existing `assessments` table
- KMS encryption required for all tables
- Must support tier-based plan complexity (Casual/Committed/Dedicated)
- Must support P1/P2 priority classification for problem areas

**Stakeholders:**
- Backend team: Database schema design and migrations
- Frontend team: API interfaces for exercise/plan data
- PM: Plan template structure and tier mapping

## Goals / Non-Goals

**Goals:**
- Support full 15-test catalog with evaluation criteria
- Enable exercise library with difficulty progressions
- Support training plan templates by tier
- Track user exercise progress with streak calculation
- Map exercises to assessment limitations (P1/P2 priorities)

**Non-Goals:**
- Real-time exercise video validation (future feature)
- Exercise video storage (future feature)
- AI exercise generation (uses templates from Part 2)
- Multi-language support for exercises (MVP: English only)

## Technical Decisions

### Decision 1: Normalized Tables vs JSON Documents

**Choice:** Normalized DynamoDB tables with GSI

**Alternatives considered:**
- JSON documents (single table with nested structures) — too complex for queries
- Separate tables per test/exercise type — too many tables
- Hybrid approach — inconsistent patterns

**Rationale:**
- Normalized tables allow efficient queries (GSI on body_region, target_area, tier)
- DynamoDB GSI provides good query performance
- Easier to update individual exercises/tests without touching entire documents
- Better for future features (search, filtering, analytics)

### Decision 2: Problem Area Priority Storage

**Choice:** Array of objects in `assessments` table with P1/P2 priorities

**Alternatives:**
- Separate `problem-areas` table — unnecessary normalization
- String field with comma-separated priorities — not queryable
- Separate fields for P1 and P2 — rigid structure

**Rationale:**
- Array allows multiple problem areas per assessment
- Priority field enables filtering (GSI on `problem-area-index`)
- Flexible structure for future additions (severity, confidence)

### Decision 3: Exercise Difficulty Progressions

**Choice:** Array field `difficulty_levels` with progression steps

**Alternatives:**
- Separate table for progressions — over-normalization
- String field with JSON — not queryable
- Separate exercise records per level — data duplication

**Rationale:**
- Array allows querying by difficulty level
- Single exercise record with multiple progressions
- Easy to add new progression levels

### Decision 4: Training Plan Template Structure

**Choice:** Separate table with phase as Sort Key

**Alternatives:**
- Single JSON document per template — not queryable by phase
- Separate table per phase — too many tables
- Embedded phases in single record — complex queries

**Rationale:**
- Phase as SK enables querying specific phases
- Template ID as PK enables full template retrieval
- GSI on tier enables tier-based queries

### Decision 5: Exercise-Assessment Mapping

**Choice:** Separate mapping table with multiple GSI

**Alternatives:**
- Embedded mappings in exercise records — not queryable by assessment
- Embedded mappings in assessment records — data duplication
- No mappings (calculate at runtime) — performance impact

**Rationale:**
- Separate table enables bidirectional queries (exercises → assessments, assessments → exercises)
- Multiple GSI enable efficient recommendation queries
- Centralized mapping logic (easier to update)

## Data Model

### Table: `movement-tests`

**Purpose:** Catalog of 15 assessment tests

**Schema:**
```typescript
{
  test_id: number;              // PK, 1-15
  name: string;                 // "Ankle Mobility", "Overhead Squat"
  description: string;
  body_region: string;          // "lower", "upper", "core", "balance"
  test_category: string;        // "local", "functional", "balance"
  evaluation_criteria: {
    good: string;               // Criteria for "pass"
    limited: string;            // Criteria for "limited"
    significant: string;        // Criteria for "significant"
  };
  scoring_rules: {
    thresholds: {
      pass: number | string;    // Threshold for pass
      limited: number | string; // Threshold for limited
      significant: number | string; // Threshold for significant
    };
    units?: string;             // "cm", "degrees", "seconds"
  };
  mediapipe_requirements: {
    landmarks: string[];        // Required MediaPipe landmarks
    quality_gates: {
      min_confidence: number;
      min_frames: number;
      camera_angle: "front" | "side" | "rear";
    };
  };
  instructions: {
    setup: string[];
    execution: string[];
    observation_points: string[];
  };
  detailed_description: string; // Comprehensive description from Part 1 document for user-facing pages
  example_video_url: string;    // URL to GIF/video demonstrating correct execution (5-10 seconds)
  version: number;              // For future versioning
  created_at: string;
  updated_at: string;
}
```

**GSI:**
- `body-region-index`: body_region (HASH)
- `category-index`: test_category (HASH)

### Table: `exercises`

**Purpose:** Exercise library for movement correction

**Schema:**
```typescript
{
  exercise_id: string;          // PK, UUID
  name: string;                 // "Calf Stretch", "Glute Bridge"
  description: string;
  target_area: string;          // "ankle", "glutes", "hip-flexors", "core"
  body_region: string;          // "lower", "upper", "core"
  difficulty_levels: Array<{
    level: number;              // 1, 2, 3
    name: string;               // "Beginner", "Intermediate", "Advanced"
    instructions: string[];
    cues: string[];
    modifications?: string[];
    duration_seconds?: number;
    reps?: number;
    sets?: number;
  }>;
  equipment_needed: string[];   // ["none", "wall", "mat"]
  duration_estimate_seconds: number;
  created_at: string;
  updated_at: string;
}
```

**GSI:**
- `target-area-index`: target_area (HASH)
- `body-region-index`: body_region (HASH)

### Table: `training-plan-templates`

**Purpose:** Predefined training plan structures

**Schema:**
```typescript
{
  template_id: string;          // PK, UUID
  phase: string;                // SK, "local" | "integration" | "function"
  name: string;                 // "Casual Ankle Focus", "Committed Full Body"
  tier: string;                 // "casual" | "committed" | "dedicated"
  complexity: {
    exercises_per_day: number;  // 1-4
    focus_areas: number;        // 1-4
    duration_minutes: number;   // 5-20
  };
  exercise_sequence: Array<{
    exercise_id: string;
    difficulty_level: number;
    order: number;
    frequency: "daily" | "alternate" | "weekly";
  }>;
  schedule: {
    duration_weeks: number;
    progression_weeks: number[]; // Weeks to increase difficulty
  };
  progression_rules: {
    upgrade_condition: string;  // "70% completion", "2 weeks stable"
    downgrade_condition: string; // "<40% completion"
  };
  created_at: string;
  updated_at: string;
}
```

**GSI:**
- `tier-index`: tier (HASH), phase (RANGE)

### Table: `user-exercise-progress`

**Purpose:** User exercise completion tracking

**Schema:**
```typescript
{
  user_id: string;              // PK
  progress_id: string;          // SK, UUID
  exercise_id: string;
  completed_at: string;         // ISO timestamp
  status: "completed" | "skipped" | "partial";
  reps?: number;
  sets?: number;
  duration_seconds?: number;
  difficulty_level: number;     // 1-3
  notes?: string;
  date_key: string;             // "YYYY-MM-DD" for daily queries
  created_at: string;
}
```

**GSI:**
- `exercise-index`: exercise_id (HASH), completed_at (RANGE)
- `date-index`: date_key (HASH), user_id (RANGE)

### Table: `exercise-assessments-mapping`

**Purpose:** Links exercises to assessment limitations

**Schema:**
```typescript
{
  mapping_id: string;           // PK, UUID
  exercise_id: string;
  test_id: number;              // 1-15
  problem_area: string;         // "ankle-mobility", "glute-activation"
  priority: "P1" | "P2";
  condition_type: "restriction" | "weakness" | "compensation";
  condition_details?: {
    score: "limited" | "significant";
    side?: "left" | "right" | "both";
    threshold?: number | string;
  };
  created_at: string;
}
```

**GSI:**
- `exercise-index`: exercise_id (HASH)
- `test-index`: test_id (HASH)
- `problem-area-index`: problem_area (HASH), priority (RANGE)

### Enhanced: `assessments` table

**New Fields:**
```typescript
{
  // ... existing fields ...
  problem_areas?: Array<{
    area: string;               // "ankle-mobility", "glute-activation"
    priority: "P1" | "P2";
    details: {
      score: "limited" | "significant";
      side?: "left" | "right" | "both";
      measurement?: number | string;
    };
  }>;
  detailed_results?: {
    components: Record<string, any>; // Test-specific component scores
    compensations: Array<{
      pattern: string;          // "knee-valgus", "heel-lift"
      severity: "mild" | "moderate" | "severe";
    }>;
    recommendations: Array<{
      exercise_id: string;
      priority: "P1" | "P2";
      reason: string;
    }>;
  };
  test_version?: number;        // Links to movement-tests version
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Assessment Flow                       │
└─────────────────────────────────────────────────────────┘

1. User completes test
   └─> assessments table (enhanced with problem_areas)

2. System identifies problem areas (P1/P2)
   └─> Query exercise-assessments-mapping by problem_area
       └─> Get recommended exercises

3. System selects training plan template
   └─> Query training-plan-templates by tier
       └─> Get exercise sequence

4. User completes exercises
   └─> user-exercise-progress table
       └─> Track completion, streaks, progress

5. System generates recommendations
   └─> Query exercise-assessments-mapping by test_id
       └─> Get exercises for specific test limitations
```

## Relationships

**movement-tests ↔ assessments:**
- One-to-many (one test can have many assessments)
- Linked by `test_id` in assessments

**exercises ↔ user-exercise-progress:**
- One-to-many (one exercise can have many progress records)
- Linked by `exercise_id` in progress

**exercises ↔ exercise-assessments-mapping:**
- One-to-many (one exercise can map to multiple assessments)
- Linked by `exercise_id` in mapping

**movement-tests ↔ exercise-assessments-mapping:**
- One-to-many (one test can map to multiple exercises)
- Linked by `test_id` in mapping

**training-plan-templates ↔ exercises:**
- Many-to-many (via exercise_sequence array)
- Templates reference exercises by ID

## Security Considerations

**Encryption:**
- All tables use KMS encryption at rest
- PII in user-exercise-progress (user_id) encrypted
- Exercise instructions may contain personal notes (encrypted)

**Access Control:**
- Read access: Authenticated users can read exercises/tests
- Write access: Admin only for test/exercise catalog updates
- User progress: Users can only read/write their own progress

**Compliance:**
- GDPR: User progress is user data (right to erasure)
- Wellness disclaimer: No medical data stored

## Performance

**Query Patterns:**
- Get test by ID: Single GetItem (PK lookup) — <10ms
- Get exercises by problem area: GSI query — <50ms
- Get user progress by date: GSI query — <50ms
- Get plan template by tier: GSI query — <50ms

**Load Estimates:**
- 1000 users × 15 tests = 15,000 assessments (small)
- 1000 users × 30 exercises/month = 30,000 progress records/month (medium)
- Seed data: 15 tests + 50 exercises + 10 templates = 75 items (tiny)

**GSI Capacity:**
- All GSI use on-demand billing (auto-scaling)
- Estimated read units: <100 RCU total
- Estimated write units: <50 WCU total

## Migration Plan

### Phase 1: Create New Tables (Week 1)
```
1. Run migrations for all new tables
2. Verify table creation and GSI
3. Verify KMS encryption
```

### Phase 2: Seed Data (Week 1)
```
1. Seed movement-tests (15 tests)
2. Seed exercises (50+ exercises from Part 2)
3. Seed training-plan-templates (10 templates)
4. Seed exercise-assessments-mapping
```

### Phase 3: Update Existing Table (Week 2)
```
1. Add new fields to assessments table (backward compatible)
2. Verify existing assessments still work
3. Test new fields with sample data
```

### Phase 4: Deploy Models (Week 2)
```
1. Deploy TypeScript models
2. Update API endpoints
3. Test integration
```

### Phase 5: Production Deployment (Week 3)
```
1. Run migrations in production
2. Run seed scripts
3. Monitor for errors
4. Verify backward compatibility
```

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Seed data incomplete | Medium | High | Comprehensive review of Part 1 & Part 2 documents |
| GSI query performance | Low | Medium | Monitor CloudWatch metrics, adjust if needed |
| Backward compatibility issues | Low | High | Comprehensive testing of existing assessments |
| Exercise mapping gaps | Medium | Medium | Review mappings against all 15 tests |

**Trade-offs:**
- ✅ Normalized tables → ❌ More complex queries (but better performance)
- ✅ Separate mapping table → ❌ Extra query step (but flexible)
- ✅ Array fields for progressions → ❌ Less queryable (but simpler structure)

## Open Questions

- [ ] **Q:** Should we version the test catalog (for future test updates)?
  - **A:** Yes, include `version` field in `movement-tests`, reference in `assessments.test_version`

- [ ] **Q:** Do we need audit logs for exercise/exercise plan updates?
  - **A:** Not for MVP, add in v2 if needed

- [ ] **Q:** Should exercises have video URLs (for future)?
  - **A:** Add optional `video_url` field for future use

# Operations Spec: Enhanced Bug System - Phase 1

## Overview

This spec describes the Phase 1 enhancements to the existing bug finding and fixing system:
- OpenSpec integration for bug discovery
- Solution Rate metric tracking
- Confidence Score for bug fixes

## 1. OpenSpec Integration

### 1.1 OpenSpec Rules Parser

**Purpose:** Extract rules and metadata from OpenSpec project.md and specs for use by Bug Hunter.

**Implementation:**
- Script: `scripts/openspec-rules-parser.sh`
- Output: JSON structure with rules and metadata
- Cache: `.openspec-rules-cache.json` (1 hour TTL)

**Rules Extracted:**
- Code style rules from `openspec/project.md`
- Architecture patterns from `openspec/project.md`
- Metadata (x-reliability, x-critical-path) from `openspec/changes/*/specs/**/*.md`

**Usage:**
```bash
./scripts/openspec-rules-parser.sh [--cache-file PATH] [--force-refresh]
```

### 1.2 Bug Hunter Integration

**Purpose:** Check for OpenSpec rule violations during bug discovery.

**Workflow:**
1. Run OpenSpec rules parser
2. Check codebase against parsed rules
3. Identify violations
4. Adjust priority based on metadata:
   - `x-reliability: high` → +1 priority level
   - `x-critical-path: true` → +1 priority level

**Output Format:**
```
[OPENSPEC] [RULE_NAME] in [FILE]:[LINE] - [VIOLATION]
```

**Priority Adjustment:**
- Base severity: CRITICAL/HIGH/MEDIUM/LOW
- With `x-reliability: high`: +1 level (e.g., MEDIUM → HIGH)
- With `x-critical-path: true`: +1 level
- Final priority: min(adjusted, CRITICAL)

### 1.3 Beads Issue Format

**New Fields:**
```json
{
  "openspec_violation": {
    "rule": "code-style-typescript",
    "file": "src/backend/api/users.ts",
    "line": 42,
    "metadata": {
      "x-reliability": "high",
      "x-critical-path": true
    }
  }
}
```

## 2. Solution Rate Metric

### 2.1 Definition

**Solution Rate** = `total_fixed / total_reported * 100`

**Purpose:** Measure effectiveness of bug fixing process. Protects against alert fatigue.

**Target Values:**
- Solution Rate: ≥ 70%
- False Positive Rate: < 20%

### 2.2 Beads Issue Schema Extension

**New Fields:**
```json
{
  "solution_status": "pending" | "fixed" | "invalid" | "wont_fix",
  "solution_rate_context": {
    "total_reported": 100,
    "total_fixed": 70,
    "total_invalid": 15,
    "last_calculated": "2026-01-15T10:00:00Z"
  }
}
```

### 2.3 Tracking

**Bug Hunter:**
- On issue creation: `solution_status: "pending"`
- Increment `total_reported`

**Bug Fixer:**
- On fix: `solution_status: "fixed"`
- Increment `total_fixed`
- On false positive: `solution_status: "invalid"`
- Increment `total_invalid`

### 2.4 Calculation Script

**Script:** `scripts/calculate-solution-rate.sh`

**Usage:**
```bash
./scripts/calculate-solution-rate.sh [--output-format json|markdown]
```

**Output:**
- Total reported bugs
- Total fixed bugs
- Total invalid (false positives)
- Solution Rate percentage
- False Positive Rate percentage

### 2.5 Alerts

**Thresholds:**
- Solution Rate < 60%: Alert (action required)
- Solution Rate 60-70%: Warning (below target)
- False Positive Rate > 30%: Alert (calibration needed)

**Integration:**
- GitHub Actions workflow (nightly)
- Dashboard: `docs/metrics/solution-rate-dashboard.md`

## 3. Confidence Score

### 3.1 Definition

**Confidence Score** = weighted sum of quality indicators (0.0-1.0)

**Purpose:** Objective assessment of fix quality. Basis for automation decisions.

### 3.2 Components

| Component | Weight | Scoring |
|-----------|--------|---------|
| Root Cause Clarity | 0.3 | Clearly: 1.0, Partially: 0.5, Not: 0.0 |
| Pattern Match | 0.2 | Known: 1.0, Similar: 0.7, New: 0.3 |
| Test Coverage | 0.2 | Unit+Integration: 1.0, Unit: 0.7, None: 0.3 |
| Code Quality | 0.2 | Meets: 1.0, Partial: 0.6, Doesn't: 0.2 |
| Regression Risk | 0.1 | Low: 1.0, Medium: 0.5, High: 0.0 |

**Formula:**
```
confidence_score = sum(weight_i * score_i)
```

### 3.3 Decision Logic

| Confidence | Action |
|------------|--------|
| > 0.9 | Can recommend autofix (Phase 2) |
| 0.7-0.9 | Requires review |
| < 0.7 | Requires detailed analysis |

### 3.4 Beads Issue Format

**New Fields:**
```json
{
  "confidence_score": 0.85,
  "confidence_reasoning": [
    "Root cause clearly identified (1.0)",
    "Matches known pattern (1.0)",
    "Has unit tests (0.7)",
    "Code meets standards (1.0)",
    "Low regression risk (1.0)"
  ]
}
```

## 4. Integration Points

### 4.1 Bug Hunter Workflow

1. Static Analysis (ESLint, TypeScript)
2. Test Analysis
3. **OpenSpec Rules Checking** (NEW)
4. Summary with adjusted priorities

### 4.2 Bug Fixer Workflow

1. Root Cause Analysis
2. Pattern Analysis
3. Fix Strategy
4. **Confidence Score Calculation** (NEW)
5. Quality Gates
6. **Solution Status Update** (NEW)

### 4.3 Beads Integration

- Issue creation: `solution_status: "pending"`
- Issue update: `solution_status`, `confidence_score`
- Issue closure: `solution_status: "fixed"`

## 5. Monitoring

### 5.1 Metrics Dashboard

**Location:** `docs/metrics/solution-rate-dashboard.md`

**Metrics:**
- Solution Rate (target: ≥ 70%)
- False Positive Rate (target: < 20%)
- Confidence Score distribution
- OpenSpec violations by rule

### 5.2 Alerts

**GitHub Actions:**
- Nightly calculation of Solution Rate
- Alert if Solution Rate < 60%
- Alert if False Positive Rate > 30%

## 6. Success Criteria

**Phase 1 is successful if:**
- ✅ Bug Hunter checks OpenSpec rules and uses metadata for triage
- ✅ Solution Rate metric is tracked and visualized
- ✅ Confidence Score is calculated and logged in Beads issues
- ✅ False positive rate < 20% for OpenSpec rules
- ✅ Solution Rate > 60% within 2 weeks of deployment

## 7. Future Enhancements (Phase 2)

- Autofix for low severity bugs (confidence > 0.9)
- Beads recording for bug reproduction
- Pre-commit hooks for OpenSpec rule checking
- IDE extension for real-time checking

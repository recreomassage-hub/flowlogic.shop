# Systematic Debugging v2: Long-term Solutions Focus

**Version:** 2.0  
**Date:** 2026-01-14  
**Purpose:** Enhanced methodology focusing on long-term robust solutions

## Overview

This is an enhanced version of systematic debugging that emphasizes long-term robust solutions over quick fixes. It integrates with OpenSpec for architectural changes and Beads for comprehensive tracking.

## 7-Phase Methodology

### Phase 1: Root Cause Analysis

**Same as v1:**
- Reproduce bug
- Trace data flow
- Identify root cause (not symptom)

**Enhanced:**
- Document systemic factors that contribute to the problem
- Identify architectural patterns that enable the bug

### Phase 2: Pattern Analysis

**Same as v1:**
- Determine if bug is isolated or systemic
- Search for similar bugs

**Enhanced:**
- Analyze architectural patterns that contribute to the problem
- Identify design patterns that could prevent similar issues

### Phase 3: Fix Strategy (Enhanced)

**Decision Rules:**

1. **If `isolated` AND `fix_attempts < 3` AND `not_critical`:**
   - Strategy: `hybrid_approach`
   - Apply quick fix immediately
   - Create OpenSpec proposal for robust solution
   - Plan migration timeline (1-4 weeks)

2. **If `isolated` AND `fix_attempts < 3` AND `critical_production`:**
   - Strategy: `quick_fix_first_then_robust`
   - Apply quick fix for immediate recovery
   - Create OpenSpec proposal for robust solution
   - Schedule robust solution (1-2 weeks)

3. **If `systemic` OR `fix_attempts >= 3`:**
   - Strategy: `robust_solution_only`
   - **STOP** applying quick fixes
   - Create OpenSpec proposal immediately
   - Implement robust solution

4. **If `architectural_debt_indicator`:**
   - Strategy: `architectural_refactor`
   - Create OpenSpec proposal for architectural change
   - Include in next sprint planning

**Output:**
- Fix strategy: `quick_fix` | `robust_solution` | `hybrid_approach` | `architectural_refactor`
- Quick fix code (if applicable)
- OpenSpec proposal for robust solution (always for robust/architectural)

### Phase 4: Quick Fix Implementation (if applicable)

**When to apply:**
- Critical production issues requiring immediate recovery
- Hybrid approach (quick fix + robust solution plan)

**Requirements:**
- Minimal changes
- Document limitations
- Link to robust solution plan
- Set expiration date for quick fix (max 30 days)

**Output:**
- Quick fix code applied
- Limitations documented
- Link to OpenSpec proposal for robust solution

### Phase 5: Robust Solution Design

**Always required for:**
- Systemic bugs
- Architectural issues
- Bugs requiring 3+ fix attempts
- Hybrid approach (planned robust solution)

**Components:**

1. **Architecture Design:**
   - Long-term solution architecture
   - Design patterns to use
   - Integration points

2. **OpenSpec Proposal:**
   - Detailed proposal following OpenSpec format
   - Impact analysis
   - Migration plan

3. **Implementation Plan:**
   - Short-term steps (1-2 weeks)
   - Medium-term steps (1-2 months)
   - Long-term steps (3-6 months)

4. **Success Metrics:**
   - Metrics for robust solution
   - Criteria for migration completion
   - KPIs for long-term success

**Output:**
- OpenSpec proposal created
- Implementation roadmap
- Success metrics defined

### Phase 6: Enhanced Quality Gates

**Comprehensive Checklist:**

#### Gate 1: Implementation Correctness
- [ ] Quick fix correctly implemented (if applicable)
- [ ] Robust solution designed
- [ ] OpenSpec proposal created (if required)
- [ ] Code follows project standards

#### Gate 2: Security
- [ ] Minimal necessary permissions
- [ ] No secret leaks
- [ ] Security best practices followed
- [ ] Security review completed (if required)

#### Gate 3: Reliability
- [ ] Fallback mechanisms implemented
- [ ] Error handling comprehensive
- [ ] Retry logic added (if needed)
- [ ] Circuit breaker pattern (if applicable)

#### Gate 4: Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Regression tests added
- [ ] E2E tests updated (if applicable)

#### Gate 5: Monitoring & Observability
- [ ] CloudWatch metrics configured
- [ ] Alarms set up
- [ ] Beads records automated
- [ ] Logging comprehensive

#### Gate 6: Documentation
- [ ] Runbook created/updated
- [ ] Troubleshooting guide updated
- [ ] Architecture Decision Record (ADR) created
- [ ] OpenSpec proposal documented

#### Gate 7: Long-term Planning
- [ ] Robust solution roadmap created
- [ ] Migration plan documented
- [ ] Success metrics defined
- [ ] Prevention mechanisms planned

### Phase 7: Prevention & Monitoring

**Components:**

1. **Automated Prevention:**
   - GitHub Actions for PR analysis
   - Automated detection of similar patterns
   - Recommendations for improvements

2. **Monitoring Setup:**
   - CloudWatch alarms
   - Beads automatic records
   - Regular health checks

3. **Regression Tests:**
   - Automated tests to prevent recurrence
   - Integration in CI/CD pipeline

**Output:**
- Prevention mechanisms implemented
- Monitoring configured
- Regression tests added

## Integration with OpenSpec

### When to Create OpenSpec Proposal

**Always create for:**
- Robust solutions
- Architectural changes
- Systemic fixes
- Hybrid approach (robust solution part)

**Optional but recommended:**
- Quick fixes with limitations
- Isolated bugs that indicate architectural patterns

### OpenSpec Proposal Structure for Bug Fixes

```markdown
# Change: [Robust Solution Name]

## Why
- Problem description
- Why quick fix is insufficient
- Long-term impact if not addressed

## What Changes
- Robust solution architecture
- Design patterns
- Implementation approach

## Impact
- Affected components
- Breaking changes (if any)
- Migration requirements

## Open Questions
- Implementation timeline
- Resource requirements
- Risk assessment
```

## Integration with Beads

### Beads Records for Each Phase

1. **Phase 1-2:** Analysis record
2. **Phase 3:** Strategy decision record
3. **Phase 4:** Quick fix implementation record (if applicable)
4. **Phase 5:** Robust solution design record
5. **Phase 6:** Quality gates validation record
6. **Phase 7:** Prevention setup record

### Beads Issue Updates

- Update issue with root cause analysis
- Update with fix strategy decision
- Link to OpenSpec proposal
- Track implementation progress
- Close after robust solution deployed

## Decision Tree

```
Bug Detected
    │
    ├─ Is it critical production issue?
    │   ├─ YES → Quick Fix First → Robust Solution Plan
    │   └─ NO → Continue analysis
    │
    ├─ Is it isolated bug?
    │   ├─ YES → Hybrid Approach (Quick Fix + Robust Plan)
    │   └─ NO → Robust Solution Only
    │
    ├─ Fix attempts >= 3?
    │   ├─ YES → Robust Solution Only
    │   └─ NO → Continue analysis
    │
    └─ Is it architectural issue?
        ├─ YES → Architectural Refactor (OpenSpec)
        └─ NO → Standard Robust Solution
```

## Success Criteria

### Immediate (Quick Fix)
- Bug is fixed
- System is operational
- Limitations documented

### Short-term (1-4 weeks)
- Robust solution designed
- OpenSpec proposal created
- Implementation started

### Long-term (1-6 months)
- Robust solution implemented
- Quick fix removed (if applicable)
- Prevention mechanisms active
- Zero recurrence of similar issues

## References

- Original Systematic Debugging: `.claude/skills/systematic-debugging.md`
- Bug Fixer Agent: `.claude/agents/bug-fixer.md`
- OpenSpec Workflow: `openspec/AGENTS.md`

# Bug Fixing Workflow

**Version:** 1.0  
**Date:** 2026-01-13  
**Based on:** Systematic Debugging methodology from https://habr.com/ru/articles/984882/

## Overview

This workflow implements a **systematic debugging methodology** to replace chaotic "guess-and-check" debugging. The goal is to:
- Reduce fix iterations from 3-5 to 1-2 attempts (60% improvement)
- Increase first-attempt success rate from 50% to 85%
- Automatically escalate architectural problems (rule: "3 fixes = architectural review")

## Components

### 1. Systematic Debugging Skill

**Location:** `.claude/skills/systematic-debugging.md`

A 4-phase methodology:
1. **Root Cause Analysis** - Understand the cause, not just the symptom
2. **Pattern Analysis** - Determine if bug is isolated or systemic
3. **Fix Strategy** - Choose quick fix or architectural review
4. **Quality Gates** - Verify fix is correct and doesn't introduce regressions

### 2. Bug Hunter Agent

**Location:** `.claude/agents/bug-hunter.md`

Automatically finds bugs through:
- Static analysis (ESLint, TypeScript compiler)
- Test failures
- Log analysis (CloudWatch, application logs)

Creates Beads issues for found bugs with proper prioritization.

### 3. Bug Fixer Agent

**Location:** `.claude/agents/bug-fixer.md`

Applies systematic-debugging methodology to fix bugs:
- Uses 4-phase approach
- Updates Beads issues with root cause, pattern, fix strategy
- Escalates to architectural review when needed

### 4. Scripts

- `scripts/bug-hunter.sh` - Automated bug discovery
- `scripts/systematic-debug.sh` - Interactive systematic debugging

## Workflow

### Step 1: Bug Discovery

**Automatic (Bug Hunter):**
```bash
./scripts/bug-hunter.sh
```

**Manual:**
- Developer finds bug
- Create Beads issue manually:
  ```bash
  bd create "Bug description" --type bug --priority HIGH
  ```

### Step 2: Bug Fixing

**Using Bug Fixer Agent:**
1. Agent reads bug issue from Beads
2. Applies systematic-debugging skill (4 phases)
3. Updates issue with root cause, pattern, fix strategy
4. Applies fix (if quick fix) or creates OpenSpec proposal (if architectural)

**Manual (Interactive):**
```bash
./scripts/systematic-debug.sh bug-123
```

Follows 4-phase methodology interactively.

### Step 3: Quality Gates

After fix is applied:
1. **Fix Verification:** Reproduce bug → verify it fails, apply fix → verify it passes
2. **Tests:** Run test suite (`npm test`)
3. **Regression Check:** Ensure no new bugs introduced
4. **Code Quality:** Run linting (`npm run lint`)

If quality gates fail:
- Increment `fix_attempts` counter
- Return to Phase 1 (re-analyze root cause)

### Step 4: Architecture Escalation

**Rule: "3 Fixes = Architectural Review"**

If bug requires 3+ fix attempts:
1. **STOP** applying quick fixes
2. **CREATE** OpenSpec proposal automatically
3. **NOTIFY** stakeholders (PM, Architects)
4. **LINK** bug issue to OpenSpec proposal

## 4-Phase Methodology

### Phase 1: Root Cause Analysis

**Goal:** Understand the **cause** of the bug, not just the symptom.

**Steps:**
1. **Reproduce the bug:**
   - Create minimal reproducible example
   - Record exact reproduction steps
   - Identify environment (OS, versions, configuration)

2. **Trace data flow:**
   - Follow data path from input to error point
   - Find point where data becomes incorrect
   - Use breakpoints / logs / assertions

3. **Identify root cause:**
   - ❌ **DON'T** fix symptom ("null check here will solve it")
   - ✅ **DO** understand **why** data became null
   - Check upstream: where does data come from?

**Example:**
```typescript
// ❌ WRONG: Fixes symptom
function processUser(user: User | null) {
  if (!user) {
    console.error('User is null');
    return;
  }
  // ...
}

// ✅ RIGHT: Fixes root cause
// Problem was in async/await:
// fetchUser() returned Promise<User>, but we didn't await resolve
async function processUser(userId: string) {
  const user = await fetchUser(userId); // Now we wait
  // ...
}
```

**Rule:** If root cause is uncertain → **DON'T fix yet**. Understanding first, then fix.

### Phase 2: Pattern Analysis

**Goal:** Understand if this is an **isolated bug** or a **systemic problem**.

**Questions:**
1. **How many places are affected?**
   - Single file/component → isolated
   - Multiple files/components → systemic

2. **Are there similar bugs?**
   - Search codebase for similar patterns
   - Check if same root cause appears elsewhere

3. **Is this one-time or recurring?**
   - One-time → isolated
   - Recurring → systemic

**Decision Tree:**
```
Is bug isolated?
├─ YES → Quick fix strategy (Phase 3)
└─ NO → Architectural review strategy (Phase 3)
```

### Phase 3: Fix Strategy

**Goal:** Choose appropriate fix approach based on pattern and fix attempts.

**Decision Rules:**

1. **If `isolated` AND `fix_attempts < 3`:**
   - Strategy: `quick_fix`
   - Apply minimal fix to root cause
   - Verify with tests

2. **If `systemic` OR `fix_attempts >= 3`:**
   - Strategy: `architectural_review`
   - Create OpenSpec proposal for architectural change
   - Don't apply quick fix (will fail again)
   - Escalate to stakeholders

**Rule: "3 Fixes = Architectural Review"**

If bug requires 3+ fix attempts:
- **STOP** applying quick fixes
- **CREATE** OpenSpec proposal for architectural review
- **NOTIFY** stakeholders (PM, Architects)

### Phase 4: Quality Gates

**Goal:** Verify fix is correct and doesn't introduce regressions.

**Checks:**

1. **Fix Verification:**
   - Reproduce bug → verify it fails
   - Apply fix → verify it passes
   - Confirm root cause is addressed

2. **Tests:**
   - Unit tests pass: `npm run test:unit`
   - Integration tests pass: `npm run test:integration`
   - E2E tests pass: `npm run test:e2e` (if applicable)

3. **Regression Check:**
   - No new bugs introduced
   - Existing functionality still works
   - Run full test suite

4. **Code Quality:**
   - Linting passes: `npm run lint`
   - Type checking passes: `npx tsc --noEmit`
   - Code review (if required)

**If Quality Gates Fail:**
- Increment `fix_attempts` counter
- Return to Phase 1 (re-analyze root cause)
- Check if pattern changed (isolated → systemic)

## Integration with Beads

### Bug Issue Structure

```json
{
  "id": "bug-123",
  "type": "bug",
  "title": "TypeError in video processing",
  "description": "Full error message + stack trace",
  "priority": "HIGH",
  "status": "open|in_progress|fixed|escalated|closed",
  "fix_attempts": 0,
  "root_cause": null,
  "pattern": null,
  "fix_strategy": null,
  "related_issues": [],
  "openspec_change": null,
  "found_at": "2026-01-13T10:00:00Z",
  "fixed_at": null
}
```

### Issue Updates

**After Phase 1 (Root Cause Analysis):**
```json
{
  "root_cause": "Async function fetchUser() returns Promise<User>, but caller doesn't await, causing null access"
}
```

**After Phase 2 (Pattern Analysis):**
```json
{
  "pattern": "isolated",
  "affected_components": ["src/backend/api/users.ts"]
}
```

**After Phase 3 (Fix Strategy):**
```json
{
  "fix_strategy": "quick_fix",
  "fix_attempts": 1
}
```

**After Phase 4 (Quality Gates - Success):**
```json
{
  "status": "fixed",
  "fixed_at": "2026-01-13T11:30:00Z",
  "fix_details": "Added await to fetchUser() call in processUser()"
}
```

**After Escalation:**
```json
{
  "status": "escalated",
  "fix_strategy": "architectural_review",
  "openspec_change": "fix-architectural-issue-123"
}
```

## Integration with OpenSpec

### Architecture Escalation

When bug requires architectural review:
1. Create OpenSpec proposal:
   ```bash
   /openspec-proposal "Fix architectural issue: [bug description]"
   ```

2. Include in proposal:
   - Bug description and root cause
   - All fix attempts and why they failed
   - Suggested architectural changes

3. Link to Beads issue:
   - Update issue: `openspec_change: "fix-architectural-issue-123"`
   - Update proposal: link back to bug issue

## Metrics

Track these metrics to measure effectiveness:

- **Time to fix:** from bug found to fix applied
- **Fix attempts:** number of iterations before success
- **Root cause accuracy:** was root cause correctly identified?
- **First-attempt success rate:** % of bugs fixed on first attempt
- **Escalation rate:** % of bugs escalated to architectural review

**Target metrics:**
- Average fix attempts: 1-2 (down from 3-5)
- First-attempt success: 85% (up from 50%)
- Escalation rate: 15% (architectural problems detected early)

## Examples

### Example 1: Isolated Bug (Quick Fix)

**Bug:** TypeError in `processUser()` function

**Phase 1:** Root cause identified: `fetchUser()` returns Promise, but not awaited

**Phase 2:** Pattern: isolated (single function)

**Phase 3:** Strategy: quick_fix (first attempt)

**Phase 4:** Quality gates pass → bug fixed

**Result:** Fixed in 1 attempt, 15 minutes

### Example 2: Systemic Bug (Architectural Review)

**Bug:** Multiple components have similar async/await issues

**Phase 1:** Root cause identified: inconsistent async/await patterns across codebase

**Phase 2:** Pattern: systemic (affects 5+ files)

**Phase 3:** Strategy: architectural_review (systemic pattern detected)

**Phase 4:** OpenSpec proposal created for architectural refactoring

**Result:** Escalated to architectural review, proposal created

### Example 3: Escalation (3 Fixes Rule)

**Bug:** Complex bug requiring multiple fix attempts

**Attempt 1:** Quick fix applied → quality gates fail
**Attempt 2:** Another quick fix → quality gates fail
**Attempt 3:** Rule triggers → architectural review

**Phase 3:** Strategy changed to architectural_review (3+ attempts)

**Phase 4:** OpenSpec proposal created automatically

**Result:** Escalated after 3 attempts, architectural proposal created

## Best Practices

1. **Always start with Phase 1:** Don't skip root cause analysis
2. **Document everything:** Root cause, pattern, fix strategy in issue
3. **Follow quality gates:** Don't skip tests or regression checks
4. **Respect escalation rule:** Stop after 3 attempts, escalate to architectural review
5. **Update metrics:** Track effectiveness for continuous improvement

## References

- Systematic Debugging Skill: `.claude/skills/systematic-debugging.md`
- Bug Hunter Agent: `.claude/agents/bug-hunter.md`
- Bug Fixer Agent: `.claude/agents/bug-fixer.md`
- OpenSpec proposal: `openspec/changes/add-systematic-bug-fixing/`
- Source article: https://habr.com/ru/articles/984882/

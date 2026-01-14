# Systematic Debugging Skill

**Type:** Skill (stateless utility)  
**Purpose:** 4-phase systematic debugging methodology to replace chaotic "guess-and-check" debugging  
**Source:** Based on methodology from https://habr.com/ru/articles/984882/

## Overview

This skill provides a structured 4-phase approach to debugging that:
- Reduces fix iterations from 3-5 to 1-2 attempts (60% improvement)
- Increases first-attempt success rate from 50% to 85%
- Automatically escalates architectural problems (rule: "3 fixes = architectural review")
- Prevents fixing symptoms instead of root causes

## Phase 1: Root Cause Analysis

**Goal:** Understand the **cause** of the bug, not just the symptom.

### Steps:

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

### Example:

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

### Rule:
If root cause is uncertain → **DON'T fix yet**. Understanding first, then fix.

### Output:
- Root cause identified (not symptom)
- Data flow traced
- Minimal reproducible example created

---

## Phase 2: Pattern Analysis

**Goal:** Understand if this is an **isolated bug** or a **systemic problem**.

### Questions:

1. **How many places are affected?**
   - Single file/component → isolated
   - Multiple files/components → systemic

2. **Are there similar bugs?**
   - Search codebase for similar patterns
   - Check if same root cause appears elsewhere

3. **Is this a one-time error or recurring?**
   - One-time → isolated
   - Recurring → systemic

### Decision Tree:

```
Is bug isolated?
├─ YES → Quick fix strategy (Phase 3)
└─ NO → Architectural review strategy (Phase 3)
```

### Output:
- Pattern identified: `isolated` | `systemic`
- Similar bugs found (if any)
- Affected components list

---

## Phase 3: Fix Strategy

**Goal:** Choose appropriate fix approach based on pattern and fix attempts.

### Decision Rules:

1. **If isolated AND fix_attempts < 3:**
   - Strategy: `quick_fix`
   - Apply minimal fix to root cause
   - Verify with tests

2. **If systemic OR fix_attempts >= 3:**
   - Strategy: `architectural_review`
   - Create OpenSpec proposal for architectural change
   - Don't apply quick fix (will fail again)
   - Escalate to stakeholders

### Rule: "3 Fixes = Architectural Review"

If bug requires 3+ fix attempts:
- **STOP** applying quick fixes
- **CREATE** OpenSpec proposal for architectural review
- **NOTIFY** stakeholders (PM, Architects)

### Output:
- Fix strategy: `quick_fix` | `architectural_review`
- If architectural: OpenSpec proposal created
- If quick fix: fix code ready to apply

---

## Phase 4: Quality Gates

**Goal:** Verify fix is correct and doesn't introduce regressions.

### Checks:

1. **Fix Verification:**
   - Reproduce bug → verify it fails
   - Apply fix → verify it passes
   - Confirm root cause is addressed

2. **Tests:**
   - Unit tests pass
   - Integration tests pass
   - E2E tests pass (if applicable)

3. **Regression Check:**
   - No new bugs introduced
   - Existing functionality still works
   - Code review passes (if required)

4. **Documentation:**
   - Root cause documented in bug issue
   - Fix documented in code comments
   - Pattern and strategy documented

### If Quality Gates Fail:

- Increment `fix_attempts` counter
- Return to Phase 1 (re-analyze root cause)
- Check if pattern changed (isolated → systemic)

### Output:
- All quality gates passed: ✅
- Fix verified and documented
- Bug issue updated with fix details

---

## Usage

### For Bug Fixer Agent:

```markdown
Apply systematic-debugging skill to bug-123:

1. Phase 1: Root Cause Analysis
   - Reproduce bug
   - Trace data flow
   - Identify root cause

2. Phase 2: Pattern Analysis
   - Check if isolated or systemic
   - Find similar bugs

3. Phase 3: Fix Strategy
   - If isolated + attempts < 3 → quick fix
   - If systemic OR attempts >= 3 → architectural review

4. Phase 4: Quality Gates
   - Verify fix
   - Run tests
   - Check regression
```

### Integration with Beads:

- Update bug issue with:
  - `root_cause`: from Phase 1
  - `pattern`: from Phase 2
  - `fix_strategy`: from Phase 3
  - `fix_attempts`: incremented on each attempt
  - `status`: updated based on Phase 4 result

---

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

---

## References

- Source article: https://habr.com/ru/articles/984882/
- OpenSpec proposal: `openspec/changes/add-systematic-bug-fixing/`
- Bug Fixer Agent: `.claude/agents/bug-fixer.md`

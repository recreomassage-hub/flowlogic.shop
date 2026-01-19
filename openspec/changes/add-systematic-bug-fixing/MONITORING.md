# Monitoring Guide: Bug Hunter System

**PR:** #14  
**Status:** ⏳ Monitoring GitHub Actions

---

## Current Status

### PR Information
- **Number:** #14
- **Title:** feat: Systematic Bug Finding and Fixing System
- **State:** OPEN
- **URL:** https://github.com/recreomassage-hub/flowlogic.shop/pull/14

### GitHub Actions Workflow

**Workflow:** Bug Hunter  
**Status:** Running/Queued

**Jobs:**
1. **Bug Hunter (Pre-Merge)** - Status: QUEUED/RUNNING
   - Fast mode (60s timeout)
   - Non-blocking (continue-on-error: true)
   - Will comment PR if bugs found

---

## Monitoring Commands

### Check PR Status

```bash
# View PR details
gh pr view 14

# Check PR checks
gh pr checks 14

# View PR comments
gh pr view 14 --comments
```

### Check Workflow Runs

```bash
# List recent runs
gh run list --workflow=bug-hunter.yml --limit 5

# View specific run
gh run view <run-id>

# Watch run in real-time
gh run watch <run-id>
```

### Check Workflow Logs

```bash
# View logs for latest run
gh run view --log

# View logs for specific job
gh run view <run-id> --log --job <job-id>
```

---

## Expected Workflow Behavior

### Pre-Merge Job

**When:** On every PR  
**Mode:** Fast (60s timeout)  
**Checks:**
- ESLint (critical errors only)
- TypeScript compiler (type errors)
- No tests (skipped in fast mode)

**Expected Output:**
```
🔍 Bug Hunter: Starting bug discovery...
Mode: fast, Timeout: 60s
📋 Phase 1: Static Analysis
============================
Running ESLint...
Running TypeScript compiler...
📋 Phase 2: Test Analysis
=========================
⏭️  Skipped (fast mode - only critical checks)
```

**If bugs found:**
- PR comment created automatically
- Workflow shows as "failed" (expected)
- PR NOT blocked

**If no bugs:**
- Workflow shows as "success"
- No PR comment

---

## Monitoring Checklist

### After PR Creation:

- [ ] PR created successfully (#14)
- [ ] Workflow triggered automatically
- [ ] Pre-merge job running/queued
- [ ] Check workflow logs for errors

### During Workflow Run:

- [ ] Job starts within 1-2 minutes
- [ ] Fast mode completes within 60s
- [ ] No unexpected errors in logs
- [ ] Output format correct

### After Workflow Completion:

- [ ] Workflow completes (success or expected failure)
- [ ] PR comment created (if bugs found)
- [ ] PR not blocked
- [ ] Artifacts created (if any)

---

## Troubleshooting

### Workflow doesn't trigger

**Check:**
```bash
# Verify workflow file exists
ls -la .github/workflows/bug-hunter.yml

# Check workflow syntax
gh workflow view bug-hunter.yml
```

**Solution:**
- Verify workflow file is in PR
- Check GitHub Actions permissions
- Verify branch name matches

### Workflow fails unexpectedly

**Check logs:**
```bash
gh run view --log --failed
```

**Common issues:**
- Missing dependencies (npm install)
- Script permissions
- Timeout too short

### No PR comment created

**Expected if:**
- No bugs found (workflow succeeds)
- Workflow skipped

**Check:**
```bash
# View workflow output
gh run view --log

# Check if bugs were found
# Look for "CRITICAL:" or "HIGH:" in output
```

---

## Next Steps

### After Workflow Completes:

1. **Review results:**
   - Check PR comment (if bugs found)
   - Review workflow logs
   - Verify no false positives

2. **If ready to merge:**
   - Get PR approval
   - Merge PR
   - Proceed to staging deployment

3. **If issues found:**
   - Fix issues
   - Push fixes
   - Workflow will re-run automatically

---

## Staging Deployment (After PR Merge)

**See:** `STAGING_DEPLOYMENT.md`

**Steps:**
1. PR merged to main
2. Staging auto-deploys (if configured)
3. Monitor for 24-48 hours
4. Check nightly reports
5. Verify CloudWatch integration

---

**Last Updated:** 2026-01-14  
**PR:** https://github.com/recreomassage-hub/flowlogic.shop/pull/14  
**Workflow:** https://github.com/recreomassage-hub/flowlogic.shop/actions

# Deployment Guide: Systematic Bug Finding and Fixing System

**Change ID:** `add-systematic-bug-fixing`  
**Status:** ✅ Ready for Deployment

---

## Quick Start

### 1. Local Testing ✅ (COMPLETE)

```bash
# Fast mode test
./scripts/bug-hunter.sh --mode fast --timeout 60

# Deep mode test  
./scripts/bug-hunter.sh --mode deep --timeout 300

# CloudWatch test (if AWS configured)
./scripts/bug-hunter-cloudwatch.sh
```

**Result:** ✅ All local tests passed

---

### 2. GitHub Actions Testing ⏳ (READY)

**Current Branch:** `test/bug-hunter-integration`

**Steps:**
```bash
# 1. Push branch
git push origin test/bug-hunter-integration

# 2. Create PR via GitHub UI or CLI
gh pr create --title "feat: Systematic Bug Finding and Fixing System" \
  --body "Implements systematic debugging methodology for OpenSpec+Beads workflow.

## What's Included
- Systematic Debugging Skill (4-phase methodology)
- Bug Hunter Agent (automatic bug discovery)
- Bug Fixer Agent (systematic bug fixing)
- GitHub Actions integration (pre-merge + nightly)
- CloudWatch integration (alert-only)
- Comprehensive documentation

## Testing Status
- ✅ Local tests: PASS
- ⏳ GitHub Actions: PENDING (this PR)
- ⏳ Staging: PENDING
- ⏳ Production: PENDING

## References
- Proposal: openspec/changes/add-systematic-bug-fixing/
- Source: https://habr.com/ru/articles/984882/" \
  --base develop
```

**Expected:**
- Pre-merge workflow runs on PR
- Fast mode executes (60s)
- PR comment if bugs found
- PR NOT blocked

---

### 3. Staging Deployment ⏳ (AFTER PR MERGE)

**After PR is merged to `develop`:**

1. **Verify deployment:**
   ```bash
   # Check GitHub Actions
   # Actions → Bug Hunter → Should run on develop branch
   ```

2. **Monitor for 24-48 hours:**
   - Check nightly reports (2 AM UTC)
   - Verify no false positives
   - Check CloudWatch integration (if configured)
   - Review workflow logs

3. **Success criteria:**
   - ✅ No workflow failures
   - ✅ Reports generated correctly
   - ✅ No false positives
   - ✅ Performance acceptable

---

### 4. Production Deployment ⏳ (AFTER STAGING)

**After staging verification (24-48 hours):**

1. **Merge to main:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Verify production:**
   - Check GitHub Actions deployment
   - Verify nightly schedule works
   - Monitor for 1 week

3. **Collect metrics:**
   - Average fix attempts
   - First-attempt success rate
   - Escalation rate
   - Time to fix

---

## Rollback Plan

If issues found:

### Quick Disable:
```bash
# Disable workflow (comment out in GitHub UI)
# Or rename workflow file
mv .github/workflows/bug-hunter.yml .github/workflows/bug-hunter.yml.disabled
```

### Full Rollback:
```bash
git revert <commit-hash>
git push origin main
```

---

## Configuration

### GitHub Actions
- **Pre-merge:** Fast mode, 60s timeout, non-blocking
- **Nightly:** Deep mode, 300s timeout, 2 AM UTC
- **Artifacts:** Retained 30 days

### CloudWatch (Optional)
- **Region:** us-east-1 (default)
- **Log Group:** /aws/lambda/flowlogic-api
- **Lookback:** 1 hour

### Beads (Manual in MVP)
- Create issues manually from bug-hunter output
- Automatic creation in v2

---

## Support

- **Documentation:** `docs/operations/bug-fixing-workflow.md`
- **Testing Guide:** `docs/operations/bug-hunter-testing.md`
- **Integration Guide:** `docs/operations/bug-hunter-integration.md`
- **Examples:** `docs/examples/bug-fixing-demo.md`

---

**Last Updated:** 2026-01-14  
**Next Step:** Push branch and create PR

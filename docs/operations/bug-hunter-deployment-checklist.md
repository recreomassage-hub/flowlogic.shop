# Bug Hunter Deployment Checklist

**Date:** 2026-01-14  
**Change:** `add-systematic-bug-fixing`

---

## ✅ Phase 1: Local Testing

### Test 1.1: Fast Mode
```bash
./scripts/bug-hunter.sh --mode fast --timeout 60
```
- [x] Script executes without errors
- [x] Only critical checks run (ESLint, TypeScript)
- [x] Completes within timeout
- [x] Output shows mode and timeout

### Test 1.2: Deep Mode
```bash
./scripts/bug-hunter.sh --mode deep --timeout 300
```
- [x] All checks execute
- [x] Tests run (if available)
- [x] Detailed output provided

### Test 1.3: Script Syntax
```bash
bash -n scripts/bug-hunter.sh
bash -n scripts/bug-hunter-cloudwatch.sh
bash -n scripts/systematic-debug.sh
```
- [x] All scripts pass syntax check

### Test 1.4: CloudWatch (Optional)
```bash
./scripts/bug-hunter-cloudwatch.sh
```
- [ ] AWS credentials configured
- [ ] Log group accessible
- [ ] Errors detected (if any)

**Status:** ✅ Local testing complete

---

## ✅ Phase 2: GitHub Actions Testing

### Test 2.1: Create Test PR

```bash
# 1. Create test branch
git checkout -b test/bug-hunter-integration

# 2. Add test change (introduce minor issue for testing)
echo "// Test: bug-hunter workflow" >> test-file.txt

# 3. Commit and push
git add .
git commit -m "test: bug-hunter workflow integration"
git push origin test/bug-hunter-integration
```

### Test 2.2: Verify Pre-Merge Workflow

- [ ] PR created successfully
- [ ] GitHub Actions workflow triggers
- [ ] "Bug Hunter (Pre-Merge)" job runs
- [ ] Job completes (may fail if bugs found - expected)
- [ ] PR comment created if bugs found
- [ ] PR is NOT blocked (continue-on-error: true)

### Test 2.3: Manual Nightly Trigger

- [ ] Go to Actions → Bug Hunter
- [ ] Click "Run workflow"
- [ ] Select branch (main or develop)
- [ ] Workflow runs successfully
- [ ] Artifacts created (bug-report-*.txt)
- [ ] CloudWatch analysis runs (if AWS configured)

**Status:** ⏳ Ready for PR creation

---

## ⏳ Phase 3: Staging Deployment

### Pre-Deployment Checks

- [ ] All local tests pass
- [ ] GitHub Actions tests pass
- [ ] No critical bugs found
- [ ] Documentation reviewed

### Deployment Steps

1. **Merge to develop branch:**
   ```bash
   git checkout develop
   git merge test/bug-hunter-integration
   git push origin develop
   ```

2. **Verify staging deployment:**
   - [ ] GitHub Actions deploys to staging
   - [ ] Bug Hunter workflow runs on develop branch
   - [ ] Nightly schedule works (2 AM UTC)
   - [ ] CloudWatch integration works (if configured)

3. **Monitor for 24-48 hours:**
   - [ ] No false positives
   - [ ] Reports generated correctly
   - [ ] No workflow failures
   - [ ] Performance acceptable

**Status:** ⏳ Waiting for local + GitHub Actions tests

---

## ⏳ Phase 4: Production Deployment

### Pre-Production Checks

- [ ] Staging tests pass (24-48 hours)
- [ ] No critical issues found
- [ ] Team notified
- [ ] Rollback plan ready

### Deployment Steps

1. **Merge to main branch:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Verify production deployment:**
   - [ ] GitHub Actions deploys to production
   - [ ] Bug Hunter workflow runs on main branch
   - [ ] Nightly schedule works
   - [ ] CloudWatch integration works

3. **Monitor for 1 week:**
   - [ ] Metrics collected
   - [ ] Effectiveness measured
   - [ ] No production issues
   - [ ] Team feedback collected

**Status:** ⏳ Waiting for staging verification

---

## 📊 Success Criteria

### Local Testing
- ✅ All scripts execute without errors
- ✅ Syntax validation passes
- ✅ Fast/Deep modes work correctly

### GitHub Actions
- ✅ Pre-merge workflow triggers on PR
- ✅ Nightly workflow runs on schedule
- ✅ Artifacts created successfully
- ✅ PR not blocked by workflow

### Staging
- ✅ No false positives
- ✅ Reports generated correctly
- ✅ Performance acceptable
- ✅ No workflow failures

### Production
- ✅ Metrics show improvement
- ✅ No production issues
- ✅ Team adoption successful

---

## 🔄 Rollback Plan

If issues found:

1. **Disable workflow:**
   - Comment out workflow file
   - Or disable in GitHub Actions settings

2. **Remove scripts (if needed):**
   ```bash
   git rm scripts/bug-hunter-cloudwatch.sh
   git commit -m "revert: disable bug-hunter cloudwatch"
   ```

3. **Investigate:**
   - Review logs
   - Fix issues
   - Re-enable after fix

---

## 📝 Notes

- CloudWatch integration requires AWS credentials
- Beads integration is manual in MVP (automatic in v2)
- Nightly runs at 2 AM UTC (adjust if needed)
- Reports retained for 30 days

---

**Last Updated:** 2026-01-14  
**Next Review:** After staging deployment

# Staging Deployment Guide

**Change:** `add-systematic-bug-fixing`  
**Status:** ⏳ Ready after PR merge

---

## Pre-Deployment Checklist

### After PR Merge:

- [ ] PR merged to base branch (main/develop)
- [ ] GitHub Actions workflow passed
- [ ] No critical bugs found
- [ ] Documentation reviewed
- [ ] Team notified

---

## Staging Deployment Steps

### Step 1: Verify PR Merge

```bash
# Check merge status
git fetch origin
git checkout main  # or develop, depending on base branch
git pull origin main

# Verify bug-hunter files exist
ls -la .github/workflows/bug-hunter.yml
ls -la scripts/bug-hunter*.sh
ls -la .claude/skills/systematic-debugging.md
```

### Step 2: Monitor GitHub Actions

**Check workflow runs:**
1. Go to: https://github.com/recreomassage-hub/flowlogic.shop/actions
2. Find "Bug Hunter" workflow
3. Verify:
   - Pre-merge runs on PRs
   - Nightly runs on schedule (2 AM UTC)

**Expected behavior:**
- Pre-merge: Fast mode, non-blocking
- Nightly: Deep mode, generates reports

### Step 3: Verify Staging Environment

**If staging auto-deploys from base branch:**

1. **Check deployment:**
   ```bash
   # Verify staging URL (if available)
   # Check deployment logs
   ```

2. **Test bug-hunter manually:**
   ```bash
   # SSH to staging or use CI/CD
   ./scripts/bug-hunter.sh --mode fast --timeout 60
   ```

3. **Check CloudWatch (if configured):**
   ```bash
   ./scripts/bug-hunter-cloudwatch.sh
   ```

### Step 4: Monitor for 24-48 Hours

**Daily checks:**

1. **Nightly Reports:**
   - Check GitHub Actions artifacts
   - Review bug reports
   - Verify no false positives

2. **Workflow Health:**
   - No workflow failures
   - Reports generated correctly
   - Performance acceptable

3. **CloudWatch Integration:**
   - Errors detected (if any)
   - Alerts working
   - No false alarms

---

## Success Criteria

### Week 1 (Staging):

- [ ] No workflow failures
- [ ] Reports generated daily
- [ ] No false positives
- [ ] Performance acceptable (< 5 min for nightly)
- [ ] CloudWatch integration works (if configured)
- [ ] Team feedback positive

### Metrics to Track:

- **Workflow success rate:** > 95%
- **False positive rate:** < 5%
- **Report generation:** Daily
- **Performance:** < 5 min nightly

---

## Troubleshooting

### Issue: Workflow doesn't trigger

**Solution:**
- Check workflow file syntax
- Verify branch name matches
- Check GitHub Actions permissions

### Issue: False positives

**Solution:**
- Review bug-hunter output
- Adjust severity thresholds
- Update ignore patterns

### Issue: Performance issues

**Solution:**
- Increase timeout if needed
- Optimize checks
- Use fast mode for pre-merge only

---

## Rollback Plan

If critical issues found:

1. **Disable workflow:**
   ```bash
   # Rename workflow file
   mv .github/workflows/bug-hunter.yml .github/workflows/bug-hunter.yml.disabled
   git commit -m "revert: disable bug-hunter workflow"
   git push
   ```

2. **Remove scripts (if needed):**
   ```bash
   git rm scripts/bug-hunter-cloudwatch.sh
   git commit -m "revert: remove cloudwatch integration"
   ```

3. **Investigate and fix:**
   - Review logs
   - Fix issues
   - Re-enable after fix

---

## Next Steps After Staging

After 24-48 hours of successful staging:

1. **Review metrics:**
   - Workflow success rate
   - False positive rate
   - Performance metrics

2. **Team feedback:**
   - Collect developer feedback
   - Adjust if needed

3. **Production deployment:**
   - Merge to production branch
   - Monitor for 1 week
   - Collect effectiveness metrics

---

**Last Updated:** 2026-01-14  
**Status:** ⏳ Waiting for PR merge

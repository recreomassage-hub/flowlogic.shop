# Merge and Staging Deployment Guide

**PR:** #14  
**Status:** Ready for Merge → Staging Deployment

---

## Pre-Merge Checklist

- [x] PR created (#14)
- [x] Workflow runs successfully
- [x] Code reviewed
- [ ] PR approved (if required)
- [ ] Ready to merge

---

## Merge PR

### Option 1: GitHub Web UI

1. **Open PR:** https://github.com/recreomassage-hub/flowlogic.shop/pull/14
2. **Click "Merge pull request"**
3. **Confirm merge**

### Option 2: GitHub CLI

```bash
# Merge PR
gh pr merge 14 --squash

# Or merge commit
gh pr merge 14 --merge

# Or rebase and merge
gh pr merge 14 --rebase
```

---

## Post-Merge: Staging Deployment

### Step 1: Verify Merge

```bash
# Switch to main branch
git checkout main
git pull origin main

# Verify files exist
ls -la .github/workflows/bug-hunter.yml
ls -la scripts/bug-hunter*.sh
ls -la .claude/skills/systematic-debugging.md
```

### Step 2: Monitor Staging Deployment

**If staging auto-deploys from main:**

1. **Check deployment status:**
   - GitHub Actions: https://github.com/recreomassage-hub/flowlogic.shop/actions
   - Look for deployment workflows
   - Verify staging deployment completes

2. **Verify bug-hunter in staging:**
   ```bash
   # If you have staging access
   # SSH to staging or check via CI/CD
   ./scripts/bug-hunter.sh --mode fast --timeout 60
   ```

### Step 3: Monitor GitHub Actions (Staging)

**Nightly Workflow:**
- Runs at 2 AM UTC daily
- Deep mode (300s timeout)
- Generates reports
- CloudWatch analysis (if configured)

**Check after 24 hours:**
```bash
# List nightly runs
gh run list --workflow=bug-hunter.yml --limit 5

# View latest nightly report
gh run view --workflow=bug-hunter.yml --log
```

### Step 4: Verify Functionality

**Daily checks (24-48 hours):**

1. **Workflow Health:**
   - [ ] No workflow failures
   - [ ] Reports generated
   - [ ] Performance acceptable

2. **Bug Detection:**
   - [ ] Bugs found (if any)
   - [ ] No false positives
   - [ ] Prioritization correct

3. **CloudWatch Integration:**
   - [ ] Logs analyzed (if configured)
   - [ ] Errors detected (if any)
   - [ ] Alerts working

---

## Success Criteria (Staging)

### Week 1:

- [ ] No workflow failures
- [ ] Reports generated daily
- [ ] No false positives (< 5%)
- [ ] Performance acceptable (< 5 min nightly)
- [ ] CloudWatch integration works (if configured)
- [ ] Team feedback positive

### Metrics:

- **Workflow success rate:** > 95%
- **False positive rate:** < 5%
- **Report generation:** Daily
- **Performance:** < 5 min nightly

---

## Troubleshooting

### Issue: Staging deployment fails

**Check:**
- Deployment logs
- Workflow errors
- Configuration issues

**Solution:**
- Review logs
- Fix issues
- Re-deploy

### Issue: Workflow doesn't run on staging

**Check:**
- Workflow file exists
- Branch configuration
- Schedule settings

**Solution:**
- Verify workflow file
- Check branch names
- Verify schedule (2 AM UTC)

### Issue: False positives

**Solution:**
- Review bug-hunter output
- Adjust severity thresholds
- Update ignore patterns
- Fine-tune checks

---

## Production Deployment (After Staging)

**Timeline:** After 24-48 hours of successful staging

**Steps:**
1. Review staging metrics
2. Get team approval
3. Merge to production (if separate branch)
4. Monitor for 1 week
5. Collect effectiveness metrics

**See:** `DEPLOYMENT_GUIDE.md` for details

---

## Monitoring Commands

```bash
# Check PR status
gh pr view 14

# Check workflow runs
gh run list --workflow=bug-hunter.yml --limit 10

# View latest run
gh run view --workflow=bug-hunter.yml

# Watch run in real-time
gh run watch <run-id>
```

---

**Last Updated:** 2026-01-14  
**Ready for:** PR merge → Staging deployment

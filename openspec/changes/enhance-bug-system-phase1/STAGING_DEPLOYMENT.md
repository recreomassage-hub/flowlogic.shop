# Staging Deployment Plan - Phase 1 Enhancements

## Overview

Deployment plan for Phase 1 enhancements to bug finding and fixing system:
- OpenSpec integration
- Solution Rate metrics
- Confidence Score

## Pre-Deployment Checklist

### Code Review
- [ ] Review OpenSpec rules parser implementation
- [ ] Review Solution Rate calculation script
- [ ] Review Confidence Score integration
- [ ] Review GitHub Actions workflow changes
- [ ] Review documentation updates

### Testing
- [ ] Unit tests for OpenSpec parser (if available)
- [ ] Manual test of OpenSpec rules parser
- [ ] Manual test of Solution Rate calculation
- [ ] Manual test of Bug Hunter with OpenSpec checking
- [ ] Manual test of Bug Fixer with Confidence Score

### Dependencies
- [ ] Verify `jq` is available in GitHub Actions runners
- [ ] Verify `bc` is available in GitHub Actions runners
- [ ] Verify Beads CLI is available (if needed)

## Deployment Steps

### Step 1: Merge to Develop

```bash
# Ensure all changes are committed
git add .
git commit -m "feat: Phase 1 enhancements - OpenSpec integration, Solution Rate, Confidence Score"

# Push to develop branch
git push origin develop
```

### Step 2: Monitor GitHub Actions

1. **Pre-merge workflow:**
   - Verify Bug Hunter runs successfully
   - Check for any errors in OpenSpec parsing

2. **Nightly workflow (if scheduled):**
   - Verify Solution Rate calculation runs
   - Check for alerts (Solution Rate < 60%, False Positive Rate > 30%)
   - Verify dashboard is updated

### Step 3: Staging Verification (24-48 hours)

**Day 1:**
- [ ] Monitor Bug Hunter runs
- [ ] Check OpenSpec rules are being parsed correctly
- [ ] Verify Solution Rate calculation works
- [ ] Check for any false positives in OpenSpec violations

**Day 2:**
- [ ] Review Solution Rate metrics
- [ ] Review False Positive Rate
- [ ] Calibrate OpenSpec rules if needed
- [ ] Review Confidence Score calculations

### Step 4: Metrics Collection

**Collect metrics for 2 weeks:**
- Solution Rate trend
- False Positive Rate trend
- OpenSpec violations by rule
- Confidence Score distribution

**Target metrics:**
- Solution Rate: > 60% (acceptable), > 70% (target)
- False Positive Rate: < 20% (target), < 30% (acceptable)

## Rollback Plan

If issues are detected:

1. **Immediate rollback:**
   ```bash
   # Revert to previous version
   git revert <commit-hash>
   git push origin develop
   ```

2. **Partial rollback:**
   - Disable OpenSpec checking in bug-hunter.sh
   - Disable Solution Rate calculation in GitHub Actions
   - Keep Confidence Score (low risk)

## Success Criteria

**Staging deployment is successful if:**
- ✅ Bug Hunter runs without errors
- ✅ OpenSpec rules are parsed correctly
- ✅ Solution Rate is calculated accurately
- ✅ Confidence Score is calculated correctly
- ✅ No increase in false positives
- ✅ GitHub Actions workflows complete successfully

## Post-Deployment

### Week 1
- Monitor metrics daily
- Calibrate OpenSpec rules based on false positives
- Adjust thresholds if needed

### Week 2
- Review Solution Rate trend
- Review False Positive Rate trend
- Prepare for production deployment

## Production Deployment

**After 2 weeks of successful staging:**
- Follow same deployment plan
- Monitor closely for first 48 hours
- Collect metrics for 2 weeks

## Troubleshooting

### OpenSpec Parser Fails

**Symptoms:**
- Error in bug-hunter.sh Phase 3
- No rules extracted

**Solution:**
- Check `jq` is installed
- Verify `openspec/project.md` exists
- Check cache file permissions
- Run parser manually: `./scripts/openspec-rules-parser.sh --force-refresh`

### Solution Rate Calculation Fails

**Symptoms:**
- Error in GitHub Actions
- No metrics in dashboard

**Solution:**
- Check `jq` and `bc` are installed
- Verify `.beads/issues.jsonl` exists
- Check Beads issue format
- Run calculation manually: `./scripts/calculate-solution-rate.sh`

### High False Positive Rate

**Symptoms:**
- False Positive Rate > 30%
- Many invalid OpenSpec violations

**Solution:**
- Review OpenSpec rules
- Calibrate rule patterns
- Adjust severity levels
- Update rule definitions

### Low Solution Rate

**Symptoms:**
- Solution Rate < 60%
- Many bugs not being fixed

**Solution:**
- Review bug fixing process
- Check if bugs are being marked as fixed
- Verify Beads issue updates
- Review Confidence Score thresholds

## Contacts

- **Deployment Lead:** @INFRA_DEVOPS
- **QA Lead:** @QA
- **On-Call:** Check STATUS.md

## References

- Proposal: `openspec/changes/enhance-bug-system-phase1/proposal.md`
- Spec: `openspec/changes/enhance-bug-system-phase1/specs/operations/spec.md`
- Analysis: `docs/analysis/bugbot-integration-analysis.md`

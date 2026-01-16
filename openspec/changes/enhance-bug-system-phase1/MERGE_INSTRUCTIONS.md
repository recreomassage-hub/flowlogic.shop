# Merge Instructions - Phase 1 Enhancements

## Overview

This document provides instructions for merging Phase 1 enhancements to the bug finding and fixing system.

## Changes Summary

**Phase 1 Enhancements:**
- ✅ OpenSpec integration for bug discovery
- ✅ Solution Rate metric tracking
- ✅ Confidence Score for bug fixes

## Files to Commit

### New Files
```
scripts/
├── openspec-rules-parser.sh
└── calculate-solution-rate.sh

docs/
├── metrics/solution-rate-dashboard.md
└── analysis/bugbot-integration-analysis.md

openspec/changes/enhance-bug-system-phase1/
├── proposal.md
├── tasks.md
├── README.md
├── IMPLEMENTATION_STATUS.md
├── STAGING_DEPLOYMENT.md
├── MERGE_INSTRUCTIONS.md
└── specs/operations/spec.md
```

### Modified Files
```
scripts/
├── bug-hunter.sh (Phase 3: OpenSpec Rules Checking)
└── update-beads-on-fix.sh (Solution Rate tracking)

.claude/agents/
└── bug-fixer.md (Confidence Score)

.github/workflows/
└── bug-hunter.yml (Solution Rate calculation + alerts)
```

## Commit Message

```bash
feat: Phase 1 enhancements - OpenSpec integration, Solution Rate, Confidence Score

Implements Phase 1 enhancements to bug finding and fixing system:

- OpenSpec Integration:
  * OpenSpec rules parser (extracts rules from project.md)
  * Bug Hunter Phase 3: OpenSpec Rules Checking
  * Metadata-based priority adjustment (x-reliability, x-critical-path)

- Solution Rate Metric:
  * Calculation script with JSON/Markdown output
  * Tracking in Beads issues (solution_status field)
  * Dashboard template
  * GitHub Actions alerts (Solution Rate < 60%, False Positive Rate > 30%)

- Confidence Score:
  * 5-component calculation (Root Cause, Pattern, Tests, Quality, Risk)
  * Decision logic for automation
  * Integration in Bug Fixer Agent

Files:
- scripts/openspec-rules-parser.sh (NEW)
- scripts/calculate-solution-rate.sh (NEW)
- scripts/bug-hunter.sh (MODIFIED - Phase 3 added)
- scripts/update-beads-on-fix.sh (MODIFIED - Solution Rate tracking)
- .claude/agents/bug-fixer.md (MODIFIED - Confidence Score)
- .github/workflows/bug-hunter.yml (MODIFIED - metrics + alerts)
- docs/metrics/solution-rate-dashboard.md (NEW)
- docs/analysis/bugbot-integration-analysis.md (NEW)
- openspec/changes/enhance-bug-system-phase1/ (NEW)

References:
- Analysis: docs/analysis/bugbot-integration-analysis.md
- Proposal: openspec/changes/enhance-bug-system-phase1/proposal.md
- Deployment: openspec/changes/enhance-bug-system-phase1/STAGING_DEPLOYMENT.md
```

## Merge Steps

### Option 1: Direct Merge to Develop

```bash
# 1. Ensure you're on develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch (if not already created)
git checkout -b feat/enhance-bug-system-phase1

# 3. Add Phase 1 files
git add scripts/openspec-rules-parser.sh \
        scripts/calculate-solution-rate.sh \
        scripts/bug-hunter.sh \
        scripts/update-beads-on-fix.sh \
        .claude/agents/bug-fixer.md \
        .github/workflows/bug-hunter.yml \
        docs/metrics/solution-rate-dashboard.md \
        docs/analysis/bugbot-integration-analysis.md \
        openspec/changes/enhance-bug-system-phase1/

# 4. Commit
git commit -m "feat: Phase 1 enhancements - OpenSpec integration, Solution Rate, Confidence Score

Implements Phase 1 enhancements to bug finding and fixing system:
- OpenSpec integration for bug discovery
- Solution Rate metric tracking
- Confidence Score for bug fixes

See openspec/changes/enhance-bug-system-phase1/ for details."

# 5. Push
git push origin feat/enhance-bug-system-phase1

# 6. Create PR to develop
gh pr create --base develop --title "feat: Phase 1 enhancements - OpenSpec integration, Solution Rate, Confidence Score" --body-file openspec/changes/enhance-bug-system-phase1/MERGE_INSTRUCTIONS.md
```

### Option 2: Merge Current Branch

If you're already on a feature branch with these changes:

```bash
# 1. Ensure all Phase 1 files are staged
git add scripts/openspec-rules-parser.sh \
        scripts/calculate-solution-rate.sh \
        scripts/bug-hunter.sh \
        scripts/update-beads-on-fix.sh \
        .claude/agents/bug-fixer.md \
        .github/workflows/bug-hunter.yml \
        docs/metrics/solution-rate-dashboard.md \
        docs/analysis/bugbot-integration-analysis.md \
        openspec/changes/enhance-bug-system-phase1/

# 2. Commit
git commit -m "feat: Phase 1 enhancements - OpenSpec integration, Solution Rate, Confidence Score"

# 3. Push
git push origin <your-branch-name>

# 4. Create PR to develop
gh pr create --base develop --title "feat: Phase 1 enhancements - OpenSpec integration, Solution Rate, Confidence Score"
```

## Pre-Merge Checklist

- [ ] All Phase 1 files are added
- [ ] Commit message follows convention
- [ ] No unrelated files in commit
- [ ] Documentation is complete
- [ ] Scripts are executable (chmod +x)

## Post-Merge Steps

1. **Monitor GitHub Actions:**
   - Verify Bug Hunter workflow runs successfully
   - Check for OpenSpec parsing errors
   - Verify Solution Rate calculation works

2. **Staging Deployment:**
   - Follow `STAGING_DEPLOYMENT.md`
   - Monitor for 24-48 hours
   - Collect metrics for 2 weeks

3. **Calibration:**
   - Review Solution Rate metrics
   - Calibrate OpenSpec rules if needed
   - Adjust thresholds based on data

## Rollback Plan

If issues are detected after merge:

```bash
# Revert the commit
git revert <commit-hash>
git push origin develop
```

## Success Criteria

**Merge is successful if:**
- ✅ All files committed
- ✅ GitHub Actions workflows pass
- ✅ No errors in OpenSpec parsing
- ✅ Solution Rate calculation works
- ✅ Documentation is accessible

## References

- Proposal: `openspec/changes/enhance-bug-system-phase1/proposal.md`
- Tasks: `openspec/changes/enhance-bug-system-phase1/tasks.md`
- Spec: `openspec/changes/enhance-bug-system-phase1/specs/operations/spec.md`
- Deployment: `openspec/changes/enhance-bug-system-phase1/STAGING_DEPLOYMENT.md`
- Analysis: `docs/analysis/bugbot-integration-analysis.md`

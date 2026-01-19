# Pull Request Instructions

**Branch:** `test/bug-hunter-integration`  
**Base:** `develop`  
**Status:** ✅ Ready for PR creation

---

## Create Pull Request

### Option 1: GitHub Web UI (Recommended)

1. **Open link:**
   https://github.com/recreomassage-hub/flowlogic.shop/compare/develop...test/bug-hunter-integration

2. **Fill PR details:**
   - **Title:** `feat: Systematic Bug Finding and Fixing System`
   - **Description:** (see below)

3. **Click "Create Pull Request"**

### Option 2: GitHub CLI

```bash
# First, ensure develop is up to date
git fetch origin develop

# Then create PR
gh pr create \
  --title "feat: Systematic Bug Finding and Fixing System" \
  --base develop \
  --body "$(cat openspec/changes/add-systematic-bug-fixing/PR_INSTRUCTIONS.md | sed -n '/## PR Description/,/## Expected Behavior/p')"
```

---

## PR Description

```markdown
## Systematic Bug Finding and Fixing System

Implements systematic debugging methodology for OpenSpec+Beads workflow based on https://habr.com/ru/articles/984882/

### What's Included
- ✅ Systematic Debugging Skill (4-phase methodology)
- ✅ Bug Hunter Agent (automatic bug discovery)
- ✅ Bug Fixer Agent (systematic bug fixing)
- ✅ GitHub Actions integration (pre-merge + nightly)
- ✅ CloudWatch integration (alert-only)
- ✅ Comprehensive documentation

### Testing Status
- ✅ Local tests: PASS
- ⏳ GitHub Actions: PENDING (this PR)
- ⏳ Staging: PENDING
- ⏳ Production: PENDING

### Files Changed
- 21 files created/updated
- 5848+ lines added
- Core components, scripts, workflows, documentation

### Key Features
1. **4-Phase Systematic Debugging:**
   - Root Cause Analysis
   - Pattern Analysis (isolated vs systemic)
   - Fix Strategy (quick fix vs architectural)
   - Quality Gates

2. **Bug Hunter:**
   - Static analysis (ESLint, TypeScript)
   - Test analysis
   - CloudWatch log analysis
   - Automatic prioritization

3. **Bug Fixer:**
   - Applies systematic methodology
   - Architecture escalation (3 fixes rule)
   - Quality gates verification

4. **CI/CD Integration:**
   - Pre-merge: Fast mode, non-blocking
   - Nightly: Deep mode, scheduled (2 AM UTC)
   - CloudWatch analysis in nightly

### References
- Proposal: `openspec/changes/add-systematic-bug-fixing/`
- Deployment Guide: `openspec/changes/add-systematic-bug-fixing/DEPLOYMENT_GUIDE.md`
- Testing Report: `openspec/changes/add-systematic-bug-fixing/TESTING_REPORT.md`
- Implementation Summary: `openspec/changes/add-systematic-bug-fixing/IMPLEMENTATION_SUMMARY.md`

### Next Steps
1. Review and approve PR
2. Monitor GitHub Actions workflow (should run automatically)
3. After merge → Staging deployment
4. After staging (24-48h) → Production deployment
```

---

## Expected Behavior

### After PR Creation:

1. **GitHub Actions Workflow:**
   - "Bug Hunter (Pre-Merge)" job should trigger automatically
   - Fast mode executes (60s timeout)
   - If bugs found → PR comment created
   - PR should NOT be blocked (continue-on-error: true)

2. **Review Process:**
   - Review code changes
   - Check documentation
   - Verify workflow file syntax
   - Test locally if needed

3. **After Approval:**
   - Merge to `develop`
   - Staging deployment triggers automatically
   - Monitor for 24-48 hours

---

## Checklist for Reviewers

- [ ] Code quality: Scripts are well-structured
- [ ] Documentation: All docs are clear and complete
- [ ] Workflow: GitHub Actions workflow is correct
- [ ] Integration: Works with existing systems
- [ ] Testing: Local tests passed
- [ ] Security: No secrets in code

---

## Troubleshooting

### If PR creation fails:

1. **Check branch exists:**
   ```bash
   git fetch origin
   git branch -r | grep bug-hunter-integration
   ```

2. **Verify commits:**
   ```bash
   git log origin/develop..HEAD --oneline
   ```

3. **Create PR manually via GitHub UI:**
   https://github.com/recreomassage-hub/flowlogic.shop/compare/develop...test/bug-hunter-integration

---

**Last Updated:** 2026-01-14  
**Ready for:** PR creation and review

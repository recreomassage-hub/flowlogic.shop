# Bug Hunter Testing Guide

**Version:** MVP  
**Date:** 2026-01-14  
**Purpose:** Testing Bug Hunter integration on staging

---

## Pre-Testing Checklist

- [ ] GitHub Actions workflow file created (`.github/workflows/bug-hunter.yml`)
- [ ] `scripts/bug-hunter.sh` supports `--mode` and `--timeout` flags
- [ ] `scripts/bug-hunter-cloudwatch.sh` created and executable
- [ ] AWS credentials configured (for CloudWatch integration)
- [ ] Beads CLI installed (optional, for issue creation)

---

## Test 1: Local Bug Hunter (Fast Mode)

### Steps

```bash
# 1. Test fast mode (60s timeout, only critical checks)
./scripts/bug-hunter.sh --mode fast --timeout 60

# Expected output:
# - Only ESLint and TypeScript checks
# - No test execution
# - Quick completion (< 60s)
```

### Verification

- [ ] Script runs without errors
- [ ] Only critical checks are performed
- [ ] Completes within timeout
- [ ] Output shows mode and timeout

### Expected Output

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

📊 Summary
==========
Total bugs found: X
  - CRITICAL: X
  - HIGH: 0
  - MEDIUM: 0
  - LOW: 0
```

---

## Test 2: Local Bug Hunter (Deep Mode)

### Steps

```bash
# 2. Test deep mode (300s timeout, all checks)
./scripts/bug-hunter.sh --mode deep --timeout 300

# Expected output:
# - All checks (ESLint, TypeScript, Tests)
# - Full analysis
# - Detailed report
```

### Verification

- [ ] Script runs all checks
- [ ] Tests are executed
- [ ] Completes within timeout
- [ ] Detailed output provided

---

## Test 3: CloudWatch Integration

### Prerequisites

```bash
# Configure AWS credentials
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret

# Or use AWS CLI configure
aws configure
```

### Steps

```bash
# 3. Test CloudWatch analysis
./scripts/bug-hunter-cloudwatch.sh

# Expected output:
# - CloudWatch logs analyzed
# - Critical/high errors detected
# - Recommendations provided
```

### Verification

- [ ] AWS CLI available and configured
- [ ] Log group accessible
- [ ] Errors detected (if any)
- [ ] Recommendations provided

### Expected Output (No Errors)

```
🔍 Bug Hunter CloudWatch: Analyzing production logs...
Region: us-east-1
Log Group: /aws/lambda/flowlogic-api
Lookback: 1 hour(s)

📋 Checking for critical errors...
✓ No critical errors found

📋 Checking for high priority errors...
✓ No high priority errors found

📊 CloudWatch Analysis Summary
==============================
Critical errors: 0
High priority errors: 0

✅ No production errors detected in last 1 hour(s)
```

### Expected Output (With Errors)

```
🔍 Bug Hunter CloudWatch: Analyzing production logs...
...

📋 Checking for critical errors...
🔴 CRITICAL: Production errors detected
  - TypeError: Cannot read property 'email' of null
  - ReferenceError: user is not defined

📊 CloudWatch Analysis Summary
==============================
Critical errors: 2
High priority errors: 0

⚠️  Action Required:
   1. Review CloudWatch logs: https://console.aws.amazon.com/...
   2. Create Beads issues for new error patterns
   3. Investigate root cause using systematic-debugging methodology
```

---

## Test 4: GitHub Actions (Pre-Merge)

### Steps

1. Create a test branch:
   ```bash
   git checkout -b test/bug-hunter-pre-merge
   ```

2. Make a small change (introduce a TypeScript error):
   ```typescript
   // Add to any .ts file
   const test: string = 123; // Type error
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "test: bug-hunter pre-merge check"
   git push origin test/bug-hunter-pre-merge
   ```

4. Create Pull Request to `develop` branch

5. Check GitHub Actions:
   - Go to Actions tab
   - Find "Bug Hunter" workflow
   - Verify it runs on PR

### Verification

- [ ] Workflow triggers on PR
- [ ] Fast mode runs (< 60s)
- [ ] PR comment created if bugs found
- [ ] PR is NOT blocked (continue-on-error: true)

### Expected GitHub Actions Output

```
Run Bug Hunter (Fast Mode)
🔍 Bug Hunter: Starting bug discovery...
Mode: fast, Timeout: 60s
...
CRITICAL: src/test.ts:1:10 - Type 'number' is not assignable to type 'string'
...
⚠️  Bug Hunter: Found 1 bug(s)
```

---

## Test 5: GitHub Actions (Nightly)

### Steps

1. Manually trigger workflow:
   ```bash
   # Via GitHub UI: Actions → Bug Hunter → Run workflow
   # Or via GitHub CLI:
   gh workflow run bug-hunter.yml
   ```

2. Wait for completion (may take 5+ minutes)

3. Check artifacts:
   - Go to Actions → Bug Hunter (Nightly) → Summary
   - Download `bug-report-*.txt` artifact

### Verification

- [ ] Workflow runs successfully
- [ ] Deep mode executes
- [ ] CloudWatch analysis runs (if AWS configured)
- [ ] Report artifact created
- [ ] Summary visible in Actions

### Expected Artifacts

- `bug-report-YYYYMMDD.txt` - Full report
- Summary in GitHub Actions step summary

---

## Test 6: Integration with Beads (Optional)

### Prerequisites

```bash
# Install Beads CLI
npm install -g @beads/bd

# Verify installation
bd --version
```

### Steps

```bash
# 1. Run bug-hunter
./scripts/bug-hunter.sh --mode deep

# 2. Manually create Beads issues for found bugs
bd create "TypeError in users.ts:42" \
  --type bug \
  --priority CRITICAL \
  --description "TypeScript error: Object is possibly 'null'"

# 3. Verify issue created
bd list --type bug
```

### Verification

- [ ] Beads CLI works
- [ ] Issues created successfully
- [ ] Issues visible in Beads

---

## Troubleshooting

### Issue: Script fails with "command not found"

**Solution:**
```bash
# Make scripts executable
chmod +x scripts/bug-hunter.sh
chmod +x scripts/bug-hunter-cloudwatch.sh
```

### Issue: GitHub Actions workflow doesn't trigger

**Solution:**
- Check workflow file syntax (YAML)
- Verify `on:` triggers are correct
- Check branch names match

### Issue: CloudWatch analysis fails

**Solution:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check log group exists
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/

# Verify region
export AWS_REGION=us-east-1
```

### Issue: Timeout too short

**Solution:**
```bash
# Increase timeout
./scripts/bug-hunter.sh --mode deep --timeout 600
```

---

## Success Criteria

- [x] Local fast mode works (< 60s)
- [x] Local deep mode works (< 300s)
- [x] CloudWatch integration works (if AWS configured)
- [x] GitHub Actions pre-merge triggers on PR
- [x] GitHub Actions nightly runs on schedule
- [x] Reports generated and uploaded
- [x] No false positives (verify manually)

---

## Next Steps After Testing

1. **Monitor for 1 week:**
   - Check nightly reports
   - Review PR comments
   - Verify no false positives

2. **Iterate:**
   - Adjust timeout if needed
   - Fine-tune error patterns
   - Add more checks if needed

3. **Document findings:**
   - Update this guide with lessons learned
   - Share results with team

---

## References

- Bug Hunter Agent: `.claude/agents/bug-hunter.md`
- Integration Guide: `docs/operations/bug-hunter-integration.md`
- Workflow File: `.github/workflows/bug-hunter.yml`
- Scripts: `scripts/bug-hunter.sh`, `scripts/bug-hunter-cloudwatch.sh`

# Debug Hypotheses for CI/CD Pipeline #130 Failure

## Runtime Evidence Required

**Status:** Pipeline failed again after heredoc fix (commit ab2b2b7)

## New Hypotheses (after previous fixes)

### Hypothesis A: Script execution failure
**Description:** `infrastructure-compliance-check.sh` fails due to missing dependencies or AWS credentials
**Evidence needed:**
- Check if `jq` is installed in workflow
- Check if AWS credentials are configured before script runs
- Check script exit code

### Hypothesis B: Python script import error
**Description:** `aws-inventory-classifier.py` fails to import required modules
**Evidence needed:**
- Check if `pip install pyyaml boto3` runs before script execution
- Check Python version compatibility
- Check import errors in logs

### Hypothesis C: Workflow condition evaluation
**Description:** Job conditions fail due to null checks or event context
**Evidence needed:**
- Check which job actually runs
- Check `github.event_name` value
- Check `github.event.pull_request` value (if PR event)

### Hypothesis D: File path issues
**Description:** Scripts reference files that don't exist in GitHub Actions checkout
**Evidence needed:**
- Check if `infrastructure/infrastructure-spec.yaml` exists in checkout
- Check if `infrastructure/aws-inventory-config.yaml` exists
- Check working directory in workflow

### Hypothesis E: AWS API call failure
**Description:** `resourcegroupstaggingapi get-resources` fails due to permissions or region
**Evidence needed:**
- Check AWS credentials validity
- Check IAM permissions for Resource Groups Tagging API
- Check region configuration

## Instrumentation Plan

1. Add explicit error handling in `infrastructure-compliance-check.sh`
2. Add debug output for each step
3. Add file existence checks before script execution
4. Add AWS credentials validation before API calls

## Next Steps

1. Request GitHub Actions logs from user
2. Add instrumentation to scripts
3. Test locally if possible
4. Fix based on runtime evidence

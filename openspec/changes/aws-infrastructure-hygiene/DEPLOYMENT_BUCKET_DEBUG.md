# Debug: Serverless Framework Deployment Bucket Access

## Runtime Evidence

**Error from logs:**
```
Error:
Could not access the deployment bucket. Make sure you have sufficient permissions to access it.
❌ Deployment failed
```

## Hypotheses

### Hypothesis A: AWS Credentials Not Passed to Serverless
**Description:** AWS credentials configured in GitHub Actions but not available to Serverless Framework process
**Evidence needed:**
- Check if `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in deployment step
- Check if credentials are available to `serverless deploy` command
- Check if `aws sts get-caller-identity` works before deployment

### Hypothesis B: IAM Permissions Missing
**Description:** AWS credentials work but IAM user/role lacks S3 permissions for deployment bucket
**Evidence needed:**
- Check IAM permissions for S3 bucket operations
- Check if deployment bucket exists
- Check if user can list/create S3 buckets

### Hypothesis C: Deployment Bucket Not Specified
**Description:** Serverless Framework tries to use default bucket but can't create/access it
**Evidence needed:**
- Check if `deploymentBucket` is specified in serverless.yml
- Check if default bucket naming convention is used
- Check if bucket exists in AWS account

### Hypothesis D: Region Mismatch
**Description:** Deployment bucket in different region than deployment
**Evidence needed:**
- Check AWS_REGION environment variable
- Check serverless.yml region configuration
- Check bucket region

## Instrumentation Added

1. **Pre-deployment checks:**
   - AWS credentials validation
   - AWS identity verification
   - S3 bucket listing test

2. **Deployment bucket diagnostics:**
   - Extract deployment bucket name from config
   - Check bucket existence and permissions
   - Test S3 access before deployment

3. **Post-failure diagnostics:**
   - Re-check AWS identity after failure
   - Test S3 permissions after failure

## Next Steps

1. Run workflow with instrumentation
2. Analyze logs to confirm/reject hypotheses
3. Fix based on runtime evidence

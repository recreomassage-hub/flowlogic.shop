# 📋 Check Deployment Logs

## Latest Backend Deployment Run

**Run ID:** 21124676113  
**Status:** Failed  
**Duration:** 3m40s  
**URL:** https://github.com/recreomassage-hub/flowlogic.shop/actions/runs/21124676113

## How to Check Logs

1. Open the URL above in your browser
2. Click on "Deploy to Dev" job (red X icon)
3. Click on "Deploy to AWS (Dev)" step (failed step)
4. Scroll to the bottom of the logs
5. Look for error messages (usually marked with ✖ or ×)

## What to Look For

Common error patterns:
- `Access denied`
- `not authorized to perform`
- `permission`
- `✖` or `×` symbols
- `Error:` or `ServerlessError`

## Progress So Far

✅ Fixed:
1. SSM permissions for `/serverless-framework/*`
2. S3 CreateBucket for `serverless-framework-deployments-*`
3. S3 GetBucketLocation for bucket verification
4. S3 object permissions (GetObject, PutObject, DeleteObject)
5. CloudFormation ValidateTemplate (global)

## Next Steps

After checking logs:
1. Copy the error message
2. Share it with me
3. I'll fix the next permission issue

## Alternative: Check via CLI

If logs become available via CLI:
```bash
gh run view 21124676113 --log-failed
```

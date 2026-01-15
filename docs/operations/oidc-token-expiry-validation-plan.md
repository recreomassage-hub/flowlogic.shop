# Validation Plan: OIDC Token Expiry Robust Solution

**Date:** 2026-01-14  
**Bug ID:** llm-os-project flowlogic.shop-a3o  
**Status:** Validation In Progress

## Test на Staging

### 1. Запустить workflow на staging

**Workflow:** `.github/workflows/test-early-secrets-staging.yml`

**Steps:**
1. Push to `develop` branch or manually trigger workflow
2. Monitor workflow execution in GitHub Actions
3. Check logs for each step

**Expected Results:**
- ✅ OIDC configuration successful
- ✅ Early secrets loading successful
- ✅ Caching successful
- ✅ OIDC token still valid after delay
- ✅ Cached secrets restored

**Command:**
```bash
# Manual trigger via GitHub CLI
gh workflow run test-early-secrets-staging.yml --ref develop
```

### 2. Проверить early secrets loading

**Checkpoints:**
- [ ] Step "Load ALL SSM Parameters Early" completes successfully
- [ ] SSM parameters loaded (count > 0 or empty if not exist in staging)
- [ ] Parameters saved to `$GITHUB_ENV`
- [ ] Cache step completes

**Validation:**
```bash
# Check workflow logs for:
# ✅ Loaded X SSM parameters
# ✅ SSM parameters loaded successfully
```

### 3. Валидировать metrics отправку

**Checkpoints:**
- [ ] `send-oidc-metrics.sh` script executes
- [ ] Metrics sent to CloudWatch (WorkflowDuration, OIDCTokenExpiryEvents)
- [ ] No errors in metrics sending

**Validation:**
```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace FlowLogic/Workflows \
  --metric-name WorkflowDuration \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Maximum \
  --region us-east-1
```

## Monitor Metrics

### 1. Проверить CloudWatch Dashboard

**Dashboard:** `flowlogic-oidc-token-monitoring`

**Access:**
```bash
# Get dashboard URL
aws cloudwatch get-dashboard \
  --dashboard-name flowlogic-oidc-token-monitoring \
  --region us-east-1 \
  --query 'DashboardBody' \
  --output text | jq '.'
```

**Or via AWS Console:**
- Navigate to CloudWatch → Dashboards
- Open `flowlogic-oidc-token-monitoring`

**Metrics to Monitor:**
- `SSMFallbackUsage` - Should be 0 (no fallback usage)
- `WorkflowDuration` - Should be < 3600 seconds
- `OIDCTokenExpiryEvents` - Should be 0

### 2. Убедиться, что alarms настроены

**Alarms:**
1. `flowlogic-ssm-fallback-usage` (P1)
2. `flowlogic-workflow-duration-long` (P2)
3. `flowlogic-oidc-token-expiry-events` (P0)

**Check:**
```bash
aws cloudwatch describe-alarms \
  --alarm-name-prefix flowlogic \
  --region us-east-1 \
  --query 'MetricAlarms[*].[AlarmName,StateValue,AlarmDescription]' \
  --output table
```

**Expected State:**
- All alarms should be in `OK` state initially
- Alarms will trigger if thresholds are exceeded

### 3. Подписаться на SNS topic (email)

**SNS Topic:** `flowlogic-oidc-token-expiry-alerts`

**Subscribe:**
```bash
# Get topic ARN
TOPIC_ARN=$(aws sns list-topics --region us-east-1 \
  --query 'Topics[?contains(TopicArn, `oidc-token-expiry`)].TopicArn' \
  --output text)

# Subscribe email
aws sns subscribe \
  --topic-arn "$TOPIC_ARN" \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1

# Or use script
./scripts/subscribe-sns-email.sh your-email@example.com
```

**Confirmation:**
- Check email inbox
- Click confirmation link in AWS SNS email
- Subscription status: `Confirmed`

## Run Regression Tests

### Test File: `tests/regression/oidc-token-expiry.test.ts`

**Run Tests:**
```bash
# From project root
npm test -- tests/regression/oidc-token-expiry.test.ts

# Or if tests are in backend
cd src/backend
npm test -- ../../tests/regression/oidc-token-expiry.test.ts
```

**Test Coverage:**
- [x] Workflow structure validation
- [x] Early secrets loading pattern
- [x] Monitoring integration
- [x] Error handling
- [x] CloudWatch configuration

**Expected Results:**
- All tests pass
- No regressions detected

## Validate Production

### 1. После успешного тестирования на staging

**Prerequisites:**
- [ ] Staging tests pass
- [ ] Metrics working correctly
- [ ] Alarms configured
- [ ] SNS subscriptions confirmed

**Deployment:**
- Production workflow already updated (`.github/workflows/ci-cd.yml`)
- Changes will be applied on next push to `main`

### 2. Мониторить первые несколько деплоев

**First 3 Deployments:**
- Monitor CloudWatch Dashboard
- Check workflow logs
- Verify metrics are sent
- Check for any errors

**Checklist:**
- [ ] OIDC configuration successful
- [ ] Early secrets loading successful
- [ ] No fallback usage (SSMFallbackUsage = 0)
- [ ] Workflow duration < 1 hour
- [ ] No token expiry events

### 3. Проверить, что fallback не используется

**Metrics to Check:**
```bash
# Check fallback usage (should be 0)
aws cloudwatch get-metric-statistics \
  --namespace FlowLogic/Workflows \
  --metric-name SSMFallbackUsage \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region us-east-1
```

**Expected:**
- `SSMFallbackUsage` = 0 for all periods
- No alarms triggered
- All workflows use OIDC successfully

**If Fallback Used:**
- Investigate why OIDC failed
- Check IAM role permissions
- Verify OIDC provider configuration
- Review workflow logs

## Success Criteria

### Immediate (First Deployment)
- [ ] Workflow completes successfully
- [ ] Early secrets loading works
- [ ] No fallback usage
- [ ] Metrics sent to CloudWatch

### Short-term (First Week)
- [ ] Zero fallback usage
- [ ] Zero token expiry events
- [ ] All workflows use OIDC
- [ ] Dashboard shows healthy metrics

### Long-term (First Month)
- [ ] Recurrence rate = 0%
- [ ] No incidents related to token expiry
- [ ] All workflows migrated
- [ ] Monitoring fully operational

## Troubleshooting

### If Early Secrets Loading Fails
1. Check OIDC configuration
2. Verify IAM role permissions for SSM
3. Check SSM parameter names
4. Review workflow logs

### If Metrics Not Sent
1. Verify `send-oidc-metrics.sh` script exists
2. Check AWS credentials in workflow
3. Verify CloudWatch permissions
4. Check script execution logs

### If Fallback Used
1. Check why OIDC failed
2. Review IAM trust policy
3. Verify OIDC provider
4. Check workflow timing

## Next Steps

1. ✅ Test workflow created
2. ⏭️ Run test on staging
3. ⏭️ Monitor metrics
4. ⏭️ Subscribe to SNS
5. ⏭️ Run regression tests
6. ⏭️ Validate production

# 🚀 Staging & Production Deployment Guide

## 📋 Prerequisites

1. **AWS Credentials configured:**
   ```bash
   aws configure
   # или используйте IAM role для CI/CD
   ```

2. **Serverless Framework installed:**
   ```bash
   npm install -g serverless
   ```

3. **Environment variables in SSM Parameter Store:**
   - `/flowlogic/staging/cognito/user-pool-id`
   - `/flowlogic/staging/cognito/client-id`
   - `/flowlogic/staging/stripe/secret-key`
   - `/flowlogic/prod/cognito/user-pool-id`
   - `/flowlogic/prod/cognito/client-id`
   - `/flowlogic/prod/stripe/secret-key`

---

## 🔄 Staging Deployment

### 1. Build Backend

```bash
cd src/backend
npm run build
```

### 2. Deploy to Staging

```bash
cd infra/serverless
serverless deploy --stage staging --region us-east-1
```

### 3. Verify Deployment

```bash
# Get endpoint
serverless info --stage staging

# Test health endpoint
curl https://your-staging-endpoint.execute-api.us-east-1.amazonaws.com/staging/health

# View logs
serverless logs -f api --stage staging --tail
```

---

## 🎯 Production Deployment

### 1. Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code review approved
- [ ] Staging deployment verified
- [ ] Database migrations ready
- [ ] SSM parameters configured
- [ ] Monitoring alerts configured
- [ ] Rollback plan prepared

### 2. Build Backend

```bash
cd src/backend
npm run build
```

### 3. Deploy to Production

```bash
cd infra/serverless
serverless deploy --stage prod --region us-east-1
```

### 4. Post-deployment Verification

```bash
# Get endpoint
serverless info --stage prod

# Test health endpoint
curl https://api.flowlogic.shop/health

# Test API endpoints
curl https://api.flowlogic.shop/

# Monitor logs
serverless logs -f api --stage prod --tail

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=flowlogic-backend-prod-api \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

---

## 📊 Monitoring Setup

### CloudWatch Alarms

Create alarms for:
- Lambda errors
- Lambda duration
- API Gateway 4xx/5xx errors
- DynamoDB throttling

### Structured Logging

All logs are structured JSON for easy parsing:
```json
{
  "timestamp": "2025-12-26T02:14:14.369Z",
  "level": "ERROR",
  "message": "Error message",
  "path": "/v1/auth/login",
  "method": "POST",
  "requestId": "abc123"
}
```

---

## 🔄 Rollback Procedure

### Quick Rollback

```bash
# List previous deployments
serverless deploy list --stage prod

# Rollback to previous version
serverless rollback --stage prod --timestamp <timestamp>
```

### Manual Rollback

1. Identify previous working version
2. Update `serverless.yml` if needed
3. Redeploy: `serverless deploy --stage prod`
4. Verify health endpoint
5. Monitor logs for errors

---

## 🔐 Security Checklist

- [ ] All secrets in SSM Parameter Store (SecureString)
- [ ] IAM roles use least privilege
- [ ] API Gateway throttling enabled
- [ ] CORS configured correctly
- [ ] CloudWatch Logs encryption enabled
- [ ] VPC configuration (if required)

---

## 📝 Environment-Specific Configuration

### Staging

- **Frontend URL:** `https://staging.flowlogic.shop`
- **API URL:** `https://staging-api.flowlogic.shop`
- **Log Retention:** 7 days
- **Error Notifications:** Slack channel

### Production

- **Frontend URL:** `https://flowlogic.shop`
- **API URL:** `https://api.flowlogic.shop`
- **Log Retention:** 30 days
- **Error Notifications:** PagerDuty + Slack

---

## 🚨 Troubleshooting

### Common Issues

1. **Deployment fails:**
   - Check AWS credentials
   - Verify SSM parameters exist
   - Check IAM permissions

2. **API returns 502:**
   - Check Lambda logs
   - Verify handler path
   - Check environment variables

3. **CORS errors:**
   - Verify FRONTEND_URL in environment
   - Check API Gateway CORS configuration

---

## 📚 Additional Resources

- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)




# 🔧 Troubleshooting Guide — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-22

---

## 📋 Table of Contents

1. [Common Issues](#common-issues)
2. [Authentication Issues](#authentication-issues)
3. [API Issues](#api-issues)
4. [Video Upload Issues](#video-upload-issues)
5. [Deployment Issues](#deployment-issues)
6. [Database Issues](#database-issues)
7. [Performance Issues](#performance-issues)

---

## 🔍 Common Issues

### Issue: "Page not found" or 404 errors

**Symptoms:**
- Page returns 404
- Routes not working

**Solutions:**
1. **Check URL:** Ensure you're using the correct URL
2. **Clear browser cache:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check routing:** Verify React Router configuration
4. **Check deployment:** Verify frontend is deployed correctly

---

### Issue: "Network error" or "Failed to fetch"

**Symptoms:**
- API calls fail
- "Network error" in console

**Solutions:**
1. **Check API URL:** Verify `VITE_API_URL` is correct
2. **Check CORS:** Verify CORS is configured in API Gateway
3. **Check network:** Verify internet connection
4. **Check API status:** Verify API Gateway is accessible

---

### Issue: "Invalid token" or authentication errors

**Symptoms:**
- "Unauthorized" errors
- Token expiration errors

**Solutions:**
1. **Logout and login again:** Refresh token may be expired
2. **Clear browser storage:** Clear localStorage and cookies
3. **Check token expiration:** JWT tokens expire after 15 minutes
4. **Check refresh token:** Verify refresh token is in httpOnly cookie

See [Authentication Issues](#authentication-issues) for more details.

---

## 🔐 Authentication Issues

### Issue: Can't register new account

**Symptoms:**
- Registration form doesn't submit
- "Email already exists" error

**Solutions:**
1. **Check email format:** Ensure email is valid
2. **Check password strength:** Minimum 8 characters
3. **Check wellness disclaimer:** Must be accepted
4. **Check duplicate email:** Email may already be registered

---

### Issue: Can't login

**Symptoms:**
- "Invalid email or password" error
- Login form doesn't submit

**Solutions:**
1. **Verify credentials:** Check email and password are correct
2. **Check email format:** Ensure email is entered correctly
3. **Reset password:** Use password reset if available
4. **Check account status:** Account may be disabled

---

### Issue: Token expires too quickly

**Symptoms:**
- Frequent "Unauthorized" errors
- Need to login repeatedly

**Solutions:**
1. **Check token expiration:** Access tokens expire after 15 minutes
2. **Use refresh token:** Refresh token should auto-refresh access token
3. **Check refresh token:** Verify refresh token is in httpOnly cookie
4. **Check token refresh logic:** Verify frontend refresh logic is working

---

## 📡 API Issues

### Issue: API returns 500 Internal Server Error

**Symptoms:**
- API calls return 500
- "Internal server error" message

**Solutions:**
1. **Check CloudWatch Logs:** View Lambda function logs
2. **Check API Gateway logs:** View API Gateway access logs
3. **Check environment variables:** Verify all required env vars are set
4. **Check database connection:** Verify DynamoDB is accessible

---

### Issue: API returns 403 Forbidden

**Symptoms:**
- "Forbidden" errors
- Tier gating errors

**Solutions:**
1. **Check tier:** Verify user has required tier (Basic+)
2. **Check subscription:** Verify subscription is active
3. **Check tier gating:** Verify tier gating middleware is working
4. **Check permissions:** Verify IAM roles have correct permissions

---

### Issue: API returns 429 Too Many Requests

**Symptoms:**
- "Rate limit exceeded" errors
- Too many requests error

**Solutions:**
1. **Wait and retry:** Rate limits reset after time window
2. **Check rate limits:** Verify you're not exceeding limits
3. **Reduce request frequency:** Implement request throttling
4. **Check API Gateway throttling:** Verify throttling settings

---

## 🎥 Video Upload Issues

### Issue: Video upload fails

**Symptoms:**
- Upload progress stops
- "Upload failed" error

**Solutions:**
1. **Check file size:** Videos should be < 100MB
2. **Check video format:** Supported formats: MP4, WebM
3. **Check network:** Verify stable internet connection
4. **Check S3 permissions:** Verify S3 bucket permissions
5. **Check presigned URL:** Verify presigned URL is valid and not expired

---

### Issue: Video processing fails

**Symptoms:**
- Processing status stuck
- "Processing failed" error

**Solutions:**
1. **Check video quality:** Ensure good lighting and clear video
2. **Check MediaPipe validation:** Video may fail MediaPipe quality gates
3. **Check video duration:** Maximum 45 seconds
4. **Check motion detection:** Ensure sufficient movement in video
5. **Retry upload:** You can retry up to 3 times per day per test

---

### Issue: Video validation errors

**Symptoms:**
- "TOO_LONG" error
- "NO_MOTION" error
- "BAD_LIGHTING" error

**Solutions:**
1. **TOO_LONG:** Reduce video duration to < 45 seconds
2. **NO_MOTION:** Ensure sufficient movement in video
3. **BAD_LIGHTING:** Improve lighting conditions
4. **LOW_CONFIDENCE:** Reposition camera, improve video quality
5. **Follow instructions:** Review test instructions carefully

---

## 🚀 Deployment Issues

### Issue: Backend deployment fails

**Symptoms:**
- `serverless deploy` fails
- Deployment errors

**Solutions:**
1. **Check AWS credentials:** Verify AWS credentials are configured
2. **Check IAM permissions:** Verify IAM user/role has required permissions
3. **Check Serverless Framework version:** Use Serverless Framework 3.x
4. **Check serverless.yml:** Verify configuration is correct
5. **Check CloudWatch logs:** View deployment logs for errors

---

### Issue: Frontend deployment fails

**Symptoms:**
- Vercel deployment fails
- Build errors

**Solutions:**
1. **Check build logs:** View Vercel build logs
2. **Check environment variables:** Verify all required env vars are set
3. **Check Node.js version:** Verify Node.js version is correct
4. **Check dependencies:** Verify all dependencies are installed
5. **Check build script:** Verify `npm run build` works locally

---

### Issue: CI/CD pipeline fails

**Symptoms:**
- GitHub Actions workflow fails
- Automated deployment fails

**Solutions:**
1. **Check workflow logs:** View GitHub Actions logs
2. **Check secrets:** Verify GitHub secrets are set correctly
3. **Check branch:** Verify workflow triggers on correct branch
4. **Check permissions:** Verify GitHub Actions has required permissions
5. **Check workflow file:** Verify workflow YAML is correct

---

## 🗄️ Database Issues

### Issue: DynamoDB connection errors

**Symptoms:**
- "Database connection failed" errors
- DynamoDB query errors

**Solutions:**
1. **Check IAM permissions:** Verify Lambda has DynamoDB permissions
2. **Check table names:** Verify table names match configuration
3. **Check region:** Verify DynamoDB is in correct region
4. **Check table existence:** Verify tables are created
5. **Check CloudWatch logs:** View Lambda logs for detailed errors

---

### Issue: Data not saving

**Symptoms:**
- Data not persisted
- "Save failed" errors

**Solutions:**
1. **Check write permissions:** Verify IAM role has write permissions
2. **Check table capacity:** Verify table has sufficient capacity
3. **Check data format:** Verify data matches schema
4. **Check validation:** Verify data passes validation
5. **Check CloudWatch logs:** View Lambda logs for errors

---

## ⚡ Performance Issues

### Issue: Slow API responses

**Symptoms:**
- API calls take too long
- Timeout errors

**Solutions:**
1. **Check Lambda timeout:** Increase Lambda timeout if needed
2. **Check cold starts:** First request may be slower (cold start)
3. **Check database queries:** Optimize DynamoDB queries
4. **Check API Gateway throttling:** Verify throttling settings
5. **Check CloudWatch metrics:** Monitor API latency

---

### Issue: Frontend slow to load

**Symptoms:**
- Pages load slowly
- Slow initial load

**Solutions:**
1. **Check bundle size:** Optimize bundle size
2. **Check CDN:** Verify Vercel CDN is working
3. **Check lazy loading:** Implement lazy loading for routes
4. **Check images:** Optimize images
5. **Check network:** Verify network connection

---

## 📞 Getting Help

### Self-Service

1. **Check documentation:**
   - [User Manual](docs/user_manual.md)
   - [API Documentation](docs/api_documentation.md)
   - [Developer Guide](docs/developer_guide.md)

2. **Check logs:**
   - CloudWatch Logs (backend)
   - Browser console (frontend)
   - Vercel logs (frontend)

3. **Check status:**
   - API health endpoint: `GET /health`
   - Vercel status page

### Contact Support

- **Email:** support@flowlogic.app
- **GitHub Issues:** [Create an issue](https://github.com/your-org/flowlogic-platform/issues)

### Reporting Issues

When reporting issues, include:
- **Description:** What happened?
- **Steps to reproduce:** How to reproduce the issue?
- **Expected behavior:** What should happen?
- **Actual behavior:** What actually happened?
- **Environment:** Browser, OS, device
- **Screenshots/Logs:** If applicable

---

**Last Updated:** 2025-12-22  
**Version:** 1.0






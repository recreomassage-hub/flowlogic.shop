# Serverless Framework v4 Setup Guide

## Access Key Configuration

Serverless Framework v4 requires an Access Key for authentication. The Access Key has been provided and should be configured in GitHub Secrets.

### GitHub Secrets

Add the following secret to GitHub repository:

**Secret Name:** `SERVERLESS_ACCESS_KEY`  
**Value:** `AKavghGiguPaJnN78VPvuHrqaWGlK0gSbzXlsOMT9WHZ9`

### Local Development Setup

For local development, configure the access key:

```bash
# Option 1: Environment variable
export SERVERLESS_ACCESS_KEY="AKavghGiguPaJnN78VPvuHrqaWGlK0gSbzXlsOMT9WHZ9"

# Option 2: Serverless Framework config file
serverless config credentials --provider serverless --key AKavghGiguPaJnN78VPvuHrqaWGlK0gSbzXlsOMT9WHZ9
```

### CI/CD Configuration

The CI/CD workflows have been updated to:
1. Install Serverless Framework v4
2. Configure Access Key from GitHub Secrets
3. Use built-in esbuild (no plugins needed)

### Changes Made

1. **package.json**: Updated `serverless` from `^3.38.0` to `^4.0.0`
2. **package.json**: Removed `serverless-plugin-typescript` (replaced by built-in esbuild)
3. **serverless.yml**: Updated framework version comment
4. **CI/CD workflows**: Added Access Key configuration steps

### Verification

Test the setup:

```bash
cd infra/serverless
npm install
serverless --version  # Should show v4.x
serverless package --stage dev  # Test build
```

### Troubleshooting

If you see authentication errors:
1. Verify `SERVERLESS_ACCESS_KEY` is set in GitHub Secrets
2. Check that the access key is valid in Serverless Framework Dashboard
3. Ensure the key has proper permissions for your organization

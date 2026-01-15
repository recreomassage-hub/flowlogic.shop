# Change: Early Secrets Loading Pattern for OIDC Token Expiry

## Why

**Problem:** OIDC токен истекает между получением (начало workflow) и чтением SSM параметров (позже в workflow). OIDC токены имеют TTL 1 час, но workflow может выполняться дольше или между шагами проходит много времени.

**Root Cause:** 
- OIDC токены имеют ограниченный срок действия (1 час)
- Workflow может выполняться долго (компиляция, тесты, деплой)
- SSM параметры читаются позже в workflow
- Нет механизма обновления токена

**Why Quick Fix is Insufficient:**
- Quick fix (Access Keys fallback) менее безопасен, чем OIDC
- Требует ручного rotation Access Keys
- Не решает проблему для других секретов (Secrets Manager)
- Не предотвращает рецидивы в других workflows

**Opportunity:** Implement robust solution that:
- Загружает все секреты на первом шаге (когда OIDC токен свежий)
- Кэширует секреты в GitHub Actions cache
- Использует кэшированные значения в последующих шагах
- Предотвращает рецидивы в других workflows

## What Changes

**Robust Solution Architecture:**

**Pattern: Early Secrets Loading + Caching**

1. **Early Secrets Loading:**
   - Загружать все SSM параметры на первом шаге workflow
   - Batch read всех параметров сразу (одним запросом)
   - Использовать OIDC токен, полученный в начале workflow

2. **Caching:**
   - Кэшировать секреты в GitHub Actions cache
   - Использовать кэшированные значения в последующих шагах
   - Ключ кэша: `ssm-params-${{ github.sha }}`

3. **Token Refresh (Optional):**
   - Проверять срок действия OIDC токена
   - Обновлять токен при необходимости (если workflow > 1 час)

**Implementation Approach:**

```yaml
# Step 1: Configure OIDC (early)
- name: Configure AWS credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1

# Step 2: Load ALL secrets early
- name: Load ALL SSM Parameters Early
  id: load-secrets
  run: |
    PARAMETERS=(
      "/flowlogic/production/database/url"
      "/flowlogic/production/api/keys"
      "/flowlogic/production/external/services"
    )
    
    aws ssm get-parameters \
      --names "${PARAMETERS[@]}" \
      --with-decryption \
      --query "Parameters[*].{Name:Name,Value:Value}" \
      --output json > ssm_parameters.json
    
    echo "SSM_PARAMETERS=$(cat ssm_parameters.json)" >> $GITHUB_ENV

# Step 3: Cache secrets
- name: Cache SSM Parameters
  uses: actions/cache/save@v3
  with:
    path: ssm_parameters.json
    key: ssm-params-${{ github.sha }}

# Step 4: Use cached secrets in later steps
- name: Deploy with parameters
  env:
    DATABASE_URL: ${{ fromJSON(env.SSM_PARAMETERS)[0].Value }}
    API_KEYS: ${{ fromJSON(env.SSM_PARAMETERS)[1].Value }}
  run: |
    ./deploy.sh --database-url "$DATABASE_URL" --api-keys "$API_KEYS"
```

**Migration Plan:**
- **Phase 1 (Week 1-2):** Design pattern, create OpenSpec proposal, review
- **Phase 2 (Week 3-4):** Implement in one workflow (ci-cd.yml), test on staging
- **Phase 3 (Month 2):** Migrate all workflows, validate approach
- **Phase 4 (Month 3-6):** Optimize caching, add token refresh if needed, remove Access Keys fallback (optional)

## Impact

**Affected Components:**
- `.github/workflows/ci-cd.yml` - production deployment workflow
- `.github/workflows/backend-deploy.yml` - backend deployment workflow
- Any other workflows using SSM Parameter Store

**Breaking Changes:**
- None expected
- Workflow structure changes (early secrets loading)
- Backward compatible (Access Keys fallback remains)

**Migration Requirements:**
- List all SSM parameters used in each workflow
- Update workflow to load secrets early
- Add caching step
- Test on staging before production
- Monitor for token expiry issues

## Success Metrics

**Immediate (1 month):**
- Zero incidents with expired tokens
- Robust solution designed
- OpenSpec proposal created

**Short-term (3 months):**
- Robust solution implemented in at least one workflow
- Tested on staging
- Recurrence rate < 5%

**Long-term (6 months):**
- All workflows migrated
- Access Keys fallback removed (optional)
- Recurrence rate < 2%
- Architecture improved

## Prevention Mechanisms

**Automated Prevention:**
- GitHub Action for PR analysis (prevent-similar-bugs.yml)
- Automated detection of similar patterns
- Recommendations for improvements

**Monitoring:**
- CloudWatch metrics for SSM access
- Alarms for token expiry events
- Beads automatic records

**Regression Tests:**
- Automated test for OIDC token expiry
- Test for early secrets loading pattern
- Integration test for workflow timing

## Related

- **Beads Issue:** llm-os-project flowlogic.shop-a3o
- **Quick Fix:** Access Keys fallback (already implemented)
- **Original Bug:** OIDC Token Expiry при чтении SSM параметров
- **ADR:** docs/decisions/adr-early-secrets-loading-pattern.md
- **Analysis:** docs/operations/bug-a3o-v2-analysis.md

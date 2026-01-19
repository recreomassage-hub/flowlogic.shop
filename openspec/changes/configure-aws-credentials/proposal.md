# Change: Настроить AWS credentials для всех окружений для автоматического деплоя

## Why

**Problem:** 
- В проекте используются разные подходы к настройке AWS credentials в разных workflow файлах
- `backend-deploy.yml` использует отдельные секреты для каждого окружения (DEV, STAGING, PROD)
- `ci-cd.yml` имеет сложную логику с проверкой OIDC и fallback на Access Keys
- Нет единой документации по настройке credentials для всех окружений
- Отсутствует валидация наличия необходимых секретов перед деплоем
- Риск деплоя с неправильными credentials или их отсутствием

**Opportunity:**
- Унифицировать конфигурацию AWS credentials во всех workflow
- Обеспечить автоматический деплой для всех окружений (dev, staging, production)
- Использовать комбинированный подход: GitHub Environments для dev/staging, AWS Secrets Manager для production
- Обязательно использовать OIDC для всех окружений (безопаснее, чем Access Keys)
- Добавить проверки и валидацию credentials перед деплоем
- Создать четкую документацию по настройке секретов

## What Changes

**Additions:**
- Унифицированная конфигурация AWS credentials во всех GitHub Actions workflow
- **Комбинированный подход:**
  - GitHub Environments для dev/staging (секреты: `AWS_ACCESS_KEY_ID`, `DATABASE_URL`, `API_KEY_PREFIX`)
  - AWS Secrets Manager для production (секреты: `/flowlogic/production/database/credentials`, `/flowlogic/production/payment/gateway`, `/flowlogic/production/encryption/keys`)
- **Обязательное использование OIDC** для всех окружений (через `aws-actions/configure-aws-credentials@v4` с `role-to-assume`)
- Валидация наличия необходимых секретов перед деплоем
- Документация по настройке AWS credentials для всех окружений
- Скрипт для проверки конфигурации credentials
- Настройка OIDC Provider в AWS для GitHub Actions

**MODIFIED:**
- `.github/workflows/backend-deploy.yml` — унификация конфигурации credentials
- `.github/workflows/ci-cd.yml` — унификация конфигурации credentials
- Добавление проверок и валидации credentials

**No Breaking Changes:**
- Существующие секреты продолжают работать
- Обратная совместимость с текущими именами секретов

## Impact

**Affected specs:**
- `infrastructure` — ADDED требования к настройке AWS credentials для CI/CD

**Affected code:**
- `.github/workflows/backend-deploy.yml` — обновление для OIDC + GitHub Environments (dev/staging) + AWS Secrets Manager (production) + fallback с мониторингом
- `.github/workflows/ci-cd.yml` — обновление для OIDC + GitHub Environments (dev/staging) + AWS Secrets Manager (production) + fallback с мониторингом
- `.github/workflows/frontend-deploy.yml` (если использует AWS)
- `docs/deployment/aws-credentials-setup.md` (новый файл) — инструкции по настройке OIDC, GitHub Environments, AWS Secrets Manager
- `docs/deployment/aws-oidc-setup.md` (новый файл) — детальные инструкции по настройке OIDC Provider
- `docs/deployment/secrets-classification.md` (новый файл) — классификация секретов по TIER 1/2/3
- `scripts/validate-aws-credentials.sh` (новый файл)
- `scripts/check-fallback-expiry.sh` (новый файл) — проверка истечения срока fallback
- `infra/iam/oidc-trust-policy.json` (новый файл) — trust policy для OIDC роли
- `infra/cloudwatch/fallback-monitoring.yml` (новый файл) — CloudWatch metrics и alarms для fallback

**Migration:**
- **Dev/Staging:** Миграция существующих секретов в GitHub Environments (dev, staging)
- **Production:** Настройка AWS Secrets Manager для хранения production секретов
- **OIDC:** Создание OIDC Provider в AWS и IAM ролей для каждого окружения
- **Workflow:** Обновление всех workflow для использования OIDC вместо Access Keys
- Документация помогает настроить недостающие компоненты

**Risks:**
- Если OIDC Provider не настроен, деплой будет блокирован (ожидаемое поведение)
- Необходимо настроить GitHub Environments для dev/staging
- Необходимо настроить AWS Secrets Manager для production
- Необходимо создать IAM роли с правильными trust policies для OIDC
- Fallback на Access Keys создает временный security risk (mitigated через автоматическое отключение через 14 дней)
- Необходимо настроить мониторинг и алерты для fallback использования

## Architecture Decision

**Комбинированный подход:**

**Тип 1: Environment-specific (GitHub Environments) — для dev/staging**
```
production:
  AWS_ROLE_ARN (для OIDC)
  DATABASE_URL
  API_KEY_PREFIX

staging:
  AWS_ROLE_ARN (для OIDC)
  DATABASE_URL
  API_KEY_PREFIX

dev:
  AWS_ROLE_ARN (для OIDC)
  DATABASE_URL
  API_KEY_PREFIX
```

**Тип 2: Sensitive production (AWS Secrets Manager) — для production**

**Классификация секретов по уровням критичности:**

**🔴 TIER 1: КРИТИЧЕСКИЕ (обязательно в Secrets Manager)**
```
/flowlogic/production/
  ├── payment/
  │   ├── stripe-secret-key (sk_live_...)
  │   ├── paypal-client-secret
  │   └── bank-api-keys
  ├── database/
  │   ├── rds-credentials
  │   ├── redis-auth-tokens
  │   └── connection-strings
  ├── encryption/
  │   ├── kms-key-ids
  │   ├── data-encryption-keys
  │   └── ssl-tls-private-keys
  └── authentication/
      ├── jwt-signing-secrets
      ├── oauth2-client-secrets
      └── saml-certificates
```

**🟡 TIER 2: ЧУВСТВИТЕЛЬНЫЕ (рекомендуется в Secrets Manager)**
```
/flowlogic/production/
  ├── external-apis/
  │   ├── sendgrid-api-key
  │   ├── mailgun-api-key
  │   ├── twilio-auth-token
  │   └── cloudinary-api-secret
  ├── service-accounts/
  │   ├── github-token-write
  │   └── cicd-pipeline-tokens
  └── business-critical/
      ├── analytics-keys (amplitude, mixpanel)
      └── monitoring-keys (datadog, newrelic)
```

**🟢 TIER 3: КОНФИГУРАЦИЯ (можно в GitHub Environments)**
- Feature flags
- Service URLs
- Rate limits and settings
- Non-sensitive API endpoints

**OIDC для всех окружений:**
- Обязательное использование OIDC через `aws-actions/configure-aws-credentials@v4`
- IAM роли для каждого окружения: `flowlogic-ci-cd-dev`, `flowlogic-ci-cd-staging`, `flowlogic-ci-cd-production`
- OIDC Provider: `token.actions.githubusercontent.com`

**Fallback на Access Keys (временный, с ограничениями):**
- ✅ Разрешен только на 2 недели после успешного OIDC деплоя
- ✅ Усиленный мониторинг использования fallback ключей (CloudWatch metrics + alerts)
- ✅ Автоматическое отключение через 14 дней после первого успешного OIDC деплоя
- ✅ Alert при каждом использовании fallback (Slack/email notification)
- ✅ Логирование всех fallback использований для аудита

## Fallback Strategy

**Временный fallback на Access Keys (только для миграции):**

- **Условия использования:**
  - Разрешен только в течение 2 недель после первого успешного OIDC деплоя
  - Только если OIDC аутентификация не удалась
  - Автоматическое отключение через 14 дней после первого успешного OIDC деплоя

- **Мониторинг и алерты:**
  - CloudWatch metric: `CICD/FallbackAccessKeysUsed` (count)
  - CloudWatch alarm: Alert при каждом использовании fallback
  - Slack/Email notification при использовании fallback
  - Логирование всех fallback использований в CloudWatch Logs

- **Автоматическое отключение:**
  - Скрипт проверяет дату первого успешного OIDC деплоя
  - Если прошло >14 дней, fallback автоматически отключается
  - Workflow будет падать с ошибкой, если OIDC не работает (forcing fix)

- **Аудит:**
  - Все fallback использования логируются с timestamp, environment, workflow name
  - Еженедельный отчет о использовании fallback (если был)

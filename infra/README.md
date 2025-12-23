# Infrastructure — Flow Logic

Infrastructure as Code (IaC) для Flow Logic платформы.

## Структура

```
infra/
├── serverless/          # Serverless Framework конфигурация
│   └── serverless.yml   # AWS Lambda, API Gateway, DynamoDB, S3
├── ci-cd/              # CI/CD пайплайны
│   └── .github/workflows/
│       ├── backend-deploy.yml   # Backend deployment
│       └── frontend-deploy.yml  # Frontend deployment
└── README.md           # Эта документация
```

## Serverless Framework

### Установка

```bash
npm install -g serverless@3
```

### Деплой

```bash
# Development
cd infra/serverless
serverless deploy --stage dev

# Staging
serverless deploy --stage staging

# Production
serverless deploy --stage prod
```

### Управление секретами

Секреты хранятся в AWS Systems Manager Parameter Store:

```bash
# Установка секрета
aws ssm put-parameter \
  --name /flowlogic/dev/cognito/user-pool-id \
  --value "us-east-1_XXXXXXXXX" \
  --type String

# Для секретных значений (Stripe keys)
aws ssm put-parameter \
  --name /flowlogic/dev/stripe/secret-key \
  --value "sk_test_..." \
  --type SecureString
```

### Переменные окружения

- **Development:** `.env` файл (не коммитится)
- **Staging/Production:** AWS SSM Parameter Store
- **CI/CD:** GitHub Secrets

## CI/CD

### GitHub Actions

Автоматический деплой при push в:
- `develop` → автоматический деплой на `dev`
- `main` → автоматический деплой на `staging` и `production` (с approval)

### Необходимые GitHub Secrets

**Backend:**
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`

**Frontend:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_URL_STAGING`

## Мониторинг

- **CloudWatch Logs:** Автоматически для всех Lambda функций
- **CloudWatch Metrics:** API latency, error rates, cost
- **Sentry:** Error tracking (настроить отдельно)

## Стоимость

- **MVP (0-100 users):** ≤ $50/мес
- **Early Stage (100-1000 users):** ≤ $100/мес
- **Growth (1000-5000 users):** ≤ $320/мес

## Troubleshooting

### Проблемы с деплоем

1. Проверьте AWS credentials
2. Проверьте SSM параметры
3. Проверьте IAM роли и политики
4. Проверьте CloudWatch логи

### Откат деплоя

```bash
serverless rollback --stage prod --timestamp <timestamp>
```


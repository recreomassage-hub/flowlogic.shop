# 🛡️ Security Checklist для релиза

## AUTH LAYER
- [ ] Пароли хранятся с bcrypt/argon2 (не plaintext)
- [ ] JWT имеют expiration и refresh механизм
- [ ] CSRF защита на всех POST запросах
- [ ] 2FA доступна для критичных операций
- [ ] Session management настроен правильно
- [ ] Password reset flow защищен

## DATA LAYER
- [ ] DynamoDB encryption at rest (KMS) включена
- [ ] DynamoDB IAM policies настроены правильно
- [ ] Sensitive columns защищены (password, email)
- [ ] Backup strategy документирована
- [ ] Нет public read доступа к приватным таблицам
- [ ] Database не открыта в интернет (только через Lambda/VPC)
- [ ] DynamoDB Streams настроены для аудита (если требуется)

## INFRASTRUCTURE
- [ ] Все endpoints требуют HTTPS
- [ ] Secrets хранятся в VAULT/Environment Variables, не в коде
- [ ] Rate limiting включен на API
- [ ] Firewall rules настроены
- [ ] Network segmentation применена
- [ ] Monitoring и alerting настроены

## CODE
- [ ] Нет hardcoded secrets в repo
- [ ] Dependency vulnerabilities проверяются в CI
- [ ] Input validation на всех endpoints
- [ ] SQL injection невозможен (ORM или parameterized queries)
- [ ] XSS защита включена
- [ ] CORS настроен правильно

## AWS-СПЕЦИФИЧНО
- [ ] DynamoDB encryption at rest (KMS) включена
- [ ] DynamoDB IAM policies настроены правильно (принцип наименьших привилегий)
- [ ] Lambda function IAM roles используют принцип наименьших привилегий
- [ ] API Gateway throttling и WAF настроены
- [ ] Cognito User Pool security policies настроены (password policy, MFA)
- [ ] S3 bucket policies настроены (no public access, encryption)
- [ ] CloudWatch Logs retention настроен (7 дней для staging, 30 дней для production)
- [ ] SSM Parameter Store используется для секретов (не в коде)
- [ ] AWS KMS используется для encryption keys
- [ ] VPC endpoints настроены (если требуется)
- [ ] CloudTrail включен для аудита

## VERCEL-СПЕЦИФИЧНО
- [ ] Environment variables security проверена
- [ ] API route security (rate limiting, auth middleware) настроена
- [ ] Serverless cold starts безопасны
- [ ] Edge function security проверена

## SECRETS MANAGEMENT
- [ ] `.env.example` проверен на полноту всех переменных
- [ ] `.env.example` не содержит реальных секретов
- [ ] `.gitignore` блокирует все `.env` файлы:
  - [ ] `.env`
  - [ ] `.env.local`
  - [ ] `.env.development.local`
  - [ ] `.env.test.local`
  - [ ] `.env.production.local`
  - [ ] `.env.*.local`
- [ ] Нет hardcoded секретов в коде
- [ ] Secret rotation reminders добавлены в policies.md

## CI/CD
- [ ] GitHub Secret Scanning включен
- [ ] GitHub Secret Scanning push protection включен
- [ ] Dependabot alerts настроены
- [ ] Dependabot автоматические PR включены
- [ ] Security checks в pipeline
- [ ] No secrets in logs
- [ ] GitHub Actions workflows используют `${{ secrets.* }}` для секретов

## COMPLIANCE (если применимо)
- [ ] GDPR compliance (если обрабатываются персональные данные)
- [ ] Privacy policy обновлена
- [ ] Terms of service обновлены

---

**Дата проверки**: 2025-12-22  
**Проверил**: @SECURITY  
**Статус**: [ ] PASSED [x] NEEDS_REVISION  
**Примечания**: Checklist обновлен для соответствия AWS архитектуре. Требуется проверка всех пунктов перед релизом.


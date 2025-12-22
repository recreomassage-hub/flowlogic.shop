# 🛡️ Security Checklist для релиза

## AUTH LAYER
- [ ] Пароли хранятся с bcrypt/argon2 (не plaintext)
- [ ] JWT имеют expiration и refresh механизм
- [ ] CSRF защита на всех POST запросах
- [ ] 2FA доступна для критичных операций
- [ ] Session management настроен правильно
- [ ] Password reset flow защищен

## DATA LAYER
- [ ] RLS policies включены на всех таблицах (Supabase)
- [ ] Sensitive columns защищены (password, email)
- [ ] Backup strategy документирована
- [ ] Нет public read доступа к приватным таблицам
- [ ] Database не открыта в интернет (только через proxy)
- [ ] Encryption at rest включена

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

## SUPABASE-СПЕЦИФИЧНО
- [ ] Row Level Security (RLS) policies audit пройден
- [ ] Realtime subscription security проверена
- [ ] Storage bucket policies настроены
- [ ] JWT/auth token handling безопасен
- [ ] Webhook security (если используется) проверена

## VERCEL-СПЕЦИФИЧНО
- [ ] Environment variables security проверена
- [ ] API route security (rate limiting, auth middleware) настроена
- [ ] Serverless cold starts безопасны
- [ ] Edge function security проверена

## RAILWAY-СПЕЦИФИЧНО
- [ ] Container image scanning пройден
- [ ] Network policies между сервисами настроены
- [ ] Внешний доступ к БД через proxy
- [ ] Secret rotation механизм настроен

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

**Дата проверки**: [DATE]  
**Проверил**: @SECURITY  
**Статус**: [ ] PASSED [ ] NEEDS_REVISION


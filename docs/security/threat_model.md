# 🛡️ Threat Model

## ASSETS (Активы)

### User Data
- Email, password, settings
- Personal information
- User preferences

### Payment Data (если есть)
- Payment methods
- Transaction history
- Billing information

### API Keys и Secrets
- Database credentials
- Third-party API keys
- Service tokens

### Infrastructure
- Database
- Cache
- Storage buckets
- Compute resources

## THREAT AGENTS (Угрозы)

### Unauthenticated Users
- Public API endpoints
- Registration/login endpoints
- Public resources

### Authenticated Users
- Privilege escalation
- Data access beyond permissions
- Session hijacking

### Infrastructure Admin
- Insider threat
- Misconfiguration
- Unauthorized access

### Third-party Integrations
- Compromised services
- API abuse
- Data leakage

## STRIDE Анализ

### Spoofing (Подмена)
- **Примеры угроз:**
  - Подделка JWT токенов для доступа к аккаунту другого пользователя
  - Фишинг для получения учетных данных
  - Session hijacking через XSS или MITM атаки
- **Митигация:**
  - JWT подписываются секретным ключом (AWS Cognito)
  - HTTPS обязателен для всех endpoints
  - HttpOnly cookies для refresh tokens
  - CSRF защита на всех POST запросах
  - См. также: `docs/security/policies.md` - ПАРОЛЬНАЯ ПОЛИТИКА

### Tampering (Изменение данных)
- **Примеры угроз:**
  - Изменение данных пользователя без авторизации
  - Модификация результатов тестов (assessments)
  - Изменение подписок (subscriptions) для получения бесплатного доступа
  - Изменение видео в S3 для подделки результатов
- **Митигация:**
  - JWT authentication на всех write endpoints
  - Tier gating middleware для проверки прав доступа
  - Input validation на всех endpoints
  - S3 bucket policies с ограниченным доступом
  - DynamoDB IAM policies с принципом наименьших привилегий
  - См. также: `docs/security/policies.md` - ТОКЕНЫ И API КЛЮЧИ

### Repudiation (Отказ от действий)
- **Примеры угроз:**
  - Пользователь отрицает выполнение действия (например, отмену подписки)
  - Администратор отрицает изменение конфигурации
  - Отсутствие логов для расследования инцидентов
- **Митигация:**
  - CloudWatch Logs для всех Lambda функций
  - CloudTrail для аудита AWS API вызовов
  - Логирование всех критичных действий (auth, payments, tier changes)
  - Retention policy для логов (7 дней staging, 30 дней production)
  - См. также: `docs/security/policies.md` - ИНЦИДЕНТЫ

### Information Disclosure (Раскрытие информации)
- **Примеры угроз:**
  - Утечка персональных данных пользователей (email, password)
  - Раскрытие результатов тестов других пользователей
  - Утечка API ключей или секретов через логи или код
  - S3 bucket с публичным доступом
- **Митигация:**
  - Encryption at rest для DynamoDB (KMS)
  - Encryption in transit (HTTPS/TLS)
  - S3 bucket policies (no public access)
  - SSM Parameter Store для секретов (не в коде)
  - Нет PII данных в логах
  - См. также: `docs/security/policies.md` - ОБРАБОТКА ДАННЫХ, SECRET ROTATION REMINDERS

### Denial of Service (Отказ в обслуживании)
- **Примеры угроз:**
  - DDoS атаки на API Gateway
  - Перегрузка Lambda функций большим количеством запросов
  - Исчерпание DynamoDB read/write capacity
  - Перегрузка S3 bucket запросами
- **Митигация:**
  - API Gateway throttling (rate limiting)
  - AWS WAF для защиты от DDoS
  - Lambda concurrency limits
  - DynamoDB on-demand billing (автоматическое масштабирование)
  - CloudWatch alarms для мониторинга
  - См. также: `docs/security/security_checklist.md` - INFRASTRUCTURE

### Elevation of Privilege (Повышение привилегий)
- **Примеры угроз:**
  - Free tier пользователь получает доступ к Pro tier функциям
  - Обход tier gating для доступа к платным функциям
  - Получение admin прав через уязвимость в коде
  - Доступ к чужим данным через недостаточную проверку user_id
- **Митигация:**
  - Tier gating middleware для проверки подписки
  - JWT содержит tier информацию
  - Проверка user_id на всех endpoints
  - IAM roles с принципом наименьших привилегий
  - Регулярный аудит доступа
  - См. также: `docs/security/policies.md` - ДОСТУП К PRODUCTION

## MITIGATION STRATEGIES

### Authentication
- [ ] Strong password policies
- [ ] JWT with expiration
- [ ] 2FA for critical operations
- [ ] Session management

### Authorization
- [x] Tier-based access control (Free/Basic/Pro/Pro+)
- [x] DynamoDB IAM policies с принципом наименьших привилегий
- [x] Lambda function IAM roles с минимальными правами
- [x] User ID проверка на всех endpoints
- [x] Tier gating middleware для платных функций

### Data Protection
- [x] DynamoDB encryption at rest (KMS)
- [x] S3 encryption at rest (AES256)
- [x] Encryption in transit (HTTPS/TLS)
- [x] SSM Parameter Store для секретов
- [x] AWS KMS для encryption keys

### Infrastructure
- [x] API Gateway throttling и WAF
- [x] CloudWatch Logs и Metrics
- [x] CloudTrail для аудита
- [x] S3 bucket policies (no public access)
- [x] VPC endpoints (если требуется)

---

**Дата создания**: 2025-12-22  
**Версия**: 1.1  
**Владелец**: @SECURITY  
**Последнее обновление**: 2025-12-22 (добавлена детализация угроз и митигации для AWS архитектуры)  
**Связанные документы:**
- `docs/security/policies.md` - Security Policies
- `docs/security/security_checklist.md` - Security Checklist



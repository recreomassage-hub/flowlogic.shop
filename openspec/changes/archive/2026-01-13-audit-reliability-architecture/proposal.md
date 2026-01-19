# Change: Комплексный audit архитектуры на надёжность

## Why

**Проблема:** Текущая архитектура FlowLogic имеет критические пробелы в надёжности, которые могут привести к:
- Потере данных при сбоях (нет резервных копий DynamoDB)
- Каскадным отказам (нет circuit breakers, нет rate limiting)
- Длительным простоям (нет disaster recovery plan)
- Слепым зонам в мониторинге (нет alerting, нет structured logging)

**Оценка текущей надёжности: 6.5/10**

**Критические проблемы:**
1. **Single Point of Failure (SPOF)** - несколько критичных точек (API Gateway, DynamoDB, MediaPipe Lambda, Cognito)
2. **No disaster recovery plan** - нет плана восстановления, RTO/RPO не определены
3. **No monitoring/alerting** - слепая зона, проблемы обнаруживаются только пользователями
4. **No rate limiting** - уязвимость к DDoS и abuse
5. **No circuit breakers** - cascading failures возможны
6. **No data backup strategy** - риск потери данных при сбоях

**Ожидаемый uptime:** 99.5-99.7% (2-4 часа downtime/месяц) - неприемлемо для production

**Opportunity:** Реализация Tier 1 улучшений повысит надёжность до 8/10 и uptime до 99.8-99.9% при минимальных затратах (+$5-6/month).

## What Changes

### Добавления (Tier 1 - CRITICAL):

**Infrastructure:**
- DynamoDB Point-in-Time Recovery (PITR) для всех production таблиц
- Автоматические ежедневные бэкапы DynamoDB (30 дней retention)
- Dead Letter Queue (DLQ) для MediaPipe Lambda обработки видео
- CloudWatch Alarms для критических метрик (errors, latency, throttling)
- SNS Topic для alerting (email/Slack)
- API Gateway throttling и rate limiting

**Application:**
- Health check endpoint (`/health`) с проверкой зависимостей
- Structured logging (JSON format) для всех Lambda функций
- Error tracking integration (Sentry опционально)
- Retry logic с exponential backoff для DynamoDB операций

**Operations:**
- Incident response runbook (документация)
- Backup restoration procedures (скрипты)
- Monitoring dashboard (CloudWatch)

### Модификации:

**BREAKING:** Нет breaking changes

**Non-breaking:**
- Обновление serverless.yml для добавления DLQ, alarms, throttling
- Обновление Lambda handlers для structured logging
- Обновление error handling для retry logic

### Удаления:

Нет

## Impact

**Affected specs:**
- `infrastructure` — ADDED: backup strategy, monitoring, alerting
- `operations` — ADDED: incident response, disaster recovery procedures
- `api` — MODIFIED: health check endpoint, structured logging

**Affected code:**
- `serverless.yml` — добавление DLQ, alarms, throttling
- `src/backend/handlers/health.ts` — создание health check endpoint
- `src/backend/utils/logger.ts` — structured logging utility
- `src/backend/utils/retry.ts` — retry logic с exponential backoff
- `scripts/backup-dynamodb.sh` — скрипт для manual backup
- `scripts/restore-dynamodb.sh` — скрипт для восстановления
- `docs/operations/incident-response-runbook.md` — документация

**Migration:**
- Production таблицы: включить PITR (без downtime)
- Существующие Lambda: добавить structured logging (backward compatible)
- API Gateway: добавить throttling (gradual rollout)

**Risks:**
- **Low:** PITR включение не требует downtime
- **Low:** Structured logging не меняет API контракт
- **Medium:** Rate limiting может заблокировать легитимных пользователей при неправильной настройке (mitigated by gradual rollout и monitoring)

**Cost impact:**
- DynamoDB PITR: ~$3/month
- CloudWatch Alarms: ~$1/month (10 alarms × $0.10)
- DLQ: ~$0.50/month
- SNS: ~$0.50/month
- **Total: +$5/month** (15% increase от текущих $35-40/month)

**Reliability improvement:**
- Current: 6.5/10 (99.5-99.7% uptime)
- After Tier 1: 8/10 (99.8-99.9% uptime)
- **Risk reduction: 40-50%**

## Open Questions

- [ ] **Q:** Нужен ли Sentry для error tracking или CloudWatch Logs достаточно?
  - **A (pending):** Оценить сложность настройки Sentry vs CloudWatch Insights
- [ ] **Q:** Какой retention period для DynamoDB backups (30 дней достаточно)?
  - **A (pending):** Определить compliance requirements
- [ ] **Q:** Нужен ли multi-region setup сразу или достаточно single-region с backups?
  - **A (pending):** Оценить бизнес-требования к uptime (99.99% требует multi-region)
- [ ] **Q:** Какой канал для alerting (email, Slack, PagerDuty)?
  - **A (pending):** Определить предпочтения команды

## Analysis of Provided Document

**Соответствие проекту:** ✅ Высокое

**Готовые решения:**
1. ✅ DynamoDB PITR - полностью соответствует текущей архитектуре
2. ✅ DLQ для Lambda - стандартная практика для serverless
3. ✅ CloudWatch Alarms - уже упоминаются в PRD, нужно реализовать
4. ✅ API Gateway throttling - частично упоминается в PRD (rate limiting для video abuse)
5. ✅ Health check endpoint - упоминается в PRD, нужно реализовать
6. ✅ Structured logging - не упоминается, но критично для observability

**Необходимые адаптации:**
- Документ предлагает multi-region (Tier 3) - это долгосрочная цель, не для MVP
- Документ предлагает SQS для async video processing - это уже частично реализовано (SQS FIFO упоминается в PRD)
- Документ предлагает Circuit Breaker pattern - нужно добавить в application layer

**Приоритизация:**
- **Tier 1 (CRITICAL):** Реализовать немедленно (Week 1)
- **Tier 2 (HIGH):** Реализовать в течение месяца (SQS async processing уже частично есть)
- **Tier 3 (MEDIUM):** Multi-region - отложить до роста трафика (>5000 users)

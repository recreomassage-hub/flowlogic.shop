# 🚀 Deployment Guide — Flow Logic Platform

> **Для агентов:** Этот документ является основным руководством по деплою для Оркестратора, GFC (Git Flow Controller) и DS (Deploy Supervisor).

**Версия:** 1.1  
**Дата:** 2025-12-23  
**Для:** DevOps Engineers, AI Agents (Orchestrator, GFC, DS)

---

## 📋 Быстрая навигация

- **Полная версия:** [docs/deployment_guide.md](docs/deployment_guide.md)
- **Для GFC:** Раздел [Secret Scanning](#secret-scanning-gitguardian--github-secret-scanning) и [GFC Integration](#gfc-git-flow-controller-integration)
- **Для DS:** Разделы [Monitoring Setup](#monitoring-setup) и [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🤖 Интеграция с мультиагентной схемой

### GFC (Git Flow Controller) Integration

GFC использует этот гайд для проверки входящего кода:

1. **Проверка структуры AWS:**
   - Нет изменений, нарушающих архитектуру
   - Все изменения соответствуют serverless архитектуре

2. **Проверка секретов:**
   - Нет hardcoded секретов в коде
   - Все переменные окружения присутствуют в `.env.example`
   - Проверка через Secret Scanning (GitGuardian/GitHub)

3. **Проверка перед PR:**
   - Все коммиты проходят через Secret Scanning
   - Нет изменений в критичных файлах без review

### DS (Deploy Supervisor) Integration

DS использует этот гайд для автоматических проверок после деплоя:

1. **Post-Deployment Checklist:**
   - Health check endpoint
   - API accessibility
   - Frontend accessibility
   - Integration tests

2. **Monitoring Setup:**
   - CloudWatch metrics проверка
   - Error rate monitoring
   - Latency monitoring

3. **Автоматическое подтверждение:**
   - DS проходит по всем пунктам чеклиста
   - Подтверждает успешность операции
   - Отправляет отчет о статусе деплоя

---

## 🔐 Secrets Management — Критично!

### ⚠️ ВАЖНО: Защита от утечек секретов

**После инцидента с утечкой SSH ключа (2025-12-23), следующие правила обязательны:**

1. **НИКОГДА не добавляйте файлы `.env` в Git**
   - Убедитесь, что `.env` прописан в `.gitignore` (уже настроено)
   - Используйте только `.env.example` как шаблон
   - Все реальные секреты должны храниться в AWS SSM Parameter Store или GitHub Secrets

2. **Secret Scanning обязателен**
   - Все коммиты должны проходить через проверку GitGuardian (или аналоги) перед слиянием в ветку `main`
   - GitHub Secret Scanning должен быть включен с push protection
   - Это предотвращает повторную утечку SSH-ключей, AWS Access Keys и других секретов

3. **Проверка перед каждым PR**
   - GFC (Git Flow Controller) проверяет входящий код на соответствие требованиям
   - Проверка наличия всех переменных окружения в `.env.example`
   - Проверка отсутствия hardcoded секретов в коде

### Secret Scanning (GitGuardian / GitHub Secret Scanning)

#### Настройка GitHub Secret Scanning

1. **Включите Secret Scanning:**
   - Repository Settings → Security → Code security and analysis
   - Enable "Secret scanning" (GitHub Advanced Security)
   - Enable "Push protection" (блокирует push с секретами)

2. **Настройка GitGuardian (рекомендуется):**
   - Интеграция с GitHub через GitGuardian App
   - Автоматическое сканирование всех коммитов
   - Уведомления в реальном времени

#### Что проверяется:

- SSH Private Keys (id_rsa, id_ed25519, *.pem)
- AWS Access Keys (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- API Keys (Stripe, Sentry, etc.)
- Database credentials
- JWT secrets
- OAuth tokens

---

## 📊 Monitoring Setup

> **Для DS:** Этот раздел является основой для автоматических проверок после деплоя.

### CloudWatch Metrics

DS автоматически проверяет следующие метрики:

- API latency (p50, p95, p99)
- Error rates
- Lambda invocations
- DynamoDB read/write capacity

### DS Monitoring Integration

DS автоматически проверяет следующие метрики после деплоя:

1. **Error Rate Check:**
   - Проверка, что error rate не превышает 1%

2. **Latency Check:**
   - Проверка, что p95 latency < 500ms

---

## ✅ Post-Deployment Checklist

> **Для DS:** Этот чеклист является основой для автоматических проверок после деплоя. DS должен проходить по каждому пункту и подтверждать успешность операции.

### Backend

- [ ] API Gateway endpoint accessible
- [ ] Health check endpoint returns `200 OK`
- [ ] DynamoDB tables created
- [ ] S3 bucket created and accessible
- [ ] Cognito User Pool configured
- [ ] CloudWatch logs working
- [ ] Secrets in SSM Parameter Store

### Frontend

- [ ] Frontend accessible at production URL
- [ ] API calls working
- [ ] Authentication flow working
- [ ] All pages load correctly
- [ ] No console errors

### DS Automated Checks

DS использует этот чеклист для автоматической проверки:

1. **Health Check:**
   ```bash
   HEALTH_STATUS=$(curl -s https://api.flowlogic.shop/v1/health | jq -r '.status')
   if [ "$HEALTH_STATUS" != "healthy" ]; then
     echo "❌ Health check failed"
     exit 1
   fi
   ```

2. **API Accessibility:**
   ```bash
   API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api.flowlogic.shop/v1/health)
   if [ "$API_RESPONSE" != "200" ]; then
     echo "❌ API not accessible"
     exit 1
   fi
   ```

---

## 📚 Полная документация

Для полной документации по деплою см. [docs/deployment_guide.md](docs/deployment_guide.md)

---

**Обновлено:** 2025-12-23  
**Версия:** 1.1 (добавлена интеграция с мультиагентной схемой и Security Hardening)






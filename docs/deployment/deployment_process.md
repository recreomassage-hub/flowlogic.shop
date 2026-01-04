# 🚀 Deployment Process - Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-27  
**Для:** DevOps Engineers, Deploy Supervisor

---

## 📋 ОБЗОР

Этот документ описывает полный процесс deployment Flow Logic Platform, включая проверки, smoke tests, мониторинг и rollback процедуры.

---

## 🎯 АРХИТЕКТУРА DEPLOYMENT

```
┌─────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                     │
│                  (main / develop branch)                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS CI/CD PIPELINE               │
│  1. Build & Test                                         │
│  2. Deploy Backend (Serverless Framework)              │
│  3. Deploy Frontend (Vercel)                            │
│  4. Run Smoke Tests                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                │
│  • Backend: AWS Lambda + API Gateway                    │
│  • Frontend: Vercel                                      │
│  • Database: DynamoDB                                    │
│  • Storage: S3                                           │
│  • Monitoring: CloudWatch                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 ПОЛНЫЙ ПРОЦЕСС DEPLOYMENT

### Этап 1: Подготовка

**Проверки перед deployment:**
- [ ] Все изменения закоммичены и запушены в `main` или `develop`
- [ ] CI/CD pipeline прошел успешно
- [ ] Все тесты пройдены
- [ ] Code review завершен (если требуется)

**Команды:**
```bash
# Проверить статус
git status
git log --oneline -5

# Убедиться, что на правильной ветке
git branch --show-current
```

---

### Этап 2: Backend Deployment

**Процесс:**
1. GitHub Actions автоматически запускает deployment при push в `main`
2. Или вручную через Serverless Framework

**Автоматический deployment (GitHub Actions):**
```yaml
# .github/workflows/ci-cd.yml
- name: Deploy Backend (Serverless)
  run: |
    cd infra/serverless
    npm install
    npx serverless deploy --stage production
```

**Ручной deployment:**
```bash
cd infra/serverless

# Установить зависимости
npm install

# Деплой в production
npx serverless deploy --stage production

# Проверка деплоя
npx serverless info --stage production
```

**Проверка после deployment:**
- [ ] Lambda функция развернута
- [ ] API Gateway endpoint создан
- [ ] DynamoDB таблицы созданы (если новые)
- [ ] S3 bucket доступен
- [ ] Environment variables настроены

**Ожидаемый результат:**
```
Service deployed to stack flowlogic-backend-production

endpoints:
  ANY - https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/production/{proxy+}
  ANY - https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/production/

functions:
  api: flowlogic-backend-production-api (29 MB)
```

---

### Этап 3: Frontend Deployment

**Процесс:**
1. GitHub Actions автоматически деплоит на Vercel при push в `main`
2. Или вручную через Vercel CLI

**Автоматический deployment (GitHub Actions):**
```yaml
# .github/workflows/ci-cd.yml
- name: Deploy Frontend (Vercel)
  run: vercel deploy --prod
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

**Ручной deployment:**
```bash
# Установить Vercel CLI (если не установлен)
npm install -g vercel

# Деплой в production
vercel deploy --prod

# Или через Vercel Dashboard
# https://vercel.com/dashboard
```

**Проверка после deployment:**
- [ ] Frontend доступен по URL: `https://flowlogic.shop`
- [ ] Environment variables настроены (`VITE_API_URL`)
- [ ] Build успешен без ошибок
- [ ] Все страницы загружаются

---

### Этап 4: Проверка интеграции Frontend ↔ Backend

**Проверка API URL:**
```bash
# Проверить, что frontend использует правильный API URL
# В Vercel Dashboard: Settings → Environment Variables
# VITE_API_URL = https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/production
```

**Проверка CORS:**
```bash
# Проверить CORS headers
curl -I -X OPTIONS https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/production/ \
  -H "Origin: https://flowlogic.shop" \
  -H "Access-Control-Request-Method: GET"
```

**Ожидаемый результат:**
```
Access-Control-Allow-Origin: https://flowlogic.shop
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

**Проверка endpoints:**
```bash
# Health endpoint
curl https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/production/

# Должен вернуть 200 OK
```

---

### Этап 5: Smoke Tests

**Запуск smoke tests:**
```bash
# Production
./scripts/smoke_tests.sh production

# Staging
./scripts/smoke_tests.sh staging

# Dev
./scripts/smoke_tests.sh dev
```

**Что проверяют smoke tests:**
1. Health endpoint доступен (200 OK)
2. CORS настроен правильно
3. API endpoints требуют авторизацию (401 для неавторизованных)
4. Auth endpoints доступны (register, login)
5. Структура ответов корректна

**Ожидаемый результат:**
```
✅ Пройдено: X
❌ Провалено: 0

✅ Все smoke tests пройдены успешно!
```

**Если smoke tests провалились:**
1. Проверить логи CloudWatch
2. Проверить конфигурацию CORS
3. Проверить API Gateway endpoints
4. При необходимости выполнить rollback

---

### Этап 6: Настройка мониторинга

**CloudWatch Logs:**
- Log Group создается автоматически при первом запуске Lambda
- Retention: 14 дней для production

**CloudWatch Alarms:**
```bash
# Деплой monitoring resources
cd infra/serverless
aws cloudformation deploy \
  --template-file monitoring.yml \
  --stack-name flowlogic-production-monitoring \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM
```

**Алерты:**
1. **Error Rate Alarm** - > 5 ошибок за 5 минут
2. **Duration Alarm** - средняя длительность > 5 секунд
3. **Throttle Alarm** - throttling Lambda функции

**SNS Subscriptions:**
```bash
# Подписаться на алерты (email)
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:flowlogic-production-error-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

**Проверка мониторинга:**
- [ ] CloudWatch Logs доступны
- [ ] CloudWatch Alarms созданы
- [ ] SNS Topics созданы
- [ ] Email subscriptions настроены (опционально)
- [ ] Все алерты в состоянии OK

---

### Этап 7: Post-Deployment Checklist

**Выполнить все проверки из:**
- `docs/deployment/post_deployment_checklist.md`

**Критические проверки (MUST PASS):**
1. ✅ Health endpoint возвращает 200 OK
2. ✅ Smoke tests пройдены (0 failures)
3. ✅ CORS настроен правильно
4. ✅ CloudWatch Logs доступны
5. ✅ Нет критических ошибок в логах
6. ✅ Frontend может подключиться к backend API

---

## 🔄 ROLLBACK ПРОЦЕДУРЫ

### Автоматический Rollback

**Триггеры:**
- Smoke tests провалились
- Error rate > 5 ошибок за 5 минут
- Health endpoint = unhealthy
- CloudWatch Alarm сработал

**Процесс:**
```bash
# GitHub Actions автоматически выполняет rollback при failure
# См. .github/workflows/ci-cd.yml
```

### Ручной Rollback

**Backend Rollback:**
```bash
cd infra/serverless

# Откат к предыдущей версии
npx serverless rollback --stage production

# Или к конкретной версии
npx serverless rollback --stage production --timestamp TIMESTAMP
```

**Frontend Rollback:**
```bash
# Через Vercel CLI
vercel rollback --token=$VERCEL_TOKEN

# Или через Vercel Dashboard
# https://vercel.com/dashboard → Deployments → Rollback
```

**Проверка после rollback:**
- [ ] Health endpoint работает
- [ ] Smoke tests пройдены
- [ ] Нет ошибок в логах

---

## 📊 МЕТРИКИ DEPLOYMENT

**Время deployment:**
- Backend: ~2-3 минуты
- Frontend: ~30 секунд
- Smoke tests: ~1 минута
- **Общее время: ~4-5 минут**

**Rollback время:**
- Backend: ~1 минута
- Frontend: ~30 секунд
- **Общее время: ~1.5 минуты**

---

## 🚨 TROUBLESHOOTING

**Проблема: Deployment failed**
- Проверить логи GitHub Actions
- Проверить AWS credentials
- Проверить Serverless Framework версию

**Проблема: Smoke tests failed**
- Проверить API Gateway endpoints
- Проверить CORS настройки
- Проверить CloudWatch Logs

**Проблема: Frontend не может подключиться к backend**
- Проверить `VITE_API_URL` в Vercel
- Проверить CORS настройки
- Проверить Network tab в браузере

**См. также:** `docs/troubleshooting.md`

---

## 📚 СМ. ТАКЖЕ

- `docs/deployment/post_deployment_checklist.md` - Post-deployment checklist
- `scripts/smoke_tests.sh` - Smoke tests скрипт
- `infra/serverless/monitoring.yml` - CloudWatch мониторинг
- `docs/deployment_guide.md` - Полное руководство по deployment

---

**Последнее обновление:** 2025-12-27



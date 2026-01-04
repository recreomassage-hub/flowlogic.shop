# ✅ Post-Deployment Checklist

**Версия:** 1.0  
**Дата:** 2025-12-27  
**Для:** DevOps Engineers, Deploy Supervisor

---

## 🎯 ЦЕЛЬ

Проверить работоспособность системы после deployment и убедиться, что все компоненты функционируют корректно.

---

## 📋 ЧЕКЛИСТ

### 1. ✅ Проверка интеграции Frontend ↔ Backend

**Проверка API URL:**
- [ ] Frontend использует правильный `VITE_API_URL` из Vercel Environment Variables
- [ ] API URL соответствует развернутому backend endpoint
- [ ] CORS настроен правильно (origin: `https://flowlogic.shop`)

**Проверка endpoints:**
- [ ] Health endpoint доступен: `GET /`
- [ ] Health endpoint возвращает 200 OK
- [ ] CORS headers присутствуют в ответах

**Команды для проверки:**
```bash
# Проверка health endpoint
curl -I https://4yei7a5aig.execute-api.us-east-1.amazonaws.com/prod/

# Проверка CORS
curl -I -X OPTIONS https://4yei7a5aig.execute-api.us-east-1.amazonaws.com/prod/ \
  -H "Origin: https://flowlogic.shop" \
  -H "Access-Control-Request-Method: GET"
```

**Ожидаемый результат:**
- HTTP 200 OK для health endpoint
- `Access-Control-Allow-Origin: https://flowlogic.shop` в CORS headers

---

### 2. 🧪 Smoke Tests

**Запуск smoke tests:**
```bash
# Production
./scripts/smoke_tests.sh production

# Staging
./scripts/smoke_tests.sh staging

# Dev
./scripts/smoke_tests.sh dev
```

**Проверки:**
- [ ] Health endpoint доступен
- [ ] CORS настроен правильно
- [ ] API endpoints требуют авторизацию (401 для неавторизованных запросов)
- [ ] Auth endpoints доступны (register, login)
- [ ] Структура ответов корректна

**Ожидаемый результат:**
- Все smoke tests пройдены (0 failures)

---

### 3. 📊 Мониторинг и алерты

**CloudWatch Logs:**
- [ ] Log Group создан: `/aws/lambda/flowlogic-backend-production-api`
- [ ] Logs доступны в CloudWatch Console
- [ ] Retention policy настроена (14 дней для production)

**CloudWatch Alarms:**
- [ ] Error Rate Alarm настроен (threshold: 5 errors за 5 минут)
- [ ] Duration Alarm настроен (threshold: 5 секунд)
- [ ] Throttle Alarm настроен (threshold: 1 throttle)

**Проверка алертов:**
```bash
# Проверить статус алертов
aws cloudwatch describe-alarms \
  --alarm-name-prefix flowlogic-production \
  --region us-east-1
```

**SNS Topics:**
- [ ] Error Rate SNS Topic создан
- [ ] Duration SNS Topic создан
- [ ] Throttle SNS Topic создан
- [ ] Email subscriptions настроены (опционально)

**Ожидаемый результат:**
- Все алерты в состоянии OK (не в ALARM)
- SNS Topics созданы и готовы к использованию

---

### 4. 🔍 Проверка функциональности

**Backend:**
- [ ] Lambda функция развернута
- [ ] API Gateway endpoint доступен
- [ ] DynamoDB таблицы созданы
- [ ] S3 bucket доступен
- [ ] Cognito User Pool настроен

**Frontend:**
- [ ] Vercel deployment успешен
- [ ] Frontend доступен по URL: `https://flowlogic.shop`
- [ ] Environment variables настроены
- [ ] Build успешен без ошибок

**Проверка функциональности:**
- [ ] Регистрация пользователя работает
- [ ] Логин работает
- [ ] API endpoints отвечают корректно
- [ ] CORS не блокирует запросы от frontend

---

### 5. 🔐 Проверка безопасности

**Secrets:**
- [ ] AWS SSM Parameters созданы и содержат правильные значения
- [ ] GitHub Secrets настроены
- [ ] Vercel Environment Variables настроены
- [ ] Нет секретов в коде или логах

**IAM:**
- [ ] Lambda execution role имеет минимальные необходимые permissions
- [ ] GitHub Actions role имеет минимальные необходимые permissions
- [ ] Нет избыточных permissions

**CORS:**
- [ ] CORS origin ограничен правильным доменом
- [ ] `allowCredentials: true` настроен для cookies
- [ ] CORS headers присутствуют в ответах

---

### 6. 📈 Метрики и производительность

**CloudWatch Metrics:**
- [ ] Invocations метрика доступна
- [ ] Duration метрика доступна
- [ ] Error Rate метрика доступна
- [ ] Throttles метрика доступна

**Производительность:**
- [ ] Средняя длительность запросов < 2 секунд
- [ ] Error rate < 1%
- [ ] Нет throttles

**Проверка метрик:**
```bash
# Получить метрики за последний час
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=flowlogic-backend-production-api \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region us-east-1
```

---

### 7. 📝 Документация

**Обновление документации:**
- [ ] Deployment guide обновлен с актуальными URL
- [ ] API documentation обновлена с production endpoints
- [ ] Troubleshooting guide обновлен
- [ ] README.md обновлен

**Документирование:**
- [ ] Задокументирован deployment процесс
- [ ] Задокументированы smoke tests
- [ ] Задокументированы мониторинг и алерты
- [ ] Задокументированы rollback процедуры

---

## 🚨 КРИТИЧЕСКИЕ ПРОВЕРКИ (MUST PASS)

Эти проверки **обязательны** перед объявлением deployment успешным:

1. ✅ Health endpoint возвращает 200 OK
2. ✅ Smoke tests пройдены (0 failures)
3. ✅ CORS настроен правильно
4. ✅ CloudWatch Logs доступны
5. ✅ Нет критических ошибок в логах
6. ✅ Frontend может подключиться к backend API

---

## ⚠️ ПРЕДУПРЕЖДЕНИЯ

Если любая из критических проверок провалилась:
1. **НЕ объявляйте deployment успешным**
2. Проверьте логи CloudWatch для диагностики
3. При необходимости выполните rollback
4. Исправьте проблему и повторите deployment

---

## 📊 ОТЧЕТ О ПРОВЕРКЕ

После выполнения всех проверок создайте отчет:

```markdown
# Post-Deployment Report

**Дата:** YYYY-MM-DD
**Окружение:** production
**Версия:** v1.0.0

## Результаты проверок

1. ✅ Интеграция Frontend ↔ Backend: PASSED
2. ✅ Smoke Tests: PASSED (X/X tests)
3. ✅ Мониторинг: PASSED
4. ✅ Функциональность: PASSED
5. ✅ Безопасность: PASSED
6. ✅ Метрики: PASSED

## Deployment Status: ✅ SUCCESS

## Замечания
- [Любые замечания или рекомендации]
```

---

## 🔗 СМ. ТАКЖЕ

- `docs/deployment_guide.md` - Полное руководство по deployment
- `scripts/smoke_tests.sh` - Скрипт для smoke tests
- `infra/serverless/monitoring.yml` - CloudWatch мониторинг
- `docs/troubleshooting.md` - Решение проблем

---

**Последнее обновление:** 2025-12-27



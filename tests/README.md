# 🧪 Tests — Flow Logic Platform

Структура тестов для платформы Flow Logic.

## 📁 Структура

```
tests/
├── unit/              # Unit тесты
│   ├── backend/       # Backend unit тесты
│   └── frontend/      # Frontend unit тесты
├── integration/       # Integration тесты
│   ├── api/           # API integration тесты
│   └── db/            # Database integration тесты
├── e2e/               # End-to-end тесты
│   └── scenarios/     # E2E сценарии
└── performance/       # Performance тесты
```

## 🚀 Запуск тестов

### Unit Tests

**Backend:**
```bash
cd src/backend
npm test
```

**Frontend:**
```bash
cd src/frontend
npm test
```

### Integration Tests

**Backend API:**
```bash
cd src/backend
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

### Performance Tests

```bash
npm run test:performance
```

## 📊 Покрытие кода

**Целевое покрытие:**
- Unit tests: ≥ 80%
- Integration tests: ≥ 70%
- E2E tests: ≥ 50% ключевых сценариев

**Генерация отчетов:**
```bash
npm run test:coverage
```

## 🧪 Типы тестов

### Unit Tests
Проверяют отдельные функции и компоненты изолированно.

**Примеры:**
- `tests/unit/backend/userModel.test.ts`
- `tests/unit/backend/subscriptionModel.test.ts`

### Integration Tests
Проверяют взаимодействие компонентов.

**Примеры:**
- `tests/integration/api/auth.test.ts`
- `tests/integration/api/subscriptions.test.ts`
- `tests/integration/api/assessments.test.ts`

### E2E Tests
Проверяют полные пользовательские сценарии.

**Примеры:**
- `tests/e2e/scenarios/onboarding.spec.ts`
- `tests/e2e/scenarios/assessments.spec.ts`

## 📝 Тест-план

Подробный тест-план находится в `docs/testing/test_plan.md`.

## 📊 Отчеты

Отчеты о тестировании находятся в `docs/testing/test_reports/`:
- `unit_test_report.md`
- `integration_test_report.md`
- `e2e_test_report.md`
- `performance_test_report.md`

## 🔧 Настройка

### Environment Variables

**Backend:**
```bash
# .env.test
NODE_ENV=test
AWS_REGION=us-east-1
DYNAMODB_USERS_TABLE=flowlogic-test-users
# ...
```

**Frontend:**
```bash
# .env.test
VITE_API_URL=http://localhost:3001
```

### Mock Services

Для локального тестирования используются моки:
- DynamoDB: `jest.mock('../../config/database')`
- Cognito: `jest.mock('../../config/cognito')`
- S3: `jest.mock('../../config/s3')`

## 🚨 Troubleshooting

### Проблемы с тестами

1. **Тесты не запускаются:**
   - Проверьте установку зависимостей: `npm install`
   - Проверьте конфигурацию Jest: `jest.config.js`

2. **Тесты падают:**
   - Проверьте логи: `npm test -- --verbose`
   - Проверьте моки: убедитесь, что все моки настроены правильно

3. **Проблемы с E2E тестами:**
   - Убедитесь, что Playwright установлен: `npx playwright install`
   - Проверьте, что приложение запущено: `npm run dev`

## 📚 Документация

- **Test Plan:** `docs/testing/test_plan.md`
- **Test Reports:** `docs/testing/test_reports/`
- **API Spec:** `docs/architecture/api_spec.yaml`
- **User Stories:** `docs/requirements/user_stories.md`

---

**Тесты критичны для качества продукта. Все тесты должны проходить перед релизом.**







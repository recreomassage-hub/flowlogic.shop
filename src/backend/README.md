# Flow Logic Backend

Backend API для Flow Logic платформы - Serverless AWS Lambda.

## Структура проекта

```
src/backend/
├── api/
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   └── middleware/      # Auth, validation, etc.
├── db/
│   ├── models/         # DynamoDB models
│   ├── migrations/     # Database migrations
│   └── seeders/        # Seed data
├── services/           # Business logic
├── utils/              # Utility functions
├── config/             # Configuration files
└── tests/              # Tests
    ├── unit/
    └── integration/
```

## Технологии

- **Runtime:** Node.js 20+ (TypeScript)
- **Framework:** Express.js + Serverless Framework
- **Database:** AWS DynamoDB
- **Auth:** AWS Cognito
- **Storage:** AWS S3
- **Deployment:** AWS Lambda + API Gateway

## Установка

```bash
npm install
```

## Разработка

```bash
# Локальная разработка
npm run dev

# Сборка
npm run build

# Тесты
npm test

# Линтинг
npm run lint
```

## Миграции

```bash
# Применить миграции
npm run migrate

# Откатить миграции
npm run migrate:rollback
```

## Environment Variables

```env
STAGE=dev
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
STRIPE_SECRET_KEY=...
```

## API Endpoints

### Authentication
- `POST /v1/auth/register` - Регистрация
- `POST /v1/auth/login` - Вход
- `POST /v1/auth/logout` - Выход
- `POST /v1/auth/refresh` - Обновление токена

### Users
- `GET /v1/users/me` - Получить текущего пользователя
- `PATCH /v1/users/me` - Обновить профиль

## Документация

Полная спецификация API: `docs/architecture/api_spec.yaml`






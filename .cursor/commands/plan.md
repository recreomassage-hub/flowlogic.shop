# Команда: /plan

Создает технический план на основе спецификации.

## Использование

```
/plan

@constitution.md @spec.md @clarifications.md

Create technical plan for {feature name}
```

## Процесс

1. AI читает:
   - `.specify/constitution.md` (стандарты проекта)
   - `.specify/features/{name}/spec.md` (требования)
   - `.specify/features/{name}/clarifications.md` (уточнения)
2. AI создает `.specify/features/{name}/plan.md`
3. План включает:
   - Architecture (архитектурные решения)
   - Database Schema (изменения схемы БД)
   - API Endpoints (новые/измененные эндпоинты)
   - Components (структура компонентов)
   - State Management (управление состоянием)
   - Integration Points (точки интеграции)
   - Dependencies (новые зависимости)

## Пример вывода

```markdown
## Architecture

### Database Schema
```prisma
model Review {
  id          String   @id @default(cuid())
  productId   String
  userId      String
  rating      Int      @db.SmallInt
  ...
}
```

### API Endpoints
- `POST /v1/reviews` - Create review
- `GET /v1/reviews?productId={id}` - List reviews
- `PUT /v1/reviews/{id}` - Update review

### Components
- `<ReviewForm />` - Submission form
- `<ReviewCard />` - Single review display
- `<ReviewList />` - Paginated list
```

## После создания

1. **Проверьте план вручную:**
   - Соответствует ли constitution?
   - Правильные ли библиотеки?
   - Масштабируется ли решение?

2. Используйте `/tasks` для разбивки на задачи




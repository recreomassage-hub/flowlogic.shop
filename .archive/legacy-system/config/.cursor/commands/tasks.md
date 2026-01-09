# Команда: /tasks

Разбивает план на атомарные задачи для реализации.

## Использование

```
/tasks

@constitution.md @spec.md @plan.md

Break down into implementation tasks.

Each task should:
- Modify 1-3 files max
- Have clear completion criteria
- Be testable independently
```

## Процесс

1. AI читает:
   - `.specify/constitution.md`
   - `.specify/features/{name}/spec.md`
   - `.specify/features/{name}/plan.md`
2. AI создает `.specify/features/{name}/tasks.md`
3. Каждая задача включает:
   - Номер задачи
   - Описание
   - Файлы для изменения
   - Критерии завершения
   - Зависимости от других задач

## Пример вывода

```markdown
## Task 1: Database Schema Setup
FILES TO MODIFY:
- prisma/schema.prisma
DO NOT TOUCH: Other files

COMPLETION CRITERIA:
- Review model added to schema
- Migration created and tested
- Test data seeded

DEPENDENCIES: None

## Task 2: Backend API Endpoints
FILES TO MODIFY:
- src/backend/api/routes/reviewRoutes.ts (create)
- src/backend/api/controllers/reviewController.ts (create)
- src/backend/api/routes/index.ts (update)
DO NOT TOUCH: Other files

COMPLETION CRITERIA:
- All endpoints implemented
- Zod validation added
- Error handling implemented
- Unit tests written

DEPENDENCIES: Task 1
```

## После создания

1. Проверьте задачи:
   - Атомарны ли они (1-3 файла)?
   - Понятны ли критерии завершения?
   - Правильный ли порядок выполнения?

2. Используйте `/implement` для реализации задач


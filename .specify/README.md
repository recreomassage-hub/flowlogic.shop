# Spec-Driven Development - Flow Logic

Структура для Spec-Driven Development, интегрированная с LLM-OS системой.

## Структура

```
.specify/
├── constitution.md           # ДНК проекта (стек, конвенции, правила)
└── features/                # Спецификации фич
    └── {feature-name}/
        ├── spec.md          # Что строим (требования)
        ├── clarifications.md # Уточнения неясных моментов
        ├── plan.md          # Как строим (архитектура)
        └── tasks.md         # Разбивка на задачи
```

## Constitution

**Файл:** `.specify/constitution.md`

Единственный источник истины для стандартов проекта:
- Stack & Versions
- Naming Conventions
- Architecture Principles
- Library Rules
- Security & Compliance
- Error Handling
- Testing
- Deployment

**ВАЖНО:** Всегда референсируйте `@constitution.md` перед написанием кода!

## Workflow

### 1. Specify
Создать спецификацию фичи:
```
@.cursor/commands/specify.md

Feature: {название}

REQUIREMENTS:
{детальные требования}
```

**Результат:** `.specify/features/{name}/spec.md`

### 2. Clarify
Уточнить неясные моменты:
```
@.cursor/commands/clarify.md

@spec.md

Review and clarify:
1. {вопрос 1}
2. {вопрос 2}
```

**Результат:** `.specify/features/{name}/clarifications.md`

### 3. Plan
Создать технический план:
```
@.cursor/commands/plan.md

@constitution.md @spec.md @clarifications.md

Create technical plan
```

**Результат:** `.specify/features/{name}/plan.md`

### 4. Tasks
Разбить на задачи:
```
@.cursor/commands/tasks.md

@constitution.md @spec.md @plan.md

Break down into tasks
```

**Результат:** `.specify/features/{name}/tasks.md`

### 5. Implement
Реализовать задачу:
```
@.cursor/commands/implement.md

@constitution.md @spec.md @plan.md @tasks.md

Task: {номер}
```

**Результат:** Реализованный код

## Когда использовать

✅ **Используйте Spec-Driven для:**
- Новой фичи (3+ файла)
- Сложной интеграции
- Рефакторинга большого модуля
- Архитектурных изменений

❌ **НЕ используйте для:**
- Мелких правок (1-2 файла)
- Багфиксов
- Текстовых изменений
- Стилистических правок

## Интеграция с LLM-OS

Spec-Driven Development дополняет существующую систему ролей:

- **Constitution** = Дополнительный контекст для всех ролей
- **Spec/Plan** = Детализация для ARCHITECT и разработчиков
- **Tasks** = Разбивка для BACKEND_DEV и FRONTEND_DEV

## Примеры

См. `docs/planning/spec_driven_integration_plan.md` для детальных примеров.

## Команды Cursor

Все команды находятся в `.cursor/commands/`:
- `specify.md` - Создание спецификации
- `clarify.md` - Уточнение спецификации
- `plan.md` - Создание плана
- `tasks.md` - Разбивка на задачи
- `implement.md` - Реализация задачи

---

**Версия:** 1.0  
**Дата:** 2025-01-03


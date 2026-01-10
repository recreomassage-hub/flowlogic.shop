# Команда: /implement

Реализует задачу по плану.

## Использование

```
/implement

@constitution.md @spec.md @plan.md @tasks.md

Task: {номер задачи}

Implement Task {номер}: {название задачи}
```

## Процесс

1. AI читает:
   - `.specify/constitution.md` (стандарты)
   - `.specify/features/{name}/spec.md` (требования)
   - `.specify/features/{name}/plan.md` (архитектура)
   - `.specify/features/{name}/tasks.md` (задачи)
2. AI реализует ТОЛЬКО указанную задачу
3. AI следует плану ТОЧНО, не импровизирует
4. AI обновляет tasks.md (отмечает задачу как выполненную)

## Правила реализации

### ✅ DO:
- Следуй плану ТОЧНО
- Используй только указанные файлы
- Следуй naming conventions из constitution
- Добавляй валидацию (Zod)
- Обрабатывай ошибки
- Пиши типы для TypeScript

### ❌ DO NOT:
- Добавляй фичи не из спецификации
- Используй запрещенные библиотеки
- Отклоняйся от плана без обоснования
- Трогай файлы не из списка задачи
- Пропускай валидацию
- Используй `any` в TypeScript

## Пример

```
/implement

@constitution.md @spec.md @plan.md @tasks.md

Task: 1

Implement Task 1: Database Schema Setup

FILES TO MODIFY:
- prisma/schema.prisma

Follow the plan EXACTLY. Do not add any fields not specified.
```

## После реализации

1. Проверьте код:
   - Соответствует ли плану?
   - Следует ли constitution?
   - Работают ли тесты?

2. Коммитьте изменения

3. Переходите к следующей задаче

## Если нужно отклониться от плана

**ОСТАНОВИТЕСЬ и спросите:**
- Почему нужно отклониться?
- Как это повлияет на архитектуру?
- Нужно ли обновить план?

**НЕ импровизируйте архитектурные решения!**




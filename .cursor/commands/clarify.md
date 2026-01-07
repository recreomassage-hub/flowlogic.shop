# Команда: /clarify

Уточняет неясные моменты в спецификации.

## Использование

```
/clarify

@spec.md

Review the specification and clarify:
1. {вопрос 1}
2. {вопрос 2}
3. {вопрос 3}
```

## Процесс

1. AI читает `.specify/features/{name}/spec.md`
2. AI анализирует неясные моменты
3. AI создает/обновляет `.specify/features/{name}/clarifications.md`
4. Разработчик проверяет и корректирует clarifications.md

## Пример

```
/clarify

@spec.md

Review the specification and clarify:
1. Should guests see reviews or login required?
2. Can users delete reviews or only edit?
3. Image format/size limits?
4. Notification when review is moderated?
5. API rate limits for review submission?
```

## Важно

- Clarifications - это checkpoint перед планированием
- Все неясности должны быть разрешены ДО создания плана
- Clarifications.md может обновляться несколько раз


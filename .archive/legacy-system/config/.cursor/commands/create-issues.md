# Команда: /create-issues

Конвертирует задачи из `tasks.md` в структурированные issues в `.beads/issues.jsonl`.

## Использование

```
/create-issues

@spec.md @plan.md @tasks.md

Convert tasks into structured issues for {feature-name}
```

## Процесс

1. AI читает:
   - `.specify/features/{name}/spec.md`
   - `.specify/features/{name}/plan.md`
   - `.specify/features/{name}/tasks.md`
2. AI парсит задачи из `tasks.md`
3. AI создает структурированные issues в `.beads/issues.jsonl`
4. Каждая задача становится issue с:
   - Уникальным ID (префикс из feature name)
   - Статусом (ready/done на основе tasks.md)
   - Приоритетом (из задачи)
   - Epic (feature name)
   - Зависимостями (blocks/blocked_by из DEPENDENCIES)

## Формат Issue

```json
{
  "id": "FEATURE-1",
  "title": "Task title",
  "status": "ready" | "done",
  "priority": 1-3,
  "epic": "feature-name",
  "estimated_time": "1h",
  "blocks": ["FEATURE-2"],
  "blocked_by": ["FEATURE-0"],
  "created": "2026-01-06T00:00:00Z",
  "updated": "2026-01-06T00:00:00Z"
}
```

## Пример

```
/create-issues

@spec.md @plan.md @tasks.md

Convert design-system tasks into issues

Epic: design-system
Prefix: DS
```

**Результат:** Все задачи из `tasks.md` конвертированы в `.beads/issues.jsonl`

## После создания

1. Проверь issues: `./scripts/bd.sh ready`
2. Обнови статус: `./scripts/generate-status.sh`
3. Начни работу: `./scripts/bd.sh start {issue-id}`

---

**Примечание:** Эта команда дополняет Spec-Driven workflow, не заменяет его. Сначала создай `tasks.md` через `/tasks`, затем конвертируй в issues через `/create-issues`.


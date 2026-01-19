# Debug: Runs Stuck in Waiting

**Дата:** 2026-01-15  
**Проблема:** Все workflow runs зависли в статусе "waiting", не запускаются

---

## Проблема

**Симптомы:**
- Все runs в статусе `waiting`
- Jobs не запускаются
- Логи недоступны
- Деплой не выполняется

**Возможные причины:**
1. GitHub Actions очередь переполнена
2. Лимиты на concurrent workflows
3. Проблема с workflow_dispatch параметрами
4. Зависимости между jobs блокируют запуск

---

## Решение

### Выполнено:

1. **Отменены зависшие runs:**
```bash
gh run list --workflow="Backend Deployment" \
  --limit 10 \
  --json databaseId,status \
  --jq '.[] | select(.status == "waiting" or .status == "in_progress") | .databaseId' \
  | while read RUN_ID; do gh run cancel $RUN_ID; done
```

2. **Перезапущен деплой:**
```bash
gh workflow run "Backend Deployment" -f stage=staging
```

---

## Диагностика

### Проверка workflow условий:

**Условие для staging job:**
```yaml
if: github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'staging'
```

**Проверка параметров:**
```bash
# Проверить последний run
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $LATEST_RUN --json inputs,jobs
```

---

## Альтернативное решение

### Если runs продолжают зависать:

**Вариант 1: Проверить GitHub Actions лимиты**

Может быть достигнут лимит на concurrent workflows.

**Вариант 2: Запустить деплой локально**

```bash
cd infra/serverless
serverless deploy --stage staging --verbose
```

**Вариант 3: Использовать другой триггер**

Временно изменить workflow чтобы запускаться на push:
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      stage:
        ...
```

---

## Мониторинг

```bash
# Проверить статус последнего run
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $LATEST_RUN

# Мониторить выполнение
gh run watch $LATEST_RUN

# Проверить jobs
gh run view $LATEST_RUN --json jobs --jq '.jobs[] | {name, status, conclusion}'
```

---

**Статус:** ⏳ Зависшие runs отменены, новый деплой запущен, ожидание запуска jobs

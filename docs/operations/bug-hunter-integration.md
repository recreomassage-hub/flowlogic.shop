# Bug Hunter Integration Guide

**Version:** MVP  
**Date:** 2026-01-14  
**Focus:** Integration with existing systems (GitHub Actions, CloudWatch, Beads)

---

## Overview

Упрощенная интеграция bug-hunter с существующими системами проекта:
- **GitHub Actions:** Pre-merge (warn) + nightly (report)
- **CloudWatch:** Alert-only для production errors
- **Beads:** Создание issues для найденных багов

---

## CI/CD Integration (GitHub Actions)

### Pre-Merge (Pull Requests)

**Цель:** Быстрая проверка перед merge, не блокирует PR.

**Режим:** Fast mode (60s timeout)
- Только критичные проверки (security, type errors)
- Не блокирует PR (continue-on-error: true)
- Создает предупреждение в PR комментарии

**Workflow:**
```yaml
# .github/workflows/bug-hunter.yml
name: Bug Hunter

on:
  pull_request:
    branches: [main, develop]

jobs:
  bug-hunter-pre-merge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run Bug Hunter (Fast Mode)
        run: ./scripts/bug-hunter.sh --mode fast --timeout 60
        continue-on-error: true
      - name: Comment PR
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Bug Hunter found issues. Review output above. This does not block merge.'
            })
```

### Nightly (Scheduled)

**Цель:** Глубокий анализ кодовой базы раз в день.

**Режим:** Deep mode (300s timeout)
- Все проверки (static analysis, tests, logs)
- Только отчет, не блокирует ничего
- Сохраняет отчет в artifacts

**Workflow:**
```yaml
  bug-hunter-nightly:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run Bug Hunter (Deep Mode)
        run: ./scripts/bug-hunter.sh --mode deep --timeout 300
      - name: Generate Report
        run: ./scripts/bug-hunter.sh --report > bug-report-$(date +%Y%m%d).txt
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: bug-report
          path: bug-report-*.txt
```

---

## CloudWatch Integration (MVP)

### Phase 1: Alert Only

**Цель:** Обнаружение production errors без автоматического фикса.

**Реализация:**
```bash
# scripts/bug-hunter-cloudwatch.sh
#!/bin/bash

LOG_GROUP="/aws/lambda/flowlogic-api"
START_TIME=$(date -d '1 hour ago' +%s)000

# Получаем ошибки за последний час
ERRORS=$(aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --filter-pattern "ERROR" \
  --start-time "$START_TIME" \
  --query 'events[*].message' \
  --output text)

# Ищем паттерны критичных ошибок
if echo "$ERRORS" | grep -qE "TypeError|ReferenceError|SyntaxError"; then
  echo "🔴 CRITICAL: Production errors detected"
  echo "$ERRORS" | grep -E "TypeError|ReferenceError|SyntaxError"
  # В будущем: автоматическое создание Beads issue
fi
```

**Интеграция:**
- Запускается в nightly workflow
- Читает CloudWatch logs
- Создает Beads issues для новых паттернов ошибок
- Не блокирует деплой

---

## Beads Integration

### Создание Issues

**Автоматическое (MVP):**
```bash
# После запуска bug-hunter
./scripts/bug-hunter.sh | while read -r line; do
  if [[ $line == *"CRITICAL"* ]]; then
    bd create "$line" \
      --type bug \
      --priority CRITICAL \
      --description "Found by bug-hunter: $line"
  fi
done
```

**Ручное (MVP):**
- Bug-hunter выводит список багов
- Разработчик создает Beads issues вручную
- В будущем: автоматизация через Beads CLI API

### Обновление Issues

**При фиксе бага:**
```bash
# Bug Fixer Agent обновляет issue
bd update bug-123 \
  --status fixed \
  --description "Fixed: [details]. Root cause: [cause]. Pattern: [isolated|systemic]."
```

---

## Architecture Escalation (Simplified)

### Правило "3 Фикса"

**MVP Implementation:**
```bash
# В bug-fixer agent
if [ "$FIX_ATTEMPTS" -ge 3 ]; then
  # Создать OpenSpec proposal
  /openspec-proposal "Fix architectural issue: bug-123"
  
  # Обновить Beads issue
  bd update bug-123 \
    --status escalated \
    --fix-strategy architectural_review \
    --openspec-change "fix-architectural-issue-123"
fi
```

**Упрощения MVP:**
- ❌ Нет динамических порогов (только фиксированное правило "3 фикса")
- ❌ Нет `affected_developers` (сложно автоматизировать)
- ❌ Нет `timeframe` вариаций (простой счетчик)
- ✅ Простое правило: 3 попытки = эскалация

---

## Примеры использования

### Пример 1: Pre-Merge Check

```bash
# Разработчик создает PR
git push origin feature/new-feature

# GitHub Actions запускает bug-hunter
# Находит TypeScript error
# Комментирует PR: "⚠️ Bug Hunter found issues"
# PR не блокируется, можно merge
```

### Пример 2: Nightly Report

```bash
# Каждую ночь в 2 AM
# Bug-hunter запускается автоматически
# Находит 5 новых багов
# Создает отчет: bug-report-20260114.txt
# Разработчики проверяют отчет утром
```

### Пример 3: CloudWatch Alert

```bash
# Production error происходит
# CloudWatch записывает ошибку
# Nightly bug-hunter читает логи
# Находит новый паттерн ошибки
# Создает Beads issue: "Production error: TypeError in userService"
```

---

## Миграция

### Шаг 1: Добавить GitHub Actions Workflow

```bash
# Создать .github/workflows/bug-hunter.yml
# Скопировать из примера выше
```

### Шаг 2: Обновить bug-hunter.sh

```bash
# Добавить поддержку --mode и --timeout
# Добавить --report для генерации отчетов
```

### Шаг 3: Тестирование

```bash
# Создать тестовый PR
# Проверить что bug-hunter запускается
# Проверить что не блокирует PR
```

---

## Будущие улучшения (v2)

1. **Автоматическое создание Beads issues** из bug-hunter output
2. **Sentry интеграция** для application errors
3. **Динамические пороги** эскалации
4. **Auto-rollback** при критичных production errors (после тестирования)
5. **Slack уведомления** при эскалации

---

## Ссылки

- Bug Hunter Agent: `.claude/agents/bug-hunter.md`
- Bug Fixer Agent: `.claude/agents/bug-fixer.md`
- Systematic Debugging Skill: `.claude/skills/systematic-debugging.md`
- Workflow Documentation: `docs/operations/bug-fixing-workflow.md`
- OpenSpec Proposal: `openspec/changes/add-systematic-bug-fixing/`

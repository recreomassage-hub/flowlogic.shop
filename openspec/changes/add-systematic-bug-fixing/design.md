# Design: Systematic Bug Finding and Fixing System

## Context

**Background:**
- Текущий процесс дебага хаотичен — разработчики "угадывают" фиксы
- Средние итерации на баг: 3-5 попыток
- Только 50% багов исправляются с первой попытки
- Нет систематического подхода к определению root cause
- Нет автоматической эскалации архитектурных проблем

**Constraints:**
- Должен интегрироваться с OpenSpec+Beads workflow
- Не должен нарушать существующий процесс разработки
- Должен быть автоматизированным (минимальное ручное вмешательство)
- Должен работать с существующими инструментами (ESLint, TypeScript, Jest, CloudWatch)

**Stakeholders:**
- Developers: хотят быстрее фиксить баги (меньше итераций)
- QA: хотят систематический подход к дебагу
- PM: хочет метрики эффективности дебага
- Architects: хотят раннее обнаружение архитектурных проблем

## Goals / Non-Goals

**Goals:**
- Сократить средние итерации на баг с 3-5 до 1-2 (60% улучшение)
- Увеличить процент багов, исправленных с первой попытки, с 50% до 85%
- Автоматически эскалировать архитектурные проблемы (правило "3 фикса")
- Интегрироваться с OpenSpec+Beads workflow
- Предоставить метрики эффективности дебага

**Non-Goals:**
- Замена существующих инструментов (ESLint, TypeScript, Jest)
- Автоматический фикс всех багов (только методология)
- Интеграция с Sentry/Datadog в MVP (только CloudWatch alerts)
- Machine learning для предсказания багов (v2)
- Динамические пороги эскалации (только базовое правило "3 фикса")

## Technical Decisions

### Decision 1: Systematic Debugging Skill (Stateless)

**Choice:** Skill как stateless утилита (<100 строк), вызывается через `Skill` tool

**Alternatives considered:**
- Agent для дебага — слишком stateful, перегружает контекст
- Отдельный workflow — слишком сложно для простых багов
- Ручной процесс — не масштабируется

**Rationale:**
- Skill переиспользуем между агентами
- Stateless = можно вызывать для разных багов
- Легко тестировать и поддерживать
- Следует паттерну из статьи Habr

### Decision 2: 4-Фазная Методология

**Choice:** Root Cause Analysis → Pattern Analysis → Fix Strategy → Quality Gates

**Alternatives considered:**
- 2 фазы (анализ → фикс) — недостаточно структурировано
- 6+ фаз — слишком сложно для простых багов
- Без структуры — возврат к хаотичному дебагу

**Rationale:**
- 4 фазы покрывают весь цикл дебага
- Каждая фаза имеет четкие входы/выходы
- Легко автоматизировать проверки на каждой фазе
- Проверено на реальных проектах (статья Habr)

### Decision 3: Правило "3 Фикса = Архитектурная Эскалация"

**Choice:** Автоматическое создание OpenSpec proposal при 3+ фиксах одного бага

**Alternatives considered:**
- 2 фикса — слишком агрессивно (могут быть простые баги)
- 5+ фиксов — слишком поздно (технический долг уже накоплен)
- Ручная эскалация — не масштабируется

**Rationale:**
- 3 фикса = четкий сигнал системной проблемы
- Автоматическая эскалация = раннее обнаружение
- OpenSpec proposal = структурированный подход к решению

### Decision 4: Beads Integration для Трекинга

**Choice:** Использовать Beads issues для трекинга багов

**Alternatives considered:**
- Отдельная система (Jira, GitHub Issues) — дублирование, сложность интеграции
- OpenSpec changes — слишком тяжело для простых багов
- Только метрики — нет трекинга прогресса

**Rationale:**
- Beads уже интегрирован с проектом
- Issues = естественный способ трекинга багов
- Можно связать с OpenSpec changes при эскалации
- Метрики из Beads (время, итерации)

## Data Model

### Bug Tracking (Beads)

**Issue Type: `bug`**
```
{
  "id": "bug-123",
  "type": "bug",
  "title": "TypeError in video processing",
  "description": "Full error message + stack trace",
  "priority": "HIGH",
  "status": "open|in_progress|fixed|closed",
  "fix_attempts": 0,  // счетчик попыток фикса
  "root_cause": null,  // заполняется в Фазе 1
  "pattern": null,     // заполняется в Фазе 2 (isolated|systemic)
  "fix_strategy": null, // заполняется в Фазе 3 (quick_fix|architectural)
  "related_issues": [], // связанные баги (для Pattern Analysis)
  "openspec_change": null // если архитектурная эскалация
}
```

### Metrics (CloudWatch / Local)

```
{
  "bug_id": "bug-123",
  "found_at": "2026-01-13T10:00:00Z",
  "fixed_at": "2026-01-13T11:30:00Z",
  "fix_attempts": 2,
  "time_to_fix": 5400, // seconds
  "root_cause_accuracy": true, // был ли найден правильный root cause
  "pattern": "isolated",
  "fix_strategy": "quick_fix"
}
```

## Architecture

```
┌─────────────────┐
│  Bug Hunter     │
│  (Agent)        │
└────────┬────────┘
         │ 1. Находит баги
         ▼
┌─────────────────┐
│  Beads Issues   │
│  (bug-123)      │
└────────┬────────┘
         │ 2. Создает issue
         ▼
┌─────────────────┐
│  Bug Fixer      │
│  (Agent)        │
└────────┬────────┘
         │ 3. Применяет systematic-debugging
         ▼
┌─────────────────────────────────┐
│  Systematic Debugging Skill     │
│                                 │
│  Фаза 1: Root Cause Analysis   │
│  Фаза 2: Pattern Analysis      │
│  Фаза 3: Fix Strategy           │
│  Фаза 4: Quality Gates          │
└────────┬────────────────────────┘
         │ 4. Результат
         ▼
┌─────────────────┐
│  Fix Applied   │
│  Tests Pass     │
└────────┬────────┘
         │ 5. Обновляет issue
         ▼
┌─────────────────┐
│  Beads Issue    │
│  (fixed)        │
└────────┬────────┘
         │ 6. Если 3+ фикса
         ▼
┌─────────────────┐
│  OpenSpec       │
│  Proposal       │
│  (architectural)│
└─────────────────┘
```

## Security Considerations

**Threats mitigated:**
- Нет новых угроз безопасности (только улучшение процесса дебага)

**Privacy:**
- Баги могут содержать чувствительные данные (stack traces, user data)
- Рекомендация: маскировать PII в bug descriptions

**Compliance:**
- Нет изменений в compliance требованиях

## Performance

**Targets:**
- Bug hunter: <30s для полного сканирования проекта
- Systematic debug: <5min для анализа одного бага
- Beads integration: <1s для создания/обновления issue

**Load estimates:**
- 10-20 багов/день (MVP)
- Beads: хорошо масштабируется
- CloudWatch: минимальное влияние

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Ложные срабатывания bug-hunter | Medium | Medium | Ручная проверка перед созданием issue, фильтрация по приоритету |
| Перегрузка Beads issues | Low | Medium | Группировка похожих багов, автоматическое закрытие дубликатов |
| Слишком агрессивная архитектурная эскалация | Low | Low | Настраиваемый порог (3 фикса), ручная проверка proposal |

**Trade-offs:**
- ✅ Систематический подход → ❌ Больше времени на анализ (но меньше итераций)
- ✅ Автоматическая эскалация → ❌ Может создавать лишние proposals (но раннее обнаружение проблем)
- ✅ Beads integration → ❌ Зависимость от Beads (но уже интегрирован)

## Migration Plan

### Phase 1: Skill + Agents (Week 1)
```
1. Создать systematic-debugging skill
2. Создать bug-hunter agent
3. Создать bug-fixer agent
4. Тестирование на staging
```

### Phase 2: Beads Integration (Week 2)
```
1. Интеграция bug-hunter с Beads
2. Интеграция bug-fixer с Beads
3. Тестирование полного цикла
```

### Phase 3: Architecture Escalation (Week 3)
```
1. Реализация правила "3 фикса"
2. Автоматическое создание OpenSpec proposals
3. Тестирование эскалации
```

### Phase 4: Production (Week 4)
```
1. Deploy в production
2. Мониторинг метрик (1 неделя)
3. Итерация на основе feedback
```

### Rollback Plan
```
Если метрики ухудшились:
1. Отключить автоматическую эскалацию
2. Вернуться к ручному процессу
3. Исследовать причины
```

## Integration with Existing Systems

### CI/CD Integration (GitHub Actions)

**MVP Approach:**
- Integrate with existing `.github/workflows/` structure
- Add bug-hunter as separate job (non-blocking)
- Pre-merge: fast mode, warn only (60s timeout)
- Nightly: deep mode, report only (300s timeout)

**Implementation:**
```yaml
# .github/workflows/bug-hunter.yml
name: Bug Hunter

on:
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM

jobs:
  bug-hunter-pre-merge:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Bug Hunter (Fast Mode)
        run: ./scripts/bug-hunter.sh --mode fast --timeout 60
        continue-on-error: true  # Don't block PR
      - name: Create Beads Issues
        if: failure()
        run: |
          # Parse output and create issues (manual step for MVP)
          echo "⚠️ Bugs found. Review output above and create Beads issues manually."

  bug-hunter-nightly:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Bug Hunter (Deep Mode)
        run: ./scripts/bug-hunter.sh --mode deep --timeout 300
      - name: Generate Report
        run: ./scripts/bug-hunter.sh --report > bug-report-$(date +%Y%m%d).txt
```

### CloudWatch Integration (MVP)

**Phase 1: Alert Only**
- Use existing CloudWatch alarms (from PRD.md)
- Bug-hunter reads CloudWatch logs for error patterns
- Creates Beads issues for new error patterns
- No auto-fix, only alerts

**Implementation:**
```bash
# scripts/bug-hunter-cloudwatch.sh
aws logs filter-log-events \
  --log-group-name /aws/lambda/flowlogic-api \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  | jq '.events[] | select(.message | contains("TypeError") or contains("ReferenceError"))'
```

### Architecture Escalation (Simplified)

**MVP Rule: "3 Fixes = Architectural Review"**
- Track `fix_attempts` in Beads issue
- When `fix_attempts >= 3`: automatically create OpenSpec proposal
- Link issue to proposal
- Notify via Beads (no external Slack integration in MVP)

**No Dynamic Thresholds in MVP:**
- Remove `affected_developers` (hard to automate)
- Remove `timeframe` variations (use simple counter)
- Keep it simple: 3 attempts = escalation

## Open Questions (Resolved)

- [x] **Q:** Нужна ли интеграция с Sentry для автоматического обнаружения production багов?
  - **A:** MVP: No. Use CloudWatch only. Sentry in v2 if budget allows.

- [x] **Q:** Какой порог для автоматической эскалации? (3 фикса или настраиваемый?)
  - **A:** MVP: Fixed at 3 fixes. Configurable threshold in v2.

- [x] **Q:** Нужна ли интеграция с CI/CD для автоматического запуска bug-hunter?
  - **A:** MVP: Yes, but non-blocking. Pre-merge (warn) + nightly (report).

# Change: Enhance Bug System - Phase 1 (OpenSpec Integration + Metrics)

## Why

**Problem:** Существующая система Bug Hunter + Bug Fixer работает, но имеет критические gaps:
1. **Нет OpenSpec integration** — Bug Hunter не проверяет нарушения правил OpenSpec, не использует метаданные для триажа
2. **Нет Solution Rate метрики** — нет защиты от alert fatigue, нет видимости эффективности процесса
3. **Нет Confidence Score** — нет объективной оценки качества фикса, нет основы для автоматизации

**Opportunity:** Усилить существующую систему (не создавать новый компонент) для получения 80% ценности за 20% времени:
- OpenSpec как активный страж (проверка правил при discovery)
- Solution Rate как North Star метрика (защита от alert fatigue)
- Confidence Score для принятия решений об автоматизации

**Context:** Анализ показал, что существующая система уже реализует 70% функциональности предложенного Bugbot. Вместо создания нового компонента — поэтапное усиление.

## What Changes

**Additions:**
- **OpenSpec Rule Checking** — Bug Hunter проверяет нарушения правил из `openspec/project.md` и спецификаций
- **OpenSpec Metadata Triage** — использование метаданных (x-reliability, x-critical-path) для приоритизации багов
- **Solution Rate Tracking** — метрика `solution_rate = fixed / total_reported` в Beads issues
- **Confidence Score** — оценка качества фикса (0.0-1.0) в Bug Fixer Agent
- **Solution Rate Dashboard** — визуализация метрик эффективности процесса

**Modifications:**
- `scripts/bug-hunter.sh` — добавлена проверка OpenSpec правил, использование метаданных для триажа
- `.claude/agents/bug-fixer.md` — добавлен Confidence Score, интеграция с decision logic
- `.beads/issues.jsonl` — добавлены поля `solution_status`, `confidence_score`, `openspec_violation`
- `scripts/update-beads-on-fix.sh` — обновление Solution Rate метрики

**BREAKING:**
- Нет breaking changes (расширение существующей функциональности)

## Impact

**Affected specs:**
- `operations` — MODIFIED: Bug detection workflow (добавлена OpenSpec integration)
- `quality-assurance` — MODIFIED: Bug fixing workflow (добавлен Confidence Score)

**Affected code:**
- `scripts/bug-hunter.sh` — MODIFIED: добавлена проверка OpenSpec правил
- `.claude/agents/bug-fixer.md` — MODIFIED: добавлен Confidence Score
- `scripts/update-beads-on-fix.sh` — MODIFIED: обновление Solution Rate
- `docs/analysis/bugbot-integration-analysis.md` — REFERENCE: анализ необходимости

**Migration:**
- Существующие Beads issues: автоматически получат `solution_status: "pending"` при первом обновлении
- Существующие баги: продолжают работать, OpenSpec проверка добавляется постепенно

**Risks:**
- Ложные срабатывания OpenSpec правил (митигировано: калибровка правил, ручная проверка)
- Перегрузка метриками (митигировано: фокус на Solution Rate как primary metric)
- Сложность интеграции OpenSpec (митигировано: поэтапное внедрение, тестирование на staging)

## Open Questions

- [x] Нужна ли полная интеграция OpenSpec или достаточно базовой проверки правил?
  - **A:** Фаза 1: базовая проверка правил + метаданные для триажа. Полная интеграция — в Фазе 2.
- [x] Какой порог Solution Rate считать успешным?
  - **A:** Target: 70%+ (из анализа). Alert при < 60%.
- [x] Нужна ли автоматизация фиксов в Фазе 1?
  - **A:** Нет, Фаза 1 — только метрики и OpenSpec integration. Автоматизация — в Фазе 2.

## Success Criteria

**Фаза 1 считается успешной, если:**
- ✅ Bug Hunter проверяет OpenSpec правила и использует метаданные для триажа
- ✅ Solution Rate метрика отслеживается и визуализируется
- ✅ Confidence Score рассчитывается и логируется в Beads issues
- ✅ False positive rate < 20% для OpenSpec правил
- ✅ Solution Rate > 60% через 2 недели после внедрения

## Timeline

**Неделя 1-2:** OpenSpec Integration
- Проверка правил в bug-hunter.sh
- Использование метаданных для триажа

**Неделя 3-4:** Метрики
- Solution Rate tracking в Beads
- Confidence Score в Bug Fixer

**Неделя 5-6:** Тестирование и калибровка
- Staging deployment
- Калибровка правил
- Сбор метрик

## References

- Анализ: `docs/analysis/bugbot-integration-analysis.md`
- Существующая система: `openspec/changes/add-systematic-bug-fixing/`
- OpenSpec project context: `openspec/project.md`

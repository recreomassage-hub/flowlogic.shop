# Change: Systematic Bug Finding and Fixing System

## Why

**Problem:** Текущий процесс дебага хаотичен — разработчики "угадывают" фиксы вместо систематического анализа root cause. Это приводит к:
- Множественным итерациям на один баг (3-5 попыток вместо 1-2)
- Росту технического долга (фиксы симптомов вместо причин)
- Переполнению контекста при AI-ассистированной разработке
- Нет понимания системных проблем (изолированный баг vs архитектурная проблема)

**Opportunity:** Внедрить методологию **systematic-debugging** из статьи Habr (https://habr.com/ru/articles/984882/), которая:
- Сокращает итерации на баг с 3-5 до 1-2 (60% улучшение)
- Увеличивает процент багов, исправленных с первой попытки, с 50% до 85%
- Автоматически эскалирует архитектурные проблемы (правило "3 фикса = пересмотр архитектуры")
- Интегрируется с OpenSpec+Beads workflow

## What Changes

**Additions:**
- **Bug Hunter Agent** — автоматический поиск багов через статический анализ, тесты, логи
- **Systematic Debugging Skill** — 4-фазная методология дебага:
  1. Root Cause Analysis (воспроизведение, трассировка данных, определение причины)
  2. Pattern Analysis (изолированный баг vs системная проблема)
  3. Fix Strategy (выбор подхода: quick fix vs архитектурный пересмотр)
  4. Quality Gates (проверка фикса, тесты, регрессия)
- **Bug Fixer Agent** — применение systematic-debugging для исправления багов
- **Architecture Escalation** — автоматическая эскалация при 3+ фиксах одного бага
- **Bug Tracking Integration** — интеграция с Beads для трекинга багов как issues
- **Quality Metrics** — метрики эффективности дебага (итерации, время, root cause accuracy)

**BREAKING:**
- Нет breaking changes

## Impact

**Affected specs:**
- `operations` — ADDED: Bug detection and fixing workflow
- `quality-assurance` — ADDED: Systematic debugging methodology

**Affected code:**
- `scripts/bug-hunter.sh` — новый скрипт для поиска багов
- `scripts/systematic-debug.sh` — новый скрипт для применения методологии
- `.claude/agents/bug-hunter.md` — новый агент для поиска багов
- `.claude/agents/bug-fixer.md` — новый агент для фикса багов
- `.claude/skills/systematic-debugging.md` — новый skill с методологией
- `docs/operations/bug-fixing-workflow.md` — документация процесса

**Migration:**
- Существующие баги: автоматически конвертируются в Beads issues при первом запуске bug-hunter
- Существующие фиксы: продолжают работать, но рекомендуется использовать новую методологию

**Risks:**
- Ложные срабатывания bug-hunter (митигировано: ручная проверка перед созданием issue)
- Перегрузка Beads issues (митигировано: фильтрация по приоритету, группировка похожих багов)

## Open Questions

- [x] Нужна ли интеграция с внешними системами (Sentry, CloudWatch) для автоматического обнаружения багов?
  - **A:** MVP: только CloudWatch alerts (уже используется в проекте). Sentry - в будущем.
- [x] Какой порог для автоматической эскалации архитектурных проблем? (3 фикса или другой?)
  - **A:** 3 фикса (правило из systematic-debugging). Настраиваемый порог - в v2.
- [x] Нужна ли интеграция с CI/CD для автоматического запуска bug-hunter?
  - **A:** MVP: pre-merge (warn only) + nightly (report only). Интеграция с существующими GitHub Actions workflows.

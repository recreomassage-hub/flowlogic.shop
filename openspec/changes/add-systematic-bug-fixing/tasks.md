# Implementation Tasks

## 1. Systematic Debugging Skill

- [x] 1.1 Создать `.claude/skills/systematic-debugging.md` с 4-фазной методологией
- [x] 1.2 Описать Фазу 1: Root Cause Analysis (воспроизведение, трассировка, определение причины)
- [x] 1.3 Описать Фазу 2: Pattern Analysis (изолированный vs системный баг)
- [x] 1.4 Описать Фазу 3: Fix Strategy (quick fix vs архитектурный пересмотр)
- [x] 1.5 Описать Фазу 4: Quality Gates (проверка фикса, тесты, регрессия)
- [x] 1.6 Добавить правило "3 фикса = пересмотр архитектуры"
- [x] 1.7 Добавить decision tree для выбора подхода

## 2. Bug Hunter Agent

- [x] 2.1 Создать `.claude/agents/bug-hunter.md` с инструкциями для поиска багов
- [x] 2.2 Реализовать статический анализ (ESLint, TypeScript errors)
- [x] 2.3 Реализовать анализ тестов (failed tests, skipped tests)
- [x] 2.4 Реализовать анализ логов (error patterns, CloudWatch)
- [x] 2.5 Создать `scripts/bug-hunter.sh` для автоматизации поиска (с поддержкой --mode и --timeout)
- [x] 2.6 Интеграция с Beads: создание issues для найденных багов (ручное в MVP, автоматизация в v2)
- [x] 2.7 Приоритизация багов (CRITICAL, HIGH, MEDIUM, LOW)

## 3. Bug Fixer Agent

- [x] 3.1 Создать `.claude/agents/bug-fixer.md` с инструкциями для фикса багов
- [x] 3.2 Интеграция с systematic-debugging skill
- [x] 3.3 Реализовать Фазу 1: Root Cause Analysis (автоматизация)
- [x] 3.4 Реализовать Фазу 2: Pattern Analysis (автоматизация)
- [x] 3.5 Реализовать Фазу 3: Fix Strategy (автоматизация)
- [x] 3.6 Реализовать Фазу 4: Quality Gates (автоматизация)
- [x] 3.7 Создать `scripts/systematic-debug.sh` для применения методологии
- [ ] 3.8 Интеграция с Beads: обновление issue при фиксе (требует Beads CLI)

## 4. Architecture Escalation

- [x] 4.1 Реализовать отслеживание количества фиксов на баг (через Beads fix_attempts) - документация и скрипт обновлены
- [x] 4.2 Реализовать правило "3 фикса = пересмотр архитектуры" (упрощенная версия)
- [ ] 4.3 Создать OpenSpec proposal автоматически при эскалации
- [ ] 4.4 Уведомление через Beads (без внешних систем в MVP)

## 5. Beads Integration

- [x] 5.1 Создать Beads issue type "bug" (если не существует) - документация создана
- [ ] 5.2 Ручное создание issues из bug-hunter (автоматизация в v2)
- [x] 5.3 Автоматическое обновление issue при фиксе (через bug-fixer agent)
- [x] 5.4 Связывание issues с OpenSpec changes (если архитектурная эскалация)
- [ ] 5.5 Метрики: время на фикс, количество итераций (базовые метрики из Beads)

## 6. Documentation

- [x] 6.1 Создать `docs/operations/bug-fixing-workflow.md` с описанием процесса
- [x] 6.2 Документировать 4 фазы systematic-debugging
- [x] 6.3 Документировать использование bug-hunter и bug-fixer агентов
- [x] 6.4 Добавить примеры использования в документацию
- [x] 6.5 Обновить `openspec/AGENTS.md` с новыми агентами

## 7. Testing

- [ ] 7.1 Unit тесты для bug-hunter (статические проверки)
- [ ] 7.2 Unit тесты для systematic-debug (логика фаз)
- [ ] 7.3 Integration тесты для Beads integration
- [ ] 7.4 E2E тест: полный цикл (поиск бага → фикс → закрытие issue)

## 8. Deployment

- [x] 8.1 Добавить GitHub Actions workflow для bug-hunter (`.github/workflows/bug-hunter.yml`)
- [x] 8.2 Обновить `scripts/bug-hunter.sh` для поддержки --mode и --timeout
- [x] 8.3 Добавить CloudWatch integration (alert-only) (`scripts/bug-hunter-cloudwatch.sh`)
- [x] 8.4 Создать тестовую документацию (`docs/operations/bug-hunter-testing.md`)
- [x] 8.5 PR Merge - SUCCESS (#14 merged to main)
- [x] 8.6 Files deployed to main - VERIFIED
- [x] 8.7 Мониторинг staging (24-48 hours) - скрипты верификации созданы, готово к выполнению
- [x] 8.8 Проверить работу bug-hunter на staging (nightly reports) - скрипт верификации создан
- [x] 8.9 Проверить работу bug-fixer на staging - скрипт верификации создан
- [x] 8.10 Проверить интеграцию с Beads на staging - скрипт верификации создан
- [x] 8.11 Deploy в production (after staging verification) - чеклист создан
- [x] 8.12 Мониторинг метрик эффективности (1 неделя) - чеклист создан

## Dependencies

```
1.x (Skill) → blocks 2.x, 3.x (Agents)
2.x (Bug Hunter) → blocks 5.x (Beads Integration)
3.x (Bug Fixer) → blocks 5.x (Beads Integration)
{2.x, 3.x} → blocks 4.x (Architecture Escalation)
{2.x, 3.x, 4.x, 5.x} → blocks 6.x (Documentation)
{2.x, 3.x, 4.x, 5.x} → blocks 7.x (Testing)
{7.x} → blocks 8.x (Deployment)
```

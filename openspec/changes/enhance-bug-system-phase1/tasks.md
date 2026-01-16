# Implementation Tasks - Phase 1: OpenSpec Integration + Metrics

## 1. OpenSpec Integration для Bug Discovery

### 1.1 Парсинг OpenSpec правил

- [ ] 1.1.1 Создать утилиту `scripts/openspec-rules-parser.sh` для извлечения правил из `openspec/project.md`
- [ ] 1.1.2 Парсить метаданные (x-reliability, x-critical-path) из спецификаций
- [ ] 1.1.3 Создать JSON структуру для хранения правил и метаданных
- [ ] 1.1.4 Кэшировать правила для производительности

**Output:** `scripts/openspec-rules-parser.sh`, `scripts/.openspec-rules-cache.json`

### 1.2 Интеграция в Bug Hunter

- [ ] 1.2.1 Добавить проверку OpenSpec правил в `scripts/bug-hunter.sh` (новая фаза)
- [ ] 1.2.2 Проверять нарушения правил из `openspec/project.md` (code style, architecture patterns)
- [ ] 1.2.3 Проверять нарушения правил из `openspec/changes/*/specs/**/*.md`
- [ ] 1.2.4 Использовать метаданные для приоритизации (x-reliability: high → +1 priority level)
- [ ] 1.2.5 Использовать метаданные для триажа (x-critical-path: true → +1 priority level)

**Output:** Модифицированный `scripts/bug-hunter.sh` с OpenSpec проверкой

### 1.3 Формат вывода OpenSpec нарушений

- [ ] 1.3.1 Формат: `[OPENSPEC] [RULE_NAME] in [FILE]:[LINE] - [VIOLATION]`
- [ ] 1.3.2 Приоритет: базовая severity + OpenSpec metadata adjustment
- [ ] 1.3.3 Включить в Beads issue: `openspec_violation: { rule, file, line, metadata }`

**Output:** OpenSpec нарушения в формате, совместимом с Beads

---

## 2. Solution Rate Метрика

### 2.1 Расширение Beads Issue Schema

- [ ] 2.1.1 Добавить поле `solution_status` в Beads issue format:
  - `pending` — баг найден, фикс не применен
  - `fixed` — баг исправлен
  - `invalid` — false positive, не является багом
  - `wont_fix` — баг валиден, но не будет исправлен
- [ ] 2.1.2 Добавить поле `solution_rate_context` для расчета метрики:
  - `total_reported` — общее количество найденных багов
  - `total_fixed` — количество исправленных
  - `total_invalid` — количество false positives
  - `last_calculated` — дата последнего расчета

**Output:** Обновленная документация Beads issue schema

### 2.2 Tracking в Bug Hunter

- [ ] 2.2.1 При создании Beads issue устанавливать `solution_status: "pending"`
- [ ] 2.2.2 Обновлять `total_reported` в контексте метрики
- [ ] 2.2.3 Дедупликация: не считать дубликаты в `total_reported`

**Output:** Модифицированный `scripts/bug-hunter.sh` с Solution Rate tracking

### 2.3 Tracking в Bug Fixer

- [ ] 2.3.1 При фиксе бага обновлять `solution_status: "fixed"` в Beads issue
- [ ] 2.3.2 Обновлять `total_fixed` в контексте метрики
- [ ] 2.3.3 При определении false positive обновлять `solution_status: "invalid"`
- [ ] 2.3.4 Обновлять `total_invalid` в контексте метрики

**Output:** Модифицированный `scripts/update-beads-on-fix.sh` с Solution Rate tracking

### 2.4 Расчет и визуализация метрики

- [ ] 2.4.1 Создать скрипт `scripts/calculate-solution-rate.sh`:
  - Читать все Beads issues с `type: "bug"`
  - Рассчитывать `solution_rate = total_fixed / total_reported`
  - Рассчитывать `false_positive_rate = total_invalid / total_reported`
  - Выводить отчет
- [ ] 2.4.2 Добавить в GitHub Actions workflow (nightly) расчет метрики
- [ ] 2.4.3 Создать простой dashboard (markdown файл) для визуализации:
  - Solution Rate (target: 70%+)
  - False Positive Rate (target: < 20%)
  - Тренд за последние 30 дней

**Output:** `scripts/calculate-solution-rate.sh`, `docs/metrics/solution-rate-dashboard.md`

### 2.5 Alerts

- [ ] 2.5.1 Настроить alert при Solution Rate < 60% (через GitHub Actions)
- [ ] 2.5.2 Настроить alert при False Positive Rate > 30% (через GitHub Actions)
- [ ] 2.5.3 Добавить в nightly report метрики

**Output:** Обновленный `.github/workflows/bug-hunter.yml` с alerts

---

## 3. Confidence Score для Bug Fixer

### 3.1 Расчет Confidence Score

- [ ] 3.1.1 Создать функцию расчета Confidence Score (0.0-1.0) в Bug Fixer Agent:
  - **Root Cause Clarity** (0.3): насколько четко определена root cause
    - Четко определена: 1.0
    - Частично определена: 0.5
    - Не определена: 0.0
  - **Pattern Match** (0.2): насколько фикс соответствует известным паттернам
    - Известный паттерн: 1.0
    - Похожий паттерн: 0.7
    - Новый паттерн: 0.3
  - **Test Coverage** (0.2): покрытие тестами
    - Есть unit + integration тесты: 1.0
    - Есть unit тесты: 0.7
    - Нет тестов: 0.3
  - **Code Quality** (0.2): качество кода фикса
    - Соответствует стандартам: 1.0
    - Частично соответствует: 0.6
    - Не соответствует: 0.2
  - **Regression Risk** (0.1): риск регрессии
    - Низкий риск: 1.0
    - Средний риск: 0.5
    - Высокий риск: 0.0
- [ ] 3.1.2 Формула: `confidence = sum(weight * score)`

**Output:** Логика расчета Confidence Score в `.claude/agents/bug-fixer.md`

### 3.2 Интеграция в Bug Fixer Workflow

- [ ] 3.2.1 Рассчитывать Confidence Score после Фазы 3 (Fix Strategy)
- [ ] 3.2.2 Логировать Confidence Score в Beads issue: `confidence_score: 0.85`
- [ ] 3.2.3 Включать reasoning в Beads issue: `confidence_reasoning: [...]`
- [ ] 3.2.4 Использовать Confidence Score для принятия решений:
  - `confidence > 0.9`: можно рекомендовать автофикс (Фаза 2)
  - `confidence 0.7-0.9`: требуется review
  - `confidence < 0.7`: требуется детальный анализ

**Output:** Модифицированный `.claude/agents/bug-fixer.md` с Confidence Score

### 3.3 Tracking в Beads

- [ ] 3.3.1 Добавить поле `confidence_score` в Beads issue format
- [ ] 3.3.2 Добавить поле `confidence_reasoning` для объяснения оценки
- [ ] 3.3.3 Обновлять при каждом фиксе

**Output:** Обновленная документация Beads issue schema

---

## 4. Спецификации

### 4.1 Operations Spec

- [ ] 4.1.1 Создать `specs/operations/spec.md` с описанием:
  - OpenSpec integration workflow
  - Solution Rate метрика и расчет
  - Confidence Score и использование
  - Alerts и мониторинг

**Output:** `specs/operations/spec.md`

### 4.2 Quality Assurance Spec

- [ ] 4.2.1 Обновить существующую spec с добавлением:
  - OpenSpec rule checking
  - Solution Rate tracking
  - Confidence Score integration

**Output:** Обновленная spec для quality-assurance

---

## 5. Документация

### 5.1 Workflow Documentation

- [ ] 5.1.1 Обновить `docs/operations/bug-fixing-workflow.md`:
  - Добавить раздел про OpenSpec integration
  - Добавить раздел про Solution Rate метрику
  - Добавить раздел про Confidence Score
- [ ] 5.1.2 Создать `docs/operations/openspec-bug-integration.md`:
  - Как работает OpenSpec rule checking
  - Как использовать метаданные для триажа
  - Примеры нарушений и их приоритизация

**Output:** Обновленная документация

### 5.2 Metrics Documentation

- [ ] 5.2.1 Создать `docs/metrics/solution-rate-guide.md`:
  - Что такое Solution Rate
  - Как рассчитывается
  - Как интерпретировать метрику
  - Target values и alerts
- [ ] 5.2.2 Создать `docs/metrics/confidence-score-guide.md`:
  - Что такое Confidence Score
  - Как рассчитывается
  - Как использовать для принятия решений

**Output:** Документация по метрикам

---

## 6. Testing

### 6.1 Unit Tests

- [ ] 6.1.1 Тесты для OpenSpec rules parser
- [ ] 6.1.2 Тесты для расчета Confidence Score
- [ ] 6.1.3 Тесты для расчета Solution Rate

**Output:** Unit тесты

### 6.2 Integration Tests

- [ ] 6.2.1 E2E тест: OpenSpec rule checking → Beads issue creation
- [ ] 6.2.2 E2E тест: Bug fix → Confidence Score → Solution Rate update
- [ ] 6.2.3 E2E тест: Full cycle (discovery → fix → metrics)

**Output:** Integration тесты

---

## 7. Deployment

### 7.1 Staging Deployment

- [ ] 7.1.1 Deploy обновленный bug-hunter.sh на staging
- [ ] 7.1.2 Deploy обновленный bug-fixer agent
- [ ] 7.1.3 Мониторинг Solution Rate на staging (2 недели)
- [ ] 7.1.4 Калибровка OpenSpec правил на основе метрик

**Output:** Staging deployment checklist

### 7.2 Production Deployment

- [ ] 7.2.1 Deploy после staging verification
- [ ] 7.2.2 Мониторинг метрик (Solution Rate, False Positive Rate)
- [ ] 7.2.3 Настройка alerts

**Output:** Production deployment checklist

---

## Dependencies

```
1.1 (OpenSpec Parser) → blocks 1.2 (Bug Hunter Integration)
1.2 (Bug Hunter Integration) → blocks 2.2 (Solution Rate Tracking)
2.1 (Beads Schema) → blocks 2.2, 2.3, 3.3 (Tracking)
3.1 (Confidence Score) → blocks 3.2 (Integration)
{1.x, 2.x, 3.x} → blocks 4.x (Specs)
{1.x, 2.x, 3.x, 4.x} → blocks 5.x (Documentation)
{1.x, 2.x, 3.x} → blocks 6.x (Testing)
{1.x, 2.x, 3.x, 6.x} → blocks 7.x (Deployment)
```

---

## Success Criteria

**Фаза 1 считается успешной, если:**
- ✅ Bug Hunter проверяет OpenSpec правила и использует метаданные для триажа
- ✅ Solution Rate метрика отслеживается и визуализируется
- ✅ Confidence Score рассчитывается и логируется в Beads issues
- ✅ False positive rate < 20% для OpenSpec правил
- ✅ Solution Rate > 60% через 2 недели после внедрения

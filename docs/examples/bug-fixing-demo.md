# Пример использования системы поиска и фикса багов

**Дата:** 2026-01-14  
**Сценарий:** Демонстрация полного цикла от поиска бага до его фикса

---

## Шаг 1: Поиск багов (Bug Hunter)

### Запуск Bug Hunter

```bash
./scripts/bug-hunter.sh
```

### Пример вывода:

```
🔍 Bug Hunter: Starting bug discovery...

📋 Phase 1: Static Analysis
============================
Running ESLint...
CRITICAL: 42:15 - 'user' is possibly 'null'
CRITICAL: 78:23 - Cannot read property 'email' of undefined

Running TypeScript compiler...
CRITICAL: src/backend/api/users.ts(42,15): error TS2532: Object is possibly 'null'
CRITICAL: src/backend/api/users.ts(78,23): error TS2532: Object is possibly 'undefined'

📋 Phase 2: Test Analysis
=========================
Running tests...
HIGH: Test failures detected
  FAIL src/backend/api/users.test.ts
    ✕ should process user data
    ✕ should handle null user gracefully

📊 Summary
==========
Total bugs found: 4
  - CRITICAL: 2
  - HIGH: 2
  - MEDIUM: 0
  - LOW: 0

📝 Creating Beads issues...
⚠️  Beads integration: Manual step required
   Run: bd create "[Bug Title]" --type bug --priority [CRITICAL|HIGH|MEDIUM|LOW]

✅ Bug Hunter: Complete
```

### Создание Beads Issues

```bash
# Создаем issue для критического бага
bd create "TypeError: Cannot read property 'email' of undefined in users.ts:78" \
  --type bug \
  --priority CRITICAL \
  --description "TypeScript error: Object is possibly 'undefined' at line 78 in src/backend/api/users.ts"

# Создаем issue для бага с null
bd create "TypeError: 'user' is possibly 'null' in users.ts:42" \
  --type bug \
  --priority CRITICAL \
  --description "TypeScript error: Object is possibly 'null' at line 42 in src/backend/api/users.ts"
```

---

## Шаг 2: Анализ бага (Bug Fixer Agent - Phase 1)

### Исходный код с багом

```typescript
// src/backend/api/users.ts

// ❌ БАГ: Строка 42 - user может быть null
export async function processUser(userId: string) {
  const user = await fetchUser(userId);
  
  // Проблема: fetchUser() может вернуть null, но мы не проверяем
  console.log(user.email); // ❌ CRASH если user === null
  return user.email;
}

// ❌ БАГ: Строка 78 - user может быть undefined
export async function getUserProfile(userId: string) {
  const user = await fetchUser(userId);
  
  // Проблема: fetchUser() возвращает Promise<User | null>, но мы не await
  const profile = user.profile; // ❌ CRASH если user === undefined (не awaited)
  return profile;
}
```

### Phase 1: Root Cause Analysis

**Воспроизведение:**
```bash
# Минимальный воспроизводимый пример
curl -X GET http://localhost:3000/api/users/123
# Response: 500 Internal Server Error
# Error: Cannot read property 'email' of null
```

**Трассировка данных:**
```
1. API call: GET /api/users/123
2. Handler: processUser('123')
3. fetchUser('123') → Promise<User | null>
4. await fetchUser('123') → null (пользователь не найден)
5. user.email → ❌ TypeError: Cannot read property 'email' of null
```

**Root Cause:**
- ❌ **НЕПРАВИЛЬНО:** "Нужно добавить null check" (это симптом)
- ✅ **ПРАВИЛЬНО:** "fetchUser() возвращает null когда пользователь не найден, но код не обрабатывает этот случай. Нужно либо обработать null, либо изменить fetchUser() чтобы выбрасывать ошибку"

---

## Шаг 3: Pattern Analysis (Bug Fixer Agent - Phase 2)

### Анализ паттерна

```bash
# Поиск похожих проблем в кодовой базе
grep -r "fetchUser" src/ --include="*.ts" | wc -l
# Результат: 15 использований

# Проверка обработки null
grep -r "fetchUser" src/ --include="*.ts" -A 5 | grep -E "null|undefined|if.*user"
# Результат: только 3 из 15 проверяют null
```

**Вывод:**
- **Pattern:** `systemic` (проблема в 12+ местах)
- **Affected components:** 
  - `src/backend/api/users.ts`
  - `src/backend/api/profile.ts`
  - `src/backend/services/userService.ts`
- **Similar bugs:** 12 других мест с той же проблемой

---

## Шаг 4: Fix Strategy (Bug Fixer Agent - Phase 3)

### Decision Tree

```
Is bug isolated? → NO (systemic)
fix_attempts < 3? → YES (first attempt)

BUT: Pattern is systemic → Strategy: architectural_review
```

**Решение:**
- ❌ **НЕ** применять quick fix (проблема системная)
- ✅ **СОЗДАТЬ** OpenSpec proposal для архитектурного изменения
- ✅ **УВЕДОМИТЬ** stakeholders

### Создание OpenSpec Proposal

```bash
/openspec-proposal "Fix null handling in fetchUser() across codebase"
```

**Proposal включает:**
- Описание проблемы: fetchUser() возвращает null, но 12+ мест не обрабатывают это
- Root cause: отсутствие единого подхода к обработке "пользователь не найден"
- Предложение: изменить fetchUser() чтобы выбрасывать NotFoundError вместо null
- Миграция: обновить все 15 мест использования

---

## Шаг 5: Альтернативный сценарий (Isolated Bug)

### Если бы баг был изолированным

**Сценарий:** Баг только в одном месте, не повторяется

```typescript
// src/backend/api/users.ts:42
export async function processUser(userId: string) {
  const user = await fetchUser(userId);
  console.log(user.email); // ❌ CRASH если user === null
  return user.email;
}
```

**Phase 2: Pattern Analysis**
- Pattern: `isolated` (только одно место)
- fix_attempts: 0

**Phase 3: Fix Strategy**
- Strategy: `quick_fix` (isolated + attempts < 3)

**Phase 4: Quality Gates**

### Фикс (Quick Fix)

```typescript
// ✅ FIXED: Добавлена проверка null
export async function processUser(userId: string) {
  const user = await fetchUser(userId);
  
  if (!user) {
    throw new NotFoundError(`User ${userId} not found`);
  }
  
  console.log(user.email); // ✅ Теперь безопасно
  return user.email;
}
```

### Проверка Quality Gates

```bash
# 1. Fix Verification
npm test -- users.test.ts
# ✅ Tests pass

# 2. Regression Check
npm test
# ✅ All tests pass

# 3. Code Quality
npm run lint
# ✅ No linting errors

npx tsc --noEmit
# ✅ No type errors
```

### Обновление Beads Issue

```bash
bd update bug-123 \
  --status fixed \
  --description "Fixed: Added null check for user. Root cause: fetchUser() can return null when user not found. Pattern: isolated. Fix strategy: quick_fix. Fix attempts: 1."
```

---

## Шаг 6: Сценарий с 3+ попытками (Escalation)

### История попыток фикса

**Попытка 1:**
```typescript
// ❌ Quick fix: добавил null check
if (!user) return null;
```
**Результат:** Quality gates fail - тесты падают (ожидают ошибку, не null)

**Попытка 2:**
```typescript
// ❌ Quick fix: выбрасываю ошибку
if (!user) throw new Error('User not found');
```
**Результат:** Quality gates fail - неправильный тип ошибки (нужен NotFoundError)

**Попытка 3:**
```typescript
// ❌ Quick fix: правильный тип ошибки
if (!user) throw new NotFoundError('User not found');
```
**Результат:** Quality gates fail - проблема глубже (12+ мест с той же проблемой)

### Автоматическая эскалация

**Rule: "3 Fixes = Architectural Review"**

```bash
# Bug Fixer Agent автоматически:
# 1. Обнаруживает fix_attempts >= 3
# 2. Меняет стратегию на architectural_review
# 3. Создает OpenSpec proposal
# 4. Уведомляет stakeholders
```

**Beads Issue обновляется:**
```json
{
  "id": "bug-123",
  "status": "escalated",
  "fix_attempts": 3,
  "fix_strategy": "architectural_review",
  "openspec_change": "fix-null-handling-architecture",
  "escalation_reason": "3+ fix attempts failed. Pattern is systemic (12+ places affected). Requires architectural change."
}
```

**OpenSpec Proposal создается автоматически:**
- Title: `fix-null-handling-architecture`
- Includes: все 3 попытки фикса и почему они не сработали
- Suggests: изменить fetchUser() на архитектурном уровне

---

## Шаг 7: Метрики и отчет

### Собранные метрики

```json
{
  "bug_id": "bug-123",
  "found_at": "2026-01-14T10:00:00Z",
  "fixed_at": "2026-01-14T10:45:00Z",
  "fix_attempts": 1,
  "time_to_fix": 2700,
  "root_cause_accuracy": true,
  "pattern": "isolated",
  "fix_strategy": "quick_fix",
  "quality_gates": {
    "fix_verification": true,
    "tests": true,
    "regression": true,
    "code_quality": true
  }
}
```

### Отчет эффективности

```
Bug Fixing Metrics Report
=========================
Period: 2026-01-14

Total bugs fixed: 15
  - Isolated: 12 (80%)
  - Systemic: 3 (20%)

Average fix attempts: 1.3 (target: 1-2) ✅
First-attempt success: 85% (target: 85%) ✅
Escalation rate: 15% (target: 15%) ✅

Average time to fix: 45 minutes
  - Isolated bugs: 30 minutes
  - Systemic bugs: 120 minutes (architectural review)

Root cause accuracy: 95%
```

---

## Полный Workflow (Визуализация)

```
┌─────────────────────────────────────────────────────────────┐
│                    BUG HUNTER AGENT                          │
│  ./scripts/bug-hunter.sh                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Beads Issues       │
              │  bug-123 (CRITICAL) │
              └──────────┬──────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUG FIXER AGENT                           │
│  Applies Systematic Debugging Skill                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Phase 1:     │ │ Phase 2:    │ │ Phase 3:     │
│ Root Cause  │ │ Pattern     │ │ Fix Strategy │
│ Analysis    │ │ Analysis    │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Decision:          │
              │  isolated + < 3     │
              │  → quick_fix         │
              └──────────┬──────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Phase 4: Quality Gates                    │
│  - Fix Verification                                           │
│  - Tests                                                       │
│  - Regression Check                                            │
│  - Code Quality                                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  ✅ All Gates Pass  │
              │  Bug Fixed          │
              └──────────┬──────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Beads Issue        │
              │  bug-123 (FIXED)    │
              │  Metrics Updated    │
              └─────────────────────┘
```

---

## Ключевые выводы

1. **Systematic подход работает:** Вместо "угадывания" фиксов, мы систематически анализируем root cause
2. **Pattern Analysis критичен:** Различаем isolated vs systemic баги
3. **Escalation rule предотвращает технический долг:** 3+ попытки = архитектурный пересмотр
4. **Quality Gates гарантируют качество:** Не пропускаем фиксы, которые ломают другие части системы
5. **Метрики показывают эффективность:** Отслеживаем улучшения (85% first-attempt success)

---

## Ссылки

- Systematic Debugging Skill: `.claude/skills/systematic-debugging.md`
- Bug Hunter Agent: `.claude/agents/bug-hunter.md`
- Bug Fixer Agent: `.claude/agents/bug-fixer.md`
- Workflow Documentation: `docs/operations/bug-fixing-workflow.md`
- OpenSpec Proposal: `openspec/changes/add-systematic-bug-fixing/`

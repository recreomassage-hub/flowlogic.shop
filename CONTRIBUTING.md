# Contributing to Flow Logic Platform

Спасибо за интерес к проекту! Этот документ описывает процесс разработки и внесения изменений.

---

## 🎯 DEVELOPMENT WORKFLOW

Мы используем **OpenSpec + Beads** для обеспечения качества и предсказуемости разработки.

### Для новых фич

**Трехэтапный процесс OpenSpec:**

1. **PROPOSAL** - Создать предложение об изменении
   ```
   /openspec-proposal
   
   Change: {название изменения}
   
   Description: {описание изменения}
   ```
   Результат: `openspec/changes/{change-id}/proposal.md`, `tasks.md`, `specs/**/spec.md`

2. **APPLY** - Реализовать изменения (после approval)
   ```
   /openspec-apply
   
   @proposal.md @tasks.md @specs/**/spec.md
   ```
   Реализация по tasks.md

3. **TO-BEADS** - Конвертировать tasks.md в Beads issues (опционально)
   ```
   /openspec-to-beads
   
   {change-id}
   ```
   Результат: Задачи в `.beads/issues.jsonl` (структурированные для Issue Tracking)

4. **ARCHIVE** - Архивировать завершенное изменение
   ```
   /openspec-archive
   
   {change-id}
   ```
   Результат: `openspec/changes/archive/{change-id}/`

**Документация:** [OpenSpec AGENTS.md](openspec/AGENTS.md)

### Для реализации (Execution Phase)

**Issue-Based Tracking (Beads):**

После создания задач через `/openspec-to-beads`, используйте Beads CLI для управления выполнением:

```bash
# Убедитесь, что Beads установлен
npm install -g @beads/bd@latest

# Начало сессии - найти работу
bd ready              # Показать готовые задачи
bd ready --json       # JSON формат для агентов

# Во время работы
bd start {issue-id}   # Начать работу над задачей
bd complete {issue-id} # Завершить задачу

# Обнаружение проблем
bd discover "Description" --from {issue-id}

# Обновить статус
./scripts/generate-status.sh       # Генерирует STATUS.md
```

**Правила работы с issues:**
- Одна задача на сессию (избегать перегрузки контекста)
- Всегда логировать обнаруженные проблемы (не терять задачи)
- Обновлять статус перед завершением сессии
- Проверять блокировки перед началом: `bd show {issue-id}`

**STATUS.md** - ваш "якорь" между сессиями:
- Автоматически генерируется из `.beads/issues.jsonl`
- Показывает: активные задачи, завершенные сегодня, готовые к работе
- Обновляется командой: `./scripts/generate-status.sh`

### Для изменений в существующих фичах

**Правило "Touch it, Document it":**

1. Проверить: есть ли spec для этой фичи?
   - Да → обновить spec с новыми требованиями
   - Нет → создать быструю ретроспективную spec

2. Создать/обновить tasks.md для изменений

3. Реализовать через `/implement`

**Пример:**
```markdown
# Изменение: Добавить OAuth login

1. Создать proposal: /openspec-proposal
   Change: add-oauth-login
   Description: Add OAuth authentication support
2. После approval реализовать через /openspec-apply
3. Опционально: /openspec-to-beads add-oauth-login для конвертации в Beads issues
```

### Для рефакторингов

**Рефакторинги:**
- Любые рефакторинги (с функциональностью или без) → использовать OpenSpec workflow
- Создать proposal через `/openspec-proposal`
- Указать тип: "refactor" в proposal.md

### Для багфиксов

**Мелкие багфиксы (1-2 файла):**
- Упрощенный процесс (без полного Spec-Driven)
- Документировать в `docs/bugfixes/`

**Критичные баги:**
- Могут потребовать Spec-Driven для анализа

---

## 📋 CODE STANDARDS

### Технические стандарты

Все стандарты определены в `openspec/project.md`:

- **Stack & Versions:** React 18+, Node.js 20+, TypeScript 5.3+
- **Naming Conventions:** PascalCase для компонентов, camelCase для функций
- **Architecture:** Business logic в services/, NO logic в components
- **Library Rules:** Только разрешенные библиотеки (см. project.md)

### Обязательные требования

- ✅ Все входные данные валидируются через Zod
- ✅ Все функции типизированы (TypeScript)
- ✅ Обработка ошибок на всех уровнях
- ✅ Тесты для критичной бизнес-логики
- ✅ Следование naming conventions из constitution

---

## 🔧 SETUP

### Prerequisites

- Node.js 20+
- npm или yarn
- AWS Account (для backend)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/flowlogic-platform.git
cd flowlogic-platform

# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Backend (from src/backend/)
npm run dev          # Start local server on :3001

# Frontend (from src/frontend/)
npm run dev          # Start dev server on :3000
```

---

## 🧪 TESTING

### Running Tests

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Requirements

- Покрытие бизнес-логики: 70%+
- Покрытие UI: 50%+
- Все новые фичи должны иметь тесты

---

## 📝 COMMIT CONVENTIONS

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: Новая фича
- `fix`: Багфикс
- `docs`: Документация
- `refactor`: Рефакторинг
- `test`: Тесты
- `chore`: Обслуживание

**Examples:**
```
feat(assessments): add export to PDF functionality
fix(auth): resolve token refresh issue
docs(spec-driven): update workflow guide
```

---

## 🔍 CODE REVIEW

### Pull Request Process

1. **Создать PR:**
   - Описать изменения
   - Указать связанные issues
   - Добавить скриншоты (если UI изменения)

2. **Проверка:**
   - Код следует constitution?
   - Тесты написаны и проходят?
   - Документация обновлена?
   - Spec-Driven процесс соблюден?

3. **Review:**
   - Минимум 1 approval требуется
   - Все комментарии должны быть адресованы

4. **Merge:**
   - После approval и прохождения CI/CD
   - Squash merge предпочтителен

---

## 📚 DOCUMENTATION

### Где что находится

- **OpenSpec Workflow:** `openspec/AGENTS.md`
- **Project Context:** `openspec/project.md`
- **Active Changes:** `openspec/changes/` (proposals)
- **Specifications:** `openspec/specs/` (current truth)
- **Issue Tracking:** `STATUS.md` (human-readable), `.beads/issues.jsonl` (structured)
- **API Docs:** `docs/api_documentation.md`
- **Developer Guide:** `docs/developer_guide.md`
- **Cheatsheet:** `CHEATSHEET.md` (quick reference)

### Обновление документации

- При изменении фичи → создать/обновить proposal в `openspec/changes/{change-id}/`
- При изменении API → обновить `docs/api_documentation.md`
- При завершении изменения → заархивировать через `/openspec-archive`

---

## ❓ QUESTIONS?

- **Workflow вопросы:** См. `openspec/AGENTS.md`
- **Технические вопросы:** См. `openspec/project.md`
- **Issue Tracking вопросы:** См. `CHEATSHEET.md`
- **Quick Reference:** См. `CHEATSHEET.md`

---

**Спасибо за вклад в Flow Logic Platform! 🚀**


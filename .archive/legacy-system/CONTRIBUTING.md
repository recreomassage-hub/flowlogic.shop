# Contributing to Flow Logic Platform

Спасибо за интерес к проекту! Этот документ описывает процесс разработки и внесения изменений.

---

## 🎯 DEVELOPMENT WORKFLOW

Мы используем **Spec-Driven Development** для обеспечения качества и предсказуемости разработки.

### Для новых фич

**Полный цикл Spec-Driven:**

1. **SPECIFY** - Создать спецификацию
   ```
   /specify
   
   Feature: {название фичи}
   
   REQUIREMENTS:
   {детальные требования}
   
   SUCCESS CRITERIA:
   {критерии успеха}
   ```
   Результат: `.specify/features/{name}/spec.md`

2. **CLARIFY** - Уточнить неясности (если нужно)
   ```
   /clarify
   
   @spec.md
   
   Review and clarify:
   1. {вопрос 1}
   ```
   Результат: `.specify/features/{name}/clarifications.md`

3. **PLAN** - Создать технический план
   ```
   /plan
   
   @constitution.md @spec.md @clarifications.md
   
   Create technical plan
   ```
   Результат: `.specify/features/{name}/plan.md`

4. **TASKS** - Разбить на задачи
   ```
   /tasks
   
   @constitution.md @spec.md @plan.md
   
   Break down into tasks
   ```
   Результат: `.specify/features/{name}/tasks.md`

5. **CREATE-ISSUES** - Создать структурированные задачи (НОВОЕ)
   ```
   /create-issues
   
   @spec.md @plan.md @tasks.md
   
   Convert tasks into structured issues
   ```
   Результат: `.beads/issues.jsonl` (структурированные задачи)

6. **IMPLEMENT** - Реализовать задачу
   ```
   /implement
   
   @constitution.md @spec.md @plan.md @tasks.md
   
   Task: {номер}
   ```
   Реализация task-by-task

**Документация:** [Spec-Driven Workflow Guide](docs/planning/spec_driven_workflow_guide.md)

### Для реализации (Execution Phase)

**Issue-Based Tracking (НОВОЕ):**

После создания задач через `/tasks`, используйте issue tracker для управления выполнением:

```bash
# Начало сессии - найти работу
./scripts/bd.sh ready              # Показать готовые задачи
./scripts/bd.sh ready --json       # JSON формат для агентов

# Во время работы
./scripts/bd.sh start {issue-id}   # Начать работу над задачей
./scripts/bd.sh complete {issue-id} # Завершить задачу

# Обнаружение проблем
./scripts/bd.sh discover "Description" --from {issue-id}

# Обновить статус
./scripts/generate-status.sh       # Генерирует STATUS.md
```

**Правила работы с issues:**
- Одна задача на сессию (избегать перегрузки контекста)
- Всегда логировать обнаруженные проблемы (не терять задачи)
- Обновлять статус перед завершением сессии
- Проверять блокировки перед началом: `./scripts/bd.sh show {issue-id}`

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

1. Обновить .specify/features/user-authentication/spec.md
2. Создать tasks.md для OAuth интеграции
3. Реализовать через /implement
```

### Для рефакторингов

**Большие рефакторинги (>10 файлов) без изменения функциональности:**
- Использовать legacy PLAN/BUILD через `./llmos plan {task_name}`
- См. `ROLES/02_architect.md` для деталей

**Рефакторинги с добавлением функциональности:**
- Использовать Spec-Driven workflow

### Для багфиксов

**Мелкие багфиксы (1-2 файла):**
- Упрощенный процесс (без полного Spec-Driven)
- Документировать в `docs/bugfixes/`

**Критичные баги:**
- Могут потребовать Spec-Driven для анализа

---

## 📋 CODE STANDARDS

### Технические стандарты

Все стандарты определены в `.specify/constitution.md`:

- **Stack & Versions:** React 18+, Node.js 20+, TypeScript 5.3+
- **Naming Conventions:** PascalCase для компонентов, camelCase для функций
- **Architecture:** Business logic в services/, NO logic в components
- **Library Rules:** Только разрешенные библиотеки (см. constitution)

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

- **Spec-Driven Workflow:** `docs/planning/spec_driven_workflow_guide.md`
- **Migration Guide:** `docs/planning/migration_to_spec_driven.md`
- **Constitution:** `.specify/constitution.md`
- **Feature Specs:** `.specify/features/{name}/spec.md`
- **API Docs:** `docs/api_documentation.md`
- **Developer Guide:** `docs/developer_guide.md`

### Обновление документации

- При изменении фичи → обновить spec.md
- При изменении API → обновить api_documentation.md
- При изменении процесса → обновить workflow guide

---

## ❓ QUESTIONS?

- **Workflow вопросы:** См. `docs/planning/spec_driven_workflow_guide.md`
- **Технические вопросы:** См. `.specify/constitution.md`
- **Process вопросы:** См. `docs/planning/migration_to_spec_driven.md`
- **GitHub Issues:** [Create an issue](https://github.com/your-org/flowlogic-platform/issues)

---

**Спасибо за вклад в Flow Logic Platform! 🚀**


# План внедрения Spec-Driven Development в LLM-OS систему

## 📋 Обзор

Интеграция Spec-Driven Development (Spec Kit) в существующую LLM-OS систему для повышения качества и предсказуемости AI-разработки.

**Цель:** Решить 4 фундаментальные проблемы AI-разработки:
1. Ограничения объема и длительности задач
2. Пробелы в контексте функции
3. Пробелы в знаниях о проекте
4. Неконтролируемая автономия

**Подход:** Гибридная интеграция - Spec Kit как дополнение к существующей системе ролей, не замена.

---

## 🎯 Фаза 1: Подготовка (День 1-2)

### 1.1. Создание Constitution на основе существующего кода

**Задача:** Извлечь правила и стандарты из текущего кодабазы

**Команда для Cursor:**
```
@PROJECT_CONFIG.md @src/ @docs/architecture/tech_stack.md

Analyze our codebase and create .specify/constitution.md that captures:

STACK & VERSIONS:
- Frontend: React 18.2, TypeScript 5.3, Vite 5.0, Tailwind CSS 3.3
- Backend: Node.js 22, TypeScript 5.3, Express 4.18, AWS SDK v3
- Infrastructure: AWS Serverless (Lambda), DynamoDB, S3, Cognito, API Gateway
- State Management: Zustand 4.5 (frontend)
- Testing: Jest 29, Playwright 1.40
- Deployment: Serverless Framework 3, Vercel (frontend)

NAMING CONVENTIONS:
- Components: PascalCase files (AssessmentsPage.tsx)
- API routes: kebab-case (/api/v1/auth/register)
- Database tables: kebab-case (flowlogic-production-users)
- Functions: camelCase (getAssessments)
- Types/Interfaces: PascalCase (Assessment, CreateAssessmentRequest)
- Constants: UPPER_SNAKE_CASE (COGNITO_CLIENT_ID)

ARCHITECTURE PRINCIPLES:
- Backend: Serverless Lambda with Express wrapper
- Business logic in /src/backend/services/
- API controllers in /src/backend/api/controllers/
- Routes in /src/backend/api/routes/
- Frontend: Component-based, pages in /src/frontend/src/pages/
- API client in /src/frontend/src/api/
- State management: Zustand stores in /src/frontend/src/store/
- NO prop drilling beyond 2 levels - use Zustand
- Server Components NOT applicable (Vite, not Next.js)

FILE ORGANIZATION:
/src
  /backend
    /api
      /controllers    # Request handlers
      /routes         # Route definitions
      /middleware     # Auth, validation, error handling
    /services         # Business logic
    /config           # Configuration (Cognito, DB)
    /db               # Database models and migrations
    /utils            # Pure utilities
  /frontend
    /src
      /api            # API client functions
      /components
        /common       # Shared components (Layout, ProtectedRoute)
        /features     # Feature-specific components
      /pages          # Page components
      /store          # Zustand stores
      /hooks          # Custom React hooks
      /utils          # Pure utilities
      /styles         # Global styles

LIBRARY RULES:
✅ ALLOWED:
- zod for validation (backend & frontend)
- react-hook-form for forms
- axios for HTTP (frontend)
- date-fns for dates (if needed)
- uuid for ID generation

❌ FORBIDDEN:
- Redux (use Zustand)
- Moment.js (use date-fns or native Date)
- jQuery (obviously)
- CSS-in-JS libraries (use Tailwind CSS)
- Any state management except Zustand

SECURITY & COMPLIANCE:
- All user inputs MUST be validated with Zod
- Authentication via AWS Cognito
- JWT tokens in httpOnly cookies (preferred) or Authorization header
- PII data encrypted at rest (DynamoDB encryption)
- API Gateway CORS configured per environment
- Rate limiting via API Gateway
- Secrets in AWS SSM Parameter Store, NOT in code

ERROR HANDLING:
- Backend: Express error middleware
- Frontend: Axios interceptors for 401/403 redirects
- All errors logged to CloudWatch
- User-friendly error messages (no stack traces to frontend)

TESTING:
- Unit tests: Jest (backend & frontend)
- Integration tests: Jest with test DynamoDB tables
- E2E tests: Playwright
- Coverage target: 70% for business logic, 50% for UI

DEPLOYMENT:
- Backend: Serverless Framework, stage-based (dev/staging/production)
- Frontend: Vercel (preview for develop, production for main)
- Environment variables: Vercel Dashboard (frontend), SSM Parameter Store (backend)
- CI/CD: GitHub Actions workflows
- Post-deploy: Automated smoke tests via scripts/post_deploy.sh

LLM-OS INTEGRATION:
- PROJECT_CONFIG.md = ROM (Read-Only Memory)
- WORKFLOW_STATE.md = RAM (current state)
- ROLES/*.md = Instruction Set
- docs/ = Persistent Storage
- Spec Kit files in .specify/ = Additional context layer
```

**Результат:** `.specify/constitution.md` с полным описанием правил проекта

### 1.2. Создание структуры Spec Kit

**Создать директории:**
```bash
mkdir -p .specify/features
mkdir -p .cursor/commands
```

**Структура:**
```
.specify/
├── constitution.md           # Будет создан в 1.1
└── features/                 # Спецификации фич
    └── {feature-name}/
        ├── spec.md
        ├── clarifications.md
        ├── plan.md
        └── tasks.md

.cursor/
└── commands/                 # Cursor команды для Spec Kit
    ├── specify.md
    ├── clarify.md
    ├── plan.md
    └── implement.md
```

### 1.3. Обновление .cursorrules

**Добавить секцию Spec-Driven Development:**

```markdown
# =============== SPEC-DRIVEN DEVELOPMENT ===============
specDriven:
  enabled: true
  constitutionPath: ".specify/constitution.md"
  featuresPath: ".specify/features/"
  
  workflow:
    - specify: "Создать спецификацию фичи"
    - clarify: "Уточнить неясные моменты"
    - plan: "Создать технический план"
    - tasks: "Разбить на задачи"
    - implement: "Реализовать по плану"
  
  rules:
    - "ПЕРЕД любым кодом читай @constitution.md"
    - "Для новых фич создавай spec.md в .specify/features/{name}/"
    - "Реализуй ТОЛЬКО то, что в spec.md и plan.md"
    - "НЕ добавляй фичи не из спецификации"
    - "Спрашивай перед архитектурными решениями"
```

---

## 🎯 Фаза 2: Интеграция с существующей системой ролей (День 3-4)

### 2.1. Адаптация ролей под Spec-Driven подход

**Обновить ROLES/*.md файлы:**

#### ROLES/02_architect.md (добавить PLAN режим)

```markdown
## Режим PLAN (Spec-Driven)

Когда использовать:
- Новая фича требует архитектурного планирования
- Сложная интеграция с существующей системой
- Множественные компоненты затронуты

Процесс:
1. Читай @.specify/constitution.md
2. Читай @.specify/features/{name}/spec.md
3. Создавай @.specify/features/{name}/plan.md
4. План должен включать:
   - Database schema changes
   - API endpoints design
   - Component structure
   - State management approach
   - Integration points
5. Сохраняй план в .specify/features/{name}/plan.md
```

#### ROLES/04_backend_dev.md (добавить BUILD режим с Spec)

```markdown
## Режим BUILD (Spec-Driven)

Когда использовать:
- Реализация фичи по готовому плану
- Множественные файлы нужно изменить

Процесс:
1. Читай @.specify/constitution.md
2. Читай @.specify/features/{name}/spec.md
3. Читай @.specify/features/{name}/plan.md
4. Читай @.specify/features/{name}/tasks.md
5. Реализуй ТОЛЬКО текущую задачу из tasks.md
6. Следуй плану ТОЧНО, не импровизируй
7. После каждой задачи - коммит и проверка
```

#### ROLES/05_frontend_dev.md (аналогично)

### 2.2. Создание Cursor команд

**`.cursor/commands/specify.md`:**
```markdown
# Команда: /specify

Создает спецификацию для новой фичи.

Использование:
/specify

Feature: {название фичи}

REQUIREMENTS:
{детальные требования}

SUCCESS CRITERIA:
{критерии успеха}

После выполнения создает .specify/features/{name}/spec.md
```

**`.cursor/commands/plan.md`:**
```markdown
# Команда: /plan

Создает технический план на основе спецификации.

Использование:
/plan

@constitution.md @spec.md

Создает .specify/features/{name}/plan.md
```

**`.cursor/commands/implement.md`:**
```markdown
# Команда: /implement

Реализует задачу по плану.

Использование:
/implement

@constitution.md @spec.md @plan.md @tasks.md

Task: {номер задачи}

Реализует только указанную задачу.
```

---

## 🎯 Фаза 3: Пилотная фича (День 5-7)

### 3.1. Выбор простой фичи для тестирования

**Рекомендация:** Улучшение существующей фичи или небольшая новая фича

**Пример:** "Улучшение страницы AssessmentNewPage - добавление записи видео"

### 3.2. Полный цикл Spec-Driven

#### Этап 1: Specify (2-3 часа)

**В Cursor Chat:**
```
/specify

Feature: Video Recording for Assessments

REQUIREMENTS:
- User can record video directly in browser (WebRTC)
- Video max duration: 60 seconds
- Video format: WebM (fallback to MP4)
- Upload to S3 using presigned URL from backend
- Show recording progress
- Allow retry if upload fails
- Store video URL in assessment record

SUCCESS CRITERIA:
- Recording starts within 1 second
- Upload completes within 5 seconds for 60s video
- Error handling for camera permissions
- Mobile responsive
- Works in Chrome, Firefox, Safari
```

**Результат:** `.specify/features/video-recording/spec.md`

#### Этап 2: Clarify (1 час)

**Проверка и уточнение:**
- Разрешения камеры
- Формат видео
- Обработка ошибок
- UI/UX детали

**Результат:** `.specify/features/video-recording/clarifications.md`

#### Этап 3: Plan (2-3 часа)

**В Cursor Composer:**
```
@constitution.md @spec.md @clarifications.md

Create technical plan for Video Recording feature.

Include:
- Component structure
- WebRTC API usage
- State management (Zustand)
- Error handling
- S3 upload integration
- Mobile compatibility
```

**Результат:** `.specify/features/video-recording/plan.md`

**Проверка плана:**
- Соответствует ли constitution?
- Используются ли правильные библиотеки?
- Правильная ли структура компонентов?

#### Этап 4: Tasks (1 час)

**В Cursor Chat:**
```
@constitution.md @spec.md @plan.md

Break down into implementation tasks.

Each task should:
- Modify 1-3 files max
- Have clear completion criteria
- Be testable independently
```

**Результат:** `.specify/features/video-recording/tasks.md`

#### Этап 5: Implement (остальное время)

**Task-by-task через Cursor Composer:**

```
@constitution.md @spec.md @plan.md @tasks.md

Implement Task 1: Setup video recording component structure

FILES TO MODIFY:
- src/frontend/src/components/features/VideoRecorder.tsx (create)
- src/frontend/src/pages/AssessmentNewPage.tsx (update)

DO NOT TOUCH: Other files
```

**После каждой задачи:**
1. Проверка кода
2. Тестирование
3. Коммит
4. Переход к следующей

---

## 🎯 Фаза 4: Масштабирование (День 8+)

### 4.1. Обновление workflow для всех ролей

**Добавить в каждый ROLES/*.md:**

```markdown
## Spec-Driven Workflow

Перед началом работы:
1. Проверь, есть ли .specify/features/{current-feature}/
2. Если есть - читай spec.md и plan.md
3. Следуй плану ТОЧНО
4. Если план отсутствует - создай его через /plan

После завершения:
1. Обнови tasks.md (отметь выполненные)
2. Если все задачи выполнены - обнови spec.md (статус: completed)
```

### 4.2. Интеграция с существующими сценариями

**Обновить scenarios/FEATURE_DEVELOPMENT.yml:**

```yaml
phases:
  - name: COLLECT
    role: ANALYST
    actions:
      - read_context
      - check_existing_specs  # НОВОЕ
      
  - name: SPECIFY
    role: ANALYST
    actions:
      - create_spec  # НОВОЕ
      - review_spec
      
  - name: PLAN
    role: ARCHITECT
    actions:
      - read_spec
      - create_plan  # НОВОЕ
      - review_plan
      
  - name: BUILD
    role: BACKEND_DEV
    actions:
      - read_spec
      - read_plan
      - implement_tasks  # НОВОЕ
```

### 4.3. Создание шаблонов

**`.templates/spec_template.md`:**
```markdown
# {Feature Name}

## Overview
{Краткое описание}

## Requirements
{Детальные требования}

## Success Criteria
{Критерии успеха}

## Edge Cases
{Граничные случаи}

## Integration Points
{Точки интеграции с существующей системой}
```

---

## 📊 Метрики успеха

### Через 2 недели:

✅ **Меньше рефакторинга**
- До: 40-60% времени на исправление
- После: 10-20% на полировку

✅ **Меньше "сюрпризов"**
- До: AI добавляет неожиданные зависимости
- После: Код предсказуем, следует стандартам

✅ **Лучшее качество с первого раза**
- До: Многократные итерации
- После: Первая версия близка к финальной

✅ **Проще code review**
- До: Ревьювим "что получилось"
- После: Проверяем "соответствие плану"

### Измеримые показатели:

- **Время на рефакторинг:** -50%
- **Количество неожиданных зависимостей:** -80%
- **Итераций до финальной версии:** -60%
- **Время на code review:** -40%

---

## 🚨 Риски и митигация

### Риск 1: Конфликт с существующей системой ролей

**Митигация:**
- Spec Kit как дополнение, не замена
- Постепенное внедрение
- Обратная совместимость

### Риск 2: Constitution устареет

**Митигация:**
- Регулярный ревью (раз в месяц)
- Автоматическая проверка соответствия кода
- Версионирование constitution

### Риск 3: Слишком много overhead на маленькие задачи

**Митигация:**
- Spec Kit только для фич > 3 файлов
- Мелкие задачи через обычный workflow
- Четкие критерии когда использовать

---

## 📅 Временная шкала

| Фаза | Дни | Задачи | Результат |
|------|-----|--------|-----------|
| Фаза 1 | 1-2 | Constitution, структура | `.specify/` готова |
| Фаза 2 | 3-4 | Интеграция с ролями | Обновленные ROLES/*.md |
| Фаза 3 | 5-7 | Пилотная фича | Работающий пример |
| Фаза 4 | 8+ | Масштабирование | Полная интеграция |

**Итого:** 2 недели до полного внедрения

---

## ✅ Чеклист внедрения

### Фаза 1: Подготовка
- [ ] Создан `.specify/constitution.md`
- [ ] Создана структура `.specify/features/`
- [ ] Обновлен `.cursorrules`
- [ ] Созданы `.cursor/commands/*.md`

### Фаза 2: Интеграция
- [ ] Обновлены `ROLES/02_architect.md` (PLAN режим)
- [ ] Обновлены `ROLES/04_backend_dev.md` (BUILD режим)
- [ ] Обновлены `ROLES/05_frontend_dev.md` (BUILD режим)
- [ ] Обновлен `scenarios/FEATURE_DEVELOPMENT.yml`

### Фаза 3: Пилот
- [ ] Выбрана пилотная фича
- [ ] Создана spec.md
- [ ] Создан plan.md
- [ ] Создан tasks.md
- [ ] Реализована фича
- [ ] Проведен ретроспектив

### Фаза 4: Масштабирование
- [ ] Обновлены все ROLES/*.md
- [ ] Созданы шаблоны
- [ ] Документирован процесс
- [ ] Обучена команда

---

## 📚 Дополнительные ресурсы

- [Spec Kit GitHub](https://github.com/github/spec-kit)
- [Статья о Spec-Driven Development](ссылка на статью)
- Внутренняя документация: `docs/planning/spec_driven_integration_plan.md`

---

## 🎯 Следующие шаги

1. **Сейчас:** Создать constitution на основе кода
2. **Завтра:** Настроить структуру и команды
3. **На этой неделе:** Выполнить пилотную фичу
4. **На следующей неделе:** Масштабировать на все роли

---

**Версия:** 1.0  
**Дата создания:** 2025-01-03  
**Автор:** LLM-OS System  
**Статус:** Draft → Ready for Implementation


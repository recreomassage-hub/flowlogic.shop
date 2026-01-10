# План миграции на OpenSpec + Beads

**Дата:** 2026-01-09  
**Источник:** [Upgrade: OpenSpec и Beads в Cursor - Habr](https://habr.com/ru/articles/983316/)  
**Цель:** Полная миграция на OpenSpec + Beads с архивацией существующей системы

---

## 📊 Анализ статьи

### Ключевые концепции из статьи

1. **OpenSpec** - Spec-Driven Development
   - `proposal.md` - бизнес-контекст (зачем)
   - `tasks.md` - верхнеуровневый план
   - `spec.md` - техническая спецификация (как)
   - Отделяет намерение от реализации

2. **Beads** - Граф задач
   - Хранит задачи в виде графа зависимостей
   - Состояние: `ready` (можно брать) vs `blocked` (ждут зависимости)
   - Изоляция: одна задача на сессию агента

3. **Workflow:**
   - `/openspec-proposal` → создание change
   - Редактирование proposal/tasks/spec
   - `/openspec-to-beads` → трансформация в задачи Beads
   - `bd ready` → `bd start` → работа → `bd close`
   - `/openspec-apply` → проверка соответствия спекам
   - `/openspec-archive` → архивация change

---

## 🔄 Сравнение систем

### Текущая система

| Компонент | Текущее | OpenSpec + Beads |
|-----------|---------|------------------|
| **Планирование** | `.specify/features/{name}/spec.md` | `openspec/changes/{id}/proposal.md` |
| **Задачи** | `.specify/features/{name}/tasks.md` | `openspec/changes/{id}/tasks.md` |
| **Спецификация** | `.specify/features/{name}/spec.md` | `openspec/changes/{id}/specs/.../spec.md` |
| **Трекинг задач** | `.beads/issues.jsonl` | `.beads/beads.db` (SQLite) |
| **Команды** | `/specify`, `/plan`, `/tasks` | `/openspec-proposal`, `/openspec-to-beads` |
| **Агент правила** | `AGENTS.md` | `openspec/AGENTS.md` |

### Преимущества миграции

1. ✅ **Стандартизация** - OpenSpec - стандартный фреймворк
2. ✅ **Интеграция** - Нативная поддержка в Cursor
3. ✅ **Архивация** - Встроенная система архивации changes
4. ✅ **История** - Сохранение истории изменений системы
5. ✅ **Сообщество** - Поддержка и примеры использования

---

## 📋 План миграции

### Фаза 1: Подготовка и архивация (1-2 часа)

#### 1.1. Создание структуры архива

```bash
# Создать директорию архива
mkdir -p .archive/legacy-system
mkdir -p .archive/legacy-system/{specify,workflow,docs,scripts,prompts,roles}
```

#### 1.2. Архивирование существующей системы

**Структура архива:**

```
.archive/legacy-system/
├── README.md                    # Описание архива
├── MIGRATION_LOG.md             # Лог миграции
├── specify/                     # Старая Spec-Driven система
│   └── features/               # Все существующие фичи
├── workflow/                    # LLM-OS workflow система
│   ├── PROJECT_CONFIG.md
│   ├── WORKFLOW_STATE.md
│   ├── SCENARIO_STATE.yml
│   └── scenarios/
├── docs/                        # Вся документация
│   ├── requirements/
│   ├── architecture/
│   ├── planning/
│   └── ...
├── scripts/                     # Старые скрипты
│   ├── bd.sh                    # Локальный bd.sh (legacy)
│   └── generate-status.sh
├── prompts/                     # Промпты LLM-OS
│   └── PROMPTS/
├── roles/                       # Роли LLM-OS
│   └── ROLES/
└── agents/                      # Правила агентов
    └── AGENTS.md
```

#### 1.3. Скрипт архивации

```bash
#!/bin/bash
# archive-legacy-system.sh

ARCHIVE_DIR=".archive/legacy-system"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📦 Архивирование существующей системы..."

# Создать структуру
mkdir -p "$ARCHIVE_DIR"/{specify,workflow,docs,scripts,prompts,roles,agents}

# Архивировать Spec-Driven
if [ -d ".specify" ]; then
    cp -r .specify "$ARCHIVE_DIR/specify/"
    echo "✅ .specify → archive"
fi

# Архивировать Workflow
cp PROJECT_CONFIG.md "$ARCHIVE_DIR/workflow/" 2>/dev/null
cp WORKFLOW_STATE.md "$ARCHIVE_DIR/workflow/" 2>/dev/null
cp SCENARIO_STATE.yml "$ARCHIVE_DIR/workflow/" 2>/dev/null
[ -d "scenarios" ] && cp -r scenarios "$ARCHIVE_DIR/workflow/"
echo "✅ Workflow → archive"

# Архивировать документацию
[ -d "docs" ] && cp -r docs "$ARCHIVE_DIR/docs/"
echo "✅ docs → archive"

# Архивировать скрипты
[ -d "scripts" ] && cp -r scripts "$ARCHIVE_DIR/scripts/"
echo "✅ scripts → archive"

# Архивировать промпты
[ -d "PROMPTS" ] && cp -r PROMPTS "$ARCHIVE_DIR/prompts/"
echo "✅ PROMPTS → archive"

# Архивировать роли
[ -d "ROLES" ] && cp -r ROLES "$ARCHIVE_DIR/roles/"
echo "✅ ROLES → archive"

# Архивировать правила агентов
cp AGENTS.md "$ARCHIVE_DIR/agents/" 2>/dev/null
echo "✅ AGENTS.md → archive"

# Создать README архива
cat > "$ARCHIVE_DIR/README.md" << EOF
# Архив Legacy системы

**Дата архивации:** $(date)
**Версия системы:** LLM-OS v1.0
**Причина:** Миграция на OpenSpec + Beads

## Содержимое

- \`specify/\` - Старая Spec-Driven система (.specify/features/)
- \`workflow/\` - LLM-OS workflow система (PROJECT_CONFIG.md, WORKFLOW_STATE.md)
- \`docs/\` - Вся документация проекта
- \`scripts/\` - Старые скрипты (bd.sh, generate-status.sh)
- \`prompts/\` - Промпты для LLM-OS (27 промптов)
- \`roles/\` - Роли LLM-OS (9 ролей)
- \`agents/\` - Правила для агентов (AGENTS.md)

## Восстановление

Если нужно восстановить старую систему:

\`\`\`bash
# Восстановить Spec-Driven
cp -r .archive/legacy-system/specify/.specify .

# Восстановить Workflow
cp .archive/legacy-system/workflow/PROJECT_CONFIG.md .
cp .archive/legacy-system/workflow/WORKFLOW_STATE.md .
cp .archive/legacy-system/workflow/SCENARIO_STATE.yml .

# И т.д.
\`\`\`

## Миграция

См. \`docs/migration-to-openspec-beads.md\` для деталей миграции.
EOF

echo "✅ Архивация завершена: $ARCHIVE_DIR"
```

---

### Фаза 2: Установка и инициализация (30 минут)

#### 2.1. Установка OpenSpec

```bash
# OpenSpec уже установлен
npm install -g @fission-ai/openspec@latest

# Проверка
openspec --version
```

#### 2.2. Инициализация OpenSpec

```bash
# Инициализация в проекте
openspec init

# OpenSpec создаст:
# - openspec/project.md
# - openspec/AGENTS.md
# - openspec/.gitignore
```

#### 2.3. Настройка AGENTS.md

Обновить `openspec/AGENTS.md` с учетом специфики проекта.

---

### Фаза 3: Миграция данных (2-3 часа)

#### 3.1. Миграция существующих фич

**Для каждой фичи в `.specify/features/`:**

```bash
# Пример: design-system

# 1. Создать change в OpenSpec
/openspec-proposal "Migrate Design System from legacy .specify"

# 2. Вручную или через агента:
# - Скопировать spec.md → openspec/changes/{id}/specs/design-system/spec.md
# - Скопировать tasks.md → openspec/changes/{id}/tasks.md
# - Создать proposal.md с описанием миграции

# 3. Трансформировать в Beads
/openspec-to-beads {change-id}

# 4. Архивировать change (после проверки)
/openspec-archive {change-id}
```

#### 3.2. Скрипт автоматической миграции

```bash
#!/bin/bash
# migrate-specify-to-openspec.sh

echo "🔄 Миграция .specify → OpenSpec..."

for feature_dir in .specify/features/*/; do
    if [ -d "$feature_dir" ]; then
        feature_name=$(basename "$feature_dir")
        echo "📦 Миграция фичи: $feature_name"
        
        # Создать change через OpenSpec API или вручную
        # (требует интерактивного процесса)
        
        echo "  ✅ $feature_name"
    fi
done

echo "✅ Миграция завершена"
```

---

### Фаза 4: Обновление конфигурации (1 час)

#### 4.1. Обновление .cursorrules

Добавить правила для OpenSpec:

```yaml
# В .cursorrules добавить:

specDriven:
  enabled: true
  openspecPath: "openspec/"
  beadsPath: ".beads/"
  
  commands:
    proposal: "/openspec-proposal"
    to-beads: "/openspec-to-beads"
    apply: "/openspec-apply"
    archive: "/openspec-archive"
```

#### 4.2. Обновление .aliases

Добавить алиасы для OpenSpec:

```bash
# OpenSpec commands
alias os-proposal="openspec proposal"
alias os-to-beads="openspec to-beads"
alias os-apply="openspec apply"
alias os-archive="openspec archive"
```

#### 4.3. Обновление AGENTS.md

Заменить содержимое `AGENTS.md` на версию из `openspec/AGENTS.md` или адаптировать под проект.

---

### Фаза 5: Очистка и финализация (30 минут)

#### 5.1. Удаление старых файлов

```bash
# После успешной миграции и проверки

# Удалить старую Spec-Driven систему
rm -rf .specify/

# Удалить старые скрипты (если не нужны)
# rm scripts/bd.sh  # Оставить как fallback
# rm scripts/generate-status.sh

# Удалить LLM-OS систему (если не используется)
# rm -rf PROMPTS/
# rm -rf ROLES/
# rm PROJECT_CONFIG.md
# rm WORKFLOW_STATE.md
# rm SCENARIO_STATE.yml
```

#### 5.2. Обновление .gitignore

```gitignore
# OpenSpec
openspec/changes/*/node_modules/
openspec/changes/*/.cache/

# Beads
.beads/beads.db-shm
.beads/beads.db-wal
.beads/interactions.jsonl

# Архив
.archive/
```

#### 5.3. Обновление документации

- Обновить `README.md`
- Обновить `CHEATSHEET.md`
- Создать `MIGRATION_LOG.md`

---

## 📝 Детальный план выполнения

### Шаг 1: Архивирование (СЕЙЧАС)

```bash
# 1. Создать скрипт архивации
cat > scripts/archive-legacy-system.sh << 'EOF'
# ... (скрипт из Фазы 1.3)
EOF

chmod +x scripts/archive-legacy-system.sh

# 2. Запустить архивацию
./scripts/archive-legacy-system.sh

# 3. Проверить архив
ls -la .archive/legacy-system/

# 4. Закоммитить архив
git add .archive/
git commit -m "archive: Legacy system archived before OpenSpec migration"
```

### Шаг 2: Инициализация OpenSpec

```bash
# 1. Инициализировать OpenSpec
openspec init

# 2. Заполнить openspec/project.md
# (через Cursor: "Please read openspec/project.md and help me fill it out")

# 3. Проверить openspec/AGENTS.md
cat openspec/AGENTS.md
```

### Шаг 3: Миграция первой фичи (тест)

```bash
# 1. Выбрать простую фичу для теста (например, design-system)

# 2. Создать change
/openspec-proposal "Migrate Design System feature"

# 3. В Cursor отредактировать:
# - openspec/changes/{id}/proposal.md
# - openspec/changes/{id}/tasks.md
# - openspec/changes/{id}/specs/design-system/spec.md

# 4. Трансформировать в Beads
/openspec-to-beads {change-id}

# 5. Проверить результат
bd list
bd ready

# 6. Если все ОК - архивировать change
/openspec-archive {change-id}
```

### Шаг 4: Массовая миграция

```bash
# Для каждой оставшейся фичи повторить Шаг 3
# (можно автоматизировать через скрипт)
```

### Шаг 5: Обновление конфигурации

```bash
# 1. Обновить .cursorrules
# 2. Обновить .aliases
# 3. Обновить AGENTS.md
# 4. Обновить документацию
```

### Шаг 6: Очистка

```bash
# 1. Удалить старые файлы (после проверки)
# 2. Обновить .gitignore
# 3. Финальный коммит
```

---

## ⚠️ Важные замечания

### Что сохранить

1. **Beads база данных** - уже работает, не трогать
2. **Исходный код** - `src/` не меняется
3. **Документация** - можно оставить в `docs/` или мигрировать в OpenSpec
4. **Скрипты** - полезные скрипты оставить, устаревшие - в архив

### Что архивировать

1. **.specify/** - старая Spec-Driven система
2. **PROMPTS/** - промпты LLM-OS (27 файлов)
3. **ROLES/** - роли LLM-OS (9 файлов)
4. **PROJECT_CONFIG.md** - если не используется
5. **WORKFLOW_STATE.md** - если не используется
6. **SCENARIO_STATE.yml** - если не используется
7. **scripts/bd.sh** - локальный bd.sh (legacy)

### Что удалить

1. **Только после успешной миграции и проверки**
2. **Только после создания архива**
3. **Только после коммита архива**

---

## 🔄 Обратная совместимость

### Временная поддержка

Можно оставить старую систему параллельно на время миграции:

```bash
# Создать обертку для команд
# .specify → openspec (автоматический редирект)
# /specify → /openspec-proposal
```

### Откат

Если что-то пошло не так:

```bash
# 1. Восстановить из архива
cp -r .archive/legacy-system/specify/.specify .

# 2. Восстановить конфигурацию
cp .archive/legacy-system/workflow/PROJECT_CONFIG.md .
cp .archive/legacy-system/workflow/WORKFLOW_STATE.md .

# 3. Откатить коммиты
git reset --hard HEAD~N
```

---

## 📊 Чеклист миграции

### Подготовка
- [ ] Прочитать статью и понять workflow
- [ ] Создать скрипт архивации
- [ ] Запустить архивацию
- [ ] Проверить архив
- [ ] Закоммитить архив

### Установка
- [ ] Установить OpenSpec (уже установлен)
- [ ] Инициализировать OpenSpec
- [ ] Заполнить openspec/project.md
- [ ] Проверить openspec/AGENTS.md

### Миграция
- [ ] Мигрировать первую фичу (тест)
- [ ] Проверить результат
- [ ] Мигрировать остальные фичи
- [ ] Проверить все changes

### Обновление
- [ ] Обновить .cursorrules
- [ ] Обновить .aliases
- [ ] Обновить AGENTS.md
- [ ] Обновить документацию

### Очистка
- [ ] Удалить старые файлы
- [ ] Обновить .gitignore
- [ ] Финальный коммит
- [ ] Обновить README.md

---

## 🎯 Ожидаемый результат

### Новая структура

```
project/
├── openspec/                    # OpenSpec система
│   ├── project.md              # Описание проекта
│   ├── AGENTS.md               # Правила для агентов
│   └── changes/                # Changes (активные и архивные)
│       └── {change-id}/
│           ├── proposal.md
│           ├── tasks.md
│           └── specs/
│               └── {feature}/
│                   └── spec.md
├── .beads/                      # Beads (уже работает)
│   ├── beads.db
│   └── issues.jsonl
├── .archive/                    # Архив legacy системы
│   └── legacy-system/
│       ├── README.md
│       ├── specify/
│       ├── workflow/
│       └── ...
└── src/                         # Исходный код (без изменений)
```

### Новый workflow

1. **Планирование:**
   ```
   /openspec-proposal "Feature name"
   → Редактирование proposal/tasks/spec
   → Согласование
   ```

2. **Трансформация:**
   ```
   /openspec-to-beads {change-id}
   → Создание задач в Beads
   ```

3. **Исполнение:**
   ```
   bd ready
   → bd start {task-id}
   → Работа
   → bd close {task-id}
   ```

4. **Фиксация:**
   ```
   /openspec-apply {change-id}
   → /openspec-archive {change-id}
   ```

---

## 📚 Ресурсы

- [Статья на Habr](https://habr.com/ru/articles/983316/)
- [OpenSpec GitHub](https://github.com/fission-ai/openspec)
- [Beads GitHub](https://github.com/beads-dev/beads)
- [Beads Best Practices](https://habr.com/ru/articles/983500/)

---

**Статус:** Готов к выполнению  
**Время выполнения:** 4-6 часов  
**Риски:** Низкие (есть архив для отката)




#!/bin/bash
# archive-legacy-system.sh
# Архивирование существующей системы перед миграцией на OpenSpec + Beads

set -e

ARCHIVE_DIR=".archive/legacy-system"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_ROOT"

echo "📦 Архивирование существующей системы..."
echo "=========================================="
echo ""

# Создать структуру архива
echo "📁 Создание структуры архива..."
mkdir -p "$ARCHIVE_DIR"/{specify,workflow,docs,scripts,prompts,roles,agents,config}

# Архивировать Spec-Driven систему
if [ -d ".specify" ]; then
    echo "📦 Архивирование .specify/..."
    cp -r .specify "$ARCHIVE_DIR/specify/"
    echo "  ✅ .specify → $ARCHIVE_DIR/specify/"
fi

# Архивировать Workflow систему
echo "📦 Архивирование Workflow системы..."
[ -f "PROJECT_CONFIG.md" ] && cp PROJECT_CONFIG.md "$ARCHIVE_DIR/workflow/" && echo "  ✅ PROJECT_CONFIG.md"
[ -f "WORKFLOW_STATE.md" ] && cp WORKFLOW_STATE.md "$ARCHIVE_DIR/workflow/" && echo "  ✅ WORKFLOW_STATE.md"
[ -f "SCENARIO_STATE.yml" ] && cp SCENARIO_STATE.yml "$ARCHIVE_DIR/workflow/" && echo "  ✅ SCENARIO_STATE.yml"
[ -d "scenarios" ] && cp -r scenarios "$ARCHIVE_DIR/workflow/" && echo "  ✅ scenarios/"
[ -d "SCENARIOS" ] && cp -r SCENARIOS "$ARCHIVE_DIR/workflow/" && echo "  ✅ SCENARIOS/"

# Архивировать документацию (копируем структуру, но не все файлы)
echo "📦 Архивирование документации..."
if [ -d "docs" ]; then
    # Создать список важных директорий
    mkdir -p "$ARCHIVE_DIR/docs"
    for dir in docs/*/; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            cp -r "$dir" "$ARCHIVE_DIR/docs/" 2>/dev/null && echo "  ✅ docs/$dirname/"
        fi
    done
    # Копировать отдельные файлы
    for file in docs/*.md; do
        if [ -f "$file" ]; then
            cp "$file" "$ARCHIVE_DIR/docs/" 2>/dev/null && echo "  ✅ $(basename "$file")"
        fi
    done
fi

# Архивировать скрипты
echo "📦 Архивирование скриптов..."
if [ -d "scripts" ]; then
    cp -r scripts "$ARCHIVE_DIR/"
    echo "  ✅ scripts/ → $ARCHIVE_DIR/scripts/"
fi

# Архивировать промпты
echo "📦 Архивирование промптов..."
if [ -d "PROMPTS" ]; then
    cp -r PROMPTS "$ARCHIVE_DIR/prompts/"
    echo "  ✅ PROMPTS/ → $ARCHIVE_DIR/prompts/"
fi

# Архивировать роли
echo "📦 Архивирование ролей..."
if [ -d "ROLES" ]; then
    cp -r ROLES "$ARCHIVE_DIR/roles/"
    echo "  ✅ ROLES/ → $ARCHIVE_DIR/roles/"
fi

# Архивировать правила агентов
echo "📦 Архивирование правил агентов..."
[ -f "AGENTS.md" ] && cp AGENTS.md "$ARCHIVE_DIR/agents/" && echo "  ✅ AGENTS.md"
[ -f "AGENTS_SETUP.md" ] && cp AGENTS_SETUP.md "$ARCHIVE_DIR/agents/" && echo "  ✅ AGENTS_SETUP.md"

# Архивировать конфигурацию
echo "📦 Архивирование конфигурации..."
[ -f ".cursorrules" ] && cp .cursorrules "$ARCHIVE_DIR/config/" && echo "  ✅ .cursorrules"
[ -f ".aliases" ] && cp .aliases "$ARCHIVE_DIR/config/" && echo "  ✅ .aliases"
[ -d ".cursor" ] && cp -r .cursor "$ARCHIVE_DIR/config/" && echo "  ✅ .cursor/"

# Архивировать другие важные файлы
echo "📦 Архивирование других файлов..."
[ -f "SYSTEM_README.md" ] && cp SYSTEM_README.md "$ARCHIVE_DIR/" && echo "  ✅ SYSTEM_README.md"
[ -f "CHEATSHEET.md" ] && cp CHEATSHEET.md "$ARCHIVE_DIR/" && echo "  ✅ CHEATSHEET.md"
[ -f "CONTRIBUTING.md" ] && cp CONTRIBUTING.md "$ARCHIVE_DIR/" && echo "  ✅ CONTRIBUTING.md"
[ -f "примеры-мультиагентс-воркфлоу.md" ] && cp "примеры-мультиагентс-воркфлоу.md" "$ARCHIVE_DIR/" && echo "  ✅ примеры-мультиагентс-воркфлоу.md"

# Создать README архива
echo "📝 Создание README архива..."
cat > "$ARCHIVE_DIR/README.md" << EOF
# Архив Legacy системы

**Дата архивации:** $(date)
**Версия системы:** LLM-OS v1.0
**Причина:** Миграция на OpenSpec + Beads

## 📦 Содержимое архива

- \`specify/\` - Старая Spec-Driven система (.specify/features/)
- \`workflow/\` - LLM-OS workflow система (PROJECT_CONFIG.md, WORKFLOW_STATE.md, SCENARIO_STATE.yml)
- \`docs/\` - Вся документация проекта
- \`scripts/\` - Старые скрипты (bd.sh, generate-status.sh, и др.)
- \`prompts/\` - Промпты для LLM-OS (27 промптов)
- \`roles/\` - Роли LLM-OS (9 ролей)
- \`agents/\` - Правила для агентов (AGENTS.md)
- \`config/\` - Конфигурация (.cursorrules, .aliases, .cursor/)

## 🔄 Восстановление

Если нужно восстановить старую систему:

\`\`\`bash
# Восстановить Spec-Driven
cp -r .archive/legacy-system/specify/.specify .

# Восстановить Workflow
cp .archive/legacy-system/workflow/PROJECT_CONFIG.md .
cp .archive/legacy-system/workflow/WORKFLOW_STATE.md .
cp .archive/legacy-system/workflow/SCENARIO_STATE.yml .
cp -r .archive/legacy-system/workflow/scenarios .

# Восстановить промпты и роли
cp -r .archive/legacy-system/prompts/PROMPTS .
cp -r .archive/legacy-system/roles/ROLES .

# Восстановить правила агентов
cp .archive/legacy-system/agents/AGENTS.md .

# Восстановить конфигурацию
cp .archive/legacy-system/config/.cursorrules .
cp .archive/legacy-system/config/.aliases .
cp -r .archive/legacy-system/config/.cursor .
\`\`\`

## 📚 Миграция

См. \`docs/migration-to-openspec-beads.md\` для деталей миграции на OpenSpec + Beads.

## ⚠️ Важно

Этот архив создан перед миграцией на новую систему. Не удаляйте его до полной проверки новой системы.

## 📊 Статистика

- **Дата архивации:** $(date)
- **Размер архива:** $(du -sh "$ARCHIVE_DIR" | cut -f1)
- **Количество файлов:** $(find "$ARCHIVE_DIR" -type f | wc -l)
EOF

# Создать MIGRATION_LOG.md
cat > "$ARCHIVE_DIR/MIGRATION_LOG.md" << EOF
# Лог миграции на OpenSpec + Beads

**Дата начала:** $(date)

## Этапы миграции

### ✅ Фаза 1: Архивирование
- [x] Создана структура архива
- [x] Архивирована Spec-Driven система
- [x] Архивирована Workflow система
- [x] Архивирована документация
- [x] Архивированы скрипты
- [x] Архивированы промпты и роли
- [x] Архивированы правила агентов
- [x] Создан README архива

### ⏳ Фаза 2: Установка OpenSpec
- [ ] OpenSpec установлен
- [ ] OpenSpec инициализирован
- [ ] openspec/project.md заполнен
- [ ] openspec/AGENTS.md проверен

### ⏳ Фаза 3: Миграция данных
- [ ] Мигрирована первая фича (тест)
- [ ] Проверен результат
- [ ] Мигрированы остальные фичи

### ⏳ Фаза 4: Обновление конфигурации
- [ ] Обновлен .cursorrules
- [ ] Обновлены .aliases
- [ ] Обновлен AGENTS.md
- [ ] Обновлена документация

### ⏳ Фаза 5: Очистка
- [ ] Удалены старые файлы
- [ ] Обновлен .gitignore
- [ ] Финальный коммит

## Заметки

Добавляйте заметки о процессе миграции здесь.

EOF

echo ""
echo "✅ Архивация завершена!"
echo ""
echo "📊 Статистика:"
echo "  📁 Директория: $ARCHIVE_DIR"
echo "  📦 Размер: $(du -sh "$ARCHIVE_DIR" | cut -f1)"
echo "  📄 Файлов: $(find "$ARCHIVE_DIR" -type f | wc -l)"
echo ""
echo "📝 Следующие шаги:"
echo "  1. Проверить архив: ls -la $ARCHIVE_DIR"
echo "  2. Прочитать README: cat $ARCHIVE_DIR/README.md"
echo "  3. Закоммитить архив: git add .archive/ && git commit -m 'archive: Legacy system'"
echo "  4. Начать миграцию: см. docs/migration-to-openspec-beads.md"
echo ""




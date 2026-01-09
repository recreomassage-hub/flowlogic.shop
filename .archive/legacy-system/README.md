# Архив Legacy системы

**Дата архивации:** Fri Jan  9 08:57:23 AM CST 2026
**Версия системы:** LLM-OS v1.0
**Причина:** Миграция на OpenSpec + Beads

## 📦 Содержимое архива

- `specify/` - Старая Spec-Driven система (.specify/features/)
- `workflow/` - LLM-OS workflow система (PROJECT_CONFIG.md, WORKFLOW_STATE.md, SCENARIO_STATE.yml)
- `docs/` - Вся документация проекта
- `scripts/` - Старые скрипты (bd.sh, generate-status.sh, и др.)
- `prompts/` - Промпты для LLM-OS (27 промптов)
- `roles/` - Роли LLM-OS (9 ролей)
- `agents/` - Правила для агентов (AGENTS.md)
- `config/` - Конфигурация (.cursorrules, .aliases, .cursor/)

## 🔄 Восстановление

Если нужно восстановить старую систему:

```bash
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
```

## 📚 Миграция

См. `docs/migration-to-openspec-beads.md` для деталей миграции на OpenSpec + Beads.

## ⚠️ Важно

Этот архив создан перед миграцией на новую систему. Не удаляйте его до полной проверки новой системы.

## 📊 Статистика

- **Дата архивации:** Fri Jan  9 08:57:23 AM CST 2026
- **Размер архива:** 2.1M
- **Количество файлов:** 218

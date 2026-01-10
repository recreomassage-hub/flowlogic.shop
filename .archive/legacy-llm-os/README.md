# Legacy LLM-OS System Files

**Статус:** Архив (заменено на OpenSpec+Beads)  
**Дата архивации:** 2026-01-10

## Описание

Эта директория содержит файлы старой системы LLM-OS, которая была заменена на гибридную систему OpenSpec+Beads.

## Содержимое

### Конфигурация системы
- `PROJECT_CONFIG.md` - ROM системы (заменено на `openspec/project.md`)
- `WORKFLOW_STATE.md` - RAM системы (заменено на `STATUS.md`, генерируется из Beads)
- `SCENARIO_STATE.yml` - Состояние сценариев (не используется в OpenSpec+Beads)
- `SYSTEM_README.md` - Документация системы (заменено на OpenSpec документацию)

### Роли и инструкции
- `AGENTS.md` - Правила для агентов (заменено на `openspec/AGENTS.md`)
- `AGENTS_SETUP.md` - Настройка агентов (не используется)
- `ROLES/` - Определения ролей (заменено на `openspec/AGENTS.md`)
- `PROMPTS/` - Промпты для ролей (не используется)

### Сценарии
- `scenarios/` - Сценарии LLM-OS (не используются в OpenSpec+Beads)
- `SCENARIOS/` - Дополнительные сценарии (не используются)

## Миграция

Все активные разработки теперь используют:
- **OpenSpec** для спецификаций и изменений (`openspec/`)
- **Beads** для issue tracking (`.beads/issues.jsonl`, `STATUS.md`)

См. `docs/migration-to-openspec-beads.md` для деталей миграции.

## Восстановление

Если нужно восстановить legacy систему:
1. Скопировать файлы обратно в корень проекта
2. Установить зависимости LLM-OS (если были)
3. Обновить `.cursorrules` для использования legacy команд

**Внимание:** Legacy система больше не поддерживается. Используйте OpenSpec+Beads.



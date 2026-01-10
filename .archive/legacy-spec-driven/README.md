# Legacy Spec-Driven System Files

**Статус:** Архив (заменено на OpenSpec+Beads)  
**Дата архивации:** 2026-01-10

## Описание

Эта директория содержит файлы старой системы Spec-Driven Development (`.specify/constitution.md`), которая была заменена на OpenSpec+Beads.

## Содержимое

### Конфигурация системы
- `constitution.md` - Технические стандарты проекта (заменено на `openspec/project.md`)

## Миграция

Все активные разработки теперь используют:
- **OpenSpec** для спецификаций и изменений (`openspec/`)
- **Beads** для issue tracking (`.beads/issues.jsonl`, `STATUS.md`)

Технические стандарты теперь находятся в `openspec/project.md`.

См. `docs/migration-to-openspec-beads.md` для деталей миграции.

## Восстановление

Если нужно восстановить legacy файл:
1. Скопировать файл обратно в `.specify/constitution.md`
2. Обновить ссылки на `openspec/project.md` вместо `PROJECT_CONFIG.md`
3. Обновить `.cursorrules` для использования legacy файла

**Внимание:** Legacy система больше не поддерживается. Используйте OpenSpec+Beads.



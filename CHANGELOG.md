# 📝 CHANGELOG

## [2.0.0] - 2026-01-10
### Changed
- Migrated from legacy Spec-Driven (`.specify/`) to OpenSpec (`openspec/`)
- Integrated official Beads CLI (`@beads/bd`) for issue tracking
- Replaced LLM-OS system with OpenSpec+Beads hybrid approach

### Added
- OpenSpec framework for spec-driven development
- Official Beads CLI integration for structured issue tracking
- `/openspec-proposal` command for creating change proposals
- `/openspec-apply` command for implementing approved changes
- `/openspec-to-beads` command for converting tasks.md to Beads issues
- `/openspec-archive` command for archiving completed changes
- `openspec/AGENTS.md` - Instructions for AI agents
- `openspec/project.md` - Project context (replaces `.specify/constitution.md`)
- `STATUS.md` - Human-readable status (generated from Beads)

### Removed
- Legacy `scripts/bd.sh` wrapper (replaced by official Beads CLI)
- References to `.specify/` structure
- Legacy LLM-OS commands (`/specify`, `/clarify`, `/plan`, `/tasks`)

### Archived
- `PROJECT_CONFIG.md` → Replaced by `openspec/project.md`
- `WORKFLOW_STATE.md` → Replaced by `STATUS.md` (generated from Beads)
- `SCENARIO_STATE.yml` → Not used in OpenSpec+Beads
- `SYSTEM_README.md` → Replaced by OpenSpec documentation
- `ROLES/` → Replaced by `openspec/AGENTS.md`
- `PROMPTS/` → Not used in OpenSpec+Beads
- `scenarios/` → Not used in OpenSpec+Beads
- `SCENARIOS/` → Not used in OpenSpec+Beads
- `AGENTS.md` (root) → Replaced by `openspec/AGENTS.md`
- `AGENTS_SETUP.md` → Not used in OpenSpec+Beads

### Migration Notes
- All active development now uses OpenSpec workflow
- Issue tracking uses official Beads CLI (`bd` command)
- Legacy system files archived to `.archive/legacy-llm-os/`
- See `docs/analysis/files-necessity-review.md` for migration details

---

## [1.0.0] - 2024-01-15
### Added
- Базовая структура LLM-OS
- 8 ролей для ИИ-агентов
- Система управления состоянием
- Скрипты автоматизации
- Шаблоны и правила

### Structure (Legacy - Archived)
- PROJECT_CONFIG.md - ROM системы
- WORKFLOW_STATE.md - RAM системы
- ROLES/ - Instruction Set
- docs/ - Persistent Storage

### Roles (Legacy - Replaced by OpenSpec)
- ANALYST - Анализ требований
- ARCHITECT - Проектирование архитектуры
- PM - Планирование проекта
- BACKEND_DEV - Бэкенд разработка
- FRONTEND_DEV - Фронтенд разработка
- INFRA_DEVOPS - Инфраструктура
- QA - Тестирование
- DOCS - Документация



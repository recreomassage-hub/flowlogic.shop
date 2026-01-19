# Change: Fix Agent Workflow Errors

## Why

**Problem:** Критические ошибки в workflow агентов приводят к:
- Утечкам временных файлов в `/tmp/` (накопление мусора, потенциальные проблемы с дисковым пространством)
- Преждевременным завершениям скриптов из-за неправильной обработки ошибок (`set -euo pipefail` с невалидными jq запросами)
- Неточному подсчету нарушений из-за отсутствия валидации JSON перед парсингом
- Отсутствию передачи параметров между скриптами (bug-hunter.sh не передает --dry-run)
- Потенциальным зависаниям AWS CLI команд без таймаутов

**Impact:**
- Infrastructure compliance check может падать на пустых/поврежденных файлах
- Bug Hunter неправильно считает violations (использует grep вместо JSON данных)
- Временные файлы накапливаются в системе (проблемы с `/tmp`)
- Workflow нестабилен в production окружении

**Opportunity:** Исправить все критические ошибки для обеспечения стабильной работы workflow агентов и предотвращения накопления технического долга.

## What Changes

**Modifications:**
- `scripts/infrastructure-compliance-check.sh` — добавить cleanup временных файлов через trap, обработку ошибок jq с fallback, валидацию JSON перед парсингом, проверку наличия зависимых скриптов
- `scripts/bug-hunter.sh` — исправить передачу параметров в infrastructure-compliance-check.sh (добавить --dry-run), использовать данные из JSON вместо grep для подсчета violations
- `scripts/aws-inventory-scan.sh` — добавить cleanup временных файлов (если используются)
- Все скрипты с временными файлами — добавить trap для гарантированного cleanup

**Additions:**
- Утилитарные функции для валидации JSON (`validate_json()`)
- Безопасный парсинг jq с fallback (`safe_jq()`)
- Универсальная функция cleanup (`cleanup_temp_files()`)
- Таймауты для AWS CLI команд (300 секунд по умолчанию)

**BREAKING:**
- Нет breaking changes (только улучшения обработки ошибок)

## Impact

**Affected specs:**
- `operations` — MODIFIED: Agent workflow error handling and reliability

**Affected code:**
- `scripts/infrastructure-compliance-check.sh` (критические исправления)
- `scripts/bug-hunter.sh` (интеграция исправлена)
- `scripts/aws-inventory-scan.sh` (cleanup добавлен)
- `scripts/generate-cleanup-plan.sh` (cleanup добавлен)
- `scripts/safe-aws-cleanup.py` (cleanup добавлен)

**Migration:**
- Существующие скрипты продолжат работать, но станут более стабильными
- Не требуется миграция данных или конфигурации

**Risks:**
- Минимальные: изменения только улучшают обработку ошибок и не меняют функциональность
- Потенциальный риск: если cleanup слишком агрессивен, может удалить нужные файлы (митигировано: только явно помеченные временные файлы)

## Open Questions

- [x] Нужны ли таймауты для всех AWS CLI команд или только для долгих операций?
  - **A:** Только для операций, которые могут зависнуть (inventory scan, resource tagging). Быстрые команды без таймаутов.
- [x] Какой fallback использовать для null значений из jq?
  - **A:** "0" для числовых значений, "[]" для массивов, "{}" для объектов, "" для строк.

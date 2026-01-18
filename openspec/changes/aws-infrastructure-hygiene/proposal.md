# Change: AWS Infrastructure Hygiene System

## Why

**Problem:** Технический долг AWS инфраструктуры накапливается из-за отсутствия автоматизированного контроля качества:
- Неиспользуемые ресурсы (никто не знает, что используется)
- Отсутствие обязательных тегов (Project, Env, Owner, ExpiresAt)
- Несоблюдение naming conventions
- Staging ломается без понимания причины
- Бардак возвращается после очистки

**Opportunity:** Реализовать автоматизированную систему контроля качества через OpenSpec + Beads + Bugbot:
- Предотвращение возврата к хаосу через continuous compliance checking
- Автоматическая инвентаризация и классификация ресурсов
- Безопасная очистка с backup и Beads recording
- Интеграция с существующим Bug Hunter для infrastructure compliance

## What Changes

**Additions:**
- **Infrastructure Specification (`infrastructure/infrastructure-spec.yaml`)** — OpenSpec правила для AWS ресурсов:
  - Required tags (Project, Env, Owner, ExpiresAt)
  - Naming conventions (flowlogic-{env}-{service})
  - Lifecycle policies (dev resources max 30 days, auto-cleanup)
  - Resource policies (DynamoDB encryption, S3 lifecycle rules)
- **AWS Inventory Classifier** — автоматическая классификация ресурсов:
  - prod/staging/dev/untagged
  - expired (dev ресурсы без ExpiresAt > 30 дней)
  - cost_zombies (неиспользуемые > 60 дней)
- **Beads Integration для Infrastructure** — автоматическая запись всех infrastructure actions
- **Infrastructure Compliance Checks** — расширение Bug Hunter для проверки compliance по infrastructure-spec.yaml
- **GitHub Actions для Continuous Compliance** — автоматическая проверка при push и schedule
- **Safe Cleanup Scripts** — безопасное удаление с backup и dry-run режимами

**BREAKING:**
- Нет breaking changes (только добавления и автоматизация)

## Impact

**Affected specs:**
- `infrastructure` — ADDED: Infrastructure compliance rules and automation

**Affected code:**
- `infrastructure/infrastructure-spec.yaml` — новый файл со спецификацией
- `scripts/aws-inventory-classifier.py` — новый скрипт для классификации
- `scripts/aws-inventory-scan.sh` — новый скрипт для сканирования
- `scripts/infrastructure-compliance-check.sh` — расширение Bug Hunter
- `scripts/safe-aws-cleanup.py` — безопасное удаление ресурсов
- `.github/workflows/infrastructure-hygiene.yml` — новый workflow
- `scripts/bug-hunter.sh` — расширение для infrastructure compliance

**Migration:**
- Существующие ресурсы: постепенное тегирование через inventory scan
- Legacy ресурсы: whitelist в infrastructure-spec.yaml (исключения из compliance)
- Cleanup: только после inventory scan и manual approval

**Risks:**
- Удаление критичных ресурсов (митигировано: dry-run, backup, manual approval)
- Ложные срабатывания compliance (митигировано: whitelist для legacy)
- Performance impact от сканирования (митигировано: async scanning, кэширование)

## Open Questions

- [ ] Какой порог для auto-cleanup expired dev resources? (30 дней или другой?)
  - **A (pending):** Начать с 30 дней, настроить в infrastructure-spec.yaml
- [ ] Нужна ли интеграция с AWS Cost Explorer для cost_zombies detection?
  - **A (pending):** MVP: только age-based detection. Cost Explorer - в v2
- [ ] Какой формат для Beads recording infrastructure actions?
  - **A (pending):** Структурированный JSON с metadata (resource ARN, action, timestamp)

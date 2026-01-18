# AWS Infrastructure Hygiene System

Автоматизированная система контроля качества AWS инфраструктуры через OpenSpec + Beads + Bugbot для предотвращения накопления технического долга.

## Быстрый старт

### 1. Первый inventory scan

```bash
# Настроить AWS credentials (если еще не настроены)
aws configure

# Запустить scan
./scripts/aws-inventory-scan.sh
```

Результаты сохраняются в `infrastructure/inventory/`:
- `inventory-{timestamp}.json` - сырой список ресурсов
- `classified-{timestamp}.json` - классификация и violations

### 2. Проверка compliance

```bash
# Проверка соответствия infrastructure-spec.yaml
./scripts/infrastructure-compliance-check.sh
```

Скрипт автоматически:
- Сканирует все ресурсы
- Проверяет теги и naming convention
- Создает Beads issues для violations
- Показывает summary с приоритетами

### 3. Безопасная очистка

```bash
# DRY RUN (рекомендуется сначала)
python3 scripts/safe-aws-cleanup.py --plan cleanup-plan.json --dry-run

# Реальное выполнение (после review)
python3 scripts/safe-aws-cleanup.py --plan cleanup-plan.json --create-beads-issue
```

## Компоненты системы

### Infrastructure Specification

`infrastructure/infrastructure-spec.yaml` - центральный файл с правилами:

- **Required tags**: Project, Env, Owner, ExpiresAt (для dev)
- **Naming convention**: `flowlogic-{env}-{service}`
- **Lifecycle policies**: dev max 30 days, staging max 90 days
- **Resource policies**: DynamoDB encryption, S3 lifecycle rules

### AWS Inventory Classifier

`scripts/aws-inventory-classifier.py` - классифицирует ресурсы:

- **prod/staging/dev/untagged** - по тегам или naming
- **expired** - dev ресурсы с ExpiresAt в прошлом
- **cost_zombies** - неиспользуемые > 60 дней (в разработке)

### Inventory Scan

`scripts/aws-inventory-scan.sh` - сканирует AWS через Resource Groups Tagging API:

- Получает все ресурсы с Project=FlowLogic
- Запускает классификацию
- Генерирует JSON отчеты

### Compliance Check

`scripts/infrastructure-compliance-check.sh` - проверка compliance:

- Интеграция с Bug Hunter
- Приоритизация violations (CRITICAL/HIGH/MEDIUM)
- Автоматическое создание Beads issues

### Safe Cleanup

`scripts/safe-aws-cleanup.py` - безопасное удаление:

- **Dry-run** режим по умолчанию
- **Backup** перед удалением (DynamoDB snapshots, S3 objects)
- **Beads recording** для audit trail
- **Rollback** capability

### GitHub Actions

`.github/workflows/infrastructure-hygiene.yml` - continuous compliance:

- **validate-infrastructure**: проверка spec при push
- **check-compliance**: scheduled daily проверка
- **detect-drift**: обнаружение drift в CloudFormation
- **enforce-expiration**: auto-cleanup expired dev resources

## Workflow

### Ежедневная проверка

GitHub Actions автоматически запускает `check-compliance` каждый день в 9 AM UTC:

1. Сканирует все ресурсы
2. Проверяет compliance
3. Создает Beads issues для новых violations
4. Отчет доступен в workflow logs

### При изменении infrastructure

При push в `infrastructure/` или `infra/`:

1. Валидация `infrastructure-spec.yaml` (YAML syntax, структура)
2. Проверка соответствия изменениям правилам
3. PR блокируется если violations найдены

### Ручная очистка

1. Запустить `aws-inventory-scan.sh` → получить список resources
2. Сгенерировать cleanup plan (TODO: скрипт для генерации)
3. Review cleanup plan
4. Запустить `safe-aws-cleanup.py --dry-run`
5. После approval: `safe-aws-cleanup.py` без `--dry-run`

## Метрики для отслеживания

После внедрения системы отслеживайте:

- **Compliance rate**: % ресурсов с required tags (цель: 100%)
- **Untagged resources**: количество (цель: 0)
- **Expired dev resources**: количество (цель: 0 при auto-cleanup)
- **Cost by environment**: spend по prod/staging/dev
- **Cost from untagged resources**: (цель: $0)

## Troubleshooting

### AWS credentials не настроены

```bash
aws configure
# Или использовать AWS_PROFILE
export AWS_PROFILE=your-profile
```

### Python dependencies не установлены

```bash
pip install pyyaml boto3
```

### jq не найден

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### Compliance check показывает ложные violations

Проверьте `whitelist` в `infrastructure-spec.yaml` - добавьте исключения для legacy ресурсов.

## Дополнительная информация

- OpenSpec proposal: `openspec/changes/aws-infrastructure-hygiene/`
- Infrastructure spec: `infrastructure/infrastructure-spec.yaml`
- Tasks: `openspec/changes/aws-infrastructure-hygiene/tasks.md`

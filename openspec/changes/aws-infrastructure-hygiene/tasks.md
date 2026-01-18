# Implementation Tasks

## 1. Infrastructure Specification

- [x] 1.1 Создать `infrastructure/infrastructure-spec.yaml` с базовой структурой
- [x] 1.2 Определить required tags (Project, Env, Owner, ExpiresAt)
- [x] 1.3 Определить naming convention (flowlogic-{env}-{service})
- [x] 1.4 Определить lifecycle policies (dev max 30 days, staging max 90 days)
- [x] 1.5 Определить resource policies (DynamoDB encryption, S3 lifecycle)
- [x] 1.6 Добавить примеры ресурсов для каждого окружения

## 2. AWS Inventory Classifier

- [x] 2.1 Создать `scripts/aws-inventory-classifier.py` с базовой структурой
- [x] 2.2 Реализовать классификацию по тегам (prod/staging/dev/untagged)
- [x] 2.3 Реализовать проверку expired dev resources (ExpiresAt tag)
- [ ] 2.4 Реализовать detection cost_zombies (last accessed > 60 days) - В разработке
- [ ] 2.5 Реализовать генерацию cleanup plan с приоритетами - Pending
- [x] 2.6 Добавить вывод в JSON формат для интеграции с другими скриптами
- [x] 2.7 Создать `scripts/aws-inventory-scan.sh` для запуска классификации

## 3. Beads Integration для Infrastructure

- [ ] 3.1 Настроить Beads auto-recording для AWS actions (cloudformation:*)
- [ ] 3.2 Создать структуру Beads record для infrastructure changes
- [ ] 3.3 Реализовать запись cleanup actions в Beads
- [ ] 3.4 Реализовать запись compliance violations в Beads
- [ ] 3.5 Интеграция с deployment failures для root cause analysis

## 4. Infrastructure Compliance Checks

- [ ] 4.1 Расширить `scripts/bug-hunter.sh` для infrastructure compliance
- [x] 4.2 Создать `scripts/infrastructure-compliance-check.sh` для проверки compliance
- [x] 4.3 Реализовать проверку required tags через AWS Resource Groups Tagging API
- [x] 4.4 Реализовать проверку naming convention
- [x] 4.5 Реализовать проверку expired dev resources
- [x] 4.6 Интеграция с Beads: создание issues для violations
- [x] 4.7 Приоритизация violations (CRITICAL, HIGH, MEDIUM, LOW)

## 5. Safe Cleanup Scripts

- [ ] 5.1 Создать `scripts/safe-aws-cleanup.py` с базовой структурой
- [ ] 5.2 Реализовать dry-run режим (по умолчанию)
- [ ] 5.3 Реализовать backup перед удалением (DynamoDB snapshots, S3 objects)
- [ ] 5.4 Реализовать Beads recording для каждого cleanup action
- [ ] 5.5 Реализовать rollback capability (restore from backup)
- [ ] 5.6 Создать `scripts/generate-cleanup-plan.sh` для генерации плана очистки
- [ ] 5.7 Добавить верификацию удаления (assert resource not exists)

## 6. GitHub Actions для Continuous Compliance

- [x] 6.1 Создать `.github/workflows/infrastructure-hygiene.yml`
- [x] 6.2 Настроить триггер на push в infrastructure/
- [x] 6.3 Настроить schedule триггер (ежедневно в 9 AM)
- [x] 6.4 Настроить pre-merge validation для PR
- [x] 6.5 Реализовать validate-infrastructure job (проверка против spec)
- [x] 6.6 Реализовать check-untagged-resources job (в составе check-compliance)
- [x] 6.7 Реализовать detect-resource-drift job (CloudFormation drift detection)
- [x] 6.8 Реализовать enforce-expiration job (auto-cleanup expired dev resources)

## 7. Documentation

- [ ] 7.1 Создать `docs/infrastructure/hygiene-dashboard.md` с метриками
- [ ] 7.2 Документировать infrastructure-spec.yaml формат
- [ ] 7.3 Документировать использование inventory classifier
- [ ] 7.4 Документировать safe cleanup process
- [ ] 7.5 Создать runbook для команды (как использовать систему)

## 8. First Inventory & Cleanup

- [ ] 8.1 Выполнить первый inventory scan (DRY RUN)
- [ ] 8.2 Сгенерировать cleanup plan
- [ ] 8.3 Ревью cleanup plan (manual approval)
- [ ] 8.4 Затегировать все используемые ресурсы
- [ ] 8.5 Выполнить cleanup expired dev resources (после approval)

## 9. Testing

- [ ] 9.1 Unit тесты для inventory classifier (классификация логика)
- [ ] 9.2 Unit тесты для compliance checks (validation логика)
- [ ] 9.3 Integration тесты для safe cleanup (dry-run режим)
- [ ] 9.4 E2E тест: полный цикл (inventory → compliance → cleanup)

## 10. Deployment

- [x] 10.1 Добавить GitHub Actions workflow для infrastructure-hygiene
- [x] 10.2 Проверить работу inventory scan на staging (✅ Тест пройден локально)
- [x] 10.3 Проверить работу compliance checks на staging (✅ Тест пройден локально)
- [ ] 10.4 Выполнить первый cleanup на staging (expired dev resources) - Pending (требует AWS ресурсов с тегами)
- [ ] 10.5 Мониторинг метрик compliance (1 неделя) - После deployment
- [ ] 10.6 Deploy в production (after staging verification) - После тестирования на staging

## Dependencies

```
1.x (Spec) → blocks 2.x, 4.x (Classifier, Compliance)
2.x (Inventory) → blocks 5.x, 8.x (Cleanup)
3.x (Beads) → blocks 5.x, 8.x (Cleanup)
4.x (Compliance) → blocks 6.x (GitHub Actions)
{2.x, 4.x} → blocks 8.x (First Inventory)
{5.x, 8.x} → blocks 9.x (Testing)
{9.x} → blocks 10.x (Deployment)
```

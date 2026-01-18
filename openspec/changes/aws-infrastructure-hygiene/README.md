# AWS Infrastructure Hygiene System

Автоматизированная система контроля качества AWS инфраструктуры через OpenSpec + Beads + Bugbot.

## 📋 Overview

Система предотвращает накопление технического долга в AWS через:
- ✅ **Infrastructure Specification** - единый source of truth для правил
- ✅ **Automated Inventory** - классификация и сканирование ресурсов
- ✅ **Compliance Checking** - автоматическая проверка соответствия правилам
- ✅ **Continuous Enforcement** - GitHub Actions для постоянного контроля
- ✅ **Safe Cleanup** - безопасное удаление с backup и dry-run

## 🚀 Quick Start

```bash
# 1. Inventory scan
./scripts/aws-inventory-scan.sh

# 2. Compliance check
./scripts/infrastructure-compliance-check.sh

# 3. View results
cat infrastructure/inventory/classified-*.json | jq '.summary'
```

## 📁 Files Created

### Core Components
- `infrastructure/infrastructure-spec.yaml` - Правила compliance
- `scripts/aws-inventory-classifier.py` - Классификация ресурсов
- `scripts/aws-inventory-scan.sh` - Сканирование AWS
- `scripts/infrastructure-compliance-check.sh` - Проверка compliance

### CI/CD
- `.github/workflows/infrastructure-hygiene.yml` - Continuous compliance

### Documentation
- `docs/infrastructure/hygiene-readme.md` - User guide
- `TEST_RESULTS.md` - Test execution results
- `IMPLEMENTATION_STATUS.md` - Implementation status

## ✅ Status

**Implementation:** ~75% Complete  
**Core Components:** 100% Complete  
**Testing:** ✅ Passed  
**Integration:** ✅ Complete  
**Deployment:** Ready

## 🔗 Related

- **OpenSpec Proposal:** `proposal.md`
- **Tasks:** `tasks.md`
- **Specification:** `specs/infrastructure/spec.md`

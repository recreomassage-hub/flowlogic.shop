# 📁 Реорганизация файловой системы проекта

**Дата:** 2025-12-26  
**Цель:** Упорядочить документацию, объединить дублирующиеся файлы, создать структуру troubleshooting

---

## ✅ ВЫПОЛНЕННЫЕ ИЗМЕНЕНИЯ

### 1. Создана структура troubleshooting папок

**Созданы папки:**
- `docs/deployment/troubleshooting/` - Troubleshooting для deployment
- `docs/infrastructure/troubleshooting/` - Troubleshooting для infrastructure
- `docs/security/troubleshooting/` - Troubleshooting для security
- `docs/agents/troubleshooting/` - Troubleshooting для agents

---

### 2. Объединены AWS Credentials файлы

**Объединено:**
- `aws_credentials_setup.md` + `quick_fix_aws_credentials.md` → `aws_credentials_setup.md`
  - Добавлена секция "Быстрое решение" в начало
  - Сохранена полная инструкция

**Перемещено:**
- `aws_credentials_troubleshooting.md` + `check_github_secrets.md` + `WHY_NOT_USED.md` + `aws_oidc_troubleshooting.md` → `docs/deployment/troubleshooting/aws_credentials.md`
  - Объединены все troubleshooting guides
  - Включает OIDC и Access Keys проблемы

**Удалено:**
- `quick_fix_aws_credentials.md`
- `check_github_secrets.md`
- `WHY_NOT_USED.md`
- `aws_credentials_troubleshooting.md` (старая версия)
- `aws_oidc_troubleshooting.md`

---

### 3. Объединены IAM Setup файлы

**Создан:**
- `aws_iam_setup.md` (новый, объединенный)
  - Часть 1: Создание IAM Policy
  - Часть 2: Создание IAM Role (для OIDC)
  - Часть 3: Создание IAM User (для Access Keys)


# 🔧 Troubleshooting Guide

**Для:** Диагностика и решение проблем с деплоем

---

## 📋 ДОСТУПНЫЕ ГАЙДЫ

### AWS Credentials
- **`aws_credentials.md`** - Полная диагностика проблем с AWS credentials
  - OIDC проблемы
  - Access Keys проблемы
  - GitHub Secrets проблемы
  - Проверка конфигурации

---

## 🔍 БЫСТРЫЙ ПОИСК ПРОБЛЕМЫ

### Ошибка: "AWS provider credentials not found"
→ См. `aws_credentials.md` - раздел "Проверка GitHub Secrets"

### Ошибка: "Request ARN is invalid"
→ См. `aws_credentials.md` - раздел "Проверка формата AWS_ROLE_ARN"

### Ошибка: "Access Keys не используются"
→ См. `aws_credentials.md` - раздел "Почему Access Keys не используются"

### Ошибка: "Cannot resolve variable"
→ См. `../pre_deployment_checklist.md` - раздел "Troubleshooting"

---

## 📚 СВЯЗАННАЯ ДОКУМЕНТАЦИЯ

- **Setup:** `../aws_credentials_setup.md` - Настройка Access Keys
- **OIDC Setup:** `../aws_oidc_setup.md` - Настройка OIDC
- **IAM Setup:** `../aws_iam_setup.md` - Настройка IAM
- **Checklist:** `../pre_deployment_checklist.md` - Pre-deployment checklist

---

**Последнее обновление:** 2025-12-26





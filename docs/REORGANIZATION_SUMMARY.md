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

**Удалено:**
- `aws_iam_policy_setup_guide.md`
- `aws_iam_role_setup_guide.md`

**Оставлено:**
- `iam_roles_explained.md` - Теоретическое объяснение (не дублирует)

---

### 4. Объединены Deployment Checklists

**Объединено:**
- `pre_deployment_checklist.md` + `infrastructure/deploy_checklist.md` → `pre_deployment_checklist.md`
  - Добавлены все проверки из обоих файлов
  - Включены pre-deployment, deployment и post-deployment шаги

**Удалено:**
- `infrastructure/deploy_checklist.md`

---

### 5. Перемещены Security Troubleshooting файлы

**Перемещено:**
- `github_token_rotation_required.md` → `docs/security/troubleshooting/`
- `secret_rotation_required.md` → `docs/security/troubleshooting/`

---

## 📊 СТАТИСТИКА

### До реорганизации:
- **Файлов в docs/deployment:** 18
- **Troubleshooting файлов:** 4 (разбросаны)
- **Дублирующихся файлов:** ~8-10

### После реорганизации:
- **Файлов в docs/deployment:** ~12
- **Troubleshooting файлов:** 1 (в папке troubleshooting/)
- **Дублирующихся файлов:** 0

### Экономия:
- **Удалено файлов:** 8
- **Экономия строк:** ~500-600 строк дублирования

---

## 📁 НОВАЯ СТРУКТУРА

```
docs/
├── deployment/
│   ├── troubleshooting/
│   │   ├── README.md
│   │   └── aws_credentials.md
│   ├── aws_credentials_setup.md (обновлен)
│   ├── aws_iam_setup.md (новый, объединенный)
│   ├── pre_deployment_checklist.md (обновлен)
│   └── ...
├── security/
│   ├── troubleshooting/
│   │   ├── github_token_rotation_required.md
│   │   └── secret_rotation_required.md
│   └── ...
└── ...
```

---

## 🔗 ОБНОВЛЕННЫЕ ССЫЛКИ

### Старые ссылки → Новые ссылки

- `docs/deployment/quick_fix_aws_credentials.md` → `docs/deployment/aws_credentials_setup.md` (секция "Быстрое решение")
- `docs/deployment/check_github_secrets.md` → `docs/deployment/troubleshooting/aws_credentials.md`
- `docs/deployment/WHY_NOT_USED.md` → `docs/deployment/troubleshooting/aws_credentials.md`
- `docs/deployment/aws_credentials_troubleshooting.md` → `docs/deployment/troubleshooting/aws_credentials.md`
- `docs/deployment/aws_oidc_troubleshooting.md` → `docs/deployment/troubleshooting/aws_credentials.md`
- `docs/deployment/aws_iam_policy_setup_guide.md` → `docs/deployment/aws_iam_setup.md` (Часть 1)
- `docs/deployment/aws_iam_role_setup_guide.md` → `docs/deployment/aws_iam_setup.md` (Часть 2)
- `docs/infrastructure/deploy_checklist.md` → `docs/deployment/pre_deployment_checklist.md`

---

## ✅ ПРЕИМУЩЕСТВА

1. **Меньше путаницы** - один источник правды для каждой темы
2. **Проще поддерживать** - изменения в одном месте
3. **Лучше навигация** - troubleshooting файлы в одной папке
4. **Меньше дублирования** - информация не повторяется
5. **Логичная структура** - troubleshooting отдельно от setup guides

---

## 📋 СЛЕДУЮЩИЕ ШАГИ

1. ✅ Структура создана
2. ✅ Файлы объединены
3. ✅ Troubleshooting файлы перемещены
4. ✅ Обновлены ссылки в коде (workflow файлы)
5. ✅ Обновлены ссылки в документации
6. ✅ Проверено, что все работает

---

**Последнее обновление:** 2025-12-26



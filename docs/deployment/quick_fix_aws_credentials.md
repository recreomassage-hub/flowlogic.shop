# ⚡ Быстрое решение проблемы AWS Credentials

**Проблема:** `Error: Could not assume role with OIDC: Request ARN is invalid`

**Решение:** Используйте Access Keys (5 минут)

---

## 🚀 БЫСТРОЕ РЕШЕНИЕ (5 минут)

### Шаг 1: Создайте IAM User (2 минуты)

1. AWS Console → IAM → Users → **Create user**
2. Имя: `flowlogic-github-actions-user`
3. **Attach policies directly:**
   - Выберите: `FlowLogicGitHubActionsDeployPolicy` (если создана)
   - ИЛИ: `PowerUserAccess` (временно для теста)

### Шаг 2: Создайте Access Keys (1 минута)

1. Выберите пользователя → **Security credentials** tab
2. **Create access key** → **Application running outside AWS**
3. **Скопируйте:**
   - Access key ID (начинается с `AKIA`)
   - Secret access key (40 символов)

### Шаг 3: Добавьте в GitHub Secrets (1 минута)

1. GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret:**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: ваш Access Key ID
3. **New repository secret:**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: ваш Secret Access Key
4. **ВАЖНО:** Удалите или оставьте пустым `AWS_ROLE_ARN`

### Шаг 4: Перезапустите workflow (1 минута)

1. GitHub → **Actions**
2. Найдите failed workflow
3. **Re-run jobs** или **Run workflow**

**Готово!** Workflow автоматически использует Access Keys.

---

## ✅ ПРОВЕРКА

После перезапуска workflow проверьте:

1. **Step "Check AWS credentials configuration":**
   - Должно быть: `⚠️ AWS_ROLE_ARN not found, will use Access Keys`
   - Должно быть: `✅ AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY found`

2. **Step "Configure AWS credentials (Access Keys)":**
   - Должен выполниться успешно

3. **Step "Verify AWS credentials":**
   - Должно быть: `✅ AWS authentication successful`

---

## 🔒 БЕЗОПАСНОСТЬ

**Важно:**
- Access Keys имеют полный доступ к AWS (в зависимости от policy)
- Храните их только в GitHub Secrets (никогда не коммитьте в код)
- Регулярно ротируйте Access Keys (каждые 90 дней)
- Используйте минимальные permissions (см. `docs/deployment/aws_iam_permissions.md`)

---

## 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ

Для детальной настройки и диагностики:
- `docs/deployment/aws_credentials_troubleshooting.md` - Полное руководство
- `docs/deployment/aws_credentials_setup.md` - Настройка Access Keys
- `docs/deployment/aws_oidc_setup.md` - Настройка OIDC (рекомендуется для production)

---

**Время решения:** 5 минут  
**Сложность:** Легко



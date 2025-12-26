# ❓ Почему Access Keys не используются?

**Access Key:** Создан в AWS, но не используется в GitHub Actions  
**Статус:** Требуется добавление в GitHub Secrets

---

## 🔍 ПРИЧИНЫ

### 1. Секреты не добавлены в GitHub Secrets

**Проблема:** Access Keys созданы в AWS, но не добавлены в GitHub Secrets.

**Решение:**
1. GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret:**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: ваш Access Key ID (начинается с `AKIA`, 20 символов)
3. **New repository secret:**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: ваш Secret Access Key (40 символов)

---

### 2. AWS_ROLE_ARN настроен (приоритет OIDC)

**Проблема:** Если `AWS_ROLE_ARN` добавлен в GitHub Secrets, workflow попытается использовать OIDC вместо Access Keys.

**Решение:**
1. GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Найдите `AWS_ROLE_ARN`
3. **Удалите** его или оставьте пустым
4. Убедитесь, что добавлены `AWS_ACCESS_KEY_ID` и `AWS_SECRET_ACCESS_KEY`

---

### 3. Неправильные имена секретов

**Проблема:** Имена секретов не соответствуют ожидаемым.

**Правильные имена:**
- ✅ `AWS_ACCESS_KEY_ID` (точно так, с учетом регистра)
- ✅ `AWS_SECRET_ACCESS_KEY` (точно так, с учетом регистра)

**Неправильные примеры:**
- ❌ `aws_access_key_id` (нижний регистр)
- ❌ `AWS_ACCESS_KEY` (без `_ID`)
- ❌ `AWS_ACCESS_KEY_ID ` (пробел в конце)

---

### 4. Секреты добавлены в Environment, а не Repository

**Проблема:** Секреты добавлены в Environment secrets, но workflow ищет их в Repository secrets.

**Решение:**
- Используйте **Repository secrets** (Settings → Secrets and variables → Actions → Repository secrets)
- ИЛИ добавьте секреты в Environment `production` (Settings → Secrets and variables → Actions → Environments → production)

---

## ✅ БЫСТРОЕ РЕШЕНИЕ

### Шаг 1: Проверьте GitHub Secrets

```
GitHub → Settings → Secrets and variables → Actions
```

**Должны быть:**
- ✅ `AWS_ACCESS_KEY_ID` = (ваш Access Key ID из AWS)
- ✅ `AWS_SECRET_ACCESS_KEY` = (ваш Secret Access Key из AWS)
- ❌ `AWS_ROLE_ARN` = (пустой или удален)

### Шаг 2: Перезапустите workflow

```
GitHub → Actions → Re-run jobs
```

### Шаг 3: Проверьте логи

В step **"Check AWS credentials configuration"** должно быть:

```
✅ AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY found
⚠️  AWS_ROLE_ARN not found, will use Access Keys
```

---

## 🔍 ДИАГНОСТИКА

### Проверка 1: Логи workflow

Откройте failed workflow → job "Deploy to Production" → step "Check AWS credentials configuration"

**Если видите:**
```
⚠️  AWS Access Keys not found
```

**Причина:** Секреты не добавлены или названы неправильно.

**Решение:** Добавьте секреты с правильными именами.

---

### Проверка 2: Step "Configure AWS credentials (Access Keys)"

**Если step skipped:**
- Проверьте, что `AWS_ROLE_ARN` пустой
- Проверьте, что `AWS_ACCESS_KEY_ID` и `AWS_SECRET_ACCESS_KEY` добавлены

**Если step выполнился, но есть ошибка:**
- Проверьте формат Access Keys
- Проверьте, что Access Keys активны в AWS

---

## 📋 ЧЕКЛИСТ

- [ ] `AWS_ACCESS_KEY_ID` добавлен в GitHub Secrets
- [ ] `AWS_SECRET_ACCESS_KEY` добавлен в GitHub Secrets
- [ ] Имена секретов точно соответствуют (с учетом регистра)
- [ ] `AWS_ROLE_ARN` пустой или удален
- [ ] Workflow перезапущен после добавления секретов
- [ ] Access Keys активны в AWS (IAM → Users → flowlogic-cicd-user → Security credentials)

---

## 🔗 СВЯЗАННЫЕ ДОКУМЕНТЫ

- `docs/deployment/check_github_secrets.md` - Детальная проверка секретов
- `docs/deployment/quick_fix_aws_credentials.md` - Быстрое решение
- `docs/deployment/aws_credentials_troubleshooting.md` - Полная диагностика

---

**Последнее обновление:** 2025-12-26


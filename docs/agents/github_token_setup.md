# 🔐 GitHub Token Setup для Мультиагентной Системы

**Дата:** 2025-12-23  
**Для:** Orchestrator, GFC (Git Flow Controller), DS (Deploy Supervisor)

---

## 📋 Обзор

Агенты (Оркестратор, GFC, DS) должны иметь возможность читать код и отправлять отчеты в GitHub. Для этого требуется GitHub Personal Access Token.

---

## 🔑 Создание GitHub Token

### Шаг 1: Генерация токена

1. Перейдите в GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Или напрямую: https://github.com/settings/tokens

2. Нажмите "Generate new token (classic)"

3. Настройте токен:
   - **Note:** `Flow Logic Multi-Agent System`
   - **Expiration:** Выберите срок действия (рекомендуется: 90 дней)
   - **Scopes:** Выберите следующие права:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `read:org` (Read org and team membership)

4. Нажмите "Generate token"

5. **ВАЖНО:** Скопируйте токен сразу (он показывается только один раз!)
   - Формат: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚙️ Настройка в проекте

### Шаг 2: Создание .env файла

1. **Скопируйте шаблон:**
   ```bash
   cp .env.example .env
   ```

2. **Откройте .env и добавьте токен:**
   ```env
   GITHUB_TOKEN=ghp_ваш_длинный_токен_из_настроек
   GITHUB_REPO=recreomassage-hub/flowlogic.shop
   ```

3. **Проверьте, что .env в .gitignore:**
   ```bash
   git check-ignore .env
   # Должно вывести: .env
   ```

   ⚠️ **КРИТИЧЕСКИ ВАЖНО:** Убедитесь, что `.env` находится в `.gitignore`, чтобы не повторить историю с SSH-ключом!

---

## 🐍 Использование в Python (PyGithub)

Если ваши агенты написаны на Python:

### Установка библиотеки

```bash
pip install PyGithub
```

### Пример кода

```python
import os
from github import Github

# Агент берет токен из системы
token = os.getenv("GITHUB_TOKEN")
if not token:
    raise ValueError("GITHUB_TOKEN не установлен в переменных окружения")

# Инициализация GitHub клиента
g = Github(token)

# Получение репозитория
repo_name = os.getenv("GITHUB_REPO", "recreomassage-hub/flowlogic.shop")
repo = g.get_repo(repo_name)

# Проверка подключения
print(f"✅ Агент подключен к: {repo.full_name}")
print(f"   Описание: {repo.description}")
print(f"   Статус: {'Private' if repo.private else 'Public'}")

# Пример: Получение последних коммитов
commits = repo.get_commits()[:5]
print(f"\n📝 Последние 5 коммитов:")
for commit in commits:
    print(f"   - {commit.sha[:7]}: {commit.commit.message.split(chr(10))[0]}")
```

### Функции для агентов

#### GFC (Git Flow Controller)

```python
def check_pr_secrets(pr_number):
    """Проверка PR на наличие секретов"""
    pr = repo.get_pull(pr_number)
    files = pr.get_files()
    
    for file in files:
        if file.filename.endswith(('.env', '.key', '.pem')):
            return False, f"⚠️ Обнаружен файл с секретами: {file.filename}"
    
    return True, "✅ Секреты не обнаружены"

def check_env_example_completeness():
    """Проверка полноты .env.example"""
    try:
        content = repo.get_contents(".env.example")
        # Проверка наличия всех необходимых переменных
        required_vars = ["GITHUB_TOKEN", "GITHUB_REPO"]
        content_str = content.decoded_content.decode()
        
        missing = [var for var in required_vars if var not in content_str]
        if missing:
            return False, f"⚠️ Отсутствуют переменные: {', '.join(missing)}"
        
        return True, "✅ .env.example полный"
    except:
        return False, "⚠️ .env.example не найден"
```

#### DS (Deploy Supervisor)

```python
def create_deployment_status(deployment_id, state, description):
    """Создание статуса деплоя в GitHub"""
    # Создание deployment status
    repo.create_deployment_status(
        deployment_id,
        state=state,  # 'success', 'failure', 'pending', 'error'
        description=description,
        environment="production"
    )

def post_deployment_report(deployment_id, checklist_results):
    """Отправка отчета о деплое"""
    report = "## 📊 Deployment Report\n\n"
    report += "### Post-Deployment Checklist\n\n"
    
    for item, status in checklist_results.items():
        emoji = "✅" if status else "❌"
        report += f"- {emoji} {item}\n"
    
    # Создание issue или comment
    repo.create_issue(
        title=f"Deployment Report - {deployment_id}",
        body=report,
        labels=["deployment", "automated"]
    )
```

---

## 📦 Использование в Node.js

Если ваши агенты написаны на Node.js:

### Установка библиотеки

```bash
npm install @octokit/rest
```

### Пример кода

```javascript
const { Octokit } = require("@octokit/rest");

// Агент берет токен из системы
const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("GITHUB_TOKEN не установлен в переменных окружения");
}

// Инициализация GitHub клиента
const octokit = new Octokit({
  auth: token,
});

// Получение репозитория
const repoName = process.env.GITHUB_REPO || "recreomassage-hub/flowlogic.shop";
const [owner, repo] = repoName.split("/");

// Проверка подключения
async function checkConnection() {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    console.log(`✅ Агент подключен к: ${data.full_name}`);
    console.log(`   Описание: ${data.description}`);
    console.log(`   Статус: ${data.private ? "Private" : "Public"}`);
  } catch (error) {
    console.error("❌ Ошибка подключения:", error.message);
  }
}

checkConnection();
```

---

## 🔒 Безопасность

### ⚠️ КРИТИЧЕСКИ ВАЖНО

1. **НИКОГДА не коммитьте .env файл:**
   - Убедитесь, что `.env` в `.gitignore`
   - Используйте только `.env.example` как шаблон

2. **Ротация токенов:**
   - Токены должны ротироваться каждые 90 дней
   - См. `docs/security/policies.md` для календаря ротации

3. **Минимальные права:**
   - Используйте только необходимые scopes
   - Не давайте токену больше прав, чем нужно

4. **Хранение токенов:**
   - Локально: `.env` (в .gitignore)
   - CI/CD: GitHub Secrets
   - Production: AWS SSM Parameter Store

---

## 🧪 Тестирование подключения

### Python

```bash
python3 -c "
import os
from github import Github
token = os.getenv('GITHUB_TOKEN')
g = Github(token)
repo = g.get_repo('recreomassage-hub/flowlogic.shop')
print(f'✅ Подключено: {repo.full_name}')
"
```

### Node.js

```bash
node -e "
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
octokit.repos.get({ owner: 'recreomassage-hub', repo: 'flowlogic.shop' })
  .then(({ data }) => console.log('✅ Подключено:', data.full_name))
  .catch(err => console.error('❌ Ошибка:', err.message));
"
```

---

## 📚 Дополнительные ресурсы

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [PyGithub Documentation](https://pygithub.readthedocs.io/)
- [Octokit.js Documentation](https://octokit.github.io/rest.js/)
- [Security Policies](docs/security/policies.md)

---

**Обновлено:** 2025-12-23  
**Версия:** 1.0








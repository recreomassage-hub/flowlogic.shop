# 🌿 Git Workflow для LLM-OS

## ⚠️ ВАЖНО: Почему нельзя работать только с main

Работа только с веткой `main` технически возможна, но чревата серьезными проблемами:

### Основные риски

1. **Нестабильная production-среда**
   - Любой коммит сразу попадает в production
   - Ошибки в разработке ломают работающий продукт
   - Невозможно безопасно тестировать изменения

2. **Низкое качество кода**
   - Нет code review перед слиянием
   - Нет изолированной среды для тестирования
   - Давление "не сломать продакшн" приводит к страху вносить изменения

3. **Проблемы с совместной разработкой**
   - Конфликты при одновременной работе нескольких разработчиков
   - Невозможно параллельно работать над фичами
   - Задержки релизов из-за блокировки main ветки

4. **Отсутствие контроля над релизами**
   - Невозможно отложить выпуск функциональности
   - Нет возможности делать hotfix без риска зацепить неготовый код
   - Нет четкой истории, что было выпущено и когда

---

## 🌿 РЕКОМЕНДУЕМАЯ СТРАТЕГИЯ ВЕТОК

### Вариант 1: Простой (для маленьких команд)

```
main (production)
  ↑
develop (тестирование)
  ↑
feat/{stage} (feature ветки)
```

**Правила:**
- `main` - только production-ready код
- `develop` - интеграционная ветка для тестирования
- `feat/{stage}` - feature ветки для каждого этапа LLM-OS

**Workflow:**
1. Создать feature ветку: `git checkout -b feat/requirements`
2. Работать в feature ветке
3. Коммитить в feature ветку: `./step.sh`
4. После завершения этапа: merge в `develop`
5. После тестирования: merge `develop` → `main`

### Вариант 2: Git Flow (для больших команд)

```
main (production)
  ↑
release/v1.0.0
  ↑
develop (тестирование)
  ↑
feat/{stage} (feature ветки)
  ↑
hotfix/{issue} (hotfix ветки)
```

**Дополнительно:**
- `release/*` - ветки для подготовки релизов
- `hotfix/*` - ветки для срочных исправлений в production

---

## 🔧 НАСТРОЙКА ДЛЯ LLM-OS

### Инициализация develop ветки

```bash
# 1. Создать develop ветку из main
git checkout -b develop
git push -u origin develop

# 2. Настроить develop как default branch (опционально)
# В GitHub: Settings → Branches → Default branch → develop
```

### Обновление step.sh для работы с develop

**Текущее поведение (небезопасно):**
```bash
git push "$REMOTE" main  # Прямой push в main
```

**Рекомендуемое поведение:**
```bash
# Определяем текущую ветку
CURRENT_BRANCH=$(git branch --show-current)

# Если на feature ветке → push в feature ветку
if [[ "$CURRENT_BRANCH" == feat/* ]]; then
    git push "$REMOTE" "$CURRENT_BRANCH"
# Если на develop → push в develop
elif [[ "$CURRENT_BRANCH" == "develop" ]]; then
    git push "$REMOTE" develop
# Если на main → только после явного подтверждения
elif [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo "⚠️ Вы на ветке main. Убедитесь, что это production-ready код!"
    read -p "Продолжить? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        git push "$REMOTE" main
    else
        echo "❌ Push отменен"
    fi
fi
```

---

## 📋 ПРОТОКОЛ РАБОТЫ LLM-OS С ВЕТКАМИ

### 1. Инициализация этапа

```bash
# Создать feature ветку для этапа
git checkout develop
git pull origin develop
git checkout -b feat/requirements

# Обновить WORKFLOW_STATE.md
# current_stage: requirements
# git_branch: feat/requirements
```

### 2. Работа над этапом

```bash
# Работа в Cursor с ролью ANALYST
# Коммиты через ./step.sh (пушит в feat/requirements)
./step.sh
```

### 3. Завершение этапа

```bash
# После завершения этапа и peer-review
git checkout develop
git merge feat/requirements
git push origin develop

# Удалить feature ветку (опционально)
git branch -d feat/requirements
```

### 4. Релиз в production

```bash
# После тестирования в develop
git checkout main
git merge develop
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags
```

---

## 🚨 ЗАЩИТА ВЕТОК (GitHub)

### Настройка branch protection

**Для ветки `main`:**
- ✅ Require pull request reviews (минимум 1)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

**Для ветки `develop`:**
- ✅ Require pull request reviews (опционально)
- ✅ Require status checks to pass
- ⚠️ Allow force pushes (только для админов)

### Настройка через GitHub CLI

```bash
# Защита main ветки
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["ci"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f restrictions=null

# Защита develop ветки
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["ci"]}' \
  -f enforce_admins=false
```

---

## 🔄 АВТОМАТИЗАЦИЯ ДЛЯ LLM-OS

### Скрипт для создания feature ветки

```bash
#!/bin/bash
# scripts/create_feature_branch.sh

STAGE=$1
if [ -z "$STAGE" ]; then
    echo "Использование: ./scripts/create_feature_branch.sh <stage>"
    exit 1
fi

# Переходим на develop
git checkout develop
git pull origin develop

# Создаем feature ветку
BRANCH_NAME="feat/$STAGE"
git checkout -b "$BRANCH_NAME"

# Обновляем WORKFLOW_STATE.md
sed -i "s/git_branch:.*/git_branch: $BRANCH_NAME/" WORKFLOW_STATE.md

echo "✅ Создана ветка: $BRANCH_NAME"
echo "📋 WORKFLOW_STATE.md обновлен"
```

### Скрипт для merge в develop

```bash
#!/bin/bash
# scripts/merge_to_develop.sh

CURRENT_BRANCH=$(git branch --show-current)

if [[ ! "$CURRENT_BRANCH" == feat/* ]]; then
    echo "❌ Вы не на feature ветке"
    exit 1
fi

# Переходим на develop
git checkout develop
git pull origin develop

# Merge feature ветки
git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH into develop"

# Push в develop
git push origin develop

echo "✅ $CURRENT_BRANCH merged into develop"
```

---

## 📊 МОНИТОРИНГ ВЕТОК

### Показать статус веток

```bash
# Список всех веток
git branch -a

# Ветки, которые нужно удалить (merged)
git branch --merged develop | grep feat/

# Ветки с незакоммиченными изменениями
git branch -vv | grep '\[ahead'
```

### Очистка старых веток

```bash
# Удалить merged feature ветки
git branch --merged develop | grep feat/ | xargs git branch -d

# Удалить remote ветки (после локального удаления)
git fetch --prune
```

---

## ✅ ЧЕКЛИСТ ПЕРЕХОДА НА DEVELOP

- [ ] Создать `develop` ветку из `main`
- [ ] Настроить `develop` как default branch (опционально)
- [ ] Обновить `step.sh` для работы с ветками
- [ ] Настроить branch protection для `main` и `develop`
- [ ] Обновить CI/CD для работы с `develop`
- [ ] Обновить документацию (PROJECT_CONFIG.md)
- [ ] Обучить команду новому workflow

---

## 📚 СМ. ТАКЖЕ

- `PROJECT_CONFIG.md` - Протокол работы LLM-OS
- `step.sh` - Атомарный коммит
- `docs/deployment_guide.md` - Deployment workflow

---

**Последнее обновление:** 2025-12-27



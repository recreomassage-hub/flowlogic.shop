#!/bin/bash
# collect/backend-auth.sh - Сбор полного контекста для backend authentication
# Использование: ./scripts/collect/backend-auth.sh > artifacts/PLAN_backend_auth.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/artifacts"
mkdir -p "$OUTPUT_DIR"

OUTPUT_FILE="$OUTPUT_DIR/collected_backend_auth.md"

{
    echo "# 🔍 Собранный контекст: Backend Authentication"
    echo ""
    echo "**Создано:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "**Цель:** Полный контекст для работы с backend authentication"
    echo ""
    echo "---"
    echo ""

    # 1. Архитектура
    echo "## 📐 Архитектура"
    if [ -f "$PROJECT_ROOT/docs/architecture/api_spec.yaml" ]; then
        echo "### API Specification (Auth endpoints)"
        echo '```yaml'
        grep -A 50 "/auth" "$PROJECT_ROOT/docs/architecture/api_spec.yaml" || echo "# Auth endpoints not found"
        echo '```'
        echo ""
    fi
    
    if [ -f "$PROJECT_ROOT/docs/architecture/db_schema.md" ]; then
        echo "### Database Schema (Users/Auth)"
        cat "$PROJECT_ROOT/docs/architecture/db_schema.md" | grep -A 30 -i "user\|auth" || echo "# Auth schema not found"
        echo ""
    fi

    # 2. Текущий код
    echo "## 💻 Текущий код"
    
    # Backend auth routes
    if [ -f "$PROJECT_ROOT/src/backend/api/routes/auth.ts" ]; then
        echo "### Routes: src/backend/api/routes/auth.ts"
        echo '```typescript'
        cat "$PROJECT_ROOT/src/backend/api/routes/auth.ts"
        echo '```'
        echo ""
    fi
    
    # Backend auth controllers
    if [ -f "$PROJECT_ROOT/src/backend/api/controllers/authController.ts" ]; then
        echo "### Controller: src/backend/api/controllers/authController.ts"
        echo '```typescript'
        cat "$PROJECT_ROOT/src/backend/api/controllers/authController.ts"
        echo '```'
        echo ""
    fi
    
    # Auth middleware
    find "$PROJECT_ROOT/src/backend" -name "*auth*" -type f | while read file; do
        if [[ "$file" == *"middleware"* ]] || [[ "$file" == *"auth"* ]]; then
            echo "### $(basename "$file")"
            echo '```typescript'
            cat "$file"
            echo '```'
            echo ""
        fi
    done
    
    # User model
    if [ -f "$PROJECT_ROOT/src/backend/db/models/User.ts" ] || [ -f "$PROJECT_ROOT/src/backend/db/models/user.ts" ]; then
        USER_MODEL=$(find "$PROJECT_ROOT/src/backend/db/models" -iname "*user*" -type f | head -1)
        if [ -n "$USER_MODEL" ]; then
            echo "### User Model: $USER_MODEL"
            echo '```typescript'
            cat "$USER_MODEL"
            echo '```'
            echo ""
        fi
    fi

    # 3. Конфигурация
    echo "## ⚙️ Конфигурация"
    if [ -f "$PROJECT_ROOT/src/backend/config/cognito.ts" ]; then
        echo "### Cognito Config"
        echo '```typescript'
        cat "$PROJECT_ROOT/src/backend/config/cognito.ts"
        echo '```'
        echo ""
    fi
    
    if [ -f "$PROJECT_ROOT/src/backend/.env.example" ]; then
        echo "### Environment Variables"
        echo '```bash'
        grep -i "auth\|cognito\|jwt\|token" "$PROJECT_ROOT/src/backend/.env.example" || echo "# No auth env vars"
        echo '```'
        echo ""
    fi

    # 4. Тесты
    echo "## 🧪 Тесты"
    find "$PROJECT_ROOT/tests" -name "*auth*" -type f | while read file; do
        echo "### $(basename "$file")"
        echo '```typescript'
        cat "$file"
        echo '```'
        echo ""
    done

    # 5. Документация
    echo "## 📚 Документация"
    if [ -f "$PROJECT_ROOT/docs/api_documentation.md" ]; then
        echo "### API Documentation (Auth section)"
        grep -A 100 -i "authentication\|auth" "$PROJECT_ROOT/docs/api_documentation.md" | head -50 || echo "# Auth docs not found"
        echo ""
    fi

    # 6. Security
    echo "## 🛡️ Security"
    if [ -f "$PROJECT_ROOT/docs/security/threat_model.md" ]; then
        echo "### Threat Model (Auth-related)"
        grep -A 30 -i "auth\|authentication\|token\|jwt" "$PROJECT_ROOT/docs/security/threat_model.md" || echo "# Auth threats not found"
        echo ""
    fi

    echo "---"
    echo "**Конец собранного контекста**"
} > "$OUTPUT_FILE"

echo "✅ Контекст собран: $OUTPUT_FILE"
cat "$OUTPUT_FILE"


#!/bin/bash
# collect/frontend-ui.sh - Сбор полного контекста для frontend UI
# Использование: ./scripts/collect/frontend-ui.sh > artifacts/PLAN_frontend_ui.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/artifacts"
mkdir -p "$OUTPUT_DIR"

OUTPUT_FILE="$OUTPUT_DIR/collected_frontend_ui.md"

{
    echo "# 🔍 Собранный контекст: Frontend UI"
    echo ""
    echo "**Создано:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "**Цель:** Полный контекст для работы с frontend UI"
    echo ""
    echo "---"
    echo ""

    # 1. Архитектура
    echo "## 📐 Архитектура"
    if [ -f "$PROJECT_ROOT/docs/architecture/c4_diagrams.md" ]; then
        echo "### C4 Diagrams (Frontend)"
        grep -A 50 -i "frontend\|ui\|spa" "$PROJECT_ROOT/docs/architecture/c4_diagrams.md" || echo "# Frontend diagrams not found"
        echo ""
    fi
    
    if [ -f "$PROJECT_ROOT/docs/architecture/tech_stack.md" ]; then
        echo "### Tech Stack (Frontend)"
        grep -A 30 -i "frontend\|react\|ui" "$PROJECT_ROOT/docs/architecture/tech_stack.md" || echo "# Frontend stack not found"
        echo ""
    fi

    # 2. Текущий код
    echo "## 💻 Текущий код"
    
    # App structure
    if [ -f "$PROJECT_ROOT/src/frontend/src/App.tsx" ]; then
        echo "### App.tsx"
        echo '```typescript'
        cat "$PROJECT_ROOT/src/frontend/src/App.tsx"
        echo '```'
        echo ""
    fi
    
    # Pages
    if [ -d "$PROJECT_ROOT/src/frontend/src/pages" ]; then
        echo "### Pages"
        find "$PROJECT_ROOT/src/frontend/src/pages" -name "*.tsx" -o -name "*.ts" | while read file; do
            echo "#### $(basename "$file")"
            echo '```typescript'
            cat "$file"
            echo '```'
            echo ""
        done
    fi
    
    # Components
    if [ -d "$PROJECT_ROOT/src/frontend/src/components" ]; then
        echo "### Components"
        find "$PROJECT_ROOT/src/frontend/src/components" -name "*.tsx" -o -name "*.ts" | while read file; do
            echo "#### $(basename "$file")"
            echo '```typescript'
            cat "$file"
            echo '```'
            echo ""
        done
    fi
    
    # Store/State
    if [ -d "$PROJECT_ROOT/src/frontend/src/store" ]; then
        echo "### State Management"
        find "$PROJECT_ROOT/src/frontend/src/store" -name "*.ts" | while read file; do
            echo "#### $(basename "$file")"
            echo '```typescript'
            cat "$file"
            echo '```'
            echo ""
        done
    fi
    
    # API client
    if [ -d "$PROJECT_ROOT/src/frontend/src/api" ]; then
        echo "### API Client"
        find "$PROJECT_ROOT/src/frontend/src/api" -name "*.ts" | while read file; do
            echo "#### $(basename "$file")"
            echo '```typescript'
            cat "$file"
            echo '```'
            echo ""
        done
    fi

    # 3. Конфигурация
    echo "## ⚙️ Конфигурация"
    if [ -f "$PROJECT_ROOT/src/frontend/package.json" ]; then
        echo "### package.json"
        echo '```json'
        cat "$PROJECT_ROOT/src/frontend/package.json"
        echo '```'
        echo ""
    fi
    
    if [ -f "$PROJECT_ROOT/src/frontend/tsconfig.json" ]; then
        echo "### tsconfig.json"
        echo '```json'
        cat "$PROJECT_ROOT/src/frontend/tsconfig.json"
        echo '```'
        echo ""
    fi
    
    if [ -f "$PROJECT_ROOT/src/frontend/tailwind.config.js" ] || [ -f "$PROJECT_ROOT/src/frontend/tailwind.config.ts" ]; then
        TAILWIND_CONFIG=$(find "$PROJECT_ROOT/src/frontend" -name "tailwind.config.*" | head -1)
        echo "### Tailwind Config"
        echo '```javascript'
        cat "$TAILWIND_CONFIG"
        echo '```'
        echo ""
    fi

    # 4. Стили
    echo "## 🎨 Стили"
    if [ -d "$PROJECT_ROOT/src/frontend/src/styles" ]; then
        find "$PROJECT_ROOT/src/frontend/src/styles" -name "*.css" -o -name "*.scss" | while read file; do
            echo "### $(basename "$file")"
            echo '```css'
            cat "$file"
            echo '```'
            echo ""
        done
    fi

    # 5. Документация
    echo "## 📚 Документация"
    if [ -f "$PROJECT_ROOT/docs/user_manual.md" ]; then
        echo "### User Manual (UI-related)"
        grep -A 50 -i "interface\|ui\|page\|screen" "$PROJECT_ROOT/docs/user_manual.md" | head -50 || echo "# UI docs not found"
        echo ""
    fi

    echo "---"
    echo "**Конец собранного контекста**"
} > "$OUTPUT_FILE"

echo "✅ Контекст собран: $OUTPUT_FILE"
cat "$OUTPUT_FILE"





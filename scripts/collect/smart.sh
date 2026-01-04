#!/bin/bash
# collect/smart.sh - Умный сбор контекста по ключевым словам
# Использование: ./scripts/collect/smart.sh keyword1 keyword2 > artifacts/collected_keyword1_keyword2.md

set -e

if [ $# -eq 0 ]; then
    echo "❌ Укажите ключевые слова для поиска"
    echo "Использование: ./scripts/collect/smart.sh keyword1 keyword2 ..."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/artifacts"
mkdir -p "$OUTPUT_DIR"

KEYWORDS="$*"
KEYWORDS_SLUG=$(echo "$KEYWORDS" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
OUTPUT_FILE="$OUTPUT_DIR/collected_${KEYWORDS_SLUG}.md"

{
    echo "# 🔍 Собранный контекст: $KEYWORDS"
    echo ""
    echo "**Создано:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "**Ключевые слова:** $KEYWORDS"
    echo ""
    echo "---"
    echo ""

    # Поиск по всем файлам проекта
    echo "## 📁 Найденные файлы"
    
    # Код
    echo "### 💻 Код"
    for keyword in $KEYWORDS; do
        echo "#### Поиск: $keyword"
        echo ""
        
        # Backend
        find "$PROJECT_ROOT/src/backend" -type f \( -name "*.ts" -o -name "*.js" \) 2>/dev/null | while read file; do
            if grep -qi "$keyword" "$file" 2>/dev/null; then
                echo "**$file**"
                echo '```typescript'
                grep -i "$keyword" "$file" -A 5 -B 5 || cat "$file"
                echo '```'
                echo ""
            fi
        done
        
        # Frontend
        find "$PROJECT_ROOT/src/frontend" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | while read file; do
            if grep -qi "$keyword" "$file" 2>/dev/null; then
                echo "**$file**"
                echo '```typescript'
                grep -i "$keyword" "$file" -A 5 -B 5 || cat "$file"
                echo '```'
                echo ""
            fi
        done
    done

    # Документация
    echo "### 📚 Документация"
    for keyword in $KEYWORDS; do
        find "$PROJECT_ROOT/docs" -type f -name "*.md" 2>/dev/null | while read file; do
            if grep -qi "$keyword" "$file" 2>/dev/null; then
                echo "**$file**"
                echo ""
                grep -i "$keyword" "$file" -A 10 -B 5 || cat "$file"
                echo ""
            fi
        done
    done

    # Конфигурация
    echo "### ⚙️ Конфигурация"
    for keyword in $KEYWORDS; do
        find "$PROJECT_ROOT" -type f \( -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.env*" \) 2>/dev/null | while read file; do
            if grep -qi "$keyword" "$file" 2>/dev/null; then
                echo "**$file**"
                echo '```'
                cat "$file"
                echo '```'
                echo ""
            fi
        done
    done

    echo "---"
    echo "**Конец собранного контекста**"
} > "$OUTPUT_FILE"

echo "✅ Контекст собран: $OUTPUT_FILE"
wc -l "$OUTPUT_FILE"
echo ""
echo "📄 Первые 50 строк:"
head -50 "$OUTPUT_FILE"


#!/bin/bash

# 🚨 INCIDENT DETECTOR - Автоматическое обнаружение инцидентов
# Использование: ./scripts/incident_detector.sh [check|trigger]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

ACTION="${1:-check}"

case "$ACTION" in
    "check")
        echo "🚨 INCIDENT DETECTOR: Проверка на инциденты"
        echo ""
        
        INCIDENT_FOUND=0
        INCIDENT_TYPE=""
        
        # Проверка 1: Deploy failure в GitHub Actions
        if [ -f ".github/workflows/ci-cd.yml" ]; then
            # Проверяем последний workflow run (если есть API доступ)
            # Для простоты проверяем локальные логи
            echo "📋 Проверка: Deploy failures"
            echo "   (Требуется проверка GitHub Actions вручную)"
        fi
        
        # Проверка 2: Ошибки в коде (build failures)
        if [ -d "src/backend" ]; then
            echo "📋 Проверка: Build errors"
            if ! cd src/backend && npm run build > /dev/null 2>&1; then
                INCIDENT_FOUND=1
                INCIDENT_TYPE="BUILD_FAILURE"
                echo "   ❌ Build failed"
            else
                echo "   ✅ Build successful"
            fi
            cd "$PROJECT_ROOT"
        fi
        
        # Проверка 3: Критические ошибки в логах
        echo "📋 Проверка: Critical errors"
        # Здесь можно добавить проверку логов
        
        if [ $INCIDENT_FOUND -eq 1 ]; then
            echo ""
            echo "🚨 ИНЦИДЕНТ ОБНАРУЖЕН: $INCIDENT_TYPE"
            echo ""
            echo "📋 Автоматический переход к INCIDENT_RECOVERY..."
            ./scripts/scenario_engine.sh set INCIDENT_RECOVERY FREEZE
            echo ""
            echo "✅ Сценарий изменен. Запустите: ./llmos run"
        else
            echo ""
            echo "✅ Инциденты не обнаружены"
        fi
        ;;
    
    "trigger")
        INCIDENT_TYPE="${2:-MANUAL}"
        echo "🚨 INCIDENT DETECTOR: Ручной триггер инцидента"
        echo "   Тип: $INCIDENT_TYPE"
        echo ""
        
        ./scripts/scenario_engine.sh set INCIDENT_RECOVERY FREEZE
        echo ""
        echo "✅ Переход к INCIDENT_RECOVERY выполнен"
        echo "   Запустите: ./llmos run"
        ;;
    
    *)
        echo "Использование: ./scripts/incident_detector.sh [check|trigger] [type]"
        echo ""
        echo "Команды:"
        echo "  check   - Проверить на инциденты"
        echo "  trigger - Ручной триггер инцидента"
        ;;
esac


#!/bin/bash

# 🎛️ SCENARIO ENGINE - Автомат для выполнения сценариев
# Использование: ./scripts/scenario_engine.sh [action] [args...]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

SCENARIO_STATE="SCENARIO_STATE.yml"
SCENARIOS_DIR="scenarios"

# Функция для чтения YAML (простая версия)
get_scenario_value() {
    local key="$1"
    grep -E "^${key}:" "$SCENARIO_STATE" 2>/dev/null | head -1 | cut -d: -f2 | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | sed 's/#.*$//' | sed 's/^"\(.*\)"$/\1/' || echo ""
}

# Функция для обновления YAML (простая версия)
update_scenario_value() {
    local key="$1"
    local value="$2"
    if grep -q "^${key}:" "$SCENARIO_STATE" 2>/dev/null; then
        sed -i "s|^${key}:.*|${key}: ${value}|" "$SCENARIO_STATE"
    else
        echo "${key}: ${value}" >> "$SCENARIO_STATE"
    fi
}

# Функция для чтения значения из YAML файла сценария (упрощенная)
read_scenario_yaml_value() {
    local scenario_file="$1"
    local phase="$2"
    local key="$3"
    
    if [ ! -f "$scenario_file" ]; then
        return 1
    fi
    
    # Ищем секцию phases -> phase
    local in_phase=false
    local phase_found=false
    
    while IFS= read -r line; do
        # Убираем комментарии
        line=$(echo "$line" | sed 's/#.*$//')
        
        # Проверяем, входим ли в нужную фазу
        if echo "$line" | grep -qE "^[[:space:]]*${phase}:"; then
            in_phase=true
            phase_found=true
            continue
        fi
        
        # Если вышли из фазы (новый ключ верхнего уровня или другая фаза)
        if [ "$in_phase" = true ]; then
            if echo "$line" | grep -qE "^[[:space:]]*[a-zA-Z_]+:" && ! echo "$line" | grep -qE "^[[:space:]]*${phase}:"; then
                local line_indent=$(echo "$line" | sed 's/^\([[:space:]]*\).*/\1/' | wc -c)
                line_indent=$((line_indent - 1))
                if [ "$line_indent" -le 2 ]; then
                    in_phase=false
                    continue
                fi
            fi
        fi
        
        # Если в нужной фазе, ищем ключ
        if [ "$in_phase" = true ]; then
            if echo "$line" | grep -qE "^[[:space:]]*${key}:"; then
                # Извлекаем значение
                local value=$(echo "$line" | sed "s/^[[:space:]]*${key}:[[:space:]]*//" | sed 's/^"\(.*\)"$/\1/')
                echo "$value"
                return 0
            fi
        fi
    done < "$scenario_file"
    
    return 1
}

# Функция для чтения списка из YAML (allowed_actions, auto_scripts)
read_scenario_yaml_list() {
    local scenario_file="$1"
    local phase="$2"
    local key="$3"
    
    if [ ! -f "$scenario_file" ]; then
        return 1
    fi
    
    local in_phase=false
    local in_list=false
    local result=""
    
    while IFS= read -r line; do
        # Убираем комментарии
        line=$(echo "$line" | sed 's/#.*$//')
        
        # Проверяем, входим ли в нужную фазу
        if echo "$line" | grep -qE "^[[:space:]]*${phase}:"; then
            in_phase=true
            continue
        fi
        
        # Если вышли из фазы
        if [ "$in_phase" = true ]; then
            if echo "$line" | grep -qE "^[[:space:]]*[a-zA-Z_]+:" && ! echo "$line" | grep -qE "^[[:space:]]*${phase}:"; then
                local line_indent=$(echo "$line" | sed 's/^\([[:space:]]*\).*/\1/' | wc -c)
                line_indent=$((line_indent - 1))
                if [ "$line_indent" -le 2 ]; then
                    break
                fi
            fi
        fi
        
        # Если в нужной фазе
        if [ "$in_phase" = true ]; then
            # Нашли ключ списка
            if echo "$line" | grep -qE "^[[:space:]]*${key}:"; then
                in_list=true
                continue
            fi
            
            # Если в списке, собираем элементы
            if [ "$in_list" = true ]; then
                if echo "$line" | grep -qE "^[[:space:]]*-"; then
                    local item=$(echo "$line" | sed 's/^[[:space:]]*-[[:space:]]*//' | sed 's/^"\(.*\)"$/\1/')
                    if [ -z "$result" ]; then
                        result="$item"
                    else
                        result="$result
$item"
                    fi
                else
                    # Конец списка
                    break
                fi
            fi
        fi
    done < "$scenario_file"
    
    if [ -n "$result" ]; then
        echo "$result"
        return 0
    fi
    
    return 1
}

# Функция для получения информации о фазе из YAML (использует Python если доступен)
get_phase_info() {
    local scenario="$1"
    local phase="$2"
    local key="$3"
    
    local scenario_file="${SCENARIOS_DIR}/${scenario}.yml"
    
    if [ ! -f "$scenario_file" ]; then
        return 1
    fi
    
    # Пробуем использовать Python (более надежно)
    if command -v python3 >/dev/null 2>&1; then
        python3 <<EOF 2>/dev/null
import yaml
import sys

try:
    with open('$scenario_file', 'r') as f:
        data = yaml.safe_load(f)
        phase_data = data.get('phases', {}).get('$phase', {})
        
        if '$key' == 'allowed_actions' or '$key' == 'auto_scripts':
            items = phase_data.get('$key', [])
            for item in items:
                print(item)
        else:
            value = phase_data.get('$key', '')
            if value:
                print(value)
except Exception as e:
    sys.exit(1)
EOF
        return $?
    fi
    
    # Fallback на простой парсинг
    if [ "$key" = "allowed_actions" ] || [ "$key" = "auto_scripts" ]; then
        read_scenario_yaml_list "$scenario_file" "$phase" "$key"
    else
        read_scenario_yaml_value "$scenario_file" "$phase" "$key"
    fi
}

# Функция для добавления перехода
add_transition() {
    local from="$1"
    local to="$2"
    local phase="$3"
    local trigger="$4"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Простое добавление в YAML
    if ! grep -q "^transitions:" "$SCENARIO_STATE" 2>/dev/null; then
        echo "" >> "$SCENARIO_STATE"
        echo "transitions:" >> "$SCENARIO_STATE"
    fi
}

# Получаем текущее состояние
CURRENT_SCENARIO=$(get_scenario_value "current_scenario")
CURRENT_PHASE=$(get_scenario_value "phase")
CURRENT_STATUS=$(get_scenario_value "status")

ACTION="${1:-run}"

case "$ACTION" in
    "run")
        echo "🎛️ SCENARIO ENGINE: Выполнение сценария"
        echo "   Сценарий: $CURRENT_SCENARIO"
        echo "   Фаза: $CURRENT_PHASE"
        echo "   Статус: $CURRENT_STATUS"
        echo ""
        
        # Получаем информацию о фазе из YAML
        PHASE_DESC=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "description" 2>/dev/null || echo "")
        ALLOWED_ACTIONS=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "allowed_actions" 2>/dev/null || echo "")
        AUTO_SCRIPTS=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "auto_scripts" 2>/dev/null || echo "")
        ACTIVE_ROLE=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "active_role" 2>/dev/null || echo "")
        NEXT_PHASE=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "next_phase" 2>/dev/null || echo "null")
        
        if [ -n "$PHASE_DESC" ]; then
            echo "📋 Описание: $PHASE_DESC"
            echo ""
        fi
        
        if [ -n "$ACTIVE_ROLE" ]; then
            echo "👤 Активная роль: $ACTIVE_ROLE"
            echo ""
        fi
        
        if [ -n "$ALLOWED_ACTIONS" ]; then
            echo "✅ Разрешенные действия:"
            echo "$ALLOWED_ACTIONS" | while IFS= read -r action; do
                if [ -n "$action" ]; then
                    echo "   - $action"
                fi
            done
            echo ""
        else
            echo "⚠️  Разрешенные действия не найдены для фазы $CURRENT_PHASE"
            echo "   Проверьте файл: ${SCENARIOS_DIR}/${CURRENT_SCENARIO}.yml"
            echo ""
        fi
        
        if [ -n "$AUTO_SCRIPTS" ]; then
            echo "🔧 Автодействия:"
            echo "$AUTO_SCRIPTS" | while IFS= read -r script; do
                if [ -n "$script" ]; then
                    echo "   - $script"
                fi
            done
            echo ""
        fi
        
        if [ "$NEXT_PHASE" != "null" ] && [ -n "$NEXT_PHASE" ]; then
            echo "➡️  Следующая фаза: $NEXT_PHASE"
            echo ""
        else
            echo "🏁 Фаза завершает сценарий"
            echo ""
        fi
        
        echo "🔒 Ограничения агентов:"
        echo "   ❌ Не могут менять сценарий"
        echo "   ❌ Не могут менять фазу"
        echo "   ❌ Не могут запускать скрипты"
        echo "   ✅ Могут только выполнять разрешенные действия"
        ;;
    
    "execute")
        # Автоматическое выполнение фазы
        echo "▶️  Выполнение фазы: $CURRENT_SCENARIO:$CURRENT_PHASE"
        echo ""
        
        # Получаем auto_scripts
        AUTO_SCRIPTS=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "auto_scripts" 2>/dev/null || echo "")
        
        if [ -n "$AUTO_SCRIPTS" ]; then
            echo "$AUTO_SCRIPTS" | while IFS= read -r script; do
                if [ -n "$script" ] && [ -f "$script" ]; then
                    echo "▶ executing $script"
                    bash "$script" || {
                        echo "❌ Ошибка выполнения: $script"
                        exit 1
                    }
                    echo "✔ $(basename $script) completed"
                    echo ""
                elif [ -n "$script" ]; then
                    echo "⚠️  Скрипт не найден: $script"
                fi
            done
        fi
        
        # Получаем next_phase
        NEXT_PHASE=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "next_phase" 2>/dev/null || echo "null")
        
        if [ "$NEXT_PHASE" != "null" ] && [ -n "$NEXT_PHASE" ]; then
            echo "→ phase transitioned: $NEXT_PHASE"
            update_scenario_value "phase" "$NEXT_PHASE"
            update_scenario_value "last_update" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        else
            echo "→ scenario completed"
            update_scenario_value "status" "COMPLETED"
        fi
        
        # Коммит через step.sh
        if [ -f "step.sh" ]; then
            echo ""
            echo "💾 Фиксация изменений..."
            ./step.sh || echo "⚠️  step.sh не выполнен (возможно, нет изменений)"
        fi
        ;;
    
    "status")
        echo "📊 SCENARIO STATUS:"
        echo "   Сценарий: $CURRENT_SCENARIO"
        echo "   Фаза: $CURRENT_PHASE"
        echo "   Статус: $CURRENT_STATUS"
        echo ""
        
        # Получаем информацию о фазе
        ALLOWED_ACTIONS=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "allowed_actions" 2>/dev/null || echo "")
        AUTO_SCRIPTS=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "auto_scripts" 2>/dev/null || echo "")
        ACTIVE_ROLE=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "active_role" 2>/dev/null || echo "")
        
        if [ -n "$ALLOWED_ACTIONS" ]; then
            echo "📋 Разрешенные действия:"
            echo "$ALLOWED_ACTIONS" | while IFS= read -r action; do
                if [ -n "$action" ]; then
                    echo "   - $action"
                fi
            done
        else
            echo "📋 Разрешенные действия:"
            echo "   - (не определены)"
        fi
        
        if [ -n "$AUTO_SCRIPTS" ]; then
            echo ""
            echo "🔧 Автодействия:"
            echo "$AUTO_SCRIPTS" | while IFS= read -r script; do
                if [ -n "$script" ]; then
                    echo "   - $script"
                fi
            done
        fi
        
        if [ -n "$ACTIVE_ROLE" ]; then
            echo ""
            echo "👤 Активная роль: $ACTIVE_ROLE"
        fi
        
        echo ""
        echo "🔒 Ограничения агентов:"
        echo "   Может менять сценарий: НЕТ"
        echo "   Может менять фазу: НЕТ"
        echo "   Может запускать скрипты: НЕТ"
        ;;
    
    "set")
        SCENARIO="${2}"
        PHASE="${3:-}"
        
        if [ -z "$SCENARIO" ]; then
            echo "❌ Укажите сценарий"
            echo "Использование: ./scripts/scenario_engine.sh set <SCENARIO> [PHASE]"
            exit 1
        fi
        
        # Проверяем существование файла сценария
        if [ ! -f "${SCENARIOS_DIR}/${SCENARIO}.yml" ]; then
            echo "❌ Файл сценария не найден: ${SCENARIOS_DIR}/${SCENARIO}.yml"
            exit 1
        fi
        
        # Валидация сценария
        case "$SCENARIO" in
            PROJECT_BOOTSTRAP|FEATURE_DEVELOPMENT|DEPLOYMENT|INCIDENT_RECOVERY|QUALITY_GATE|ROLLBACK|MAINTENANCE)
                update_scenario_value "current_scenario" "$SCENARIO"
                if [ -n "$PHASE" ]; then
                    update_scenario_value "phase" "$PHASE"
                fi
                update_scenario_value "status" "IN_PROGRESS"
                update_scenario_value "last_update" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
                echo "✅ Сценарий изменен: $SCENARIO"
                echo "   Фаза: ${PHASE:-$CURRENT_PHASE}"
                ;;
            *)
                echo "❌ Неизвестный сценарий: $SCENARIO"
                echo "Доступные: PROJECT_BOOTSTRAP, FEATURE_DEVELOPMENT, DEPLOYMENT, INCIDENT_RECOVERY, QUALITY_GATE, ROLLBACK, MAINTENANCE"
                exit 1
                ;;
        esac
        ;;
    
    "next-phase")
        # Получаем next_phase из YAML
        NEXT_PHASE=$(get_phase_info "$CURRENT_SCENARIO" "$CURRENT_PHASE" "next_phase" 2>/dev/null || echo "null")
        
        if [ "$NEXT_PHASE" != "null" ] && [ -n "$NEXT_PHASE" ]; then
            update_scenario_value "phase" "$NEXT_PHASE"
            update_scenario_value "last_update" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
            echo "✅ Переход к следующей фазе: $NEXT_PHASE"
        else
            echo "⚠️  Следующая фаза не определена или сценарий завершен"
            update_scenario_value "status" "COMPLETED"
        fi
        ;;
    
    *)
        echo "Использование: ./scripts/scenario_engine.sh [run|execute|status|set|next-phase]"
        echo ""
        echo "Команды:"
        echo "  run         - Показать информацию о текущей фазе"
        echo "  execute     - Выполнить автодействия фазы и перейти к следующей"
        echo "  status      - Показать статус"
        echo "  set <S> [P] - Установить сценарий и фазу (только для системных событий)"
        echo "  next-phase  - Перейти к следующей фазе"
        ;;
esac

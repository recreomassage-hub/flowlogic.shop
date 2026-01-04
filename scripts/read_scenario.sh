#!/bin/bash
# read_scenario.sh - Чтение конфигурации сценария из SCENARIOS/*.yml

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Получаем выбранный сценарий из PROJECT_CONFIG.md
get_scenario_name() {
    grep -E "^\\*\\*Выбранный сценарий:\\*\\*" "$PROJECT_ROOT/PROJECT_CONFIG.md" 2>/dev/null | \
        sed 's/\*\*Выбранный сценарий:\*\* //' | \
        sed 's/`//g' | \
        sed 's/ (.*//' | \
        sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || \
        echo "saas_mvp"  # По умолчанию
}

# Проверяем, включена ли роль в сценарии
is_role_enabled() {
    local role="$1"
    local scenario_name=$(get_scenario_name)
    local scenario_file="$PROJECT_ROOT/SCENARIOS/${scenario_name}.yml"
    
    if [ ! -f "$scenario_file" ]; then
        # Если файл сценария не найден, считаем роль включенной (fallback)
        return 0
    fi
    
    # Проверяем, есть ли роль в списке roles
    if grep -qE "^- ${role}$" "$scenario_file" 2>/dev/null; then
        return 0  # Роль включена
    fi
    
    # Проверяем, есть ли роль в списке skip_roles
    if grep -qE "^- ${role}$" "$scenario_file" 2>/dev/null | grep -A 20 "skip_roles:" | grep -qE "^- ${role}$"; then
        return 1  # Роль пропущена
    fi
    
    # Если сценарий не найден или роль не указана, считаем включенной
    return 0
}

# Получаем глубину проработки для роли
get_role_depth() {
    local role="$1"
    local depth_key="$2"  # Например, "requirements", "c4_diagrams"
    local scenario_name=$(get_scenario_name)
    local scenario_file="$PROJECT_ROOT/SCENARIOS/${scenario_name}.yml"
    
    if [ ! -f "$scenario_file" ]; then
        echo "full"  # По умолчанию
        return
    fi
    
    # Используем Python для парсинга YAML (если доступен)
    if command -v python3 &> /dev/null; then
        python3 -c "
import yaml
import sys
try:
    with open('$scenario_file', 'r') as f:
        data = yaml.safe_load(f)
    depth = data.get('depth', {})
    role_depth = depth.get('$role', {})
    value = role_depth.get('$depth_key', 'full')
    print(value)
except Exception as e:
    print('full')
" 2>/dev/null || echo "full"
    else
        # Fallback: ищем в файле
        grep -A 50 "^  ${role}:" "$scenario_file" 2>/dev/null | \
            grep "    ${depth_key}:" | \
            cut -d: -f2 | \
            sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || \
            echo "full"
    fi
}

# Главная функция
case "$1" in
    "name")
        get_scenario_name
        ;;
    "enabled")
        is_role_enabled "$2" && echo "true" || echo "false"
        ;;
    "depth")
        get_role_depth "$2" "$3"
        ;;
    *)
        echo "Использование: $0 [name|enabled|depth] [role] [depth_key]"
        exit 1
        ;;
esac



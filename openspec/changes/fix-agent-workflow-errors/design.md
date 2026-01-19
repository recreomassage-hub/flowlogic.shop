# Design: Agent Workflow Error Handling

## Architecture

### Error Handling Strategy

#### 1. Temporary File Cleanup

**Approach:** Использовать `trap` для гарантированного cleanup при любом завершении скрипта.

**Implementation:**
```bash
# В начале скрипта
TEMP_INVENTORY="/tmp/inventory-$$.json"
TEMP_CLASSIFIED="/tmp/classified-$$.json"

# Trap для cleanup
cleanup() {
    rm -f "$TEMP_INVENTORY" "$TEMP_CLASSIFIED"
}
trap cleanup EXIT INT TERM
```

**Rationale:**
- `trap` гарантирует cleanup даже при прерывании (Ctrl+C) или ошибке
- Использование `$$` для уникальности файлов предотвращает конфликты
- Явная функция cleanup улучшает читаемость

#### 2. JSON Validation

**Approach:** Валидировать JSON перед парсингом, обрабатывать ошибки gracefully.

**Implementation:**
```bash
validate_json() {
    local file="$1"
    if [ ! -f "$file" ] || [ ! -s "$file" ]; then
        return 1
    fi
    jq empty "$file" 2>/dev/null
}

if ! validate_json "$TEMP_CLASSIFIED"; then
    echo "⚠️  Invalid or empty JSON, using defaults"
    VIOLATIONS=0
else
    VIOLATIONS=$(jq -r '.violations | length // 0' "$TEMP_CLASSIFIED")
fi
```

**Rationale:**
- Предотвращает падение скрипта на невалидном JSON
- Graceful degradation с логированием
- Fallback значения обеспечивают продолжение работы

#### 3. Null Value Handling

**Approach:** Использовать jq оператор `//` для fallback значений.

**Implementation:**
```bash
# Числовые значения
VIOLATIONS=$(jq -r '.violations | length // 0' "$file" 2>/dev/null || echo "0")

# Строковые значения
ENV=$(jq -r '.env // "unknown"' "$file" 2>/dev/null || echo "unknown")
```

**Rationale:**
- `//` оператор jq предоставляет fallback
- Дополнительный `|| echo` обрабатывает ошибки jq
- Предотвращает ошибки в арифметических операциях

#### 4. Parameter Passing

**Approach:** Явная передача всех параметров между скриптами.

**Implementation:**
```bash
# В bug-hunter.sh
INFRA_CHECK_OUTPUT=$("$SCRIPT_DIR/infrastructure-compliance-check.sh" \
    --dry-run \
    --region "$REGION" \
    2>&1)
```

**Rationale:**
- Явность лучше неявности
- Легче отлаживать и поддерживать
- Предотвращает ошибки из-за неявных значений по умолчанию

#### 5. Timeout Handling

**Approach:** Добавить таймауты для долгих AWS CLI операций.

**Implementation:**
```bash
# Проверка наличия timeout команды
if command -v timeout &> /dev/null; then
    AWS_OUTPUT=$(timeout 300 aws resourcegroupstaggingapi get-resources ...)
else
    AWS_OUTPUT=$(aws resourcegroupstaggingapi get-resources ...)
fi
```

**Rationale:**
- Предотвращает зависания скриптов
- 300 секунд достаточно для большинства операций
- Fallback для систем без timeout команды

## Trade-offs

### Trap vs Explicit Cleanup

**Trap:**
- ✅ Гарантированный cleanup при любом завершении
- ✅ Меньше кода (один раз в начале)
- ❌ Может скрыть ошибки (файлы удаляются даже при ошибке)

**Explicit Cleanup:**
- ✅ Явный контроль над cleanup
- ✅ Можно сохранить файлы при ошибке для отладки
- ❌ Легко забыть добавить cleanup
- ❌ Не сработает при прерывании

**Decision:** Использовать trap + explicit cleanup в конце для баланса.

### Strict Error Handling vs Graceful Degradation

**Strict:**
- ✅ Быстрое обнаружение проблем
- ❌ Может прервать workflow из-за временных проблем

**Graceful:**
- ✅ Workflow продолжается даже при частичных ошибках
- ✅ Лучше для production
- ❌ Может скрыть реальные проблемы

**Decision:** Graceful degradation с логированием для production stability.

## Dependencies

- `jq` должен быть установлен (уже проверяется в скриптах)
- `timeout` команда желательна, но не обязательна (fallback без таймаута)
- Bash 4+ для поддержки trap (стандарт для современных систем)

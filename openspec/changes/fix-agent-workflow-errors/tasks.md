# Implementation Tasks

## 1. Infrastructure Compliance Check Fixes

- [x] 1.1 Добавить trap для cleanup временных файлов в начале скрипта
  - `trap 'rm -f "$TEMP_INVENTORY" "$TEMP_CLASSIFIED"' EXIT INT TERM`
- [x] 1.2 Добавить проверку существования файлов перед использованием jq
  - `if [ -f "$TEMP_CLASSIFIED" ] && [ -s "$TEMP_CLASSIFIED" ]; then ...`
- [x] 1.3 Обработать null значения из jq с fallback на "0"
  - `VIOLATIONS=$(jq -r '.violations | length // 0' "$TEMP_CLASSIFIED" 2>/dev/null || echo "0")`
- [x] 1.4 Добавить валидацию JSON перед парсингом
  - `if ! jq empty "$TEMP_CLASSIFIED" 2>/dev/null; then echo "Invalid JSON"; exit 1; fi`
- [x] 1.5 Добавить проверку наличия aws-inventory-scan.sh перед вызовом
  - `if [ ! -f "$SCRIPT_DIR/aws-inventory-scan.sh" ]; then ...`
- [x] 1.6 Добавить таймауты для AWS CLI команд (300 секунд)
  - `timeout 300 aws resourcegroupstaggingapi get-resources ...`

## 2. Bug Hunter Integration Fixes

- [x] 2.1 Передавать параметр --dry-run в infrastructure-compliance-check.sh
  - Изменить строку 202: добавить `--dry-run` в вызов
- [x] 2.2 Исправить подсчет violations (использовать данные из JSON, а не grep)
  - Получать количество из classification файла напрямую через jq
- [x] 2.3 Добавить обработку ошибок при вызове infrastructure-compliance-check.sh
  - Улучшить логирование ошибок

## 3. AWS Inventory Scan Fixes

- [ ] 3.1 Добавить cleanup временных файлов (если используются)
  - Проверить использование временных файлов в скрипте
- [ ] 3.2 Добавить валидацию JSON перед сохранением
  - `if ! jq empty <<< "$inventory_json" 2>/dev/null; then ...`
- [ ] 3.3 Добавить таймауты для AWS CLI команд
  - `timeout 300 aws resourcegroupstaggingapi get-resources ...`

## 4. Common Error Handling Utilities

- [x] 4.1 Создать функцию validate_json() для валидации JSON файлов
  - `validate_json() { jq empty "$1" 2>/dev/null; }`
- [x] 4.2 Создать функцию safe_jq() для безопасного парсинга с fallback
  - `safe_jq() { jq -r "$1 // \"$2\"" "$3" 2>/dev/null || echo "$2"; }`
- [x] 4.3 Создать функцию cleanup_temp_files() для универсального cleanup
  - `cleanup_temp_files() { rm -f "$@"; }`

## 5. Generate Cleanup Plan Fixes

- [x] 5.1 Добавить cleanup временных файлов
  - `trap 'rm -f "$TEMP_CLASSIFICATION"' EXIT`

## 6. Safe AWS Cleanup Python Fixes

- [x] 6.1 Добавить cleanup временных файлов в Python скрипте
  - Использовать `atexit` или `try/finally` для cleanup

## 7. Testing

- [ ] 7.1 Протестировать infrastructure-compliance-check.sh с пустыми файлами
- [ ] 7.2 Протестировать infrastructure-compliance-check.sh с поврежденным JSON
- [ ] 7.3 Протестировать bug-hunter.sh с различными сценариями
- [ ] 7.4 Проверить cleanup временных файлов (создать тестовые файлы и проверить удаление)
- [ ] 7.5 Проверить обработку таймаутов AWS CLI (симуляция зависания)
- [ ] 7.6 Проверить передачу параметров между скриптами

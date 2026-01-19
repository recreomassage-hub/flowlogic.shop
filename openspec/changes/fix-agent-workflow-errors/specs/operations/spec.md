# Operations: Agent Workflow Error Handling

## MODIFIED Requirements

### Requirement: Infrastructure Compliance Check Error Handling

Infrastructure compliance check SHALL корректно обрабатывать ошибки, валидировать данные и очищать временные файлы.

#### Scenario: Temporary File Cleanup on Success
- **Given:** infrastructure-compliance-check.sh создает временные файлы `TEMP_INVENTORY` и `TEMP_CLASSIFIED`
- **When:** скрипт завершается успешно
- **Then:** все временные файлы должны быть удалены через trap EXIT

#### Scenario: Temporary File Cleanup on Error
- **Given:** infrastructure-compliance-check.sh создает временные файлы
- **When:** скрипт завершается с ошибкой (exit code != 0)
- **Then:** все временные файлы должны быть удалены через trap EXIT

#### Scenario: Temporary File Cleanup on Interrupt
- **Given:** infrastructure-compliance-check.sh выполняется и создает временные файлы
- **When:** скрипт прерывается (SIGINT, SIGTERM)
- **Then:** все временные файлы должны быть удалены через trap INT TERM

#### Scenario: JSON Validation Before Parsing
- **Given:** скрипт получает JSON файл `$TEMP_CLASSIFIED` для парсинга
- **When:** файл поврежден (невалидный JSON)
- **Then:** скрипт должен валидировать JSON через `jq empty` перед парсингом и обработать ошибку gracefully с fallback значениями

#### Scenario: Empty JSON File Handling
- **Given:** скрипт получает пустой JSON файл
- **When:** скрипт пытается парсить файл
- **Then:** скрипт должен проверить размер файла (`[ -s "$file" ]`) и использовать fallback значения

#### Scenario: Null Value Handling in jq
- **Given:** jq возвращает null для числового значения (например, `.violations | length`)
- **When:** скрипт пытается использовать значение в арифметике `[ "$VIOLATIONS" -eq 0 ]`
- **Then:** должно использоваться fallback значение "0" через `jq -r '.field // "0"'`

#### Scenario: Missing Dependency Script
- **Given:** bug-hunter.sh вызывает infrastructure-compliance-check.sh
- **When:** aws-inventory-scan.sh отсутствует или недоступен
- **Then:** скрипт должен проверить наличие скрипта и использовать fallback метод (minimal scan)

### Requirement: Bug Hunter Integration

Bug Hunter SHALL корректно передавать параметры в infrastructure-compliance-check.sh и использовать данные из JSON для подсчета.

#### Scenario: Parameter Passing to Infrastructure Check
- **Given:** bug-hunter.sh вызывает infrastructure-compliance-check.sh
- **When:** требуется dry-run режим для безопасного тестирования
- **Then:** параметр `--dry-run` должен быть явно передан в вызове скрипта

#### Scenario: Violation Counting from JSON
- **Given:** infrastructure-compliance-check.sh возвращает classification JSON с violations
- **When:** bug-hunter.sh подсчитывает количество violations
- **Then:** подсчет должен использовать данные из JSON через jq, а не через grep вывода

#### Scenario: Error Handling in Integration
- **Given:** bug-hunter.sh вызывает infrastructure-compliance-check.sh
- **When:** infrastructure-compliance-check.sh завершается с ошибкой
- **Then:** bug-hunter.sh должен обработать ошибку gracefully и продолжить работу с другими проверками

### Requirement: AWS CLI Timeout Handling

Все долгие AWS CLI команды SHALL иметь таймауты для предотвращения зависаний.

#### Scenario: AWS CLI Command Timeout
- **Given:** AWS CLI команда выполняется (например, `aws resourcegroupstaggingapi get-resources`)
- **When:** команда зависает более 300 секунд
- **Then:** команда должна быть прервана с ошибкой timeout через `timeout 300`

#### Scenario: Timeout Command Availability
- **Given:** скрипт пытается использовать timeout для AWS CLI команды
- **When:** команда `timeout` недоступна в системе
- **Then:** скрипт должен выполнить команду без таймаута с предупреждением

### Requirement: Common Error Handling Utilities

Система SHALL предоставлять переиспользуемые функции для валидации JSON и безопасного парсинга.

#### Scenario: JSON Validation Function
- **Given:** скрипт имеет функцию `validate_json(file)`
- **When:** функция вызывается с путем к JSON файлу
- **Then:** функция должна вернуть 0 если JSON валиден, иначе 1

#### Scenario: Safe jq Parsing with Fallback
- **Given:** скрипт имеет функцию `safe_jq(query, fallback, file)`
- **When:** jq запрос возвращает null или ошибку
- **Then:** функция должна вернуть fallback значение

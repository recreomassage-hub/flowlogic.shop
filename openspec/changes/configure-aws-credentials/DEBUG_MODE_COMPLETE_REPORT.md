# DEBUG MODE: Complete Report - ResourceExistenceCheck Failure

**Дата:** 2026-01-18  
**Статус:** Проблема не решена, требует AWS Support или Console детали

---

## Все протестированные гипотезы:

### ✅ Подтвержденные (A-E):
- A: serverless.yml синтаксис корректен
- B: service name корректный
- C: resources section найдена
- D: AWS credentials работают
- E: ResourceExistenceCheck failed

### ❌ Отклоненные гипотезы:
- G: Cognito User Pool ARN → изменен на wildcard, проблема сохранилась
- H: SSM параметры с ~true → проблема сохранилась
- K: Wildcard ARN patterns → заменены на !GetAtt, проблема сохранилась
- L: SSM параметры в environment → удалены, проблема сохранилась
- M: !GetAtt ссылки в IAM policy → удалены, проблема сохранилась
- P: Чистый деплой → проблема сохранилась
- Q: Новый service name → проблема сохранилась

---

## Выполненные исправления:

1. ✅ Удалены SSM параметры из environment variables (подтверждено в template)
2. ✅ Изменен Cognito ARN на wildcard `*`
3. ✅ Удалены !GetAtt ссылки из IAM policy
4. ✅ Используются wildcard patterns для всех ресурсов
5. ✅ Изменен service name на `flowlogic-backend-staging-clean`
6. ✅ Создан чистый stack с нуля

---

## Наблюдения:

**Критическое наблюдение:**
- Первый change set создается и выполняется успешно (CREATE_COMPLETE для ServerlessDeploymentBucket)
- Второй change set (после upload файлов) падает с ResourceExistenceCheck
- Это указывает, что проблема связана с обновлением после загрузки, а не с начальным созданием

**Поведение:**
- Проблема систематически повторяется
- Не зависит от service name
- Не зависит от состояния stack (CREATE_COMPLETE или DELETE_FAILED)
- Не зависит от наличия SSM параметров
- Не зависит от использования !GetAtt или wildcard patterns

---

## Возможные причины:

1. **CloudFormation внутренняя валидация:** ResourceExistenceCheck может проверять что-то, что не видно через CLI
2. **Проблема в регионе/аккаунте AWS:** Может быть специфичная для аккаунта проблема
3. **Проблема в версии Serverless Framework:** Может быть баг в версии 3.40.0
4. **Проблема в зависимостях ресурсов:** CloudFormation может проверять циклические зависимости или несуществующие ресурсы

---

## Требуется:

1. **Детальная диагностика через AWS Console:**
   - CloudFormation → Stack Events → найти событие с ResourceExistenceCheck
   - Проверить StatusReason для деталей
   - Проверить Change Set детали

2. **AWS Support:**
   - Обратиться с подробностями ошибки ResourceExistenceCheck
   - Предоставить CloudFormation template для анализа

3. **Альтернативные подходы:**
   - Использовать Terraform вместо Serverless Framework
   - Использовать AWS CDK
   - Разделить деплой на несколько этапов

---

## Логи:

Все логи сохранены в:
- `.cursor/debug.log` - все гипотезы и результаты
- `/tmp/serverless-deploy-*.log` - логи деплоя

---

**Статус:** ⏸️ Требуется детальная диагностика через AWS Console или AWS Support

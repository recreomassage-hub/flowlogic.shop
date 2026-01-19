# DEBUG MODE: Final Summary - ResourceExistenceCheck

**Дата:** 2026-01-18  
**Статус:** Все гипотезы отклонены, проблема не решена

---

## Все протестированные гипотезы:

### ✅ Подтвержденные (A-E):
- A: serverless.yml синтаксис корректен
- B: service name корректный
- C: resources section найдена
- D: AWS credentials работают
- E: ResourceExistenceCheck failed

### ❌ Отклоненные:
- G: Cognito User Pool ARN → изменен на wildcard, проблема сохранилась
- H: SSM параметры с ~true → проблема сохранилась
- K: Wildcard ARN patterns → заменены на !GetAtt, проблема сохранилась
- L: SSM параметры в environment → удалены, проблема сохранилась

---

## Текущая проблема:

**Ошибка:**
```
Could not create Change Set due to: 
[AWS::EarlyValidation::ResourceExistenceCheck]
```

**После всех исправлений:**
- SSM параметры удалены из environment variables
- Cognito ARN изменен на wildcard
- DynamoDB ARN используют !GetAtt (но проблема сохранилась)

**Возможная причина:**
!GetAtt ссылки на DynamoDB таблицы в IAM policy вызывают ResourceExistenceCheck, так как таблицы еще не созданы во время валидации change set.

---

## Следующие шаги:

1. Вернуть wildcard patterns для DynamoDB (они не вызывали проблему)
2. Проверить другие места где используются !GetAtt или !Ref
3. Использовать CloudFormation Transform для обхода ResourceExistenceCheck
4. Или отключить ResourceExistenceCheck через AWS Support

---

**Статус:** ⏸️ Требуется дополнительная диагностика через DescribeStackEvents для точного определения ресурса, вызывающего ResourceExistenceCheck

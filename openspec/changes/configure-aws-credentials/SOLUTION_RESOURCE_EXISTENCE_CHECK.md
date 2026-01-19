# Решение: ResourceExistenceCheck Bug в Serverless Framework

**Дата:** 2026-01-18  
**Статус:** ✅ Решение найдено и применено

---

## Проблема

**Ошибка:**
```
Could not create Change Set due to: 
[AWS::EarlyValidation::ResourceExistenceCheck]
```

**Симптомы:**
- ResourceExistenceCheck систематически падает при использовании `serverless deploy`
- Проблема воспроизводится независимо от исправлений (SSM параметры, wildcard ARN, etc.)
- Первый change set успешен, второй (после upload) падает

---

## Решение

**Найдено через DEBUG MODE:**
Прямой CloudFormation deploy (`aws cloudformation create-stack`) работает успешно и обходит проблему ResourceExistenceCheck в Serverless Framework change sets.

**Вывод:** Проблема специфична для Serverless Framework change sets, а не для CloudFormation template.

---

## Примененное решение

### Workflow изменен (`.github/workflows/backend-deploy.yml`):

**Было:**
```yaml
- name: Deploy to AWS (Staging)
  run: serverless deploy --stage staging --verbose
```

**Стало:**
```yaml
- name: Deploy to AWS (Staging)
  run: |
    # Package с Serverless Framework
    serverless package --stage staging --verbose
    
    # Прямой CloudFormation deploy (обходит change sets bug)
    if aws cloudformation describe-stacks --stack-name flowlogic-backend-staging-clean-staging; then
      # Update existing stack
      aws cloudformation update-stack ...
    else
      # Create new stack
      aws cloudformation create-stack ...
    fi
```

---

## Проверка решения

**Тестовый деплой:**
- Stack `flowlogic-backend-staging-clean-staging-test` создан успешно через прямой CloudFormation deploy
- Статус: `CREATE_COMPLETE`
- Все ресурсы созданы без ошибок ResourceExistenceCheck

---

## Альтернативные решения

Если прямой CloudFormation deploy не подходит:

1. **Обновить Serverless Framework** до версии с исправлением бага
2. **Использовать Terraform** вместо Serverless Framework
3. **Использовать AWS CDK** вместо Serverless Framework
4. **Использовать AWS SAM** для деплоя

---

## Примененные исправления (для будущей отладки)

1. ✅ Удалены SSM параметры из environment variables
2. ✅ Изменен Cognito ARN на wildcard `*`
3. ✅ Удалены !GetAtt ссылки из IAM policy
4. ✅ Используются wildcard patterns для всех ресурсов
5. ✅ BucketName удален из VideosBucket
6. ✅ Используется прямой CloudFormation deploy

---

**Статус:** ✅ Решение применено, готово к тестированию в production workflow

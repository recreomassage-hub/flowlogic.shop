# Change: Adopt Hybrid IaC Strategy (Serverless Framework + Terraform)

## Why

**Problem:** Необходимо определить четкую стратегию выбора инструментов для Infrastructure as Code:
- Текущий стек (Serverless Framework) работает хорошо для serverless архитектуры
- Terraform может быть полезен для определенных сценариев (VPC, сложная инфраструктура, multi-cloud)
- Отсутствие четких критериев приводит к неопределенности при принятии решений
- Команда не знает, когда использовать Terraform vs Serverless Framework

**Opportunity:** Документировать гибридный подход, который:
- Сохраняет текущий эффективный стек для serverless компонентов
- Определяет четкие критерии для добавления Terraform
- Обеспечивает единый compliance layer через AWS Infrastructure Hygiene System
- Минимизирует complexity, добавляя Terraform только при необходимости

## What Changes

**Additions:**
- **IaC Tool Selection Criteria** — четкие критерии для выбора Serverless Framework vs Terraform:
  - Serverless Framework: Lambda, API Gateway, DynamoDB, S3, Cognito (текущий стек)
  - Terraform: VPC, сложная инфраструктура, централизованное IAM, multi-cloud
- **Decision Framework** — процесс оценки необходимости Terraform:
  - Checklist для оценки сценариев
  - Критерии принятия решения
  - Процесс миграции (если понадобится)
- **Integration Guidelines** — как Terraform и Serverless Framework работают вместе:
  - AWS Infrastructure Hygiene System мониторит все ресурсы
  - Разделение ответственности между инструментами
  - Best practices для гибридного подхода
- **Documentation** — обновление документации с новой стратегией:
  - `docs/infrastructure/iac-strategy.md` — стратегия выбора инструментов
  - Обновление `openspec/project.md` с IaC guidelines

**BREAKING:**
- Нет breaking changes (только добавление guidelines и документации)

## Impact

**Affected specs:**
- `infrastructure` — ADDED: IaC tool selection criteria and hybrid approach guidelines

**Affected code:**
- `docs/infrastructure/iac-strategy.md` — новый документ со стратегией
- `openspec/project.md` — обновление Infrastructure section с guidelines
- `docs/infrastructure/terraform-vs-hygiene-comparison.md` — уже создан, будет ссылаться на стратегию

**Migration:**
- Нет миграции (стратегическое решение, не техническая реализация)
- Существующая инфраструктура остается на Serverless Framework
- Terraform добавляется только при необходимости (по критериям)

**Risks:**
- Команда может неправильно интерпретировать критерии (митигировано: четкие guidelines и примеры)
- Дублирование логики между Serverless Framework и Terraform (митигировано: четкое разделение ответственности)
- Complexity от гибридного подхода (митигировано: Terraform только при необходимости)

## Open Questions

- [ ] Нужна ли предварительная настройка Terraform (state backend, providers) даже если не используется?
  - **A (pending):** Нет, настраиваем только когда понадобится
- [ ] Какой формат для decision checklist?
  - **A (pending):** Markdown checklist с примерами сценариев
- [ ] Нужна ли автоматизация для проверки соответствия стратегии?
  - **A (pending):** MVP: документация. Автоматизация - в v2 если понадобится

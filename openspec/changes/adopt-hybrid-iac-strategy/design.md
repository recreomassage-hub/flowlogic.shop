# Design: Hybrid IaC Strategy

## Context

**Background:**
- FlowLogic использует Serverless Framework для serverless инфраструктуры (Lambda, API Gateway, DynamoDB, S3, Cognito)
- AWS Infrastructure Hygiene System обеспечивает compliance и governance для всех ресурсов
- Terraform может быть полезен для определенных сценариев, но не нужен для текущей архитектуры
- Необходимо определить четкие критерии для принятия решения о добавлении Terraform

**Constraints:**
- Минимизировать complexity (не добавлять инструменты без необходимости)
- Сохранить эффективность текущего стека
- Обеспечить единый compliance layer через Hygiene System
- Поддержать гибкость для будущих потребностей

**Stakeholders:**
- DevOps: хочет четкие guidelines для выбора инструментов
- Backend team: хочет понимать, когда использовать Terraform
- PM: хочет избежать unnecessary complexity

## Goals / Non-Goals

**Goals:**
- Документировать четкие критерии для выбора IaC инструментов
- Определить сценарии, когда Terraform необходим
- Обеспечить единый compliance layer через Hygiene System
- Минимизировать complexity, добавляя Terraform только при необходимости

**Non-Goals:**
- Миграция существующей инфраструктуры на Terraform (только если понадобится)
- Замена Serverless Framework на Terraform (гибридный подход)
- Автоматизация выбора инструментов (ручное решение на основе критериев)

## Technical Decisions

### Decision 1: Keep Serverless Framework as Primary Tool

**Choice:** Serverless Framework остается основным инструментом для serverless компонентов.

**Alternatives considered:**
- Migrate all to Terraform — слишком сложно, нет необходимости
- Use only Terraform — теряем преимущества Serverless Framework для serverless архитектуры
- No IaC tool — не подходит для production

**Rationale:**
- Serverless Framework идеален для Lambda-based архитектуры
- Уже работает и интегрировано
- Меньше complexity для простой serverless инфраструктуры
- Нет необходимости в миграции без конкретной причины

### Decision 2: Add Terraform Only When Needed

**Choice:** Terraform добавляется только при выполнении критериев.

**Criteria for Terraform:**
1. **VPC/Networking:** Если понадобится VPC, subnets, security groups
2. **Complex Infrastructure:** ECS, EKS, RDS, сложные multi-service deployments
3. **Centralized IAM:** Если нужна централизованная IAM management
4. **Multi-cloud:** Если понадобится поддержка других облаков

**Alternatives considered:**
- Always use Terraform — unnecessary complexity
- Never use Terraform — ограничивает гибкость
- Use Terraform for everything — теряем преимущества Serverless Framework

**Rationale:**
- Минимизирует complexity (добавляем только при необходимости)
- Используем лучший инструмент для каждой задачи
- Гибкость для будущих потребностей

### Decision 3: Unified Compliance Layer

**Choice:** AWS Infrastructure Hygiene System мониторит все ресурсы (Serverless Framework + Terraform).

**Alternatives considered:**
- Separate compliance for each tool — дублирование
- No compliance — не подходит для production
- Terraform-only compliance — не покрывает Serverless Framework resources

**Rationale:**
- Единый compliance layer для всех ресурсов
- Hygiene System уже работает и интегрировано
- Не зависит от инструмента создания ресурсов

## Architecture

```
┌─────────────────────────────────────────┐
│  Serverless Framework (Primary)          │
│  - Lambda functions                      │
│  - API Gateway                           │
│  - DynamoDB tables                      │
│  - S3 buckets                           │
│  - Cognito                              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Terraform (When Needed)                │
│  - VPC, Networking                      │
│  - Complex infrastructure               │
│  - Centralized IAM                      │
│  - Multi-cloud (if needed)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  AWS Infrastructure Hygiene System      │
│  - Monitors ALL resources                │
│  - Compliance checking                   │
│  - Lifecycle management                  │
│  - Cost optimization                     │
└─────────────────────────────────────────┘
```

## Decision Framework

### Checklist: When to Use Terraform

**Use Terraform if ANY of the following is true:**

- [ ] **VPC/Networking Required**
  - Need VPC, subnets, NAT gateways, VPN
  - Example: Multi-AZ deployment, private subnets
  
- [ ] **Complex Infrastructure**
  - ECS clusters, EKS, RDS, ElastiCache
  - Multi-service deployments with dependencies
  - Example: Containerized services, managed databases
  
- [ ] **Centralized IAM Management**
  - Need to manage IAM roles/policies centrally
  - Cross-service IAM dependencies
  - Example: Shared IAM roles for multiple services
  
- [ ] **Multi-cloud Support**
  - Need to support AWS + Azure/GCP
  - Example: Multi-cloud disaster recovery

**Use Serverless Framework if:**
- Serverless architecture (Lambda, API Gateway, DynamoDB, S3)
- Simple infrastructure (no VPC, no containers)
- Single cloud provider (AWS only)

## Integration Guidelines

### Resource Naming

**Consistent naming across tools:**
- Pattern: `flowlogic-{env}-{service}`
- Serverless Framework: Uses `custom.tables.*`, `custom.s3.bucket`
- Terraform: Uses `var.project_name`, `var.environment`
- Hygiene System: Validates naming convention for all resources

### State Management

**Separate states:**
- Serverless Framework: CloudFormation stacks (managed by Serverless)
- Terraform: S3 backend for state (if Terraform used)
- Hygiene System: No state (read-only monitoring)

### Compliance

**Unified compliance:**
- Hygiene System scans all resources (regardless of creation tool)
- Tags required: Project, Env, Owner, ExpiresAt (for dev)
- Naming convention: `flowlogic-{env}-{service}`
- Lifecycle policies: dev max 30 days, auto-cleanup

## Examples

### Example 1: Serverless Only (Current)

```yaml
# serverless.yml
functions:
  api:
    handler: src/handler
resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
```

**Decision:** Serverless Framework only (no Terraform needed)

### Example 2: Add VPC (Future)

```hcl
# terraform/main.tf
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Project = "FlowLogic"
    Env     = "prod"
  }
}
```

```yaml
# serverless.yml
provider:
  vpc:
    securityGroupIds:
      - ${terraform:security_group_id}
    subnetIds:
      - ${terraform:subnet_id_1}
      - ${terraform:subnet_id_2}
```

**Decision:** Hybrid approach (Terraform for VPC, Serverless for Lambda)

### Example 3: Centralized IAM (Future)

```hcl
# terraform/iam.tf
resource "aws_iam_role" "lambda_execution" {
  name = "flowlogic-prod-lambda-execution"
  # ...
}
```

```yaml
# serverless.yml
provider:
  iam:
    role: ${terraform:lambda_execution_role_arn}
```

**Decision:** Hybrid approach (Terraform for IAM, Serverless for Lambda)

## Migration Process (If Needed)

### Phase 1: Evaluation
1. Evaluate need using decision checklist
2. Document rationale for Terraform
3. Get team approval

### Phase 2: Setup
1. Initialize Terraform (S3 backend, providers)
2. Create initial resources (VPC, IAM, etc.)
3. Integrate with Serverless Framework (terraform outputs)

### Phase 3: Integration
1. Update Serverless Framework config (reference Terraform outputs)
2. Test deployment (staging first)
3. Verify Hygiene System monitors new resources

### Phase 4: Documentation
1. Update documentation with new setup
2. Document integration patterns
3. Update team guidelines

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Team confusion (which tool to use) | Medium | Medium | Clear documentation, decision checklist |
| State conflicts | Low | High | Separate states, clear ownership |
| Compliance gaps | Low | Medium | Hygiene System monitors all resources |
| Complexity increase | Medium | Low | Terraform only when needed |

**Trade-offs:**
- ✅ Flexibility (can add Terraform when needed) → ❌ More complexity if used
- ✅ Best tool for each task → ❌ Need to learn both tools
- ✅ Unified compliance → ❌ Hygiene System must support both

## Open Questions

- [ ] **Q:** Should we pre-configure Terraform state backend even if not using it?
  - **A (pending):** No, configure only when needed
  
- [ ] **Q:** What's the process for team review of Terraform adoption decision?
  - **A (pending):** Use decision checklist, document rationale, team approval
  
- [ ] **Q:** Should we automate compliance checking for tool selection?
  - **A (pending):** MVP: documentation. Automation in v2 if needed

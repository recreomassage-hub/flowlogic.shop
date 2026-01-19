## ADDED Requirements

### Requirement: IaC Tool Selection Strategy

The system SHALL maintain a documented strategy for selecting Infrastructure as Code (IaC) tools based on infrastructure requirements.

**Rationale:** Ensures appropriate tool selection, minimizes complexity, and provides clear guidelines for team decisions.

#### Scenario: Serverless infrastructure uses Serverless Framework

- **GIVEN** infrastructure requirements include Lambda, API Gateway, DynamoDB, S3, Cognito
- **WHEN** team evaluates IaC tool selection
- **THEN** Serverless Framework is selected
- **AND** decision is documented with rationale

#### Scenario: VPC/Networking requirements use Terraform

- **GIVEN** infrastructure requirements include VPC, subnets, NAT gateways
- **WHEN** team evaluates IaC tool selection
- **THEN** Terraform is selected for networking components
- **AND** Serverless Framework continues to be used for serverless components
- **AND** integration between tools is documented

#### Scenario: Complex infrastructure uses Terraform

- **GIVEN** infrastructure requirements include ECS, EKS, RDS, or multi-service deployments
- **WHEN** team evaluates IaC tool selection
- **THEN** Terraform is selected for complex components
- **AND** decision checklist is completed
- **AND** rationale is documented

---

### Requirement: Decision Criteria for Terraform Adoption

The system SHALL provide clear criteria for when to adopt Terraform alongside Serverless Framework.

**Rationale:** Prevents unnecessary complexity while maintaining flexibility for future needs.

#### Scenario: VPC requirement triggers Terraform adoption

- **GIVEN** project requires VPC, subnets, or networking components
- **WHEN** team evaluates infrastructure needs
- **THEN** Terraform adoption is considered
- **AND** decision checklist is used to evaluate
- **AND** Terraform is adopted if criteria are met

#### Scenario: Centralized IAM requirement triggers Terraform adoption

- **GIVEN** project requires centralized IAM role/policy management
- **WHEN** team evaluates infrastructure needs
- **THEN** Terraform adoption is considered for IAM components
- **AND** Serverless Framework continues for Lambda functions
- **AND** integration pattern is documented

#### Scenario: Multi-cloud requirement triggers Terraform adoption

- **GIVEN** project requires support for multiple cloud providers
- **WHEN** team evaluates infrastructure needs
- **THEN** Terraform adoption is considered
- **AND** multi-cloud strategy is documented
- **AND** migration plan is created

#### Scenario: Simple serverless architecture uses Serverless Framework only

- **GIVEN** infrastructure requirements are limited to Lambda, API Gateway, DynamoDB, S3
- **WHEN** team evaluates IaC tool selection
- **THEN** Serverless Framework is used exclusively
- **AND** Terraform is not adopted
- **AND** decision is documented

---

### Requirement: Unified Compliance Layer

All infrastructure resources SHALL be monitored by AWS Infrastructure Hygiene System regardless of creation tool (Serverless Framework or Terraform).

**Rationale:** Ensures consistent compliance checking, lifecycle management, and cost optimization across all resources.

#### Scenario: Serverless Framework resources are monitored

- **GIVEN** resources are created via Serverless Framework
- **WHEN** AWS Infrastructure Hygiene System runs compliance check
- **THEN** all Serverless Framework resources are scanned
- **AND** compliance violations are detected
- **AND** Beads issues are created for violations

#### Scenario: Terraform resources are monitored

- **GIVEN** resources are created via Terraform
- **WHEN** AWS Infrastructure Hygiene System runs compliance check
- **THEN** all Terraform resources are scanned
- **AND** compliance violations are detected
- **AND** Beads issues are created for violations

#### Scenario: Hybrid infrastructure is monitored

- **GIVEN** resources are created via both Serverless Framework and Terraform
- **WHEN** AWS Infrastructure Hygiene System runs compliance check
- **THEN** all resources from both tools are scanned
- **AND** unified compliance report is generated
- **AND** violations are tracked regardless of creation tool

---

### Requirement: Resource Naming Consistency

All infrastructure resources SHALL follow consistent naming convention regardless of creation tool.

**Rationale:** Ensures easy identification, compliance checking, and resource management across tools.

#### Scenario: Serverless Framework resource follows naming convention

- **GIVEN** resource is created via Serverless Framework
- **WHEN** resource is created
- **THEN** resource name follows pattern: `flowlogic-{env}-{service}`
- **AND** naming convention is validated by Hygiene System

#### Scenario: Terraform resource follows naming convention

- **GIVEN** resource is created via Terraform
- **WHEN** resource is created
- **THEN** resource name follows pattern: `flowlogic-{env}-{service}`
- **AND** naming convention matches Serverless Framework pattern
- **AND** naming convention is validated by Hygiene System

#### Scenario: Naming convention violation is detected

- **GIVEN** resource name violates convention (e.g., "my-resource")
- **WHEN** Hygiene System runs compliance check
- **THEN** violation is detected
- **AND** Beads issue is created with severity MEDIUM
- **AND** fix suggestion includes correct naming pattern

---

### Requirement: Integration Between IaC Tools

When both Serverless Framework and Terraform are used, the system SHALL provide integration patterns and documentation.

**Rationale:** Ensures seamless integration between tools and prevents conflicts.

#### Scenario: Terraform outputs are referenced in Serverless Framework

- **GIVEN** Terraform creates VPC and outputs subnet IDs
- **WHEN** Serverless Framework configuration references Terraform outputs
- **THEN** Serverless Framework uses `${terraform:subnet_id}` syntax
- **AND** integration is documented
- **AND** deployment succeeds

#### Scenario: Shared IAM roles are used across tools

- **GIVEN** Terraform creates IAM role for Lambda execution
- **WHEN** Serverless Framework Lambda function uses the role
- **THEN** Serverless Framework references role ARN from Terraform
- **AND** integration pattern is documented
- **AND** permissions are correctly applied

#### Scenario: State management is separated

- **GIVEN** both Serverless Framework and Terraform are used
- **WHEN** infrastructure state is managed
- **THEN** Serverless Framework uses CloudFormation stacks
- **AND** Terraform uses separate state backend (S3)
- **AND** states do not conflict

---

### Requirement: Documentation of IaC Strategy

The system SHALL maintain documentation of IaC tool selection strategy, decision criteria, and integration patterns.

**Rationale:** Provides clear guidelines for team decisions and ensures consistency.

#### Scenario: IaC strategy documentation exists

- **GIVEN** project uses hybrid IaC approach
- **WHEN** developer needs to choose IaC tool
- **THEN** documentation at `docs/infrastructure/iac-strategy.md` is available
- **AND** decision checklist is provided
- **AND** examples are included

#### Scenario: Decision rationale is documented

- **GIVEN** team decides to adopt Terraform
- **WHEN** Terraform is added to project
- **THEN** decision rationale is documented
- **AND** decision checklist is completed
- **AND** integration patterns are documented

#### Scenario: Strategy is updated in project context

- **GIVEN** IaC strategy is defined
- **WHEN** `openspec/project.md` is updated
- **THEN** Infrastructure section references strategy document
- **AND** guidelines are included
- **AND** examples are provided

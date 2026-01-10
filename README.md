# Flow Logic Platform

**B2C платформа для оценки качества движения через MediaPipe pose estimation и коррекции через AI-план.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **npm** или **yarn**
- **AWS Account** (для backend)
- **Vercel Account** (для frontend, опционально)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/flowlogic-platform.git
cd flowlogic-platform

# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Backend (from src/backend/)
npm run dev          # Start local server on :3001

# Frontend (from src/frontend/)
npm run dev          # Start dev server on :3000
```

### Production Deployment

See [Deployment Guide](docs/deployment_guide.md) for detailed instructions.

---

## 📚 Documentation

### For Users
- **[User Manual](docs/user_manual.md)** - Руководство пользователя

### For Developers
- **[OpenSpec Workflow Guide](openspec/AGENTS.md)** - Инструкции для AI агентов по OpenSpec
- **[Project Context](openspec/project.md)** - Контекст проекта (tech stack, conventions, constraints)
- **[Contributing Guide](CONTRIBUTING.md)** - Как вносить вклад в проект
- **[Cheatsheet](CHEATSHEET.md)** - Быстрая справка по командам Beads и OpenSpec
- **[Developer Guide](docs/developer_guide.md)** - Руководство для разработчиков

### For DevOps
- **[API Documentation](docs/api_documentation.md)** - Полная документация API
- **[Deployment Guide](docs/deployment_guide.md)** - Руководство по развертыванию
- **[Troubleshooting](docs/troubleshooting.md)** - Решение проблем

---

## 🏗️ Architecture

**Flow Logic** построен на serverless архитектуре AWS:

- **Frontend:** React 18+ (TypeScript) + Vite, deployed on Vercel
- **Backend:** AWS Lambda + API Gateway (Node.js 20+)
- **Database:** AWS DynamoDB (8 tables, KMS encryption)
- **Storage:** AWS S3 (video storage)
- **Auth:** AWS Cognito (JWT)
- **CI/CD:** GitHub Actions + Serverless Framework + Vercel

### Project Structure

```
flowlogic-platform/
├── docs/                    # Documentation
│   ├── requirements/       # PRD, User Stories, Glossary
│   ├── architecture/       # C4 diagrams, DB schema, API spec
│   ├── planning/           # Epics, Sprint plan, Roadmap
│   ├── security/           # Threat model, Security checklist
│   ├── testing/            # Test plan, Test reports
│   ├── user_manual.md      # User guide
│   ├── api_documentation.md # API docs
│   ├── deployment_guide.md  # Deployment guide
│   ├── developer_guide.md  # Developer guide
│   └── troubleshooting.md  # Troubleshooting
├── src/
│   ├── backend/           # Backend API (Lambda)
│   └── frontend/          # Frontend (React)
├── infra/                  # Infrastructure as Code
│   ├── serverless/        # Serverless Framework config
│   └── ci-cd/             # GitHub Actions workflows
├── tests/                  # Tests
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # E2E tests
└── README.md              # This file
```

---

## 🎯 Features

### Core Features

1. **Onboarding & Authentication**
   - Email/password registration and login
   - Wellness disclaimer acceptance
   - JWT-based authentication

2. **Tier Selection & Subscriptions**
   - 4 tiers: Free, Basic, Pro, Pro+
   - Stripe integration for payments
   - Subscription management

3. **MediaPipe Assessment Tests**
   - 3/3/7/15 tests depending on tier
   - Video recording and upload
   - Real-time processing status
   - Results with scores and problem areas

4. **Exercises & Training Plans** (Basic+)
   - AI-generated exercises based on test results
   - Personalized training plans
   - Smart calendar with daily tasks

5. **Progress Tracking** (Basic+)
   - Charts and visualizations
   - Streak tracking
   - Completion metrics

---

## 🔧 Technology Stack

### Frontend
- React 18+ (TypeScript)
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Axios

### Backend
- Node.js 20+ (TypeScript)
- Express.js
- Serverless Framework
- AWS Lambda
- AWS API Gateway
- AWS DynamoDB
- AWS Cognito
- AWS S3

### Infrastructure
- AWS (Lambda, API Gateway, DynamoDB, S3, Cognito, CloudWatch)
- Vercel (frontend hosting)
- GitHub Actions (CI/CD)
- Serverless Framework (IaC)

---

## 📖 Getting Started

### For Users

See [User Manual](docs/user_manual.md) for step-by-step instructions on:
- Registration and login
- Choosing a tier
- Taking assessment tests
- Viewing results
- Using exercises and plans (Basic+)

### For Developers

See [Developer Guide](docs/developer_guide.md) for:
- Setting up development environment
- Project structure
- Coding standards
- Testing guidelines
- Contributing

### For DevOps

See [Deployment Guide](docs/deployment_guide.md) for:
- Infrastructure setup
- Environment configuration
- CI/CD pipeline
- Monitoring and logging

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

See [Test Plan](docs/testing/test_plan.md) for detailed testing information.

---

## 🔒 Security

- JWT authentication with refresh tokens
- Tier-based access control
- Encryption at rest (DynamoDB KMS)
- Encryption in transit (HTTPS)
- AWS SSM Parameter Store for secrets
- Security policies documented in [Security Documentation](docs/security/)

---

## 📊 Monitoring

- **CloudWatch Logs:** All Lambda functions
- **CloudWatch Metrics:** API latency, error rates
- **Sentry:** Error tracking (optional)
- **CloudTrail:** AWS API audit logs

---

## 🤝 Contributing

### Development Workflow

Мы используем **OpenSpec + Beads** для всех новых фич и изменений.

**Процесс:**
1. `/openspec-proposal` → Создать предложение об изменении
2. После approval: `/openspec-apply` → Реализовать изменения
3. Опционально: `/openspec-to-beads` → Конвертировать tasks.md в Beads issues
4. После deployment: `/openspec-archive` → Архивировать завершенное изменение

**Документация:**
- [OpenSpec AGENTS.md](openspec/AGENTS.md) - Инструкции для AI агентов
- [Project Context](openspec/project.md) - Технические стандарты и контекст
- [Cheatsheet](CHEATSHEET.md) - Быстрая справка по командам

**Для существующих фич:**
- При изменении существующей фичи → создать proposal через `/openspec-proposal`
- См. `openspec/specs/` для существующих спецификаций
- См. `openspec/changes/` для активных предложений

**Быстрый старт:**
```bash
# Для новой фичи
/openspec-proposal
Change: add-feature-name
Description: {описание изменения}

# Затем следуйте инструкциям в openspec/AGENTS.md
```

See [Developer Guide](docs/developer_guide.md) for detailed contribution guidelines.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/your-org/flowlogic-platform/issues)
- **Email:** team@flowlogic.app

---

## 🗺️ Roadmap

See [Roadmap](docs/planning/roadmap.md) for planned features and milestones.

---

**Built with ❤️ by Flow Logic Team**








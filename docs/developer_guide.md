# 👨‍💻 Developer Guide — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Для:** Developers

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [API Development](#api-development)
7. [Frontend Development](#frontend-development)
8. [Database Development](#database-development)
9. [Contributing](#contributing)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** or **yarn**
- **Git**
- **AWS Account** (for backend development)
- **Vercel Account** (for frontend deployment, optional)

### Clone Repository

```bash
git clone https://github.com/your-org/flowlogic-platform.git
cd flowlogic-platform
```

### Install Dependencies

```bash
# Backend
cd src/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 📁 Project Structure

```
flowlogic-platform/
├── docs/                    # Documentation
│   ├── requirements/       # PRD, User Stories
│   ├── architecture/       # C4, DB schema, API spec
│   ├── planning/           # Epics, Sprint plan
│   ├── security/           # Security docs
│   └── testing/           # Test plans, reports
├── src/
│   ├── backend/           # Backend API
│   │   ├── api/          # Routes, controllers, middleware
│   │   ├── db/           # Models, migrations, seeders
│   │   ├── config/       # Configuration files
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── tests/        # Tests
│   └── frontend/         # Frontend React app
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── pages/      # Page components
│       │   ├── store/      # Zustand stores
│       │   ├── api/        # API clients
│       │   └── hooks/      # Custom hooks
│       └── tests/          # Tests
├── infra/                  # Infrastructure as Code
│   ├── serverless/        # Serverless Framework
│   └── ci-cd/            # GitHub Actions
└── tests/                 # E2E tests
```

---

## 🛠️ Development Setup

### Backend Development

1. **Set up environment variables**

```bash
cd src/backend
cp .env.example .env
# Edit .env with your values
```

2. **Start development server**

```bash
npm run dev
# Server runs on http://localhost:3001
```

3. **Run tests**

```bash
npm test
npm run test:watch
```

### Frontend Development

1. **Set up environment variables**

```bash
cd src/frontend
cp .env.example .env
# Edit .env with your values
```

2. **Start development server**

```bash
npm run dev
# App runs on http://localhost:3000
```

3. **Run tests**

```bash
npm test
npm run test:watch
```

### Local Development with Serverless Offline

For local backend development with Serverless Framework:

```bash
cd infra/serverless
serverless offline
# API runs on http://localhost:3000
```

---

## 📝 Coding Standards

### TypeScript

- **Strict mode:** Always use TypeScript strict mode
- **Types:** Define types for all functions and variables
- **Interfaces:** Use interfaces for object shapes
- **Enums:** Use enums for constants

**Example:**
```typescript
interface User {
  user_id: string;
  email: string;
  tier: 'free' | 'basic' | 'pro' | 'pro_plus';
}

enum Tier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  PRO_PLUS = 'pro_plus',
}
```

### Code Style

- **ESLint:** Follow ESLint rules (see `.eslintrc.json`)
- **Prettier:** Use Prettier for code formatting
- **Naming:** Use camelCase for variables, PascalCase for classes
- **Comments:** Add JSDoc comments for public functions

**Example:**
```typescript
/**
 * Creates a new user account
 * @param userData - User registration data
 * @returns Created user object
 */
async function createUser(userData: CreateUserInput): Promise<User> {
  // Implementation
}
```

### File Organization

- **One component per file:** Each React component in its own file
- **Co-location:** Keep related files together
- **Barrel exports:** Use index files for clean imports

---

## 🧪 Testing Guidelines

### Unit Tests

- **Coverage target:** 80% code coverage
- **Framework:** Jest
- **Location:** `tests/unit/`
- **Naming:** `*.test.ts` or `*.spec.ts`

**Example:**
```typescript
describe('UserModel', () => {
  it('should create a new user', async () => {
    const user = await UserModel.create({...});
    expect(user).toHaveProperty('user_id');
  });
});
```

### Integration Tests

- **Framework:** Jest + Supertest
- **Location:** `tests/integration/`
- **Test:** API endpoints, database operations

**Example:**
```typescript
describe('POST /auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send({...});
    expect(response.status).toBe(201);
  });
});
```

### E2E Tests

- **Framework:** Playwright or Cypress
- **Location:** `tests/e2e/`
- **Test:** Complete user flows

---

## 🔌 API Development

### Adding New Endpoints

1. **Define in API Spec**

Update `docs/architecture/api_spec.yaml`:

```yaml
/new-endpoint:
  get:
    tags: [NewTag]
    summary: Description
    security:
      - bearerAuth: []
    responses:
      '200':
        description: Success
```

2. **Create Controller**

Create `src/backend/api/controllers/newController.ts`:

```typescript
export async function getNewData(req: Request, res: Response) {
  // Implementation
}
```

3. **Create Route**

Create `src/backend/api/routes/newRoutes.ts`:

```typescript
router.get('/new-endpoint', authenticate, getNewData);
```

4. **Register Route**

Add to `src/backend/index.ts`:

```typescript
app.use('/v1/new', newRoutes);
```

### Middleware

- **Authentication:** `authenticate` - Verify JWT token
- **Tier Gating:** `requireTier` - Check user tier
- **Validation:** Use Zod for request validation

**Example:**
```typescript
import { authenticate, requireTier } from '../middleware/auth';

router.get('/premium-feature', 
  authenticate, 
  requireTier(['basic', 'pro', 'pro_plus']),
  getPremiumFeature
);
```

---

## 🎨 Frontend Development

### Adding New Pages

1. **Create Page Component**

Create `src/frontend/src/pages/NewPage.tsx`:

```typescript
export function NewPage() {
  return <div>New Page</div>;
}
```

2. **Add Route**

Update `src/frontend/src/App.tsx`:

```typescript
<Route path="/new" element={<NewPage />} />
```

### State Management

Use Zustand for global state:

```typescript
import { create } from 'zustand';

interface NewStore {
  data: string[];
  setData: (data: string[]) => void;
}

export const useNewStore = create<NewStore>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));
```

### API Calls

Use Axios client from `src/frontend/src/api/client.ts`:

```typescript
import { apiClient } from './client';

export async function getNewData() {
  const response = await apiClient.get('/new-endpoint');
  return response.data;
}
```

---

## 🗄️ Database Development

### Adding New Tables

1. **Update Schema**

Update `docs/architecture/db_schema.md`

2. **Create Model**

Create `src/backend/db/models/NewModel.ts`:

```typescript
export interface NewItem {
  id: string;
  // ... fields
}

export const NewModel = {
  async create(data: CreateNewInput): Promise<NewItem> {
    // Implementation
  },
  // ... other methods
};
```

3. **Update Serverless Config**

Update `infra/serverless/serverless.yml` to create table:

```yaml
NewTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: ${self:custom.tables.new}
    # ... table definition
```

### Migrations

Create migration files in `src/backend/db/migrations/`:

```typescript
export async function up() {
  // Migration logic
}

export async function down() {
  // Rollback logic
}
```

---

## 🤝 Contributing

### Workflow

1. **Create Feature Branch**

```bash
git checkout -b feat/amazing-feature
```

2. **Make Changes**

- Write code
- Write tests
- Update documentation

3. **Commit Changes**

```bash
git add .
git commit -m "feat: add amazing feature"
```

4. **Push and Create PR**

```bash
git push origin feat/amazing-feature
# Create Pull Request on GitHub
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### Code Review

- All code must be reviewed before merging
- Address review comments
- Ensure tests pass
- Ensure CI/CD passes

---

## 📚 Related Documentation

- **API Specification:** [docs/architecture/api_spec.yaml](docs/architecture/api_spec.yaml)
- **Database Schema:** [docs/architecture/db_schema.md](docs/architecture/db_schema.md)
- **Architecture:** [docs/architecture/](docs/architecture/)
- **Testing:** [docs/testing/test_plan.md](docs/testing/test_plan.md)

---

**Last Updated:** 2025-12-22  
**Version:** 1.0


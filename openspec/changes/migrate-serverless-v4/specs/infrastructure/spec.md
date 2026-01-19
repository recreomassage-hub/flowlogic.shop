## MODIFIED Requirements

### Requirement: Serverless Framework Version

The system SHALL use Serverless Framework v4 for infrastructure as code and Lambda deployment.

**Rationale:** Serverless Framework v4 provides built-in esbuild, better performance, and improved developer experience.

**Changes:** Updated from Serverless Framework v3.38.0 to v4.x.

#### Scenario: Serverless Framework v4 installation

- **GIVEN** developer has Node.js 20+ installed
- **WHEN** running `npm install` in `infra/serverless/`
- **THEN** Serverless Framework v4 is installed
- **AND** `serverless-plugin-typescript` is NOT installed

#### Scenario: Serverless Framework authentication

- **GIVEN** Serverless Framework v4 requires authentication
- **WHEN** developer runs `serverless` command
- **THEN** system uses `SERVERLESS_ACCESS_KEY` from environment or config
- **AND** command executes successfully

#### Scenario: TypeScript build with esbuild

- **GIVEN** project uses TypeScript
- **WHEN** running `serverless package` or `serverless deploy`
- **THEN** TypeScript is compiled using built-in esbuild
- **AND** no `serverless-plugin-typescript` plugin is used
- **AND** bundle size is optimized

#### Scenario: CI/CD deployment with v4

- **GIVEN** CI/CD pipeline runs deployment
- **WHEN** GitHub Actions workflow executes
- **THEN** Serverless Framework v4 is used
- **AND** `SERVERLESS_ACCESS_KEY` is available from GitHub Secrets
- **AND** deployment succeeds

---

### Requirement: Build Configuration

The system SHALL use Serverless Framework v4's built-in esbuild for TypeScript compilation.

**Rationale:** Built-in esbuild provides faster builds and smaller bundles without external plugins.

**Changes:** Removed `serverless-plugin-typescript`, using built-in esbuild instead.

#### Scenario: TypeScript compilation

- **GIVEN** source files are TypeScript
- **WHEN** Serverless Framework builds the project
- **THEN** esbuild compiles TypeScript to JavaScript
- **AND** output is optimized and minified

#### Scenario: Bundle size optimization

- **GIVEN** project has dependencies
- **WHEN** Serverless Framework packages Lambda functions
- **THEN** esbuild performs tree-shaking
- **AND** bundle size is minimized

---

## REMOVED Requirements

### Requirement: serverless-plugin-typescript Plugin

The system SHALL NOT use `serverless-plugin-typescript` plugin.

**Rationale:** Serverless Framework v4 has built-in esbuild support, making this plugin unnecessary and potentially conflicting.

**Migration:** Plugin removed from `package.json` and `serverless.yml`. Built-in esbuild handles TypeScript compilation.

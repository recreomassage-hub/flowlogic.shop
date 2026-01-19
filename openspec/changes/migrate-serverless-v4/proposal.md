# Change: Migrate to Serverless Framework v4

## Why

**Problem:** Project uses Serverless Framework v3.38.0, which is outdated. Serverless Framework v4 offers:
- Built-in esbuild for TypeScript/JavaScript (no need for `serverless-plugin-typescript`)
- Better performance and smaller bundle sizes
- Improved container support
- Better developer experience

**Opportunity:** 
- Remove dependency on `serverless-plugin-typescript` (replaced by built-in esbuild)
- Improve build performance and bundle sizes
- Stay current with framework updates
- Better long-term maintainability

## What Changes

**Additions:**
- Serverless Framework v4 installation and configuration
- Access/License key setup for Serverless Framework v4
- Built-in esbuild configuration (replaces `serverless-plugin-typescript`)
- Updated CI/CD workflows for v4 authentication

**BREAKING:**
- Requires Serverless Framework Access or License Key (new authentication model in v4)
- `serverless-plugin-typescript` must be removed (conflicts with built-in esbuild)
- Some configuration syntax may need updates

**Modifications:**
- `infra/serverless/package.json` - Update serverless version to v4
- `infra/serverless/serverless.yml` - Update configuration for v4 compatibility
- CI/CD workflows - Add Serverless Framework authentication
- Remove `serverless-plugin-typescript` plugin

## Impact

**Affected specs:**
- `infrastructure` — MODIFIED Serverless Framework version and build configuration

**Affected code:**
- `infra/serverless/package.json`
- `infra/serverless/serverless.yml`
- `.github/workflows/*.yml` (CI/CD workflows)
- `infra/serverless/tsconfig.json` (may need adjustments for esbuild)

**Migration:**
- Existing deployments: No changes to deployed resources (only build tooling changes)
- Local development: Developers need to install Serverless Framework v4 and configure access key
- CI/CD: Add Serverless Framework access key to GitHub Secrets

**Risks:**
- Build configuration changes may affect bundle sizes (mitigated by testing)
- Access key requirement adds setup step (mitigated by documentation)
- Potential compatibility issues with existing plugins (mitigated by removing conflicting plugins)

## Open Questions

- [ ] Do we need Serverless Framework Dashboard access or just Access Key?
- [ ] Should we configure esbuild options explicitly or use defaults?
- [ ] Do we need to update any other plugins for v4 compatibility?

# GitHub Copilot Custom Agents

## Symphony of Roles Architecture

This repository implements the **Symphony of Roles** architecture - a collaborative framework where 17 specialized AI personas work together across 6 development phases. Each agent has distinct responsibilities, security boundaries, and output standards designed for the FlashFusion source-of-truth-monorepo.

The architecture follows **RACI accountability matrices** (Responsible, Accountable, Consulted, Informed) to ensure clear ownership and collaboration patterns across all project phases.

## Agent Directory

| File | Agent Name | Role | Tools |
|------|-----------|------|-------|
| `visionary.agent.md` | visionary-agent | Product Strategist | read, search, edit, web |
| `product.agent.md` | product-agent | Product Manager/Owner | read, search, edit |
| `ux.agent.md` | ux-agent | UX Designer | read, search, edit |
| `ui.agent.md` | ui-agent | UI Designer | read, search, edit |
| `mobile.agent.md` | mobile-agent | Mobile App Developer | read, search, edit, shell |
| `database.agent.md` | database-agent | Backend Developer/Database Architect | read, search, edit, shell |
| `test.agent.md` | test-agent | QA Engineer/Tester | read, search, edit, shell |
| `deploy.agent.md` | deploy-agent | DevOps/Release Engineer | read, search, edit, shell |
| `security.agent.md` | security-agent | Security Analyst | read, search, edit, shell |
| `growth.agent.md` | growth-agent | Marketing/Growth Strategist | read, search, edit, web |
| `analyst.agent.md` | analyst-agent | Business Analyst | read, search, edit |
| `docs.agent.md` | docs-agent | Documentation Specialist | read, search, edit |
| `api.agent.md` | api-agent | API Designer | read, search, edit |
| `automation.agent.md` | automation-agent | Workflow Automation Specialist | read, search, edit |
| `review.agent.md` | review-agent | Code Review Specialist | read, search, edit |
| `refactor.agent.md` | refactor-agent | Refactoring Specialist | read, search, edit, shell |
| `debug.agent.md` | debug-agent | Debugging Specialist | read, search, edit, shell |

## RACI Matrix by Development Phase

The following matrix defines accountability across the 6 development phases:

| Phase | Responsible (R) | Accountable (A) | Consulted (C) | Informed (I) |
|-------|-----------------|-----------------|---------------|--------------|
| **Discovery** | Visionary, Analyst | Product | UX, Security | Growth |
| **Design** | UX, UI | Product | Visionary | Growth |
| **Build** | Mobile, Database, Deploy | Product | Security, Test | UI |
| **Release** | Test, Deploy | Product | Security | Growth |
| **Growth** | Growth | Visionary | Product | UX |
| **Maintenance** | Deploy, Test, Security | Product | Database | Visionary |

### Phase Descriptions

- **Discovery**: Market research, requirement gathering, feasibility analysis
- **Design**: UX research, UI specifications, design system development
- **Build**: Implementation, database schema, infrastructure setup
- **Release**: Testing, deployment, security validation
- **Growth**: Marketing campaigns, analytics, user acquisition
- **Maintenance**: Monitoring, bug fixes, security updates

## Usage Instructions

### GitHub.com (Web Interface)

1. Navigate to any issue, PR, or code file in the repository
2. Open GitHub Copilot chat
3. Invoke an agent using `@agent-name` syntax:
   ```
   @product-agent Create user stories for the authentication feature
   @test-agent Write unit tests for the UserProfile component
   @security-agent Review this code for security vulnerabilities
   ```

### VS Code with GitHub Copilot Chat

1. Open the repository in VS Code
2. Open Copilot Chat (Ctrl/Cmd + Shift + I)
3. Use the `@` symbol to invoke agents:
   ```
   @visionary-agent Analyze competitor features for content scheduling
   @ux-agent Create a journey map for new user onboarding
   @deploy-agent Set up a CI/CD pipeline for staging deployments
   ```

### GitHub Copilot CLI

```bash
# General syntax
gh copilot suggest "@agent-name <your request>"

# Examples
gh copilot suggest "@database-agent Design a schema for user analytics"
gh copilot suggest "@api-agent Create OpenAPI spec for the billing endpoint"
gh copilot suggest "@debug-agent Help me trace this null pointer exception"
```

## Requirements

### Subscription Tiers

| Feature | Copilot Individual | Copilot Business | Copilot Enterprise |
|---------|-------------------|------------------|-------------------|
| Basic Agents | ✅ | ✅ | ✅ |
| Custom Agent Files | ❌ | ✅ | ✅ |
| Organization-wide Agents | ❌ | ✅ | ✅ |
| Knowledge Base Integration | ❌ | ❌ | ✅ |

### Minimum Requirements

- GitHub Copilot Business or Enterprise subscription
- Repository must have `.github/agents/` directory with valid agent files
- Agent files must follow the `.agent.md` naming convention
- Valid YAML frontmatter with `name`, `description`, and `tools`

## Tech Stack Context

All agents are configured for this monorepo's technology stack:

- **Package Manager**: pnpm 9.x with workspaces
- **Build Tool**: Turbo for monorepo orchestration
- **Language**: TypeScript 5.x with strict mode
- **Frontend**: React 18 / React Native
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **CI/CD**: GitHub Actions
- **Security**: gitleaks, Renovate, pnpm audit
- **Testing**: Vitest/Jest with coverage requirements

## Common Commands

```bash
pnpm build          # Build all packages
pnpm test           # Run tests
pnpm lint           # Lint check
pnpm type-check     # TypeScript validation
pnpm dev            # Start development server
```

## Contributing

When adding or modifying agents:

1. Follow the established file format with YAML frontmatter
2. Include all required sections (Role Definition, Core Responsibilities, Security Boundaries, etc.)
3. Ensure tools list is minimal and appropriate for the role
4. Add specific, actionable security boundaries
5. Include copy-paste ready output templates
6. Provide realistic invocation examples

## License

These agents are part of the FlashFusion monorepo and are subject to the repository's license terms.

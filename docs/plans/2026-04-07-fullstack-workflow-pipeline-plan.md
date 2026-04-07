# Full-Stack Workflow Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a CLI scaffolding tool, shared skills, and centralized documentation system for generating full-stack projects from existing templates.

**Architecture:** Template Bundler approach — CLI lives in `templates/cli/`, copies existing templates (nest-template, react-template, next-template) into target directories, injects root CLAUDE.md from EJS templates, wires up npm workspaces for combined projects, and drops in shared cross-cutting skills.

**Tech Stack:** Node.js, TypeScript, inquirer, fs-extra, chalk, ejs

---

## Task 1: Initialize the CLI Package

**Files:**
- Create: `cli/package.json`
- Create: `cli/tsconfig.json`
- Create: `cli/src/index.ts`

**Step 1: Create `cli/package.json`**

```json
{
  "name": "create-fullstack-app",
  "version": "1.0.0",
  "description": "CLI tool to scaffold full-stack projects from templates",
  "bin": {
    "create-fullstack-app": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js"
  },
  "files": ["dist"],
  "dependencies": {
    "inquirer": "^9.2.0",
    "fs-extra": "^11.2.0",
    "chalk": "^5.3.0",
    "ejs": "^3.1.10"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^22.0.0",
    "@types/inquirer": "^9.0.0",
    "@types/fs-extra": "^11.0.0",
    "@types/ejs": "^3.1.0",
    "ts-node": "^10.9.0"
  }
}
```

**Step 2: Create `cli/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create stub `cli/src/index.ts`**

```typescript
#!/usr/bin/env node

console.log('create-fullstack-app');
```

**Step 4: Install dependencies**

Run: `cd cli && npm install`

**Step 5: Verify build**

Run: `cd cli && npm run build`
Expected: Compiles to `dist/index.js` with no errors.

**Step 6: Commit**

```bash
git add cli/package.json cli/tsconfig.json cli/src/index.ts cli/package-lock.json
git commit -m "feat: initialize create-fullstack-app CLI package"
```

---

## Task 2: Build the Template Registry

**Files:**
- Create: `cli/src/templates.ts`

**Step 1: Create `cli/src/templates.ts`**

```typescript
import path from 'path';

export type TemplateType = 'frontend' | 'backend';

export interface Template {
  name: string;
  displayName: string;
  type: TemplateType;
  path: string;
  description: string;
}

const TEMPLATES_ROOT = path.resolve(__dirname, '../../');

export const templates: Record<string, Template> = {
  nest: {
    name: 'nest',
    displayName: 'NestJS',
    type: 'backend',
    path: path.join(TEMPLATES_ROOT, 'nest-template'),
    description: 'NestJS 11 with PostgreSQL, TypeORM, JWT auth, and transactional email',
  },
  react: {
    name: 'react',
    displayName: 'React (Vite)',
    type: 'frontend',
    path: path.join(TEMPLATES_ROOT, 'react-template'),
    description: 'React 19 with Vite 7, Tailwind CSS v4, Redux Toolkit, React Router v7',
  },
  next: {
    name: 'next',
    displayName: 'Next.js',
    type: 'frontend',
    path: path.join(TEMPLATES_ROOT, 'next-template'),
    description: 'Next.js 16 App Router with Tailwind CSS v4, Redux Toolkit, next-themes',
  },
};

export function getFrontendTemplates(): Template[] {
  return Object.values(templates).filter((t) => t.type === 'frontend');
}

export function getBackendTemplates(): Template[] {
  return Object.values(templates).filter((t) => t.type === 'backend');
}
```

**Step 2: Commit**

```bash
git add cli/src/templates.ts
git commit -m "feat: add template registry with metadata"
```

---

## Task 3: Build the Interactive Prompts

**Files:**
- Create: `cli/src/prompts.ts`

**Step 1: Create `cli/src/prompts.ts`**

```typescript
import inquirer from 'inquirer';
import { getFrontendTemplates, getBackendTemplates } from './templates';

export type ProjectType = 'fullstack' | 'frontend' | 'backend';

export interface ProjectConfig {
  projectName: string;
  projectType: ProjectType;
  frontend?: string;
  backend?: string;
  initGit: boolean;
}

export async function getProjectConfig(): Promise<ProjectConfig> {
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) return 'Use lowercase letters, numbers, and hyphens only';
        return true;
      },
    },
  ]);

  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What do you want to create?',
      choices: [
        { name: 'Full-stack (frontend + backend)', value: 'fullstack' },
        { name: 'Frontend only', value: 'frontend' },
        { name: 'Backend only', value: 'backend' },
      ],
    },
  ]);

  let frontend: string | undefined;
  let backend: string | undefined;

  if (projectType === 'fullstack' || projectType === 'frontend') {
    const frontendTemplates = getFrontendTemplates();
    const { selectedFrontend } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFrontend',
        message: 'Pick a frontend:',
        choices: frontendTemplates.map((t) => ({
          name: `${t.displayName} — ${t.description}`,
          value: t.name,
        })),
      },
    ]);
    frontend = selectedFrontend;
  }

  if (projectType === 'fullstack' || projectType === 'backend') {
    const backendTemplates = getBackendTemplates();
    const { selectedBackend } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedBackend',
        message: 'Pick a backend:',
        choices: backendTemplates.map((t) => ({
          name: `${t.displayName} — ${t.description}`,
          value: t.name,
        })),
      },
    ]);
    backend = selectedBackend;
  }

  const { initGit } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'initGit',
      message: 'Initialize git repo?',
      default: true,
    },
  ]);

  return { projectName, projectType, frontend, backend, initGit };
}
```

**Step 2: Commit**

```bash
git add cli/src/prompts.ts
git commit -m "feat: add interactive CLI prompts"
```

---

## Task 4: Build Utility — File Copy

**Files:**
- Create: `cli/src/utils/copy.ts`

**Step 1: Create `cli/src/utils/copy.ts`**

```typescript
import fse from 'fs-extra';
import path from 'path';

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'coverage',
  '.DS_Store',
  'package-lock.json',
];

export async function copyTemplate(
  templatePath: string,
  targetPath: string,
): Promise<void> {
  await fse.copy(templatePath, targetPath, {
    filter: (src: string) => {
      const basename = path.basename(src);
      return !IGNORE_PATTERNS.includes(basename);
    },
  });
}

export async function renameAgentMdToClaudeMd(targetPath: string): Promise<void> {
  const agentMdPath = path.join(targetPath, 'AGENT.md');
  const claudeMdPath = path.join(targetPath, 'CLAUDE.md');

  if (await fse.pathExists(agentMdPath)) {
    await fse.rename(agentMdPath, claudeMdPath);
  }
}
```

**Step 2: Commit**

```bash
git add cli/src/utils/copy.ts
git commit -m "feat: add file copy utility with ignore patterns"
```

---

## Task 5: Build Utility — npm Workspaces

**Files:**
- Create: `cli/src/utils/workspace.ts`

**Step 1: Create `cli/src/utils/workspace.ts`**

```typescript
import fse from 'fs-extra';
import path from 'path';

export async function createRootPackageJson(
  targetPath: string,
  projectName: string,
): Promise<void> {
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    workspaces: ['frontend', 'backend'],
    scripts: {
      'dev:frontend': 'npm run dev --workspace=frontend',
      'dev:backend': 'npm run dev --workspace=backend',
      'build:frontend': 'npm run build --workspace=frontend',
      'build:backend': 'npm run build --workspace=backend',
      'test:frontend': 'npm run test --workspace=frontend',
      'test:backend': 'npm run test --workspace=backend',
    },
  };

  await fse.writeJson(path.join(targetPath, 'package.json'), packageJson, {
    spaces: 2,
  });
}
```

**Step 2: Commit**

```bash
git add cli/src/utils/workspace.ts
git commit -m "feat: add npm workspace setup utility"
```

---

## Task 6: Build Utility — Git Init

**Files:**
- Create: `cli/src/utils/git.ts`

**Step 1: Create `cli/src/utils/git.ts`**

```typescript
import { execSync } from 'child_process';

export function initGitRepo(targetPath: string): void {
  execSync('git init', { cwd: targetPath, stdio: 'ignore' });
  execSync('git add -A', { cwd: targetPath, stdio: 'ignore' });
  execSync('git commit -m "chore: initial project scaffold"', {
    cwd: targetPath,
    stdio: 'ignore',
  });
}
```

**Step 2: Commit**

```bash
git add cli/src/utils/git.ts
git commit -m "feat: add git init utility"
```

---

## Task 7: Build Utility — CLAUDE.md Generation

**Files:**
- Create: `cli/src/utils/claude-md.ts`

**Step 1: Create `cli/src/utils/claude-md.ts`**

```typescript
import fse from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import { ProjectConfig } from '../prompts';
import { templates } from '../templates';

const SHARED_ROOT = path.resolve(__dirname, '../../../shared');

export async function generateClaudeMd(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  if (config.projectType === 'fullstack') {
    await generateFullstackClaudeMd(targetPath, config);
  } else {
    await generateStandaloneClaudeMd(targetPath, config);
  }
}

async function generateFullstackClaudeMd(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const templateFile = path.join(SHARED_ROOT, 'claude', 'root.claude.md');
  const fullstackFile = path.join(SHARED_ROOT, 'claude', 'fullstack.claude.md');

  const rootContent = await renderTemplate(templateFile, config);
  const fullstackContent = await renderTemplate(fullstackFile, config);

  await fse.writeFile(
    path.join(targetPath, 'CLAUDE.md'),
    rootContent + '\n' + fullstackContent,
  );
}

async function generateStandaloneClaudeMd(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const templateFile = path.join(SHARED_ROOT, 'claude', 'root.claude.md');
  const standaloneFile = path.join(SHARED_ROOT, 'claude', 'standalone.claude.md');

  const rootContent = await renderTemplate(templateFile, config);
  const standaloneContent = await renderTemplate(standaloneFile, config);

  await fse.writeFile(
    path.join(targetPath, 'CLAUDE.md'),
    rootContent + '\n' + standaloneContent,
  );
}

async function renderTemplate(
  templateFile: string,
  config: ProjectConfig,
): Promise<string> {
  const template = await fse.readFile(templateFile, 'utf-8');
  const frontendTemplate = config.frontend ? templates[config.frontend] : undefined;
  const backendTemplate = config.backend ? templates[config.backend] : undefined;

  return ejs.render(template, {
    projectName: config.projectName,
    projectType: config.projectType,
    frontend: frontendTemplate,
    backend: backendTemplate,
  });
}
```

**Step 2: Commit**

```bash
git add cli/src/utils/claude-md.ts
git commit -m "feat: add CLAUDE.md generation utility with EJS rendering"
```

---

## Task 8: Create Shared CLAUDE.md EJS Templates

**Files:**
- Create: `shared/claude/root.claude.md`
- Create: `shared/claude/fullstack.claude.md`
- Create: `shared/claude/standalone.claude.md`

**Step 1: Create `shared/claude/root.claude.md`**

```markdown
# <%= projectName %>

## Tech Stack

<% if (frontend) { %>- **Frontend**: <%= frontend.displayName %><% if (projectType === 'fullstack') { %> — see `frontend/CLAUDE.md`<% } %>
<% } %><% if (backend) { %>- **Backend**: <%= backend.displayName %><% if (projectType === 'fullstack') { %> — see `backend/CLAUDE.md`<% } %>
<% } %>

## Workflow Pipeline

Follow this order for all new work:
1. Brainstorm → 2. Design → 3. Plan → 4. Scaffold → 5. Implement → 6. Test → 7. Review → 8. Deploy

See `.agent/skills/workflow-guide/` for the full process.

## Skills

| Skill | Description |
|-------|-------------|
| create-feature | End-to-end guide for adding a feature across the stack |
| deploy | Dockerize + CI/CD setup (delegates to sub-project deployment skills) |
| add-database-entity | Create entity + API + frontend integration |
| add-authentication | Wire up auth across frontend + backend |
| create-tests | Testing strategy across the full stack |
| workflow-guide | The full pipeline process reference |
```

**Step 2: Create `shared/claude/fullstack.claude.md`**

```markdown

## Project Structure

- `frontend/` — UI application
- `backend/` — API server
- `.agent/skills/` — cross-cutting skills for full-stack tasks

## Global Conventions

- Always read the relevant `CLAUDE.md` before working in a sub-project
- For cross-cutting work (feature spanning frontend + backend), start with `.agent/skills/create-feature/`

## Sub-Project Documentation

- [Frontend CLAUDE.md](frontend/CLAUDE.md)
- [Backend CLAUDE.md](backend/CLAUDE.md)
```

**Step 3: Create `shared/claude/standalone.claude.md`**

```markdown

## Global Conventions

- Always read `CLAUDE.md` before starting any work
- Use `.agent/skills/` for guided workflows
```

**Step 4: Commit**

```bash
git add shared/claude/
git commit -m "feat: add CLAUDE.md EJS templates for fullstack and standalone projects"
```

---

## Task 9: Create Shared Cross-Cutting Skills

**Files:**
- Create: `shared/skills/workflow-guide/SKILL.md`
- Create: `shared/skills/create-feature/SKILL.md`
- Create: `shared/skills/add-database-entity/SKILL.md`
- Create: `shared/skills/add-authentication/SKILL.md`
- Create: `shared/skills/deploy/SKILL.md`
- Create: `shared/skills/create-tests/SKILL.md`

**Step 1: Create `shared/skills/workflow-guide/SKILL.md`**

```markdown
---
name: workflow-guide
description: Reference for the 8-stage development pipeline. Use when starting any new work to understand the full process from brainstorm to deploy.
---

# Workflow Guide

## The Pipeline

Every piece of work follows these 8 stages in order. Do not skip stages.

### Stage 1: Brainstorm
- Explore the idea with the user
- Ask clarifying questions one at a time
- Define requirements and constraints
- Identify success criteria

### Stage 2: Design
- Propose 2-3 approaches with trade-offs
- Present the recommended approach with reasoning
- Write a design doc covering: architecture, components, data flow, error handling
- Get user approval before proceeding

### Stage 3: Plan
- Break the design into bite-sized implementation tasks
- Each task should be completable in 2-5 minutes
- Follow TDD: write failing test → implement → verify → commit
- Save the plan to `docs/plans/YYYY-MM-DD-<feature>.md`

### Stage 4: Scaffold
- If starting a new project, use `create-fullstack-app` CLI
- If adding to an existing project, create necessary files/folders

### Stage 5: Implement
- Follow the plan task by task
- TDD: write the test first, then the implementation
- Commit after each task
- For full-stack features, start with backend API → then frontend integration

### Stage 6: Test
- Run all test suites: unit, integration, e2e
- Verify no regressions
- Cover edge cases identified during planning

### Stage 7: Review
- Self-review: check for code quality, security, performance
- Request code review from team
- Address feedback

### Stage 8: Deploy
- Use the `deploy` skill to set up CI/CD if not already configured
- Merge to the appropriate branch
- Verify deployment succeeds
```

**Step 2: Create `shared/skills/create-feature/SKILL.md`**

```markdown
---
name: create-feature
description: End-to-end guide for adding a feature that spans frontend and backend. Use when adding any new feature that requires changes in both sub-projects.
---

# Create Feature (Full-Stack)

## Overview

This skill guides you through adding a feature across both the frontend and backend. Always start with the API contract, then build backend, then frontend.

## Step 1: Define the API Contract

Before writing any code, define:

1. **Endpoint(s)** — HTTP method, path, request body, response shape
2. **Entity changes** — new entities or modifications to existing ones
3. **Auth requirements** — public, authenticated, or admin-only

Present this to the user for approval before proceeding.

## Step 2: Backend Implementation

Work inside `backend/`. Follow the backend `CLAUDE.md` conventions.

1. Create or update the entity in the appropriate module
2. Create DTOs for request validation
3. Create the provider(s) with business logic
4. Create or update the controller with endpoints
5. Add Swagger decorators
6. Write unit tests for providers
7. Write controller tests
8. Run `npm run test` in the backend workspace to verify

## Step 3: Frontend Implementation

Work inside `frontend/`. Follow the frontend `CLAUDE.md` conventions.

1. Add API function(s) in the appropriate service file
2. Create or update Redux slice if state management is needed
3. Create the page/component following the project's component patterns
4. Wire up routing if a new page is needed
5. Handle loading, error, and empty states
6. Run `npm run build` in the frontend workspace to verify

## Step 4: Integration Verification

1. Start both frontend and backend dev servers
2. Test the full flow end-to-end manually
3. Verify error handling works correctly

## Standalone Projects

If the project is frontend-only or backend-only, follow only the relevant section above. Skip cross-project steps.
```

**Step 3: Create `shared/skills/add-database-entity/SKILL.md`**

```markdown
---
name: add-database-entity
description: Creates a new database entity in the backend with CRUD API endpoints and corresponding frontend pages. Use when adding a new data model to the project.
---

# Add Database Entity

## Overview

This skill creates a complete entity with CRUD operations across the stack. It follows the backend's module structure and the frontend's page conventions.

## Step 1: Ask the User

Before writing any code, ask:

1. **Entity name** — singular, PascalCase (e.g., `Product`, `Order`)
2. **Fields** — name, type, constraints (required, unique, default, etc.)
3. **Relations** — does it relate to other entities? (OneToMany, ManyToOne, etc.)
4. **Auth** — which endpoints need authentication? Which are admin-only?
5. **Frontend pages** — which CRUD pages are needed? (list, detail, create, edit)

## Step 2: Backend — Create the Module

Work inside `backend/`. Follow the backend `CLAUDE.md` module structure.

1. Create the module folder: `src/<entity-plural>/`
2. Create the entity file with TypeORM decorators
3. Create DTOs: `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `<entity>-query.dto.ts`
4. Create the service provider with CRUD operations
5. Create the controller with REST endpoints and Swagger decorators
6. Register the module in `app.module.ts`
7. Write unit tests for the service
8. Write controller tests

**Note:** Do not generate migrations for development. TypeORM `synchronize: true` handles schema changes. Migrations are only needed for staging/production and should be generated on explicit request.

## Step 3: Frontend — Create Pages

Work inside `frontend/`. Follow the frontend `CLAUDE.md` conventions.

1. Add API functions for the CRUD endpoints
2. Create Redux slice if needed
3. Create the list page with table/grid and pagination
4. Create the detail page
5. Create create/edit forms with validation (Formik + Yup)
6. Add routes to the route config
7. Run `npm run build` to verify

## Standalone Backend Projects

Skip Step 3 entirely. Only create the backend module.

## Standalone Frontend Projects

Skip Step 2. Assume the API already exists and create the frontend pages against it.
```

**Step 4: Create `shared/skills/add-authentication/SKILL.md`**

```markdown
---
name: add-authentication
description: Wires up authentication across frontend and backend. Connects backend JWT auth to frontend auth context, login/signup pages, token management, and protected routes.
---

# Add Authentication (Full-Stack)

## Overview

This skill connects the backend authentication system to the frontend. The backend template already includes JWT auth with access/refresh tokens. This skill wires up the frontend to consume it.

## Prerequisites

- Backend must have the auth module set up (included in nest-template by default)
- Frontend must have the API layer configured (included in react-template and next-template by default)

## Step 1: Verify Backend Auth Endpoints

Check that the backend has these endpoints available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Login with email/password, returns access + refresh tokens |
| `/auth/refresh` | POST | Refresh the access token |
| `/auth/forgot-password` | POST | Send password reset email |
| `/auth/reset-password` | POST | Reset password with token |
| `/users/signup` | POST | Register a new user |
| `/users/profile` | GET | Get current user profile |

If any are missing, create them following the backend `CLAUDE.md` conventions before proceeding.

## Step 2: Frontend — API Layer

1. Configure the Axios instance base URL to point to the backend
2. Set up the request interceptor to attach the access token
3. Set up the response interceptor for token refresh on 401
4. Create auth API functions: `login`, `signup`, `refreshToken`, `forgotPassword`, `resetPassword`, `getProfile`

## Step 3: Frontend — State Management

1. Create or verify the auth Redux slice with: `user`, `isAuthenticated`, `isLoading` state
2. Add async thunks: `loginUser`, `signupUser`, `refreshAuth`, `logoutUser`
3. Set up redux-persist for the auth slice

## Step 4: Frontend — Auth Pages

1. Create login page with form (email + password)
2. Create signup page with form
3. Create forgot password page
4. Create reset password page
5. Use Formik + Yup for form handling and validation

## Step 5: Frontend — Route Protection

1. Verify route guards redirect unauthenticated users to login
2. Verify authenticated users are redirected away from auth pages
3. Test the full auth flow: signup → login → access protected page → logout

## Standalone Projects

For backend-only: skip Steps 2-5, just verify the auth module works via Swagger.
For frontend-only: skip Step 1, implement Steps 2-5 against the expected API contract.
```

**Step 5: Create `shared/skills/deploy/SKILL.md`**

```markdown
---
name: deploy
description: Coordinates deployment setup across the full stack. Delegates to each sub-project's own deployment skills for Dockerfiles and CI/CD workflows. Adds path-scoped triggers for combined projects.
---

# Deploy (Full-Stack)

## Overview

This skill orchestrates deployment setup across the entire project. It does not generate Dockerfiles or workflows directly — it delegates to each sub-project's existing deployment skills and coordinates them.

## Step 1: Ask the User

1. **Target environment** — staging or production?
2. **Which parts to deploy?** — frontend only, backend only, or both?

## Step 2: Backend Deployment

If the project has a backend, delegate to the backend's deployment skills:

1. Invoke the `write-dockerfile` skill in `backend/` — it will ask for app name and port
2. Invoke the `github-workflow-docker-deploy` skill in `backend/` — it will ask for environment, env file path, app name, and port

## Step 3: Frontend Deployment

If the project has a frontend, set up the frontend deployment:

- **Next.js**: Uses `output: "standalone"` — generate a Dockerfile following the same two-stage pattern as the backend (build stage + production stage with `node server.js`)
- **React (Vite)**: Static build — generate a Dockerfile with nginx serving the built assets, or configure for static hosting (Vercel, Netlify, S3)

## Step 4: Path-Scoped Triggers (Full-Stack Only)

For combined projects, modify the generated GitHub Actions workflow files to add path filters:

Backend workflow — add to the `on.push` trigger:
```yaml
paths:
  - 'backend/**'
```

Frontend workflow — add to the `on.push` trigger:
```yaml
paths:
  - 'frontend/**'
```

This ensures pushing changes to one sub-project only triggers that sub-project's deployment.

## Standalone Projects

For standalone projects, skip Step 4. The workflow triggers on the branch directly without path filtering.
```

**Step 6: Create `shared/skills/create-tests/SKILL.md`**

```markdown
---
name: create-tests
description: Guides test creation across the full stack. Identifies what needs testing, presents edge cases, and generates tests following each sub-project's conventions.
---

# Create Tests (Full-Stack)

## Overview

This skill guides you through creating tests for a feature across the entire stack. It follows each sub-project's testing conventions and patterns.

## Step 1: Identify What Needs Testing

Ask the user:

1. **What feature or module?** — name of the feature to test
2. **Which layers?** — backend only, frontend only, or both?

## Step 2: Backend Tests

Follow the backend `CLAUDE.md` testing conventions. Three layers:

| Layer | File pattern | Location |
|-------|-------------|----------|
| Unit | `*.spec.ts` | Inside provider folder alongside source |
| Controller | `*.controller.spec.ts` | Next to controller file |
| E2E | `*.e2e-spec.ts` | `test/` directory |

### Before writing any tests:

1. Read the source code for the module being tested
2. Identify all edge cases grouped by category:
   - Validation, Auth/Authorization, Business logic, Database, Error handling, Boundary conditions, Response format
3. Present the edge case matrix to the user
4. Ask: "Are there any edge cases I'm missing?"
5. Only proceed after confirmation

### Mocking conventions:

- Use `Test.createTestingModule` with provider overrides
- Mock repositories with `getRepositoryToken(Entity)`
- Never mock the class under test
- Reset mocks in `beforeEach`

## Step 3: Frontend Tests

Follow the frontend conventions:

1. Component tests — verify rendering, user interactions, state changes
2. Integration tests — verify API calls, Redux state updates
3. Use the project's configured test runner

## Step 4: Run and Verify

1. Run backend tests: `npm run test --workspace=backend`
2. Run frontend tests: `npm run test --workspace=frontend` (if applicable)
3. Run e2e tests: `npm run test:e2e --workspace=backend` (if applicable)
4. Verify all pass with no regressions

## Standalone Projects

Run only the relevant test suite for the project type.
```

**Step 7: Commit**

```bash
git add shared/skills/
git commit -m "feat: add shared cross-cutting skills (workflow-guide, create-feature, add-database-entity, add-authentication, deploy, create-tests)"
```

---

## Task 10: Build the Scaffold Orchestrator

**Files:**
- Create: `cli/src/scaffold.ts`

**Step 1: Create `cli/src/scaffold.ts`**

```typescript
import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { ProjectConfig } from './prompts';
import { templates } from './templates';
import { copyTemplate, renameAgentMdToClaudeMd } from './utils/copy';
import { createRootPackageJson } from './utils/workspace';
import { initGitRepo } from './utils/git';
import { generateClaudeMd } from './utils/claude-md';

const SHARED_SKILLS_ROOT = path.resolve(__dirname, '../../shared/skills');

export async function scaffold(config: ProjectConfig): Promise<void> {
  const targetPath = path.resolve(process.cwd(), config.projectName);

  if (await fse.pathExists(targetPath)) {
    throw new Error(`Directory "${config.projectName}" already exists`);
  }

  console.log(chalk.blue(`\nCreating project: ${config.projectName}\n`));

  await fse.ensureDir(targetPath);

  if (config.projectType === 'fullstack') {
    await scaffoldFullstack(targetPath, config);
  } else {
    await scaffoldStandalone(targetPath, config);
  }

  await generateClaudeMd(targetPath, config);
  await copySharedSkills(targetPath, config);
  await createGitignore(targetPath);

  if (config.initGit) {
    console.log(chalk.gray('Initializing git repository...'));
    initGitRepo(targetPath);
  }

  console.log(chalk.green(`\nProject "${config.projectName}" created successfully!`));
  console.log(chalk.gray(`\nNext steps:`));
  console.log(chalk.gray(`  cd ${config.projectName}`));
  console.log(chalk.gray(`  npm install`));

  if (config.projectType === 'fullstack') {
    console.log(chalk.gray(`  npm run dev:backend`));
    console.log(chalk.gray(`  npm run dev:frontend`));
  } else {
    console.log(chalk.gray(`  npm run dev`));
  }
}

async function scaffoldFullstack(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const frontendTemplate = templates[config.frontend!];
  const backendTemplate = templates[config.backend!];

  const frontendPath = path.join(targetPath, 'frontend');
  const backendPath = path.join(targetPath, 'backend');

  console.log(chalk.gray(`Copying ${frontendTemplate.displayName} template...`));
  await copyTemplate(frontendTemplate.path, frontendPath);
  await renameAgentMdToClaudeMd(frontendPath);

  console.log(chalk.gray(`Copying ${backendTemplate.displayName} template...`));
  await copyTemplate(backendTemplate.path, backendPath);

  console.log(chalk.gray('Setting up npm workspaces...'));
  await createRootPackageJson(targetPath, config.projectName);
}

async function scaffoldStandalone(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const templateName = config.frontend || config.backend!;
  const template = templates[templateName];

  console.log(chalk.gray(`Copying ${template.displayName} template...`));
  await copyTemplate(template.path, targetPath);

  if (template.type === 'frontend') {
    await renameAgentMdToClaudeMd(targetPath);
  }
}

async function copySharedSkills(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const skillsTarget = path.join(targetPath, '.agent', 'skills');
  await fse.ensureDir(skillsTarget);

  const allSkills = [
    'workflow-guide',
    'create-feature',
    'create-tests',
    'deploy',
  ];

  const backendSkills = ['add-database-entity'];
  const fullstackSkills = ['add-authentication'];

  const skillsToCopy = [...allSkills];

  if (config.projectType === 'fullstack' || config.projectType === 'backend') {
    skillsToCopy.push(...backendSkills);
  }

  if (config.projectType === 'fullstack') {
    skillsToCopy.push(...fullstackSkills);
  }

  for (const skill of skillsToCopy) {
    const src = path.join(SHARED_SKILLS_ROOT, skill);
    const dest = path.join(skillsTarget, skill);
    if (await fse.pathExists(src)) {
      await fse.copy(src, dest);
    }
  }

  console.log(chalk.gray(`Copied ${skillsToCopy.length} shared skills`));
}

async function createGitignore(targetPath: string): Promise<void> {
  const gitignoreContent = `node_modules
dist
.env*
!.env.example
coverage
.DS_Store
*.log
`;
  await fse.writeFile(path.join(targetPath, '.gitignore'), gitignoreContent);
}
```

**Step 2: Commit**

```bash
git add cli/src/scaffold.ts
git commit -m "feat: add scaffold orchestrator for fullstack and standalone projects"
```

---

## Task 11: Wire Up the CLI Entry Point

**Files:**
- Modify: `cli/src/index.ts`

**Step 1: Update `cli/src/index.ts`**

Replace the stub with:

```typescript
#!/usr/bin/env node

import chalk from 'chalk';
import { getProjectConfig } from './prompts';
import { scaffold } from './scaffold';

async function main(): Promise<void> {
  console.log(chalk.bold('\ncreate-fullstack-app\n'));

  try {
    const config = await getProjectConfig();
    await scaffold(config);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\nError: ${error.message}`));
    }
    process.exit(1);
  }
}

main();
```

**Step 2: Build and verify**

Run: `cd cli && npm run build`
Expected: Compiles to `dist/` with no errors.

**Step 3: Commit**

```bash
git add cli/src/index.ts
git commit -m "feat: wire up CLI entry point with prompts and scaffold"
```

---

## Task 12: Create the Root CLAUDE.md for the Templates Repo

**Files:**
- Create: `CLAUDE.md`

**Step 1: Create `CLAUDE.md`**

```markdown
# Templates

Project scaffolding system with reusable templates and a CLI tool for generating full-stack projects.

## Structure

- `cli/` — `create-fullstack-app` CLI tool (Node.js + TypeScript)
- `shared/` — Shared CLAUDE.md templates and cross-cutting skills
- `nest-template/` — NestJS backend template
- `react-template/` — React (Vite) frontend template
- `next-template/` — Next.js frontend template
- `docs/plans/` — Design and implementation plans

## CLI Tool

Build and run locally:

```bash
cd cli && npm install && npm run build
node dist/index.js
```

## Templates

Each template has its own documentation:

- [nest-template/CLAUDE.md](nest-template/CLAUDE.md) — NestJS conventions and skills
- [react-template/AGENT.md](react-template/AGENT.md) — React conventions and skills
- [next-template/AGENT.md](next-template/AGENT.md) — Next.js conventions and skills

## Shared Skills

Cross-cutting skills in `shared/skills/` are copied into generated projects:

| Skill | Description |
|-------|-------------|
| workflow-guide | 8-stage development pipeline reference |
| create-feature | End-to-end feature creation across the stack |
| add-database-entity | Entity + CRUD API + frontend pages |
| add-authentication | Wire up auth across frontend + backend |
| deploy | Dockerize + CI/CD (delegates to sub-project skills) |
| create-tests | Testing strategy across the full stack |
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add root CLAUDE.md for templates repo"
```

---

## Task 13: Initialize Git and Create Root Package.json

**Files:**
- Create: `package.json`
- Create: `.gitignore`

**Step 1: Initialize git repo**

Run: `cd /Users/haseebshams/Desktop/Code/templates && git init`

**Step 2: Create root `.gitignore`**

```
node_modules
dist
.env*
!.env.example
coverage
.DS_Store
*.log
```

**Step 3: Create root `package.json`**

```json
{
  "name": "templates",
  "version": "1.0.0",
  "private": true,
  "description": "Project scaffolding system with reusable templates and CLI tool"
}
```

**Step 4: Commit everything**

```bash
git add -A
git commit -m "feat: complete fullstack workflow pipeline system"
```

---

## Task 14: End-to-End Testing

**Step 1: Build the CLI**

Run: `cd cli && npm run build`
Expected: No errors.

**Step 2: Test full-stack scaffold**

Run: `cd /tmp && node /Users/haseebshams/Desktop/Code/templates/cli/dist/index.js`
Select: Full-stack → Next.js → NestJS → Yes (git)
Expected: Project created with `frontend/`, `backend/`, root `CLAUDE.md`, `.agent/skills/`, `package.json` with workspaces.

**Step 3: Test standalone frontend scaffold**

Run: `cd /tmp && node /Users/haseebshams/Desktop/Code/templates/cli/dist/index.js`
Select: Frontend only → React (Vite) → Yes (git)
Expected: Project created with template files at root, `CLAUDE.md`, `.agent/skills/` (no backend-only skills).

**Step 4: Test standalone backend scaffold**

Run: `cd /tmp && node /Users/haseebshams/Desktop/Code/templates/cli/dist/index.js`
Select: Backend only → NestJS → Yes (git)
Expected: Project created with template files at root, `CLAUDE.md`, `.agent/skills/` (no fullstack-only skills).

**Step 5: Verify generated CLAUDE.md content**

For each test, read the generated `CLAUDE.md` and verify:
- Project name is correctly injected
- Tech stack lists the correct template(s)
- Skills table is present
- Sub-project links are correct (fullstack) or absent (standalone)

**Step 6: Commit any fixes**

If any issues found during testing, fix and commit.

# Full-Stack Workflow Pipeline Design

**Date:** 2026-04-07
**Status:** Approved

## Overview

A complete project workflow system for scaffolding, documenting, and managing full-stack projects. Three pillars:

1. **CLI scaffolding tool** (`create-fullstack-app`) — generates new projects from templates
2. **Reusable template repo** — existing templates (NestJS, React, Next.js) with centralized documentation
3. **Workflow process guide** — 8-stage pipeline from brainstorm to deploy

## Architecture: Template Bundler

The CLI lives inside `templates/cli/`. Existing templates remain untouched. The CLI copies templates into a target directory, injects a root `CLAUDE.md`, wires up npm workspaces for combined projects, and drops in shared skills.

## Directory Structure (templates/ repo)

```
templates/
├── cli/                          # create-fullstack-app CLI tool
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # Entry point (bin command)
│   │   ├── prompts.ts            # Interactive prompts (inquirer)
│   │   ├── scaffold.ts           # Core scaffolding logic
│   │   ├── templates.ts          # Template registry & metadata
│   │   └── utils/
│   │       ├── copy.ts           # File copy + variable injection
│   │       ├── workspace.ts      # npm workspace setup
│   │       ├── git.ts            # Git init + initial commit
│   │       └── claude-md.ts      # CLAUDE.md generation from EJS templates
│   └── README.md
│
├── shared/                       # Shared assets injected into generated projects
│   ├── claude/                   # CLAUDE.md templates (with EJS placeholders)
│   │   ├── root.claude.md        # Root-level CLAUDE.md template
│   │   ├── fullstack.claude.md   # Additional rules for combined projects
│   │   └── standalone.claude.md  # For single frontend/backend projects
│   └── skills/                   # Cross-cutting shared skills
│       ├── create-feature/
│       ├── deploy/
│       ├── add-database-entity/
│       ├── workflow-guide/
│       ├── add-authentication/
│       └── create-tests/
│
├── nest-template/                # Existing (untouched)
├── react-template/               # Existing (untouched)
├── next-template/                # Existing (untouched)
│
├── docs/
│   └── plans/
├── CLAUDE.md
├── package.json
└── .gitignore
```

## Generated Project Structure

### Full-stack (e.g., NestJS + Next.js)

```
my-saas-app/
├── frontend/
│   ├── CLAUDE.md                 # Frontend-specific rules
│   ├── .agent/skills/            # Frontend skills
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── CLAUDE.md                 # Backend-specific rules
│   ├── .agent/skills/            # Backend skills
│   ├── package.json
│   └── ...
│
├── .agent/
│   └── skills/
│       ├── create-feature/
│       ├── deploy/
│       ├── add-database-entity/
│       ├── workflow-guide/
│       ├── add-authentication/
│       └── create-tests/
│
├── CLAUDE.md                     # Root — global rules + links to sub-projects
├── package.json                  # npm workspaces: ["frontend", "backend"]
└── .gitignore
```

### Standalone (e.g., just NestJS)

```
my-api/
├── CLAUDE.md                     # Combined root + backend rules
├── .agent/
│   └── skills/                   # Backend skills + applicable shared skills
├── package.json
└── ...                           # Template files at root level
```

## CLI Tool: create-fullstack-app

### User Flow

```
? Project name: my-saas-app
? What do you want to create?
  > Full-stack (frontend + backend)
    Frontend only
    Backend only

? Pick a frontend:       (shown if full-stack or frontend only)
  > Next.js
    React (Vite)

? Pick a backend:        (shown if full-stack or backend only)
  > NestJS

? Initialize git repo? (Y/n)
```

### Scaffolding Steps

1. Create target directory
2. Copy selected template(s) into the right folders (full-stack: `frontend/` + `backend/`, standalone: root)
3. Generate root `CLAUDE.md` from EJS templates using project metadata
4. Copy shared `.agent/skills/` (filtered by project type)
5. For full-stack: generate root `package.json` with npm workspaces
6. Rename `AGENT.md` to `CLAUDE.md` in frontend templates
7. Run `npm install`
8. Initialize git + create initial commit (if opted in)

### Core Modules

| File | Responsibility |
|------|---------------|
| `index.ts` | Parses args, runs prompts, calls scaffold |
| `prompts.ts` | Inquirer prompt definitions and flow logic |
| `scaffold.ts` | Orchestrates the full scaffolding pipeline |
| `templates.ts` | Registry of available templates with metadata |
| `utils/copy.ts` | Copies files, ignores `node_modules`/`.git`, handles renames |
| `utils/workspace.ts` | Generates root `package.json` with npm workspaces |
| `utils/git.ts` | `git init` + initial commit |
| `utils/claude-md.ts` | Generates `CLAUDE.md` from EJS templates |

### Template Registry

```typescript
const templates = {
  'nest': { name: 'NestJS', type: 'backend', path: 'nest-template' },
  'react': { name: 'React (Vite)', type: 'frontend', path: 'react-template' },
  'next': { name: 'Next.js', type: 'frontend', path: 'next-template' },
};
```

### Dependencies

- `inquirer` — interactive prompts
- `fs-extra` — file operations
- `chalk` — terminal colors
- `ejs` — CLAUDE.md template rendering

## Root CLAUDE.md Template

Generated for full-stack projects:

```markdown
# {Project Name}

{Brief description}

## Tech Stack

- **Frontend**: {frontend name} — see `frontend/CLAUDE.md`
- **Backend**: {backend name} — see `backend/CLAUDE.md`

## Project Structure

- `frontend/` — UI application
- `backend/` — API server
- `.agent/skills/` — cross-cutting skills for full-stack tasks

## Global Conventions

- Always read the relevant `CLAUDE.md` before working in a sub-project
- For cross-cutting work (feature spanning frontend + backend), start with `.agent/skills/create-feature/`

## Workflow Pipeline

Follow this order for all new work:
1. Brainstorm > 2. Design > 3. Plan > 4. Scaffold > 5. Implement > 6. Test > 7. Review > 8. Deploy

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

## Sub-Project Documentation

- [Frontend CLAUDE.md](frontend/CLAUDE.md)
- [Backend CLAUDE.md](backend/CLAUDE.md)
```

For standalone projects, this is simplified with no sub-project references and filtered skills.

## Shared Skills

| Skill | Trigger | What it does |
|-------|---------|-------------|
| **workflow-guide** | Starting any new work | Reference doc for the 8-stage pipeline (brainstorm to deploy). Describes each stage and which tools/skills to use |
| **create-feature** | "Add feature X" | Walks through: define API contract, create backend endpoint, create frontend integration, add tests. Coordinates across both sub-projects |
| **add-database-entity** | "Add a new entity/table" | Creates TypeORM entity in backend, creates CRUD API endpoints, scaffolds frontend pages/components. Migrations only generated on explicit request (staging/production), not for development |
| **add-authentication** | "Wire up auth" | Connects backend JWT auth to frontend: auth context/store, login/signup pages, token management, protected routes, API interceptors |
| **deploy** | "Set up deployment" | Coordinates deployment across the stack. Delegates to each sub-project's own deployment skills (write-dockerfile, github-workflow-docker-deploy, etc.). Adds path-scoped triggers for combined projects |
| **create-tests** | "Add tests for X" | Identifies what needs testing across the stack, generates unit/integration/e2e tests following each sub-project's testing conventions |

For standalone projects, only applicable skills are copied (e.g., frontend-only projects won't get add-database-entity).

## CI/CD Strategy

- GitHub Actions workflows are **not** generated during scaffolding
- They are generated only when the `deploy` skill is invoked
- For combined projects: path-scoped triggers so frontend and backend deploy independently

```yaml
# deploy-backend.yml
on:
  push:
    branches: [staging, production]
    paths:
      - 'backend/**'

# deploy-frontend.yml
on:
  push:
    branches: [staging, production]
    paths:
      - 'frontend/**'
```

## Workflow Pipeline Stages

1. **Brainstorm** — explore the idea, define requirements
2. **Design** — write spec/design doc, get approval
3. **Plan** — break into implementation steps
4. **Scaffold** — spin up the project using the CLI tool
5. **Implement** — build features (TDD, agent-driven development)
6. **Test** — unit, integration, e2e
7. **Review** — code review before merge
8. **Deploy** — Dockerize, CI/CD, push to production

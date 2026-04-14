# Full-Stack App Templates

Project scaffolding system with a CLI tool and three production-ready templates for building full-stack applications.

## Templates

| Template | Stack | Docs |
|----------|-------|------|
| `nest-template` | NestJS 11, PostgreSQL, TypeORM, JWT auth | [CLAUDE.md](nest-template/CLAUDE.md) |
| `next-template` | Next.js 16, React 19, Redux Toolkit, Tailwind v4 | [CLAUDE.md](next-template/CLAUDE.md) |
| `react-template` | React 19, Vite 7, Redux Toolkit, Tailwind v4 | [CLAUDE.md](react-template/CLAUDE.md) |

## CLI

Scaffold a new full-stack project interactively:

```bash
cd cli && npm install && npm run build
node dist/index.js
```

Or link it globally:

```bash
cd cli && npm link
create-fullstack-app
```

The CLI prompts for:

| Prompt | Options |
|--------|---------|
| Project name | lowercase, hyphens only |
| Project type | fullstack / frontend / backend |
| Frontend | Next.js or React (Vite) |
| Backend | NestJS, Supabase (coming soon), Firebase (coming soon) |
| Admin panel | copies `react-template` → `admin/` |
| Mobile app | creates `mobile-app/` placeholder (coming soon) |
| Git init | yes / no |

### Generated project structure (fullstack + admin + mobile)

```
my-project/
├── frontend/         # chosen frontend template
├── backend/          # NestJS template
├── admin/            # React (Vite) admin panel
├── mobile-app/       # placeholder (CLAUDE.md only)
├── .agent/skills/    # shared cross-cutting skills
├── .gitignore
└── CLAUDE.md
```

## Repository Structure

```
├── cli/                  # create-fullstack-app CLI tool (Node.js + TypeScript)
├── nest-template/        # NestJS backend template (submodule)
├── next-template/        # Next.js frontend template (submodule)
├── react-template/       # React (Vite) frontend template (submodule)
├── shared/
│   ├── skills/           # Cross-cutting skills copied into generated projects
│   └── claude/           # Shared CLAUDE.md fragments for AI agents
└── CLAUDE.md             # AI agent instructions for this repo
```

## Shared Skills

Skills in `shared/skills/` are copied into every generated project and cover cross-cutting workflows:

| Skill | Description |
|-------|-------------|
| `workflow-guide` | Feature-driven development pipeline (requirements → deploy) |
| `create-feature` | End-to-end feature creation across the stack |
| `add-database-entity` | Entity + CRUD API + frontend pages |
| `add-authentication` | Wire up auth across frontend + backend |
| `deploy` | Deployment reference — delegates to per-template skills |
| `create-tests` | Testing strategy across the full stack |

## Template Skills Structure

Each template organises its AI agent knowledge into two folders:

```
.agent/
├── skills/     # Guided workflows (how to add pages, components, auth, etc.)
└── rules/      # Coding standards always applied (naming, file size, no magic strings)
```

## Development Workflow

Documented in `shared/skills/workflow-guide/SKILL.md`:

1. Requirements & Specification → client approval
2. Data Modeling (ERD)
3. Theme Definition (colors, typography, spacing)
4. Design Spec (Figma-first or build-while-designing)
5. Reusable Components audit
6. Per-feature build cycle: document → build UI → integrate APIs → test

## Updating Submodules

```bash
# Pull latest for all submodules
git submodule update --remote

# Clone with submodules
git clone --recurse-submodules <repo-url>
```

# Full-Stack App Templates

Project scaffolding system with a CLI tool and three production-ready templates for building full-stack applications.

## Templates

| Template | Stack | Docs |
|----------|-------|------|
| `nest-template` | NestJS 11, PostgreSQL, TypeORM, JWT auth | [AGENTS.md](nest-template/AGENTS.md) |
| `next-template` | Next.js 16, React 19, Redux Toolkit, Tailwind v4 | [AGENTS.md](next-template/AGENTS.md) |
| `react-template` | React 19, Vite 7, Redux Toolkit, Tailwind v4 | [AGENTS.md](react-template/AGENTS.md) |

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
| Modules | web app / backend / admin / mobile |
| Web app | Next.js or React (Vite) |
| Backend | NestJS, Supabase (coming soon), Firebase (coming soon) |
| Admin panel | React (Vite) |
| Mobile app | placeholder (coming soon) |
| Git init | yes / no |

### Generated project structure (fullstack + admin + mobile)

```
my-project/
├── web-app/          # chosen frontend template
├── backend/          # NestJS template
├── admin/            # React (Vite) admin panel
├── mobile-app/       # placeholder with AGENTS.md
├── .agents/skills/    # shared cross-cutting skills
├── .claude/skills/    # compatibility copy for Claude Code
├── .gitignore
├── CLAUDE.md         # points to AGENTS.md
└── AGENTS.md         # project rules
```

## Repository Structure

```
├── cli/                  # create-fullstack-app CLI tool (Node.js + TypeScript)
├── nest-template/        # NestJS backend template (submodule)
├── next-template/        # Next.js frontend template (submodule)
├── react-template/       # React (Vite) frontend template (submodule)
├── shared/
│   ├── skills/           # Cross-cutting skills copied into generated projects
│   └── instructions/     # Source fragments for generated AGENTS.md
├── CLAUDE.md             # Compatibility pointer
└── AGENTS.md             # Agent instructions for this repo
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
| `create-tests` | Focused backend tests for material risks |

## Template Skills Structure

Each template has `AGENTS.md` as its instruction entry point. Its existing task guides and rules remain here:

```
.claude/
├── skills/     # Guided workflows (how to add pages, components, auth, etc.)
└── rules/      # Coding standards always applied (naming, file size, no magic strings)
```

## Development Workflow

Documented in `shared/skills/workflow-guide/SKILL.md`:

For new projects: define requirements, data model, theme, and screen design. For each feature: confirm behavior and material risks, build, integrate APIs, then verify. Show plans for multi-step work; save them when requested. UI acceptance is manual.

## Updating Submodules

```bash
# Pull latest for all submodules
git submodule update --remote

# Clone with submodules
git clone --recurse-submodules <repo-url>
```

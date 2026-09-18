# Templates

Project scaffolding system with reusable templates and a CLI tool for generating full-stack projects.

## Structure

- `cli/` — `create-fullstack-app` CLI tool (Node.js + TypeScript)
- `shared/` — Shared CLAUDE.md templates and cross-cutting skills
- `nest-template/` — NestJS backend template
- `react-template/` — React (Vite) frontend template
- `next-template/` — Next.js frontend template
- `docs/plans/` — Design and implementation plans

## Coding Standards

- **Function size** — no function (in `cli/` or any code across this monorepo) may exceed **300–350 lines**. Prefer splitting large functions into smaller, focused functions — several small functions are always better than one large 350-line function. Each template repo enforces the same in its own coding standards.

## CLI Tool

Build and run locally:

```bash
cd cli && npm install && npm run build
node dist/index.js
```

The CLI prompts for:
- Project name and type (fullstack / frontend / backend)
- Frontend template (Next.js or React/Vite)
- Backend template (NestJS, Supabase — coming soon, Firebase — coming soon)
- Admin panel — copies `react-template` into `admin/`
- Mobile app — creates `mobile-app/` placeholder with empty `CLAUDE.md` (coming soon)
- Git init

## Templates

Each template has its own documentation:

- [nest-template/CLAUDE.md](nest-template/CLAUDE.md) — NestJS conventions and skills
- [react-template/CLAUDE.md](react-template/CLAUDE.md) — React conventions and skills
- [next-template/CLAUDE.md](next-template/CLAUDE.md) — Next.js conventions and skills

## Shared Skills

Cross-cutting skills in `shared/skills/` are copied into generated projects:

| Skill | Description |
|-------|-------------|
| workflow-guide | Feature-driven development pipeline reference |
| create-feature | End-to-end feature creation across the stack |
| add-database-entity | Entity + CRUD API + frontend pages |
| add-authentication | Wire up auth across frontend + backend |
| deploy | Dockerize + CI/CD (delegates to sub-project skills) |
| create-tests | Testing strategy across the full stack |
| workflow-feature | Orchestrator skill that drives the per-feature subagent pipeline |

## Shared Agents

Cross-cutting subagents in `shared/agents/` are copied into generated projects at `.claude/agents/`. They drive the per-feature pipeline orchestrated by the `workflow-feature` skill.

| Agent | Role |
|-------|------|
| feature-planner | Write the feature plan file |
| api-contract-designer | Lock request/response shapes |
| backend-builder | Implement backend (parallel with frontend) |
| frontend-builder | Implement UI (parallel with backend) |
| integration-wire | Wire UI to API, handle all states |
| test-author | Write business-logic tests |
| code-reviewer | Review diff against plan and conventions |
| commit-pr-agent | Conventional commit + PR |
| test-runner | Background full test suite |
| build-verifier | Background typecheck/lint/build |
| doc-updater | Background CLAUDE.md updates after merge |

Orchestration logic: [shared/skills/workflow-feature/SKILL.md](shared/skills/workflow-feature/SKILL.md).

## Dropdown Standard

Both frontend templates use one `Dropdown` API for selections and action menus. Keep their implementation and interaction tests aligned. Each template remains independently scaffoldable.

Dropdowns backed by paginated APIs must load subsequent pages through infinite scrolling with the API's normal page size. Never replace pagination with oversized limits such as `100` or `200`, or eager fetching of every page. Use `selectedItem` for an existing selection that is not on the first page.

- [Client specification](docs/SPECIFICATION.md)
- [Dropdown requirements](docs/requirements/01-dropdown.md)
- [Implementation plan](docs/plans/2026-09-17-unified-dropdown.md)
- [Design context](docs/DESIGN.md)

## Date and Time Picker Standard

Both frontend templates must use the shared DatePicker and TimePicker wrappers for all date/time entry. Native date, time and datetime-local inputs and direct package usage outside these wrappers are prohibited. ESLint guards both rules. See [picker requirements](docs/requirements/02-date-time-pickers.md).

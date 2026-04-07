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

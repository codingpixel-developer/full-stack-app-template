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

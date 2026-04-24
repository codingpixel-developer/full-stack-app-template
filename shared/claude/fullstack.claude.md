
## Project Structure

<% modules.forEach(function(m) { -%>
- `<%= m.folder %>/` — <%= m.label %>
<% }); -%>
- `docs/` — All project documentation
- `.claude/skills/` — cross-cutting skills

## Documentation Rules

- **Workflow is mandatory** — always follow the workflow pipeline (brainstorm → design → plan → scaffold → implement → test → review → deploy). Do not skip stages.
- **Plans** — save all implementation plans to `docs/plans/YYYY-MM-DD-<topic>.md`
- **Requirements** — save all requirements documents to `docs/requirements/`
- **Specifications** — write a full specification in `docs/specification.md`, in plain language understandable by both clients and developers
- **ERD** — create and maintain the entity-relationship diagram in `docs/erd.md`

## CLAUDE.md Hierarchy

1. **Root `CLAUDE.md`** (this file) — global rules, workflow, documentation standards.
2. **Sub-project `CLAUDE.md`** (per-module) — stack-specific conventions, patterns, and skills.

When rules conflict, root takes precedence. Always read root first, then the relevant sub-project docs.

## Module Management

This project is scaffolded by `create-fullstack-app`. The installed modules are tracked in `fullstack.config.json`. To add more modules later (backend, web-app, admin, mobile), re-run the CLI inside this directory.

## Global Conventions

- Always read the relevant `CLAUDE.md` before working in a sub-project
- For cross-cutting work, start with `.claude/skills/create-feature/`

## Sub-Project Documentation

<% modules.forEach(function(m) { -%>
<% if (m.hasClaudeMd) { -%>
- [<%= m.label %>](<%= m.folder %>/CLAUDE.md)
<% } -%>
<% }); -%>

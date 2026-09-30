
## Project Structure

<% modules.forEach(function(m) { -%>
- `<%= m.folder %>/` — <%= m.label %>
<% }); -%>
- `docs/` — All project documentation
- `.agents/skills/` — cross-cutting skills (`.claude/skills/` remains for Claude Code)

## Documentation Rules

- **Workflow** — use existing requirements and designs for feature work. Show a plan for multi-step changes; verify the affected code once after changes. UI acceptance is manual; add focused backend tests when risk warrants them.
- **Plans** — ask whether to save a plan. If requested, use `docs/plans/YYYY-MM-DD-<topic>.md`.
- **Requirements** — save all requirements documents to `docs/requirements/`
- **Specifications** — write a full specification in `docs/specification.md`, in plain language understandable by both clients and developers
- **ERD** — create and maintain the entity-relationship diagram in `docs/erd.md`

## AGENTS.md Hierarchy

1. **Root `AGENTS.md`** (this file) — global rules, workflow, documentation standards.
2. **Sub-project `AGENTS.md`** (per-module) — stack-specific conventions, patterns, and skills.

When rules conflict, root takes precedence. Always read root first, then the relevant sub-project docs.

## Module Management

This project is scaffolded by `create-fullstack-app`. The installed modules are tracked in `fullstack.config.json`. To add more modules later (backend, web-app, admin, mobile), re-run the CLI inside this directory.

## Global Conventions

- Always read the relevant `AGENTS.md` before working in a sub-project
- For cross-cutting work, start with `.agents/skills/create-feature/`
- **Function size** — no function may exceed **300–350 lines**; split large functions into smaller, focused ones (several small functions are always preferred over one big function)

## Sub-Project Documentation

<% modules.forEach(function(m) { -%>
<% if (m.hasAgentInstructions) { -%>
- [<%= m.label %>](<%= m.folder %>/AGENTS.md)
<% } -%>
<% }); -%>

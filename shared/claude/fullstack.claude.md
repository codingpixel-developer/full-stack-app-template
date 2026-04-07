
## Project Structure

- `frontend/` — UI application
- `backend/` — API server
- `docs/` — All project documentation
- `.agent/skills/` — cross-cutting skills for full-stack tasks

## Documentation Rules

- **Workflow is mandatory** — always follow the workflow pipeline (brainstorm → design → plan → scaffold → implement → test → review → deploy). Do not skip stages.
- **Plans** — save all implementation plans to `docs/plans/YYYY-MM-DD-<topic>.md`
- **Requirements** — save all requirements documents to `docs/requirements/`
- **Specifications** — write a full specification in `docs/specification.md`, written in plain language understandable by both clients and developers
- **ERD** — create and maintain the entity-relationship diagram in `docs/erd.md`

## CLAUDE.md Hierarchy

1. **Root `CLAUDE.md`** (this file) — global rules, workflow, documentation standards. These apply everywhere.
2. **Sub-project `CLAUDE.md`** (`frontend/CLAUDE.md`, `backend/CLAUDE.md`) — stack-specific conventions, patterns, and skills. These apply only when working inside that sub-project.

When rules conflict, root takes precedence. Always read root first, then the relevant sub-project docs.

## Global Conventions

- Always read the relevant `CLAUDE.md` before working in a sub-project
- For cross-cutting work (feature spanning frontend + backend), start with `.agent/skills/create-feature/`

## Sub-Project Documentation

- [Frontend CLAUDE.md](frontend/CLAUDE.md)
- [Backend CLAUDE.md](backend/CLAUDE.md)

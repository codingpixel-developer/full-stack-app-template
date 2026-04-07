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

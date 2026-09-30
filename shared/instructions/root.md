# <%= projectName %>

## Tech Stack

<% modules.forEach(function(m) { -%>
- **<%= m.label %>**: <%= m.templateDisplay %><% if (m.hasAgentInstructions) { %> — see `<%= m.folder %>/AGENTS.md`<% } %>
<% }); -%>

## Workflow Pipeline

For new projects, establish requirements, data model, and design before implementation. For each feature, confirm behavior and material risks, implement, verify, and review. Show a plan for multi-step work; save it only when requested.

See `.agents/skills/workflow-guide/` for the full process.

UI acceptance is manual; do not add or run automated UI tests. Add focused backend tests only for material business rules, security, data integrity, or regressions. Run relevant static and build checks once after changes.

## Coding Standards

- **Function size** — no function may exceed **300–350 lines**; split large functions into smaller, focused ones (several small functions are always preferred over one big function). Follow each sub-project's linked coding standards for the full rules.

## Skills

| Skill | Description |
|-------|-------------|
| create-feature | End-to-end guide for adding a feature across the stack |
| deploy | Dockerize + CI/CD setup (delegates to sub-project deployment skills) |
| add-database-entity | Create entity + API + frontend integration |
| add-authentication | Wire up auth across frontend + backend |
| create-tests | Focused backend tests for material risks |
| workflow-guide | The full pipeline process reference |

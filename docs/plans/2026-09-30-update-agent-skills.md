# Update Agent Skills

## Goal

Align shared and template skills with the current development cycle: manual UI acceptance, focused backend tests for material risks, and one relevant verification pass after changes.

## Changes

1. Use existing requirements and project configuration before asking questions. Ask only for missing decisions, in one round when possible.
2. Remove mandatory approval and plan-file pauses from routine feature work. Show a plan for multi-step changes; save it only when requested.
3. Add focused risk-based test guidance to NestJS integration skills. Keep build and deployment checks relevant to the changed files.
4. Replace tool-specific wording in deployment skills with agent-neutral file editing instructions.
5. Keep generated project instructions and repository documentation consistent with the skills.

## Verification

- Validate skill frontmatter and scan for stale mandatory question, approval, and test rules.
- Run `git diff --check` in the parent repository and affected submodules.
- Stage and review the Markdown changes. Do not commit or push.

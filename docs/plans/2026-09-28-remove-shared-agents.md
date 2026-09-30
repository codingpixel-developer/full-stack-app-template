# Remove Shared Agents Implementation Plan

**Goal:** Stop storing and generating shared agent role briefs.

**Scope:** Remove `shared/agents/`, its dependent `workflow-feature` skill, CLI role-copy and queue-state code, and references in active project instructions. Preserve task-specific shared skills and template instructions. No commits or pushes.

## Tasks

1. Remove shared role briefs and the agent orchestration skill that depends on them.
2. Remove CLI calls and helpers that copy role briefs or create queue state.
3. Remove role-brief references from `AGENTS.md`, generated instruction templates, and READMEs.
4. Build CLI and smoke-test generated output for shared skills without role or queue directories.
5. Check diffs and stage changes for review.

## Verification

- `npm run build` in `cli/`
- Generated-project smoke check using local shared resources
- Search active source for stale references to shared roles and orchestration skill
- `git diff --check` and staged diff review

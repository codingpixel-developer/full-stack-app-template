# Risk-Based Verification Implementation Plan

**Goal:** Reduce test-writing and repeat verification while keeping checks proportional to change risk.

**Scope:** Shared workflow guidance, generated project instructions, backend testing guidance, frontend instructions, and active component requirements. No commits or pushes.

## Policy

- UI appearance and interactions are accepted through manual review. Do not add or run automated UI tests for frontend work.
- Run relevant frontend typecheck, lint, and build checks once after changes.
- Add focused backend tests for material business rules, security, data integrity, and bug regressions.
- Run affected backend tests once after changes. Rerun after a failure or fix. Use broader suites only for cross-module work or release gates.
- Identify relevant edge cases before implementation. Ask about behavior only when requirements are unclear; no mandatory edge-case approval pause.
- Do not require TDD or all three backend test layers for every endpoint.

## Tasks

1. Align `workflow-guide`, `create-feature`, `create-tests`, and related shared skills with this policy.
2. Update generated `AGENTS.md` fragments and root project guidance.
3. Update NestJS testing rules, testing skill, and README.
4. Update React and Next.js instructions for manual UI acceptance.
5. Update active dropdown, date/time picker, and design requirements. Keep existing test files unless separately requested for removal.
6. Build CLI, render generated instructions, check active guidance for conflicting mandates, and stage changes.

## Verification

- `npm run build` in `cli/`
- Generated-project smoke check for manual UI acceptance and focused backend tests
- Search active instructions for conflicting mandatory test rules
- `git diff --check` in parent repository and each submodule

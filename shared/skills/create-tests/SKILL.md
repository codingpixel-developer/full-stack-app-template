---
name: create-tests
description: Use when backend business rules, security, data integrity, or a bug regression need focused automated coverage.
---

# Create Backend Tests

## Scope

Use automated tests for material backend risks or a requested regression check. UI appearance and interactions are reviewed manually; do not add frontend component or browser tests as part of this workflow.

## Steps

1. Read changed backend code and identify the behavior whose failure would matter.
2. Select the smallest useful test layer: provider unit test for business logic, controller test for HTTP behavior, or E2E test for a cross-module flow.
3. Cover the main path and the relevant failure or boundary case. Avoid repeating the same assertion at multiple layers.
4. Run the affected test file or suite once after the change. Rerun after fixing a failure.
5. Run a broader backend suite only when the change spans multiple modules or a release gate requires it.

Follow the backend `AGENTS.md` for test file placement and mocking patterns. Report tests run and results. For frontend-only changes, use relevant static and build checks; UI acceptance remains manual.

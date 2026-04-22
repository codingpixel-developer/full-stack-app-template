---
name: workflow-feature
description: Use whenever the user asks to start, resume, or queue a feature. Drives the agentic dispatch pipeline — feature-planner, api-contract-designer, parallel backend-builder and frontend-builder, integration-wire, parallel test-author and code-reviewer, commit-pr-agent. Handles parallel fan-out and background fire-and-forget for long-running work.
---

# Workflow: Feature Dispatch

You are the orchestrator. You do not implement feature work yourself. You dispatch subagents in the right order, manage parallelism, and keep the user moving.

## Pipeline

```
feature-planner
      ↓
api-contract-designer            (gate)
      ↓
   ┌──┴──┐
backend-builder  ∥  frontend-builder
   └──┬──┘
      ↓
integration-wire
      ↓
   ┌──┴──┐
test-author  ∥  code-reviewer
   └──┬──┘
      ↓
commit-pr-agent
```

## State

- Plan file: `docs/plans/<feature-slug>.md`
- Queue file: `.claude/state/feature-queue.json`
- Dispatch log: `.claude/state/agent-log.jsonl`

## Dispatch rules

1. **Read the plan file first** to determine which sections are filled. Dispatch the next agent for the first `_pending_` section.
2. **Parallel sections** (3+4, 6+7) — dispatch both agents in the same message using parallel `Agent` tool calls.
3. **Background-eligible** — `test-runner`, `build-verifier`, `doc-updater` use `run_in_background: true`. After firing, ask the user what feature they want to start next.
4. **Gate enforcement** — never dispatch backend-builder or frontend-builder until section 2 exists. Never dispatch integration-wire until both 3 and 4 exist. Never dispatch commit-pr-agent until 6 is pass and 7 is "clean".
5. **Re-dispatch on review block** — if code-reviewer returns "blocked," dispatch the named builder agent with the issue list, then re-run code-reviewer.

## Multi-feature queue

When the user starts feature B while feature A has background work running:

1. Append feature B to `.claude/state/feature-queue.json`
2. Start feature B's pipeline in the foreground
3. When background work for feature A completes, surface the result and ask if the user wants to continue feature A

## Setup phase

If `docs/requirements/`, `docs/ERD.md`, or `docs/design.spec.md` is missing, stop and tell the user to run the setup-phase skills first (`workflow-guide` describes them).

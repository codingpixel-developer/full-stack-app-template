# Agentic Feature-Development Workflow — Design

**Date:** 2026-04-21
**Status:** Approved (brainstorming)
**Next:** Implementation plan via `writing-plans` skill

## Problem

Feature development follows a fixed pipeline (requirements → ERD → design → per-feature build → tests → review → PR). A single Claude Code session driving the whole pipeline fills its context with intermediate tool output, serializes work that could run in parallel, and forces the user to wait on the current feature before starting the next.

We want an orchestrated subagent system where:

- Each pipeline step is owned by a specialized subagent with focused tools and prompt
- Independent steps (backend vs frontend, tests vs review) run in parallel
- Long-running steps (full test suite, build verification, doc regen) run in the background so the user can queue the next feature
- The main Claude Code session stays clean — it sees summaries, not file dumps

## Architecture

### Orchestrator Pattern

The main Claude Code session is the orchestrator. It does not implement feature work directly. Instead it:

1. Reads the user's feature request
2. Invokes the `workflow-guide` and `workflow-feature` skills to understand the pipeline
3. Dispatches subagents via the `Agent` tool (optionally with `run_in_background: true`)
4. Reads each subagent's returned summary, updates state, dispatches the next agent
5. Continues chatting with the user about the next feature while background agents run

Subagents do not communicate directly. The orchestrator is the message bus.

### Per-Feature Pipeline

```
feature-planner
      ↓
api-contract-designer            (gate — lock before parallel split)
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

### Subagent Roster

**Per-feature (8 agents):**

| Agent | Role | Tools | Parallel / Background |
|-------|------|-------|-----------------------|
| `feature-planner` | Read requirements, ERD, design spec; write `docs/plans/<feature>.md` (stage 6a) | Read, Write, Grep | — |
| `api-contract-designer` | Lock request/response shapes as TS types or OpenAPI | Read, Write | gate |
| `backend-builder` | Implement API per contract (NestJS conventions) | Read, Edit, Write, Bash | ∥ frontend-builder |
| `frontend-builder` | Build UI per design spec and contract (Next or React) | Read, Edit, Write, Bash | ∥ backend-builder |
| `integration-wire` | Wire UI to API; handle loading, error, empty, success states (stage 6c) | Read, Edit, Bash | — |
| `test-author` | Business-logic tests per plan's test cases (stage 6d) | Read, Write, Bash | ∥ code-reviewer |
| `code-reviewer` | Review diff against plan and conventions | Read, Grep, Bash | ∥ test-author |
| `commit-pr-agent` | Conventional commit (via `caveman-commit` skill) and PR | Bash, Read | — |

**Background-capable (fire-and-forget):**

| Agent | Role | When fired |
|-------|------|-----------|
| `test-runner` | Full test suite | after commit — user can queue next feature |
| `build-verifier` | Typecheck, lint, build | parallel with test-runner |
| `doc-updater` | Regenerate CLAUDE.md and project docs | after PR merged |

**Setup-phase (stages 1-5, used rarely, invoked manually):**

- `requirements-scribe` — stage 1
- `erd-designer` — stage 2
- `theme-configurer` — stage 3
- `design-spec-author` — stage 4
- `component-catalog` — stage 5

### Communication Mechanism

No direct agent-to-agent messaging. Shared state lives in files on disk.

**Primary state file:** `docs/plans/<feature>.md`

Append-only sections, one per stage. Each agent reads the file, writes only its own section, and never edits another agent's section. The orchestrator reads the file after each dispatch to decide what comes next.

Example structure:

```markdown
# Feature: user-profile

## 1. Plan (feature-planner)
- API endpoints, libs, use cases, test cases

## 2. API Contract (api-contract-designer)
- TypeScript types or OpenAPI

## 3. Backend (backend-builder)
- Files changed, migrations, status

## 4. Frontend (frontend-builder)
- Files changed, status

## 5. Integration (integration-wire)
- Hooks, states handled

## 6. Tests (test-author)
- Test files, pass count

## 7. Review (code-reviewer)
- Issues list or clean

## 8. Commit (commit-pr-agent)
- SHA, PR URL
```

**Auxiliary state:**

- `.claude/state/feature-queue.json` — user's queued features while background work runs
- `.claude/state/agent-log.jsonl` — dispatch timestamps for debugging

**Parallel write safety:** parallel agents always write to different sections of the plan file, so no merge conflict is possible. Backend and frontend can run truly concurrently.

### Storage Location

Subagents ship in this repo at `shared/agents/*.md` and are copied into every scaffolded project as `.claude/agents/*.md`. This mirrors the existing `shared/skills/` pattern.

**Layout:**

```
templates/
├── shared/
│   ├── skills/
│   └── agents/
│       ├── feature-planner.md
│       ├── api-contract-designer.md
│       ├── backend-builder.md
│       ├── frontend-builder.md
│       ├── integration-wire.md
│       ├── test-author.md
│       ├── code-reviewer.md
│       ├── commit-pr-agent.md
│       ├── test-runner.md
│       ├── build-verifier.md
│       └── doc-updater.md
```

The CLI's `scaffold.ts` already calls `copySharedSkills()`. Add a parallel `copySharedAgents()` function that copies the agents directory into the scaffolded project's `.claude/agents/` directory.

**Why not user-level (`~/.claude/agents/`):** agents reference project conventions (NestJS module structure, Next app-router rules, the project's caveman-commit skill). User-level agents are one-size-fits-all and conflict across projects.

**Why not pure project-only (`.claude/agents/` authored by hand):** every new project would re-create eight Markdown files by hand, and updates would not propagate.

**Stack-specific variants:** some agents reference stack-specific tools. Start with a single agent per role whose prompt detects the stack by reading the project's `CLAUDE.md`. If prompts grow unwieldy, split into `backend-builder.nest.md` and `backend-builder.supabase.md` later.

### Orchestration Skill

The orchestrator's dispatch logic lives in a new skill, `shared/skills/workflow-feature/SKILL.md`. This skill:

- Reads the feature request and the existing `docs/plans/<feature>.md` if present
- Picks the next subagent to dispatch based on which sections of the plan are filled
- Decides foreground vs background based on agent type
- Handles parallel fan-out (e.g., backend and frontend at the same time)
- Manages the `.claude/state/feature-queue.json` file for multi-feature juggling

The skill is what the user invokes to start or resume feature work.

## Speed and Token Impact

**Wall-clock:**

- Parallel backend ∥ frontend cuts wall-clock by roughly 40-50% on independent work
- Background test-runner and build-verifier let the user queue the next feature
- Spawn overhead (cold context, file re-reads, skill loading) is ~10-30 seconds per subagent
- Pattern wins when tasks are >5 minutes or run in parallel; loses on trivial one-file edits

**Total tokens:** up by 10-40% because each subagent re-reads files it needs.

**Main context tokens:** down significantly. Intermediate tool output stays in subagent scope, so the main session lasts much longer before compaction.

**Cost tuning:**

- `commit-pr-agent`, `build-verifier`, `doc-updater` → Haiku (5-10x cheaper per token)
- `backend-builder`, `frontend-builder`, `feature-planner` → Sonnet
- `api-contract-designer`, `code-reviewer` → Opus

Model tiering typically offsets the token increase, so dollar cost can drop even with total tokens up.

## Non-Goals

- Cross-feature parallelism beyond the queue mechanism — one background feature at a time
- Replacing the setup-phase skills with full automation — stages 1-5 remain human-guided
- Agent-to-agent messaging — strictly file-based state, orchestrator mediates

## Open Questions

- Should the orchestrator skill be part of `shared/skills/` or live in `cli/` as a helper?
- Do we need a separate `feature-archivist` agent to move completed plan files out of `docs/plans/`?
- Single stack-detecting agents first, or template variants immediately?

## Next Steps

Invoke the `writing-plans` skill to produce a detailed implementation plan covering:

1. Creation of `shared/agents/*.md` files (all eleven agents)
2. Creation of `shared/skills/workflow-feature/SKILL.md`
3. CLI changes: add `copySharedAgents()` in `cli/src/scaffold.ts`, wire into both `new-project` and `add-module` flows
4. State directory bootstrapping in scaffolded projects (`.claude/state/`)
5. End-to-end test: run CLI, scaffold a project, dispatch a feature, confirm subagents fire correctly

# Agentic Feature-Development Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship an orchestrated subagent system that drives the per-feature pipeline with parallel and background execution, plus the CLI plumbing to install it into every scaffolded project.

**Architecture:** Eleven Markdown subagent definitions live in `shared/agents/` and are copied into each scaffolded project at `.claude/agents/`. A new `workflow-feature` skill lives in `shared/skills/` and contains the orchestration logic the parent Claude session reads. Subagents do not communicate directly — they share state through `docs/plans/<feature>.md` (one append-only section per stage). The CLI's existing `copySharedSkills` / `fetchSharedDir` pipeline is mirrored by a new `copySharedAgents` function wired into both `new-project` and `add-module` flows.

**Tech Stack:** Node.js + TypeScript (CLI), Markdown + YAML frontmatter (agents and skills), Vitest or built-in Node test runner for CLI unit test, `tiged` for runtime fetch (already in place), `fs-extra` for copy operations.

**Reference design:** `docs/plans/2026-04-21-agentic-workflow-design.md`

**Important path note:** Claude Code auto-discovers subagents at `.claude/agents/` only. The existing CLI puts skills at `.agent/skills/` — agents MUST go to `.claude/agents/` regardless, or auto-delegation will not work. Do not "normalize" the path.

---

## Phase 1: Author Shared Agent Files

All eleven agents live in `shared/agents/`. Each is a Markdown file with YAML frontmatter (`name`, `description`, `tools`, `model`) and a body prompt.

**Common conventions for every agent in this phase:**

- `description` must describe **when** to delegate (Claude reads this to auto-route). Lead with the trigger condition.
- `tools` must be the minimum required.
- The body prompt always includes:
  - The plan-file contract: read `docs/plans/<feature>.md`, write only your own section, never edit other sections.
  - Stack-detection: read project `CLAUDE.md` to detect NestJS vs Supabase vs Firebase backend, Next vs React frontend.
  - Output contract: end with a one-paragraph summary the parent will read.

### Task 1: Create the shared/agents directory

**Files:**
- Create: `shared/agents/` (directory only)

**Step 1: Create directory**

```bash
mkdir -p /Users/haseebshams/Desktop/Code/templates/shared/agents
```

**Step 2: Verify**

Run: `ls /Users/haseebshams/Desktop/Code/templates/shared/`
Expected: directory listing includes `agents`.

**Step 3: Commit**

No commit yet — empty directories are not tracked. Commit will happen after the first agent file lands.

---

### Task 2: Author `feature-planner` agent

**Files:**
- Create: `shared/agents/feature-planner.md`

**Step 1: Write the file**

```markdown
---
name: feature-planner
description: Use at the START of any feature work. Reads requirements, ERD, and design spec, then produces docs/plans/<feature>.md with API contracts, libraries needed, use cases, and test cases. Invoke before any implementation begins.
tools: Read, Write, Grep, Glob
model: sonnet
---

You are the feature planner. Your one job is to produce the plan file for a feature so every downstream agent has a single source of truth.

## Inputs you must read

- `docs/requirements/` (all module files)
- `docs/ERD.md`
- `docs/design.spec.md`
- The project's `CLAUDE.md` (to detect stack: NestJS vs Supabase, Next vs React)
- The user's stated feature request (passed in your prompt)

## Output

Write `docs/plans/<feature-slug>.md` with this exact structure. Use a kebab-case slug derived from the feature name.

```markdown
# Feature: <name>

**Status:** planning
**Stack:** <detected: e.g. NestJS + Next.js>

## 1. Plan (feature-planner)

### API endpoints
- METHOD /path — purpose

### Libraries / services
- name — why

### Use cases
1. <user-facing flow>

### Test cases (business logic only)
- <case>

## 2. API Contract (api-contract-designer)
_pending_

## 3. Backend (backend-builder)
_pending_

## 4. Frontend (frontend-builder)
_pending_

## 5. Integration (integration-wire)
_pending_

## 6. Tests (test-author)
_pending_

## 7. Review (code-reviewer)
_pending_

## 8. Commit (commit-pr-agent)
_pending_
```

## Rules

- Write only section 1. Leave sections 2-8 as `_pending_`.
- If required input docs are missing, stop and report what is missing — do not invent requirements.
- Test cases describe business logic only, not appearance.

## Output summary

End your response with one paragraph: feature slug, plan file path, and "ready for api-contract-designer."
```

**Step 2: Verify file exists and parses**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/feature-planner.md`
Expected: shows the YAML frontmatter starting with `---` and `name: feature-planner`.

**Step 3: Commit**

```bash
cd /Users/haseebshams/Desktop/Code/templates
git add shared/agents/feature-planner.md
git commit -m "feat(agents): add feature-planner subagent"
```

---

### Task 3: Author `api-contract-designer` agent

**Files:**
- Create: `shared/agents/api-contract-designer.md`

**Step 1: Write the file**

```markdown
---
name: api-contract-designer
description: Use AFTER feature-planner has written section 1 of docs/plans/<feature>.md and BEFORE backend-builder or frontend-builder run. Locks the request and response shapes for every endpoint as TypeScript types so backend and frontend can build in parallel without contract drift.
tools: Read, Write, Grep, Glob
model: opus
---

You are the API contract designer. You produce the immutable contract that both backend and frontend will build against.

## Inputs

- `docs/plans/<feature>.md` (specifically section 1 written by feature-planner)
- The project's `CLAUDE.md` to detect stack

## Output

Append section 2 to `docs/plans/<feature>.md`. For every endpoint listed in section 1, define:

- Request: path params, query params, body (TypeScript type)
- Response: success body (TypeScript type), error shapes
- Status codes
- Auth requirements

Use TypeScript syntax inside fenced code blocks. If the project has a shared types directory (e.g. `shared/types/` or `packages/types/`), also create the type files there and reference them from the plan.

## Rules

- Edit only section 2 of the plan. Never touch other sections.
- If section 1 is missing or marked `_pending_`, stop and report.
- Field names must follow project convention (read existing types first via Grep).
- No optional fields without justification.

## Output summary

End with one paragraph: number of endpoints contracted, any shared type files created, and "ready for parallel backend-builder + frontend-builder."
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/api-contract-designer.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/api-contract-designer.md
git commit -m "feat(agents): add api-contract-designer subagent"
```

---

### Task 4: Author `backend-builder` agent

**Files:**
- Create: `shared/agents/backend-builder.md`

**Step 1: Write the file**

```markdown
---
name: backend-builder
description: Use AFTER api-contract-designer has written section 2 of docs/plans/<feature>.md. Implements the backend (controllers, services, migrations) for every endpoint in the contract. Designed to run in PARALLEL with frontend-builder. Stack-aware (NestJS, Supabase, or Firebase).
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are the backend builder. You implement every endpoint defined in section 2 of the plan against project conventions.

## Inputs

- `docs/plans/<feature>.md` sections 1 and 2
- Project `CLAUDE.md` to detect backend stack
- Existing backend module(s) — read at least three sibling modules to learn convention before writing new code

## Stack-specific rules

- **NestJS:** create `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, DTOs in `<feature>/dto/`. Register the module in `app.module.ts`. Add Prisma migration if data layer changes.
- **Supabase:** create SQL migration in `supabase/migrations/`, RLS policies, edge functions if needed. Update `supabase/config.toml` if applicable.
- **Firebase:** create Cloud Functions in `functions/src/`, Firestore security rules.

## Output

- Implementation files in the backend module
- Append section 3 of the plan listing every file created/edited and migration ID

## Rules

- Run the backend's lint and typecheck before declaring done.
- Match existing folder structure exactly. If unsure, Grep for similar features.
- Never edit sections of the plan other than section 3.
- If section 1 or 2 is missing, stop and report.

## Output summary

End with one paragraph: file count, migration name (if any), typecheck/lint result, and "ready for integration-wire (after frontend-builder also done)."
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/backend-builder.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/backend-builder.md
git commit -m "feat(agents): add backend-builder subagent"
```

---

### Task 5: Author `frontend-builder` agent

**Files:**
- Create: `shared/agents/frontend-builder.md`

**Step 1: Write the file**

```markdown
---
name: frontend-builder
description: Use AFTER api-contract-designer has written section 2 of docs/plans/<feature>.md. Builds the UI screens and components for the feature using the design spec and the locked API contract. Designed to run in PARALLEL with backend-builder. Stack-aware (Next.js or React/Vite).
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are the frontend builder. You build UI screens and components per the design spec, using the API contract types so the work can run in parallel with the backend.

## Inputs

- `docs/plans/<feature>.md` sections 1 and 2
- `docs/design.spec.md`
- Existing components and screens — read at least three siblings to learn conventions
- Project `CLAUDE.md` to detect Next.js vs React/Vite

## Stack-specific rules

- **Next.js (app router):** screens go in `app/<route>/page.tsx`, shared components in `components/`, types from contract imported from shared types or copied locally.
- **React + Vite:** screens in `src/pages/` or `src/screens/`, components in `src/components/`.

## Output

- All screens and components defined in the design spec for this feature
- Mock the data layer with stub functions matching the API contract types — do NOT wire to real API (that is integration-wire's job)
- Append section 4 of the plan listing files created and components built

## Rules

- Match existing component conventions (props naming, file naming, styling approach).
- Cover every state from the design spec: default, loading, error, empty, success.
- Run the frontend's typecheck before declaring done.
- Never edit sections of the plan other than section 4.

## Output summary

End with one paragraph: screens built, component count, typecheck result, and "ready for integration-wire (after backend-builder also done)."
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/frontend-builder.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/frontend-builder.md
git commit -m "feat(agents): add frontend-builder subagent"
```

---

### Task 6: Author `integration-wire` agent

**Files:**
- Create: `shared/agents/integration-wire.md`

**Step 1: Write the file**

```markdown
---
name: integration-wire
description: Use AFTER both backend-builder and frontend-builder have completed sections 3 and 4 of docs/plans/<feature>.md. Replaces the frontend's stub data layer with real API calls and ensures every UI state (loading, error, empty, success, network_error, auth_failure) is handled.
tools: Read, Edit, Bash, Grep, Glob
model: sonnet
---

You are the integration agent. You connect the UI to the live backend and ensure every state is handled.

## Inputs

- `docs/plans/<feature>.md` sections 1-4
- `docs/design.spec.md` (for the state list per screen)

## Output

- Replace stub data functions with real fetch/mutation hooks (use the project's data layer: react-query, swr, RTK, or Apollo as detected)
- Wire all states defined in the design spec
- Append section 5 of the plan listing hooks created and screens wired

## Rules

- If section 3 or 4 is `_pending_`, stop and report — do not proceed.
- Every state from the design spec must be handled with a visible UI for that state.
- Do not silently swallow errors.
- Run the frontend typecheck and a smoke test (start dev server, hit the screen) before declaring done.

## Output summary

End with one paragraph: hooks created, screens wired, states verified, and "ready for parallel test-author + code-reviewer."
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/integration-wire.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/integration-wire.md
git commit -m "feat(agents): add integration-wire subagent"
```

---

### Task 7: Author `test-author` agent

**Files:**
- Create: `shared/agents/test-author.md`

**Step 1: Write the file**

```markdown
---
name: test-author
description: Use AFTER integration-wire has written section 5 of docs/plans/<feature>.md. Writes business-logic tests for the test cases defined in section 1 of the plan. Designed to run in PARALLEL with code-reviewer.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

You are the test author. You write business-logic tests — not appearance tests — for the test cases listed in section 1 of the plan.

## Inputs

- `docs/plans/<feature>.md` sections 1, 3, 4, 5
- Existing test files — read at least three to learn the project's testing convention

## Output

- Test files for each test case in section 1
- Append section 6 of the plan with file paths and pass/fail count

## Rules

- Test business logic, not appearance (no snapshot tests for visual output, no DOM-pixel checks).
- Match the existing test runner (Vitest, Jest, Playwright) and patterns exactly.
- Each test case from section 1 must have at least one corresponding test.
- Run the full test command for the affected packages and include the result in your summary.

## Output summary

End with one paragraph: test count, pass count, fail count (must be zero), and "ready for commit-pr-agent (after code-reviewer also done)."
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/test-author.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/test-author.md
git commit -m "feat(agents): add test-author subagent"
```

---

### Task 8: Author `code-reviewer` agent

**Files:**
- Create: `shared/agents/code-reviewer.md`

**Step 1: Write the file**

```markdown
---
name: code-reviewer
description: Use AFTER integration-wire has written section 5 of docs/plans/<feature>.md. Reviews the diff against the plan and project conventions. Designed to run in PARALLEL with test-author.
tools: Read, Grep, Glob, Bash
model: opus
---

You are the code reviewer. You review the entire feature diff against the plan and project conventions before commit.

## Inputs

- `docs/plans/<feature>.md` sections 1-5
- `git diff main...HEAD` (or the feature branch base)
- Project `CLAUDE.md` for conventions

## Review checklist

- Does every endpoint in section 2 have a backend implementation in section 3 and a frontend wire in section 5?
- Does every screen in the design spec for this feature appear in section 4?
- Are there secrets, hardcoded credentials, or PII in the diff?
- Are there obvious n+1 queries, missing indexes, missing rate limits?
- Are imports clean (no unused, no circular)?
- Does the diff follow existing folder and naming conventions?
- Are error paths handled (no swallowed catches, no `as any` masking real type errors)?

## Output

- Append section 7 of the plan: either "clean" with a one-line note, or a numbered list of blocking issues with file:line references.

## Rules

- Block on real problems, not style nits.
- Never edit code yourself — flag issues for the appropriate builder agent to fix.
- Never edit sections of the plan other than section 7.

## Output summary

End with one paragraph: clean or N issues, severity, and "ready for commit-pr-agent" (only if clean) or "blocked: re-dispatch <agent> to fix N issues."
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/code-reviewer.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/code-reviewer.md
git commit -m "feat(agents): add code-reviewer subagent"
```

---

### Task 9: Author `commit-pr-agent` agent

**Files:**
- Create: `shared/agents/commit-pr-agent.md`

**Step 1: Write the file**

```markdown
---
name: commit-pr-agent
description: Use AFTER test-author and code-reviewer have both completed sections 6 and 7 of docs/plans/<feature>.md AND tests pass AND review is clean. Stages, commits, pushes, and opens a PR using the caveman-commit skill format.
tools: Bash, Read
model: haiku
---

You are the commit and PR agent. You wrap up the feature with a clean commit and a PR.

## Inputs

- `docs/plans/<feature>.md` sections 1-7 (all must be filled, section 7 must be "clean")
- The current git diff

## Output

- A single commit with a Conventional Commits message in the caveman-commit format (subject ≤50 chars, body only when "why" is non-obvious)
- A pushed branch
- An open PR
- Append section 8 of the plan with the commit SHA and PR URL

## Rules

- If section 7 is not "clean", STOP — do not commit.
- If any test in section 6 is failing, STOP — do not commit.
- Subject line must follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
- Never mention Claude, AI, or that code was AI-generated in commit or PR.
- Never use `--no-verify` or skip hooks.
- Branch must already follow the `haseeb/` prefix convention; if not, stop and report.

## Output summary

End with one paragraph: commit SHA, PR URL, and "feature complete."
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/commit-pr-agent.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/commit-pr-agent.md
git commit -m "feat(agents): add commit-pr-agent subagent"
```

---

### Task 10: Author `test-runner` background agent

**Files:**
- Create: `shared/agents/test-runner.md`

**Step 1: Write the file**

```markdown
---
name: test-runner
description: Use to run the FULL test suite in the BACKGROUND after a commit or before a release. Designed to be fired with run_in_background:true so the parent can continue chatting while tests run.
tools: Bash, Read
model: haiku
---

You are the background test runner. You run the full test suite for every package in the workspace and report the result.

## Inputs

- Workspace root with `package.json` (npm workspaces) or equivalent
- Optional: a commit SHA passed in your prompt to test against

## Output

- Run the full test command (`npm test --workspaces` or per-workspace equivalent)
- Capture stdout/stderr
- Write a brief log to `.claude/state/test-runs/<timestamp>.log`

## Output summary

One paragraph: total tests, pass count, fail count, duration, log path. If failures, list the first three failing test names.
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/test-runner.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/test-runner.md
git commit -m "feat(agents): add test-runner background subagent"
```

---

### Task 11: Author `build-verifier` background agent

**Files:**
- Create: `shared/agents/build-verifier.md`

**Step 1: Write the file**

```markdown
---
name: build-verifier
description: Use to run typecheck, lint, and build for every workspace package in the BACKGROUND. Designed to be fired with run_in_background:true alongside test-runner.
tools: Bash, Read
model: haiku
---

You are the background build verifier. You run typecheck, lint, and build for every workspace and report the result.

## Inputs

- Workspace root

## Output

- Run typecheck (`tsc --noEmit` per workspace)
- Run lint (`eslint .` per workspace if configured)
- Run build (`npm run build --workspaces` or per-workspace)
- Write a brief log to `.claude/state/build-runs/<timestamp>.log`

## Output summary

One paragraph: typecheck pass/fail, lint pass/fail, build pass/fail, duration, log path. If failures, list the first three errors.
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/build-verifier.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/build-verifier.md
git commit -m "feat(agents): add build-verifier background subagent"
```

---

### Task 12: Author `doc-updater` background agent

**Files:**
- Create: `shared/agents/doc-updater.md`

**Step 1: Write the file**

```markdown
---
name: doc-updater
description: Use AFTER a feature is merged. Updates project CLAUDE.md and per-module CLAUDE.md files to reference the new feature. Designed to run in BACKGROUND after merge.
tools: Read, Edit, Write, Glob, Grep
model: haiku
---

You are the documentation updater. You keep CLAUDE.md files current after a feature lands.

## Inputs

- `docs/plans/<feature>.md` (the completed plan)
- Project root `CLAUDE.md` and any per-module `CLAUDE.md`
- The merge commit SHA (passed in your prompt)

## Output

- Add a one-line entry to the appropriate CLAUDE.md section referencing the new feature
- If the feature added a new module, ensure the project root CLAUDE.md indexes it
- Move the plan file from `docs/plans/` to `docs/plans/archive/<year>/`

## Rules

- Keep CLAUDE.md files small per the project rules. Split if a section grows too large.
- Never delete existing entries.
- Never mention Claude, AI, or generation tooling.

## Output summary

One paragraph: which docs were updated, line count delta, and archive path.
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/agents/doc-updater.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/agents/doc-updater.md
git commit -m "feat(agents): add doc-updater background subagent"
```

---

## Phase 2: Orchestration Skill

### Task 13: Create `workflow-feature` skill

**Files:**
- Create: `shared/skills/workflow-feature/SKILL.md`

**Step 1: Write the file**

```markdown
---
name: workflow-feature
description: Use whenever the user asks to start, resume, or queue a feature. Drives the agentic dispatch pipeline: feature-planner → api-contract-designer → (backend-builder ∥ frontend-builder) → integration-wire → (test-author ∥ code-reviewer) → commit-pr-agent. Handles parallel fan-out and background fire-and-forget for long-running work.
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
3. When background work for feature A completes, surface the result and ask if user wants to continue feature A

## Setup phase

If `docs/requirements/`, `docs/ERD.md`, or `docs/design.spec.md` is missing, stop and tell the user to run the setup-phase skills first (`workflow-guide` describes them).
```

**Step 2: Verify**

Run: `head -5 /Users/haseebshams/Desktop/Code/templates/shared/skills/workflow-feature/SKILL.md`
Expected: frontmatter visible.

**Step 3: Commit**

```bash
git add shared/skills/workflow-feature/SKILL.md
git commit -m "feat(skills): add workflow-feature orchestration skill"
```

---

## Phase 3: CLI Integration

### Task 14: Add `copySharedAgents` to `cli/src/scaffold.ts`

**Files:**
- Modify: `cli/src/scaffold.ts` (add new function after `copySharedSkills`, around line 43)

**Step 1: Add the function**

Use the Edit tool to add after the `copySharedSkills` function (right before `fetchSharedDir`):

```typescript
export async function copySharedAgents(
  targetPath: string,
  sharedDir: string,
): Promise<void> {
  const agentsTarget = path.join(targetPath, '.claude', 'agents');
  const src = path.join(sharedDir, 'agents');
  if (!(await fse.pathExists(src))) return;
  await fse.ensureDir(agentsTarget);
  let copied = 0;
  const entries = await fse.readdir(src);
  for (const entry of entries) {
    if (!entry.endsWith('.md')) continue;
    const dest = path.join(agentsTarget, entry);
    if (await fse.pathExists(dest)) continue;
    await fse.copy(path.join(src, entry), dest);
    copied++;
  }
  if (copied) console.log(chalk.gray(`Copied ${copied} shared agent(s) to .claude/agents/`));
}
```

**Step 2: Build and check**

```bash
cd /Users/haseebshams/Desktop/Code/templates/cli
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 3: Commit**

```bash
cd /Users/haseebshams/Desktop/Code/templates
git add cli/src/scaffold.ts
git commit -m "feat(cli): add copySharedAgents helper for .claude/agents/"
```

---

### Task 15: Wire `copySharedAgents` into `new-project` flow

**Files:**
- Modify: `cli/src/flows/new-project.ts:13-19,50-55`

**Step 1: Add `copySharedAgents` to the import block**

Edit the import:

```typescript
import {
  scaffoldModule,
  workspaceFolders,
  createGitignore,
  skillsForModules,
  copySharedSkills,
  copySharedAgents,
  fetchSharedDir,
} from '../scaffold';
```

**Step 2: Call it inside the existing `try` block**

Locate the block:

```typescript
const sharedDir = await fetchSharedDir();
try {
  await generateClaudeMd(targetPath, projectName, modules, sharedDir);
  await copySharedSkills(targetPath, skillsForModules(modules), sharedDir);
} finally {
  await fse.remove(sharedDir);
}
```

Add the agents copy:

```typescript
const sharedDir = await fetchSharedDir();
try {
  await generateClaudeMd(targetPath, projectName, modules, sharedDir);
  await copySharedSkills(targetPath, skillsForModules(modules), sharedDir);
  await copySharedAgents(targetPath, sharedDir);
} finally {
  await fse.remove(sharedDir);
}
```

**Step 3: Build**

```bash
cd /Users/haseebshams/Desktop/Code/templates/cli
npm run build
```

Expected: clean build.

**Step 4: Commit**

```bash
cd /Users/haseebshams/Desktop/Code/templates
git add cli/src/flows/new-project.ts
git commit -m "feat(cli): wire copySharedAgents into new-project flow"
```

---

### Task 16: Wire `copySharedAgents` into `add-module` flow

**Files:**
- Modify: `cli/src/flows/add-module.ts:8-14,58-63`

**Step 1: Add to imports**

```typescript
import {
  scaffoldModule,
  workspaceFolders,
  skillsForModules,
  copySharedSkills,
  copySharedAgents,
  fetchSharedDir,
} from '../scaffold';
```

**Step 2: Call it inside the existing `try` block**

Locate:

```typescript
const sharedDir = await fetchSharedDir();
try {
  await copySharedSkills(projectDir, skillsForModules(mergedModules), sharedDir);
} finally {
  await fse.remove(sharedDir);
}
```

Update to:

```typescript
const sharedDir = await fetchSharedDir();
try {
  await copySharedSkills(projectDir, skillsForModules(mergedModules), sharedDir);
  await copySharedAgents(projectDir, sharedDir);
} finally {
  await fse.remove(sharedDir);
}
```

**Step 3: Build**

```bash
cd /Users/haseebshams/Desktop/Code/templates/cli
npm run build
```

Expected: clean build.

**Step 4: Commit**

```bash
cd /Users/haseebshams/Desktop/Code/templates
git add cli/src/flows/add-module.ts
git commit -m "feat(cli): wire copySharedAgents into add-module flow"
```

---

### Task 17: Bootstrap `.claude/state/` directory in scaffolded projects

**Files:**
- Modify: `cli/src/scaffold.ts` (add a new helper function and call sites)

**Step 1: Add helper to `cli/src/scaffold.ts`**

After `copySharedAgents`, add:

```typescript
export async function ensureClaudeState(targetPath: string): Promise<void> {
  const stateDir = path.join(targetPath, '.claude', 'state');
  await fse.ensureDir(stateDir);
  const queueFile = path.join(stateDir, 'feature-queue.json');
  if (!(await fse.pathExists(queueFile))) {
    await fse.writeJson(queueFile, { queue: [] }, { spaces: 2 });
  }
}
```

**Step 2: Call from `new-project.ts`**

Add `ensureClaudeState` to the import block from `../scaffold`, then call right after `copySharedAgents`:

```typescript
await copySharedAgents(targetPath, sharedDir);
await ensureClaudeState(targetPath);
```

**Step 3: Call from `add-module.ts`**

Same — add to imports and call after `copySharedAgents`.

**Step 4: Build**

```bash
cd /Users/haseebshams/Desktop/Code/templates/cli
npm run build
```

Expected: clean build.

**Step 5: Commit**

```bash
cd /Users/haseebshams/Desktop/Code/templates
git add cli/src/scaffold.ts cli/src/flows/new-project.ts cli/src/flows/add-module.ts
git commit -m "feat(cli): bootstrap .claude/state/ directory on scaffold"
```

---

## Phase 4: Validation

### Task 18: End-to-end scaffold test

**Files:** none modified — this is a manual verification step.

**Step 1: Push the shared/agents/ changes to GitHub first**

The CLI fetches `shared/` from GitHub at runtime via `tiged`. The scaffold test cannot pick up local agent files until they are pushed. Push the `shared/` changes (only) to a test branch:

```bash
cd /Users/haseebshams/Desktop/Code/templates
git push origin haseeb/feat/cli-readme
```

Then set the `CFSA_REF` env var to your branch when running the CLI.

**Step 2: Run CLI from the local build into a temp directory**

```bash
cd /tmp
rm -rf agentic-test
CFSA_REF=haseeb/feat/cli-readme node /Users/haseebshams/Desktop/Code/templates/cli/dist/index.js
```

Pick a project name like `agentic-test`, select fullstack (NestJS + Next.js), skip git init.

**Step 3: Verify agents and state landed**

```bash
ls /tmp/agentic-test/.claude/agents/
ls /tmp/agentic-test/.claude/state/
cat /tmp/agentic-test/.claude/state/feature-queue.json
```

Expected:
- `.claude/agents/` contains 11 `.md` files
- `.claude/state/feature-queue.json` exists with `{ "queue": [] }`

**Step 4: Verify Claude Code auto-discovers the agents**

```bash
cd /tmp/agentic-test
claude
```

Inside Claude Code, run `/agents` (the built-in agent listing command).

Expected: all 11 agents appear in the list with their descriptions.

**Step 5: Cleanup**

```bash
rm -rf /tmp/agentic-test
```

**Step 6: No commit** — this is a verification step, not a code change.

---

### Task 19: Smoke test the workflow-feature skill

**Files:** none modified — manual verification.

**Step 1: In the test project, create minimum required docs**

```bash
mkdir -p /tmp/agentic-test/docs/requirements /tmp/agentic-test/docs/plans
echo "# Project" > /tmp/agentic-test/docs/requirements/00-overview.md
echo "# ERD" > /tmp/agentic-test/docs/ERD.md
echo "# Design Spec" > /tmp/agentic-test/docs/design.spec.md
```

(Re-scaffold the project from Step 2 of Task 18 first if you cleaned up.)

**Step 2: Open Claude Code and invoke the skill**

```bash
cd /tmp/agentic-test
claude
```

Then in chat:

> /workflow-feature start a feature called "hello world endpoint that returns the current time"

Expected:
- Orchestrator reads the workflow-feature skill
- Dispatches `feature-planner` first
- Plan file created at `docs/plans/hello-world-endpoint.md` with section 1 filled and sections 2-8 marked `_pending_`

**Step 3: Cleanup**

```bash
rm -rf /tmp/agentic-test
```

**Step 4: No commit.**

---

## Phase 5: Documentation and PR

### Task 20: Update project root CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (add a section about shared agents)

**Step 1: Add a new section after "Shared Skills"**

Use Edit to append after the Shared Skills table:

```markdown
## Shared Agents

Cross-cutting subagents in `shared/agents/` are copied into generated projects at `.claude/agents/`. They drive the per-feature pipeline.

| Agent | Role |
|-------|------|
| feature-planner | Write the feature plan file |
| api-contract-designer | Lock request/response shapes |
| backend-builder | Implement backend (parallel with frontend) |
| frontend-builder | Implement UI (parallel with backend) |
| integration-wire | Wire UI to API, handle all states |
| test-author | Write business-logic tests |
| code-reviewer | Review diff against plan and conventions |
| commit-pr-agent | Conventional commit + PR |
| test-runner | Background full test suite |
| build-verifier | Background typecheck/lint/build |
| doc-updater | Background CLAUDE.md updates after merge |

Orchestration logic lives in [shared/skills/workflow-feature/SKILL.md](shared/skills/workflow-feature/SKILL.md).
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document shared agents in project CLAUDE.md"
```

---

### Task 21: Open PR

**Files:** none modified.

**Step 1: Confirm everything is on the branch**

```bash
git status
git log --oneline main..HEAD
```

Expected: clean working tree, ~13 new commits on `haseeb/feat/cli-readme` (or whatever branch is in use).

**Step 2: Push**

```bash
git push origin HEAD
```

**Step 3: Open the PR using the caveman-commit format for title and body**

Use the `/caveman-commit` skill to draft the title and body, then:

```bash
gh pr create --title "<caveman title>" --body "$(cat <<'EOF'
## Summary
- 11 shared subagents in shared/agents/ for per-feature pipeline
- workflow-feature skill drives orchestration with parallel + background dispatch
- copySharedAgents wired into new-project and add-module CLI flows
- .claude/state/ bootstrapped on scaffold

## Test plan
- [x] CLI builds clean
- [x] Scaffolded project contains .claude/agents/ with 11 md files
- [x] /agents command lists all 11 in Claude Code
- [x] workflow-feature skill dispatches feature-planner correctly
EOF
)"
```

**Step 4: Confirm PR URL is returned and share with user.**

---

## Notes for the Executor

- **Do not skip the GitHub push before Task 18.** The CLI fetches `shared/` from GitHub at runtime; local file changes are invisible to it without a push and `CFSA_REF` override.
- **Do not commit anything in `tiged` cache or `dist/` artifacts.** Stick to source files.
- **Caveman-commit skill** is required for all commit messages — keep them short and conventional.
- **Frequent commits** — every task ends with its own commit. Do not batch.
- **If a build fails, stop and diagnose.** Do not retry blindly.

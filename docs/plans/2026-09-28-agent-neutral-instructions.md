# Agent-Neutral Instructions Implementation Plan

**Goal:** Make project instructions usable by coding agents beyond Claude Code while retaining Claude Code compatibility.

**Architecture:** `AGENTS.md` holds project and module rules. `CLAUDE.md` points to it. Shared instructions, skills, and role briefs use agent-neutral source paths; the CLI generates compatibility copies where needed.

**Scope:** Parent repository, CLI output, and three template submodules. No commits or pushes.

**Update:** Role-brief generation and the agent orchestration skill were removed in the [shared agent removal plan](2026-09-28-remove-shared-agents.md).

## Tasks

1. Create root and template `AGENTS.md` files from existing rules. Replace each `CLAUDE.md` with a short pointer.
2. Move generated instruction source fragments to `shared/instructions/`. Update CLI generation to write both instruction files and support older shared template paths.
3. Copy shared skills and role briefs to `.agents/`, retaining `.claude/` compatibility copies. Put workflow state in `.agents/state/`.
4. Convert legacy instructions when adding modules or fetching older template repositories. Generate `AGENTS.md` for placeholder modules.
5. Update shared workflow references, role briefs, READMEs, and template prompt references. Keep commit, push, and PR actions behind explicit user authorization.
6. Build CLI, run generation smoke checks, check formatting and diffs, then stage changed files for review.

## Verification

- `npm run build` in `cli/`
- Local smoke checks for generated instructions, skill and role copies, placeholders, and legacy conversion
- `git diff --check` in parent repository and each submodule
- Review staged files in parent repository and each submodule

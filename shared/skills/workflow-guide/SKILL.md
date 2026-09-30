---
name: workflow-guide
description: Reference for project setup and the per-feature development cycle.
---

# Workflow Guide

## The Pipeline

Use Stages 1–5 when setting up a new project. For existing projects, reuse approved requirements, models, and design decisions. Repeat Stage 6 for each feature.

---

### Stage 1: Requirements & Specification

- Brainstorm requirements with user/client
- Create `docs/requirements/` — split into numbered module files:
  - `00-project-overview.md`
  - `01-authentication.md`
  - `02-<module>.md` etc.
- Create `docs/SPECIFICATION.md` — plain language, readable by non-technical clients (no jargon)
- Refine both with the client when approval is part of the project scope

---

### Stage 2: Data Modeling

- Create `docs/ERD.md` with entity-relationship diagram
- Define all data models before designing screens — UI must match data shape
- Identify relationships, constraints, and key fields

---

### Stage 3: Theme Definition

- Define before building any components:
  - Color palette (primary, secondary, neutrals, semantic colors)
  - Typography (font families, scale, weights)
  - Spacing scale and layout rules
- Configure in the project (Tailwind config, CSS variables, etc.)

---

### Stage 4: Design Approach (choose one)

#### Option A: Custom Design (Figma-first)
- Wait for Figma designs to be completed
- Once Figma is ready, walk through every screen and define a design spec

#### Option B: Build-While-Designing
- Define every screen in a design spec without waiting for Figma
- Describe what each screen does and how it should look

**For both options — create `docs/design.spec.md`:**

For each screen, define:
- **States:** default, loading, error, empty, success, network_error, auth_failure, etc.
- **Navigation:** where the screen leads to and comes from
- **Fields/Data:** what data is shown or collected, with validation rules
- **Components used:** which shared and screen-specific components

---

### Stage 5: Reusable Components

- Agent walks through all screens in design spec and suggests shared components
- User reviews suggestions:
  - Confirm which to make shared components
  - Mark which are screen-specific only
  - Add any components the agent missed
- Output: confirmed list of shared components to build before screen work begins

---

### Stage 6: Per Feature/Screen — Build Cycle

Repeat for each feature/screen:

#### 6a. Document
Confirm the feature's API contract, behavior, and material risks from existing requirements. For multi-step work, show a short plan and ask whether to save it under `docs/plans/`. Skip a plan file for small changes.

#### 6b. Build
- Implement backend and frontend in the order that fits the feature; agree on the API contract before cross-stack work
- Build shared UI components before screens that use them
- Review UI appearance and interactions manually; do not create automated UI tests

#### 6c. Integrate APIs
- Connect data layer per use case defined in 6a
- Handle all states: loading, error, empty, success

#### 6d. Verify
- Run frontend typecheck, lint, and build checks relevant to changed code
- Add focused backend tests for material business rules, security, data integrity, and regressions
- Run affected backend tests once after changes; rerun only after a failure or fix
- Run a broader suite when the change spans multiple modules or release risk requires it
- Record checks run and leave UI acceptance to manual review

---

## Principles

- Automated UI tests are not required; UI acceptance is manual
- Backend tests follow risk, not a fixed test count per endpoint or provider
- Do not require test-first implementation for every change
- Screen specs must include all states and edge cases — not just happy paths
- Define data models before screens — UI must match data shape
- Identify navigation structure upfront to avoid rework
- Everything in plain text markdown — readable by people and coding agents

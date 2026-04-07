---
name: workflow-guide
description: Reference for the 8-stage development pipeline. Use when starting any new work to understand the full process from brainstorm to deploy.
---

# Workflow Guide

## The Pipeline

Every piece of work follows these 8 stages in order. Do not skip stages.

### Stage 1: Brainstorm
- Explore the idea with the user
- Ask clarifying questions one at a time
- Define requirements and constraints
- Identify success criteria

### Stage 2: Design
- Propose 2-3 approaches with trade-offs
- Present the recommended approach with reasoning
- Write a design doc covering: architecture, components, data flow, error handling
- Get user approval before proceeding

### Stage 3: Plan
- Break the design into bite-sized implementation tasks
- Each task should be completable in 2-5 minutes
- Follow TDD: write failing test → implement → verify → commit
- Save the plan to `docs/plans/YYYY-MM-DD-<feature>.md`

### Stage 4: Scaffold
- If starting a new project, use `create-fullstack-app` CLI
- If adding to an existing project, create necessary files/folders

### Stage 5: Implement
- Follow the plan task by task
- TDD: write the test first, then the implementation
- Commit after each task
- For full-stack features, start with backend API → then frontend integration

### Stage 6: Test
- Run all test suites: unit, integration, e2e
- Verify no regressions
- Cover edge cases identified during planning

### Stage 7: Review
- Self-review: check for code quality, security, performance
- Request code review from team
- Address feedback

### Stage 8: Deploy
- Use the `deploy` skill to set up CI/CD if not already configured
- Merge to the appropriate branch
- Verify deployment succeeds

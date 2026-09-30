---
name: create-feature
description: End-to-end guide for adding a feature that spans frontend and backend. Use when adding any new feature that requires changes in both sub-projects.
---

# Create Feature (Full-Stack)

## Overview

This skill guides feature work across frontend and backend. Define the API contract first, then implement in the order that fits the feature.

## Step 1: Define the API Contract

Before writing any code, define:

1. **Endpoint(s)** — HTTP method, path, request body, response shape
2. **Entity changes** — new entities or modifications to existing ones
3. **Auth requirements** — public, authenticated, or admin-only

Use existing requirements and code where available. Ask only when behavior or scope is unclear.

## Step 2: Backend Implementation

Work inside `backend/`. Follow the backend `AGENTS.md` conventions.

1. Create or update the entity in the appropriate module
2. Create DTOs for request validation
3. Create the provider(s) with business logic
4. Create or update the controller with endpoints
5. Add Swagger decorators
6. Add focused tests when business rules, security, data integrity, or regressions warrant them
7. Run affected backend tests and the build once after changes

## Step 3: Frontend Implementation

Work inside `web-app/` or `admin/`. Follow the frontend `AGENTS.md` conventions.

1. Add API function(s) in the appropriate service file
2. Create or update Redux slice if state management is needed
3. Create the page/component following the project's component patterns
4. Wire up routing if a new page is needed
5. Handle loading, error, and empty states
6. Run relevant typecheck, lint, and build checks; leave UI acceptance to manual review

## Step 4: Integration Verification

1. Start both frontend and backend dev servers
2. Confirm API integration and error handling through focused checks
3. Leave visual and interaction acceptance to manual review

## Standalone Projects

If the project is frontend-only or backend-only, follow only the relevant section above. Skip cross-project steps.

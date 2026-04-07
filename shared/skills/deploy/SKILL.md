---
name: deploy
description: Coordinates deployment setup across the full stack. Delegates to each sub-project's own deployment skills for Dockerfiles and CI/CD workflows. Adds path-scoped triggers for combined projects.
---

# Deploy (Full-Stack)

## Overview

This skill orchestrates deployment setup across the entire project. It does not generate Dockerfiles or workflows directly — it delegates to each sub-project's existing deployment skills and coordinates them.

## Step 1: Ask the User

1. **Target environment** — staging or production?
2. **Which parts to deploy?** — frontend only, backend only, or both?

## Step 2: Backend Deployment

If the project has a backend, delegate to the backend's deployment skills:

1. Invoke the `write-dockerfile` skill in `backend/` — it will ask for app name and port
2. Invoke the `github-workflow-docker-deploy` skill in `backend/` — it will ask for environment, env file path, app name, and port

## Step 3: Frontend Deployment

If the project has a frontend, set up the frontend deployment:

- **Next.js**: Uses `output: "standalone"` — generate a Dockerfile following the same two-stage pattern as the backend (build stage + production stage with `node server.js`)
- **React (Vite)**: Static build — generate a Dockerfile with nginx serving the built assets, or configure for static hosting (Vercel, Netlify, S3)

## Step 4: Path-Scoped Triggers (Full-Stack Only)

For combined projects, modify the generated GitHub Actions workflow files to add path filters:

Backend workflow — add to the `on.push` trigger:
```yaml
paths:
  - 'backend/**'
```

Frontend workflow — add to the `on.push` trigger:
```yaml
paths:
  - 'frontend/**'
```

This ensures pushing changes to one sub-project only triggers that sub-project's deployment.

## Standalone Projects

For standalone projects, skip Step 4. The workflow triggers on the branch directly without path filtering.

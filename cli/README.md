# @codingpixel/create-fullstack-app

CLI to scaffold full-stack TypeScript projects with modular `web-app`, `backend`, `admin`, and `mobile` options. Templates are fetched from GitHub at runtime, so updates ship without republishing the CLI.

## Quick Start

```bash
npx @codingpixel/create-fullstack-app
```

Or install globally:

```bash
npm install -g @codingpixel/create-fullstack-app
create-fullstack-app
```

## What it does

- **New project** — empty directory → prompts project name, module checkbox, per-module template, git init, then features (add-ons) when a backend is selected. Creates subfolder project with npm workspaces.
- **Add modules** — inside an existing scaffolded project (detects `fullstack.config.json`) → lists installed modules, prompts which missing ones to add, fetches templates, merges workspaces, preserves your `AGENTS.md`. Then offers features that support adding later (projects made with CLI ≥ 0.4.0).
- **Non-interactive** — `create-fullstack-app --answers answers.json` creates a new project from a file: `{ "projectName", "modules", "initGit", "addons": { "<name>": { options } } }`.

## Features (add-ons)

Add-ons live in [`addons/`](../addons/README.md) in the parent repo and are fetched at run time. Each one copies files, inserts lines at `cfsa:` markers, adds env vars and npm dependencies, and is recorded under `features` in the manifest. Set `CFSA_ADDONS_DIR` to use a local add-ons folder.

## Modules

| Key       | Folder        | Templates                                 |
| --------- | ------------- | ----------------------------------------- |
| `webApp`  | `web-app/`    | Next.js, React (Vite)                     |
| `backend` | `backend/`    | NestJS (Supabase, Firebase — coming soon) |
| `admin`   | `admin/`      | React (Vite)                              |
| `mobile`  | `mobile-app/` | placeholder (coming soon)                 |

## What the templates include

Scaffolded projects come batteries-included:

- **Backend (NestJS)** — JWT auth (+ admin), rate limiting (throttler) + Helmet, Redis-backed caching / BullMQ queues / refresh-token store (real logout), HTTP request logger, extensible response transformer (`@AssetUrl`), Swagger, and a `docker-compose.yml` for Postgres + Redis.
- **Frontends (Next.js / React)** — TanStack Query, error boundaries, Formik + Yup (validate-on-blur), Redux Toolkit, Tailwind v4; the React template adds route-level code splitting and a gzip-compressed build.
- **All repos** — Husky hooks (lint-staged + Prettier + commitlint), a shared 300–350-line function-size rule, and per-project `AGENTS.md` docs.

Generated projects use `AGENTS.md` for project rules and `.agents/skills/` for shared workflows. `CLAUDE.md` points to `AGENTS.md`; `.claude/skills/` remains a compatibility copy for Claude Code.

## Manifest

Every scaffolded project gets `fullstack.config.json`:

```json
{
  "cliVersion": "0.4.0",
  "createdAt": "2026-04-15T08:00:00Z",
  "projectName": "my-app",
  "modules": {
    "webApp": { "template": "next", "folder": "web-app" },
    "backend": { "template": "nest", "folder": "backend" }
  },
  "features": {
    "s3": {
      "version": "1.0.0",
      "options": {},
      "installedAt": "2026-04-15T08:00:00Z"
    }
  }
}
```

Re-running the CLI inside this directory routes to the add-module flow.

## Pinning Template Ref

Templates are fetched from `main` by default. Override with `CFSA_REF`:

```bash
CFSA_REF=v1.2.0 npx @codingpixel/create-fullstack-app
```

## Requirements

- Node.js 18+
- Network access (templates fetched at scaffold time)

## Template Sources

- [react-template](https://github.com/codingpixel-developer/react-template)
- [next-js-template](https://github.com/codingpixel-developer/next-js-template)
- [nestjs-tempate](https://github.com/codingpixel-developer/nestjs-tempate)

Shared AGENTS.md + skills live in the [parent monorepo](https://github.com/codingpixel-developer/full-stack-app-template).

## License

MIT

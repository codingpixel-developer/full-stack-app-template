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

- **New project** — empty directory → prompts project name, module checkbox, per-module template, git init. Creates subfolder project with npm workspaces.
- **Add modules** — inside an existing scaffolded project (detects `fullstack.config.json`) → lists installed modules, prompts which missing ones to add, fetches templates, merges workspaces, preserves your `CLAUDE.md`.

## Modules

| Key | Folder | Templates |
|-----|--------|-----------|
| `webApp` | `web-app/` | Next.js, React (Vite) |
| `backend` | `backend/` | NestJS (Supabase, Firebase — coming soon) |
| `admin` | `admin/` | React (Vite) |
| `mobile` | `mobile-app/` | placeholder (coming soon) |

## Manifest

Every scaffolded project gets `fullstack.config.json`:

```json
{
  "cliVersion": "0.1.0",
  "createdAt": "2026-04-15T08:00:00Z",
  "projectName": "my-app",
  "modules": {
    "webApp":  { "template": "next", "folder": "web-app" },
    "backend": { "template": "nest", "folder": "backend" }
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

Shared CLAUDE.md + skills live in the [parent monorepo](https://github.com/codingpixel-developer/full-stack-app-template).

## License

MIT

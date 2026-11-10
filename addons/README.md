# Add-ons

Optional features that `create-fullstack-app` copies into a project only when picked.
The CLI fetches this folder at run time (same `CFSA_REF` as the templates). Set
`CFSA_ADDONS_DIR=/path/to/addons` to test a local copy before it is merged.

## Folder layout

```
addons/
└── <name>/
    ├── addon.json        # required
    ├── backend/          # copied into the project's backend/ folder
    ├── webApp/           # copied into web-app/
    └── admin/            # copied into admin/
```

A part is skipped when the project doesn't have that module. Files ending in `.ejs` are
rendered with `{ answers, projectName }` and lose the `.ejs` suffix. **Existing project
files are never overwritten** — they are reported as skipped.

## addon.json

| Field                                   | Required | Meaning                                                                                        |
| --------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `name`                                  | yes      | Folder name, used in `fullstack.config.json`                                                   |
| `displayName`, `description`, `version` | yes      | Shown in prompts; version recorded in the manifest                                             |
| `requires`                              | no       | Other add-ons installed first (dependency order)                                               |
| `conflicts`                             | no       | Add-ons that can't be installed together                                                       |
| `requiresModules`                       | no       | Modules the project must have (`backend`, `webApp`, `admin`)                                   |
| `addLater`                              | no       | `true` if it can be added after setup (projects made with CLI ≥ 0.4.0)                         |
| `options`                               | no       | Questions: `{ key, type: confirm\|list\|input, message, choices?, default?, comingSoon? }`     |
| `dependencies` / `devDependencies`      | no       | Per module, e.g. `{ "backend": { "stripe": "^23.0.0" } }`; existing versions are never changed |
| `env`                                   | no       | `{ module: "backend", key, example, joi }` — added to `.env.example` and `env.validation.ts`   |
| `inject`                                | no       | `{ module, file, marker, line }` — `line` inserted above `marker` once                         |

## Markers (NestJS template)

| File                           | Marker                                                    |
| ------------------------------ | --------------------------------------------------------- |
| `src/app.module.ts`            | `// cfsa:imports`, `// cfsa:modules`, `// cfsa:providers` |
| `src/config/env.validation.ts` | `/* cfsa:env */`                                          |
| `.env.example`                 | `# cfsa:env`                                              |

If a marker is missing the CLI stops with a message naming the file and marker, and
**writes nothing**. Frontend markers and frontend env vars come in Phase 1.

## Testing an add-on

1. `cd cli && npm run build`
2. Create an answers file: `{ "projectName": "demo", "modules": { "backend": { "template": "nest", "folder": "backend" } }, "addons": { "<name>": { } } }`
3. `CFSA_ADDONS_DIR=../addons node cli/dist/index.js --answers answers.json`
4. In the new project: `npm install && npm run build --workspace=backend`

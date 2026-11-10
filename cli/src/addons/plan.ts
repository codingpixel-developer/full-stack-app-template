import ejs from 'ejs';
import fse from 'fs-extra';
import path from 'path';
import { ModuleEntry, ModuleKey } from '../manifest';
import { appendEnv, ENV_EXAMPLE_FILE, injectJoi } from './env';
import { injectAtMarker } from './inject';
import { mergeDeps, PackageJson } from './packages';
import { AddonManifest, MODULE_PARTS, ModulePart } from './types';

export const JOI_FILE = 'src/config/env.validation.ts';

export interface FileChange {
  path: string;
  kind: 'create' | 'update';
  content: string;
}

export interface InstallPlan {
  addon: string;
  changes: FileChange[];
  skipped: string[];
}

export interface PlanContext {
  projectName: string;
  /** Content planned by earlier add-ons in the same run, keyed by project-relative path. */
  pending?: Map<string, string>;
}

type Modules = Partial<Record<ModuleKey, ModuleEntry>>;

async function listFiles(dir: string): Promise<string[]> {
  if (!(await fse.pathExists(dir))) return [];
  const out: string[] = [];
  for (const entry of await fse.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full)));
    else out.push(full);
  }
  return out;
}

class Draft {
  readonly changes = new Map<string, FileChange>();
  readonly skipped: string[] = [];

  constructor(
    private readonly projectDir: string,
    private readonly pending: Map<string, string>,
  ) {}

  async exists(rel: string): Promise<boolean> {
    return (
      this.pending.has(rel) ||
      (await fse.pathExists(path.join(this.projectDir, rel)))
    );
  }

  async read(rel: string): Promise<string> {
    const planned = this.pending.get(rel);
    if (planned !== undefined) return planned;
    return fse.readFile(path.join(this.projectDir, rel), 'utf-8');
  }

  write(rel: string, content: string, kind: FileChange['kind']): void {
    const previous = this.changes.get(rel);
    this.changes.set(rel, { path: rel, kind: previous?.kind ?? kind, content });
    this.pending.set(rel, content);
  }

  async update(
    rel: string,
    transform: (content: string) => string,
  ): Promise<void> {
    const before = await this.read(rel);
    const after = transform(before);
    if (after !== before) this.write(rel, after, 'update');
  }
}

async function planFiles(
  draft: Draft,
  addonDir: string,
  part: ModulePart,
  folder: string,
  data: Record<string, unknown>,
): Promise<void> {
  const partDir = path.join(addonDir, part);
  for (const file of await listFiles(partDir)) {
    const relInPart = path.relative(partDir, file).split(path.sep).join('/');
    const isTemplate = relInPart.endsWith('.ejs');
    const rel = `${folder}/${isTemplate ? relInPart.slice(0, -4) : relInPart}`;
    if (await draft.exists(rel)) {
      draft.skipped.push(rel);
      continue;
    }
    const raw = await fse.readFile(file, 'utf-8');
    draft.write(rel, isTemplate ? ejs.render(raw, data) : raw, 'create');
  }
}

async function planWiring(
  draft: Draft,
  addon: AddonManifest,
  part: ModulePart,
  folder: string,
): Promise<void> {
  for (const rule of addon.inject.filter((r) => r.module === part)) {
    const rel = `${folder}/${rule.file}`;
    await draft.update(rel, (c) =>
      injectAtMarker(c, rel, rule.marker, rule.line),
    );
  }
  const vars = addon.env.filter((v) => v.module === part);
  if (vars.length > 0) {
    if (part !== 'backend') {
      throw new Error(
        `Add-on "${addon.name}": env vars for ${part} are not supported yet`,
      );
    }
    await draft.update(`${folder}/${ENV_EXAMPLE_FILE}`, (c) =>
      appendEnv(c, vars, addon.name),
    );
    const joiRel = `${folder}/${JOI_FILE}`;
    await draft.update(joiRel, (c) => injectJoi(c, joiRel, vars));
  }
  const deps = addon.dependencies[part] ?? {};
  const dev = addon.devDependencies[part] ?? {};
  if (Object.keys(deps).length + Object.keys(dev).length > 0) {
    await draft.update(`${folder}/package.json`, (c) => {
      const merged = mergeDeps(JSON.parse(c) as PackageJson, deps, dev);
      return `${JSON.stringify(merged, null, 2)}\n`;
    });
  }
}

export async function planInstall(
  projectDir: string,
  modules: Modules,
  addon: AddonManifest,
  addonDir: string,
  answers: Record<string, unknown>,
  context: PlanContext,
): Promise<InstallPlan> {
  const draft = new Draft(projectDir, context.pending ?? new Map());
  const data = { answers, projectName: context.projectName };
  for (const part of MODULE_PARTS) {
    const entry = modules[part];
    if (!entry) continue;
    await planFiles(draft, addonDir, part, entry.folder, data);
    await planWiring(draft, addon, part, entry.folder);
  }
  return {
    addon: addon.name,
    changes: [...draft.changes.values()],
    skipped: draft.skipped,
  };
}

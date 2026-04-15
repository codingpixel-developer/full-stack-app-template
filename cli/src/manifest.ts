import fse from 'fs-extra';
import path from 'path';

export type ModuleKey = 'webApp' | 'backend' | 'admin' | 'mobile';

export interface ModuleEntry {
  template: string;
  folder: string;
}

export interface Manifest {
  cliVersion: string;
  createdAt: string;
  projectName: string;
  modules: Partial<Record<ModuleKey, ModuleEntry>>;
}

export const MANIFEST_FILE = 'fullstack.config.json';

export function manifestPath(projectDir: string): string {
  return path.join(projectDir, MANIFEST_FILE);
}

export async function readManifest(projectDir: string): Promise<Manifest | null> {
  const p = manifestPath(projectDir);
  if (!(await fse.pathExists(p))) return null;
  try {
    const raw = await fse.readJson(p);
    if (!raw || typeof raw !== 'object' || !raw.projectName || !raw.modules) {
      throw new Error(`Invalid ${MANIFEST_FILE}: missing required fields`);
    }
    return raw as Manifest;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Corrupt ${MANIFEST_FILE}: ${err.message}`);
    }
    throw err;
  }
}

export async function writeManifest(projectDir: string, manifest: Manifest): Promise<void> {
  await fse.writeJson(manifestPath(projectDir), manifest, { spaces: 2 });
}

export function getCliVersion(): string {
  const pkg = require(path.resolve(__dirname, '../package.json'));
  return pkg.version as string;
}

export function mergeManifest(
  existing: Manifest,
  added: Partial<Record<ModuleKey, ModuleEntry>>,
): Manifest {
  return {
    ...existing,
    cliVersion: getCliVersion(),
    modules: { ...existing.modules, ...added },
  };
}

import fse from 'fs-extra';
import path from 'path';
import { AddonManifest } from './types';

export const ADDON_FILE = 'addon.json';

const REQUIRED_FIELDS = ['name', 'displayName', 'description', 'version'];

function toManifest(
  raw: Record<string, unknown>,
  folder: string,
): AddonManifest {
  for (const field of REQUIRED_FIELDS) {
    if (typeof raw[field] !== 'string' || !raw[field]) {
      throw new Error(
        `Add-on "${folder}": ${ADDON_FILE} is missing "${field}"`,
      );
    }
  }
  return {
    name: raw.name as string,
    displayName: raw.displayName as string,
    description: raw.description as string,
    version: raw.version as string,
    requires: (raw.requires as string[]) ?? [],
    conflicts: (raw.conflicts as string[]) ?? [],
    requiresModules:
      (raw.requiresModules as AddonManifest['requiresModules']) ?? [],
    addLater: raw.addLater === true,
    options: (raw.options as AddonManifest['options']) ?? [],
    dependencies: (raw.dependencies as AddonManifest['dependencies']) ?? {},
    devDependencies:
      (raw.devDependencies as AddonManifest['devDependencies']) ?? {},
    env: (raw.env as AddonManifest['env']) ?? [],
    inject: (raw.inject as AddonManifest['inject']) ?? [],
  };
}

export async function loadRegistry(
  addonsRoot: string,
): Promise<AddonManifest[]> {
  if (!(await fse.pathExists(addonsRoot))) return [];
  const entries = await fse.readdir(addonsRoot, { withFileTypes: true });
  const addons: AddonManifest[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(addonsRoot, entry.name, ADDON_FILE);
    if (!(await fse.pathExists(file))) continue;
    const raw = (await fse.readJson(file)) as Record<string, unknown>;
    addons.push(toManifest(raw, entry.name));
  }
  return addons.sort((a, b) => a.name.localeCompare(b.name));
}

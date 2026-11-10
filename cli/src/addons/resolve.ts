import { ModuleEntry, ModuleKey } from '../manifest';
import { AddonManifest } from './types';

export class AddonResolutionError extends Error {}

export function resolveAddons(
  selected: string[],
  all: AddonManifest[],
  modules: Partial<Record<ModuleKey, ModuleEntry>>,
  installed: string[],
): AddonManifest[] {
  const byName = new Map(all.map((a) => [a.name, a]));
  const ordered: AddonManifest[] = [];
  const done = new Set(installed);
  const visiting = new Set<string>();

  const visit = (name: string, chain: string[]): void => {
    if (done.has(name)) return;
    if (visiting.has(name)) {
      throw new AddonResolutionError(
        `Add-on requirement cycle: ${[...chain, name].join(' -> ')}`,
      );
    }
    const addon = byName.get(name);
    if (!addon) throw new AddonResolutionError(`Unknown add-on "${name}"`);
    visiting.add(name);
    for (const req of addon.requires) visit(req, [...chain, name]);
    visiting.delete(name);
    done.add(name);
    ordered.push(addon);
  };

  for (const name of selected) visit(name, []);

  const finalNames = new Set([...installed, ...ordered.map((a) => a.name)]);
  for (const addon of ordered) {
    for (const mod of addon.requiresModules) {
      if (!modules[mod]) {
        throw new AddonResolutionError(
          `Add-on "${addon.name}" needs the ${mod} module, which is not installed`,
        );
      }
    }
    for (const other of finalNames) {
      const otherAddon = byName.get(other);
      if (
        addon.conflicts.includes(other) ||
        otherAddon?.conflicts.includes(addon.name)
      ) {
        throw new AddonResolutionError(
          `Add-on "${addon.name}" cannot be used with "${other}"`,
        );
      }
    }
  }
  return ordered;
}

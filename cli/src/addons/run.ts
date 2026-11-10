import chalk from 'chalk';
import { Manifest } from '../manifest';
import { canAddLater } from './add-later';
import { fetchAddonsDir } from './fetch';
import { installAddons } from './install';
import { promptAddonOptions, promptAddonSelection } from './prompts';
import { loadRegistry } from './registry';
import { resolveAddons } from './resolve';

export interface AddonPreset {
  addons: Record<string, Record<string, unknown>>;
}

export async function runAddonStep(
  projectDir: string,
  manifest: Manifest,
  mode: 'new' | 'later',
  preset?: AddonPreset,
): Promise<Manifest> {
  if (!manifest.modules.backend) return manifest;
  const source = await fetchAddonsDir();
  try {
    const all = await loadRegistry(source.dir);
    if (all.length === 0) return manifest;

    const installed = Object.keys(manifest.features ?? {});
    const selected = preset
      ? Object.keys(preset.addons)
      : await promptAddonSelection(all, installed, mode);
    if (selected.length === 0) return manifest;

    const addons = resolveAddons(selected, all, manifest.modules, installed);
    if (mode === 'later') {
      for (const addon of addons) {
        const check = canAddLater(manifest, addon);
        if (!check.ok) throw new Error(check.reason);
      }
    }

    const answers: Record<string, Record<string, unknown>> = {};
    for (const addon of addons) {
      answers[addon.name] = preset
        ? (preset.addons[addon.name] ?? {})
        : await promptAddonOptions(addon);
    }

    console.log(
      chalk.gray(
        `Installing features: ${addons.map((a) => a.name).join(', ')}`,
      ),
    );
    return await installAddons(
      projectDir,
      manifest,
      addons,
      source.dir,
      answers,
    );
  } finally {
    await source.cleanup();
  }
}

import inquirer from 'inquirer';
import { AddonManifest, AddonOption } from './types';

export async function promptAddonSelection(
  all: AddonManifest[],
  installed: string[],
  mode: 'new' | 'later',
): Promise<string[]> {
  const offered = mode === 'later' ? all.filter((a) => a.addLater) : all;
  if (offered.length === 0) return [];
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select features to add:',
      choices: offered.map((a) => ({
        name: `${a.displayName} — ${a.description}`,
        value: a.name,
        disabled: installed.includes(a.name) ? 'already installed' : false,
      })),
    },
  ]);
  return selected as string[];
}

function toQuestion(addon: AddonManifest, option: AddonOption) {
  const base = {
    name: option.key,
    message: `${addon.displayName}: ${option.message}`,
    default: option.default,
  };
  if (option.type === 'list') {
    const comingSoon = option.comingSoon ?? [];
    return {
      ...base,
      type: 'list' as const,
      choices: [
        ...(option.choices ?? []).map((c) => ({ name: c, value: c })),
        ...comingSoon.map((c) => ({
          name: c,
          value: c,
          disabled: 'coming soon',
        })),
      ],
    };
  }
  return { ...base, type: option.type };
}

export async function promptAddonOptions(
  addon: AddonManifest,
): Promise<Record<string, unknown>> {
  if (addon.options.length === 0) return {};
  const questions = addon.options.map((o) => toQuestion(addon, o));
  return (await inquirer.prompt(questions)) as Record<string, unknown>;
}

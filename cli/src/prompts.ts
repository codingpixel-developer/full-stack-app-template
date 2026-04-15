import inquirer from 'inquirer';
import { getFrontendTemplates, getBackendTemplates, templates } from './templates';
import { ModuleKey, ModuleEntry } from './manifest';

export const MODULE_FOLDERS: Record<ModuleKey, string> = {
  webApp: 'web-app',
  backend: 'backend',
  admin: 'admin',
  mobile: 'mobile-app',
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  webApp: 'Web app (frontend)',
  backend: 'Backend API',
  admin: 'Admin panel (React + Vite)',
  mobile: 'Mobile app (coming soon)',
};

export interface NewProjectConfig {
  projectName: string;
  modules: Partial<Record<ModuleKey, ModuleEntry>>;
  initGit: boolean;
}

export interface AddModuleConfig {
  modules: Partial<Record<ModuleKey, ModuleEntry>>;
}

export async function promptProjectName(): Promise<string> {
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) return 'Use lowercase letters, numbers, and hyphens only';
        return true;
      },
    },
  ]);
  return projectName;
}

export async function promptModuleSelection(
  installed: Partial<Record<ModuleKey, ModuleEntry>> = {},
): Promise<ModuleKey[]> {
  const keys: ModuleKey[] = ['webApp', 'backend', 'admin', 'mobile'];
  const choices = keys.map((k) => {
    const isInstalled = !!installed[k];
    return {
      name: `${MODULE_LABELS[k]}${isInstalled ? ' (installed)' : ''}`,
      value: k,
      disabled: isInstalled ? 'already installed' : false,
    };
  });

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select modules to include:',
      choices,
      validate: (input: ModuleKey[]) =>
        input.length > 0 ? true : 'Pick at least one module',
    },
  ]);
  return selected;
}

export async function promptTemplateFor(moduleKey: ModuleKey): Promise<string> {
  if (moduleKey === 'webApp') {
    const { t } = await inquirer.prompt([
      {
        type: 'list',
        name: 't',
        message: 'Pick a web-app template:',
        choices: getFrontendTemplates().map((tpl) => ({
          name: `${tpl.displayName} — ${tpl.description}`,
          value: tpl.name,
        })),
      },
    ]);
    return t;
  }
  if (moduleKey === 'backend') {
    const { t } = await inquirer.prompt([
      {
        type: 'list',
        name: 't',
        message: 'Pick a backend template:',
        choices: getBackendTemplates().map((tpl) => ({
          name: `${tpl.displayName}${tpl.comingSoon ? ' (coming soon)' : ''} — ${tpl.description}`,
          value: tpl.name,
        })),
      },
    ]);
    return t;
  }
  if (moduleKey === 'admin') return 'react';
  return 'placeholder';
}

export async function promptInitGit(): Promise<boolean> {
  const { initGit } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'initGit',
      message: 'Initialize git repo?',
      default: true,
    },
  ]);
  return initGit;
}

export async function buildModuleEntries(
  selected: ModuleKey[],
): Promise<Partial<Record<ModuleKey, ModuleEntry>>> {
  const entries: Partial<Record<ModuleKey, ModuleEntry>> = {};
  for (const key of selected) {
    const template = await promptTemplateFor(key);
    entries[key] = { template, folder: MODULE_FOLDERS[key] };
  }
  return entries;
}

export function isComingSoon(entry: ModuleEntry, moduleKey: ModuleKey): boolean {
  if (moduleKey === 'mobile') return true;
  const t = templates[entry.template];
  return !!t?.comingSoon;
}

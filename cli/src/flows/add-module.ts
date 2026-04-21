import chalk from 'chalk';
import fse from 'fs-extra';
import {
  promptModuleSelection,
  buildModuleEntries,
  MODULE_LABELS,
} from '../prompts';
import {
  scaffoldModule,
  workspaceFolders,
  skillsForModules,
  copySharedSkills,
  copySharedAgents,
  fetchSharedDir,
} from '../scaffold';
import { mergeRootPackageJson } from '../utils/workspace';
import {
  Manifest,
  ModuleKey,
  mergeManifest,
  writeManifest,
} from '../manifest';
import { printNextSteps } from './new-project';

export async function runAddModule(manifest: Manifest): Promise<void> {
  const installed = manifest.modules;
  const installedList = (Object.keys(installed) as ModuleKey[])
    .map((k) => MODULE_LABELS[k])
    .join(', ');

  console.log(
    chalk.blue(
      `\nDetected project: ${manifest.projectName}\nInstalled: ${installedList || 'none'}\n`,
    ),
  );

  const allKeys: ModuleKey[] = ['webApp', 'backend', 'admin', 'mobile'];
  const missing = allKeys.filter((k) => !installed[k]);
  if (missing.length === 0) {
    console.log(chalk.yellow('All modules already installed. Nothing to add.'));
    return;
  }

  const selected = await promptModuleSelection(installed);
  const newEntries = await buildModuleEntries(selected);

  const projectDir = process.cwd();
  for (const [key, entry] of Object.entries(newEntries)) {
    if (!entry) continue;
    await scaffoldModule(projectDir, key as ModuleKey, entry);
  }

  const newFolders = workspaceFolders(newEntries);
  if (newFolders.length > 0) {
    console.log(chalk.gray('Updating root package.json workspaces...'));
    await mergeRootPackageJson(projectDir, newFolders);
  }

  const mergedModules = { ...manifest.modules, ...newEntries };
  const sharedDir = await fetchSharedDir();
  try {
    await copySharedSkills(projectDir, skillsForModules(mergedModules), sharedDir);
    await copySharedAgents(projectDir, sharedDir);
  } finally {
    await fse.remove(sharedDir);
  }

  const updated = mergeManifest(manifest, newEntries);
  await writeManifest(projectDir, updated);

  console.log(
    chalk.yellow(
      `\nReminder: CLAUDE.md was not modified. Update it to reference the new module(s).`,
    ),
  );
  console.log(chalk.green(`\nAdded ${Object.keys(newEntries).length} module(s) to ${manifest.projectName}.`));
  printNextSteps(undefined, newEntries, false);
}

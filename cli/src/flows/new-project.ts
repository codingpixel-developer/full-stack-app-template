import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  promptProjectName,
  promptModuleSelection,
  buildModuleEntries,
  promptInitGit,
  MODULE_LABELS,
  isComingSoon,
} from '../prompts';
import {
  scaffoldModule,
  workspaceFolders,
  createGitignore,
  skillsForModules,
  copySharedSkills,
  copySharedAgents,
  fetchSharedDir,
} from '../scaffold';
import { createRootPackageJson } from '../utils/workspace';
import { generateClaudeMd } from '../utils/claude-md';
import { initGitRepo } from '../utils/git';
import { Manifest, ModuleKey, writeManifest, getCliVersion } from '../manifest';

export async function runNewProject(): Promise<void> {
  const projectName = await promptProjectName();
  const selected = await promptModuleSelection();
  const modules = await buildModuleEntries(selected);
  const initGit = await promptInitGit();

  const targetPath = path.resolve(process.cwd(), projectName);
  if (await fse.pathExists(targetPath)) {
    throw new Error(`Directory "${projectName}" already exists`);
  }

  console.log(chalk.blue(`\nCreating project: ${projectName}\n`));
  await fse.ensureDir(targetPath);

  for (const [key, entry] of Object.entries(modules)) {
    if (!entry) continue;
    await scaffoldModule(targetPath, key as ModuleKey, entry);
  }

  const folders = workspaceFolders(modules);
  if (folders.length > 0) {
    console.log(chalk.gray('Setting up npm workspaces...'));
    await createRootPackageJson(targetPath, projectName, folders);
  }

  const sharedDir = await fetchSharedDir();
  try {
    await generateClaudeMd(targetPath, projectName, modules, sharedDir);
    await copySharedSkills(targetPath, skillsForModules(modules), sharedDir);
    await copySharedAgents(targetPath, sharedDir);
  } finally {
    await fse.remove(sharedDir);
  }
  await createGitignore(targetPath);

  const manifest: Manifest = {
    cliVersion: getCliVersion(),
    createdAt: new Date().toISOString(),
    projectName,
    modules,
  };
  await writeManifest(targetPath, manifest);

  if (initGit) {
    console.log(chalk.gray('Initializing git repository...'));
    initGitRepo(targetPath);
  }

  console.log(chalk.green(`\nProject "${projectName}" created successfully!`));
  printNextSteps(projectName, modules, /* isNewProject */ true);
}

export function printNextSteps(
  projectName: string | undefined,
  modules: Partial<Record<ModuleKey, { template: string; folder: string }>>,
  isNewProject: boolean,
): void {
  console.log(chalk.gray(`\nNext steps:`));
  if (isNewProject && projectName) {
    console.log(chalk.gray(`  cd ${projectName}`));
  }
  console.log(chalk.gray(`  npm install`));

  (Object.keys(modules) as ModuleKey[]).forEach((key) => {
    const entry = modules[key]!;
    if (isComingSoon(entry, key)) {
      console.log(chalk.yellow(`  ${entry.folder}/ — ${MODULE_LABELS[key]} (coming soon)`));
    } else {
      console.log(chalk.gray(`  npm run dev:${entry.folder}`));
    }
  });
}

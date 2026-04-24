import fse from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { templates } from './templates';
import { ModuleEntry, ModuleKey } from './manifest';
import { MODULE_LABELS, isComingSoon } from './prompts';
import { fetchRepo } from './utils/fetch-repo';
import { parentSpec, templateSpec } from './config';

export function skillsForModules(
  modules: Partial<Record<ModuleKey, ModuleEntry>>,
): string[] {
  const skills = new Set<string>([
    'workflow-guide',
    'create-feature',
    'create-tests',
    'deploy',
  ]);
  if (modules.backend) skills.add('add-database-entity');
  if (modules.backend && modules.webApp) skills.add('add-authentication');
  return Array.from(skills);
}

export async function copySharedSkills(
  targetPath: string,
  skills: string[],
  sharedDir: string,
): Promise<void> {
  const skillsTarget = path.join(targetPath, '.claude', 'skills');
  await fse.ensureDir(skillsTarget);
  let copied = 0;
  for (const skill of skills) {
    const src = path.join(sharedDir, 'skills', skill);
    const dest = path.join(skillsTarget, skill);
    if (await fse.pathExists(dest)) continue;
    if (await fse.pathExists(src)) {
      await fse.copy(src, dest);
      copied++;
    }
  }
  if (copied) console.log(chalk.gray(`Copied ${copied} shared skill(s)`));
}

export async function copySharedAgents(
  targetPath: string,
  sharedDir: string,
): Promise<void> {
  const agentsTarget = path.join(targetPath, '.claude', 'agents');
  const src = path.join(sharedDir, 'agents');
  if (!(await fse.pathExists(src))) return;
  await fse.ensureDir(agentsTarget);
  let copied = 0;
  const entries = await fse.readdir(src);
  for (const entry of entries) {
    if (!entry.endsWith('.md')) continue;
    const dest = path.join(agentsTarget, entry);
    if (await fse.pathExists(dest)) continue;
    await fse.copy(path.join(src, entry), dest);
    copied++;
  }
  if (copied) console.log(chalk.gray(`Copied ${copied} shared agent(s) to .claude/agents/`));
}

export async function ensureClaudeState(targetPath: string): Promise<void> {
  const stateDir = path.join(targetPath, '.claude', 'state');
  await fse.ensureDir(stateDir);
  const queueFile = path.join(stateDir, 'feature-queue.json');
  if (!(await fse.pathExists(queueFile))) {
    await fse.writeJson(queueFile, { queue: [] }, { spaces: 2 });
  }
}

export async function fetchSharedDir(): Promise<string> {
  const tmp = path.join(os.tmpdir(), `cfsa-shared-${process.pid}-${Date.now()}`);
  console.log(chalk.gray('Fetching shared resources from repository...'));
  await fetchRepo(parentSpec('shared'), tmp);
  return tmp;
}

export async function scaffoldModule(
  projectDir: string,
  moduleKey: ModuleKey,
  entry: ModuleEntry,
): Promise<void> {
  const modulePath = path.join(projectDir, entry.folder);

  if (await fse.pathExists(modulePath)) {
    console.log(chalk.yellow(`Skipping ${MODULE_LABELS[moduleKey]}: ${entry.folder}/ already exists`));
    return;
  }

  if (moduleKey === 'mobile') {
    console.log(chalk.yellow(`Creating mobile-app placeholder (coming soon)...`));
    await fse.ensureDir(modulePath);
    await fse.writeFile(
      path.join(modulePath, 'CLAUDE.md'),
      '# Mobile App\n\n> Coming soon.\n',
    );
    return;
  }

  const template = templates[entry.template];
  if (!template) {
    throw new Error(`Unknown template "${entry.template}" for module ${moduleKey}`);
  }

  if (template.comingSoon) {
    console.log(
      chalk.yellow(`${template.displayName} integration coming soon — creating placeholder at ${entry.folder}/...`),
    );
    await fse.ensureDir(modulePath);
    await fse.writeFile(
      path.join(modulePath, 'CLAUDE.md'),
      `# ${MODULE_LABELS[moduleKey]}: ${template.displayName}\n\n> Coming soon.\n\nThis module is configured to use ${template.displayName}. Integration scaffolding will be added in a future CLI release.\n`,
    );
    return;
  }

  console.log(chalk.gray(`Fetching ${template.displayName} template -> ${entry.folder}/...`));
  await fetchRepo(templateSpec(template.repo!, template.repoRef), modulePath);
}

export function workspaceFolders(
  modules: Partial<Record<ModuleKey, ModuleEntry>>,
): string[] {
  const folders: string[] = [];
  (Object.keys(modules) as ModuleKey[]).forEach((k) => {
    const entry = modules[k];
    if (!entry) return;
    if (isComingSoon(entry, k)) return;
    folders.push(entry.folder);
  });
  return folders;
}

export async function createGitignore(targetPath: string): Promise<void> {
  const gitignoreContent = `node_modules
dist
.env*
!.env.example
coverage
.DS_Store
*.log
`;
  const p = path.join(targetPath, '.gitignore');
  if (await fse.pathExists(p)) return;
  await fse.writeFile(p, gitignoreContent);
}

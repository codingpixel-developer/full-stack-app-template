import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { templates } from './templates';
import { ModuleEntry, ModuleKey } from './manifest';
import { MODULE_LABELS, isComingSoon } from './prompts';
import { copyTemplate } from './utils/copy';

const SHARED_SKILLS_ROOT = path.resolve(__dirname, '../../shared/skills');

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
): Promise<void> {
  const skillsTarget = path.join(targetPath, '.agent', 'skills');
  await fse.ensureDir(skillsTarget);
  let copied = 0;
  for (const skill of skills) {
    const src = path.join(SHARED_SKILLS_ROOT, skill);
    const dest = path.join(skillsTarget, skill);
    if (await fse.pathExists(dest)) continue;
    if (await fse.pathExists(src)) {
      await fse.copy(src, dest);
      copied++;
    }
  }
  if (copied) console.log(chalk.gray(`Copied ${copied} shared skill(s)`));
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

  console.log(chalk.gray(`Copying ${template.displayName} template to ${entry.folder}/...`));
  await copyTemplate(template.path!, modulePath);
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

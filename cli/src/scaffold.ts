import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { ProjectConfig } from './prompts';
import { templates } from './templates';
import { copyTemplate, renameAgentMdToClaudeMd } from './utils/copy';
import { createRootPackageJson } from './utils/workspace';
import { initGitRepo } from './utils/git';
import { generateClaudeMd } from './utils/claude-md';

const SHARED_SKILLS_ROOT = path.resolve(__dirname, '../../shared/skills');

export async function scaffold(config: ProjectConfig): Promise<void> {
  const targetPath = path.resolve(process.cwd(), config.projectName);

  if (await fse.pathExists(targetPath)) {
    throw new Error(`Directory "${config.projectName}" already exists`);
  }

  console.log(chalk.blue(`\nCreating project: ${config.projectName}\n`));

  await fse.ensureDir(targetPath);

  if (config.projectType === 'fullstack') {
    await scaffoldFullstack(targetPath, config);
  } else {
    await scaffoldStandalone(targetPath, config);
  }

  await generateClaudeMd(targetPath, config);
  await copySharedSkills(targetPath, config);
  await createGitignore(targetPath);

  if (config.initGit) {
    console.log(chalk.gray('Initializing git repository...'));
    initGitRepo(targetPath);
  }

  console.log(chalk.green(`\nProject "${config.projectName}" created successfully!`));
  console.log(chalk.gray(`\nNext steps:`));
  console.log(chalk.gray(`  cd ${config.projectName}`));
  console.log(chalk.gray(`  npm install`));

  if (config.projectType === 'fullstack') {
    console.log(chalk.gray(`  npm run dev:backend`));
    console.log(chalk.gray(`  npm run dev:frontend`));
  } else {
    console.log(chalk.gray(`  npm run dev`));
  }
}

async function scaffoldFullstack(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const frontendTemplate = templates[config.frontend!];
  const backendTemplate = templates[config.backend!];

  const frontendPath = path.join(targetPath, 'frontend');
  const backendPath = path.join(targetPath, 'backend');

  console.log(chalk.gray(`Copying ${frontendTemplate.displayName} template...`));
  await copyTemplate(frontendTemplate.path, frontendPath);
  await renameAgentMdToClaudeMd(frontendPath);

  console.log(chalk.gray(`Copying ${backendTemplate.displayName} template...`));
  await copyTemplate(backendTemplate.path, backendPath);

  console.log(chalk.gray('Setting up npm workspaces...'));
  await createRootPackageJson(targetPath, config.projectName);
}

async function scaffoldStandalone(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const templateName = config.frontend || config.backend!;
  const template = templates[templateName];

  console.log(chalk.gray(`Copying ${template.displayName} template...`));
  await copyTemplate(template.path, targetPath);

  if (template.type === 'frontend') {
    await renameAgentMdToClaudeMd(targetPath);
  }
}

async function copySharedSkills(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const skillsTarget = path.join(targetPath, '.agent', 'skills');
  await fse.ensureDir(skillsTarget);

  const allSkills = [
    'workflow-guide',
    'create-feature',
    'create-tests',
    'deploy',
  ];

  const backendSkills = ['add-database-entity'];
  const fullstackSkills = ['add-authentication'];

  const skillsToCopy = [...allSkills];

  if (config.projectType === 'fullstack' || config.projectType === 'backend') {
    skillsToCopy.push(...backendSkills);
  }

  if (config.projectType === 'fullstack') {
    skillsToCopy.push(...fullstackSkills);
  }

  for (const skill of skillsToCopy) {
    const src = path.join(SHARED_SKILLS_ROOT, skill);
    const dest = path.join(skillsTarget, skill);
    if (await fse.pathExists(src)) {
      await fse.copy(src, dest);
    }
  }

  console.log(chalk.gray(`Copied ${skillsToCopy.length} shared skills`));
}

async function createGitignore(targetPath: string): Promise<void> {
  const gitignoreContent = `node_modules
dist
.env*
!.env.example
coverage
.DS_Store
*.log
`;
  await fse.writeFile(path.join(targetPath, '.gitignore'), gitignoreContent);
}

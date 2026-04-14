import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { ProjectConfig } from './prompts';
import { templates } from './templates';
import { copyTemplate } from './utils/copy';
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

  const backendComingSoonStandalone =
    config.projectType === 'backend' && templates[config.backend!].comingSoon;

  if (backendComingSoonStandalone) {
    await scaffoldStandalone(targetPath, config);
  } else if (config.projectType === 'fullstack') {
    await scaffoldFullstack(targetPath, config);
    await generateClaudeMd(targetPath, config);
    await copySharedSkills(targetPath, config);
    await createGitignore(targetPath);
  } else {
    await scaffoldStandalone(targetPath, config);
    await generateClaudeMd(targetPath, config);
    await copySharedSkills(targetPath, config);
    await createGitignore(targetPath);
  }

  if (config.initGit) {
    console.log(chalk.gray('Initializing git repository...'));
    initGitRepo(targetPath);
  }

  console.log(chalk.green(`\nProject "${config.projectName}" created successfully!`));
  console.log(chalk.gray(`\nNext steps:`));
  console.log(chalk.gray(`  cd ${config.projectName}`));
  console.log(chalk.gray(`  npm install`));

  const backendComingSoon = config.backend ? templates[config.backend].comingSoon : false;

  if (config.projectType === 'fullstack') {
    if (!backendComingSoon) {
      console.log(chalk.gray(`  npm run dev:backend`));
    } else {
      console.log(chalk.yellow(`  backend/ — ${templates[config.backend!].displayName} placeholder (coming soon)`));
    }
    console.log(chalk.gray(`  npm run dev:frontend`));
    if (config.includeAdmin) {
      console.log(chalk.gray(`  npm run dev:admin`));
    }
    if (config.includeMobile) {
      console.log(chalk.yellow(`  mobile-app/ — placeholder created (coming soon)`));
    }
  } else if (config.projectType === 'backend' && backendComingSoon) {
    console.log(chalk.yellow(`  ${templates[config.backend!].displayName} integration coming soon`));
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
  await copyTemplate(frontendTemplate.path!, frontendPath);

  if (backendTemplate.comingSoon) {
    console.log(
      chalk.yellow(`${backendTemplate.displayName} integration coming soon — creating placeholder...`),
    );
    await fse.ensureDir(backendPath);
    await fse.writeFile(
      path.join(backendPath, 'CLAUDE.md'),
      `# Backend: ${backendTemplate.displayName}\n\n> Coming soon.\n\nThis project is configured to use ${backendTemplate.displayName} as its backend. Integration scaffolding will be added in a future CLI release.\n`,
    );
  } else {
    console.log(chalk.gray(`Copying ${backendTemplate.displayName} template...`));
    await copyTemplate(backendTemplate.path!, backendPath);
  }

  if (config.includeAdmin) {
    const adminTemplate = templates['react'];
    const adminPath = path.join(targetPath, 'admin');
    console.log(chalk.gray('Copying React (Vite) template for admin panel...'));
    await copyTemplate(adminTemplate.path!, adminPath);
  }

  if (config.includeMobile) {
    const mobilePath = path.join(targetPath, 'mobile-app');
    console.log(chalk.gray('Creating mobile-app placeholder...'));
    await fse.ensureDir(mobilePath);
    await fse.writeFile(
      path.join(mobilePath, 'CLAUDE.md'),
      '# Mobile App\n\n> Coming soon.\n',
    );
  }

  console.log(chalk.gray('Setting up npm workspaces...'));
  await createRootPackageJson(targetPath, config);
}

async function scaffoldStandalone(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const templateName = config.frontend || config.backend!;
  const template = templates[templateName];

  if (template.comingSoon) {
    console.log(
      chalk.yellow(`${template.displayName} integration coming soon — creating placeholder...`),
    );
    await fse.writeFile(
      path.join(targetPath, 'CLAUDE.md'),
      `# ${template.displayName}\n\n> Coming soon.\n\nThis project is configured to use ${template.displayName}. Integration scaffolding will be added in a future CLI release.\n`,
    );
    return;
  }

  console.log(chalk.gray(`Copying ${template.displayName} template...`));
  await copyTemplate(template.path!, targetPath);
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

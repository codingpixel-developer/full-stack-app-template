import inquirer from 'inquirer';
import { getFrontendTemplates, getBackendTemplates } from './templates';

export type ProjectType = 'fullstack' | 'frontend' | 'backend';

export interface ProjectConfig {
  projectName: string;
  projectType: ProjectType;
  frontend?: string;
  backend?: string;
  includeAdmin: boolean;
  includeMobile: boolean;
  initGit: boolean;
}

export async function getProjectConfig(): Promise<ProjectConfig> {
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

  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What do you want to create?',
      choices: [
        { name: 'Full-stack (frontend + backend)', value: 'fullstack' },
        { name: 'Frontend only', value: 'frontend' },
        { name: 'Backend only', value: 'backend' },
      ],
    },
  ]);

  let frontend: string | undefined;
  let backend: string | undefined;

  if (projectType === 'fullstack' || projectType === 'frontend') {
    const frontendTemplates = getFrontendTemplates();
    const { selectedFrontend } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFrontend',
        message: 'Pick a frontend:',
        choices: frontendTemplates.map((t) => ({
          name: `${t.displayName} — ${t.description}`,
          value: t.name,
        })),
      },
    ]);
    frontend = selectedFrontend;
  }

  if (projectType === 'fullstack' || projectType === 'backend') {
    const backendTemplates = getBackendTemplates();
    const { selectedBackend } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedBackend',
        message: 'Pick a backend:',
        choices: backendTemplates.map((t) => ({
          name: `${t.displayName}${t.comingSoon ? ' (coming soon)' : ''} — ${t.description}`,
          value: t.name,
        })),
      },
    ]);
    backend = selectedBackend;
  }

  const { includeAdmin } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeAdmin',
      message: 'Include admin panel? (React + Vite)',
      default: false,
    },
  ]);

  const { includeMobile } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeMobile',
      message: 'Include mobile app? (coming soon — creates placeholder)',
      default: false,
    },
  ]);

  const { initGit } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'initGit',
      message: 'Initialize git repo?',
      default: true,
    },
  ]);

  return { projectName, projectType, frontend, backend, includeAdmin, includeMobile, initGit };
}

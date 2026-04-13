import fse from 'fs-extra';
import path from 'path';
import { ProjectConfig } from '../prompts';

export async function createRootPackageJson(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const workspaces = ['frontend', 'backend'];
  if (config.includeAdmin) workspaces.push('admin');

  const scripts: Record<string, string> = {
    'dev:frontend': 'npm run dev --workspace=frontend',
    'dev:backend': 'npm run dev --workspace=backend',
    'build:frontend': 'npm run build --workspace=frontend',
    'build:backend': 'npm run build --workspace=backend',
    'test:frontend': 'npm run test --workspace=frontend',
    'test:backend': 'npm run test --workspace=backend',
  };

  if (config.includeAdmin) {
    scripts['dev:admin'] = 'npm run dev --workspace=admin';
    scripts['build:admin'] = 'npm run build --workspace=admin';
  }

  const packageJson = {
    name: config.projectName,
    version: '1.0.0',
    private: true,
    workspaces,
    scripts,
  };

  await fse.writeJson(path.join(targetPath, 'package.json'), packageJson, {
    spaces: 2,
  });
}

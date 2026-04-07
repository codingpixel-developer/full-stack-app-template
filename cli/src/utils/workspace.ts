import fse from 'fs-extra';
import path from 'path';

export async function createRootPackageJson(
  targetPath: string,
  projectName: string,
): Promise<void> {
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    workspaces: ['frontend', 'backend'],
    scripts: {
      'dev:frontend': 'npm run dev --workspace=frontend',
      'dev:backend': 'npm run dev --workspace=backend',
      'build:frontend': 'npm run build --workspace=frontend',
      'build:backend': 'npm run build --workspace=backend',
      'test:frontend': 'npm run test --workspace=frontend',
      'test:backend': 'npm run test --workspace=backend',
    },
  };

  await fse.writeJson(path.join(targetPath, 'package.json'), packageJson, {
    spaces: 2,
  });
}

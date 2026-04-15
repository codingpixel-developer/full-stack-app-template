import fse from 'fs-extra';
import path from 'path';

function scriptsFor(folders: string[]): Record<string, string> {
  const scripts: Record<string, string> = {};
  for (const folder of folders) {
    scripts[`dev:${folder}`] = `npm run dev --workspace=${folder}`;
    scripts[`build:${folder}`] = `npm run build --workspace=${folder}`;
    scripts[`test:${folder}`] = `npm run test --workspace=${folder}`;
  }
  return scripts;
}

export async function createRootPackageJson(
  targetPath: string,
  projectName: string,
  folders: string[],
): Promise<void> {
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    workspaces: folders,
    scripts: scriptsFor(folders),
  };

  await fse.writeJson(path.join(targetPath, 'package.json'), packageJson, {
    spaces: 2,
  });
}

export async function mergeRootPackageJson(
  targetPath: string,
  newFolders: string[],
): Promise<void> {
  const pkgPath = path.join(targetPath, 'package.json');
  const existing = (await fse.pathExists(pkgPath)) ? await fse.readJson(pkgPath) : {};

  const currentWorkspaces: string[] = Array.isArray(existing.workspaces)
    ? existing.workspaces
    : [];
  const mergedWorkspaces = Array.from(new Set([...currentWorkspaces, ...newFolders]));

  const existingScripts: Record<string, string> = existing.scripts || {};
  const newScripts = scriptsFor(newFolders);
  const mergedScripts = { ...existingScripts };
  for (const [k, v] of Object.entries(newScripts)) {
    if (!(k in mergedScripts)) mergedScripts[k] = v;
  }

  const merged = {
    ...existing,
    private: true,
    workspaces: mergedWorkspaces,
    scripts: mergedScripts,
  };

  await fse.writeJson(pkgPath, merged, { spaces: 2 });
}

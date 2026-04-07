import fse from 'fs-extra';
import path from 'path';

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'coverage',
  '.DS_Store',
  'package-lock.json',
];

export async function copyTemplate(
  templatePath: string,
  targetPath: string,
): Promise<void> {
  await fse.copy(templatePath, targetPath, {
    filter: (src: string) => {
      const basename = path.basename(src);
      return !IGNORE_PATTERNS.includes(basename);
    },
  });
}

export async function renameAgentMdToClaudeMd(targetPath: string): Promise<void> {
  const agentMdPath = path.join(targetPath, 'AGENT.md');
  const claudeMdPath = path.join(targetPath, 'CLAUDE.md');

  if (await fse.pathExists(agentMdPath)) {
    await fse.rename(agentMdPath, claudeMdPath);
  }
}

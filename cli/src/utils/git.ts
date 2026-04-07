import { execSync } from 'child_process';

export function initGitRepo(targetPath: string): void {
  execSync('git init', { cwd: targetPath, stdio: 'ignore' });
  execSync('git add -A', { cwd: targetPath, stdio: 'ignore' });
  execSync('git commit -m "chore: initial project scaffold"', {
    cwd: targetPath,
    stdio: 'ignore',
  });
}

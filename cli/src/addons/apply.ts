import fse from 'fs-extra';
import path from 'path';
import { InstallPlan } from './plan';

export async function applyPlans(
  projectDir: string,
  plans: InstallPlan[],
): Promise<void> {
  const finalContent = new Map<string, string>();
  for (const plan of plans) {
    for (const change of plan.changes)
      finalContent.set(change.path, change.content);
  }
  for (const [rel, content] of finalContent) {
    await fse.outputFile(path.join(projectDir, rel), content);
  }
}

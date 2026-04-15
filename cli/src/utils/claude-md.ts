import fse from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import { ModuleEntry, ModuleKey } from '../manifest';
import { MODULE_LABELS } from '../prompts';
import { templates } from '../templates';

interface ModuleView {
  key: ModuleKey;
  label: string;
  folder: string;
  templateDisplay: string;
  hasClaudeMd: boolean;
}

function buildModuleViews(
  modules: Partial<Record<ModuleKey, ModuleEntry>>,
): ModuleView[] {
  const order: ModuleKey[] = ['webApp', 'backend', 'admin', 'mobile'];
  const views: ModuleView[] = [];
  for (const key of order) {
    const entry = modules[key];
    if (!entry) continue;
    const t = templates[entry.template];
    const isPlaceholder = key === 'mobile' || !!t?.comingSoon;
    views.push({
      key,
      label: MODULE_LABELS[key],
      folder: entry.folder,
      templateDisplay: t ? t.displayName : 'Placeholder',
      hasClaudeMd: !isPlaceholder,
    });
  }
  return views;
}

export async function generateClaudeMd(
  targetPath: string,
  projectName: string,
  modules: Partial<Record<ModuleKey, ModuleEntry>>,
  sharedDir: string,
): Promise<void> {
  const claudeRoot = path.join(sharedDir, 'claude');
  const rootFile = path.join(claudeRoot, 'root.claude.md');
  const fullstackFile = path.join(claudeRoot, 'fullstack.claude.md');

  const view = { projectName, modules: buildModuleViews(modules) };

  const rootContent = ejs.render(await fse.readFile(rootFile, 'utf-8'), view);
  const fullstackContent = ejs.render(await fse.readFile(fullstackFile, 'utf-8'), view);

  await fse.writeFile(
    path.join(targetPath, 'CLAUDE.md'),
    rootContent + '\n' + fullstackContent,
  );
}

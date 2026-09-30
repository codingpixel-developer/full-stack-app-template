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
  hasAgentInstructions: boolean;
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
      hasAgentInstructions: !isPlaceholder,
      hasClaudeMd: !isPlaceholder,
    });
  }
  return views;
}

export async function generateAgentInstructions(
  targetPath: string,
  projectName: string,
  modules: Partial<Record<ModuleKey, ModuleEntry>>,
  sharedDir: string,
): Promise<void> {
  const instructionsRoot = path.join(sharedDir, 'instructions');
  const useCurrentTemplates = await fse.pathExists(instructionsRoot);
  const sourceRoot = useCurrentTemplates
    ? instructionsRoot
    : path.join(sharedDir, 'claude');
  const rootFile = path.join(
    sourceRoot,
    useCurrentTemplates ? 'root.md' : 'root.claude.md',
  );
  const fullstackFile = path.join(
    sourceRoot,
    useCurrentTemplates ? 'fullstack.md' : 'fullstack.claude.md',
  );

  const view = { projectName, modules: buildModuleViews(modules) };

  const rootContent = ejs.render(await fse.readFile(rootFile, 'utf-8'), view);
  const fullstackContent = ejs.render(
    await fse.readFile(fullstackFile, 'utf-8'),
    view,
  );

  await fse.writeFile(
    path.join(targetPath, 'AGENTS.md'),
    (rootContent + '\n' + fullstackContent).replaceAll(
      'CLAUDE.md',
      'AGENTS.md',
    ),
  );
  await fse.writeFile(
    path.join(targetPath, 'CLAUDE.md'),
    '# Agent instructions\n\nRead [AGENTS.md](AGENTS.md) for project rules.\n',
  );
}

export async function ensureRootAgentInstructions(
  targetPath: string,
): Promise<void> {
  const agentsFile = path.join(targetPath, 'AGENTS.md');
  if (await fse.pathExists(agentsFile)) return;

  const claudeFile = path.join(targetPath, 'CLAUDE.md');
  if (!(await fse.pathExists(claudeFile))) return;

  const content = await fse.readFile(claudeFile, 'utf-8');
  await fse.writeFile(agentsFile, content.replaceAll('CLAUDE.md', 'AGENTS.md'));
  await fse.writeFile(
    claudeFile,
    '# Agent instructions\n\nRead [AGENTS.md](AGENTS.md) for project rules.\n',
  );
}

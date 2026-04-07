import fse from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import { ProjectConfig } from '../prompts';
import { templates } from '../templates';

const SHARED_ROOT = path.resolve(__dirname, '../../../shared');

export async function generateClaudeMd(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  if (config.projectType === 'fullstack') {
    await generateFullstackClaudeMd(targetPath, config);
  } else {
    await generateStandaloneClaudeMd(targetPath, config);
  }
}

async function generateFullstackClaudeMd(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const templateFile = path.join(SHARED_ROOT, 'claude', 'root.claude.md');
  const fullstackFile = path.join(SHARED_ROOT, 'claude', 'fullstack.claude.md');

  const rootContent = await renderTemplate(templateFile, config);
  const fullstackContent = await renderTemplate(fullstackFile, config);

  await fse.writeFile(
    path.join(targetPath, 'CLAUDE.md'),
    rootContent + '\n' + fullstackContent,
  );
}

async function generateStandaloneClaudeMd(
  targetPath: string,
  config: ProjectConfig,
): Promise<void> {
  const templateFile = path.join(SHARED_ROOT, 'claude', 'root.claude.md');
  const standaloneFile = path.join(SHARED_ROOT, 'claude', 'standalone.claude.md');

  const rootContent = await renderTemplate(templateFile, config);
  const standaloneContent = await renderTemplate(standaloneFile, config);

  await fse.writeFile(
    path.join(targetPath, 'CLAUDE.md'),
    rootContent + '\n' + standaloneContent,
  );
}

async function renderTemplate(
  templateFile: string,
  config: ProjectConfig,
): Promise<string> {
  const template = await fse.readFile(templateFile, 'utf-8');
  const frontendTemplate = config.frontend ? templates[config.frontend] : undefined;
  const backendTemplate = config.backend ? templates[config.backend] : undefined;

  return ejs.render(template, {
    projectName: config.projectName,
    projectType: config.projectType,
    frontend: frontendTemplate,
    backend: backendTemplate,
  });
}

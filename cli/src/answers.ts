import fse from 'fs-extra';
import { ModuleEntry, ModuleKey } from './manifest';

export interface AnswersFile {
  projectName: string;
  modules: Partial<Record<ModuleKey, ModuleEntry>>;
  initGit: boolean;
  addons: Record<string, Record<string, unknown>>;
}

export async function loadAnswersFile(file: string): Promise<AnswersFile> {
  const raw = (await fse.readJson(file)) as Partial<AnswersFile>;
  if (!raw.projectName || !/^[a-z0-9-]+$/.test(raw.projectName)) {
    throw new Error(
      `Answers file ${file}: "projectName" is required (lowercase letters, numbers, hyphens)`,
    );
  }
  if (!raw.modules || Object.keys(raw.modules).length === 0) {
    throw new Error(
      `Answers file ${file}: "modules" needs at least one module`,
    );
  }
  return {
    projectName: raw.projectName,
    modules: raw.modules,
    initGit: raw.initGit === true,
    addons: raw.addons ?? {},
  };
}

export function answersFileArg(argv: string[]): string | undefined {
  const i = argv.indexOf('--answers');
  return i === -1 ? undefined : argv[i + 1];
}

import fse from 'fs-extra';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadAnswersFile } from '../src/answers';

async function writeTemp(content: unknown): Promise<string> {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'cfsa-answers-'));
  const file = path.join(dir, 'answers.json');
  await fse.writeJson(file, content);
  return file;
}

describe('loadAnswersFile', () => {
  it('rejects a file without projectName', async () => {
    const file = await writeTemp({ modules: {}, initGit: false, addons: {} });
    await expect(loadAnswersFile(file)).rejects.toThrow(/projectName/);
  });

  it('fills defaults for initGit and addons', async () => {
    const file = await writeTemp({
      projectName: 'demo',
      modules: { backend: { template: 'nest', folder: 'backend' } },
    });
    const answers = await loadAnswersFile(file);
    expect(answers.initGit).toBe(false);
    expect(answers.addons).toEqual({});
  });
});

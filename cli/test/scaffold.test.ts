import fse from 'fs-extra';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { mirrorModuleSkills } from '../src/scaffold';

let dir = '';
afterEach(async () => {
  if (dir) await fse.remove(dir);
});

describe('mirrorModuleSkills', () => {
  it('copies .claude/skills to .agents/skills', async () => {
    dir = await fse.mkdtemp(path.join(os.tmpdir(), 'cfsa-test-'));
    await fse.outputFile(path.join(dir, '.claude/skills/a/SKILL.md'), 'a');
    await mirrorModuleSkills(dir);
    expect(
      await fse.readFile(path.join(dir, '.agents/skills/a/SKILL.md'), 'utf-8'),
    ).toBe('a');
  });

  it('leaves an existing .agents/skills untouched', async () => {
    dir = await fse.mkdtemp(path.join(os.tmpdir(), 'cfsa-test-'));
    await fse.outputFile(path.join(dir, '.claude/skills/a/SKILL.md'), 'a');
    await fse.outputFile(path.join(dir, '.agents/skills/b/SKILL.md'), 'b');
    await mirrorModuleSkills(dir);
    expect(await fse.pathExists(path.join(dir, '.agents/skills/a'))).toBe(
      false,
    );
  });
});

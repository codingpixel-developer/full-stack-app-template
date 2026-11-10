import fse from 'fs-extra';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadRegistry } from '../src/addons/registry';
import { planInstall } from '../src/addons/plan';
import { applyPlans } from '../src/addons/apply';
import { AddonManifest } from '../src/addons/types';
import { ADDONS_ROOT, copyFixtureProject, hashTree } from './helpers';

const modules = { backend: { template: 'nest', folder: 'backend' } };
let projectDir: string;
let sampleA: AddonManifest;

beforeEach(async () => {
  projectDir = await copyFixtureProject();
  sampleA = (await loadRegistry(ADDONS_ROOT)).find(
    (a) => a.name === 'sample-a',
  )!;
});

afterEach(async () => {
  await fse.remove(projectDir);
});

const plan = () =>
  planInstall(
    projectDir,
    modules,
    sampleA,
    path.join(ADDONS_ROOT, 'sample-a'),
    { greeting: 'hi' },
    { projectName: 'demo' },
  );

describe('planInstall', () => {
  it('plans new files, rendered templates and wiring updates', async () => {
    const result = await plan();
    const byPath = Object.fromEntries(result.changes.map((c) => [c.path, c]));

    expect(byPath['backend/src/sample/sample.module.ts'].kind).toBe('create');
    expect(byPath['backend/src/sample/sample.config.ts'].content).toContain(
      "greeting = 'hi'",
    );
    expect(byPath['backend/src/sample/sample.config.ts'].content).toContain(
      "projectName = 'demo'",
    );
    expect(byPath['backend/src/app.module.ts'].content).toContain(
      "import { SampleModule } from './sample/sample.module';\n// cfsa:imports",
    );
    expect(byPath['backend/src/app.module.ts'].content).toContain(
      '    SampleModule,\n    // cfsa:modules',
    );
    expect(byPath['backend/src/config/env.validation.ts'].content).toContain(
      'SAMPLE_KEY: Joi.string().required(),',
    );
    expect(byPath['backend/.env.example'].content).toContain('SAMPLE_KEY=abc');
    expect(
      JSON.parse(byPath['backend/package.json'].content).dependencies,
    ).toMatchObject({ 'left-pad': '^1.3.0', '@nestjs/common': '^12.4.2' });
  });

  it('skips files that already exist in the project', async () => {
    const existing = path.join(
      projectDir,
      'backend/src/sample/sample.module.ts',
    );
    await fse.outputFile(existing, '// my own version\n');
    const result = await plan();
    expect(result.skipped).toContain('backend/src/sample/sample.module.ts');
    expect(result.changes.map((c) => c.path)).not.toContain(
      'backend/src/sample/sample.module.ts',
    );
  });

  it('does not write anything to disk', async () => {
    const before = await hashTree(projectDir);
    await plan();
    expect(await hashTree(projectDir)).toEqual(before);
  });

  it('ignores add-on parts for modules the project does not have', async () => {
    const result = await planInstall(
      projectDir,
      { webApp: { template: 'next', folder: 'web-app' } },
      { ...sampleA, inject: [], env: [], dependencies: {} },
      path.join(ADDONS_ROOT, 'sample-a'),
      { greeting: 'hi' },
      { projectName: 'demo' },
    );
    expect(result.changes).toEqual([]);
  });
});

describe('applyPlans', () => {
  it('writes every planned change', async () => {
    await applyPlans(projectDir, [await plan()]);
    const created = path.join(
      projectDir,
      'backend/src/sample/sample.module.ts',
    );
    expect(await fse.pathExists(created)).toBe(true);
    const appModule = await fse.readFile(
      path.join(projectDir, 'backend/src/app.module.ts'),
      'utf-8',
    );
    expect(appModule).toContain('SampleModule,');
  });
});

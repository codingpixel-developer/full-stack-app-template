import fse from 'fs-extra';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { canAddLater } from '../src/addons/add-later';
import { injectJoi } from '../src/addons/env';
import { installAddons } from '../src/addons/install';
import { optionDefaults } from '../src/addons/prompts';
import { loadRegistry } from '../src/addons/registry';
import { runAddonStep } from '../src/addons/run';
import { AddonManifest } from '../src/addons/types';
import { Manifest, mergeManifest, readManifest } from '../src/manifest';
import { ADDONS_ROOT, copyFixtureProject } from './helpers';

const oldManifest: Manifest = {
  cliVersion: '0.3.0',
  createdAt: '2026-01-01T00:00:00.000Z',
  projectName: 'old',
  modules: { backend: { template: 'nest', folder: 'backend' } },
};

let dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.map((d) => fse.remove(d)));
  dirs = [];
  delete process.env.CFSA_ADDONS_DIR;
});

describe('review fixes', () => {
  it('still refuses add-later for a 0.3.0 project after a module is added', () => {
    const merged = mergeManifest(oldManifest, {});
    const addon = { name: 's3', addLater: true } as AddonManifest;
    expect(canAddLater(merged, addon).ok).toBe(false);
    expect(mergeManifest(merged, {}).createdWithCli).toBe('0.3.0');
  });

  it('reports files skipped because the developer already has them', async () => {
    const projectDir = await copyFixtureProject();
    dirs.push(projectDir);
    const own = path.join(projectDir, 'backend/src/sample/sample.module.ts');
    await fse.outputFile(own, '// mine\n');
    const manifest = (await readManifest(projectDir))!;
    const addons = (await loadRegistry(ADDONS_ROOT)).filter(
      (a) => a.name === 'sample-a',
    );
    const result = await installAddons(
      projectDir,
      manifest,
      addons,
      ADDONS_ROOT,
      {
        'sample-a': {},
      },
    );
    expect(result.skipped).toContain('backend/src/sample/sample.module.ts');
    expect(result.manifest.features?.['sample-a']).toBeDefined();
  });

  it('uses option defaults for keys the answers file leaves out', async () => {
    const sampleA = (await loadRegistry(ADDONS_ROOT)).find(
      (a) => a.name === 'sample-a',
    )!;
    expect(optionDefaults(sampleA)).toEqual({ greeting: 'hello' });
  });

  it('fails when the answers file asks for add-ons but none are available', async () => {
    const empty = await fse.mkdtemp(path.join(os.tmpdir(), 'cfsa-empty-'));
    dirs.push(empty);
    process.env.CFSA_ADDONS_DIR = empty;
    await expect(
      runAddonStep(empty, oldManifest, 'new', { addons: { s3: {} } }),
    ).rejects.toThrow(/s3/);
  });

  it('adds a Joi key even when a longer key ending the same way exists', () => {
    const src =
      'Joi.object({\n  MAIL_HOST: Joi.string(),\n  /* cfsa:env */\n});';
    const out = injectJoi(src, 'env.validation.ts', [
      { module: 'backend', key: 'HOST', example: 'x', joi: 'Joi.string()' },
    ]);
    expect(out).toContain('  HOST: Joi.string(),\n  /* cfsa:env */');
  });
});

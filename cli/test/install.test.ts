import fse from 'fs-extra';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installAddons } from '../src/addons/install';
import { MarkerNotFoundError } from '../src/addons/inject';
import { loadRegistry } from '../src/addons/registry';
import { resolveAddons } from '../src/addons/resolve';
import { Manifest, readManifest } from '../src/manifest';
import { ADDONS_ROOT, copyFixtureProject, hashTree } from './helpers';

let projectDir: string;
let manifest: Manifest;

beforeEach(async () => {
  projectDir = await copyFixtureProject();
  manifest = (await readManifest(projectDir))!;
});

afterEach(async () => {
  await fse.remove(projectDir);
});

async function install(m: Manifest) {
  const all = await loadRegistry(ADDONS_ROOT);
  const installed = Object.keys(m.features ?? {});
  const addons = resolveAddons(['sample-b'], all, m.modules, installed);
  return installAddons(projectDir, m, addons, ADDONS_ROOT, {
    'sample-a': { greeting: 'hi' },
  });
}

describe('installAddons', () => {
  it('writes files and records both add-ons as features', async () => {
    const updated = await install(manifest);
    expect(Object.keys(updated.features ?? {}).sort()).toEqual([
      'sample-a',
      'sample-b',
    ]);
    expect(updated.features?.['sample-a'].options).toEqual({ greeting: 'hi' });
    expect(updated.features?.['sample-a'].version).toBe('1.0.0');
    expect(
      await fse.pathExists(
        path.join(projectDir, 'backend/src/sample/sample.module.ts'),
      ),
    ).toBe(true);
  });

  it('changes nothing when run a second time', async () => {
    const first = await install(manifest);
    const before = await hashTree(projectDir);
    const second = await install(first);
    expect(await hashTree(projectDir)).toEqual(before);
    expect(second.features).toEqual(first.features);
  });

  it('leaves files unchanged when the same add-on is installed again directly', async () => {
    const sampleA = (await loadRegistry(ADDONS_ROOT)).filter(
      (a) => a.name === 'sample-a',
    );
    const answers = { 'sample-a': { greeting: 'hi' } };
    await installAddons(projectDir, manifest, sampleA, ADDONS_ROOT, answers);
    const before = await hashTree(projectDir);
    await installAddons(projectDir, manifest, sampleA, ADDONS_ROOT, answers);
    expect(await hashTree(projectDir)).toEqual(before);
  });

  it('writes nothing when a marker is missing', async () => {
    const appModule = path.join(projectDir, 'backend/src/app.module.ts');
    const content = await fse.readFile(appModule, 'utf-8');
    await fse.writeFile(appModule, content.replace('// cfsa:modules', ''));
    const before = await hashTree(projectDir);
    await expect(install(manifest)).rejects.toBeInstanceOf(MarkerNotFoundError);
    expect(await hashTree(projectDir)).toEqual(before);
  });
});

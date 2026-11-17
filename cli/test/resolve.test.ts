import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadRegistry } from '../src/addons/registry';
import { AddonResolutionError, resolveAddons } from '../src/addons/resolve';
import { AddonManifest } from '../src/addons/types';

const backendOnly = { backend: { template: 'nest', folder: 'backend' } };

let all: AddonManifest[];
beforeAll(async () => {
  all = await loadRegistry(path.join(__dirname, 'fixtures', 'addons'));
});

const names = (list: AddonManifest[]) => list.map((a) => a.name);

describe('resolveAddons', () => {
  it('adds requirements before the add-on that needs them', () => {
    expect(names(resolveAddons(['sample-b'], all, backendOnly, []))).toEqual([
      'sample-a',
      'sample-b',
    ]);
  });

  it('rejects conflicting add-ons, naming both', () => {
    expect(() =>
      resolveAddons(['sample-a', 'sample-x'], all, backendOnly, []),
    ).toThrow(AddonResolutionError);
    expect(() =>
      resolveAddons(['sample-a', 'sample-x'], all, backendOnly, []),
    ).toThrow(/sample-x.*sample-a|sample-a.*sample-x/);
  });

  it('rejects an add-on whose required module is missing', () => {
    expect(() => resolveAddons(['sample-admin'], all, backendOnly, [])).toThrow(
      /admin/,
    );
  });

  it('skips add-ons that are already installed', () => {
    expect(
      names(resolveAddons(['sample-b'], all, backendOnly, ['sample-a'])),
    ).toEqual(['sample-b']);
  });

  it('rejects an unknown add-on name', () => {
    expect(() => resolveAddons(['nope'], all, backendOnly, [])).toThrow(/nope/);
  });

  it('rejects a requirement cycle', () => {
    const base = all.find((a) => a.name === 'sample-b')!;
    const c1 = { ...base, name: 'c1', requires: ['c2'] };
    const c2 = { ...base, name: 'c2', requires: ['c1'] };
    expect(() => resolveAddons(['c1'], [c1, c2], backendOnly, [])).toThrow(
      /cycle/i,
    );
  });

  it('rejects a conflict with an already installed add-on', () => {
    expect(() =>
      resolveAddons(['sample-x'], all, backendOnly, ['sample-a']),
    ).toThrow(AddonResolutionError);
  });
});

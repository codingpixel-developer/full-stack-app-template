import { describe, expect, it } from 'vitest';
import { canAddLater } from '../src/addons/add-later';
import { AddonManifest } from '../src/addons/types';
import { Manifest } from '../src/manifest';

const manifest = (cliVersion: string): Manifest => ({
  cliVersion,
  createdAt: '2026-11-10T00:00:00.000Z',
  projectName: 'demo',
  modules: {},
});

const addon = (addLater: boolean) =>
  ({ name: 's3', addLater }) as AddonManifest;

describe('canAddLater', () => {
  it('refuses projects made before CLI 0.4.0', () => {
    const result = canAddLater(manifest('0.3.0'), addon(true));
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/0\.4\.0/);
  });

  it('refuses add-ons that are setup-time only', () => {
    expect(canAddLater(manifest('0.4.0'), addon(false)).ok).toBe(false);
  });

  it('allows add-later add-ons on new projects', () => {
    expect(canAddLater(manifest('0.4.0'), addon(true)).ok).toBe(true);
    expect(canAddLater(manifest('0.10.1'), addon(true)).ok).toBe(true);
  });
});

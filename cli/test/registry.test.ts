import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadRegistry } from '../src/addons/registry';

const fixtures = path.join(__dirname, 'fixtures');

describe('loadRegistry', () => {
  it('returns all add-ons sorted by name', async () => {
    const addons = await loadRegistry(path.join(fixtures, 'addons'));
    expect(addons.map((a) => a.name)).toEqual([
      'sample-a',
      'sample-admin',
      'sample-b',
      'sample-x',
    ]);
  });

  it('throws naming the folder when name is missing', async () => {
    await expect(
      loadRegistry(path.join(fixtures, 'addons-broken')),
    ).rejects.toThrow(/bad/);
  });

  it('fills defaults for optional fields', async () => {
    const addons = await loadRegistry(path.join(fixtures, 'addons'));
    const b = addons.find((a) => a.name === 'sample-b')!;
    expect(b.conflicts).toEqual([]);
    expect(b.inject).toEqual([]);
    expect(b.options).toEqual([]);
    expect(b.addLater).toBe(false);
  });

  it('returns an empty list when the folder does not exist', async () => {
    expect(await loadRegistry(path.join(fixtures, 'missing'))).toEqual([]);
  });
});

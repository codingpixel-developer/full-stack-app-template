import crypto from 'crypto';
import fse from 'fs-extra';
import os from 'os';
import path from 'path';

export const FIXTURES = path.join(__dirname, 'fixtures');
export const ADDONS_ROOT = path.join(FIXTURES, 'addons');

export async function copyFixtureProject(): Promise<string> {
  const dir = await fse.mkdtemp(path.join(os.tmpdir(), 'cfsa-test-'));
  await fse.copy(path.join(FIXTURES, 'project'), dir);
  return dir;
}

export async function hashTree(dir: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const walk = async (current: string): Promise<void> => {
    for (const entry of await fse.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else {
        const data = await fse.readFile(full);
        out[path.relative(dir, full)] = crypto
          .createHash('sha1')
          .update(data)
          .digest('hex');
      }
    }
  };
  await walk(dir);
  return out;
}

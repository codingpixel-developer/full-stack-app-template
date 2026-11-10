import chalk from 'chalk';
import fse from 'fs-extra';
import os from 'os';
import path from 'path';
import { parentSpec } from '../config';
import { fetchRepo } from '../utils/fetch-repo';

export interface AddonsDir {
  dir: string;
  cleanup: () => Promise<void>;
}

export async function fetchAddonsDir(): Promise<AddonsDir> {
  const local = process.env.CFSA_ADDONS_DIR;
  if (local) return { dir: path.resolve(local), cleanup: async () => {} };

  const dir = path.join(
    os.tmpdir(),
    `cfsa-addons-${process.pid}-${Date.now()}`,
  );
  try {
    await fetchRepo(parentSpec('addons'), dir);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.log(
      chalk.yellow(
        `Could not fetch add-ons (${reason}). Continuing without add-ons.`,
      ),
    );
  }
  return { dir, cleanup: () => fse.remove(dir) };
}

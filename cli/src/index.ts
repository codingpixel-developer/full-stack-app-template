#!/usr/bin/env node

import chalk from 'chalk';
import { readManifest } from './manifest';
import { runNewProject } from './flows/new-project';
import { runAddModule } from './flows/add-module';

async function main(): Promise<void> {
  console.log(chalk.bold('\ncreate-fullstack-app\n'));

  try {
    const existing = await readManifest(process.cwd());
    if (existing) {
      await runAddModule(existing);
    } else {
      await runNewProject();
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\nError: ${error.message}`));
    }
    process.exit(1);
  }
}

main();

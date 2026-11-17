#!/usr/bin/env node

import chalk from 'chalk';
import { readManifest } from './manifest';
import { runNewProject } from './flows/new-project';
import { runAddModule } from './flows/add-module';
import { answersFileArg, loadAnswersFile } from './answers';

async function main(): Promise<void> {
  console.log(chalk.bold('\ncreate-fullstack-app\n'));

  try {
    const answersFile = answersFileArg(process.argv);
    const existing = await readManifest(process.cwd());
    if (existing) {
      if (answersFile) {
        throw new Error(
          '--answers is only supported when creating a new project',
        );
      }
      await runAddModule(existing);
    } else {
      const preset = answersFile
        ? await loadAnswersFile(answersFile)
        : undefined;
      await runNewProject(preset);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\nError: ${error.message}`));
    }
    process.exit(1);
  }
}

main();

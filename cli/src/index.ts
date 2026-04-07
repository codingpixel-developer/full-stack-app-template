#!/usr/bin/env node

import chalk from 'chalk';
import { getProjectConfig } from './prompts';
import { scaffold } from './scaffold';

async function main(): Promise<void> {
  console.log(chalk.bold('\ncreate-fullstack-app\n'));

  try {
    const config = await getProjectConfig();
    await scaffold(config);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\nError: ${error.message}`));
    }
    process.exit(1);
  }
}

main();

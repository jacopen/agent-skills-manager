#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import { addSkill } from './commands/add';
import { listSkillsCmd } from './commands/list';
import { removeSkill } from './commands/remove';
import { applySkill } from './commands/apply';
import { initRepo } from './commands/init';

const program = new Command();

program
  .name('agent-skill-manager')
  .description('CLI tool for managing AI agent skills across repositories')
  .version('0.1.0');

program
  .command('add')
  .description('Add a new skill')
  .argument('<name>', 'Skill name')
  .option('-d, --description <desc>', 'Skill description')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('-a, --agents <agents>', 'Comma-separated agent types (claude-code, codex-cli, gemini-cli, opencode)')
  .option('-f, --file <path>', 'Read skill content from file')
  .action(async (name, options) => {
    try {
      await addSkill(name, options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('list')
  .alias('ls')
  .description('List all skills')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-a, --agent <agent>', 'Filter by agent type')
  .action(async (options) => {
    try {
      await listSkillsCmd(options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('remove')
  .alias('rm')
  .description('Remove a skill')
  .argument('<name>', 'Skill name')
  .action(async (name) => {
    try {
      await removeSkill(name);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('apply')
  .description('Apply skill to repository or globally')
  .argument('<name>', 'Skill name')
  .option('-r, --repo <path>', 'Repository path (defaults to current)')
  .option('-g, --global', 'Apply globally')
  .option('-a, --agent <agent>', 'Agent type (auto-detected if not specified)')
  .action(async (name, options) => {
    try {
      await applySkill(name, options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize agent configuration in repository')
  .argument('[path]', 'Repository path (defaults to current)')
  .option('-a, --agent <agent>', 'Agent type', 'claude-code')
  .action(async (repoPath, options) => {
    try {
      await initRepo(repoPath || process.cwd(), options.agent);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();

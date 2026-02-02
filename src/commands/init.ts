import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { AgentType } from '../types';
import { getAgentConfig, getAllAgents } from '../agents/config';

export async function initRepo(repoPath: string, agentType: string): Promise<void> {
  const validAgents = getAllAgents().map(a => a.name);
  
  if (!validAgents.includes(agentType)) {
    throw new Error(`Invalid agent type: ${agentType}. Valid types: ${validAgents.join(', ')}`);
  }

  const agent = agentType as AgentType;
  const agentConfig = getAgentConfig(agent);
  
  const agentDir = path.join(repoPath, agentConfig.configPath);
  const agentFile = path.join(agentDir, agentConfig.configFileName);

  if (fs.existsSync(agentFile)) {
    console.log(chalk.yellow(`${agentConfig.displayName} configuration already exists in this repository.`));
    return;
  }

  fs.ensureDirSync(agentDir);

  const template = generateAgentTemplate(agent);
  fs.writeFileSync(agentFile, template, 'utf-8');

  console.log(chalk.green(`✓ Initialized ${agentConfig.displayName} configuration!`));
  console.log(chalk.gray(`  Location: ${agentFile}`));
  console.log(chalk.gray(`\nYou can now apply skills using:`));
  console.log(chalk.gray(`  asm apply <skill-name>`));
}

function generateAgentTemplate(agent: AgentType): string {
  const agentConfig = getAgentConfig(agent);
  
  return `# ${agentConfig.displayName} Configuration

This file contains instructions and context for ${agentConfig.displayName} when working in this repository.

## Repository Structure

Add information about your project structure here.

## Development Guidelines

Add your coding standards and best practices here.

## Skills

Skills managed by Agent Skill Manager (asm) will be appended below.
`;
}

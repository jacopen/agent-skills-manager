import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { Skill, AgentType } from '../types';
import { saveSkill, skillExists, getSkillsDirectory } from '../utils/skills';
import { getAllAgents } from '../agents/config';

interface AddOptions {
  description?: string;
  tags?: string;
  agents?: string;
  file?: string;
}

export async function addSkill(name: string, options: AddOptions): Promise<void> {
  if (skillExists(name)) {
    console.log(chalk.yellow(`Skill '${name}' already exists. Use a different name or remove it first.`));
    return;
  }

  let content = '';
  
  if (options.file) {
    if (!fs.existsSync(options.file)) {
      throw new Error(`File not found: ${options.file}`);
    }
    content = fs.readFileSync(options.file, 'utf-8');
  } else {
    // For now, create a template content
    content = `# ${name}\n\nAdd your skill instructions here.`;
  }

  const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
  const agents: AgentType[] = options.agents 
    ? options.agents.split(',').map(a => a.trim()) as AgentType[]
    : ['claude-code', 'codex-cli', 'gemini-cli', 'opencode'];

  // Validate agent types
  const validAgents = getAllAgents().map(a => a.name);
  for (const agent of agents) {
    if (!validAgents.includes(agent)) {
      throw new Error(`Invalid agent type: ${agent}. Valid types: ${validAgents.join(', ')}`);
    }
  }

  const skill: Skill = {
    name,
    description: options.description || '',
    content,
    tags,
    agents,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveSkill(skill);
  
  console.log(chalk.green(`✓ Skill '${name}' created successfully!`));
  console.log(chalk.gray(`  Location: ${path.join(getSkillsDirectory(), name, 'SKILL.md')}`));
  console.log(chalk.gray(`  Tags: ${tags.length > 0 ? tags.join(', ') : 'none'}`));
  console.log(chalk.gray(`  Agents: ${agents.join(', ')}`));
}

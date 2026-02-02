import chalk from 'chalk';
import { listSkills, loadSkill } from '../utils/skills';
import { Skill, AgentType } from '../types';

interface ListOptions {
  tag?: string;
  agent?: string;
}

export async function listSkillsCmd(options: ListOptions): Promise<void> {
  let skills = listSkills();

  // Filter by tag
  if (options.tag) {
    skills = skills.filter(s => s.tags.includes(options.tag!));
  }

  // Filter by agent
  if (options.agent) {
    skills = skills.filter(s => s.agents.includes(options.agent as AgentType));
  }

  if (skills.length === 0) {
    console.log(chalk.yellow('No skills found.'));
    if (options.tag || options.agent) {
      console.log(chalk.gray('Try removing filters to see all skills.'));
    } else {
      console.log(chalk.gray('Use "asm add <name>" to create your first skill.'));
    }
    return;
  }

  console.log(chalk.bold(`\nFound ${skills.length} skill(s):\n`));

  for (const skill of skills) {
    console.log(chalk.cyan(`  ${skill.name}`));
    if (skill.description) {
      console.log(chalk.gray(`    Description: ${skill.description}`));
    }
    if (skill.tags.length > 0) {
      console.log(chalk.gray(`    Tags: ${skill.tags.join(', ')}`));
    }
    console.log(chalk.gray(`    Agents: ${skill.agents.join(', ')}`));
    console.log(chalk.gray(`    Updated: ${new Date(skill.updatedAt).toLocaleDateString()}`));
    console.log();
  }
}

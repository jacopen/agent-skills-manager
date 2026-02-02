import chalk from 'chalk';
import { deleteSkill, skillExists, loadSkill } from '../utils/skills';

export async function removeSkill(name: string): Promise<void> {
  if (!skillExists(name)) {
    console.log(chalk.yellow(`Skill '${name}' not found.`));
    return;
  }

  const skill = loadSkill(name);
  deleteSkill(name);
  
  console.log(chalk.green(`✓ Skill '${name}' removed successfully!`));
  
  if (skill) {
    console.log(chalk.gray(`  Was applied to: ${skill.agents.join(', ')}`));
  }
}

import * as path from 'path';
import chalk from 'chalk';
import { loadSkill, applySkillToRepository, applySkillGlobally } from '../utils/skills';
import { detectAgentInRepo, getRepoRoot, validateRepositoryPath } from '../utils/repo';
import { AgentType } from '../types';
import { getAgentConfig, getAllAgents } from '../agents/config';

interface ApplyOptions {
  repo?: string;
  global?: boolean;
  agent?: string;
}

export async function applySkill(name: string, options: ApplyOptions): Promise<void> {
  const skill = loadSkill(name);
  
  if (!skill) {
    throw new Error(`Skill '${name}' not found.`);
  }

  // Validate agent type
  let agent: AgentType;
  if (options.agent) {
    const validAgents = getAllAgents().map(a => a.name);
    if (!validAgents.includes(options.agent)) {
      throw new Error(`Invalid agent type: ${options.agent}. Valid types: ${validAgents.join(', ')}`);
    }
    agent = options.agent as AgentType;
  } else if (options.global) {
    // Default to claude-code for global if not specified
    agent = 'claude-code';
  } else {
    // Auto-detect from repo
    const repoPath = options.repo || process.cwd();
    const detectedAgent = detectAgentInRepo(repoPath);
    if (!detectedAgent) {
      throw new Error(`No agent configuration found in ${repoPath}. Use --agent to specify or run 'asm init' first.`);
    }
    agent = detectedAgent;
  }

  const agentConfig = getAgentConfig(agent);

  if (options.global) {
    // Apply globally
    applySkillGlobally(skill, agent);
    console.log(chalk.green(`✓ Skill '${name}' applied globally for ${agentConfig.displayName}!`));
    console.log(chalk.gray(`  Location: ${agentConfig.globalConfigPath}`));
  } else {
    // Apply to repository
    const repoPath = options.repo ? path.resolve(options.repo) : getRepoRoot() || process.cwd();
    
    if (!validateRepositoryPath(repoPath)) {
      throw new Error(`Invalid repository path: ${repoPath}`);
    }

    applySkillToRepository(skill, repoPath, agent);
    console.log(chalk.green(`✓ Skill '${name}' applied to repository!`));
    console.log(chalk.gray(`  Repository: ${repoPath}`));
    console.log(chalk.gray(`  Agent: ${agentConfig.displayName}`));
    console.log(chalk.gray(`  Location: ${path.join(repoPath, agentConfig.configPath, agentConfig.configFileName)}`));
  }
}

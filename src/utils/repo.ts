import * as fs from 'fs-extra';
import * as path from 'path';
import { AgentType } from '../types';
import { getAgentConfig } from '../agents/config';

export function detectAgentInRepo(repoPath: string): AgentType | null {
  // Check for each agent's config directory
  const agents: AgentType[] = ['claude-code', 'codex-cli', 'gemini-cli', 'opencode', 'cursor', 'antigravity'];
  
  for (const agent of agents) {
    const agentConfig = getAgentConfig(agent);
    const agentDir = path.join(repoPath, agentConfig.configPath);
    const agentFile = path.join(agentDir, agentConfig.configFileName);
    
    if (fs.existsSync(agentFile)) {
      return agent;
    }
  }
  
  return null;
}

export function getRepoRoot(startPath: string = process.cwd()): string | null {
  let currentPath = path.resolve(startPath);
  
  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, '.git'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  
  return null;
}

export function validateRepositoryPath(repoPath: string): boolean {
  return fs.existsSync(repoPath) && fs.statSync(repoPath).isDirectory();
}

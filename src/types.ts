export interface Skill {
  name: string;
  description: string;
  content: string;
  tags: string[];
  agents: AgentType[];
  createdAt: string;
  updatedAt: string;
}

export type AgentType = 
  | 'claude-code' 
  | 'codex-cli' 
  | 'gemini-cli' 
  | 'opencode'
  | 'cursor'
  | 'antigravity';

export interface AgentConfig {
  name: string;
  displayName: string;
  configFileName: string;
  configPath: string;
  globalConfigPath: string;
  skillFormat: 'markdown' | 'yaml' | 'json';
  skillsPath: string;
  globalSkillsPath: string;
}

export interface RepositoryConfig {
  path: string;
  skills: string[];
  agent?: AgentType;
}

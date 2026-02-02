import { AgentConfig, AgentType } from '../types';
import * as path from 'path';
import * as os from 'os';

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code',
    configFileName: 'CLAUDE.md',
    configPath: '.claude',
    globalConfigPath: path.join(os.homedir(), '.claude', 'CLAUDE.md'),
    skillFormat: 'markdown'
  },
  'codex-cli': {
    name: 'codex-cli',
    displayName: 'Codex CLI',
    configFileName: 'CODEX.md',
    configPath: '.codex',
    globalConfigPath: path.join(os.homedir(), '.codex', 'CODEX.md'),
    skillFormat: 'markdown'
  },
  'gemini-cli': {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    configFileName: 'GEMINI.md',
    configPath: '.gemini',
    globalConfigPath: path.join(os.homedir(), '.gemini', 'GEMINI.md'),
    skillFormat: 'markdown'
  },
  'opencode': {
    name: 'opencode',
    displayName: 'OpenCode',
    configFileName: 'AGENTS.md',
    configPath: '.opencode',
    globalConfigPath: path.join(os.homedir(), '.opencode', 'AGENTS.md'),
    skillFormat: 'markdown'
  }
};

export function getAgentConfig(agent: AgentType): AgentConfig {
  return AGENT_CONFIGS[agent];
}

export function getAllAgents(): AgentConfig[] {
  return Object.values(AGENT_CONFIGS);
}

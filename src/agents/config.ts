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
    skillFormat: 'markdown',
    skillsPath: '.claude/skills',
    globalSkillsPath: path.join(os.homedir(), '.claude', 'skills')
  },
  'codex-cli': {
    name: 'codex-cli',
    displayName: 'Codex CLI',
    configFileName: 'CODEX.md',
    configPath: '.codex',
    globalConfigPath: path.join(os.homedir(), '.codex', 'CODEX.md'),
    skillFormat: 'markdown',
    skillsPath: '.codex/skills',
    globalSkillsPath: path.join(os.homedir(), '.codex', 'skills')
  },
  'gemini-cli': {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    configFileName: 'GEMINI.md',
    configPath: '.gemini',
    globalConfigPath: path.join(os.homedir(), '.gemini', 'GEMINI.md'),
    skillFormat: 'markdown',
    skillsPath: '.gemini/skills',
    globalSkillsPath: path.join(os.homedir(), '.gemini', 'skills')
  },
  'opencode': {
    name: 'opencode',
    displayName: 'OpenCode',
    configFileName: 'AGENTS.md',
    configPath: '.opencode',
    globalConfigPath: path.join(os.homedir(), '.opencode', 'AGENTS.md'),
    skillFormat: 'markdown',
    skillsPath: '.opencode/skills',
    globalSkillsPath: path.join(os.homedir(), '.opencode', 'skills')
  },
  'cursor': {
    name: 'cursor',
    displayName: 'Cursor',
    configFileName: '.cursorrules',
    configPath: '.cursor',
    globalConfigPath: path.join(os.homedir(), '.cursor', '.cursorrules'),
    skillFormat: 'markdown',
    skillsPath: '.cursor/skills',
    globalSkillsPath: path.join(os.homedir(), '.cursor', 'skills')
  },
  'antigravity': {
    name: 'antigravity',
    displayName: 'AntiGravity',
    configFileName: 'AGENTS.md',
    configPath: '.antigravity',
    globalConfigPath: path.join(os.homedir(), '.antigravity', 'AGENTS.md'),
    skillFormat: 'markdown',
    skillsPath: '.antigravity/skills',
    globalSkillsPath: path.join(os.homedir(), '.antigravity', 'skills')
  }
};

export function getAgentConfig(agent: AgentType): AgentConfig {
  return AGENT_CONFIGS[agent];
}

export function getAllAgents(): AgentConfig[] {
  return Object.values(AGENT_CONFIGS);
}

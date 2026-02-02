import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Skill, AgentType } from '../types';
import { getAgentConfig } from '../agents/config';

// Get the repository root (where asm is installed)
function getRepoRoot(): string {
  // This assumes the CLI is run from the repo or we can find it
  // Try to find the skills directory in current working directory or parent
  let currentDir = process.cwd();
  
  while (currentDir !== path.dirname(currentDir)) {
    const skillsDir = path.join(currentDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback to the directory where this script is located
  return path.resolve(__dirname, '..', '..');
}

export function getSkillsDirectory(): string {
  return path.join(getRepoRoot(), 'skills');
}

export function getSkillDirPath(name: string): string {
  return path.join(getSkillsDirectory(), name);
}

export function getSkillFilePath(name: string): string {
  return path.join(getSkillDirPath(name), 'SKILL.md');
}

export function ensureSkillsDirectory(): void {
  fs.ensureDirSync(getSkillsDirectory());
}

export function skillExists(name: string): boolean {
  return fs.existsSync(getSkillFilePath(name));
}

export function saveSkill(skill: Skill): void {
  ensureSkillsDirectory();
  const skillDir = getSkillDirPath(skill.name);
  const skillPath = getSkillFilePath(skill.name);
  
  fs.ensureDirSync(skillDir);
  
  const content = generateSkillMarkdown(skill);
  fs.writeFileSync(skillPath, content, 'utf-8');
}

export function loadSkill(name: string): Skill | null {
  const skillPath = getSkillFilePath(name);
  if (!fs.existsSync(skillPath)) {
    return null;
  }
  
  const content = fs.readFileSync(skillPath, 'utf-8');
  return parseSkillMarkdown(name, content);
}

export function listSkills(): Skill[] {
  ensureSkillsDirectory();
  
  if (!fs.existsSync(getSkillsDirectory())) {
    return [];
  }
  
  const entries = fs.readdirSync(getSkillsDirectory(), { withFileTypes: true });
  const skills: Skill[] = [];
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillPath = path.join(getSkillsDirectory(), entry.name, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        const skill = loadSkill(entry.name);
        if (skill) {
          skills.push(skill);
        }
      }
    }
  }
  
  return skills;
}

export function deleteSkill(name: string): boolean {
  const skillDir = getSkillDirPath(name);
  if (fs.existsSync(skillDir)) {
    fs.removeSync(skillDir);
    return true;
  }
  return false;
}

export function generateSkillMarkdown(skill: Skill): string {
  const tags = skill.tags.length > 0 ? `\ntags: ${skill.tags.join(', ')}` : '';
  const agents = skill.agents.length > 0 ? `\nagents: ${skill.agents.join(', ')}` : '';
  
  return `---
name: ${skill.name}
description: ${skill.description}${tags}${agents}
createdAt: ${skill.createdAt}
updatedAt: ${skill.updatedAt}
---

${skill.content}
`;
}

export function parseSkillMarkdown(name: string, content: string): Skill {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    return {
      name,
      description: '',
      content: content.trim(),
      tags: [],
      agents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  const frontmatter = frontmatterMatch[1];
  const bodyContent = frontmatterMatch[2].trim();
  
  const metadata: Record<string, string> = {};
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  });
  
  return {
    name: metadata.name || name,
    description: metadata.description || '',
    content: bodyContent,
    tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : [],
    agents: metadata.agents ? metadata.agents.split(',').map(a => a.trim()) as AgentType[] : [],
    createdAt: metadata.createdAt || new Date().toISOString(),
    updatedAt: metadata.updatedAt || new Date().toISOString()
  };
}

// Symbolic link management for agents
export function createSymbolicLink(skillName: string, agent: AgentType, targetRepoPath?: string): void {
  const skillDirPath = getSkillDirPath(skillName);
  
  if (!fs.existsSync(skillDirPath)) {
    throw new Error(`Skill '${skillName}' not found.`);
  }
  
  let linkPath: string;
  
  if (targetRepoPath) {
    // Repository-specific link
    linkPath = getAgentSkillLinkPath(targetRepoPath, agent, skillName);
  } else {
    // Global link
    linkPath = getGlobalAgentSkillLinkPath(agent, skillName);
  }
  
  // Ensure parent directory exists
  fs.ensureDirSync(path.dirname(linkPath));
  
  // Remove existing link if present
  if (fs.existsSync(linkPath)) {
    fs.removeSync(linkPath);
  }
  
  // Create symbolic link to the skill directory (not just SKILL.md)
  // This allows the skill to access other assets like images, templates, etc.
  fs.symlinkSync(skillDirPath, linkPath);
}

export function removeSymbolicLink(skillName: string, agent: AgentType, targetRepoPath?: string): void {
  let linkPath: string;
  
  if (targetRepoPath) {
    linkPath = getAgentSkillLinkPath(targetRepoPath, agent, skillName);
  } else {
    linkPath = getGlobalAgentSkillLinkPath(agent, skillName);
  }
  
  if (fs.existsSync(linkPath)) {
    fs.removeSync(linkPath);
  }
}

function getAgentSkillLinkPath(repoPath: string, agent: AgentType, skillName: string): string {
  const agentConfig = getAgentConfig(agent);
  // Standard location: .{agent}/skills/{skill-name}/ (symlink to skill directory)
  return path.join(repoPath, agentConfig.skillsPath, skillName);
}

function getGlobalAgentSkillLinkPath(agent: AgentType, skillName: string): string {
  const agentConfig = getAgentConfig(agent);
  // Standard location: ~/.{agent}/skills/{skill-name}/ (symlink to skill directory)
  return path.join(agentConfig.globalSkillsPath, skillName);
}

export function applySkillToRepository(skill: Skill, repoPath: string, agent: AgentType): void {
  // Use symbolic link approach
  createSymbolicLink(skill.name, agent, repoPath);
}

export function applySkillGlobally(skill: Skill, agent: AgentType): void {
  // Use symbolic link approach
  createSymbolicLink(skill.name, agent);
}

export function removeSkillFromRepository(skillName: string, repoPath: string, agent: AgentType): void {
  removeSymbolicLink(skillName, agent, repoPath);
}

export function removeSkillGlobally(skillName: string, agent: AgentType): void {
  removeSymbolicLink(skillName, agent);
}

// Check if skill is applied globally for a specific agent
export function isSkillAppliedGlobally(skillName: string, agent: AgentType): boolean {
  const linkPath = getGlobalAgentSkillLinkPath(agent, skillName);
  return fs.existsSync(linkPath);
}

// Check if skill is applied to a repository for a specific agent
export function isSkillAppliedLocally(skillName: string, agent: AgentType, repoPath: string): boolean {
  const linkPath = getAgentSkillLinkPath(repoPath, agent, skillName);
  return fs.existsSync(linkPath);
}

// Get all agents that have this skill applied globally
export function getGlobalApplyStatus(skillName: string): AgentType[] {
  const agents: AgentType[] = ['claude-code', 'codex-cli', 'gemini-cli', 'opencode'];
  return agents.filter(agent => isSkillAppliedGlobally(skillName, agent));
}

// Get all agents that have this skill applied locally (to current directory)
export function getLocalApplyStatus(skillName: string, repoPath: string): AgentType[] {
  const agents: AgentType[] = ['claude-code', 'codex-cli', 'gemini-cli', 'opencode'];
  return agents.filter(agent => isSkillAppliedLocally(skillName, agent, repoPath));
}

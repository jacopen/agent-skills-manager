import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Skill, AgentType } from '../types';
import { getAgentConfig } from '../agents/config';

// Get the repository root (where asm is installed) - for built-in skills
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

// Get user's skills directory (~/.asm/skills) - for user-created skills
export function getUserSkillsDirectory(): string {
  return path.join(os.homedir(), '.asm', 'skills');
}

// Get repository skills directory (built-in skills)
export function getRepoSkillsDirectory(): string {
  return path.join(getRepoRoot(), 'skills');
}

// Legacy function - now defaults to user directory
export function getSkillsDirectory(): string {
  return getUserSkillsDirectory();
}

// Get skill directory path in user's skills directory
function getUserSkillDirPath(name: string): string {
  return path.join(getUserSkillsDirectory(), name);
}

// Get skill directory path in repo skills directory
function getRepoSkillDirPath(name: string): string {
  return path.join(getRepoSkillsDirectory(), name);
}

// Get skill file path (checks user dir first, then repo)
export function getSkillFilePath(name: string): string {
  // Check user directory first
  const userPath = path.join(getUserSkillDirPath(name), 'SKILL.md');
  if (fs.existsSync(userPath)) {
    return userPath;
  }
  // Fallback to repo directory
  return path.join(getRepoSkillDirPath(name), 'SKILL.md');
}

// Ensure user skills directory exists
export function ensureSkillsDirectory(): void {
  fs.ensureDirSync(getUserSkillsDirectory());
}

// Check if skill exists in either location
export function skillExists(name: string): boolean {
  return fs.existsSync(getSkillFilePath(name));
}

// Save skill to user directory
export function saveSkill(skill: Skill): void {
  ensureSkillsDirectory();
  const skillDir = getUserSkillDirPath(skill.name);
  const skillPath = path.join(skillDir, 'SKILL.md');
  
  fs.ensureDirSync(skillDir);
  
  const content = generateSkillMarkdown(skill);
  fs.writeFileSync(skillPath, content, 'utf-8');
}

// Load skill from either user or repo directory
export function loadSkill(name: string): Skill | null {
  const skillPath = getSkillFilePath(name);
  if (!fs.existsSync(skillPath)) {
    return null;
  }
  
  const content = fs.readFileSync(skillPath, 'utf-8');
  return parseSkillMarkdown(name, content);
}

// List all skills from both user and repo directories
export function listSkills(): Skill[] {
  ensureSkillsDirectory();
  
  const skills = new Map<string, Skill>(); // Use Map to avoid duplicates
  
  // Load from user directory first (user skills take precedence)
  const userSkillsDir = getUserSkillsDirectory();
  if (fs.existsSync(userSkillsDir)) {
    const entries = fs.readdirSync(userSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(userSkillsDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          const skill = loadSkillFromPath(entry.name, skillPath);
          if (skill) {
            skills.set(entry.name, skill);
          }
        }
      }
    }
  }
  
  // Load from repo directory (built-in skills)
  const repoSkillsDir = getRepoSkillsDirectory();
  if (fs.existsSync(repoSkillsDir)) {
    const entries = fs.readdirSync(repoSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(repoSkillsDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          // Only add if not already in user skills
          if (!skills.has(entry.name)) {
            const skill = loadSkillFromPath(entry.name, skillPath);
            if (skill) {
              skills.set(entry.name, skill);
            }
          }
        }
      }
    }
  }
  
  return Array.from(skills.values());
}

// Helper to load skill from specific path
function loadSkillFromPath(name: string, skillPath: string): Skill | null {
  const content = fs.readFileSync(skillPath, 'utf-8');
  return parseSkillMarkdown(name, content);
}

// Delete skill from user directory (users can only delete their own skills)
export function deleteSkill(name: string): boolean {
  const userSkillDir = getUserSkillDirPath(name);
  const repoSkillDir = getRepoSkillDirPath(name);
  
  // Can only delete from user directory
  if (fs.existsSync(userSkillDir)) {
    fs.removeSync(userSkillDir);
    return true;
  }
  
  // If it's a built-in skill, show error message
  if (fs.existsSync(repoSkillDir)) {
    throw new Error(`Cannot delete built-in skill '${name}'. Built-in skills are managed by the repository.`);
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

// Helper to get skill directory path from either location
export function getSkillDirPath(name: string): string {
  // Check user directory first
  const userDir = getUserSkillDirPath(name);
  if (fs.existsSync(userDir)) {
    return userDir;
  }
  // Fallback to repo directory
  return getRepoSkillDirPath(name);
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

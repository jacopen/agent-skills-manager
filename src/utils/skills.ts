import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Skill, AgentType } from '../types';
import { getAgentConfig } from '../agents/config';

const SKILLS_DIR = process.env.ASM_SKILLS_DIR || path.join(os.homedir(), '.agent-skills');

export function getSkillsDirectory(): string {
  return SKILLS_DIR;
}

export function ensureSkillsDirectory(): void {
  fs.ensureDirSync(SKILLS_DIR);
}

export function getSkillPath(name: string): string {
  return path.join(SKILLS_DIR, `${name}.md`);
}

export function skillExists(name: string): boolean {
  return fs.existsSync(getSkillPath(name));
}

export function saveSkill(skill: Skill): void {
  ensureSkillsDirectory();
  const skillPath = getSkillPath(skill.name);
  const content = generateSkillMarkdown(skill);
  fs.writeFileSync(skillPath, content, 'utf-8');
}

export function loadSkill(name: string): Skill | null {
  const skillPath = getSkillPath(name);
  if (!fs.existsSync(skillPath)) {
    return null;
  }
  
  const content = fs.readFileSync(skillPath, 'utf-8');
  return parseSkillMarkdown(name, content);
}

export function listSkills(): Skill[] {
  ensureSkillsDirectory();
  const files = fs.readdirSync(SKILLS_DIR);
  const skills: Skill[] = [];
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const name = path.basename(file, '.md');
      const skill = loadSkill(name);
      if (skill) {
        skills.push(skill);
      }
    }
  }
  
  return skills;
}

export function deleteSkill(name: string): boolean {
  const skillPath = getSkillPath(name);
  if (fs.existsSync(skillPath)) {
    fs.removeSync(skillPath);
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

export function applySkillToRepository(skill: Skill, repoPath: string, agent: AgentType): void {
  const agentConfig = getAgentConfig(agent);
  const agentDir = path.join(repoPath, agentConfig.configPath);
  const agentFile = path.join(agentDir, agentConfig.configFileName);
  
  fs.ensureDirSync(agentDir);
  
  let existingContent = '';
  if (fs.existsSync(agentFile)) {
    existingContent = fs.readFileSync(agentFile, 'utf-8');
  }
  
  const skillHeader = `<!-- Skill: ${skill.name} -->`;
  const skillFooter = `<!-- End Skill: ${skill.name} -->`;
  
  const skillSection = `${skillHeader}\n${skill.content}\n${skillFooter}`;
  
  if (existingContent.includes(skillHeader)) {
    const regex = new RegExp(`${skillHeader}[\\s\\S]*?${skillFooter}`, 'g');
    existingContent = existingContent.replace(regex, skillSection);
  } else {
    existingContent = existingContent 
      ? `${existingContent}\n\n${skillSection}`
      : skillSection;
  }
  
  fs.writeFileSync(agentFile, existingContent, 'utf-8');
}

export function applySkillGlobally(skill: Skill, agent: AgentType): void {
  const agentConfig = getAgentConfig(agent);
  const globalDir = path.dirname(agentConfig.globalConfigPath);
  
  fs.ensureDirSync(globalDir);
  
  let existingContent = '';
  if (fs.existsSync(agentConfig.globalConfigPath)) {
    existingContent = fs.readFileSync(agentConfig.globalConfigPath, 'utf-8');
  }
  
  const skillHeader = `<!-- Skill: ${skill.name} -->`;
  const skillFooter = `<!-- End Skill: ${skill.name} -->`;
  
  const skillSection = `${skillHeader}\n${skill.content}\n${skillFooter}`;
  
  if (existingContent.includes(skillHeader)) {
    const regex = new RegExp(`${skillHeader}[\\s\\S]*?${skillFooter}`, 'g');
    existingContent = existingContent.replace(regex, skillSection);
  } else {
    existingContent = existingContent 
      ? `${existingContent}\n\n${skillSection}`
      : skillSection;
  }
  
  fs.writeFileSync(agentConfig.globalConfigPath, existingContent, 'utf-8');
}

export function removeSkillFromRepository(skillName: string, repoPath: string, agent: AgentType): void {
  const agentConfig = getAgentConfig(agent);
  const agentFile = path.join(repoPath, agentConfig.configPath, agentConfig.configFileName);
  
  if (!fs.existsSync(agentFile)) {
    return;
  }
  
  let content = fs.readFileSync(agentFile, 'utf-8');
  const skillHeader = `<!-- Skill: ${skillName} -->`;
  const skillFooter = `<!-- End Skill: ${skillName} -->`;
  
  const regex = new RegExp(`${skillHeader}[\\s\\S]*?${skillFooter}\\n?`, 'g');
  content = content.replace(regex, '');
  
  fs.writeFileSync(agentFile, content.trim(), 'utf-8');
}

export function removeSkillGlobally(skillName: string, agent: AgentType): void {
  const agentConfig = getAgentConfig(agent);
  
  if (!fs.existsSync(agentConfig.globalConfigPath)) {
    return;
  }
  
  let content = fs.readFileSync(agentConfig.globalConfigPath, 'utf-8');
  const skillHeader = `<!-- Skill: ${skillName} -->`;
  const skillFooter = `<!-- End Skill: ${skillName} -->`;
  
  const regex = new RegExp(`${skillHeader}[\\s\\S]*?${skillFooter}\\n?`, 'g');
  content = content.replace(regex, '');
  
  fs.writeFileSync(agentConfig.globalConfigPath, content.trim(), 'utf-8');
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {
  getUserSkillsDirectory,
  getRepoSkillsDirectory,
  getSkillFilePath,
  ensureSkillsDirectory,
  skillExists,
  saveSkill,
  loadSkill,
  listSkills,
  deleteSkill,
  generateSkillMarkdown,
  parseSkillMarkdown
} from '../../src/utils/skills';
import { Skill } from '../../src/types';

describe('Skills Utilities', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asm-test-'));
    originalCwd = process.cwd();
    process.chdir(testDir);
    
    // Mock the user skills directory to use test directory
    vi.stubEnv('HOME', testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.removeSync(testDir);
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('Directory Functions', () => {
    it('getUserSkillsDirectory should return ~/.asm/skills', () => {
      const dir = getUserSkillsDirectory();
      expect(dir).toBe(path.join(testDir, '.asm', 'skills'));
    });

    it('ensureSkillsDirectory should create the directory', () => {
      const userDir = getUserSkillsDirectory();
      expect(fs.existsSync(userDir)).toBe(false);
      
      ensureSkillsDirectory();
      
      expect(fs.existsSync(userDir)).toBe(true);
    });
  });

  describe('Skill CRUD Operations', () => {
    it('skillExists should return false for non-existent skill', () => {
      expect(skillExists('non-existent')).toBe(false);
    });

    it('skillExists should return true for existing skill', () => {
      const skill: Skill = {
        name: 'test-skill',
        description: 'Test description',
        content: '# Test Content',
        tags: ['test'],
        agents: ['claude-code'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveSkill(skill);
      expect(skillExists('test-skill')).toBe(true);
    });

    it('saveSkill should create skill in user directory', () => {
      const skill: Skill = {
        name: 'my-skill',
        description: 'My description',
        content: '# My Content',
        tags: ['tag1', 'tag2'],
        agents: ['claude-code', 'cursor'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveSkill(skill);
      
      const skillPath = path.join(getUserSkillsDirectory(), 'my-skill', 'SKILL.md');
      expect(fs.existsSync(skillPath)).toBe(true);
    });

    it('loadSkill should return skill data', () => {
      const skill: Skill = {
        name: 'load-test',
        description: 'Load test description',
        content: '# Load Test Content',
        tags: ['load'],
        agents: ['opencode'],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      };
      
      saveSkill(skill);
      const loaded = loadSkill('load-test');
      
      expect(loaded).not.toBeNull();
      expect(loaded?.name).toBe('load-test');
      expect(loaded?.description).toBe('Load test description');
      expect(loaded?.tags).toContain('load');
      expect(loaded?.agents).toContain('opencode');
    });

    it('loadSkill should return null for non-existent skill', () => {
      const loaded = loadSkill('non-existent-skill');
      expect(loaded).toBeNull();
    });

    it('listSkills should return all skills from user directory', () => {
      const skill1: Skill = {
        name: 'user-skill-one',
        description: 'First skill',
        content: '# First',
        tags: [],
        agents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const skill2: Skill = {
        name: 'user-skill-two',
        description: 'Second skill',
        content: '# Second',
        tags: [],
        agents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveSkill(skill1);
      saveSkill(skill2);
      
      const skills = listSkills();
      const skillNames = skills.map(s => s.name);
      
      // Should include the user skills we just created
      expect(skillNames).toContain('user-skill-one');
      expect(skillNames).toContain('user-skill-two');
      // Should have at least 2 skills (could be more from repo)
      expect(skills.length).toBeGreaterThanOrEqual(2);
    });

    it('deleteSkill should remove user skill', () => {
      const skill: Skill = {
        name: 'delete-me',
        description: 'To be deleted',
        content: '# Delete Me',
        tags: [],
        agents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveSkill(skill);
      expect(skillExists('delete-me')).toBe(true);
      
      const result = deleteSkill('delete-me');
      
      expect(result).toBe(true);
      expect(skillExists('delete-me')).toBe(false);
    });

    it('deleteSkill should throw error for built-in skills', () => {
      // Create a fake built-in skill in repo directory
      const repoSkillsDir = getRepoSkillsDirectory();
      fs.ensureDirSync(repoSkillsDir);
      const builtInSkillDir = path.join(repoSkillsDir, 'built-in');
      fs.ensureDirSync(builtInSkillDir);
      fs.writeFileSync(
        path.join(builtInSkillDir, 'SKILL.md'),
        '---\nname: built-in\ndescription: Built-in\n---\n\n# Built-in'
      );
      
      expect(() => deleteSkill('built-in')).toThrow('Cannot delete built-in skill');
    });
  });

  describe('Markdown Generation and Parsing', () => {
    it('generateSkillMarkdown should create valid markdown', () => {
      const skill: Skill = {
        name: 'test-md',
        description: 'Test markdown',
        content: '# Test Content\n\nSome instructions.',
        tags: ['test', 'markdown'],
        agents: ['claude-code', 'cursor'],
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T10:30:00.000Z'
      };
      
      const markdown = generateSkillMarkdown(skill);
      
      expect(markdown).toContain('name: test-md');
      expect(markdown).toContain('description: Test markdown');
      expect(markdown).toContain('tags: test, markdown');
      expect(markdown).toContain('agents: claude-code, cursor');
      expect(markdown).toContain('createdAt: 2026-01-15T10:00:00.000Z');
      expect(markdown).toContain('# Test Content');
      expect(markdown).toContain('Some instructions.');
    });

    it('parseSkillMarkdown should parse valid markdown', () => {
      const markdown = `---
name: parsed-skill
description: Parsed description
tags: tag1, tag2
agents: codex-cli, gemini-cli
createdAt: 2026-02-01T00:00:00.000Z
updatedAt: 2026-02-02T00:00:00.000Z
---

# Parsed Content

This is the skill content.`;
      
      const skill = parseSkillMarkdown('parsed-skill', markdown);
      
      expect(skill.name).toBe('parsed-skill');
      expect(skill.description).toBe('Parsed description');
      expect(skill.tags).toEqual(['tag1', 'tag2']);
      expect(skill.agents).toEqual(['codex-cli', 'gemini-cli']);
      expect(skill.content).toBe('# Parsed Content\n\nThis is the skill content.');
    });

    it('parseSkillMarkdown should handle markdown without frontmatter', () => {
      const markdown = '# Simple Content\n\nJust some text.';
      
      const skill = parseSkillMarkdown('simple', markdown);
      
      expect(skill.name).toBe('simple');
      expect(skill.description).toBe('');
      expect(skill.content).toBe('# Simple Content\n\nJust some text.');
      expect(skill.tags).toEqual([]);
      expect(skill.agents).toEqual([]);
    });
  });

  describe('Dual Storage System', () => {
    it('should prioritize user skills over repo skills', () => {
      // Create a skill in both locations
      const repoDir = getRepoSkillsDirectory();
      fs.ensureDirSync(repoDir);
      const repoSkillDir = path.join(repoDir, 'duplicate');
      fs.ensureDirSync(repoSkillDir);
      fs.writeFileSync(
        path.join(repoSkillDir, 'SKILL.md'),
        generateSkillMarkdown({
          name: 'duplicate',
          description: 'Repo version',
          content: '# Repo',
          tags: [],
          agents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      );
      
      const userSkill: Skill = {
        name: 'duplicate',
        description: 'User version',
        content: '# User',
        tags: [],
        agents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveSkill(userSkill);
      
      const skills = listSkills();
      const duplicate = skills.find(s => s.name === 'duplicate');
      
      expect(duplicate?.description).toBe('User version');
    });

    it('getSkillFilePath should return user path when skill exists in both', () => {
      // Create repo skill
      const repoDir = getRepoSkillsDirectory();
      fs.ensureDirSync(repoDir);
      const repoSkillDir = path.join(repoDir, 'both');
      fs.ensureDirSync(repoSkillDir);
      fs.writeFileSync(path.join(repoSkillDir, 'SKILL.md'), '---\nname: both\n---\n\nRepo');
      
      // Create user skill
      const userSkill: Skill = {
        name: 'both',
        description: 'User',
        content: '# User',
        tags: [],
        agents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveSkill(userSkill);
      
      const filePath = getSkillFilePath('both');
      expect(filePath).toContain('.asm');
      expect(filePath).not.toContain(repoDir);
    });
  });
});

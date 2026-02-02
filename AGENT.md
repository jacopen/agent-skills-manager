# AGENT.md - Development Guide for Agent Skills Manager

## Project Overview

Agent Skill Manager (ASM) is a CLI tool for centrally managing AI agent Skills across multiple repositories. It enables sharing reusable Skills to various AI agents (Claude Code, Codex CLI, Gemini CLI, OpenCode) using symbolic links.

## Project Structure

```
agent-skills-manager/
├── src/
│   ├── index.ts              # Main CLI entry point (Commander.js)
│   ├── types.ts              # TypeScript interfaces
│   ├── agents/
│   │   └── config.ts         # Agent configurations
│   ├── commands/             # CLI command implementations
│   │   ├── add.ts            # Add new skill
│   │   ├── apply.ts          # Apply skill to repos/globally
│   │   ├── init.ts           # Initialize agent config
│   │   ├── list.ts           # List available skills
│   │   └── remove.ts         # Remove skill
│   └── utils/
│       ├── skills.ts         # Skill file operations & symlinks
│       └── repo.ts           # Repository utilities
├── skills/                   # Central skill storage
│   └── {skill-name}/
│       └── SKILL.md          # Skill definition file
├── dist/                     # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd agent-skills-manager
npm install

# Build and link globally
npm run build
npm link
```

### Verify Installation

```bash
asm --version
asm --help
```

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run dev` | Watch mode - recompile on changes |
| `npm start` | Run CLI directly via `node dist/index.js` |

## CLI Commands

### `asm add <name>`
Create a new skill.

Options:
- `-d, --description <text>` - Skill description
- `-t, --tags <csv>` - Comma-separated tags
- `-a, --agents <csv>` - Target agents (defaults to all)
- `-f, --file <path>` - Load content from file

### `asm list` / `asm ls`
List all skills.

Options:
- `-t, --tag <tag>` - Filter by tag
- `-a, --agent <agent>` - Filter by agent type

### `asm remove <name>` / `asm rm <name>`
Delete a skill from central storage.

### `asm apply <name>`
Apply skill via symbolic link.

Options:
- `-r, --repo <path>` - Target repository (defaults to current)
- `-g, --global` - Apply globally to user config
- `-a, --agent <type>` - Specify agent type

### `asm init [path]`
Initialize agent configuration in a repository.

Options:
- `-a, --agent <type>` - Agent type (defaults to `claude-code`)

## Supported Agents

| Agent | Config Directory | Config File |
|-------|------------------|-------------|
| claude-code | `.claude/` | `CLAUDE.md` |
| codex-cli | `.codex/` | `CODEX.md` |
| gemini-cli | `.gemini/` | `GEMINI.md` |
| opencode | `.opencode/` | `AGENTS.md` |

## Skill File Format

Skills are Markdown files with YAML frontmatter stored in `skills/{skill-name}/SKILL.md`:

```markdown
---
name: skill-name
description: Skill description
tags: tag1, tag2
agents: claude-code, codex-cli
createdAt: 2024-01-01T00:00:00.000Z
updatedAt: 2024-01-01T00:00:00.000Z
---

# Skill Content

Your instructions here...
```

## Development Workflow

### Adding New Features

1. Run `npm run dev` for watch mode
2. Edit files in `src/`
3. Test changes with `asm` commands
4. Commit when ready

### Adding a New Skill

```bash
# Create skill via CLI
asm add my-skill -d "Description" -t tag1,tag2

# Edit the generated file
# skills/my-skill/SKILL.md

# Commit
git add skills/my-skill/
git commit -m "Add my-skill skill"
```

### Adding a New Agent Type

1. Add type to `AgentType` union in `src/types.ts`
2. Add configuration to `AGENT_CONFIGS` in `src/agents/config.ts`
3. Update agent detection in `src/utils/repo.ts` if needed
4. Rebuild: `npm run build`

## Code Conventions

### TypeScript

- **Strict mode** enabled
- **Target**: ES2020 with CommonJS modules
- **Async/await** for asynchronous operations
- Explicit type annotations for function parameters and return values

### Naming

- **Interfaces**: PascalCase (`Skill`, `AgentConfig`)
- **Functions**: camelCase (`saveSkill`, `listSkills`)
- **Constants**: UPPER_SNAKE_CASE
- **Files**: lowercase with hyphens (`skills.ts`)

### Error Handling

- Validate inputs before operations
- Throw descriptive errors in utility functions
- Catch and display with chalk in command handlers
- Exit with code 1 on error

## Testing

No automated test framework is configured. Test manually:

```bash
# Test workflow
asm add test-skill -d "Test" -t test
asm list
asm list -t test
mkdir /tmp/test-repo && cd /tmp/test-repo
asm init
asm apply test-skill
ls -la .claude/skills/
asm remove test-skill
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | CLI entry point, command registration |
| `src/types.ts` | TypeScript interfaces for Skill, AgentConfig, AgentType |
| `src/agents/config.ts` | Agent configurations with paths |
| `src/utils/skills.ts` | Skill CRUD operations, symlink management |
| `src/utils/repo.ts` | Repository detection, validation |
| `src/commands/*.ts` | Individual command implementations |

## Dependencies

### Production
- **commander** - CLI framework
- **chalk** - Terminal colors
- **fs-extra** - Enhanced file operations
- **yaml** - YAML parsing

### Development
- **typescript** - TypeScript compiler
- **@types/node**, **@types/fs-extra** - Type definitions

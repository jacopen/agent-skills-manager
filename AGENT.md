# AGENT.md - Development Guide for Agent Skills Manager

## Project Overview

Agent Skill Manager (ASM) is a CLI tool for centrally managing AI agent Skills across multiple repositories. It enables sharing reusable Skills to various AI agents (Claude Code, Codex CLI, Gemini CLI, OpenCode, Cursor, AntiGravity) using symbolic links.

## Key Features

- **Dual Storage System**: User skills stored in `~/.asm/skills/` and built-in skills in repository
- **6 Agent Support**: Claude Code, Codex CLI, Gemini CLI, OpenCode, Cursor, AntiGravity
- **Asset Support**: Entire skill directories linked (images, templates, etc.)
- **Apply Status Tracking**: Shows global and local apply status
- **Skill Priority**: User skills override built-in skills

## Project Structure

```
agent-skills-manager/
├── src/
│   ├── index.ts              # Main CLI entry point (Commander.js)
│   ├── types.ts              # TypeScript interfaces
│   ├── agents/
│   │   └── config.ts         # Agent configurations (6 agents)
│   ├── commands/             # CLI command implementations
│   │   ├── add.ts            # Add new skill
│   │   ├── apply.ts          # Apply skill to repos/globally
│   │   ├── init.ts           # Initialize agent config
│   │   ├── list.ts           # List available skills (with apply status)
│   │   └── remove.ts         # Remove skill
│   └── utils/
│       ├── skills.ts         # Skill file operations & symlinks
│       └── repo.ts           # Repository utilities
├── skills/                   # Built-in skill storage
│   └── {skill-name}/
│       └── SKILL.md          # Skill definition file
├── tests/                    # Unit tests (Vitest)
│   └── unit/
│       └── skills.test.ts    # Skills utility tests
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI
├── dist/                     # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── vitest.config.mjs         # Vitest configuration
├── README.md
└── LICENSE                   # MIT License
```

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd agent-skill-manager
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
| `npm run lint` | TypeScript type checking (`tsc --noEmit`) |

## CLI Commands

### `asm add <name>`
Create a new skill (saved to `~/.asm/skills/` by default).

Options:
- `-d, --description <text>` - Skill description
- `-t, --tags <csv>` - Comma-separated tags
- `-a, --agents <csv>` - Target agents (defaults to all 6)
- `-f, --file <path>` - Load content from file

Example:
```bash
asm add my-skill -d "Description" -t tag1,tag2
asm add my-skill -d "Cursor only" -a cursor
```

### `asm list` / `asm ls`
List all skills with apply status.

Options:
- `-t, --tag <tag>` - Filter by tag
- `-a, --agent <agent>` - Filter by agent type

Output shows:
- Skill name and description
- Tags
- **Apply status**: Shows which agents have skill applied globally or locally
- Last updated date

### `asm remove <name>` / `asm rm <name>`
Delete a skill from user storage (`~/.asm/skills/`).

**Note**: Built-in skills (in `skills/` directory) cannot be deleted.

### `asm apply <name>`
Apply skill via symbolic link to entire skill directory.

Options:
- `-r, --repo <path>` - Target repository (defaults to current)
- `-g, --global` - Apply globally to user config
- `-a, --agent <type>` - Specify agent type

Symbolic link structure:
- Local: `.claude/skills/{skill-name}/` → `~/.asm/skills/{skill-name}/`
- Global: `~/.claude/skills/{skill-name}/` → `~/.asm/skills/{skill-name}/`

### `asm init [path]`
Initialize agent configuration in a repository.

Options:
- `-a, --agent <type>` - Agent type (defaults to `claude-code`)

## Supported Agents

| Agent | Config Directory | Config File | Description |
|-------|------------------|-------------|-------------|
| claude-code | `.claude/` | `CLAUDE.md` | Anthropic's Claude Code |
| codex-cli | `.codex/` | `CODEX.md` | OpenAI's Codex CLI |
| gemini-cli | `.gemini/` | `GEMINI.md` | Google's Gemini CLI |
| opencode | `.opencode/` | `AGENTS.md` | OpenCode CLI |
| cursor | `.cursor/` | `.cursorrules` | Cursor IDE |
| antigravity | `.antigravity/` | `AGENTS.md` | AntiGravity AI |

## Dual Storage System

### 1. User Skills (`~/.asm/skills/`)
- Default location for new skills
- Created by `asm add`
- Can be deleted via `asm remove`
- User has full control

### 2. Built-in Skills (`skills/` in repo)
- Standard skills provided with ASM
- Version controlled in Git
- Cannot be deleted via CLI
- Override by creating user skill with same name

**Priority**: User skills override built-in skills when both exist.

## Skill File Format

Skills are Markdown files with YAML frontmatter:

```markdown
---
name: skill-name
description: Skill description
tags: tag1, tag2
agents: claude-code, codex-cli, cursor, antigravity
createdAt: 2026-02-02T00:00:00.000Z
updatedAt: 2026-02-02T00:00:00.000Z
---

# Skill Content

Your instructions here...
```

Skills can include additional assets:
```
~/.asm/skills/my-skill/
├── SKILL.md
├── assets/
│   └── diagram.png
└── templates/
    └── template.ts
```

## Testing

We use **Vitest** for unit testing.

### Test Commands

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

```
tests/
└── unit/
    └── skills.test.ts    # 15 tests covering:
                          # - Skill CRUD operations
                          # - Markdown parsing/generation
                          # - Dual storage system
                          # - Directory operations
```

### Writing Tests

Tests use Vitest with the following features:
- `describe` / `it` for test organization
- `expect` for assertions
- `beforeEach` / `afterEach` for setup/teardown
- `vi` for mocking (fs, process, etc.)

Example:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveSkill, loadSkill, skillExists } from '../../src/utils/skills';

describe('Skill Operations', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup
  });

  it('should save and load skill', () => {
    const skill = { /* ... */ };
    saveSkill(skill);
    expect(skillExists('test')).toBe(true);
  });
});
```

### Manual Testing

```bash
# Test workflow
asm add test-skill -d "Test" -t test
asm list
asm list -t test
mkdir /tmp/test-repo && cd /tmp/test-repo
asm init -a claude-code
asm apply test-skill
ls -la .claude/skills/
asm remove test-skill
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR:

### Test Matrix
- Node.js versions: 20.x, 22.x, 24.x
- OS: ubuntu-latest

### Jobs
1. **test**: Runs on all Node versions
   - Install dependencies (`npm ci`)
   - TypeScript check (`npm run lint`)
   - Run tests (`npm test`)
   - Coverage report (`npm run test:coverage`)
   - Upload to Codecov (Node 20.x only)

2. **build**: Depends on test job
   - Build project (`npm run build`)
   - Verify CLI works (`asm --version`, `asm --help`)

### Status Checks
All CI checks must pass before merging PRs.

## Development Workflow

### Adding New Features

1. Create feature branch: `git checkout -b feature/my-feature`
2. Run `npm run dev` for watch mode
3. Edit files in `src/`
4. Add/update tests in `tests/`
5. Run `npm test` to verify
6. Commit and push
7. Create PR

### Adding a New Skill

```bash
# Create skill via CLI (saved to ~/.asm/skills/)
asm add my-skill -d "Description" -t tag1,tag2

# Edit the generated file
# ~/.asm/my-skill/SKILL.md

# Test it
asm list
asm apply my-skill
```

### Adding a New Agent Type

1. Add type to `AgentType` union in `src/types.ts`
2. Add configuration to `AGENT_CONFIGS` in `src/agents/config.ts`
3. Add agent to test arrays in `src/utils/skills.ts`
4. Add agent to detection list in `src/utils/repo.ts`
5. Add agent to default list in `src/commands/add.ts`
6. Rebuild: `npm run build`
7. Test: Create skill for new agent
8. Update documentation (README.md, AGENT.md)

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

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | CLI entry point, command registration |
| `src/types.ts` | TypeScript interfaces (Skill, AgentConfig, AgentType) |
| `src/agents/config.ts` | Agent configurations (6 agents) |
| `src/utils/skills.ts` | Skill CRUD, symlink management, apply status |
| `src/utils/repo.ts` | Repository detection, agent detection |
| `src/commands/*.ts` | Individual command implementations |
| `tests/unit/skills.test.ts` | Unit tests for skills utilities |
| `vitest.config.mjs` | Vitest configuration |
| `.github/workflows/ci.yml` | CI/CD pipeline |

## Dependencies

### Production
- **commander** - CLI framework
- **chalk** - Terminal colors
- **fs-extra** - Enhanced file operations
- **yaml** - YAML parsing

### Development
- **typescript** - TypeScript compiler
- **vitest** - Test framework
- **@vitest/coverage-v8** - Coverage provider
- **@types/node**, **@types/fs-extra** - Type definitions

## License

MIT License - See LICENSE file for details.

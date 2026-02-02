# Agent Skill Manager (ASM)

A CLI tool for centrally managing AI agent Skills. Easily apply Skills to multiple repositories and global configurations.

**Features**:
- Manage Skills following the standard AGENT SKILL specification (`skills/{skill-name}/SKILL.md`)
- Dual storage system: User skills (~/.asm/skills/) and built-in skills
- Apply skills to multiple agents simultaneously
- Entire skill directories (with assets) linked via symbolic links
- Apply status tracking (global and local)

## Supported Agents

- **Claude Code** - Anthropic's Claude Code CLI
- **Codex CLI** - OpenAI's Codex CLI
- **Gemini CLI** - Google's Gemini CLI
- **OpenCode** - OpenCode CLI
- **Cursor** - Cursor IDE with AI coding assistant
- **AntiGravity** - AntiGravity AI coding assistant

## Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0

## Installation

### Method 1: Install from local development directory (recommended)

```bash
# Clone the repository
git clone <repository-url>
cd agent-skill-manager

# Install dependencies
npm install

# Build
npm run build

# Link globally (updates during development are automatically reflected)
npm link
```

### Method 2: Install as a package

```bash
# Within the repository
npm install -g .
```

### Verify Installation

```bash
# Check path
which asm

# Check version
asm --version

# Display help
asm --help
```

### Uninstallation

```bash
npm unlink -g agent-skill-manager
```

## Quick Start

```bash
# 1. Verify asm is available
asm --version

# 2. Create a test Skill
asm add hello-world -d "Test skill" -t test

# 3. Verify the created Skill
asm list

# 4. Apply to current repository (agent configuration required)
asm init -a claude-code  # Only for the first time
asm apply hello-world

# 5. Verify symbolic links
ls -la .claude/skills/
```

## Usage

### Add Skill

```bash
# Create new (applies to all 6 agents by default)
asm add my-skill -d "Description" -t tag1,tag2

# Create with specific agents only
asm add my-skill -d "Description" -a claude-code,cursor

# Load from file
asm add my-skill -f ./skill-content.md
```

### List Skills

```bash
# List all skills with apply status
asm list

# Filter by tag
asm list -t python

# Filter by agent
asm list -a claude-code
```

**Output example:**
```
  frontend-design
    Description: Create distinctive, production-grade frontend interfaces...
    Applied:
      Global: claude-code, codex-cli, opencode
    Updated: 2/2/2026

  my-custom-skill
    Applied: (not applied)
    Updated: 2/2/2026
```

### Remove Skill

```bash
# Remove a user skill (built-in skills cannot be deleted)
asm remove my-skill
```

### Apply Skill

```bash
# Apply to current repository (create symbolic link)
asm apply my-skill

# Apply to specific repository
asm apply my-skill -r /path/to/repo

# Apply globally
asm apply my-skill --global -a claude-code
```

When applying, symbolic links are created in the target repository or global configuration:
- Repository: `.claude/skills/{skill-name}/` → `~/.asm/skills/{skill-name}/` (entire skill directory)
- Global: `~/.claude/skills/{skill-name}/` → `~/.asm/skills/{skill-name}/` (entire skill directory)

This links the entire skill directory, allowing access to SKILL.md and any additional assets (images, templates, etc.).

### Initialize Repository

```bash
# Initialize for Claude Code
asm init

# Initialize for other agents
asm init -a codex-cli
asm init -a cursor
```

## Skill Storage Locations

ASM supports two types of skill storage:

### 1. User Skills (`~/.asm/skills/`)

User-created skills are stored in your home directory. This is where new skills are saved by default:

```
~/.asm/skills/
├── my-custom-skill/
│   ├── SKILL.md          # Your custom skill definition
│   └── assets/
│       └── diagram.png   # Additional assets
└── project-templates/
    ├── SKILL.md
    └── templates/
        └── template.ts
```

### 2. Built-in Skills (Repository)

Standard skills provided with ASM are stored in the repository's `skills/` directory:

```
skills/
├── frontend-design/
│   └── SKILL.md          # Built-in skill
└── typescript-standards/
    └── SKILL.md
```

**Skill Priority**: User skills take precedence over built-in skills. If a skill exists in both locations, the user version is used.

**Deleting Skills**: You can only delete user skills. Built-in skills are managed by the repository and cannot be deleted through ASM.

### SKILL.md Format

Following the standard AGENT SKILL specification, Markdown format with YAML frontmatter:

```markdown
---
name: my-skill
description: Skill description
tags: tag1, tag2
agents: claude-code, codex-cli, cursor, antigravity
createdAt: 2026-02-02T00:00:00.000Z
updatedAt: 2026-02-02T00:00:00.000Z
---

# Skill Content

Your skill instructions here...
```

## Development

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# TypeScript type check
npm run lint
```

### Building

```bash
# Build TypeScript
npm run build

# Build and watch for changes
npm run dev
```

## CI/CD

This project uses GitHub Actions for continuous integration:

- **Node.js versions tested**: 20.x, 22.x, 24.x
- **Automated testing**: All tests run on every push and PR
- **Coverage reporting**: Coverage uploaded to Codecov
- **TypeScript checking**: Type checking with `tsc --noEmit`

## How Symbolic Links Work

ASM provides Skills to each agent by creating symbolic links:

```
Your Project Repo          ASM User Skills             Agent Config
    │                         │                             │
    │                         ├── ~/.asm/skills/            │
    │                         │   ├── skill-a/              │
    │                         │   │   ├── SKILL.md          │
    │                         │   │   └── assets/           │
    │                         │   └── skill-b/              │
    │                         │       ├── SKILL.md          │
    │                         │       └── templates/        │
    │                         │                             │
    └── .claude/skills/  ←────┘                             │
            ├── skill-a ─────────────────── symlink ────────┤
            └── skill-b ─────────────────── symlink ────────┤
                                                            │
    ~/.claude/skills/  ←────────────────────────────────────┘
            ├── skill-a ─────────────────── symlink ──────── (global)
            └── skill-b ─────────────────── symlink ──────── (global)
```

Benefits of this approach:
- **Dual Storage**: User skills and built-in skills managed separately
- **Asset Support**: Skills can include images, templates, and other files
- **Apply Status Tracking**: Know where skills are applied (global/local)
- **Centralized Management**: Single source of truth for each skill
- **Multi-Agent Support**: Same skill works across all 6 supported agents
- **Version Control**: Built-in skills tracked in Git

## Agent-Specific Configuration Paths

| Agent | Config File | Local Path | Global Path |
|-------|-------------|------------|-------------|
| Claude Code | `CLAUDE.md` | `.claude/skills/` | `~/.claude/skills/` |
| Codex CLI | `CODEX.md` | `.codex/skills/` | `~/.codex/skills/` |
| Gemini CLI | `GEMINI.md` | `.gemini/skills/` | `~/.gemini/skills/` |
| OpenCode | `AGENTS.md` | `.opencode/skills/` | `~/.opencode/skills/` |
| Cursor | `.cursorrules` | `.cursor/skills/` | `~/.cursor/skills/` |
| AntiGravity | `AGENTS.md` | `.antigravity/skills/` | `~/.antigravity/skills/` |

## License

MIT

# Agent Skill Manager (ASM)

A CLI tool for centrally managing AI agent Skills. Easily apply Skills to multiple repositories and global configurations.

**Features**: Manage Skills following the standard AGENT SKILL specification (`skills/{skill-name}/SKILL.md`) and provide them to each agent via symbolic links.

## Supported Agents

- Claude Code
- Codex CLI
- Gemini CLI
- OpenCode

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
# Create new
asm add my-skill -d "Description" -t tag1,tag2

# Load from file
asm add my-skill -f ./skill-content.md
```

### List Skills

```bash
asm list

# Filter by tag
asm list -t python

# Filter by agent
asm list -a claude-code
```

### Remove Skill

```bash
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
- Repository: `.claude/skills/{skill-name}/` → `asm-repo/skills/{skill-name}/` (entire skill directory)
- Global: `~/.claude/skills/{skill-name}/` → `asm-repo/skills/{skill-name}/` (entire skill directory)

This links the entire skill directory, allowing access to SKILL.md and any additional assets (images, templates, etc.).

### Initialize Repository

```bash
# Initialize for Claude Code
asm init

# Initialize for other agents
asm init -a codex-cli
```

## Skill Storage Location

Skills are stored in the `skills/` directory of this repository:

```
skills/
├── my-skill/
│   └── SKILL.md          # Skill definition file
├── frontend-design/
│   └── SKILL.md
└── typescript-standards/
    └── SKILL.md
```

### SKILL.md Format

Following the standard AGENT SKILL specification, Markdown format with YAML frontmatter:

```markdown
---
name: my-skill
description: Skill description
tags: tag1, tag2
agents: claude-code, codex-cli
createdAt: 2026-02-02T00:00:00.000Z
updatedAt: 2026-02-02T00:00:00.000Z
---

# Skill Content

Your skill instructions here...
```

## Git Management

Skills are centrally managed in this repository and can be version controlled with Git:

```bash
# Add a new Skill
asm add new-feature -d "New feature skill"

# Commit to Git
git add skills/new-feature/
git commit -m "Add new-feature skill"
git push
```

## How Symbolic Links Work

ASM provides Skills to each agent by creating symbolic links:

```
Your Project Repo          ASM Repo                    Agent Config
    │                         │                             │
    │                         ├── skills/                   │
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
- Centralized Skill management (single source of truth)
- Share the same Skill across multiple repositories
- Version control Skills with Git
- Agents load Skills in a standard way

## Agent-Specific Configuration Paths

| Agent | Local Path | Global Path |
|------------|------------|--------------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex CLI | `.codex/skills/` | `~/.codex/skills/` |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` |
| OpenCode | `.opencode/skills/` | `~/.opencode/skills/` |

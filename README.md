# Agent Skill Manager (ASM)

AIエージェントのSkillを一元管理するCLIツールです。複数のリポジトリやグローバル設定に対して、Skillを簡単に適用できます。

**特徴**: 標準的なAGENT SKILL規格に従った構造（`skills/{skill-name}/SKILL.md`）でSkillを管理し、各エージェントにシンボリックリンクで提供します。

## 対応エージェント

- Claude Code
- Codex CLI
- Gemini CLI
- OpenCode

## インストール

### 方法1: ローカル開発ディレクトリからインストール（推奨）

```bash
# リポジトリをクローン
git clone <repository-url>
cd agent-skill-manager

# 依存関係をインストール
npm install

# ビルド
npm run build

# グローバルにリンク（開発中の更新も自動反映）
npm link
```

### 方法2: パッケージとしてインストール

```bash
# リポジトリ内で
npm install -g .
```

### インストール確認

```bash
# パスの確認
which asm

# バージョン確認
asm --version

# ヘルプ表示
asm --help
```

### アンインストール

```bash
npm unlink -g agent-skill-manager
```

## クイックスタート

```bash
# 1. asmが使えることを確認
asm --version

# 2. テスト用のSkillを作成
asm add hello-world -d "Test skill" -t test

# 3. 作成したSkillを確認
asm list

# 4. 現在のリポジトリに適用（エージェント設定が必要）
asm init -a claude-code  # 初回のみ
asm apply hello-world

# 5. シンボリックリンクを確認
ls -la .claude/skills/
```

## 使用方法

### Skillを追加

```bash
# 新規作成
asm add my-skill -d "Description" -t tag1,tag2

# ファイルから読み込み
asm add my-skill -f ./skill-content.md
```

### Skill一覧

```bash
asm list

# タグでフィルタ
asm list -t python

# エージェントでフィルタ
asm list -a claude-code
```

### Skillを削除

```bash
asm remove my-skill
```

### Skillを適用

```bash
# 現在のリポジトリに適用（シンボリックリンク作成）
asm apply my-skill

# 特定のリポジトリに適用
asm apply my-skill -r /path/to/repo

# グローバルに適用
asm apply my-skill --global -a claude-code
```

適用時には、対象のリポジトリまたはグローバル設定にシンボリックリンクが作成されます：
- リポジトリ: `.claude/skills/{skill-name}.md` → `asm-repo/skills/{skill-name}/SKILL.md`
- グローバル: `~/.claude/skills/{skill-name}.md` → `asm-repo/skills/{skill-name}/SKILL.md`

### リポジトリを初期化

```bash
# Claude Code用に初期化
asm init

# 他のエージェント用に初期化
asm init -a codex-cli
```

## Skillの保存場所

Skillはこのリポジトリの `skills/` ディレクトリに保存されます：

```
skills/
├── my-skill/
│   └── SKILL.md          # Skill定義ファイル
├── frontend-design/
│   └── SKILL.md
└── typescript-standards/
    └── SKILL.md
```

### SKILL.md フォーマット

標準的なAGENT SKILL規格に従い、YAML frontmatterを含むMarkdown形式：

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

## Git管理

Skillはこのリポジトリで一元管理し、Gitでバージョン管理できます：

```bash
# 新しいSkillを追加
asm add new-feature -d "New feature skill"

# Gitにコミット
git add skills/new-feature/
git commit -m "Add new-feature skill"
git push
```

## シンボリックリンクの仕組み

ASMは各エージェントに対してシンボリックリンクを作成することでSkillを提供します：

```
Your Project Repo          ASM Repo                    Agent Config
    │                         │                             │
    │                         ├── skills/                   │
    │                         │   ├── skill-a/              │
    │                         │   │   └── SKILL.md          │
    │                         │   └── skill-b/              │
    │                         │       └── SKILL.md          │
    │                         │                             │
    └── .claude/skills/  ←────┘                             │
            ├── skill-a.md  ─────────────── symlink ────────┤
            └── skill-b.md  ─────────────── symlink ────────┤
                                                            │
    ~/.claude/skills/  ←────────────────────────────────────┘
            ├── skill-a.md  ─────────────── symlink ──────── (global)
            └── skill-b.md  ─────────────── symlink ──────── (global)
```

この方式の利点：
- Skillを一元管理（単一の真実源）
- 複数リポジトリで同じSkillを共有
- GitでSkillのバージョン管理が可能
- エージェントは標準的な方法でSkillを読み込み

## エージェント別設定パス

| エージェント | ローカルパス | グローバルパス |
|------------|------------|--------------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex CLI | `.codex/skills/` | `~/.codex/skills/` |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` |
| OpenCode | `.opencode/skills/` | `~/.opencode/skills/` |

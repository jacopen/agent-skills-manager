# Agent Skill Manager (ASM)

AIエージェントのSkillを一元管理するCLIツールです。複数のリポジトリやグローバル設定に対して、Skillを簡単に適用できます。

## 対応エージェント

- Claude Code
- Codex CLI
- Gemini CLI
- OpenCode

## インストール

```bash
npm install
npm run build
npm link
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
# 現在のリポジトリに適用
asm apply my-skill

# 特定のリポジトリに適用
asm apply my-skill -r /path/to/repo

# グローバルに適用
asm apply my-skill --global -a claude-code
```

### リポジトリを初期化

```bash
# Claude Code用に初期化
asm init

# 他のエージェント用に初期化
asm init -a codex-cli
```

## Skillの保存場所

デフォルト: `~/.agent-skills/`

環境変数 `ASM_SKILLS_DIR` で変更可能

## ディレクトリ構造

```
~/.agent-skills/
├── skill1.md
├── skill2.md
└── ...
```

## Git管理

SkillフォルダをGitリポジトリとして管理することで、複数マシン間で同期できます。

```bash
cd ~/.agent-skills
git init
git add .
git commit -m "Initial skills"
```

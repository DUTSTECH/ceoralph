---
description: Show help and available commands
argument-hint: [command]
allowed-tools: [Read]
---

# /ceo-ralph:help

Show help and available commands.

## Usage

```
/ceo-ralph:help
/ceo-ralph:help [command]
```

## Arguments

- `command` (optional): Get detailed help for a specific command

## Output (General Help)

```markdown
## CEO Ralph Help

**CEO Ralph** - Claude Opus as CEO with Codex Workers

Claude (Opus 4.5) acts as the CEO, handling research, planning, and review.
GPT Codex workers handle code implementation under Claude's supervision.

**Core Principle**: "You are a COORDINATOR, not an IMPLEMENTER."

### Workflow

```
/ceo-ralph:start → Research → Requirements → Design → Tasks → Execute
                      ↓            ↓           ↓        ↓        ↓
                  research.md  requirements.md design.md tasks.md code!
```

### Commands

**Getting Started**
| Command | Description |
|---------|-------------|
| `/ceo-ralph:start [name] [goal]` | Smart entry - resume or create new |
| `/ceo-ralph:new <name> [goal]` | Create new spec, start research |
| `/ceo-ralph:setup` | Configure Codex MCP |
| `/ceo-ralph:help` | Show this help |

**Workflow Phases**
| Command | Description |
|---------|-------------|
| `/ceo-ralph:research` | Run research phase |
| `/ceo-ralph:requirements` | Generate requirements |
| `/ceo-ralph:design` | Create technical design |
| `/ceo-ralph:tasks` | Break into executable tasks |
| `/ceo-ralph:implement` | Execute tasks via Codex |

**Spec Management**
| Command | Description |
|---------|-------------|
| `/ceo-ralph:status` | Show current progress |
| `/ceo-ralph:switch [name]` | Change active spec |
| `/ceo-ralph:refactor` | Update specs after implementation |

**Execution Control**
| Command | Description |
|---------|-------------|
| `/ceo-ralph:pause` | Pause execution |
| `/ceo-ralph:resume` | Resume paused execution |
| `/ceo-ralph:cancel` | Cancel and cleanup |

**Other**
| Command | Description |
|---------|-------------|
| `/ceo-ralph:feedback` | Submit feedback or issues |

### Quick Mode

Skip approval gates with `--quick`:
```
/ceo-ralph:start "my feature" --quick
```

Quick mode:
- Auto-approves each phase
- Runs all phases without stopping
- Still pauses on errors/escalations
- Still uses delegation (never implements directly)

### Key Concepts

**Spec**: A feature specification containing research, requirements, design, and tasks.
Stored in `./specs/{name}/` directory.

**Approval Gates**: Each phase requires user approval before proceeding (unless `--quick`).

**Delegation Principle**: Claude coordinates, Codex implements. Claude never writes code directly.

**Codex Workers**: GPT models that implement code via MCP delegation.

**4-Layer Verification**: Every task verified for:
1. Contradiction detection
2. Uncommitted files
3. Checkmark presence
4. TASK_COMPLETE signal

**POC-First**: Implementation follows "make it work, then make it right" methodology.

### Task Markers

| Marker | Meaning |
|--------|---------|
| `[P]` | Parallel execution |
| `[VERIFY]` | Quality checkpoint |
| `[POC]` | Proof of concept first |
| `[CRITICAL]` | Critical path (5 retries) |
| `[OPTIONAL]` | Optional (2 retries) |

### Configuration

Environment variables:
- `CEO_RALPH_MAX_RETRIES` - Max retries per task (default: 3)
- `CEO_RALPH_PARALLEL_LIMIT` - Max parallel workers (default: 3)
- `CEO_RALPH_MAX_ITERATIONS` - Max global loop iterations (default: 100)

Codex model configured by `/ceo-ralph:setup` (default: `gpt-5.2-codex`).

### Post-Install Checklist

1. Install Codex CLI: `npm install -g @openai/codex`
2. Authenticate: `codex login`
3. Run `/ceo-ralph:setup`
4. Restart Claude Code
5. Run `/ceo-ralph:implement` to confirm MCP connectivity

See https://github.com/dutsAI/ceo-ralph for full documentation.

### More Help

```
/ceo-ralph:help [command]  # Detailed help for a command
```
```

## Output (Command-Specific Help)

```markdown
## /ceo-ralph:{command}

{Full content of the command's markdown file}
```

## Error Handling

| Error | Action |
|-------|--------|
| Unknown command | List available commands |

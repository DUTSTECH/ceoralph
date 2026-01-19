# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this plugin.

## What This Is

A Claude Code plugin that provides GPT Codex as worker agents for spec-driven autonomous development. Claude Opus 4.5 acts as CEO orchestrator, delegating implementation tasks to GPT Codex workers.

## Development Commands

```bash
# Test plugin locally
claude --plugin-dir /path/to/ceo-ralph

# Run setup to configure MCP
/ceo-ralph:setup

# Start a new spec
/ceo-ralph:start

# Get help
/ceo-ralph:help
```

No build step, no dependencies. Uses Codex CLI's native MCP server.

## Architecture

### Orchestration Flow

Claude acts as CEO—delegates implementation to GPT Codex based on spec-driven workflow phases.

```
User Request → Claude Code → /ceo-ralph:start
                                   ↓
              ┌────────────────────┼────────────────────┐
              ↓                    ↓                    ↓
         Research           Requirements            Design
              ↓                    ↓                    ↓
           Tasks ──────────────→ Execute ──────────→ Complete
              ↓                    ↓
        [Task Planning]    [Codex Delegation]
                                   ↓
                          mcp__codex__codex
```

### Workflow Phases

1. **Research** - Gather context and constraints
2. **Requirements** - Define acceptance criteria
3. **Design** - Technical architecture
4. **Tasks** - Break into executable units
5. **Execute** - Delegate to Codex workers

### Task Notation

- `[P]` - Parallel task (can run concurrently)
- `[VERIFY]` - Verification checkpoint
- `[POC]` - Proof of concept first
- `[CRITICAL]` - Critical path blocker

## Available Commands

| Command | Description |
|---------|-------------|
| `/ceo-ralph:start` | Start a new spec |
| `/ceo-ralph:research` | Run research phase |
| `/ceo-ralph:requirements` | Generate requirements |
| `/ceo-ralph:design` | Create technical design |
| `/ceo-ralph:tasks` | Break into tasks |
| `/ceo-ralph:execute` | Delegate to Codex |
| `/ceo-ralph:status` | Show progress |
| `/ceo-ralph:pause` | Pause execution |
| `/ceo-ralph:resume` | Resume execution |
| `/ceo-ralph:cancel` | Cancel and cleanup |
| `/ceo-ralph:setup` | Configure MCP |
| `/ceo-ralph:help` | Show help |

## MCP Integration

Uses Codex CLI's native MCP server:
- Tool: `mcp__codex__codex`
- Auth: `codex login` (OAuth)
- Model: `gpt-5.2-codex`

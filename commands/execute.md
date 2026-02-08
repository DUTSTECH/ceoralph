---
description: Start the execution loop with Codex MCP or Task sub-agents
argument-hint: [--max-iterations N] [--executor auto|codex|task]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task]
---

# Execute

This is an alias for `/ceo-ralph:implement`.

See [implement.md](implement.md) for full documentation.

## Quick Reference

Executes tasks from `tasks.md` by delegating to the best available executor:
- **Codex MCP** (`mcp__codex__codex`) — GPT Codex workers via MCP protocol
- **Task sub-agents** — Claude Task tool fallback when Codex is unavailable

The executor is auto-detected unless overridden with `--executor`.

### Features
- Dual-executor support (Codex MCP + Task tool fallback)
- POC-first workflow for uncertain implementations
- Parallel task execution where marked with `[P]`
- 4-layer verification at `[VERIFY]` checkpoints
- Progress tracking and status updates
- Delegation logging to `.ralph-delegation.json`

### Usage

```
/ceo-ralph:execute
/ceo-ralph:execute --executor task
/ceo-ralph:execute --executor codex
```

This will:
1. Detect best available executor (or use override)
2. Load task plan from `tasks.md`
3. Identify next executable tasks (respecting dependencies)
4. Delegate implementation to executor
5. Verify completion against criteria
6. Update task status and delegation log

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

Never write code directly. Delegate all implementation to Codex via MCP or Task sub-agents.

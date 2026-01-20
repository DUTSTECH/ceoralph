---
name: execute
description: Alias for implement - executes tasks via Codex delegation
allowed-tools: mcp__codex__codex, Read, Write, Edit, Bash, Glob, Grep
timeout: 600000
---

# Execute

This is an alias for `/ceo-ralph:implement`.

See [implement.md](implement.md) for full documentation.

## Quick Reference

Executes tasks from `tasks.md` by delegating to GPT Codex via MCP.

### Features
- POC-first workflow for uncertain implementations
- Parallel task execution where marked with `[P]`
- 4-layer verification at `[VERIFY]` checkpoints
- Progress tracking and status updates

### Usage

```
/ceo-ralph:execute
```

This will:
1. Load task plan from `tasks.md`
2. Identify next executable tasks (respecting dependencies)
3. Delegate implementation to Codex
4. Verify completion against criteria
5. Update task status

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

Never write code directly. Delegate all implementation to Codex via MCP.

---
name: implement
description: Alias for execute - implements the current task plan via Codex delegation
allowed-tools: mcp__codex__codex, Read, Write, Edit, Bash, Glob, Grep
timeout: 600000
---

# Implement

This is an alias for `/ceo-ralph:execute`.

See [execute.md](execute.md) for full documentation.

## Quick Reference

Implements tasks from `tasks.md` by delegating to GPT Codex via MCP.

### Features
- POC-first workflow for uncertain implementations
- Parallel task execution where marked with `[P]`
- 4-layer verification at `[VERIFY]` checkpoints
- Progress tracking and status updates

### Usage

```
/ceo-ralph:implement
```

This will:
1. Load task plan from `tasks.md`
2. Identify next executable tasks (respecting dependencies)
3. Delegate implementation to Codex
4. Verify completion against criteria
5. Update task status

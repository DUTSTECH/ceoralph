---
description: Remove CEO Ralph MCP configuration
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Uninstall

Remove CEO Ralph MCP configuration from Claude Code.

## Confirm Removal

**Question**: "Remove Codex MCP configuration from settings.json?"
**Options**:
- "Yes, uninstall"
- "No, cancel"

If cancelled, stop here.

## Remove MCP Configuration

Read `~/.claude/settings.json`, delete `mcpServers.codex` entry, write back.

**CRITICAL**: Preserve all other settings. Only remove the `codex` MCP server.

## Confirm Completion

```
✓ Removed 'codex' from MCP servers

To reinstall: /ceo-ralph:setup
```

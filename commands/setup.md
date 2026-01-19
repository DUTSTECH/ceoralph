---
name: setup
description: Configure Codex MCP server and verify authentication
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
timeout: 60000
---

# Setup

Configure Codex (GPT) for CEO Ralph via Codex CLI MCP.

## Step 1: Check Codex CLI

**On Windows (PowerShell):**
```powershell
Get-Command codex -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source; codex --version 2>&1 | Select-Object -First 1
```

**On macOS/Linux:**
```bash
which codex 2>/dev/null && codex --version 2>&1 | head -1 || echo "CODEX_MISSING"
```

If missing, tell the user:

```
Codex CLI not found.

Install with: npm install -g @openai/codex
Then authenticate: codex login

After installation, re-run /ceo-ralph:setup
```

Stop here if Codex is not installed.

## Step 2: Check Auth Status

```bash
codex login status 2>&1 | head -1 || echo "Run 'codex login' to authenticate"
```

If not authenticated, instruct the user to run:

```
codex login
```

## Step 3: Read Current Settings

Read settings file:
- **Windows**: `%USERPROFILE%\.claude\settings.json`
- **macOS/Linux**: `~/.claude/settings.json`

If the file doesn't exist, treat as `{}`.

## Step 4: Configure MCP Server

Merge this into `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "codex",
      "args": ["-m", "gpt-5.2-codex", "mcp-server"]
    }
  }
}
```

**CRITICAL**:
- Merge with existing settings; do not overwrite.
- Preserve other `mcpServers` entries.

## Step 5: Report Status

Show results:

```
CEO Ralph Setup Status
────────────────────────────────────────────
Codex CLI:     ✓ [version]
Auth:          ✓ [status]
MCP Config:    ✓ [path to settings.json]
────────────────────────────────────────────
```

If any check fails, report the issue and how to fix it.

## Step 6: Final Instructions

```
Setup complete!

Next steps:
1. Restart Claude Code to load MCP server
2. Start a spec: /ceo-ralph:start
```

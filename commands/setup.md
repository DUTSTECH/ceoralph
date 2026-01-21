---
description: Configure Codex MCP server and verify authentication
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Setup

Configure Codex (GPT) for CEO Ralph via Codex CLI MCP.

## Step 1: Check Codex CLI

Run:
```bash
if command -v codex >/dev/null 2>&1; then codex --version 2>&1 | head -1; else echo "CODEX_MISSING"; fi
```

If you're using PowerShell without Bash, run:
`Get-Command codex -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source; codex --version 2>&1 | Select-Object -First 1`

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
==============================
Codex CLI     : ✓ [version]
Auth          : ✓ [status]
MCP Config    : ✓ [path]
==============================
```

If any check fails, report the issue and how to fix it.

## Step 6: Final Instructions

```
Setup complete!

Next steps:
1. Restart Claude Code to load MCP server
2. Start a spec: /ceo-ralph:start
```

## Optional: Remote UI Approvals

If you want approvals accessible from anywhere, configure the Remote UI:

```bash
python remote-ui/remote_ui.py enable
```

This prompts for a password, starts the server, and launches a Cloudflare Quick Tunnel.

To expose it via HTTPS manually (free):

```bash
cloudflared tunnel --url http://127.0.0.1:8123
python remote-ui/remote_ui.py set-public-url https://your-url.trycloudflare.com
```

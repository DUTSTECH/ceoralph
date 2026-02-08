---
description: Configure executor (Codex MCP or Task tool fallback) and verify setup
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Setup

Configure the execution backend for CEO Ralph. Supports Codex MCP (GPT workers) or Claude Task tool fallback.

## Step 1: Choose Executor

Ask the user which executor to use:

- **auto** (recommended): Try Codex MCP first, fall back to Task tool if unavailable
- **codex**: Codex MCP only (requires Codex CLI)
- **task**: Claude Task sub-agents only (no external dependencies)

If user doesn't specify, default to `auto`.

## Step 2: Check Codex CLI (skip if executor=task)

Run:
```bash
if command -v codex >/dev/null 2>&1; then command -v codex; codex --version 2>&1 | head -1; else echo "CODEX_MISSING"; fi
```

If you're using PowerShell without Bash, run:
`Get-Command codex -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source; codex --version 2>&1 | Select-Object -First 1`

If missing and executor=codex:
```
Codex CLI not found.

Install with: npm install -g @openai/codex
Then authenticate: codex login

After installation, re-run /ceo-ralph:setup
```

If missing and executor=auto:
```
Codex CLI not found. Using Task tool fallback (Claude sub-agents).
To add Codex support later: npm install -g @openai/codex && /ceo-ralph:setup
```
Skip to Step 6 with executor=task.

## Step 3: Auto-detect MCP Subcommand

Codex CLI versions use different subcommands. Detect which one works:

```bash
# Try 'mcp' first (newer versions)
codex mcp --help 2>&1 | head -3
```

```bash
# Try 'mcp-server' as fallback (older versions)
codex mcp-server --help 2>&1 | head -3
```

Set `DETECTED_SUBCOMMAND` to whichever succeeds (`mcp` or `mcp-server`).

If neither works, warn:
```
Could not detect MCP subcommand. Codex CLI may be too old.
Falling back to Task tool executor.
```

## Step 4: Auto-detect Model

```bash
codex --help 2>&1
```

Look for `--model` flag documentation or available model names. Common options:
- `o3-mini` (default, fast)
- `o4-mini` (newer)
- `codex-mini` (legacy)

Ask the user which model to use, or default to letting Codex use its own default (omit `--model` flag).

## Step 5: Check Auth Status (skip if executor=task)

```bash
codex login status 2>&1 | head -1 || echo "Run 'codex login' to authenticate"
```

If not authenticated, instruct the user to run:
```
codex login
```

## Step 6: Read Current Settings

Resolve the user profile path first (do not guess usernames):

- **Windows (PowerShell)**: `$env:USERPROFILE`
- **Windows (cmd.exe)**: `%USERPROFILE%`
- **Windows (Git Bash)**: `powershell -NoProfile -Command "$env:USERPROFILE"` or `cmd.exe /c echo %USERPROFILE%`

If you're running inside Bash, use:
```bash
echo "$USERPROFILE"
```

If you need to call PowerShell from Bash, escape the `$`:
```bash
powershell -NoProfile -Command "\$env:USERPROFILE"
```

Then read the settings file:
- **Windows**: `<USERPROFILE>\.claude\settings.json`
- **macOS/Linux**: `~/.claude/settings.json`

If the file doesn't exist, treat as `{}`.

## Step 7: Configure MCP Server (skip if executor=task)

Merge this into `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "<CODEX_PATH>",
      "args": ["<DETECTED_SUBCOMMAND>"]
    }
  }
}
```

If a model was selected, add `"--model", "<MODEL>"` to the args array.

**CRITICAL**:
- Merge with existing settings; do not overwrite.
- Preserve other `mcpServers` entries.
- Use the absolute Codex CLI path from Step 2 for `<CODEX_PATH>`.
- **Windows**: escape backslashes in JSON (e.g., `C:\\Users\\user\\.local\\bin\\codex.exe`).

## Step 8: Verify MCP Server (skip if executor=task)

Test the MCP server actually works:

```bash
# Start codex MCP briefly and check for JSON-RPC handshake
timeout 10 <CODEX_PATH> <DETECTED_SUBCOMMAND> 2>&1 &
MCP_PID=$!
sleep 3
if kill -0 $MCP_PID 2>/dev/null; then
  echo "MCP_PROCESS_RUNNING"
  kill $MCP_PID 2>/dev/null
else
  echo "MCP_PROCESS_FAILED"
fi
```

If the process starts successfully → MCP verified.
If it fails:
```
WARNING: Codex MCP server failed to start.
Error output: <stderr>

Options:
1. Fix the issue and re-run /ceo-ralph:setup
2. Use Task tool fallback: /ceo-ralph:setup --executor task
```

## Step 9: Save Executor Config

Write executor preference to the project:

Create/update `./specs/.ralph-executor.json`:
```json
{
  "executor": "auto|codex|task",
  "codexAvailable": true|false,
  "codexPath": "<path or null>",
  "codexSubcommand": "mcp|mcp-server|null",
  "codexModel": "<model or null>",
  "verifiedAt": "<ISO timestamp>"
}
```

## Step 10: Report Status

Show results:

```
CEO Ralph Setup Status
==============================
Executor      : <auto|codex|task>
Codex CLI     : ✓ [version] / ✗ not found
Auth          : ✓ [status] / ✗ / skipped
MCP Config    : ✓ [path] / skipped
MCP Verify    : ✓ running / ✗ failed / skipped
Executor Config: ✓ .ralph-executor.json
==============================
```

If any check fails, report the issue and how to fix it.

## Step 11: Final Instructions

```
Setup complete!

Executor: <executor> (<details>)

Next steps:
1. Restart Claude Code to load MCP server (if Codex configured)
2. Start a spec: /ceo-ralph:start
```

## Optional: Remote UI Approvals

If you want approvals accessible from anywhere, run:

```
/ceo-ralph:enableremote
```

This will guide you through Cloudflare installation (if needed) and start the Remote UI.

## Optional: Dashboard

To set up the real-time web dashboard, run:

```
/ceo-ralph:dashboard start
```

This will install dependencies and start the dashboard at http://localhost:3200.

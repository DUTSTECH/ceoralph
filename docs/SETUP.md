# CEO Ralph Setup Guide

## Prerequisites

### Required

1. **Claude Code CLI** - The Claude Code desktop application or CLI
2. **Codex CLI** - Install and authenticate with `codex login`
3. **Git** - For version control integration

### Recommended

- **npm** or **pnpm** - Package manager
- **TypeScript** - For development

## Installation Steps

### Step 1: Clone the Repository (Optional - for development)

```bash
git clone https://github.com/DUTSTECH/ceoralph.git
cd ceoralph
```

### Step 2: Install the Plugin

In Claude Code:

```bash
# Add the marketplace
/plugin marketplace add DUTSTECH/ceoralph

# Install the plugin
/plugin install ceo-ralph@dutstech-ceoralph
```

**Disclaimer**: Do not install CEO Ralph alongside `smart-ralph` or `claude-delegator`. Running multiple orchestration plugins can register overlapping hooks and produce confusing output or errors.

### Step 3: Install & Authenticate Codex CLI

```bash
npm install -g @openai/codex
codex login
```

### Step 4: Run Setup in Claude Code

```bash
/ceo-ralph:setup
```

This configures Codex MCP in `~/.claude/settings.json`.

### Step 5: (Optional) Enable Remote UI Approvals

If you want approvals accessible from anywhere, run:

```bash
/ceo-ralph:enableremote
```

This guides Cloudflare setup if needed and starts the Remote UI.

See `docs/REMOTE_UI.md` for details.

### Step 6: Restart Claude Code

Restart Claude Code to load the MCP server and plugin.

### Step 7: Verify Installation

```bash
# Check if the plugin is installed
/ceo-ralph:help

# Check if MCP server is connected
# (The execute command will fail gracefully if not connected)
```

## Post-Install Checklist (Required)

1. Install Codex CLI: `npm install -g @openai/codex`
2. Authenticate: `codex login`
3. Run `/ceo-ralph:setup`
4. Restart Claude Code
5. Run `/ceo-ralph:help` to confirm the plugin loads
6. Run `/ceo-ralph:execute` once to confirm MCP connectivity

## Configuration Options

### Plugin Configuration

In `.claude-plugin/plugin.json`:

```json
{
  "configuration": {
    "maxRetries": {
      "type": "number",
      "default": 3,
      "description": "Maximum retries per task before escalation"
    },
    "maxGlobalIterations": {
      "type": "number",
      "default": 100,
      "description": "Maximum total iterations before stopping"
    },
    "parallelLimit": {
      "type": "number",
      "default": 3,
      "description": "Maximum parallel Codex workers"
    },
    "codexModel": {
      "type": "string",
      "default": "gpt-5.2-codex",
      "description": "Codex model used by Codex CLI MCP"
    }
  }
}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CEO_RALPH_MAX_RETRIES` | 3 | Max retries per task |
| `CEO_RALPH_MAX_ITERATIONS` | 100 | Max global loop iterations |
| `CEO_RALPH_PARALLEL_LIMIT` | 3 | Max parallel workers |
| `CEO_RALPH_MAX_TOKENS` | 4096 | Max tokens per Codex call |

## Directory Structure After Setup

```
your-project/
├── .claude/
│   └── settings.json         # MCP configuration
├── specs/                     # Created when you start specs
│   ├── .current-spec         # Active spec name
│   └── my-feature/
│       ├── .ralph-state.json
│       ├── .progress.md
│       ├── research.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── ...
```

## Troubleshooting Setup

### MCP Server Won't Start

1. Check Codex CLI version: `codex --version`
2. Verify Codex is authenticated: `codex login status`
3. Check `~/.claude/settings.json` has `mcpServers.codex`

### Codex Auth Errors

1. Run `codex login`
2. Verify `codex login status` shows authenticated
3. Restart Claude Code after login

### Plugin Not Found

1. Check plugin path in install command
2. Verify `plugin.json` exists and is valid JSON
3. Restart Claude Code

### Commands Not Working

1. Run `/ceo-ralph:help` to verify plugin loaded
2. Check Claude Code logs for errors
3. Reinstall plugin

## Updating

### Update Plugin

```bash
cd ceo-ralph
git pull origin main
```

Then restart Claude Code.

### Update Configuration

After updating, check for new configuration options in:
- `plugin.json` - New plugin settings
- `settings.json` - New MCP options
- Environment variables - New options

## Uninstalling

```bash
# Remove plugin
/plugin uninstall ceo-ralph

# Remove MCP server from settings.json
# (manually edit the file)

# Optionally remove spec files
rm -rf ./specs/
```

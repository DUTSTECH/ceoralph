# CEO Ralph Setup Guide

## Prerequisites

### Required

1. **Claude Code CLI** - The Claude Code desktop application or CLI
2. **OpenAI API Key** - With access to GPT-4 or Codex models
3. **Node.js 18+** - For running the MCP server
4. **Git** - For version control integration

### Recommended

- **npm** or **pnpm** - Package manager
- **TypeScript** - For development

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/dutsAI/ceo-ralph.git
cd ceo-ralph
```

### Step 2: Install MCP Server Dependencies

```bash
cd plugins/ceo-ralph/mcp-codex-worker
npm install
```

### Step 3: Build the MCP Server

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 4: Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# Required
export OPENAI_API_KEY="sk-your-api-key-here"

# Optional
export CEO_RALPH_MAX_RETRIES=3
export CEO_RALPH_MAX_ITERATIONS=100
export CEO_RALPH_PARALLEL_LIMIT=3
export CEO_RALPH_CODEX_MODEL=gpt-4
```

#### OS-Specific Setup for OPENAI_API_KEY

**Windows (PowerShell)**

```powershell
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-your-api-key-here", "User")
```

Restart Claude Code after setting the variable.

**macOS / Linux (bash/zsh)**

```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

To persist across sessions:

```bash
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.bashrc
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.zshrc
```

Restart Claude Code after setting the variable.

### Optional: One-Click Setup Script (Windows)

If you want to automate build + MCP config, use the PowerShell script:

```powershell
cd /path/to/ceo-ralph
\setup.ps1 -OpenAIKey "sk-your-api-key-here"
```

Or, if you already set `OPENAI_API_KEY`, you can run:

```powershell
\setup.ps1
```

This script:

1. Installs dependencies
2. Builds the MCP server
3. Writes/updates `.claude/mcp.json`
4. Prints the local `/plugin install ...` command for Claude Code

### Step 5: Configure MCP in Claude Code

Add the MCP server to your Claude Code configuration.

**Location**: `~/.claude/mcp.json` (or your Claude Code config directory)

```json
{
  "mcpServers": {
    "codex-worker": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/ceo-ralph/plugins/ceo-ralph/mcp-codex-worker/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

Replace `/path/to/ceo-ralph` with the actual path where you cloned the repository.

### Step 6: Install the Plugin

In Claude Code:

```bash
# Add the marketplace (if publishing)
/plugin marketplace add dutsAI/ceo-ralph

# Install the plugin
/plugin install ceo-ralph

# Or install from local path
/plugin install /path/to/ceo-ralph/plugins/ceo-ralph
```

If you used the setup script, copy the exact `/plugin install ...` command it prints and run it once in Claude Code.

### Step 7: Restart Claude Code

Restart Claude Code to load the new MCP server and plugin.

### Step 8: Verify Installation

```bash
# Check if the plugin is installed
/ceo-ralph:help

# Check if MCP server is connected
# (The execute command will fail gracefully if not connected)
```

## Post-Install Checklist (Required)

1. Build MCP server (if not already built):
  - `cd plugins/ceo-ralph/mcp-codex-worker && npm install && npm run build`
2. Set `OPENAI_API_KEY` in your environment
3. Add the MCP server entry to `.claude/mcp.json`
4. Restart Claude Code
5. Run `/ceo-ralph:help` to confirm the plugin loads
6. Run `/ceo-ralph:execute` once to confirm MCP connectivity

## Configuration Options

### Plugin Configuration

In `plugins/ceo-ralph/.claude-plugin/plugin.json`:

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
      "default": "gpt-4",
      "description": "OpenAI model for Codex workers"
    }
  }
}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | (required) | Your OpenAI API key |
| `CEO_RALPH_MAX_RETRIES` | 3 | Max retries per task |
| `CEO_RALPH_MAX_ITERATIONS` | 100 | Max global loop iterations |
| `CEO_RALPH_PARALLEL_LIMIT` | 3 | Max parallel workers |
| `CEO_RALPH_CODEX_MODEL` | gpt-4 | Model for Codex workers |
| `CEO_RALPH_MAX_TOKENS` | 4096 | Max tokens per Codex call |

## Directory Structure After Setup

```
your-project/
├── .claude/
│   └── mcp.json              # MCP configuration
├── specs/                     # Created when you start specs
│   ├── .current-spec         # Active spec name
│   └── my-feature/
│       ├── .ceo-ralph-state.json
│       ├── .progress.md
│       ├── research.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── ...
```

## Troubleshooting Setup

### MCP Server Won't Start

1. Check Node.js version: `node --version` (must be 18+)
2. Verify build completed: Check `mcp-codex-worker/dist/index.js` exists
3. Check path in mcp.json is absolute and correct

### OpenAI API Errors

1. Verify API key is set: `echo $OPENAI_API_KEY`
2. Check API key has GPT-4 access
3. Verify billing is enabled on OpenAI account

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
cd mcp-codex-worker
npm install
npm run build
```

Then restart Claude Code.

### Update Configuration

After updating, check for new configuration options in:
- `plugin.json` - New plugin settings
- `mcp.json` - New MCP options
- Environment variables - New options

## Uninstalling

```bash
# Remove plugin
/plugin uninstall ceo-ralph

# Remove MCP server from mcp.json
# (manually edit the file)

# Optionally remove spec files
rm -rf ./specs/
```

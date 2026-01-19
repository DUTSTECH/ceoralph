# /ceo-ralph:help

Show help and available commands.

## Usage

```
/ceo-ralph:help
/ceo-ralph:help [command]
```

## Arguments

- `command` (optional): Get detailed help for a specific command

## Output (General Help)

```markdown
## 🤖 CEO Ralph Help

**CEO Ralph** - Claude Opus as CEO with Codex Workers

Claude (Opus 4.5) acts as the CEO, handling research, planning, and review.
GPT Codex workers handle code implementation under Claude's supervision.

### Workflow

```
/ceo-ralph:start → Research → Requirements → Design → Tasks → Execute
                      ↓            ↓           ↓        ↓        ↓
                  research.md  requirements.md design.md tasks.md code!
```

### Commands

| Command | Description |
|---------|-------------|
| `/ceo-ralph:start [name] [goal]` | Start new spec or resume existing |
| `/ceo-ralph:research` | Run research phase |
| `/ceo-ralph:requirements` | Generate requirements |
| `/ceo-ralph:design` | Create technical design |
| `/ceo-ralph:tasks` | Break into executable tasks |
| `/ceo-ralph:execute` | Start execution with Codex workers |
| `/ceo-ralph:status` | Show current progress |
| `/ceo-ralph:pause` | Pause execution |
| `/ceo-ralph:resume` | Resume paused execution |
| `/ceo-ralph:cancel` | Cancel and cleanup |

### Quick Mode

Skip approval gates:
```
/ceo-ralph:start "my feature" --quick
```

### Key Concepts

**Spec**: A feature specification containing research, requirements, design, and tasks.

**Approval Gates**: Each phase requires user approval before proceeding (unless `--quick`).

**Codex Workers**: GPT models that implement code under Claude's supervision.

**4-Layer Verification**: Every task is verified for contradictions, commits, checkmarks, and signals.

**POC-First**: Implementation follows "make it work, then make it right" methodology.

### Configuration

Environment variables:
- `OPENAI_API_KEY` - Required for Codex workers
- `CEO_RALPH_MAX_RETRIES` - Max retries per task (default: 3)
- `CEO_RALPH_CODEX_MODEL` - Codex model (default: gpt-4)

### Post-Install Checklist

1. Build MCP server: `cd mcp-codex-worker && npm install && npm run build`
2. Set `OPENAI_API_KEY`
3. Add MCP entry in `.claude/mcp.json`
4. Restart Claude Code
5. Run `/ceo-ralph:execute` once to confirm MCP connectivity

See [docs/SETUP.md](docs/SETUP.md) for the full setup guide.

### More Help

```
/ceo-ralph:help [command]  # Detailed help for a command
```
```

## Output (Command-Specific Help)

```markdown
## /ceo-ralph:{command}

{Full content of the command's markdown file}
```

## Error Handling

| Error | Action |
|-------|--------|
| Unknown command | List available commands |

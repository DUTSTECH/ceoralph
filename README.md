# CEO Ralph

> Claude Opus 4.5 as CEO with GPT Codex Workers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CEO Ralph is a Claude Code plugin that combines **spec-driven development** with **multi-model delegation**. Claude Opus 4.5 acts as the "CEO" - researching, planning, and reviewing - while GPT Codex agents serve as "workers" executing the actual code implementation.

Based on the [Smart Ralph](https://github.com/tzachbon/smart-ralph) workflow with Codex delegation.

## Core Principle

> **"YOU ARE A COORDINATOR, NOT AN IMPLEMENTER."**

Claude plans, reviews, and decides. Codex writes code and makes changes.

## Key Features

- **Spec-Driven Development**: Structured phases from research to implementation
- **User Approval Gates**: Review and approve each phase before proceeding
- **Multi-Model Delegation**: Claude plans, Codex executes
- **Autonomous Execution Loop**: Continues until all tasks complete or escalation needed
- **4-Layer Verification**: Every task verified before marking complete
- **Quick Mode**: Skip approvals for trusted workflows
- **Multi-Spec Support**: Work on multiple features with `/switch`

## Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Research   │────▶│Requirements │────▶│   Design    │────▶│   Tasks     │────▶│  Execute    │
│             │     │             │     │             │     │             │     │             │
│ Claude      │     │ Claude      │     │ Claude      │     │ Claude      │     │ Claude+Codex│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      ↓                   ↓                   ↓                   ↓                   ↓
  research.md      requirements.md      design.md          tasks.md            code!
      ↓                   ↓                   ↓                   ↓
  [Approval]         [Approval]          [Approval]         [Approval]
```

## Quick Start

### Prerequisites

- Claude Code CLI installed and authenticated
- Codex CLI installed and authenticated (`codex login`)

### Installation

```bash
# Clone the repository
git clone https://github.com/dutsAI/ceo-ralph.git
cd ceo-ralph

# Install the plugin
/plugin marketplace add dutsAI/ceo-ralph
/plugin install ceo-ralph

# Configure MCP (one-time)
/ceo-ralph:setup
```

### Usage

```bash
# Start a new feature
/ceo-ralph:start user-auth "Add user authentication with JWT"

# Or create new explicitly
/ceo-ralph:new user-auth "Add user authentication with JWT"

# Run through phases (each requires approval)
/ceo-ralph:research
/ceo-ralph:requirements
/ceo-ralph:design
/ceo-ralph:tasks

# Start execution with Codex workers
/ceo-ralph:implement

# Check progress anytime
/ceo-ralph:status
```

### Quick Mode

Skip approval gates for trusted workflows:

```bash
/ceo-ralph:start "Add dark mode toggle" --quick
```

### Multi-Spec Support

```bash
# List all specs
/ceo-ralph:switch

# Switch to a different spec
/ceo-ralph:switch dark-mode

# Update specs after implementation
/ceo-ralph:refactor
```

## Commands

| Command | Description |
|---------|-------------|
| `/ceo-ralph:start` | Smart entry - resume or create new |
| `/ceo-ralph:new` | Create new spec, start research |
| `/ceo-ralph:research` | Run research phase |
| `/ceo-ralph:requirements` | Generate requirements |
| `/ceo-ralph:design` | Create technical design |
| `/ceo-ralph:tasks` | Break into executable tasks |
| `/ceo-ralph:implement` | Execute tasks via Codex |
| `/ceo-ralph:status` | Show current progress |
| `/ceo-ralph:switch` | Change active spec |
| `/ceo-ralph:refactor` | Update specs after implementation |
| `/ceo-ralph:pause` | Pause execution |
| `/ceo-ralph:resume` | Resume paused execution |
| `/ceo-ralph:cancel` | Cancel and cleanup |
| `/ceo-ralph:setup` | Configure Codex MCP |
| `/ceo-ralph:feedback` | Submit feedback |
| `/ceo-ralph:help` | Show help |

## Task Markers

| Marker | Meaning |
|--------|---------|
| `[P]` | Parallel execution |
| `[VERIFY]` | Quality checkpoint |
| `[POC]` | Proof of concept first |
| `[CRITICAL]` | Critical path (5 retries) |
| `[OPTIONAL]` | Optional (2 retries) |

## Project Structure

```
ceo-ralph/
├── .claude-plugin/       # Plugin configuration
├── agents/               # AI agent definitions
├── commands/             # Slash commands
├── skills/               # Skill definitions
├── templates/            # Spec templates
├── schemas/              # JSON schemas
├── examples/             # Example specs
└── docs/                 # Documentation
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [Setup Guide](docs/SETUP.md) - Detailed installation instructions
- [Workflow Guide](docs/WORKFLOW.md) - How to use CEO Ralph
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## Configuration

### Environment Variables

```bash
CEO_RALPH_MAX_RETRIES=3         # Max retries per task (default: 3)
CEO_RALPH_MAX_ITERATIONS=100    # Max global iterations (default: 100)
CEO_RALPH_PARALLEL_LIMIT=3      # Max parallel workers (default: 3)
```

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

Use `/ceo-ralph:feedback` to submit issues or feature requests.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

Inspired by:
- [Smart Ralph](https://github.com/tzachbon/smart-ralph) - Spec-driven development
- [Claude Delegator](https://github.com/jarrodwatts/claude-delegator) - Multi-model delegation
- [Ralph Wiggum Loop](https://ghuntley.com/ralph/) - Autonomous execution pattern

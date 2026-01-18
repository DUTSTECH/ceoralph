# CEO Ralph

> Claude Opus 4.5 as CEO with GPT Codex Workers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CEO Ralph is a Claude Code plugin that combines **spec-driven development** with **multi-model delegation**. Claude Opus 4.5 acts as the "CEO" - researching, planning, and reviewing - while GPT Codex agents serve as "employees" executing the actual code implementation.

## 🎯 Key Features

- **Spec-Driven Development**: Structured phases from research to implementation
- **User Approval Gates**: Review and approve each phase before proceeding
- **Multi-Model Delegation**: Claude plans, Codex executes
- **Autonomous Execution Loop**: Continues until all tasks complete or escalation needed
- **4-Layer Verification**: Every task verified before marking complete
- **Subscription Balancing**: ~30% Claude (planning/review), ~70% Codex (implementation)

## 📋 Workflow

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

## 🚀 Quick Start

### Prerequisites

- Claude Code CLI installed and authenticated
- OpenAI API key with GPT-4 access
- Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/dutsAI/ceo-ralph.git
cd ceo-ralph

# Install MCP server dependencies
cd mcp-codex-worker
npm install
npm run build
cd ..

# Configure MCP in Claude Code
# Add to your .claude/mcp.json:
{
  "mcpServers": {
    "codex-worker": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp-codex-worker/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}

# Install the plugin
/plugin marketplace add dutsAI/ceo-ralph
/plugin install ceo-ralph
```

### Usage

```bash
# Start a new feature
/ceo-ralph:start user-auth "Add user authentication with JWT"

# Run through phases (each requires approval)
/ceo-ralph:research
/ceo-ralph:requirements
/ceo-ralph:design
/ceo-ralph:tasks

# Start execution with Codex workers
/ceo-ralph:execute

# Check progress anytime
/ceo-ralph:status
```

### Quick Mode

Skip approval gates for trusted workflows:

```bash
/ceo-ralph:start "Add dark mode toggle" --quick
```

## 📁 Project Structure

```
ceo-ralph/
├── plugins/ceo-ralph/
│   ├── agents/           # AI agent definitions
│   ├── commands/         # Slash commands
│   ├── templates/        # Spec templates
│   ├── schemas/          # JSON schemas
│   └── skills/           # Skill definitions
├── mcp-codex-worker/     # MCP server for Codex
├── docs/                 # Documentation
└── examples/             # Example specs
```

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [Setup Guide](docs/SETUP.md) - Detailed installation instructions
- [Workflow Guide](docs/WORKFLOW.md) - How to use CEO Ralph
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🔧 Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...           # For Codex API access

# Optional
CEO_RALPH_MAX_RETRIES=3         # Max retries per task (default: 3)
CEO_RALPH_MAX_ITERATIONS=100    # Max global iterations (default: 100)
CEO_RALPH_PARALLEL_LIMIT=3      # Max parallel workers (default: 3)
CEO_RALPH_CODEX_MODEL=gpt-4     # Codex model (default: gpt-4)
```

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

Inspired by:
- [Smart Ralph](https://github.com/tzachbon/smart-ralph) - Spec-driven development
- [Claude Delegator](https://github.com/jarrodwatts/claude-delegator) - Multi-model delegation
- [Ralph Wiggum Loop](https://ghuntley.com/ralph/) - Autonomous execution pattern

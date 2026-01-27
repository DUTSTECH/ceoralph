<div align="center">

# CEO Ralph
<img width="1536" height="672" alt="generated-image" src="https://github.com/user-attachments/assets/fe6efab5-558a-44a1-8998-f5cd25327926" />
I'm Claude, but you can call me CEO Ralph, now get coding Codex!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Built%20for-Claude%20Code-blueviolet)](https://claude.ai/code)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**Spec-driven development for Claude Code. Task-by-task execution with fresh context per task.**

Codex MCP + Spec-Driven Development = Sensational

[Quick Start](#-quick-start) | [Commands](#-commands) | [How It Works](#-how-it-works) | [Troubleshooting](#-troubleshooting)

</div>

---

## What is this?

CEO Ralph is a Claude Code plugin that turns your vague feature ideas into structured specs, then executes them task-by-task. Like having a tiny product team in your terminal.

```text
You: "Add user authentication"
Ralph: *creates discovery.md, tasks.md*
Ralph: *executes each task with fresh context*
Ralph: "I'm helping!"
```

## Why "Ralph"?

Named after the [Ralph agentic loop pattern](https://ghuntley.com/ralph/) and everyone's favorite Springfield student. Ralph doesn't overthink. Ralph just does the next task. Be like Ralph.

---

## Requirements

Codex MCP is required for task execution. Configure it once:

```bash
/ceo-ralph:setup
```

Codex MCP provides the execution loop. CEO Ralph provides the spec-driven workflow on top.

---

## Installation

### From Marketplace

```bash
# Configure Codex MCP
/ceo-ralph:setup

# Add the marketplace
/plugin marketplace add DUTSTECH/ceoralph

# Install the plugin
/plugin install ceo-ralph@dutstech-ceoralph

# Restart Claude Code
```

### From GitHub

```bash
# Configure Codex MCP
/ceo-ralph:setup

/plugin install https://github.com/DUTSTECH/ceoralph
```

### Local Development

```bash
# Configure Codex MCP
/ceo-ralph:setup

git clone https://github.com/DUTSTECH/ceoralph.git
cd ceoralph
claude --plugin-dir $(pwd)
```

---

## Quick Start

```bash
# The smart way (auto-detects resume or new)
/ceo-ralph:start user-auth Add JWT authentication

# Quick mode (skip spec phases, auto-generate everything)
/ceo-ralph:start "Add user auth" --quick

# The step-by-step way
/ceo-ralph:new user-auth Add JWT authentication
/ceo-ralph:discovery
/ceo-ralph:plan
/ceo-ralph:implement
```

---

## Commands

| Command | What it does |
|---------|--------------|
| `/ceo-ralph:start [name] [goal]` | Smart entry: resume existing or create new |
| `/ceo-ralph:start [goal] --quick` | Quick mode: auto-generate all specs and execute |
| `/ceo-ralph:new <name> [goal]` | Create new spec, start discovery |
| `/ceo-ralph:discovery` | Run merged discovery (research + requirements) |
| `/ceo-ralph:plan` | Generate design summary + tasks |
| `/ceo-ralph:implement` | Execute tasks one-by-one |
| `/ceo-ralph:status` | Show all specs and progress |
| `/ceo-ralph:switch <name>` | Change active spec |
| `/ceo-ralph:cancel` | Cancel loop, cleanup state |
| `/ceo-ralph:help` | Show help |

---

## How It Works

```text
        "I want a feature!"
               |
               v
    +---------------------+
    |     Discovery       |  <- Research + requirements
    +---------------------+
               |
               v
    +---------------------+
    |       Plan          |  <- Design summary + tasks
    +---------------------+
               |
               v
    +---------------------+
    |     Execution       |  <- Task-by-task with fresh context
    +---------------------+
               |
               v
          "I did it!"
```

### The Agents

Each phase uses a specialized sub-agent:

| Phase | Agent | Superpower |
|-------|-------|------------|
| Discovery | `research-analyst` + `product-manager` | Research + requirements synthesis |
| Plan | `architect-reviewer` + `task-planner` | Design summary + task breakdown |
| Execution | `spec-executor` | Autonomous implementation, quality gates |

### Task Execution Workflow

Tasks follow a 4-phase structure:

1. **Make It Work** - POC validation, skip tests initially
2. **Refactoring** - Clean up the code
3. **Testing** - Unit, integration, e2e tests
4. **Quality Gates** - Lint, types, CI checks

### Lightweight Governance

CEO Ralph uses a simple Principles + References model:
- Define non-negotiable Principles (P-1, P-2...) in `discovery.md`
- Every task references relevant Principles alongside FR/AC and design

---

## Project Structure

```text
ceoralph/
├── .claude-plugin/
│   └── marketplace.json
├── agents/             # Sub-agent definitions
├── commands/           # Slash commands
├── hooks/              # Stop watcher
├── templates/          # Spec templates
└── schemas/            # Validation schemas
```

### Your Specs

Specs live in `./specs/` in your project:

```text
./specs/
├── .current-spec           # Active spec name
└── my-feature/
    ├── .ralph-state.json   # Loop state (deleted on completion)
    ├── .progress.md        # Progress tracking
    ├── discovery.md
    └── tasks.md
```

---

## Notes

CEO Ralph follows the specum workflow while delegating all task execution to Codex MCP.

## Troubleshooting

**"Codex MCP not configured"?**
Run `/ceo-ralph:setup` and restart Claude Code.

**Task keeps failing?**
After max iterations, the loop stops. Check `.progress.md` for errors. Fix manually, then `/ceo-ralph:implement` to resume.

**Want to start over?**
`/ceo-ralph:cancel` cleans up state. Then start fresh.

**Resume existing spec?**
Just `/ceo-ralph:start` - it auto-detects and continues where you left off.

**More issues?** See the full [Troubleshooting Guide](docs/TROUBLESHOOTING.md).

---

## Contributing

PRs welcome! This project is friendly to first-time contributors.

1. Fork it
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes
4. Push to the branch
5. Open a PR

---

## Credits

- [Ralph agentic loop pattern](https://ghuntley.com/ralph/) by Geoffrey Huntley
- [Smart Ralph](https://github.com/tzachbon/smart-ralph)
- [Claude Delegator](https://github.com/tylerprogramming/claude-delegator)
- Built for [Claude Code](https://claude.ai/code)
- Inspired by every developer who wished their AI could just figure out the whole feature

---

<div align="center">

**Made with confusion and determination**

*"The doctor said I wouldn't have so many nosebleeds if I kept my finger outta there."*

MIT License

</div>

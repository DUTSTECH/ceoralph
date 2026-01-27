---
description: Show help and available commands
argument-hint: [command]
allowed-tools: [Read]
---

# /ceo-ralph:help

Show help for CEO Ralph commands and workflow.

## Overview

CEO Ralph is a spec-driven development plugin that guides you through discovery and planning phases, then executes tasks autonomously with Codex MCP.

## Commands

| Command | Description |
|---------|-------------|
| `/ceo-ralph:start [name] [goal]` | Smart entry point: resume or create new |
| `/ceo-ralph:start [goal] --quick` | Quick mode: auto-generate all specs and execute |
| `/ceo-ralph:new <name> [goal]` | Create new spec and start discovery |
| `/ceo-ralph:discovery` | Run merged discovery (research + requirements) |
| `/ceo-ralph:plan` | Run merged plan (design summary + tasks) |
| `/ceo-ralph:implement` | Start execution loop (approves tasks) |
| `/ceo-ralph:status` | Show all specs and progress |
| `/ceo-ralph:switch <name>` | Change active spec |
| `/ceo-ralph:cancel` | Cancel active loop, cleanup state |
| `/ceo-ralph:remote-ui` | Configure Remote UI approvals |
| `/ceo-ralph:enableremote` | One-shot Remote UI + HTTPS tunnel |
| `/ceo-ralph:feedback [message]` | Submit feedback or report an issue |
| `/ceo-ralph:help` | Show this help |

## Workflow

```
/ceo-ralph:new "my-feature"
    |
    v
/ceo-ralph:discovery
    |
    v (review discovery.md)
/ceo-ralph:plan
    |
    v (review tasks.md)
/ceo-ralph:implement
    |
    v
[Task-by-task execution with Codex MCP]
    |
    v
Done!
```

## Quick Start

```bash
# Easiest: use start (auto-detects resume or new)
/ceo-ralph:start user-auth Add JWT authentication

# Or resume an existing spec
/ceo-ralph:start

# Manual workflow with individual commands:
/ceo-ralph:new user-auth Add JWT authentication
/ceo-ralph:discovery
/ceo-ralph:plan
/ceo-ralph:implement
```

## Options

### start command
```
/ceo-ralph:start [name] [goal] [--fresh] [--quick] [--lite] [--commit-spec] [--no-commit-spec]
```
- `--fresh`: Force new spec, overwrite if exists (skips "resume or fresh?" prompt)
- `--quick`: Skip interactive phases, auto-generate all specs, start execution immediately
- `--lite`: Use lite planning (short plan + tasks only)
- `--commit-spec`: Commit and push spec files after each phase (default: true in normal mode, false in quick mode)
- `--no-commit-spec`: Explicitly disable committing spec files

The `--commit-spec` setting is stored in `.ralph-state.json` and applies to all subsequent phases (discovery, plan, tasks).

### new command
```
/ceo-ralph:new <name> [goal] [--lite]
```
- `--lite`: Skip discovery and jump to a short plan + tasks

### phase commands (discovery, plan)
```
/ceo-ralph:<phase> [spec-name]
```
Phase commands use the `commitSpec` setting from `.ralph-state.json` (set during `/ceo-ralph:start`).

### implement command
```
/ceo-ralph:implement [--max-task-iterations 5]
```
- `--max-task-iterations`: Max retries per task before failure (default: 5)

## Directory Structure

Specs are stored in `./specs/`:
```
./specs/
├── .current-spec           # Active spec name
├── my-feature/
│   ├── .ralph-state.json   # Loop state (deleted on completion)
│   ├── .progress.md        # Progress tracking (persists)
│   ├── discovery.md        # Research + requirements
│   └── tasks.md            # Design summary + implementation tasks
```

## Execution Loop

The implement command runs tasks one at a time with Codex MCP:
1. Execute task from tasks.md
2. Verify completion
3. Commit changes
4. Update progress
5. Continue until all tasks done

## Sub-Agents

Each phase uses a specialized agent:
- **research-analyst**: External research
- **product-manager**: Requirements synthesis for discovery.md
- **architect-reviewer**: Design summary for planning
- **task-planner**: POC-first task breakdown
- **plan-synthesizer**: Quick mode artifact generation

## POC-First Workflow

Tasks follow a 4-phase structure:
1. **Phase 1: Make It Work** - POC validation, skip tests
2. **Phase 2: Refactoring** - Clean up code
3. **Phase 3: Testing** - Unit, integration, e2e tests
4. **Phase 4: Quality Gates** - Lint, types, CI

## Troubleshooting

**Spec not found?**
- Run `/ceo-ralph:status` to see available specs
- Run `/ceo-ralph:switch <name>` to change active spec

**Task failing repeatedly?**
- After 5 attempts, loop blocks with error message
- Fix manually, then run `/ceo-ralph:implement` to resume

**Want to restart?**
- Run `/ceo-ralph:cancel` to cleanup state
- Progress file is preserved with completed tasks

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⛔ CRITICAL SAFETY RULES

1. **NEVER merge PRs without explicit user permission** — If unsure whether to merge, the answer is NO
2. **NEVER close PRs without explicit user permission** — Only fix conflicts, push changes, create PRs
3. **NEVER delete branches on remote without explicit user permission**
4. **Ask before any destructive action** — When in doubt, ask the user

## Overview

CEO Ralph is a Claude Code plugin for spec-driven development. It transforms feature requests into structured specs (research, requirements, design, tasks) then executes them task-by-task with fresh context per task.

Supports **dual-executor architecture**: Codex MCP (GPT workers) with automatic fallback to Claude Task sub-agents.

## Development

```bash
# Test plugin locally
claude --plugin-dir ./ceoralph

# Test the workflow
/ceo-ralph:start test-feature Some test goal
```

> **Version bumps**: Once per branch (not per commit). Update version in BOTH files:
> - `.claude-plugin/plugin.json`
> - `.claude-plugin/marketplace.json`

No build step required. Changes take effect on Claude Code restart.

## Architecture

### Plugin Structure

```
├── .claude-plugin/plugin.json   # Plugin manifest
├── agents/                      # Sub-agent definitions (markdown)
├── commands/                    # Slash command definitions (markdown)
├── hooks/                       # Stop watcher + hook dispatch
├── templates/                   # Spec file templates
├── schemas/                     # JSON schemas (spec, state, delegation)
├── skills/                      # Skill definitions
├── dashboard/                   # Web dashboard (Hono + DuckDB + WebSocket)
│   ├── src/                     # Server source (TypeScript)
│   └── ui/                      # Frontend (vanilla JS + TailwindCSS)
└── docs/                        # Documentation
```

### Dual-Executor Architecture

CEO Ralph supports two execution backends:

1. **Codex MCP** (`mcp__codex__codex`) — GPT Codex workers via MCP protocol
   - Requires: Codex CLI installed + authenticated
   - Configured via: `/ceo-ralph:setup`

2. **Task Sub-agents** — Claude Task tool with `subagent_type: "general-purpose"`
   - Requires: nothing (built into Claude Code)
   - Automatic fallback when Codex MCP is unavailable

Executor selection (priority):
1. `--executor` argument on `/ceo-ralph:implement`
2. `./specs/.ralph-executor.json` (saved config from setup)
3. Runtime detection: check if `mcp__codex__codex` tool exists
4. Default: `auto` (try Codex, fall back to Task)

### Execution Flow

1. **Spec Phases**: Each command (`/ceo-ralph:research`, `:requirements`, `:design`, `:tasks`) invokes a specialized agent to generate corresponding markdown in `./specs/<spec-name>/`
2. **Execution**: During `/ceo-ralph:implement`, the coordinator auto-detects the executor and delegates tasks. Uses Codex MCP if available, otherwise Task sub-agents.
3. **Fresh Context**: Each task runs in isolation via the executor. Progress persists in `.progress.md` and task checkmarks in `tasks.md`
4. **Delegation Tracking**: Worker status logged to `.ralph-delegation.json` with timing, executor type, and results
5. **Verification**: [VERIFY] tasks are reviewed by qa-engineer

### State Files

- `./specs/.current-spec` - Active spec name
- `./specs/.ralph-executor.json` - Executor configuration (from setup)
- `./specs/<name>/.ralph-state.json` - Loop state (phase, taskIndex, iterations). Deleted on completion
- `./specs/<name>/.ralph-delegation.json` - Worker delegation log with stats
- `./specs/<name>/.progress.md` - Progress tracking, learnings, context for agents
- `./specs/<name>/codex-log.md` - Task execution summaries and references

### Agents

| Agent | File | Purpose |
|-------|------|---------|
| research-analyst | `agents/research-analyst.md` | Web search, codebase analysis |
| product-manager | `agents/product-manager.md` | User stories, acceptance criteria |
| architect-reviewer | `agents/architect-reviewer.md` | Technical design, architecture |
| task-planner | `agents/task-planner.md` | POC-first task breakdown |
| spec-executor | `agents/spec-executor.md` | Autonomous task implementation (via Codex or Task) |
| ceo-orchestrator | `agents/ceo-orchestrator.md` | Main orchestration brain |

### POC-First Workflow (Mandatory)

All specs follow 4 phases:
1. **Phase 1: Make It Work** - POC validation, skip tests
2. **Phase 2: Refactoring** - Code cleanup
3. **Phase 3: Testing** - Unit, integration, e2e
4. **Phase 4: Quality Gates** - Lint, types, CI, PR

Quality checkpoints inserted every 2-3 tasks throughout all phases.

### Task Completion Protocol

Spec-executor must output `TASK_COMPLETE` for coordinator to advance. Coordinator outputs `ALL_TASKS_COMPLETE` when done. If task fails, retries up to 5 times then blocks with error.

### Output Hygiene

Use plain, line-by-line status output. Avoid spinners, ANSI cursor controls, or rewriting lines to keep terminal output readable.

### Context Compaction

Trigger `/compact` only at safe boundaries (after a phase is approved and logged to `.progress.md`, or right after a task finishes). If a context meter is visible and near full (e.g., >80-90%), prompt `/compact` before starting the next phase or delegating the next task. Never compact mid-task, mid-tool output, or while waiting on approvals.

### Web Dashboard

Real-time web dashboard for monitoring delegation and worker status:

```bash
# Start dashboard
/ceo-ralph:dashboard start

# Opens at http://localhost:3200
# WebSocket for live updates at ws://localhost:3200/ws
```

Features:
- Overview with progress bars and stats
- Worker tree (hierarchical view of CEO → workers)
- Delegation event log
- Spec management
- Real-time updates via WebSocket
- Hook integration for SubagentStart/Stop events

Stack: Hono (server) + DuckDB (storage) + vanilla JS + TailwindCSS (UI)

### Dependencies

- Codex MCP (optional): `/ceo-ralph:setup`
- Dashboard (optional): Node.js + `/ceo-ralph:dashboard start`

## Key Files

- `commands/setup.md` - Executor setup with auto-detection and verification
- `commands/implement.md` - Dual-executor execution loop with delegation logging
- `commands/status.md` - Rich terminal display with worker tree and progress bars
- `commands/dashboard.md` - Web dashboard management
- `commands/cancel.md` - Cleanup state file
- `hooks/hooks.json` - Stop + SubagentStart/Stop hooks
- `hooks/scripts/hook-dispatch.sh` - Hook → dashboard HTTP bridge
- `hooks/scripts/stop-watcher.sh` - Cleanup watcher for stale state/progress
- `agents/spec-executor.md` - Task execution rules, commit discipline
- `agents/task-planner.md` - Task format, quality checkpoint rules, POC workflow
- `schemas/delegation.schema.json` - Delegation state JSON schema
- `templates/*.md` - Spec file templates with structure requirements
- `dashboard/src/index.ts` - Dashboard server entry point

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this plugin.

## What This Is

A Claude Code plugin that provides GPT Codex as worker agents for spec-driven autonomous development. Claude Opus 4.5 acts as CEO orchestrator, delegating implementation tasks to GPT Codex workers. Based on the Smart Ralph (ralph-specum) workflow.

## Core Principle

> **"YOU ARE A COORDINATOR, NOT AN IMPLEMENTER."**

Claude plans, reviews, and decides. Codex writes code and makes changes.

## Development Commands

```bash
# Test plugin locally
claude --plugin-dir /path/to/ceo-ralph

# Run setup to configure MCP
/ceo-ralph:setup

# Start a new spec
/ceo-ralph:start my-feature "Description of what to build"

# Quick mode (auto-approve all phases)
/ceo-ralph:start my-feature "Description" --quick

# Get help
/ceo-ralph:help
```

No build step, no dependencies. Uses Codex CLI's native MCP server.

## Architecture

### Orchestration Flow

Claude acts as CEO—delegates implementation to GPT Codex based on spec-driven workflow phases.

```
User Request → Claude Code → /ceo-ralph:start
                                   ↓
              ┌────────────────────┼────────────────────┐
              ↓                    ↓                    ↓
         Research           Requirements            Design
              ↓                    ↓                    ↓
           Tasks ──────────────→ Execute ──────────→ Complete
              ↓                    ↓
        [Task Planning]    [Codex Delegation]
                                   ↓
                          mcp__codex__codex
```

### Workflow Phases

1. **Research** - Gather context and constraints (research-analyst)
2. **Requirements** - Define acceptance criteria (product-manager)
3. **Design** - Technical architecture (architect-reviewer)
4. **Tasks** - Break into executable units (task-planner)
5. **Execute** - Delegate to Codex workers (spec-executor)

### Task Notation

- `[P]` - Parallel task (can run concurrently)
- `[VERIFY]` - Verification checkpoint
- `[POC]` - Proof of concept first
- `[CRITICAL]` - Critical path blocker
- `[OPTIONAL]` - Optional, skip if fails

## Available Commands

| Command | Description |
|---------|-------------|
| `/ceo-ralph:start` | Smart entry point - resumes or creates new spec |
| `/ceo-ralph:new` | Create new spec, initiate research |
| `/ceo-ralph:research` | Run research phase |
| `/ceo-ralph:requirements` | Generate requirements |
| `/ceo-ralph:design` | Create technical design |
| `/ceo-ralph:tasks` | Break into tasks |
| `/ceo-ralph:implement` | Execute tasks via Codex delegation |
| `/ceo-ralph:status` | Show progress |
| `/ceo-ralph:switch` | Change active spec |
| `/ceo-ralph:refactor` | Update specs after implementation |
| `/ceo-ralph:pause` | Pause execution |
| `/ceo-ralph:resume` | Resume execution |
| `/ceo-ralph:cancel` | Cancel and cleanup |
| `/ceo-ralph:setup` | Configure MCP |
| `/ceo-ralph:feedback` | Submit feedback/issues |
| `/ceo-ralph:help` | Show help |

## Agents

| Agent | Role |
|-------|------|
| research-analyst | External/internal research, feasibility |
| product-manager | User stories, acceptance criteria |
| architect-reviewer | Technical design, patterns |
| task-planner | Task breakdown, POC-first ordering |
| plan-synthesizer | Quick mode artifact synthesis |
| spec-executor | Execution loop orchestration |
| codex-reviewer | Output review, quality checks |
| qa-engineer | Verification checkpoints |
| refactor-specialist | Spec updates post-implementation |
| ceo-orchestrator | Main decision-making brain |

## Skills

| Skill | Purpose |
|-------|---------|
| spec-workflow | Phase structure and transitions |
| codex-delegation | How to delegate to Codex workers |
| delegation-principle | Coordinator vs implementer roles |
| communication-style | Concise, scannable output format |
| review-criteria | 5-dimensional output review |
| verification-rules | 4-layer verification system |

## MCP Integration

Uses Codex CLI's native MCP server:
- Tool: `mcp__codex__codex`
- Auth: `codex login` (OAuth)
- Model: `gpt-5.2-codex`
- Sandbox: `workspace-write` for implementation

## 4-Layer Verification

Before marking any task complete:

1. **Contradiction Detection** - No conflicting phrases
2. **Uncommitted Files Check** - All changes committed
3. **Checkmark Verification** - Task marked [x] in tasks.md
4. **Signal Verification** - TASK_COMPLETE present

## Quick Mode

Use `--quick` flag to skip approval gates:
- Auto-approves each phase
- Runs all phases without stopping
- Still pauses on errors/escalations
- Still uses delegation (never implements directly)

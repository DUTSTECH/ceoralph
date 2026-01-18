# CEO Ralph Architecture

## Overview

CEO Ralph follows a hierarchical architecture where Claude Opus 4.5 acts as the CEO/orchestrator, and GPT Codex instances act as workers executing specific tasks.

```
                    ┌─────────────────────────────────────┐
                    │              USER                    │
                    │         (Feature Request)            │
                    └─────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CEO LAYER (Claude Opus 4.5)                          │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Research   │  │Requirements │  │   Design    │  │   Tasks     │        │
│  │  Analyst    │  │  Manager    │  │  Architect  │  │  Planner    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    EXECUTION COORDINATOR                             │   │
│  │  • Parse tasks          • Review outputs       • Run verification    │   │
│  │  • Prepare context      • Decide retry/pass   • Track progress       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ MCP Protocol
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MCP CODEX WORKER SERVER                               │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │execute_task │  │check_status │  │ get_output  │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ OpenAI API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WORKER LAYER (GPT Codex)                             │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Worker 1   │  │  Worker 2   │  │  Worker 3   │  │  Worker N   │        │
│  │  (Task A)   │  │  (Task B)   │  │  (Task C)   │  │  (Parallel) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. CEO Layer (Claude Opus 4.5)

The CEO layer is responsible for all high-level decision making:

#### Planning Agents

| Agent | Responsibility |
|-------|----------------|
| **research-analyst** | External/internal research, feasibility assessment |
| **requirements-manager** | User stories, acceptance criteria |
| **design-architect** | Technical design, architecture decisions |
| **task-planner** | POC-first task breakdown |

#### Execution Agents

| Agent | Responsibility |
|-------|----------------|
| **execution-coordinator** | Orchestrates the execution loop |
| **codex-reviewer** | Reviews worker outputs for quality |
| **qa-engineer** | Handles [VERIFY] tasks and quality gates |

### 2. MCP Layer

The MCP (Model Context Protocol) server bridges Claude and Codex:

```typescript
// Available tools
execute_task    // Send task to Codex worker
check_status    // Check task execution status
get_output      // Retrieve completed task output
cancel_task     // Cancel running task
```

### 3. Worker Layer (GPT Codex)

Workers receive focused context packages and implement specific tasks:

- Receive task specification + relevant files
- Follow patterns from context
- Output file modifications
- Signal completion or blockers

## Data Flow

### Phase Flow

```
User Goal
    │
    ▼
┌─────────┐    ┌─────────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐
│Research │───▶│Requirements │───▶│  Design  │───▶│  Tasks  │───▶│ Execute │
└─────────┘    └─────────────┘    └──────────┘    └─────────┘    └─────────┘
    │                │                  │              │              │
    ▼                ▼                  ▼              ▼              ▼
research.md    requirements.md     design.md      tasks.md        code!
```

### Execution Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      For Each Task                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Parse Task from tasks.md                                 │
│       │                                                       │
│       ▼                                                       │
│  2. Is [VERIFY] tag?                                         │
│       │                                                       │
│       ├─ YES ──▶ Delegate to qa-engineer                     │
│       │                                                       │
│       └─ NO ───▶ 3. Build Context Package                    │
│                       │                                       │
│                       ▼                                       │
│                  4. Delegate to Codex Worker                 │
│                       │                                       │
│                       ▼                                       │
│                  5. Receive Worker Output                    │
│                       │                                       │
│                       ▼                                       │
│                  6. CEO Review                               │
│                       │                                       │
│       ┌───────────────┼───────────────┐                      │
│       ▼               ▼               ▼                      │
│   APPROVED      NEEDS_REVISION    ESCALATE                   │
│       │               │               │                      │
│       ▼               │               ▼                      │
│  7. Run 4-Layer       │          Pause & Ask                 │
│     Verification      │          User                        │
│       │               │                                      │
│       ▼               │                                      │
│  8. Mark [x]  ◀───────┘                                      │
│     Next Task                                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## State Management

### State File: `.ceo-ralph-state.json`

```json
{
  "specName": "my-feature",
  "basePath": "./specs/my-feature",
  "phase": "execution",
  "awaitingApproval": false,
  "quickMode": false,
  "currentTask": {
    "index": 3,
    "id": "1.3",
    "iteration": 1,
    "maxIterations": 3,
    "status": "reviewing"
  },
  "totalTasks": 14,
  "completedTasks": 2,
  "globalIteration": 5,
  "maxGlobalIterations": 100,
  "usage": {
    "claude": { "totalTokens": 15000 },
    "codex": { "totalTokens": 45000 }
  }
}
```

### State Transitions

```
                    ┌─────────┐
                    │  start  │
                    └────┬────┘
                         │
                         ▼
┌────────┐    ┌──────────────────┐    ┌──────────────┐
│research│───▶│   requirements   │───▶│    design    │
└────────┘    └──────────────────┘    └──────────────┘
                                             │
                                             ▼
                    ┌──────────┐    ┌──────────────┐
                    │completed │◀───│    tasks     │
                    └──────────┘    └──────────────┘
                         ▲                  │
                         │                  ▼
                         │          ┌──────────────┐
                         └──────────│  execution   │
                                    └──────────────┘
```

## Verification System

### 4-Layer Verification

| Layer | Purpose | Auto-Fix |
|-------|---------|----------|
| 1. Contradiction | Catch incomplete outputs | No |
| 2. Uncommitted | Ensure git commits | Yes |
| 3. Checkmark | Verify tasks.md updated | Yes |
| 4. Signal | Confirm TASK_COMPLETE | Partial |

### Quality Gates

For `[VERIFY]` tasks:
- Run discovered quality commands
- All must pass (exit code 0)
- Retry on failure

## Token Distribution

Target distribution for balanced subscription usage:

| Activity | Model | ~Tokens |
|----------|-------|---------|
| Research | Claude | 3000 |
| Requirements | Claude | 2000 |
| Design | Claude | 3000 |
| Task Planning | Claude | 2000 |
| Review (per task) | Claude | 500 |
| Implementation (per task) | Codex | 3000 |

**Example 10-task spec:**
- Claude: ~15,000 tokens (30%)
- Codex: ~30,000 tokens (70%)

## Error Handling

### Retry Strategy

```
Attempt 1: Execute task
    │
    ├─ Success ──▶ Continue
    │
    └─ Failure ──▶ Attempt 2: Execute with feedback
                       │
                       ├─ Success ──▶ Continue
                       │
                       └─ Failure ──▶ Attempt 3: Execute with feedback
                                          │
                                          ├─ Success ──▶ Continue
                                          │
                                          └─ Failure ──▶ ESCALATE
```

### Escalation

When escalation occurs:
1. Pause execution
2. Log context to .progress.md
3. Present options to user
4. Wait for user direction
5. Resume when user responds

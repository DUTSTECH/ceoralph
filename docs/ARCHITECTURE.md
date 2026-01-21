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
│                           CODEX CLI MCP SERVER                               │
│                                                                              │
│  ┌─────────────┐                                                           │
│  │    codex    │                                                           │
│  └─────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Codex CLI (OAuth)
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

The MCP (Model Context Protocol) server bridges Claude and Codex via Codex CLI:

```typescript
// Available tools
codex           // Send prompt to Codex via Codex CLI MCP
```

### 3. Worker Layer (GPT Codex)

Workers receive focused context packages and implement specific tasks:

- Receive task specification + relevant files
- Follow patterns from context
- Output file modifications
- Signal completion or blockers

### 4. Remote UI (Optional)

The Remote UI is an optional approval dashboard served locally and exposed via a free HTTPS tunnel. It allows approvals and input to be provided from any device while the plugin is running.

- Local server: `127.0.0.1:8123`
- Auth: password + 32-byte access key (rotatable)
- Transport: HTTPS via Cloudflare Quick Tunnel
- Storage: `~/.ceo-ralph/remote-ui/requests.json`

### 5. Hooks (Stop Cleanup)

CEO Ralph includes a Stop hook that cleans up `.ralph-state.json` and stale parallel progress files when the session ends.

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

### State File: `.ralph-state.json`

```json
{
  "source": "spec",
  "name": "my-feature",
  "basePath": "./specs/my-feature",
  "phase": "execution",
  "taskIndex": 3,
  "totalTasks": 14,
  "taskIteration": 1,
  "maxTaskIterations": 5,
  "globalIteration": 5,
  "maxGlobalIterations": 100,
  "commitSpec": true,
  "awaitingApproval": false
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

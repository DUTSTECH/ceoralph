# CEO Ralph - Creation Plan

## Plugin Vision: Claude Opus 4.5 as CEO with Codex Workers

A Claude Code plugin that combines the **spec-driven development workflow** of Smart Ralph with the **multi-model delegation** of Claude Delegator. Claude Opus 4.5 acts as the "CEO" - researching, planning, and reviewing - while GPT Codex agents serve as "employees" executing the actual code implementation.

---

## Table of Contents

1. [Research Summary](#1-research-summary)
2. [Feasibility Assessment](#2-feasibility-assessment)
3. [Architecture Overview](#3-architecture-overview)
4. [Core Components](#4-core-components)
5. [Workflow Design](#5-workflow-design)
6. [Technical Implementation Plan](#6-technical-implementation-plan)
7. [File Structure](#7-file-structure)
8. [Step-by-Step Creation Guide](#8-step-by-step-creation-guide)
9. [Risks & Mitigations](#9-risks--mitigations)
10. [Success Criteria](#10-success-criteria)

---

## 1. Research Summary

### 1.1 Smart Ralph Key Features (Source: [tzachbon/smart-ralph](https://github.com/tzachbon/smart-ralph))

| Feature | Description |
|---------|-------------|
| **Spec-Driven Development** | Structured phases: Research → Requirements → Design → Tasks → Execution |
| **User Approval Gates** | Each phase requires explicit user approval before proceeding |
| **Ralph Wiggum Loop** | Autonomous execution that continues until all checks pass |
| **4-Layer Verification** | Contradiction detection, uncommitted files, checkmark verification, signal verification |
| **Specialized Agents** | research-analyst, product-manager, architect-reviewer, task-planner, spec-executor, qa-engineer |
| **POC-First Workflow** | Phase 1: Make it work → Phase 2: Refactor → Phase 3: Test → Phase 4: Quality Gates |
| **Quality Command Discovery** | Auto-discovers lint/test/build commands from package.json, Makefile, CI configs |

### 1.2 Claude Delegator Key Features (Source: [jarrodwatts/claude-delegator](https://github.com/jarrodwatts/claude-delegator))

| Feature | Description |
|---------|-------------|
| **5 Domain Experts** | Architect, Plan Reviewer, Scope Analyst, Code Reviewer, Security Analyst |
| **MCP Integration** | Delegates via Model Context Protocol to GPT 5.2 Codex |
| **Dual Modes** | Advisory (read-only) and Implementation (write access) |
| **Auto-Routing** | Claude automatically selects the right expert |
| **Synthesized Responses** | Claude interprets GPT output, never raw passthrough |

### 1.3 Related Tools Discovered

| Tool | Purpose | Relevance |
|------|---------|-----------|
| **mcp-server-subagent** | Bi-directional parent-child agent communication | Pattern for Codex worker communication |
| **claudecode-codex-subagents** | Parallel Codex execution with merging | Parallel task execution pattern |
| **codex-orchestrator** | Tmux-based parallel Codex agents | Background execution pattern |
| **ralph-loop** | Core loop dependency for Smart Ralph | Required dependency |

---

## 2. Feasibility Assessment

### 2.1 Technical Viability

| Aspect | Assessment | Notes |
|--------|------------|-------|
| **Smart Ralph Integration** | ✅ High | Well-documented plugin structure, MIT licensed |
| **Claude Delegator Integration** | ✅ High | MCP-based, clean separation of concerns |
| **Codex as Worker Agents** | ✅ High | Multiple proven implementations exist |
| **Subscription Balance** | ✅ High | Claude for planning, Codex for execution naturally balances |
| **Loop Until Complete** | ✅ High | Ralph Wiggum loop pattern is battle-tested |

### 2.2 Effort Estimate

| Phase | Estimate | Notes |
|-------|----------|-------|
| Core Plugin Structure | M (2-3 days) | Adapting Smart Ralph structure |
| Codex MCP Integration | M (2-3 days) | Setting up MCP server for Codex |
| CEO Orchestration Logic | L (4-5 days) | The "brain" of the system |
| Worker Agent System | M (3-4 days) | Codex execution with review loop |
| Verification System | S (1-2 days) | Adapting Smart Ralph verification |
| Testing & Refinement | L (4-5 days) | Integration testing |
| **Total** | **XL (16-22 days)** | Full feature implementation |

### 2.3 Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| API rate limits (both platforms) | Medium | Implement backoff, batch operations |
| Codex context limitations | Medium | Chunk tasks appropriately, provide focused context |
| Output quality variance | Medium | CEO review loop with retry mechanism |
| Cost management | Low | Usage tracking, configurable limits |
| Dependency on external plugins | Low | Fork essential components if needed |

### 2.4 Prerequisites

- [ ] Claude Code CLI installed and authenticated
- [ ] OpenAI API key with Codex access
- [ ] Node.js 18+ (for MCP server)
- [ ] Git configured for commits

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER REQUEST                                    │
│                     "I want to build feature X"                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CEO RALPH (Claude Opus 4.5)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Research   │→ │Requirements │→ │   Design    │→ │   Tasks     │         │
│  │  Analyst    │  │  Manager    │  │  Architect  │  │  Planner    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│         ↓                                                   ↓                │
│    [User Approval Gates at each phase]              Task Breakdown          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ (After all approvals)
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXECUTION ORCHESTRATOR (Claude)                         │
│                                                                              │
│   For each task:                                                             │
│   1. Parse task from tasks.md                                               │
│   2. Prepare context package for Codex                                      │
│   3. Delegate to Codex Worker                                               │
│   4. Review Codex output                                                    │
│   5. If issues → Retry with feedback (max 3)                                │
│   6. If passed → Run verification layers                                    │
│   7. If verified → Mark complete, next task                                 │
│   8. Loop until ALL_TASKS_COMPLETE                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CODEX WORKERS (GPT Codex)                             │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Worker 1   │  │  Worker 2   │  │  Worker 3   │  │  Worker N   │        │
│  │  (Task A)   │  │  (Task B)   │  │  (Task C)   │  │  (Parallel) │        │
│  │             │  │             │  │             │  │             │        │
│  │ Specialized │  │ Specialized │  │ Specialized │  │ Specialized │        │
│  │ Context     │  │ Context     │  │ Context     │  │ Context     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CEO REVIEW LOOP (Claude Opus)                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     4-Layer Verification                             │   │
│  │  1. Contradiction Detection  - No "requires manual" + complete       │   │
│  │  2. File Verification        - All changes committed                 │   │
│  │  3. Checkmark Verification   - Task marked [x] in tasks.md          │   │
│  │  4. Quality Gates            - Lint, test, build all pass           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  If ANY layer fails → Increment iteration, provide feedback, retry          │
│  If ALL layers pass → Advance to next task                                  │
│  If max iterations reached → Escalate to user                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                            ALL_TASKS_COMPLETE
                            Feature Delivered ✓
```

---

## 4. Core Components

### 4.1 CEO Module (Claude Opus 4.5)

**Responsibilities:**
- Research and feasibility analysis (web + codebase)
- Requirements gathering and user story creation
- Technical design and architecture decisions
- Task breakdown with POC-first ordering
- Review ALL Codex outputs before acceptance
- Make retry/escalate decisions
- Synthesize final responses to user

**Key Behaviors:**
```
- NEVER accept Codex output blindly
- ALWAYS verify against acceptance criteria
- Retry with specific feedback up to 3 times
- Escalate to user if stuck after max retries
- Maintain high-level context across all tasks
```

### 4.2 Codex Workers (GPT Codex via MCP)

**Responsibilities:**
- Execute specific, well-defined tasks
- Write code based on provided specifications
- Follow design patterns established by CEO
- Report completion status and any blockers

**Key Behaviors:**
```
- Receive focused context (not entire codebase)
- Follow task specification exactly
- Signal TASK_COMPLETE when done
- Report issues/blockers immediately
```

### 4.3 Orchestration Engine

**Responsibilities:**
- Parse tasks from tasks.md
- Prepare context packages for workers
- Manage parallel execution for [P] tasks
- Track state in .ceo-ralph-state.json
- Coordinate between CEO and workers

### 4.4 Verification System

**4 Layers (from Smart Ralph):**
1. **Contradiction Detection** - Output doesn't contain "requires manual" + completion signal
2. **Uncommitted Files** - All spec files and code changes committed
3. **Checkmark Verification** - Task marked `[x]` in tasks.md
4. **Signal Verification** - Explicit `TASK_COMPLETE` in output

**Extended for CEO Ralph:**
5. **CEO Review** - Claude Opus reviews Codex output for quality
6. **Quality Gates** - Run discovered lint/test/build commands

---

## 5. Workflow Design

### 5.1 Complete Workflow

```
Phase 1: RESEARCH (Claude Opus)
├── Web search for best practices
├── Codebase exploration
├── Dependency analysis
├── Feasibility assessment
├── Output: research.md
└── → AWAIT USER APPROVAL

Phase 2: REQUIREMENTS (Claude Opus)
├── User stories
├── Acceptance criteria
├── Edge cases
├── Output: requirements.md
└── → AWAIT USER APPROVAL

Phase 3: DESIGN (Claude Opus)
├── Architecture decisions
├── Component breakdown
├── API contracts
├── Output: design.md
└── → AWAIT USER APPROVAL

Phase 4: TASKS (Claude Opus)
├── POC-first task breakdown
├── Parallel task identification [P]
├── Verification checkpoints [VERIFY]
├── Output: tasks.md
└── → AWAIT USER APPROVAL

Phase 5: EXECUTION (Orchestrated)
├── For each task:
│   ├── CEO prepares context
│   ├── Delegate to Codex Worker
│   ├── Worker executes
│   ├── CEO reviews output
│   │   ├── If PASS → Verify → Next task
│   │   └── If FAIL → Retry with feedback (max 3)
│   └── Run verification layers
├── Continue until ALL_TASKS_COMPLETE
└── Output: Completed feature + .progress.md
```

### 5.2 The CEO-Worker Interaction Loop

```
┌──────────────────────────────────────────────────────────────┐
│                     CEO (Claude Opus)                         │
│                                                               │
│  1. Read next task from tasks.md                             │
│  2. Prepare context package:                                  │
│     - Task description                                        │
│     - Relevant files (from design.md)                        │
│     - Design decisions                                        │
│     - Acceptance criteria                                     │
│  3. Send to Codex Worker                                     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Codex Worker (GPT)                          │
│                                                               │
│  1. Receive context package                                  │
│  2. Execute task:                                            │
│     - Read specified files                                    │
│     - Write/modify code                                       │
│     - Commit changes                                          │
│  3. Return result with TASK_COMPLETE or BLOCKED              │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                 CEO Review (Claude Opus)                      │
│                                                               │
│  1. Examine worker output                                    │
│  2. Check against acceptance criteria                        │
│  3. Decision:                                                │
│     ├── APPROVED → Run verification layers                   │
│     ├── NEEDS_REVISION → Provide feedback, retry             │
│     └── ESCALATE → Ask user for help                         │
└──────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
      APPROVED      NEEDS_REVISION     ESCALATE
           │               │               │
           ▼               ▼               ▼
      Verification    Retry Loop      User Help
      4 Layers        (max 3)         (pause)
           │               │               │
           ▼               │               │
      Mark [x]  ←─────────┘               │
      Next Task                            │
           │                               │
           ▼                               │
      Continue... ←────────────────────────┘
```

### 5.3 Subscription Balancing Strategy

| Operation | Model Used | Rationale |
|-----------|------------|-----------|
| Research | Claude Opus | Requires synthesis, web access |
| Requirements | Claude Opus | User-facing, needs judgment |
| Design | Claude Opus | Architecture decisions |
| Task Planning | Claude Opus | Strategic breakdown |
| Code Writing | GPT Codex | Bulk of tokens, cheaper |
| Code Review | Claude Opus | Quality judgment |
| Verification | Claude Opus | Final approval |

**Estimated Token Distribution:**
- Claude Opus: ~30% (planning, review)
- GPT Codex: ~70% (execution)

---

## 6. Technical Implementation Plan

### 6.1 MCP Server for Codex Integration

```javascript
// mcp-codex-worker/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server({
  name: "codex-worker",
  version: "1.0.0",
});

// Tool: Execute a task with Codex
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "execute_task") {
    const { taskSpec, context, workingDirectory } = request.params.arguments;
    // Call Codex CLI with context
    // Return result
  }
});
```

### 6.2 State Management

```json
// .ceo-ralph-state.json
{
  "specName": "my-feature",
  "phase": "execution",
  "currentTask": {
    "index": 3,
    "id": "1.3",
    "iteration": 1,
    "maxIterations": 3,
    "workerAttempts": []
  },
  "globalIteration": 7,
  "maxGlobalIterations": 100,
  "awaitingApproval": false,
  "codexUsage": {
    "totalTokens": 45000,
    "taskTokens": {}
  },
  "claudeUsage": {
    "totalTokens": 15000,
    "reviewTokens": {}
  }
}
```

### 6.3 Task Format Extension

```markdown
# tasks.md

## Task 1.1: Implement user authentication endpoint

- **Do**: Create POST /api/auth/login endpoint
- **Files**: src/routes/auth.ts, src/services/auth.service.ts
- **Context**: See design.md Section 3.2 (Auth Flow)
- **Acceptance**:
  - [ ] Endpoint accepts email/password
  - [ ] Returns JWT on success
  - [ ] Returns 401 on failure
- **Worker**: codex (implementation task)
- **Verify**: `pnpm test:unit auth`
- **Commit**: `feat(auth): add login endpoint`

## Task 1.2: [VERIFY] Quality checkpoint

- **Do**: Run all quality commands
- **Worker**: ceo (verification task)
- **Verify**: `pnpm lint && pnpm check-types && pnpm test`

## Task 1.3: [P] Implement password hashing

- **Do**: Add bcrypt password hashing
- **Files**: src/utils/crypto.ts
- **Worker**: codex
- **Parallel**: Can run with 1.4
```

---

## 7. File Structure

```
ceo-ralph/
├── .claude-plugin/
│   └── marketplace.json           # Plugin marketplace metadata
│
├── plugins/
│   └── ceo-ralph/
│       ├── .claude-plugin/
│       │   └── plugin.json        # Plugin configuration
│       │
│       ├── agents/                # Sub-agent definitions
│       │   ├── ceo-orchestrator.md    # Main orchestration brain
│       │   ├── research-analyst.md    # Research phase
│       │   ├── requirements-manager.md # Requirements phase
│       │   ├── design-architect.md    # Design phase
│       │   ├── task-planner.md        # Task breakdown
│       │   ├── execution-coordinator.md # Execution loop
│       │   ├── codex-reviewer.md      # Review Codex outputs
│       │   └── qa-engineer.md         # Verification tasks
│       │
│       ├── commands/              # Slash commands
│       │   ├── start.md           # /ceo-ralph:start
│       │   ├── research.md        # /ceo-ralph:research
│       │   ├── requirements.md    # /ceo-ralph:requirements
│       │   ├── design.md          # /ceo-ralph:design
│       │   ├── tasks.md           # /ceo-ralph:tasks
│       │   ├── execute.md         # /ceo-ralph:execute
│       │   ├── status.md          # /ceo-ralph:status
│       │   ├── pause.md           # /ceo-ralph:pause
│       │   ├── resume.md          # /ceo-ralph:resume
│       │   ├── cancel.md          # /ceo-ralph:cancel
│       │   └── help.md            # /ceo-ralph:help
│       │
│       ├── templates/             # Spec templates
│       │   ├── research.md.template
│       │   ├── requirements.md.template
│       │   ├── design.md.template
│       │   ├── tasks.md.template
│       │   └── progress.md.template
│       │
│       ├── schemas/               # Validation schemas
│       │   ├── state.schema.json
│       │   ├── task.schema.json
│       │   └── context-package.schema.json
│       │
│       └── skills/                # Additional skills
│           ├── codex-delegation.md
│           ├── review-criteria.md
│           └── verification-rules.md
│
├── mcp-codex-worker/              # MCP server for Codex
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # MCP server entry
│   │   ├── codex-client.ts       # Codex API wrapper
│   │   ├── context-builder.ts    # Build context packages
│   │   └── tools/
│   │       ├── execute-task.ts   # Task execution tool
│   │       ├── check-status.ts   # Status checking tool
│   │       └── get-output.ts     # Output retrieval tool
│   └── README.md
│
├── examples/                      # Example specs
│   └── sample-feature/
│       ├── research.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── WORKFLOW.md
│   └── TROUBLESHOOTING.md
│
├── package.json                   # Root package for monorepo
├── README.md
├── LICENSE
└── CHANGELOG.md
```

---

## 8. Step-by-Step Creation Guide

### Phase 1: Foundation Setup (Days 1-2)

- [ ] **Step 1.1**: Initialize repository structure
  - Create base directories
  - Initialize package.json files
  - Set up TypeScript configuration

- [ ] **Step 1.2**: Create plugin manifest files
  - `.claude-plugin/marketplace.json`
  - `plugins/ceo-ralph/.claude-plugin/plugin.json`

- [ ] **Step 1.3**: Define state schema
  - Create `.ceo-ralph-state.json` schema
  - Define state transitions
  - Implement state validation

### Phase 2: Planning Agents (Days 3-5)

- [ ] **Step 2.1**: Create research-analyst agent
  - Web search integration
  - Codebase exploration
  - Feasibility assessment output

- [ ] **Step 2.2**: Create requirements-manager agent
  - User story template
  - Acceptance criteria format
  - Edge case discovery

- [ ] **Step 2.3**: Create design-architect agent
  - Architecture decision records
  - Component breakdown
  - API contract definitions

- [ ] **Step 2.4**: Create task-planner agent
  - POC-first ordering logic
  - Parallel task identification
  - Verification checkpoint insertion

### Phase 3: Codex MCP Integration (Days 6-8)

- [ ] **Step 3.1**: Set up MCP server scaffold
  - Initialize `mcp-codex-worker` package
  - Configure MCP SDK
  - Define tool interfaces

- [ ] **Step 3.2**: Implement Codex client wrapper
  - OpenAI API integration
  - Codex CLI wrapper (if using CLI)
  - Token tracking

- [ ] **Step 3.3**: Implement execute-task tool
  - Context package building
  - Task submission
  - Result parsing

- [ ] **Step 3.4**: Add MCP configuration to Claude Code
  - `.claude/mcp.json` configuration
  - Environment variable handling

### Phase 4: CEO Orchestration Engine (Days 9-13)

- [ ] **Step 4.1**: Create execution-coordinator agent
  - Task parsing from tasks.md
  - Worker delegation logic
  - State management

- [ ] **Step 4.2**: Implement codex-reviewer agent
  - Output analysis
  - Acceptance criteria checking
  - Feedback generation for retries

- [ ] **Step 4.3**: Build the CEO-Worker loop
  - Task dispatch
  - Result collection
  - Retry mechanism (max 3)
  - Escalation logic

- [ ] **Step 4.4**: Implement context package builder
  - Relevant file extraction
  - Design decision inclusion
  - Acceptance criteria formatting

### Phase 5: Verification System (Days 14-15)

- [ ] **Step 5.1**: Port Smart Ralph 4-layer verification
  - Contradiction detection
  - Uncommitted files check
  - Checkmark verification
  - Signal verification

- [ ] **Step 5.2**: Add CEO review layer
  - Quality assessment
  - Design compliance check
  - Integration with retry loop

- [ ] **Step 5.3**: Implement quality command discovery
  - Parse package.json scripts
  - Parse Makefile targets
  - Parse CI workflow files

### Phase 6: Commands & User Interface (Days 16-17)

- [ ] **Step 6.1**: Create all slash commands
  - `/ceo-ralph:start`
  - `/ceo-ralph:research`
  - `/ceo-ralph:requirements`
  - `/ceo-ralph:design`
  - `/ceo-ralph:tasks`
  - `/ceo-ralph:execute`
  - `/ceo-ralph:status`
  - `/ceo-ralph:pause`
  - `/ceo-ralph:resume`
  - `/ceo-ralph:cancel`
  - `/ceo-ralph:help`

- [ ] **Step 6.2**: Implement user approval gates
  - `awaitingApproval` state handling
  - Phase transition validation
  - Quick mode (`--quick`) bypass

### Phase 7: Testing & Refinement (Days 18-22)

- [ ] **Step 7.1**: Unit test MCP server
  - Tool invocation tests
  - Error handling tests
  - Token tracking tests

- [ ] **Step 7.2**: Integration test workflow
  - Full workflow end-to-end
  - Retry mechanism testing
  - Escalation testing

- [ ] **Step 7.3**: Create example spec
  - Document sample feature
  - Show all artifacts

- [ ] **Step 7.4**: Write documentation
  - ARCHITECTURE.md
  - SETUP.md
  - WORKFLOW.md
  - TROUBLESHOOTING.md

- [ ] **Step 7.5**: Performance optimization
  - Context package size optimization
  - Parallel execution tuning
  - Token usage optimization

---

## 9. Risks & Mitigations

### 9.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Codex CLI unavailable/deprecated | High | Low | Abstract behind interface, support direct API |
| API rate limiting | Medium | Medium | Implement exponential backoff, batch operations |
| Context window overflow | Medium | Medium | Smart context pruning, rolling context |
| Codex quality variance | Medium | High | CEO review loop, max retry limit |

### 9.2 Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| High API costs | Medium | Medium | Usage tracking, configurable limits, alerts |
| Infinite loop | High | Low | Max global iterations, automatic escalation |
| State corruption | High | Low | State validation, recovery commands |

### 9.3 User Experience Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow execution | Medium | Medium | Progress indicators, parallel execution |
| Confusing errors | Medium | Medium | Clear error messages, troubleshooting guide |
| Lost progress | High | Low | Regular state persistence, backup strategy |

---

## 10. Success Criteria

### 10.1 Functional Requirements

- [ ] Complete spec-driven workflow (research → execute)
- [ ] User approval gates at each phase
- [ ] Codex worker delegation via MCP
- [ ] CEO review loop with retry mechanism
- [ ] 4-layer verification system
- [ ] Loop continues until all tasks complete
- [ ] Quality command auto-discovery

### 10.2 Performance Requirements

- [ ] Single task execution < 5 minutes average
- [ ] CEO review < 30 seconds per task
- [ ] Full feature completion with < 3 user interventions
- [ ] Token distribution: ~30% Claude, ~70% Codex

### 10.3 Quality Requirements

- [ ] All generated code passes discovered quality gates
- [ ] No uncommitted changes at completion
- [ ] Clear audit trail in .progress.md
- [ ] Recoverable from any failure state

### 10.4 User Experience Requirements

- [ ] Clear status reporting at all times
- [ ] Graceful pause/resume capability
- [ ] Helpful error messages with actionable suggestions
- [ ] Quick mode for trusted workflows

---

## Appendix A: Configuration Reference

### Claude Code MCP Configuration

```json
// .claude/mcp.json
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
```

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...           # For Codex API access

# Optional
CEO_RALPH_MAX_RETRIES=3         # Max retries per task
CEO_RALPH_MAX_ITERATIONS=100    # Max global iterations
CEO_RALPH_PARALLEL_LIMIT=3      # Max parallel workers
CEO_RALPH_CODEX_MODEL=gpt-4     # Codex model to use
```

---

## Appendix B: Command Reference

| Command | Description |
|---------|-------------|
| `/ceo-ralph:start [name] [goal]` | Start new spec or resume existing |
| `/ceo-ralph:start [goal] --quick` | Quick mode: auto-approve all phases |
| `/ceo-ralph:research` | Run research phase |
| `/ceo-ralph:requirements` | Generate requirements |
| `/ceo-ralph:design` | Generate technical design |
| `/ceo-ralph:tasks` | Break into executable tasks |
| `/ceo-ralph:execute` | Start execution loop |
| `/ceo-ralph:status` | Show current progress |
| `/ceo-ralph:pause` | Pause execution loop |
| `/ceo-ralph:resume` | Resume execution loop |
| `/ceo-ralph:cancel` | Cancel and cleanup |
| `/ceo-ralph:help` | Show help |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **CEO** | Claude Opus 4.5 acting as orchestrator/reviewer |
| **Worker** | GPT Codex agent executing tasks |
| **Spec** | Feature specification (research, requirements, design, tasks) |
| **Phase** | Stage in the workflow (research, requirements, etc.) |
| **Verification Layer** | Automated check before task completion |
| **Context Package** | Focused information bundle sent to Codex worker |
| **Escalation** | Pausing execution to request user help |
| **POC-First** | Making it work before making it perfect |

---

*This plan was generated based on research of Smart Ralph and Claude Delegator plugins. Ready for user approval before implementation begins.*

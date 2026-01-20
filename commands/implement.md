---
name: implement
description: Execute tasks sequentially via Codex delegation
allowed-tools: mcp__codex__codex, Read, Write, Edit, Bash, Glob, Grep
timeout: 600000
---

# /ceo-ralph:implement

Execute tasks sequentially by delegating to GPT Codex workers via MCP.

## Usage

```
/ceo-ralph:implement
```

## Prerequisites

- Tasks phase complete (`tasks.md` exists)
- Ralph Wiggum plugin dependency (for loop pattern)
- Codex MCP configured (run `/ceo-ralph:setup` if not)

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

Never write code directly. Your role is to:
1. Parse tasks from `tasks.md`
2. Prepare context packages for Codex workers
3. Delegate implementation via MCP
4. Review outputs against acceptance criteria
5. Run verification layers
6. Mark tasks complete or retry

## Dependency Verification

Before starting, check that Codex MCP is available:

```
Check for: mcp__codex__codex tool
```

If not available:
```
Codex MCP is not configured.

Run `/ceo-ralph:setup` to configure the Codex CLI MCP server.
```

## State Management

Maintain `.ceo-ralph-state.json`:

```json
{
  "phase": "execution",
  "currentTask": {
    "index": 0,
    "id": "1.1",
    "iteration": 1,
    "status": "pending",
    "workerAttempts": 0
  },
  "totalTasks": 10,
  "completedTasks": 0,
  "globalIteration": 1,
  "maxGlobalIterations": 100,
  "maxRetries": 5
}
```

## Task Parsing

Read tasks from `tasks.md`. Tasks can be marked with special indicators:

| Marker | Meaning | Handling |
|--------|---------|----------|
| `[P]` | Parallel execution | Spawn multiple Task calls simultaneously |
| `[VERIFY]` | Quality checkpoint | Delegate to qa-engineer agent |
| `[POC]` | Proof of concept | Execute first, validate before continuing |
| `[CRITICAL]` | Critical path | Max 5 retries instead of 3 |
| `[OPTIONAL]` | Optional task | Max 2 retries, skip if fails |

Task status markers:
- `[ ]` - Not started
- `[x]` - Completed
- `[~]` - In progress
- `[!]` - Blocked

## Execution Architecture

### Sequential Tasks

For standard tasks, delegate to Codex via MCP:

```
┌─────────────────────────────────────┐
│         READ NEXT TASK              │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      PREPARE CONTEXT PACKAGE        │
│  - Task description                 │
│  - Relevant file contents           │
│  - Design context                   │
│  - Acceptance criteria              │
│  - Previous feedback (if retry)     │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      DELEGATE TO CODEX WORKER       │
│  via MCP: mcp__codex__codex         │
│  sandbox: workspace-write           │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         REVIEW OUTPUT               │
│  - Check acceptance criteria        │
│  - Verify code quality              │
│  - Check for contradiction phrases  │
│  - Decision: APPROVED/RETRY/ESCALATE│
└─────────────────────────────────────┘
                  │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
  APPROVED   RETRY      ESCALATE
      │          │          │
      ▼          │          ▼
  4-LAYER        │       PAUSE &
  VERIFY ◄───────┘       REPORT
      │
      ▼
  MARK [x]
  IN tasks.md
      │
      ▼
  NEXT TASK
      │
      ▼
  ALL DONE? ──► ALL_TASKS_COMPLETE
```

### Parallel Tasks

For tasks marked `[P]`, spawn multiple Task tool calls simultaneously:

```typescript
// Multiple parallel delegations in single message
Task({ prompt: "Task 1...", subagent_type: "spec-executor" })
Task({ prompt: "Task 2...", subagent_type: "spec-executor" })
Task({ prompt: "Task 3...", subagent_type: "spec-executor" })
```

Wait for all to complete, then verify each.

### Verification Tasks

For `[VERIFY]` checkpoints, delegate to qa-engineer:

```markdown
Delegate to: qa-engineer

Context:
- Spec: {specName}
- Completed tasks: {list}
- Files modified: {list}

Instructions:
Run quality gates:
1. Lint check
2. Type check
3. Test suite
4. Build verification

Report pass/fail for each gate.
```

## 4-Layer Verification

Before marking any task complete, run all verification layers:

### Layer 1: Contradiction Detection

Check worker output for contradiction phrases alongside completion claims:

**Red flags**:
- "requires manual" + "TASK_COMPLETE"
- "couldn't find" + "implemented successfully"
- "error occurred" + "completed"
- "TODO" + "finished"

If contradictions found → RETRY

### Layer 2: Uncommitted Files Check

Verify all spec-related changes are committed:

```bash
git status --porcelain ./specs/{name}/
git diff --name-only HEAD~1
```

If uncommitted changes exist → prompt to commit or RETRY

### Layer 3: Checkmark Verification

Count checkmarks in `tasks.md`:

```
Before task: N completed
After task: N+1 completed (or +parallel count)
```

If count doesn't match expected → RETRY

### Layer 4: Signal Verification

Confirm worker output contains explicit completion signal:

```
TASK_COMPLETE
```

If signal missing → RETRY

### Layer 5 (Optional): Quality Gates

Run discovered quality commands:

```bash
{lint command}   # e.g., npm run lint
{test command}   # e.g., npm test
{build command}  # e.g., npm run build
```

All must pass for verification success.

## Retry Handling

| Scenario | Max Retries | Action on Exceed |
|----------|-------------|------------------|
| Standard task | 3 | Escalate to user |
| `[CRITICAL]` task | 5 | Pause execution, escalate |
| `[OPTIONAL]` task | 2 | Skip, log warning, continue |
| Verification failure | 3 | Include feedback in next attempt |

Retry includes feedback:
```markdown
Previous attempt failed verification.

Issue: {specific failure reason}
Layer: {which verification layer failed}

Please fix and ensure TASK_COMPLETE signal is present.
```

## Progress Tracking

Update `.progress.md` after each task:

```markdown
## Execution Progress

### Task 1.1: Create user model ✓
- Completed: {timestamp}
- Attempts: 1
- Files: src/models/user.ts

### Task 1.2: Add authentication middleware ✓
- Completed: {timestamp}
- Attempts: 2 (retry: missing tests)
- Files: src/middleware/auth.ts, src/middleware/auth.test.ts

### Task 1.3: Implement login endpoint ~
- Started: {timestamp}
- Attempt: 1
- Status: In progress
```

## Output During Execution

```markdown
## Execution In Progress

**Spec**: {specName}
**Progress**: {completed}/{total} tasks ({percent}%)

### Current Task

**{taskId}**: {task title}
**Status**: {Delegating | Reviewing | Verifying}
**Attempt**: {n} of {max}

### Recent Activity

| Time | Task | Status |
|------|------|--------|
| {time} | 1.2 | ✓ Completed |
| {time} | 1.1 | ✓ Completed |
| {time} | -- | Execution started |

### Resource Usage

| Model | Tokens |
|-------|--------|
| Claude (CEO) | {n} |
| Codex (Workers) | {n} |
```

## Output On Completion

```markdown
## ALL_TASKS_COMPLETE

**Spec**: {specName}
**Duration**: {total time}

### Summary

| Metric | Value |
|--------|-------|
| Total Tasks | {n} |
| Successful | {n} |
| Retries | {n} |
| Skipped | {n} |

### Quality Gates

- [x] Lint: PASS
- [x] Types: PASS
- [x] Tests: PASS
- [x] Build: PASS

### Token Usage

| Model | Tokens | Est. Cost |
|-------|--------|-----------|
| Claude | {n} | ~${x} |
| Codex | {n} | ~${x} |
| **Total** | **{n}** | **~${x}** |

### Files Modified

{list of files created/modified}

---

All tasks complete! Review `.progress.md` for execution details.
```

## Error Handling

| Error | Action |
|-------|--------|
| Codex API failure | Retry with exponential backoff |
| Verification failure | Retry with feedback (up to max) |
| Max retries exceeded | Pause, output context, escalate |
| Max iterations reached | Stop, report progress, ask user |
| Critical task failure | Immediate pause, full context dump |

## Escalation Output

When stuck:

```markdown
## Execution Paused - Escalation Required

**Task**: {taskId} - {title}
**Attempts**: {n} of {max}
**Failure reason**: {reason}

### Context

{Relevant code snippets}
{Error messages}
{What was tried}

### Options

1. Provide guidance and run `/ceo-ralph:resume`
2. Skip this task: `/ceo-ralph:resume --skip`
3. Cancel execution: `/ceo-ralph:cancel`
```

## State Updates

During execution, continuously update:

```json
{
  "phase": "execution",
  "currentTask": {
    "index": {n},
    "id": "{taskId}",
    "iteration": {n},
    "status": "verifying",
    "workerAttempts": {n}
  },
  "completedTasks": {n},
  "globalIteration": {n},
  "updatedAt": "{timestamp}"
}
```

## Notes

- This command is the main execution entry point
- Use `/ceo-ralph:execute` as an alias (same behavior)
- Use `/ceo-ralph:pause` to pause execution
- Use `/ceo-ralph:resume` to resume after pause/escalation
- Use `/ceo-ralph:status` to check progress

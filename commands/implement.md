---
description: Start task execution loop
argument-hint: [--max-task-iterations 5] [--executor auto|codex|task]
allowed-tools: [Read, Write, Edit, Task, Bash]
---

# /ceo-ralph:implement

Start task execution loop using the best available executor (Codex MCP or Task sub-agents).

## Executor Detection

Determine which executor to use:

1. Check `$ARGUMENTS` for `--executor <type>` (overrides config)
2. Read `./specs/.ralph-executor.json` for saved preference
3. Default to `auto`

For `auto` or `codex` mode:
- Check if `mcp__codex__codex` tool is available
- If available → executor = `codex`
- If not available:
  - `auto` mode → executor = `task-agent` (silent fallback)
  - `codex` mode → error: "Codex MCP not configured. Run /ceo-ralph:setup"

For `task` mode:
- executor = `task-agent` (always)

Output the detected executor:
```
Executor: [codex] Codex MCP
```
or
```
Executor: [task-agent] Claude Task sub-agents
```

## Determine Active Spec

1. Read `./specs/.current-spec` to get active spec name
2. If file missing or empty: error "No active spec. Run /ceo-ralph:new <name> first."

## Validate Prerequisites

1. Check `./specs/$spec/` directory exists
2. Check `./specs/$spec/tasks.md` exists. If not: error "Tasks not found. Run /ceo-ralph:plan first."
3. Ensure `./specs/$spec/.progress.md` exists. If missing, create a minimal stub with the goal and phase.

## Parse Arguments

From `$ARGUMENTS`:
- **--max-task-iterations**: Max retries per task (default: 5)
- **--executor**: Override executor type (auto|codex|task)

## Initialize Execution State

1. Count total tasks in tasks.md (lines matching `- [ ]` or `- [x]`)
2. Count already completed tasks (lines matching `- [x]`)
3. Set taskIndex to first incomplete task

Write `.ralph-state.json`:
```json
{
  "phase": "execution",
  "taskIndex": <first incomplete>,
  "totalTasks": <count>,
  "taskIteration": 1,
  "maxTaskIterations": <parsed from --max-task-iterations or default 5>,
  "executor": "<codex|task-agent>"
}
```

## Initialize Delegation Log

Create/update `./specs/$spec/.ralph-delegation.json` if it doesn't exist:
```json
{
  "specName": "<spec>",
  "executor": "<codex|task-agent|auto>",
  "workers": [],
  "stats": {
    "total": 0,
    "completed": 0,
    "failed": 0,
    "running": 0,
    "pending": 0,
    "avgDurationMs": 0
  }
}
```

## Execution Loop

For each task:

### 1. Build Context Package

Same for both executors:
- Read the task block from `tasks.md`
- Read relevant files (from Files section)
- Read `./specs/$spec/.progress.md`
- Read `./specs/$spec/discovery.md` (if exists)
- Read `./specs/$spec/.design-summary.md` or `design.md` (if exists)
- Read `./agents/spec-executor.md` for base instructions

### 2. Generate Worker ID

```
w-<NNN>  (e.g., w-001, w-002, ...)
```

Sequential, zero-padded to 3 digits.

### 3. Log Worker Start

Update `./specs/$spec/.ralph-delegation.json` — add worker entry:
```json
{
  "workerId": "w-001",
  "taskId": "1.1",
  "taskTitle": "Task title from tasks.md",
  "executor": "<codex|task-agent>",
  "status": "running",
  "startedAt": "<ISO timestamp>",
  "completedAt": null,
  "attempt": 1,
  "result": null,
  "summary": null,
  "filesChanged": [],
  "commitHash": null
}
```

### 4. Dispatch Task

Output status:
```
[<executor>] Task X.Y: <title> — dispatching...
```

**Codex MCP path:**
```
mcp__codex__codex({
  prompt: "<spec-executor instructions>\n\nTask: <task block>\n\nContext: <files>",
  sandbox: "workspace-write"
})
```

**Task tool path:**
```
Task({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "<spec-executor instructions>\n\nTask: <task block>\n\nContext: <files>\n\nIMPORTANT: You are running as a Task sub-agent, not Codex MCP. Follow the spec-executor instructions exactly. Output TASK_COMPLETE when done."
})
```

### 5. Post-Execution (same for both)

After executor completes:
- Verify output matches "Done when" criteria
- Read `./specs/$spec/codex-log.md` for a concise summary and references
- Update tasks.md with [x]
- Update .progress.md
- Commit changes if required by the task

### 6. Log Worker Completion

Update the worker entry in `.ralph-delegation.json`:
```json
{
  "status": "completed|failed",
  "completedAt": "<ISO timestamp>",
  "result": "TASK_COMPLETE|TASK_BLOCKED|FAILED",
  "summary": "Brief output summary",
  "filesChanged": ["src/Login.tsx", "..."],
  "commitHash": "abc1234"
}
```

Update aggregate stats:
```json
{
  "total": <total workers>,
  "completed": <count>,
  "failed": <count>,
  "running": <count>,
  "pending": <remaining tasks>,
  "avgDurationMs": <average of completed worker durations>
}
```

### 7. Error Handling

If Codex MCP returns `AbortError`:
- Re-run the task once with reduced context (only Files list + task block + .progress.md)
- Log the failure in `.progress.md` and `codex-log.md`
- If it fails again, stop and ask the user

If Task tool returns an error:
- Log the failure with attempt count
- Retry up to maxTaskIterations
- If still failing, stop and ask the user

If the user manually stops execution, treat it as a cancel and stop cleanly (no retries).

Output status for each task:
```
[codex] Task 1.1: Setup project structure — DONE (12s)
[task-agent] Task 1.2: Implement login form — DONE (34s)
[task-agent] Task 1.3: Add validation — FAILED (attempt 2/5)
```

## Completion

When taskIndex >= totalTasks and all tasks are [x], output:

```
ALL_TASKS_COMPLETE
```

## Notes

- Each task is executed in a fresh executor call to preserve clean context.
- [VERIFY] tasks should be delegated to qa-engineer (as in spec-executor rules).
- Avoid polling or tailing live task output. Rely on updated files (`tasks.md`, `.progress.md`, `codex-log.md`) to reduce terminal flicker.
- Avoid spinners or overwriting lines; print plain, newline-delimited status to keep terminal readable.
- Do not open or tail temporary task output files; they cause prompt flicker in some terminals.

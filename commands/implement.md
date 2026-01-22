---
description: Start task execution loop
argument-hint: [--max-task-iterations 5]
allowed-tools: [Read, Write, Edit, Task, Bash]
---

# /ceo-ralph:implement

Start task execution loop using Codex MCP as the executor.

## Codex MCP Dependency Check

**BEFORE proceeding**, verify Codex MCP is available:

```
Check for: mcp__codex__codex tool
```

If not available:
1. Output error: "ERROR: Codex MCP not configured. Run /ceo-ralph:setup"
2. STOP execution immediately. Do NOT continue.

## Determine Active Spec

1. Read `./specs/.current-spec` to get active spec name
2. If file missing or empty: error "No active spec. Run /ceo-ralph:new <name> first."

## Validate Prerequisites

1. Check `./specs/$spec/` directory exists
2. Check `./specs/$spec/tasks.md` exists. If not: error "Tasks not found. Run /ceo-ralph:tasks first."
3. Ensure `./specs/$spec/.progress.md` exists. If missing, create a minimal stub with the goal and phase.

## Parse Arguments

From `$ARGUMENTS`:
- **--max-task-iterations**: Max retries per task (default: 5)

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
  "maxTaskIterations": <parsed from --max-task-iterations or default 5>
}
```

## Execution Loop (Codex MCP)

For each task:
1. Read the task block from `tasks.md`
2. Build a minimal context package:
   - Task description (Do/Files/Done when/Verify/Commit)
   - Relevant files (from Files section)
   - `./specs/$spec/.progress.md`
   - `./specs/$spec/design.md` (if needed)
3. Send a single-task execution prompt to Codex MCP

Use the spec-executor instructions as the base prompt:
- Read `./agents/spec-executor.md`
- Append task-specific context and files
- Enforce "one task only"

Invoke Codex MCP:
```
mcp__codex__codex({
  prompt: "<spec-executor instructions>\n\nTask: <task block>\n\nContext: <files>",
  sandbox: "workspace-write"
})
```

After Codex completes:
- Verify output matches "Done when" criteria
- Read `./specs/$spec/codex-log.md` for a concise summary and references
- Update tasks.md with [x]
- Update .progress.md
- Commit changes if required by the task

If Codex MCP returns `AbortError`:
- Re-run the task once with reduced context (only Files list + task block + .progress.md)
- Log the failure in `.progress.md` and `codex-log.md`
- If it fails again, stop and ask the user
If the user manually stops execution, treat it as a cancel and stop cleanly (no retries).

## Completion

When taskIndex >= totalTasks and all tasks are [x], output:

```
ALL_TASKS_COMPLETE
```

## Notes

- Codex is the **only** executor. Claude remains coordinator.
- Each task is executed in a fresh Codex call to preserve clean context.
- [VERIFY] tasks should be delegated to qa-engineer (as in spec-executor rules).
- Avoid polling or tailing live task output. Rely on updated files (`tasks.md`, `.progress.md`, `codex-log.md`) to reduce terminal flicker.
- Avoid spinners or overwriting lines; print plain, newline-delimited status to keep terminal readable.
- Do not open or tail temporary task output files; they cause prompt flicker in some terminals.

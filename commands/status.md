---
description: Show rich status with worker tree, progress bars, and delegation stats
argument-hint:
allowed-tools: [Read, Bash, Glob, Task]
---

# CEO Ralph Status

Show comprehensive status including active spec, worker tree, progress bars, and delegation statistics.

## Gather Information

1. Check if `./specs/` directory exists
2. Read `./specs/.current-spec` to identify active spec
3. Read `./specs/.ralph-executor.json` for executor config (if exists)
4. List all subdirectories in `./specs/` (each is a spec)

## For Active Spec — Rich Display

For the active spec, gather all available data:

### State & Progress

1. Read `.ralph-state.json` if exists:
   - Current phase, executor type
   - Task progress (taskIndex/totalTasks)
   - Iteration count

2. Read `tasks.md` and categorize tasks by phase:
   - Count `- [x]` (completed) and `- [ ]` (pending) per phase
   - Phases are marked by headers: Phase 1 (POC), Phase 2 (Refactor), Phase 3 (Testing), Phase 4 (QA)

3. Read `.ralph-delegation.json` if exists:
   - Worker list with status, executor type, duration
   - Aggregate stats

### Output — Rich Terminal Display

```
# CEO Ralph Status

Active spec: <name> [<PHASE>]
Executor: <auto|codex|task> (<codex available|task-agent only>)
Branch: <current git branch>

## Worker Tree

CEO (Opus) — Coordinator
├── [w-001] Task 1.1: <title> [codex] DONE (12s) ✓
├── [w-002] Task 1.2: <title> [codex] DONE (34s) ✓
├── [w-003] Task 1.3: <title> [task-agent] RUNNING... (15s)
├── [w-004] Task 2.1: [VERIFY] Quality checkpoint — PENDING
└── ... N more tasks

## Progress

Phase 1 (POC):      ████████░░ 80% (4/5 tasks)
Phase 2 (Refactor): ░░░░░░░░░░  0% (0/3 tasks)
Phase 3 (Testing):  ░░░░░░░░░░  0% (0/4 tasks)
Phase 4 (QA):       ░░░░░░░░░░  0% (0/2 tasks)
Overall:            ██░░░░░░░░ 29% (4/14 tasks)

## Stats

Workers spawned: <N>
Avg task time: <Ns>
Success rate: <N>%
Executor: codex (<N>) | task-agent (<N>)

## Commands
- /ceo-ralph:implement — Resume execution
- /ceo-ralph:pause — Pause after current task
- /ceo-ralph:cancel — Cancel execution
- /ceo-ralph:dashboard — Open web dashboard
```

### Progress Bar Rendering

Use Unicode block characters for progress bars (10 chars wide):
- Full block: `█`
- Empty block: `░`
- Calculate: `filled = round(percentage / 10)`

Example: 80% = `████████░░`

### Worker Tree Rendering

For each worker in `.ralph-delegation.json`:
- Use `├──` for non-last items, `└──` for last item
- Show `[codex]` or `[task-agent]` badge
- Show status: `DONE (Ns) ✓`, `RUNNING... (Ns)`, `FAILED ✗`, `PENDING`
- Calculate elapsed time for running workers
- For DONE workers, show durationMs converted to seconds

If no delegation log exists (no workers spawned yet), show:
```
## Worker Tree

No workers spawned yet. Run /ceo-ralph:implement to start.
```

## For Other Specs — Summary Display

For non-active specs, show condensed info:

```
### <spec-name>
Phase: <phase>
Progress: <completed>/<total> tasks (<percentage>%)
Files: [x] discovery [x] tasks [ ] legacy
```

## Phase Display

Show phase status with indicators:
- discovery: "Discovery"
- plan: "Plan"
- tasks: "Tasks"
- execution: "Executing" with task progress

## File Indicators

For each file, show:
- [x] if file exists
- [ ] if file does not exist

Example: `Files: [x] discovery [x] tasks [ ] legacy`

## No Active Spec

If no active spec:

```
# CEO Ralph Status

No active spec.

Commands:
- /ceo-ralph:new <name> — Create new spec
- /ceo-ralph:switch <name> — Switch to existing spec
```

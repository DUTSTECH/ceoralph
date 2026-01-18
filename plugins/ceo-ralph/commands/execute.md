# /ceo-ralph:execute

Start the execution loop with Codex workers.

## Usage

```
/ceo-ralph:execute
```

## Prerequisites

- Tasks phase complete
- `tasks.md` exists in spec directory
- State shows phase is ready for execution

## Behavior

1. Load state and verify tasks complete
2. Initialize execution coordinator
3. For each task:
   - Parse task from tasks.md
   - Check if [VERIFY] → delegate to qa-engineer
   - Check if [P] → batch for parallel execution
   - Otherwise → delegate to Codex worker
4. CEO reviews each worker output
5. Run 4-layer verification
6. Continue until ALL_TASKS_COMPLETE or escalation

## The Execution Loop

```
┌─────────────────────────────────────┐
│         READ NEXT TASK              │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      PREPARE CONTEXT PACKAGE        │
│  - Task spec                        │
│  - Relevant files                   │
│  - Design context                   │
│  - Previous feedback (if retry)     │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│      DELEGATE TO CODEX WORKER       │
│  via MCP: codex-worker.execute_task │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         CEO REVIEW OUTPUT           │
│  - Check acceptance criteria        │
│  - Verify code quality              │
│  - Decision: APPROVED/RETRY/ESCALATE│
└─────────────────────────────────────┘
                  │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
  APPROVED   RETRY      ESCALATE
      │          │          │
      ▼          │          ▼
  4-LAYER        │       PAUSE
  VERIFY ◄───────┘       OUTPUT
      │
      ▼
  MARK [x]
  NEXT TASK
      │
      ▼
  ALL DONE? ──▶ ALL_TASKS_COMPLETE
```

## Output During Execution

```markdown
## ⚡ Execution In Progress

**Spec**: {specName}
**Progress**: {completed}/{total} tasks ({percent}%)

### Current Task

**{taskId}**: {task title}
**Status**: {Delegating to Codex | Reviewing | Verifying}
**Attempt**: {n} of {max}

### Recent Activity

| Time | Task | Status |
|------|------|--------|
| {time} | {id} | ✓ Completed |
| {time} | {id} | ✓ Completed |
| {time} | {id} | ⟳ In Progress |

### Resource Usage

| Model | Tokens |
|-------|--------|
| Claude (CEO) | {n} |
| Codex (Workers) | {n} |
```

## Output On Completion

```markdown
## 🎉 ALL_TASKS_COMPLETE

**Spec**: {specName}
**Duration**: {total time}

### Final Summary

| Metric | Value |
|--------|-------|
| Total Tasks | {n} |
| Successful | {n} |
| Retries | {n} |
| Escalations | {n} |

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

Spec complete! All changes have been committed.

Review `.progress.md` for execution details.
```

## State Updates (During Execution)

```json
{
  "phase": "execution",
  "awaitingApproval": false,
  "currentTask": {
    "index": {n},
    "id": "{taskId}",
    "iteration": {n},
    "status": "delegated"
  },
  "completedTasks": {n},
  "globalIteration": {n},
  "updatedAt": "{timestamp}"
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Codex API failure | Retry with backoff, escalate after 3 failures |
| Verification failure | Retry task with feedback |
| Max iterations reached | Escalate to user |
| Critical task failure | Pause and escalate |

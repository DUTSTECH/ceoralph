# /ceo-ralph:pause

Pause the execution loop.

## Usage

```
/ceo-ralph:pause [reason]
```

## Arguments

- `reason` (optional): Reason for pausing

## Behavior

1. Check if execution is active
2. Set `paused: true` in state
3. Record pause reason
4. Complete current task iteration (don't interrupt mid-task)
5. Save state
6. Report pause status

## Output

```markdown
## ⏸️ Execution Paused

**Spec**: {specName}
**Paused at**: Task {taskId} - {task title}
**Reason**: {reason or "User requested"}

### Progress Saved

- Completed: {n}/{total} tasks
- Current task will resume from last checkpoint

### To Resume

```
/ceo-ralph:resume
```

### To Cancel

```
/ceo-ralph:cancel
```
```

## State Updates

```json
{
  "paused": true,
  "pauseReason": "{reason}",
  "updatedAt": "{timestamp}"
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Not executing | Report "Nothing to pause" |
| Already paused | Report current pause status |
| Mid-task | Wait for task iteration to complete |

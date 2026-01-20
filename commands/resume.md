---
description: Resume a paused execution
argument-hint: [--skip]
allowed-tools: [Read, Write, Edit, Task]
---

# /ceo-ralph:resume

Resume a paused execution.

## Usage

```
/ceo-ralph:resume
```

## Behavior

1. Check if execution is paused
2. Load state
3. Set `paused: false`
4. Resume from current task
5. Continue execution loop

## Output

```markdown
## ▶️ Execution Resumed

**Spec**: {specName}
**Resuming from**: Task {taskId} - {task title}

### Status

- Was paused for: {duration}
- Reason was: {pauseReason}
- Progress: {completed}/{total} tasks

### Continuing Execution...

{execution continues}
```

## State Updates

```json
{
  "paused": false,
  "pauseReason": null,
  "updatedAt": "{timestamp}"
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Not paused | Report "Nothing to resume" |
| State corrupted | Attempt recovery, report issue |
| Task no longer valid | Skip to next valid task |

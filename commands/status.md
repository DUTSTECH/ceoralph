---
name: status
description: Show current spec status and progress
allowed-tools: Read, Glob
timeout: 30000
---

# /ceo-ralph:status

Show current spec status and progress.

## Usage

```
/ceo-ralph:status
/ceo-ralph:status --all
```

## Arguments

- `--all`: Show all specs, not just current one

## Behavior

1. Read current spec from `./specs/.current-spec`
2. Load state from `.ceo-ralph-state.json`
3. Parse progress from tasks.md
4. Display comprehensive status

## Output (Single Spec)

```markdown
## 📊 CEO Ralph Status

### Current Spec: {specName}

**Phase**: {phase}
**Status**: {Active | Awaiting Approval | Paused | Completed}

### Progress

```
Phase 1: ████████░░ 80% (4/5 tasks)
Phase 2: ░░░░░░░░░░  0% (0/3 tasks)
Phase 3: ░░░░░░░░░░  0% (0/2 tasks)
Phase 4: ░░░░░░░░░░  0% (0/4 tasks)

Overall: ████░░░░░░ 28% (4/14 tasks)
```

### Current Task

**{taskId}**: {task title}
**Status**: {status}
**Attempt**: {n} of {max}

### Recent Activity

| Time | Event |
|------|-------|
| {time} | Task 1.4 completed |
| {time} | Task 1.3 completed (2 attempts) |
| {time} | Execution started |

### Resource Usage

| Model | Tokens | Est. Cost |
|-------|--------|-----------|
| Claude | {n} | ~${x} |
| Codex | {n} | ~${x} |

### Files

| File | Status |
|------|--------|
| research.md | ✓ Complete |
| requirements.md | ✓ Complete |
| design.md | ✓ Complete |
| tasks.md | ✓ Complete |
| .progress.md | Updated {time} |

### Next Action

{What the user should do next}
```

## Output (All Specs)

```markdown
## 📊 CEO Ralph: All Specs

| Spec | Phase | Progress | Status |
|------|-------|----------|--------|
| {name} | execution | 28% | ⟳ Active |
| {name} | completed | 100% | ✓ Done |
| {name} | design | 0% | ⏸ Paused |

**Current**: {specName}

Use `/ceo-ralph:switch {name}` to change active spec.
```

## State Read

Reads from:
- `./specs/.current-spec`
- `./specs/{name}/.ceo-ralph-state.json`
- `./specs/{name}/tasks.md`
- `./specs/{name}/.progress.md`

## Error Handling

| Error | Action |
|-------|--------|
| No specs exist | Prompt to run `/ceo-ralph:start` |
| State file corrupted | Attempt recovery, report issue |
| Tasks file missing | Report incomplete spec |

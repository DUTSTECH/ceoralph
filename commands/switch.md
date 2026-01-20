---
name: switch
description: Change active spec
allowed-tools: Read, Glob
timeout: 30000
---

# /ceo-ralph:switch

Change which specification is currently active.

## Usage

```
/ceo-ralph:switch [name]
```

## Arguments

- `name` (optional): Name of spec to switch to. If not provided, lists all available specs.

## Examples

```
/ceo-ralph:switch                  # List all specs
/ceo-ralph:switch user-auth        # Switch to user-auth spec
/ceo-ralph:switch dark-mode        # Switch to dark-mode spec
```

## Behavior

### Without Arguments (List Mode)

1. Scan `./specs/` directory for all spec folders
2. Read `.ceo-ralph-state.json` from each
3. Display list with current spec marked

```markdown
## Available Specs

| Spec | Phase | Progress | Status |
|------|-------|----------|--------|
| → user-auth | execution | 45% | Active |
| dark-mode | design | 0% | Awaiting approval |
| payment-flow | completed | 100% | Done |

**Current**: user-auth

Use `/ceo-ralph:switch <name>` to change active spec.
```

### With Arguments (Switch Mode)

1. Validate spec exists at `./specs/{name}/`
2. Update `./specs/.current-spec` with new spec name
3. Read the spec's `.ceo-ralph-state.json`
4. Read `.progress.md` for context
5. Display the spec's current state

```markdown
## Switched to: {name}

**Phase**: {phase}
**Progress**: {completed}/{total} tasks ({percent}%)
**Status**: {Active | Awaiting Approval | Paused | Completed}

### Available Files

| File | Status |
|------|--------|
| research.md | ✓ Complete |
| requirements.md | ✓ Complete |
| design.md | In progress |
| tasks.md | Not started |

### Next Action

{Guidance on what to do next based on phase}

{If awaiting approval}
Review the latest phase output and run the next phase command.

{If paused}
Run `/ceo-ralph:resume` to continue execution.

{If in execution}
Run `/ceo-ralph:implement` to continue task execution.
```

## State Updates

Only updates `./specs/.current-spec` file. Does not modify any spec state.

## Error Handling

| Error | Action |
|-------|--------|
| No specs exist | Prompt to run `/ceo-ralph:new` |
| Spec not found | List available specs, suggest correct name |
| State file missing | Report corrupted spec, offer recovery |

## Notes

- Switching specs preserves all state in both the old and new spec
- The current spec is used by all other commands by default
- Use `/ceo-ralph:status --all` to see detailed progress of all specs

# /ceo-ralph:cancel

Cancel current spec and cleanup.

## Usage

```
/ceo-ralph:cancel
/ceo-ralph:cancel --keep-files
```

## Arguments

- `--keep-files`: Don't delete spec files, just reset state

## Behavior

1. Confirm cancellation with user
2. Stop any running execution
3. Clean up state
4. Optionally remove spec files
5. Clear current spec pointer

## Confirmation

```markdown
## ⚠️ Cancel Spec?

**Spec**: {specName}
**Progress**: {completed}/{total} tasks ({percent}%)

This will:
- Stop execution immediately
- Delete `.ceo-ralph-state.json`
{if not --keep-files}
- Delete all spec files (research.md, requirements.md, etc.)
{/if}

**Type `yes` to confirm or `no` to abort.**
```

## Output (After Confirmation)

```markdown
## 🛑 Spec Cancelled

**Spec**: {specName}

### Cleanup Complete

- [x] Execution stopped
- [x] State file removed
{if not --keep-files}
- [x] Spec files removed
{else}
- [ ] Spec files kept at `./specs/{specName}/`
{/if}

### To Start Fresh

```
/ceo-ralph:start
```
```

## State Changes

- Deletes `.ceo-ralph-state.json`
- Clears `./specs/.current-spec`
- Optionally deletes spec directory

## Error Handling

| Error | Action |
|-------|--------|
| No active spec | Report "Nothing to cancel" |
| File deletion fails | Report which files couldn't be deleted |
| User aborts | Report "Cancellation aborted" |

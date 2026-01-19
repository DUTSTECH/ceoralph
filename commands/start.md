---
name: start
description: Start a new spec or resume an existing one
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
timeout: 120000
---

# /ceo-ralph:start

Start a new spec or resume an existing one.

## Usage

```
/ceo-ralph:start [name] [goal]
/ceo-ralph:start [goal] --quick
```

## Arguments

- `name` (optional): Name for the spec directory. Auto-generated from goal if not provided.
- `goal`: Description of what you want to build.
- `--quick`: Skip approval gates and auto-proceed through all phases.

## Examples

```
/ceo-ralph:start user-auth "Add user authentication with JWT"
/ceo-ralph:start "Add a dark mode toggle" --quick
/ceo-ralph:start  # Resume current spec
```

## Behavior

### New Spec

1. Create spec directory: `./specs/{name}/`
2. Initialize `.ceo-ralph-state.json`
3. Initialize `.progress.md`
4. Set current spec in `./specs/.current-spec`
5. Start research phase

### Resume Existing

1. Read `./specs/.current-spec` to find active spec
2. Load `.ceo-ralph-state.json`
3. Resume from current phase
4. If `awaitingApproval`, prompt user

### Quick Mode

When `--quick` flag is present:
- Skip all approval prompts
- Auto-approve each phase output
- Proceed directly to execution
- Still pause on errors/escalations

## State Initialization

```json
{
  "specName": "{name}",
  "basePath": "./specs/{name}",
  "phase": "research",
  "awaitingApproval": false,
  "quickMode": false,
  "currentTask": null,
  "totalTasks": 0,
  "completedTasks": 0,
  "globalIteration": 1,
  "maxGlobalIterations": 100,
  "paused": false,
  "usage": {
    "claude": { "totalTokens": 0 },
    "codex": { "totalTokens": 0 }
  },
  "createdAt": "{ISO timestamp}",
  "updatedAt": "{ISO timestamp}"
}
```

## Output

```markdown
## 🚀 CEO Ralph: Starting Spec

**Name**: {specName}
**Goal**: {goal}
**Mode**: {Standard | Quick}

Creating spec directory...
Initializing state...

Ready to begin research phase.

{If standard mode}
Run `/ceo-ralph:research` to start research.

{If quick mode}
Starting automatic execution...
```

## Error Handling

| Error | Action |
|-------|--------|
| Spec directory exists | Offer to resume or create new |
| Invalid goal | Ask for clarification |
| Missing permissions | Report and stop |

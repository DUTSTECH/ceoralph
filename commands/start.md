---
description: Smart entry point - resumes existing spec or creates new one
argument-hint: [name] [goal] [--quick]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task, AskUserQuestion]
---

# /ceo-ralph:start

Smart entry point that detects whether to create a new spec or resume an existing one, with branch management and multiple execution modes.

## Usage

```
/ceo-ralph:start [name] [goal]
/ceo-ralph:start [goal] --quick
/ceo-ralph:start ./plan.md --quick
/ceo-ralph:start                      # Auto-detect/resume
```

## Arguments

- `name` (optional): Spec name in kebab-case. Auto-generated from goal if not provided.
- `goal` (optional): Description of what you want to build.
- `./plan.md` (optional): Path to existing plan file to import.
- `--quick`: Skip approval gates, auto-generate artifacts, start execution immediately.

## Examples

```
/ceo-ralph:start user-auth "Add user authentication with JWT"
/ceo-ralph:start "Add a dark mode toggle" --quick
/ceo-ralph:start ./plan.md --quick
/ceo-ralph:start                      # Resume current spec
```

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

Never write code or spec artifacts yourself. Always delegate to appropriate agents:
- Research → `research-analyst`
- Requirements → `product-manager`
- Design → `architect-reviewer`
- Tasks → `task-planner`
- Planning synthesis → `plan-synthesizer`
- Execution → delegate to Codex via MCP

## Three Execution Modes

### 1. Auto-detect Mode (no arguments)

Check for existing spec:
- If `./specs/.current-spec` exists → Resume workflow
- Otherwise → Prompt for new spec details

### 2. Normal Mode (name/goal provided, no --quick)

Interactive multi-phase workflow:
1. Branch management (if in git repo)
2. Create spec directory
3. Research phase → **STOP for approval**
4. Requirements phase → **STOP for approval**
5. Design phase → **STOP for approval**
6. Tasks phase → **STOP for approval**
7. Execution phase

**CRITICAL**: Must STOP after each subagent completes. User must explicitly run next phase command.

### 3. Quick Mode (--quick flag)

Automated full pipeline:
1. Skip branch prompts (use current branch)
2. Create spec directory
3. Auto-run all phases without stopping
4. Start execution immediately
5. Only pause on errors or escalations

## Behavior

### Step 1: Branch Management (Git Repos Only)

Check current git branch:

```bash
git rev-parse --abbrev-ref HEAD
git remote show origin | grep "HEAD branch"
```

**On default branch (main/master)**:
```
You're on the default branch. How would you like to proceed?

1. Create feature branch (feat/{spec-name})
2. Create git worktree
3. Stay on current branch
```

**On feature branch**:
```
You're on branch: {branch-name}

1. Continue on this branch
2. Create new feature branch
3. Create git worktree
```

Branch naming: `feat/{spec-name}` with sanitization (lowercase, hyphens only).

### Step 2: Determine New vs Resume

**Resume existing** (no arguments, `.current-spec` exists):
1. Read spec name from `./specs/.current-spec`
2. Load `.ceo-ralph-state.json`
3. Check `awaitingApproval` → prompt user to continue
4. Check `paused` → offer to resume
5. Resume from current phase

**Create new** (arguments provided or no current spec):
1. Parse name and goal from arguments
2. Validate spec name (kebab-case)
3. Check for name conflicts
4. Proceed to directory setup

### Step 3: Input Parsing

Handle flexible argument formats:
- `name goal` → spec name and goal
- `goal` only → auto-generate name from goal
- `./file.md` → import plan from file
- `name ./file.md` → name spec, import plan

For quick mode: validate all inputs before starting (non-empty content, plan file exists, no name conflicts). Atomic rollback on validation failures.

### Step 4: Directory Setup

Create spec directory structure:

```
./specs/{name}/
├── .ceo-ralph-state.json
├── .progress.md
└── (other files created by phases)
```

Update tracking files:
- `./specs/.current-spec` → new spec name
- `.gitignore` → add `specs/*/.ceo-ralph-state.json`

### Step 5: State Initialization

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
  "goal": "{original goal}",
  "branch": "{feature branch name}",
  "usage": {
    "claude": { "totalTokens": 0 },
    "codex": { "totalTokens": 0 }
  },
  "createdAt": "{ISO timestamp}",
  "updatedAt": "{ISO timestamp}"
}
```

### Step 6: Phase Execution

**Normal mode**: Start research phase, then STOP.

Delegate to `research-analyst`:
```markdown
Delegate to: research-analyst

Context:
- Spec name: {specName}
- Goal: {goal}
- Working directory: {project root}

Instructions:
Investigate this feature request. Output findings to research.md.
```

After research completes:
```
Research complete. Review ./specs/{name}/research.md

To approve and continue: /ceo-ralph:requirements
To revise: Provide feedback and run /ceo-ralph:research
```

**Quick mode**: Auto-run all phases without stopping.

Chain: research → requirements → design → tasks → execute

Only stop on errors or when execution completes.

## Output

### New Spec (Normal Mode)

```markdown
## CEO Ralph: Starting Spec

**Name**: {specName}
**Goal**: {goal}
**Branch**: {branch}
**Mode**: Standard

Creating spec directory... done
Initializing state... done

Starting research phase...

{After research completes}

Research complete.

Review: ./specs/{name}/research.md

To approve and continue: /ceo-ralph:requirements
To revise research: Provide feedback, then /ceo-ralph:research
```

### New Spec (Quick Mode)

```markdown
## CEO Ralph: Quick Mode

**Name**: {specName}
**Goal**: {goal}
**Mode**: Quick (auto-approve)

Creating spec... done
Running research... done
Generating requirements... done
Creating design... done
Planning tasks... done

Starting execution...

{Execution output follows}
```

### Resume Existing

```markdown
## CEO Ralph: Resuming Spec

**Name**: {specName}
**Phase**: {phase}
**Progress**: {completed}/{total} tasks

{If awaiting approval}
Last phase output is ready for review.
File: ./specs/{name}/{phase}.md

To approve and continue: /ceo-ralph:{next-phase}

{If paused}
Spec is paused. Reason: {pauseReason}

To resume: /ceo-ralph:resume

{If in execution}
Resuming execution...
```

## Error Handling

| Error | Action |
|-------|--------|
| Spec name exists | Offer resume, overwrite, or new name |
| Invalid goal | Prompt for clarification |
| Plan file not found | Report error, ask for valid path |
| Git not available | Skip branch management, continue |
| Branch create fails | Report error, offer alternatives |
| Agent failure | Report error, allow retry |

## State Management

State file: `./specs/{name}/.ceo-ralph-state.json`

Tracks:
- Current phase and approval status
- Task progress and iteration count
- Token usage (Claude vs Codex)
- Pause state and reason
- Timestamps

## Notes

- Use `/ceo-ralph:new` to always create a new spec (no resume detection)
- Use `/ceo-ralph:switch` to change active spec
- Use `/ceo-ralph:status` to see all specs and progress

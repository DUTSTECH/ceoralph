---
description: Smart entry point that detects if you need a new spec or should resume existing
argument-hint: [name] [goal] [--fresh] [--quick] [--commit-spec] [--no-commit-spec]
allowed-tools: [Read, Write, Bash, Task, AskUserQuestion]
---

# /ceo-ralph:start

Smart entry point for CEO Ralph. Detects whether to create a new spec or resume existing one.

## Branch Management (FIRST STEP)

<mandatory>
Before creating any files or directories, check the current git branch and handle appropriately.
</mandatory>

### Step 1: Check Current Branch

```bash
git branch --show-current
```

### Step 2: Determine Default Branch

Check which is the default branch:
```bash
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@'
```

If that fails, assume `main` or `master` (check which exists):
```bash
git rev-parse --verify origin/main 2>/dev/null && echo "main" || echo "master"
```

### Step 3: Branch Decision Logic

```
1. Get current branch name
   |
   +-- ON DEFAULT BRANCH (main/master):
   |   |
   |   +-- Ask user for branch strategy:
   |   |   "Starting new spec work. How would you like to handle branching?"
   |   |   1. Create branch in current directory (git checkout -b)
   |   |   2. Create git worktree (separate directory)
   |   |
   |   +-- If user chooses 1 (current directory):
   |   |   - Generate branch name from spec name: feat/$specName
   |   |   - If spec name not yet known, use temp name: feat/spec-work-<timestamp>
   |   |   - Create and switch: git checkout -b <branch-name>
   |   |   - Inform user: "Created branch '<branch-name>' for this work"
   |   |   - Suggest: "Run /ceo-ralph:research to start the research phase."
   |   |
   |   +-- If user chooses 2 (worktree):
   |   |   - Generate branch name from spec name: feat/$specName
   |   |   - Determine worktree path: ../<repo-name>-<spec-name> or prompt user
   |   |   - Create worktree: git worktree add <path> -b <branch-name>
   |   |   - Inform user: "Created worktree at '<path>' on branch '<branch-name>'"
   |   |   - IMPORTANT: Suggest user to cd to worktree and resume conversation there:
   |   |     "For best results, cd to '<path>' and start a new Claude Code session from there."
   |   |     "Then run /ceo-ralph:research to begin."
   |   |   - STOP HERE - do not continue to Parse Arguments (user needs to switch directories)
   |   |
   |   +-- Continue to Parse Arguments
   |
   +-- ON NON-DEFAULT BRANCH (feature branch):
       |
       +-- Ask user for preference:
       |   "You are currently on branch '<current-branch>'.
       |    Would you like to:
       |    1. Continue working on this branch
       |    2. Create a new branch in current directory
       |    3. Create git worktree (separate directory)"
       |
       +-- If user chooses 1 (continue):
       |   - Stay on current branch
       |   - Suggest: "Run /ceo-ralph:research to start the research phase."
       |   - Continue to Parse Arguments
       |
       +-- If user chooses 2 (new branch):
       |   - Generate branch name from spec name: feat/$specName
       |   - If spec name not yet known, use temp name: feat/spec-work-<timestamp>
       |   - Create and switch: git checkout -b <branch-name>
       |   - Inform user: "Created branch '<branch-name>' for this work"
       |   - Suggest: "Run /ceo-ralph:research to start the research phase."
       |   - Continue to Parse Arguments
       |
       +-- If user chooses 3 (worktree):
           - Generate branch name from spec name: feat/$specName
           - Determine worktree path: ../<repo-name>-<spec-name> or prompt user
           - Create worktree: git worktree add <path> -b <branch-name>
           - Inform user: "Created worktree at '<path>' on branch '<branch-name>'"
           - IMPORTANT: Suggest user to cd to worktree and resume conversation there:
             "For best results, cd to '<path>' and start a new Claude Code session from there."
             "Then run /ceo-ralph:research to begin."
           - STOP HERE - do not continue to Parse Arguments (user needs to switch directories)
```

### Branch Naming Convention

When creating a new branch:
- Use format: `feat/<spec-name>` (e.g., `feat/user-auth`)
- If spec name contains special chars, sanitize to kebab-case
- If branch already exists, append `-2`, `-3`, etc.

Example:
```
Spec name: user-auth
Branch: feat/user-auth

If feat/user-auth exists:
Branch: feat/user-auth-2
```

### Worktree Details

When user chooses worktree option:

```bash
# Get repo name for path suggestion
REPO_NAME=$(basename $(git rev-parse --show-toplevel))

# Default worktree path
WORKTREE_PATH="../${REPO_NAME}-${SPEC_NAME}"

# Create worktree with new branch
git worktree add "$WORKTREE_PATH" -b "feat/${SPEC_NAME}"
```

After worktree creation:
- Inform user of the worktree path
- IMPORTANT: Output clear guidance for the user:
  ```
  Created worktree at '<path>' on branch '<branch-name>'

  For best results, cd to the worktree directory and start a new Claude Code session from there:

    cd <path>
    claude

  Then run /ceo-ralph:research to begin the research phase.
  ```
- STOP the command here - do not continue to Parse Arguments or create spec files
- The user needs to switch directories first to work in the worktree
- To clean up later: `git worktree remove <path>`

### Quick Mode Branch Handling

In `--quick` mode, still perform branch check but skip the user prompt for non-default branches:
- If on default branch: auto-create feature branch in current directory (no worktree prompt in quick mode)
- If on non-default branch: stay on current branch (no prompt, quick mode is non-interactive)

## Quick Mode Uses Codex Execution Loop

In quick mode (`--quick`), execution uses Codex MCP for task completion.

After generating spec artifacts in quick mode, invoke `/ceo-ralph:implement` to execute tasks with Codex.

<mandatory>
## CRITICAL: Delegation Requirement

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

You MUST delegate ALL substantive work to subagents. This is NON-NEGOTIABLE regardless of mode (normal or quick).

**NEVER do any of these yourself:**
- Write code or modify source files
- Perform research or analysis
- Generate spec artifacts (research.md, requirements.md, design.md, tasks.md)
- Execute task steps
- Run verification commands as part of task execution

**ALWAYS delegate to the appropriate subagent:**
| Work Type | Subagent |
|-----------|----------|
| Research | `research-analyst` |
| Requirements | `product-manager` |
| Design | `architect-reviewer` |
| Task Planning | `task-planner` |
| Artifact Generation (quick mode) | `plan-synthesizer` |
| Task Execution | `codex` via MCP |

Quick mode does NOT exempt you from delegation - it only skips interactive phases.
</mandatory>

<mandatory>
## CRITICAL: Stop After Each Subagent (Normal Mode)

In normal mode (no `--quick` flag), you MUST STOP your response after each subagent completes.

**After invoking a subagent via Task tool:**
1. Wait for subagent to return
2. Output a brief status message (e.g., "Research phase complete. Run /ceo-ralph:requirements to continue.")
3. **END YOUR RESPONSE IMMEDIATELY**

**DO NOT:**
- Automatically invoke the next phase
- Continue to other phases without user approval
- Include additional analysis or commentary
</mandatory>

## Parse Arguments

From `$ARGUMENTS`, extract:
- **name**: The spec name (optional, must be kebab-case, first argument)
- **goal**: Everything after the name except flags (optional)
- **--fresh**: Force new spec, overwrite if exists
- **--quick**: Skip interactive phases, auto-generate all specs, start execution immediately
- **--commit-spec**: Commit and push spec files after each phase
- **--no-commit-spec**: Disable committing spec files

Examples:
- `/ceo-ralph:start user-auth` -> name="user-auth", goal=none
- `/ceo-ralph:start user-auth Add OAuth2 login` -> name="user-auth", goal="Add OAuth2 login"
- `/ceo-ralph:start Add OAuth2 login --quick` -> name=auto, goal="Add OAuth2 login"
- `/ceo-ralph:start --fresh user-auth Add OAuth2 login` -> name="user-auth", goal="Add OAuth2 login", fresh

## Determine Mode

### 1. Resume Mode (no args)

If no arguments provided:
1. Check if `./specs/.current-spec` exists
2. If exists, read spec name and resume
3. If not exists, prompt user to create new spec

### 2. New Spec Mode

If arguments provided:
1. Parse name and goal
2. If name is missing, auto-generate from goal
3. If goal missing, ask user

## Commit Spec Setting

Determine commitSpec setting:
- If `--commit-spec` provided: true
- If `--no-commit-spec` provided: false
- Otherwise: default to true in normal mode, false in quick mode

Store in `.ralph-state.json` as `commitSpec`.

## Execution Flow

### Normal Mode (no --quick)

1. Create or resume spec
2. If new, start research phase
3. STOP after each phase for approval

### Quick Mode (--quick)

1. Create or resume spec
2. Auto-generate research, requirements, design, tasks via `plan-synthesizer`
3. Start execution immediately with `/ceo-ralph:implement`

## Output

Provide clear status and next steps:

```
Phase complete. Review ./specs/<spec>/<phase>.md
To continue: /ceo-ralph:<next-phase>
```

For quick mode, indicate automatic execution is starting.

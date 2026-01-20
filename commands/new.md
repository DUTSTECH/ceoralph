---
name: new
description: Create new spec, initiate research
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
timeout: 120000
---

# /ceo-ralph:new

Create a new specification and launch the research phase.

## Usage

```
/ceo-ralph:new <name> [goal]
/ceo-ralph:new <name> [goal] --skip-research
```

## Arguments

- `name` (required): Spec name in kebab-case (e.g., `user-auth`, `dark-mode-toggle`)
- `goal` (optional): Description of what you want to build. If not provided, will prompt.
- `--skip-research`: Skip research phase, go directly to requirements

## Examples

```
/ceo-ralph:new user-auth "Add JWT-based authentication"
/ceo-ralph:new dark-mode-toggle
/ceo-ralph:new payment-flow --skip-research
```

## Behavior

### 1. Argument Parsing

Extract from command arguments:
- Spec name (required, kebab-case)
- Goal description (optional)
- `--skip-research` flag

### 2. Goal Capture

If no goal provided in arguments:

```
What is the goal for this spec?
Describe what you want to build or achieve.
```

Store the response verbatim as the spec goal.

### 3. Validation

- Confirm spec name is valid kebab-case
- Check if spec already exists in `./specs/{name}/`
- If exists: offer to resume or overwrite

### 4. Directory Setup

Create spec directory structure:

```
./specs/{name}/
├── .ceo-ralph-state.json
├── .progress.md
└── (other files created by phases)
```

Update `./specs/.current-spec` with the new spec name.

Add to `.gitignore` if not present:
```
specs/*/.ceo-ralph-state.json
```

### 5. State Initialization

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
  "usage": {
    "claude": { "totalTokens": 0 },
    "codex": { "totalTokens": 0 }
  },
  "createdAt": "{ISO timestamp}",
  "updatedAt": "{ISO timestamp}"
}
```

If `--skip-research`, set `phase: "requirements"` instead.

### 6. Progress Documentation

Generate `.progress.md`:

```markdown
# Spec: {name}

## Goal

{original goal}

## Timeline

- Created: {timestamp}

## Completed Tasks

(none yet)

## Learnings

(none yet)

## Blockers

(none yet)
```

### 7. Phase Execution

**Standard flow** (no `--skip-research`):

Delegate to `research-analyst` agent:
- Investigate best practices
- Explore existing codebase patterns
- Assess feasibility
- Discover quality commands (lint, test, build)
- Output findings to `research.md`

**CRITICAL STOP POINT**: After research completes, STOP and wait for user review.
User must explicitly run `/ceo-ralph:requirements` to proceed.

**Skip-research flow** (`--skip-research`):

Delegate to `requirements-manager` agent to generate `requirements.md`.
Then STOP and wait for user approval.

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

Never write spec content yourself. Always delegate to appropriate agents:
- Research → `research-analyst`
- Requirements → `requirements-manager`
- Design → `design-architect`
- Tasks → `task-planner`
- Execution → delegate to Codex via MCP

## Output

```markdown
## CEO Ralph: New Spec Created

**Name**: {specName}
**Goal**: {goal}

Spec directory created at `./specs/{name}/`

{If standard mode}
Starting research phase...

{After research completes}
Research complete. Review `./specs/{name}/research.md`

To approve and continue: `/ceo-ralph:requirements`
To revise research: Provide feedback and run `/ceo-ralph:research`

{If skip-research mode}
Skipping research, starting requirements phase...

{After requirements complete}
Requirements complete. Review `./specs/{name}/requirements.md`

To approve and continue: `/ceo-ralph:design`
```

## Error Handling

| Error | Action |
|-------|--------|
| Invalid spec name | Ask for valid kebab-case name |
| Spec exists | Offer resume or overwrite options |
| Empty goal | Prompt for goal description |
| Agent failure | Report error, allow retry |

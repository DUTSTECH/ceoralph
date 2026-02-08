---
name: codex-delegation
description: How to delegate implementation tasks to workers via Codex MCP or Task sub-agents. Use when executing tasks that require code implementation.
---

# Worker Delegation Skill

This skill defines how the CEO (Claude) delegates tasks to workers. Workers can be either Codex MCP (GPT) or Claude Task sub-agents.

## Executor Selection

The executor is determined by priority:
1. `--executor` argument (explicit override)
2. `./specs/.ralph-executor.json` (saved config from `/ceo-ralph:setup`)
3. Runtime detection: check if `mcp__codex__codex` tool exists
4. Default: `auto` (try Codex, fall back to Task)

### Codex MCP Executor
- Tool: `mcp__codex__codex`
- Runs GPT models in a sandboxed environment
- Best for: code generation, file manipulation
- Requires: Codex CLI installed + authenticated

### Task Sub-agent Executor
- Tool: `Task` with `subagent_type: "general-purpose"`
- Runs Claude sub-agents (model: sonnet)
- Best for: when Codex is unavailable, or for Claude-native tasks
- Requires: nothing (built into Claude Code)

## When to Delegate

Delegate to workers when:
- Task is implementation-focused (writing code)
- Task has clear acceptance criteria
- Task doesn't require strategic decisions
- Task is scoped to specific files

Do NOT delegate when:
- Task requires architecture decisions
- Task is a [VERIFY] checkpoint (delegate to qa-engineer instead)
- Task requires user interaction
- Task involves research or analysis

## Preparing Context Packages

### Minimal Context Package

```json
{
  "taskId": "1.1",
  "task": {
    "title": "Task title",
    "do": "What to do",
    "doneWhen": "Completion criteria",
    "acceptance": ["Criterion 1", "Criterion 2"]
  }
}
```

### Full Context Package

```json
{
  "taskId": "1.1",
  "task": {
    "title": "Implement user login form",
    "do": "Create login form component at src/components/Login.tsx",
    "doneWhen": "Form renders with email/password fields and validation",
    "acceptance": [
      "Form has email input with validation",
      "Form has password input with masking",
      "Submit button triggers onSubmit handler",
      "Shows validation errors"
    ]
  },
  "files": {
    "src/components/Form.tsx": {
      "path": "src/components/Form.tsx",
      "content": "// Existing form component for reference...",
      "language": "typescript",
      "relevantSections": [
        { "startLine": 10, "endLine": 50, "description": "Form pattern" }
      ]
    }
  },
  "design": {
    "architecture": "React functional component with hooks",
    "patterns": ["controlled inputs", "form validation", "error display"]
  },
  "constraints": [
    "Follow existing Form component pattern",
    "Use project's validation library (zod)",
    "Match existing styling approach"
  ],
  "workingDirectory": "/path/to/project",
  "commitPrefix": "feat(auth)"
}
```

## Context Optimization

### File Selection

1. Include files directly mentioned in task
2. Include pattern files from same directory
3. Include type definitions if TypeScript
4. Limit to ~5 files maximum
5. Use relevant sections, not entire files

### Context Pruning

If context is too large:
1. Extract only relevant functions/classes
2. Remove comments and whitespace
3. Summarize repetitive patterns
4. Reference design.md instead of repeating

## Delegation Protocol

### Step 1: Prepare

```markdown
I am preparing to delegate Task {id} to a worker.

**Task**: {title}
**Executor**: {codex|task-agent}
**Files to include**: {list}
**Constraints**: {list}
```

### Step 2: Delegate

**Codex MCP:**
```
mcp__codex__codex({
  prompt: "<spec-executor instructions>\n\nTask: <task block>\n\nContext: <files>",
  sandbox: "workspace-write"
})
```

**Task sub-agent:**
```
Task({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "<spec-executor instructions>\n\nTask: <task block>\n\nContext: <files>\n\nIMPORTANT: Output TASK_COMPLETE when done."
})
```

### Step 3: Monitor

```markdown
[<executor>] Task {id} delegated.
Status: {pending|running|completed|failed}
```

### Step 4: Receive

```markdown
Received result from worker.
Signal: {TASK_COMPLETE|TASK_BLOCKED|NO_SIGNAL}
Files modified: {count}
```

## Handling Worker Output

### On TASK_COMPLETE

1. Parse file modifications
2. Verify "Done when" criteria
3. Update delegation log
4. Proceed to next task

### On TASK_BLOCKED

1. Read block reason
2. Assess if CEO can unblock
3. If yes: Provide guidance and retry
4. If no: Escalate to user

### On NO_SIGNAL

1. Check if output looks complete
2. If yes: Treat as soft completion, verify carefully
3. If no: Retry with explicit signal instruction

## Retry Strategy

When retrying:

```json
{
  "previousAttempts": [
    {
      "attempt": 1,
      "executor": "codex",
      "feedback": "Missing validation on email field",
      "issues": [
        "Email input lacks validation",
        "Error messages not displayed"
      ]
    }
  ]
}
```

### Feedback Quality

Good feedback:
- "In Login.tsx line 23, add email regex validation"
- "The onSubmit handler doesn't prevent default"

Bad feedback:
- "Fix the validation"
- "It doesn't work"

## Delegation Logging

Every worker dispatch is logged to `./specs/$spec/.ralph-delegation.json`. See `schemas/delegation.schema.json` for the full schema.

Each worker entry tracks:
- Worker ID, task ID, executor type
- Start/complete timestamps, duration
- Result signal, summary, files changed
- Commit hash

Aggregate stats are updated after each worker completes.

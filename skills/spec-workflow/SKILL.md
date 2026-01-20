---
name: spec-workflow
description: Spec-driven development workflow for systematic feature development. Use when starting a new feature to ensure proper research, requirements, design, tasks, and execution phases.
---

# Spec-Driven Workflow Skill

## Overview

This skill defines the spec-driven development workflow that CEO Ralph follows for all feature development. It ensures systematic progression through research, requirements, design, tasks, and execution phases.

## Workflow Phases

### Phase 1: Research (`/ceo-ralph:research`)
- Gather context about the problem domain
- Identify constraints and existing patterns
- Document findings in `research.md`

### Phase 2: Requirements (`/ceo-ralph:requirements`)
- Define functional and non-functional requirements
- Identify acceptance criteria
- Document in `requirements.md`

### Phase 3: Design (`/ceo-ralph:design`)
- Create technical design based on requirements
- Define architecture and interfaces
- Document in `design.md`

### Phase 4: Tasks (`/ceo-ralph:tasks`)
- Break design into executable tasks
- Identify dependencies and ordering
- Document in `tasks.md`

### Phase 5: Execute (`/ceo-ralph:execute`)
- Implement tasks via Codex delegation
- Apply 4-layer verification
- Track progress in task list

## Task Notation

### Priority Markers
- `[P]` - Parallel task (can run concurrently)
- `[VERIFY]` - Verification checkpoint (must pass before continuing)
- `[POC]` - Proof of concept (validate approach first)
- `[CRITICAL]` - Critical path task (blockers for other tasks)

### Status Markers
- `[ ]` - Not started
- `[x]` - Completed
- `[~]` - In progress
- `[!]` - Blocked

## Verification Rules

### 4-Layer Verification
1. **Syntax Check**: Code compiles/parses without errors
2. **Type Check**: Type safety verified (if applicable)
3. **Unit Tests**: Tests pass for the specific change
4. **Integration Check**: Works with existing code

### Verification Triggers
- After each task completion
- Before moving to next phase
- On `[VERIFY]` checkpoints
- Before final feature merge

## POC-First Workflow

For uncertain implementations:

1. **Identify Uncertainty**: Mark task as `[POC]`
2. **Minimal Implementation**: Build smallest viable test
3. **Validate Approach**: Run POC to confirm feasibility
4. **Full Implementation**: Only proceed if POC succeeds
5. **Cleanup**: Remove POC scaffolding if needed

## Dependency Management

### Dependency Notation in tasks.md
```markdown
- [ ] Task A (no deps)
- [ ] Task B (depends: Task A)
- [P] Task C (no deps - can parallel)
- [P] Task D (no deps - can parallel)
- [ ] Task E (depends: Task C, Task D)
```

### Execution Order
1. Identify tasks with no dependencies
2. Execute in parallel where `[P]` marked
3. Wait for dependencies before dependent tasks
4. Block on `[VERIFY]` until verification passes

## Intent Matching

This skill activates when user intent matches:
- "implement feature"
- "build new functionality"
- "develop this"
- "create feature"
- "add capability"
- "start project"
- "full development cycle"

## Integration with Codex

When delegating to Codex via MCP:
1. Build context package from current phase docs
2. Include relevant verification criteria
3. Stream progress updates
4. Validate output against 4-layer verification
5. Update phase documents with results

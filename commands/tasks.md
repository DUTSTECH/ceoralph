---
name: tasks
description: Break design into executable tasks
allowed-tools: Read, Write, Edit, Glob, Grep, mcp__codex__codex
timeout: 300000
---

# /ceo-ralph:tasks

Break design into executable tasks.

## Usage

```
/ceo-ralph:tasks
```

## Prerequisites

- Design phase complete
- `design.md` exists in spec directory
- State shows phase is ready for task planning

## Behavior

1. Load state and verify design complete
2. Read all spec files (research, requirements, design)
3. Delegate to `task-planner` agent
4. Task planner produces:
   - POC-first ordered task list
   - Parallel task identification [P]
   - Verification checkpoints [VERIFY]
   - Task dependencies
   - Requirements traceability
5. Output `tasks.md` to spec directory
6. Update state with task count
7. Present summary for approval

## Agent Delegation

```markdown
Delegate to: task-planner

Context:
- Spec name: {specName}
- Research: {contents of research.md}
- Requirements: {contents of requirements.md}
- Design: {contents of design.md}

Instructions:
Follow the task-planner agent protocol to break the design
into executable tasks using POC-first methodology.
```

## Output

```markdown
## 📝 Task Planning Complete

**Spec**: {specName}
**Duration**: {time}

### Task Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: POC | {n} | {m} |
| Phase 2: Refactoring | {n} | {m} |
| Phase 3: Testing | {n} | {m} |
| Phase 4: Quality Gates | {n} | 0 |
| **Total** | **{total}** | **{parallel}** |

### Task Overview

#### Phase 1: Make It Work
- [ ] 1.1 {task title}
- [ ] 1.2 {task title}
- [ ] 1.3 [VERIFY] POC Checkpoint

#### Phase 2: Refactoring
- [ ] 2.1 {task title}
- [ ] 2.2 [P] {parallel task}
- [ ] 2.3 [P] {parallel task}

#### Phase 3: Testing
- [ ] 3.1 {task title}
- [ ] 3.2 {task title}

#### Phase 4: Quality Gates
- [ ] 4.1 [VERIFY] Lint
- [ ] 4.2 [VERIFY] Types
- [ ] 4.3 [VERIFY] Tests
- [ ] 4.4 [VERIFY] [CRITICAL] Build

### Estimated Execution

- **Sequential time**: ~{estimate}
- **With parallelization**: ~{estimate}
- **Codex workers needed**: {max parallel}

---

**Status**: Awaiting Approval

Review `./specs/{specName}/tasks.md` for full details.

✅ To approve and start execution: `/ceo-ralph:execute`
❌ To request changes: Provide feedback and run `/ceo-ralph:tasks` again
```

## State Updates

```json
{
  "phase": "tasks",
  "awaitingApproval": true,
  "totalTasks": {count},
  "completedTasks": 0,
  "updatedAt": "{timestamp}"
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Design not complete | Prompt to complete design first |
| Too many tasks | Break into smaller specs, suggest splitting |
| Circular dependencies | Reorder tasks, report issue |

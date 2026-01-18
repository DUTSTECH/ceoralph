# CEO Ralph Workflow Guide

## Overview

CEO Ralph follows a structured workflow with 5 phases, each producing artifacts that inform the next phase.

```
Feature Idea → Research → Requirements → Design → Tasks → Execution → Done!
```

## Phase 1: Research

### Purpose

Gather all information needed to make informed decisions about the feature.

### What Happens

1. **External Research**: Web search for best practices, patterns, known issues
2. **Internal Research**: Explore codebase for existing patterns and constraints
3. **Quality Discovery**: Find lint, test, build commands
4. **Feasibility Assessment**: Evaluate viability and effort

### Command

```bash
/ceo-ralph:start my-feature "Description of what you want to build"
/ceo-ralph:research
```

### Output: `research.md`

```markdown
# Research: my-feature

## Executive Summary
Brief overview of findings...

## External Research
Best practices from the community...

## Internal Research
Patterns found in your codebase...

## Quality Commands
{
  "lint": "npm run lint",
  "test": "npm test",
  "build": "npm run build"
}

## Feasibility Assessment
| Aspect | Assessment |
|--------|------------|
| Technical Viability | High |
| Effort Estimate | M |
| Risk Level | Low |
```

### Approval

Review `research.md` and either:
- Approve: Run `/ceo-ralph:requirements`
- Request changes: Provide feedback and run `/ceo-ralph:research` again

## Phase 2: Requirements

### Purpose

Define clear, testable requirements that capture what needs to be built.

### What Happens

1. **User Stories**: Create user-centric requirement descriptions
2. **Acceptance Criteria**: Define testable criteria for each requirement
3. **Edge Cases**: Identify error scenarios and edge conditions
4. **Prioritization**: Rank requirements by importance

### Command

```bash
/ceo-ralph:requirements
```

### Output: `requirements.md`

```markdown
# Requirements: my-feature

## Functional Requirements

### FR-1: User Login
**As a** user
**I want** to log in with email and password
**So that** I can access my account

**Acceptance Criteria**:
- [ ] AC-1.1: User can enter email and password
- [ ] AC-1.2: System validates credentials
- [ ] AC-1.3: User receives JWT on success
- [ ] AC-1.4: User sees error on failure

### FR-2: ...
```

### Approval

Review and approve or request changes.

## Phase 3: Design

### Purpose

Create technical design that guides implementation.

### What Happens

1. **Architecture**: Define system structure
2. **Components**: Design individual components
3. **APIs**: Define interfaces and contracts
4. **Decisions**: Document technical choices with rationale

### Command

```bash
/ceo-ralph:design
```

### Output: `design.md`

```markdown
# Technical Design: my-feature

## Architecture Diagram
```
┌─────────┐     ┌─────────┐
│  Login  │────▶│  Auth   │
│  Form   │     │ Service │
└─────────┘     └─────────┘
```

## Components

### Component: LoginForm
**Purpose**: Render login form and handle submission
**Location**: src/components/LoginForm.tsx
**Pattern**: React functional component with hooks
...

## Technical Decisions

### TD-1: JWT Storage
**Decision**: Store JWT in httpOnly cookie
**Rationale**: More secure than localStorage
...
```

### Approval

Review and approve or request changes.

## Phase 4: Tasks

### Purpose

Break design into atomic, executable tasks.

### What Happens

1. **POC-First Ordering**: "Make it work" before "make it right"
2. **Parallel Identification**: Mark independent tasks with [P]
3. **Checkpoints**: Insert [VERIFY] tasks for quality gates
4. **Dependencies**: Map task dependencies

### Command

```bash
/ceo-ralph:tasks
```

### Output: `tasks.md`

```markdown
# Tasks: my-feature

## Phase 1: Make It Work (POC)

- [ ] 1.1 Create LoginForm component
  - **Do**: Create basic form with email/password fields
  - **Files**: src/components/LoginForm.tsx
  - **Done when**: Form renders and captures input
  - **Worker**: codex

- [ ] 1.2 Implement auth service
  - **Do**: Create service to call login API
  - **Files**: src/services/auth.ts
  - **Done when**: Service can make API call
  - **Worker**: codex

- [ ] 1.3 [VERIFY] POC Checkpoint
  - **Do**: Verify basic login flow works
  - **Worker**: ceo

## Phase 2: Refactoring
...

## Phase 3: Testing
...

## Phase 4: Quality Gates
- [ ] 4.1 [VERIFY] Lint
- [ ] 4.2 [VERIFY] Types
- [ ] 4.3 [VERIFY] Tests
- [ ] 4.4 [VERIFY] [CRITICAL] Build
```

### Approval

This is the last approval before code execution begins.

## Phase 5: Execution

### Purpose

Implement all tasks using Codex workers under CEO supervision.

### What Happens

For each task:
1. **Prepare**: Build context package with task + relevant files
2. **Delegate**: Send to Codex worker via MCP
3. **Receive**: Get implementation result
4. **Review**: CEO reviews output quality
5. **Verify**: Run 4-layer verification
6. **Mark Complete**: Update tasks.md, commit, continue

### Command

```bash
/ceo-ralph:execute
```

### During Execution

```markdown
## ⚡ Execution In Progress

**Spec**: my-feature
**Progress**: 3/14 tasks (21%)

### Current Task
**1.3**: [VERIFY] POC Checkpoint
**Status**: Running verification

### Recent Activity
| Time | Task | Status |
|------|------|--------|
| 2m ago | 1.2 | ✓ Completed |
| 5m ago | 1.1 | ✓ Completed |
```

### Completion

```markdown
## 🎉 ALL_TASKS_COMPLETE

**Spec**: my-feature
**Duration**: 45 minutes

### Quality Gates
- [x] Lint: PASS
- [x] Types: PASS
- [x] Tests: PASS
- [x] Build: PASS

### Token Usage
| Model | Tokens |
|-------|--------|
| Claude | 12,450 |
| Codex | 38,200 |
```

## Quick Mode

Skip all approval gates:

```bash
/ceo-ralph:start "Add dark mode toggle" --quick
```

Quick mode:
- Auto-generates all phase artifacts
- Proceeds directly to execution
- Still pauses on errors/escalations

## Monitoring & Control

### Check Status

```bash
/ceo-ralph:status
```

### Pause Execution

```bash
/ceo-ralph:pause "Need to review something"
```

### Resume

```bash
/ceo-ralph:resume
```

### Cancel

```bash
/ceo-ralph:cancel
```

## Best Practices

### Writing Good Goals

✅ Good: "Add user authentication with email/password login, JWT tokens, and password reset"

❌ Bad: "Add auth"

### Reviewing Phase Outputs

1. Read the full document, not just summary
2. Check for missing edge cases
3. Verify alignment with your vision
4. Provide specific feedback if changes needed

### During Execution

1. Monitor progress with `/ceo-ralph:status`
2. Don't interrupt mid-task if possible
3. Use `/ceo-ralph:pause` for breaks
4. Review escalations promptly

### After Completion

1. Review `.progress.md` for execution details
2. Check all generated code
3. Run manual testing
4. Clean up spec files if desired

---
description: Create technical design from requirements
argument-hint: [spec-name]
allowed-tools: [Read, Write, Edit, Glob, Grep, Task]
---

# /ceo-ralph:design

Create technical design from requirements.

## Usage

```
/ceo-ralph:design
```

## Prerequisites

- Requirements phase complete
- `requirements.md` exists in spec directory
- State shows phase is ready for design

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

Never write designs yourself. Delegate to the `architect-reviewer` agent.

## Behavior

1. Load state and verify requirements complete
2. Read `research.md` and `requirements.md`
3. Delegate to `architect-reviewer` agent
4. Architect reviewer produces:
   - Architecture overview with diagram
   - Component designs with interfaces
   - Data flow documentation
   - API designs (if applicable)
   - Technical decisions with rationale
   - File structure plan
   - Testing strategy
5. Output `design.md` to spec directory
6. Update state: `phase: "design"`, `awaitingApproval: true`
7. Present summary for approval

## Agent Delegation

```markdown
Delegate to: architect-reviewer

Context:
- Spec name: {specName}
- Research: {contents of research.md}
- Requirements: {contents of requirements.md}

Instructions:
Follow the architect-reviewer agent protocol to create
a technical design that fulfills the requirements.
```

## Output

```markdown
## 🏗️ Design Phase Complete

**Spec**: {specName}
**Duration**: {time}

### Architecture Overview

```
{ASCII architecture diagram}
```

### Components

| Component | Purpose | Files |
|-----------|---------|-------|
| {name} | {purpose} | {files} |
| {name} | {purpose} | {files} |

### Key Technical Decisions

1. **TD-1**: {decision title}
   - Choice: {what was chosen}
   - Rationale: {why}

2. **TD-2**: {decision title}
   - Choice: {what was chosen}
   - Rationale: {why}

### File Structure

```
{planned file structure}
```

### Requirements Coverage

| Requirement | Components |
|-------------|------------|
| FR-1 | {components} |
| FR-2 | {components} |

---

**Status**: Awaiting Approval

Review `./specs/{specName}/design.md` for full details.

✅ To approve and continue: `/ceo-ralph:tasks`
❌ To request changes: Provide feedback and run `/ceo-ralph:design` again
```

## State Updates

```json
{
  "phase": "design",
  "awaitingApproval": true,
  "updatedAt": "{timestamp}"
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Requirements not complete | Prompt to complete requirements first |
| Conflicting requirements | Note in design, include trade-off decisions |
| Missing patterns in codebase | Research external patterns, document decision |

---
description: Generate requirements from the research phase
argument-hint: [spec-name]
allowed-tools: [Read, Write, Edit, Glob, Grep, Task, AskUserQuestion]
---

# /ceo-ralph:requirements

Generate requirements from the research phase.

## Usage

```
/ceo-ralph:requirements
```

## Prerequisites

- Research phase complete
- `research.md` exists in spec directory
- State shows `awaitingApproval: true` for research OR research is approved

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT AN IMPLEMENTER.**

Never write requirements yourself. Delegate to the `product-manager` agent.

## Behavior

1. Load state and verify research is complete
2. Read `research.md` for context
3. Delegate to `product-manager` agent
4. Product manager produces:
   - Functional requirements with user stories
   - Acceptance criteria for each requirement
   - Edge cases and error scenarios
   - Non-functional requirements
   - Out of scope definition
5. Output `requirements.md` to spec directory
6. Update state: `phase: "requirements"`, `awaitingApproval: true`
7. Present summary for approval

## Agent Delegation

```markdown
Delegate to: product-manager

Context:
- Spec name: {specName}
- Original goal: {goal}
- Research: {contents of research.md}

Instructions:
Follow the product-manager agent protocol to create
detailed requirements from the research findings.
```

## Output

```markdown
## 📋 Requirements Phase Complete

**Spec**: {specName}
**Duration**: {time}

### Requirements Summary

| Priority | Count | Coverage |
|----------|-------|----------|
| P0 - Critical | {n} | {description} |
| P1 - High | {n} | {description} |
| P2 - Medium | {n} | {description} |
| P3 - Low | {n} | {description} |

### Key Functional Requirements

1. **FR-1**: {title}
   - {key acceptance criterion}
   
2. **FR-2**: {title}
   - {key acceptance criterion}

{...more...}

### Out of Scope
{What's explicitly NOT being built}

### Open Questions
{Questions needing user input}

---

**Status**: Awaiting Approval

Review `./specs/{specName}/requirements.md` for full details.

✅ To approve and continue: `/ceo-ralph:design`
❌ To request changes: Provide feedback and run `/ceo-ralph:requirements` again
```

## State Updates

```json
{
  "phase": "requirements",
  "awaitingApproval": true,
  "updatedAt": "{timestamp}"
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Research not complete | Prompt to complete research first |
| Research.md missing | Prompt to run `/ceo-ralph:research` |
| Ambiguous goal | Include open questions, proceed |

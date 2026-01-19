---
name: research
description: Run the research phase for the current spec
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, mcp__codex__codex
timeout: 300000
---

# /ceo-ralph:research

Run the research phase for the current spec.

## Usage

```
/ceo-ralph:research
```

## Prerequisites

- Active spec exists (run `/ceo-ralph:start` first)
- State shows `phase: "research"` or is starting fresh

## Behavior

1. Load state from `.ceo-ralph-state.json`
2. Delegate to `research-analyst` agent
3. Research analyst performs:
   - External research (web search for best practices)
   - Internal research (codebase exploration)
   - Related specs discovery
   - Quality command discovery
   - Feasibility assessment
4. Output `research.md` to spec directory
5. Update state: `awaitingApproval: true`
6. Present summary for approval

## Agent Delegation

```markdown
Delegate to: research-analyst

Context:
- Spec name: {specName}
- Goal: {original goal}
- Working directory: {project root}

Instructions:
Follow the research-analyst agent protocol to investigate
this feature request and produce research.md.
```

## Output

```markdown
## 📊 Research Phase Complete

**Spec**: {specName}
**Duration**: {time}

### Executive Summary
{2-3 sentence summary from research.md}

### Feasibility Assessment
| Aspect | Assessment |
|--------|------------|
| Technical Viability | {High/Med/Low} |
| Effort Estimate | {S/M/L/XL} |
| Risk Level | {High/Med/Low} |

### Quality Commands Discovered
- Lint: `{command}`
- Test: `{command}`
- Build: `{command}`

### Open Questions
{Questions needing user input}

---

**Status**: Awaiting Approval

Review `./specs/{specName}/research.md` for full details.

✅ To approve and continue: `/ceo-ralph:requirements`
❌ To request changes: Provide feedback and run `/ceo-ralph:research` again
```

## State Updates

```json
{
  "phase": "research",
  "awaitingApproval": true,
  "qualityCommands": {
    "lint": "{discovered}",
    "test": "{discovered}",
    "build": "{discovered}"
  },
  "updatedAt": "{timestamp}"
}
```

## Error Handling

| Error | Action |
|-------|--------|
| No active spec | Prompt to run `/ceo-ralph:start` |
| Web search fails | Continue with internal research only, note limitation |
| Codebase too large | Sample key directories, note limitation |

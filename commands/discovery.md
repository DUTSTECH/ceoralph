---
description: Run merged discovery phase (research + requirements)
argument-hint: [spec-name] [--lite]
allowed-tools: [Read, Write, Task, Bash, AskUserQuestion]
---

# /ceo-ralph:discovery

Generate a single discovery.md that merges research and requirements.

<mandatory>
**YOU ARE A COORDINATOR, NOT A RESEARCHER OR PM.**
You MUST delegate all research and requirements work to subagents.
</mandatory>

## Determine Active Spec

1. If `$ARGUMENTS` contains a spec name, use that
2. Otherwise, read `./specs/.current-spec` to get active spec
3. If no active spec, error: "No active spec. Run /ceo-ralph:new <name> first."

## Validate

1. Check `./specs/$spec/` directory exists
2. Read `.ralph-state.json` if it exists
3. Read `.progress.md` to understand the goal

## Interview

<mandatory>
Skip interview if `--lite` or `--quick` flag detected in `$ARGUMENTS`.
</mandatory>

Use AskUserQuestion to gather constraints and priorities (short):

```
AskUserQuestion:
  questions:
    - question: "Any critical constraints or non-negotiables?"
      options:
        - "None"
        - "Security/compliance"
        - "Performance/latency"
        - "Backward compatibility"
        - "Other"
    - question: "Primary users?"
      options:
        - "Internal developers"
        - "End users"
        - "Both"
        - "Other"
```

## Execute Discovery (Merged)

<mandatory>
Spawn subagents in parallel for research inputs, then a product-manager to synthesize discovery.md.
</mandatory>

### Step 1: Parallel research inputs

Spawn 2-3 subagents in ONE message:

- Explore (codebase patterns) → `./specs/$spec/.research-codebase.md`
- research-analyst (web best practices) → `./specs/$spec/.research-external.md`
- Explore (quality commands) → `./specs/$spec/.research-quality.md`

### Step 2: Synthesize discovery.md

Use `product-manager` subagent with prompt:

```
You are generating discovery.md for spec: $spec
Spec path: ./specs/$spec/

Inputs:
- Original goal (from .progress.md)
- .research-external.md (if exists)
- .research-codebase.md (if exists)
- .research-quality.md (if exists)
- Interview context (if collected)

Your task:
1. Merge research + requirements into a single ./specs/$spec/discovery.md
2. Include: Goal, Constraints, Research Summary, Principles, User Stories + ACs, FR/NFR, Risks, Dependencies, Quality Commands, Out of Scope
3. Keep it concise and structured
4. Append learnings to .progress.md
5. Set awaitingApproval = true in .ralph-state.json
```

## Output

After completion:
- Inform the user discovery.md is ready
- Instruct to run `/ceo-ralph:plan` next

<mandatory>
STOP after output.
</mandatory>

---
description: Generate merged execution plan (design summary + tasks)
argument-hint: [spec-name] [--lite]
allowed-tools: [Read, Write, Task, Bash, AskUserQuestion]
---

# /ceo-ralph:plan

Generate a merged execution plan: a short design summary plus tasks.md.

<mandatory>
**YOU ARE A COORDINATOR, NOT AN ARCHITECT OR TASK PLANNER.**
Delegate design and task planning to subagents.
</mandatory>

## Determine Active Spec

1. If `$ARGUMENTS` contains a spec name, use that
2. Otherwise, read `./specs/.current-spec` to get active spec
3. If no active spec, error: "No active spec. Run /ceo-ralph:new <name> first."

## Validate

1. Check `./specs/$spec/` directory exists
2. If NOT `--lite`, require `./specs/$spec/discovery.md` (else: "Discovery not found. Run /ceo-ralph:discovery first.")
3. Read `.ralph-state.json`
4. Clear approval flag: set `awaitingApproval: false`

## Interview

<mandatory>
Skip interview if `--lite` or `--quick` flag detected in `$ARGUMENTS`.
</mandatory>

Ask for execution constraints:

```
AskUserQuestion:
  questions:
    - question: "Testing depth?"
      options:
        - "Standard (unit + integration)"
        - "Minimal (POC only)"
        - "Comprehensive (include E2E)"
        - "Other"
```

## Execute Plan

### Lite Mode (`--lite`)

Use `task-planner` to generate a concise tasks.md only (short design summary at top):

```
You are generating tasks.md for spec: $spec
Spec path: ./specs/$spec/

Context:
- discovery.md (if exists)
- .progress.md
- Interview context (if any)

Your task:
1. Produce ./specs/$spec/tasks.md with a short Design Summary section at top
2. Keep design summary to ~8-12 bullet lines
3. Create POC-first tasks with Verify commands (no manual verification)
4. Reference Principles (P-#) and Requirements (FR/AC) from discovery.md if present; otherwise infer from goal
5. Append learnings to .progress.md
```

### Full Mode (default)

Step 1: Use `architect-reviewer` to produce a short design summary:

```
Create ./specs/$spec/.design-summary.md
- 1-2 paragraph overview
- Components/interfaces (bullets)
- Data flow (bullets)
- Key decisions and risks
Keep it concise and executable.
```

Step 2: Use `task-planner` to produce tasks.md using discovery + design summary:

```
You are generating tasks.md for spec: $spec
Spec path: ./specs/$spec/

Context:
- discovery.md
- .design-summary.md
- .progress.md
- Interview context (if any)

Your task:
1. Produce ./specs/$spec/tasks.md with the design summary at top
2. Create POC-first tasks with Verify commands (no manual verification)
3. Reference Principles (P-#) and Requirements (FR/AC)
4. Append learnings to .progress.md
```

## Output

After completion:
- Inform the user tasks.md is ready
- Next command: `/ceo-ralph:implement`

<mandatory>
STOP after output.
</mandatory>

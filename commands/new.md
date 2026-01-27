---
description: Create new spec and start discovery phase
argument-hint: <spec-name> [goal description] [--lite]
allowed-tools: [Bash, Write, Task, AskUserQuestion]
---

# Create New Spec

You are creating a new specification and starting the discovery phase.

## Parse Arguments

From `$ARGUMENTS`, extract:
- **name**: The spec name (required, must be kebab-case, first argument)
- **goal**: Everything after the name except flags (optional)
- **--lite**: If present, skip discovery and jump to a short plan + tasks

Examples:
- `/ceo-ralph:new user-auth` -> name="user-auth", goal=none
- `/ceo-ralph:new user-auth Add OAuth2 login` -> name="user-auth", goal="Add OAuth2 login"
- `/ceo-ralph:new user-auth --lite` -> name="user-auth", goal=none, lite mode

## Capture Goal

<mandatory>
The goal MUST be captured before proceeding:

1. If goal text was provided in arguments, use it
2. If NO goal text provided, use AskUserQuestion to ask:
   "What is the goal for this spec? Describe what you want to build or achieve."
3. Store the goal verbatim in .progress.md under "Original Goal"
</mandatory>

## Validation

1. Verify spec name is provided
2. Verify spec name is kebab-case (lowercase, hyphens only)
3. Check if `./specs/$name/` already exists. If so, ask user if they want to resume or overwrite

## Initialize

1. Create directory structure:
   ```bash
   mkdir -p ./specs/$name
   ```

2. Update active spec tracker:
   ```bash
   echo "$name" > ./specs/.current-spec
   ```

3. Ensure gitignore entries exist for spec state files:
   ```bash
   # Add .current-spec and .progress.md to .gitignore if not already present
   if [ -f .gitignore ]; then
     grep -q "specs/.current-spec" .gitignore || echo "specs/.current-spec" >> .gitignore
     grep -q "\*\*/\.progress\.md" .gitignore || echo "**/.progress.md" >> .gitignore
   else
     echo "specs/.current-spec" > .gitignore
     echo "**/.progress.md" >> .gitignore
   fi
   ```

4. Create `.ralph-state.json` in the spec directory:
   ```json
   {
     "source": "spec",
     "name": "$name",
     "basePath": "./specs/$name",
     "phase": "discovery",
     "taskIndex": 0,
     "totalTasks": 0,
     "taskIteration": 1,
     "maxTaskIterations": 5,
     "globalIteration": 1,
     "maxGlobalIterations": 100
   }
   ```

   If `--lite`, set `"phase": "plan"` instead.

5. Create initial `.progress.md` with the captured goal:
   ```markdown
   ---
   spec: $name
   phase: discovery
   task: 0/0
   updated: <current timestamp>
   ---

   # Progress: $name

   ## Original Goal

   $goal

   ## Completed Tasks

   _No tasks completed yet_

   ## Current Task

   Starting discovery phase

   ## Learnings

   _Discoveries and insights will be captured here_

   ## Blockers

   - None currently

   ## Next

   Complete discovery, then proceed to plan
   ```

6. If any of the files above are missing after creation, create empty stubs so subsequent phases never fail on missing files:
   - `.ralph-state.json`
   - `.progress.md`

## Execute Discovery Phase

If NOT `--lite`:

<mandatory>
Use the Task tool to run `/ceo-ralph:discovery` (merged research + requirements).
</mandatory>

Invoke the discovery command flow to generate `./specs/$name/discovery.md`.

The agent will:
1. Research external best practices and internal patterns
2. Define requirements with acceptance criteria
3. Create discovery.md with merged findings and requirements

After research completes:

<mandatory>
**STOP HERE. DO NOT PROCEED TO PLAN.**

(This does not apply in `--quick` mode, which auto-generates all artifacts without stopping.)

After displaying the output, you MUST:
1. End your response immediately
2. Wait for the user to review discovery.md
3. Only proceed when user explicitly runs `/ceo-ralph:plan`

DO NOT automatically invoke the product-manager or run the requirements phase.
The user needs time to review research findings before proceeding.
</mandatory>

## Execute Lite Plan (if --lite)

If `--lite` was specified:

<mandatory>
Use the Task tool with `subagent_type: task-planner` to generate tasks.md directly.
</mandatory>

Invoke task-planner agent with:
- The user's goal/feature description
- The spec name and path
- Instructions to output `./specs/$name/tasks.md` with a short design summary at top

## Output

After completion, inform the user:

```
Spec '$name' created at ./specs/$name/

Current phase: discovery (or plan if lite)

Next steps:
- Review the generated discovery.md (or tasks.md if lite)
- Run /ceo-ralph:plan to proceed (or /ceo-ralph:implement if lite)
```

<mandatory>
**STOP AFTER DISPLAYING OUTPUT.**

(This does not apply in `--quick` mode, which auto-generates all artifacts without stopping.)

Do NOT proceed to the next phase automatically.
Wait for explicit user command to continue.
</mandatory>

---
description: Refactor spec files after implementation changes
argument-hint: [--file=requirements|design|tasks]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task, AskUserQuestion]
---

# /ceo-ralph:refactor

Systematically update specification files after implementation work.

## Usage

```
/ceo-ralph:refactor [--file=<file>]
```

## Arguments

- `--file` (optional): Specific file to refactor. Values: `requirements`, `design`, `tasks`
  - If not provided, reviews all spec files in order

## Examples

```
/ceo-ralph:refactor                     # Review all spec files
/ceo-ralph:refactor --file=design       # Only refactor design.md
/ceo-ralph:refactor --file=tasks        # Only refactor tasks.md
```

## Coordinator Principle

**YOU ARE A COORDINATOR, NOT A WRITER.**

Never write spec content directly. Delegate all content updates to the `refactor-specialist` agent. Your job is to:
1. Assess what needs updating
2. Gather user input on changes
3. Delegate writing to the specialist
4. Handle cascading updates

## Behavior

### 1. Determine Active Spec

Read from arguments or `./specs/.current-spec`.

### 2. Initial Assessment

Review `.progress.md` and existing spec files:

```markdown
## Refactor Assessment

**Spec**: {specName}
**Phase**: {phase}

### Current State

| File | Last Updated | Status |
|------|--------------|--------|
| requirements.md | {date} | May need updates |
| design.md | {date} | Up to date |
| tasks.md | {date} | Has completed tasks |

### Summary

Based on implementation progress, the following files may need updates:
- **requirements.md**: {reason or "No changes needed"}
- **design.md**: {reason or "No changes needed"}
- **tasks.md**: {reason or "No changes needed"}
```

### 3. File-by-File Review

For each spec file (in order: requirements → design → tasks):

**Step 1**: Ask if updates needed

```
Does `{file}.md` need updates?

Current summary:
{brief summary of file contents}

Recent implementation changes:
{list of completed tasks/changes}

Options:
- Yes, update this file
- No, skip to next file
- Review sections first
```

**Step 2**: If "Review sections", show each section and ask about changes

**Step 3**: Gather specific change details from user

**Step 4**: Delegate to `refactor-specialist` agent:

```markdown
Delegate to: refactor-specialist

Context:
- Spec: {specName}
- File: {filename}
- Current content: {file content}

Changes requested:
{user's requested changes}

Instructions:
Update the file to reflect the requested changes.
Maintain consistency with other spec files.
Preserve any still-valid content.
```

### 4. Cascade Management

When upstream files change, ask about downstream effects:

| If Changed | May Affect |
|------------|------------|
| requirements.md | design.md, tasks.md |
| design.md | tasks.md |
| tasks.md | (execution only) |

```
You updated `requirements.md`.

This may affect downstream files:
- design.md: {potential impact}
- tasks.md: {potential impact}

Would you like to review and update:
- design.md
- tasks.md
- Both
- Neither (handle later)
```

### 5. State Management

After refactoring:

```json
{
  "phase": "{current phase}",
  "lastRefactored": "{ISO timestamp}",
  "refactoredFiles": ["requirements.md", "design.md"],
  "updatedAt": "{timestamp}"
}
```

Update `.progress.md` with refactoring notes.

### 6. Version Control (Optional)

If user has `commitSpec` enabled in config:

```bash
git add ./specs/{name}/*.md
git commit -m "refactor({specName}): update spec files after implementation"
git push
```

## Output

```markdown
## Refactor Complete

**Spec**: {specName}

### Files Updated

| File | Sections Changed |
|------|------------------|
| requirements.md | User stories, Acceptance criteria |
| design.md | Component breakdown |

### Changes Summary

**requirements.md**:
- Added new acceptance criteria for edge cases
- Removed obsolete requirement R-003

**design.md**:
- Updated component interfaces to match implementation
- Added error handling patterns

### Next Steps

{If tasks need re-planning}
Run `/ceo-ralph:tasks` to regenerate task breakdown.

{If execution should continue}
Run `/ceo-ralph:implement` to continue execution.
```

## Error Handling

| Error | Action |
|-------|--------|
| No active spec | Prompt to run `/ceo-ralph:start` |
| File doesn't exist | Skip or create based on phase |
| Agent failure | Report error, allow manual edit |
| Conflicting changes | Ask user to resolve |

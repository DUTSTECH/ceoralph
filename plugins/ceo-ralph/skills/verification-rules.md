# Verification Rules Skill

This skill defines the 4-layer verification system used by CEO Ralph.

## The 4 Verification Layers

Every task must pass ALL 4 layers before being marked complete.

```
┌─────────────────────────────────────────────┐
│           Layer 1: Contradiction            │
│     Check for conflicting statements        │
└─────────────────────────────────────────────┘
                      │
                      ▼ PASS
┌─────────────────────────────────────────────┐
│           Layer 2: Uncommitted              │
│       Verify all changes committed          │
└─────────────────────────────────────────────┘
                      │
                      ▼ PASS
┌─────────────────────────────────────────────┐
│           Layer 3: Checkmark                │
│      Verify task marked [x] in tasks.md     │
└─────────────────────────────────────────────┘
                      │
                      ▼ PASS
┌─────────────────────────────────────────────┐
│           Layer 4: Signal                   │
│    Verify TASK_COMPLETE signal present      │
└─────────────────────────────────────────────┘
                      │
                      ▼ PASS
                 VERIFIED ✓
```

## Layer 1: Contradiction Detection

**Purpose**: Catch outputs that claim completion but are actually incomplete.

### Detection Patterns

```javascript
const contradictions = [
  // Says complete but needs manual work
  /requires manual.*TASK_COMPLETE/i,
  /manual intervention.*TASK_COMPLETE/i,
  /needs human.*TASK_COMPLETE/i,
  
  // Says complete but has TODOs
  /TODO.*TASK_COMPLETE/i,
  /FIXME.*TASK_COMPLETE/i,
  /XXX.*TASK_COMPLETE/i,
  
  // Says complete but incomplete
  /not implemented.*TASK_COMPLETE/i,
  /placeholder.*TASK_COMPLETE/i,
  /skeleton.*TASK_COMPLETE/i,
  
  // Says complete but blocked
  /blocked.*TASK_COMPLETE/i,
  /cannot complete.*TASK_COMPLETE/i,
];
```

### Verification Process

```markdown
**Layer 1: Contradiction Detection**

Checking output for contradictory statements...

Patterns checked:
- [x] "requires manual" + completion
- [x] "TODO/FIXME" + completion
- [x] "not implemented" + completion
- [x] "blocked" + completion

Result: {PASS/FAIL}
{If FAIL: Found contradiction: "{matched text}"}
```

### On Failure

- Do NOT mark task complete
- Report specific contradiction found
- Retry with instruction to either:
  - Complete the implementation, OR
  - Remove the TASK_COMPLETE signal and report blocker

## Layer 2: Uncommitted Files Check

**Purpose**: Ensure all changes are committed to git.

### Verification Process

```bash
# Check spec directory for uncommitted changes
git status ./specs/{specName}/ --porcelain

# Check modified files from task
git status {file1} {file2} --porcelain
```

### Expected Results

- Empty output = All committed ✓
- Any output = Uncommitted files ✗

```markdown
**Layer 2: Uncommitted Files Check**

Checking for uncommitted changes...

Files checked:
- ./specs/{specName}/tasks.md
- ./specs/{specName}/.progress.md
- {modified files from task}

Result: {PASS/FAIL}
{If FAIL: Uncommitted files: {list}}
```

### On Failure

- Run git commit for spec files
- Request worker to commit code changes
- Retry verification

## Layer 3: Checkmark Verification

**Purpose**: Ensure task is marked complete in tasks.md.

### Verification Process

```bash
# Check if task line shows [x]
grep -E "^\s*-\s*\[x\]\s*{taskId}" ./specs/{specName}/tasks.md
```

### Expected Results

- Match found = Marked complete ✓
- No match = Not marked ✗

```markdown
**Layer 3: Checkmark Verification**

Checking tasks.md for completion mark...

Looking for: `- [x] {taskId}`
Found: {matched line or "NOT FOUND"}

Result: {PASS/FAIL}
```

### On Failure

- Update tasks.md to mark task `[x]`
- Commit the change
- Re-verify

## Layer 4: Signal Verification

**Purpose**: Ensure explicit completion signal is present.

### Verification Process

```javascript
const output = workerOutput;
const hasSignal = output.includes("TASK_COMPLETE");
```

### Expected Results

- Signal found = Complete ✓
- No signal = Incomplete ✗

```markdown
**Layer 4: Signal Verification**

Checking for completion signal...

Looking for: `TASK_COMPLETE`
Found: {YES/NO}

Result: {PASS/FAIL}
```

### On Failure

- If output looks complete, add signal and pass
- If output is incomplete, retry task

## Combined Verification Report

```markdown
## Verification Report: Task {id}

| Layer | Check | Status |
|-------|-------|--------|
| 1 | Contradiction Detection | {✓ PASS / ✗ FAIL} |
| 2 | Uncommitted Files | {✓ PASS / ✗ FAIL} |
| 3 | Checkmark in tasks.md | {✓ PASS / ✗ FAIL} |
| 4 | Completion Signal | {✓ PASS / ✗ FAIL} |

**Overall**: {VERIFIED ✓ / FAILED ✗}

{If FAILED}
**Failed Layers**: {list}
**Action**: {what to do}
```

## Quality Gate Verification

For `[VERIFY]` tasks, also run quality commands:

```markdown
## Quality Gate Verification

### Command: `{lint command}`
Exit Code: {code}
Output:
```
{output}
```
Status: {PASS if code=0, FAIL otherwise}

### Command: `{test command}`
Exit Code: {code}
Output:
```
{output}
```
Status: {PASS if code=0, FAIL otherwise}

**Quality Gate**: {PASS / FAIL}
```

## Verification Rules by Tag

| Tag | Layers Required | Quality Gate |
|-----|-----------------|--------------|
| (none) | All 4 | No |
| [VERIFY] | All 4 | Yes |
| [CRITICAL] | All 4 | Yes |
| [OPTIONAL] | Layers 3, 4 only | No |
| [P] | All 4 | No |

## Automatic Fixes

The system can automatically fix:

1. **Layer 2 failures**: Commit uncommitted files
2. **Layer 3 failures**: Update tasks.md checkmark
3. **Layer 4 failures**: Add signal if output looks complete

Cannot automatically fix:

1. **Layer 1 failures**: Requires implementation changes
2. **Quality gate failures**: Requires code fixes

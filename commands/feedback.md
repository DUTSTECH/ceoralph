---
name: feedback
description: Submit feedback or report issues
allowed-tools: Bash, AskUserQuestion
timeout: 60000
---

# /ceo-ralph:feedback

Submit feedback or report issues for the CEO Ralph plugin.

## Usage

```
/ceo-ralph:feedback [message]
```

## Arguments

- `message` (optional): Your feedback or issue description. If not provided, will prompt.

## Examples

```
/ceo-ralph:feedback "The research phase sometimes times out on large codebases"
/ceo-ralph:feedback "Feature request: support for monorepo projects"
/ceo-ralph:feedback
```

## Behavior

### 1. Get Feedback Message

If no message provided in arguments:

```
What feedback would you like to share?

You can:
- Report a bug or unexpected behavior
- Request a new feature
- Share suggestions for improvement
- Ask questions about the plugin
```

### 2. Check for GitHub CLI

Check if `gh` CLI is available:

```bash
gh --version
```

### 3a. With GitHub CLI

If `gh` is available:

1. Extract a short title from the feedback (first sentence or first 50 chars)
2. Create a GitHub issue automatically:

```bash
gh issue create \
  --repo dutsAI/ceo-ralph \
  --title "{extracted title}" \
  --body "{full feedback message}"
```

Output:
```markdown
## Feedback Submitted

Your feedback has been submitted as a GitHub issue.

**Issue**: {issue URL}
**Title**: {title}

Thank you for helping improve CEO Ralph!
```

### 3b. Without GitHub CLI

If `gh` is not available:

```markdown
## Submit Feedback

The GitHub CLI (`gh`) is not installed.

### Option 1: Install GitHub CLI

```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
# See https://cli.github.com/manual/installation
```

Then run `/ceo-ralph:feedback` again.

### Option 2: Submit Manually

Create an issue at:
https://github.com/dutsAI/ceo-ralph/issues/new

**Your feedback:**
```
{feedback message}
```

### View Existing Issues

https://github.com/dutsAI/ceo-ralph/issues
```

## Feedback Categories

When creating issues, the following labels may be applied:

| Category | Description |
|----------|-------------|
| bug | Something isn't working |
| enhancement | New feature or improvement |
| question | Further information requested |
| documentation | Documentation improvements |

## Notes

- Feedback is submitted to the CEO Ralph GitHub repository
- Include relevant context (phase, command used, error messages)
- Check existing issues before submitting duplicates

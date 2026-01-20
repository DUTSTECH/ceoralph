---
name: communication-style
description: Output style guide for concise, scannable, actionable communication
---

# Communication Style

Style guide for all CEO Ralph outputs. Based on Matt Pocock's planning principles.

## Core Principle

> **"Be extremely concise. Sacrifice grammar for concision."**

Why:
- Plans shouldn't be lengthy essays
- Terminal reading flows bottom-up
- Scanning beats reading
- Action items must be visible

## Output Structure

All outputs follow this sequence:

```
1. Overview (2-3 sentences max)
2. Main content (tables, bullets, diagrams)
3. Unresolved questions
4. Action steps (numbered, at the END)
```

Action steps go LAST because terminal scrolls to bottom—make them maximally visible.

## Formatting Rules

### Prefer Tables Over Prose

❌ Bad:
```
The system has three main components. First, there's the API layer
which handles incoming requests. Second, there's the service layer
which contains business logic. Third, there's the data layer...
```

✅ Good:
```
| Component | Purpose |
|-----------|---------|
| API | Request handling |
| Service | Business logic |
| Data | Persistence |
```

### Prefer Bullets Over Paragraphs

❌ Bad:
```
The login flow starts when the user submits their credentials.
The system then validates the input format. If valid, it checks
against the database. If the credentials match, a JWT is generated.
```

✅ Good:
```
Login flow:
1. User submits credentials
2. Validate input format
3. Check database
4. Generate JWT if match
```

### Prefer Diagrams Over Descriptions

❌ Bad:
```
The request flows from the client to the API gateway,
then to the authentication service, then to the user service...
```

✅ Good:
```
Client → Gateway → Auth → User Service → Database
```

## Brevity Patterns

| Instead of... | Write... |
|---------------|----------|
| "We will implement" | "Implement" |
| "The system should" | "Should" |
| "In order to" | "To" |
| "It is important to note that" | (delete) |
| "At this point in time" | "Now" |
| "Due to the fact that" | "Because" |

## Surface Questions Early

Always list ambiguities BEFORE action items:

```
## Questions
- Auth flow: OAuth or JWT?
- Storage: Redis or in-memory?

## Actions
1. Confirm auth approach
2. Set up project structure
```

## Avoid

- Long prose explanations
- Nested bullets (3+ levels)
- Hedging language ("perhaps", "might", "could potentially")
- Repeating context already established
- Explaining what you're about to do

## Example: Phase Summary

❌ Too verbose:
```
## Research Phase Complete

I have completed the research phase for this specification.
During this phase, I investigated the existing codebase patterns
and found several relevant files. I also searched the web for
best practices and discovered...
```

✅ Concise:
```
## Research Complete

| Aspect | Finding |
|--------|---------|
| Pattern | Repository pattern used |
| Stack | Express + TypeScript |
| Tests | Jest, 80% coverage |

**Questions**:
- Auth library preference?

**Next**: `/ceo-ralph:requirements`
```

## Delegation Output

When delegating to Codex, keep context packages focused:

```json
{
  "task": "Implement login form",
  "files": ["src/components/Form.tsx"],
  "acceptance": ["Has email input", "Has password input", "Submits"]
}
```

Not:
```json
{
  "task": "We need to implement a login form component that allows users to enter their credentials...",
  "context": "In this codebase, we use React for the frontend and we've established a pattern where all forms should follow the existing Form.tsx pattern which you can find at src/components/Form.tsx. This pattern involves using controlled components with React hooks for state management and...",
  ...
}
```

## Terminal-First Design

Remember: Users read terminal output bottom-up.

Structure for scannability:
1. Quick status at top (what happened)
2. Details in middle (if they want to scroll up)
3. **Actions at bottom** (what to do next)

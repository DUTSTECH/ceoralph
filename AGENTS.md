# Repository Guidelines

## Project Structure & Module Organization
- `agents/`: Sub-agent specs used by CEO Ralph (research, planning, execution, review).
- `commands/`: Slash command handlers (Markdown instructions for each command).
- `templates/`: Spec templates (`research.md`, `requirements.md`, `design.md`, `tasks.md`).
- `schemas/`: JSON schemas used for validation.
- `remote-ui/`: Optional Remote UI implementation (`remote_ui.py`).
- `hooks/`: Stop hook scripts for cleanup.
- `docs/`: Architecture, setup, workflow, troubleshooting.
- `examples/`: Sample spec artifacts.

## Build, Test, and Development Commands
This repo is a Claude Code plugin and does not ship a standard build/test script. Common contributor workflows are:

```bash
# Load plugin locally in Claude Code
claude --plugin-dir $(pwd)
```

Inside Claude Code, verify command wiring and doc updates with:

```text
/ceo-ralph:setup
/ceo-ralph:help
```

For Remote UI smoke checks:

```bash
python remote-ui/remote_ui.py request --title "Ping" --prompt "Smoke test"
```

## Coding Style & Naming Conventions
- Match existing formatting in each file; most content is Markdown and JSON.
- Keep command/agent filenames in kebab-case (e.g., `agents/task-planner.md`).
- Prefer concise headings, short paragraphs, and checklist-style steps in docs.
- For Python (`remote-ui/`), keep standard library usage and small functions; avoid adding heavy deps without discussion.

## Testing Guidelines
- No automated test runner is defined in this repo.
- Validate changes by running the relevant slash commands in Claude Code and reviewing generated artifacts.
- If you add tests, place them in a new `tests/` directory and document the commands in `docs/WORKFLOW.md` and `README.md`.

## Commit & Pull Request Guidelines
- Commit messages are mixed; use concise imperative style or Conventional Commits (e.g., `fix(security): ...`) consistent with history.
- Branch naming follows `feature/<topic>` or `fix/<topic>` (see README).
- PRs should include: summary of changes, linked issue (if any), and screenshots/gifs for UI changes in `remote-ui/`.

## Configuration & Security Notes
- Remote UI stores requests locally at `~/.ceo-ralph/remote-ui/requests.json`; avoid committing local state.
- Treat auth tokens/keys as secrets and keep them out of docs or examples.

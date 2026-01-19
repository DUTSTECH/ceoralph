# CEO Ralph Troubleshooting Guide

## Common Issues

### Installation Issues

#### "Plugin not found" after installation

**Symptoms**: Commands like `/ceo-ralph:help` don't work

**Solutions**:
1. Restart Claude Code completely
2. Verify plugin path is correct
3. Check plugin.json is valid JSON:
   ```bash
   cat plugins/ceo-ralph/.claude-plugin/plugin.json | jq .
   ```
4. Reinstall:
   ```bash
   /plugin uninstall ceo-ralph
   /plugin install /path/to/ceo-ralph/plugins/ceo-ralph
   ```

#### MCP server connection failed

**Symptoms**: Execute command fails with connection error

**Solutions**:
1. Verify Codex CLI is installed:
   ```bash
   codex --version
   ```
2. Verify Codex is authenticated:
   ```bash
   codex login status
   ```
3. Check MCP config in `~/.claude/settings.json`:
   ```json
   {
     "mcpServers": {
       "codex": {
         "type": "stdio",
         "command": "codex",
         "args": ["-m", "gpt-5.2-codex", "mcp-server"]
       }
     }
   }
   ```
4. Restart Claude Code

### Auth Issues

#### "Codex not authenticated"

**Symptoms**: Codex MCP returns authentication error

**Solutions**:
1. Run `codex login`
2. Confirm status with `codex login status`
3. Restart Claude Code

#### "Rate limit exceeded"

**Symptoms**: Codex MCP returns 429 error

**Solutions**:
1. Wait and retry (automatic with backoff)
2. Reduce parallel workers:
   ```bash
   export CEO_RALPH_PARALLEL_LIMIT=1
   ```
3. If you have access to a different Codex model, update `~/.claude/settings.json`:
    ```json
    {
       "mcpServers": {
          "codex": {
             "args": ["-m", "<alternate-model>", "mcp-server"]
          }
       }
    }
    ```

#### "Context length exceeded"

**Symptoms**: Task fails with token limit error

**Solutions**:
1. Reduce context in task specification
2. Split large tasks into smaller ones
3. Increase token limit:
   ```bash
   export CEO_RALPH_MAX_TOKENS=8192
   ```

### Execution Issues

#### Task stuck in "running" state

**Symptoms**: Status shows task running for too long

**Solutions**:
1. Check for network issues
2. Cancel and retry:
   ```bash
   /ceo-ralph:pause
   /ceo-ralph:resume
   ```
3. Manually mark task complete if output is good

#### Infinite retry loop

**Symptoms**: Same task keeps failing and retrying

**Solutions**:
1. Check max retries setting
2. Review feedback being given to worker
3. Escalate manually:
   ```bash
   /ceo-ralph:pause "Manual review needed"
   ```
4. Consider simplifying the task

#### Verification always fails

**Symptoms**: 4-layer verification repeatedly fails

**Solutions**:

**Layer 1 (Contradiction)**:
- Worker output has conflicting statements
- Fix: Ensure worker either completes or reports blocker

**Layer 2 (Uncommitted)**:
- Files not committed to git
- Fix: Run `git add . && git commit -m "..."`

**Layer 3 (Checkmark)**:
- tasks.md not updated
- Fix: Manually mark task `[x]` in tasks.md

**Layer 4 (Signal)**:
- Missing TASK_COMPLETE
- Fix: Add signal if output looks complete

### Quality Issues

#### Codex output doesn't follow patterns

**Symptoms**: Generated code doesn't match codebase style

**Solutions**:
1. Include more context files in task
2. Add explicit pattern references in design.md
3. Add constraints to task specification

#### Tests keep failing

**Symptoms**: Quality gate [VERIFY] tasks fail

**Solutions**:
1. Check if tests were broken before
2. Review test output for specific failures
3. Run tests manually to diagnose:
   ```bash
   npm test
   ```

#### Lint errors in generated code

**Symptoms**: Lint [VERIFY] task fails

**Solutions**:
1. Run autofix:
   ```bash
   npm run lint -- --fix
   ```
2. Review lint rules that are failing
3. Consider if rules need updating

### State Issues

#### "State file corrupted"

**Symptoms**: Error reading .ceo-ralph-state.json

**Solutions**:
1. Validate JSON:
   ```bash
   cat .ceo-ralph-state.json | jq .
   ```
2. Fix or recreate state file
3. Reset to known state:
   ```bash
   /ceo-ralph:cancel --keep-files
   /ceo-ralph:start spec-name "..." 
   ```

#### Lost progress after restart

**Symptoms**: Progress not saved

**Solutions**:
1. Check .ceo-ralph-state.json exists
2. Verify .progress.md is up to date
3. Resume from last known state:
   ```bash
   /ceo-ralph:status
   /ceo-ralph:resume
   ```

### Performance Issues

#### Execution too slow

**Symptoms**: Tasks take very long to complete

**Solutions**:
1. Enable parallel execution for [P] tasks
2. Reduce context size
3. Use faster model for simple tasks
4. Check network connectivity

#### High token usage

**Symptoms**: Unexpected API costs

**Solutions**:
1. Check token tracking in state
2. Reduce context in tasks
3. Use smaller model when appropriate
4. Review and optimize prompts

## Error Messages

### "No active spec"

Run `/ceo-ralph:start` first to create a spec.

### "Phase not complete"

Complete the current phase before moving to the next one.

### "Max iterations reached"

The global iteration limit was hit. Either:
- Increase limit: `CEO_RALPH_MAX_ITERATIONS=200`
- Review why tasks keep failing

### "Escalation needed"

A task failed too many times. Options:
1. Provide guidance and retry
2. Manually implement
3. Skip if [OPTIONAL]

## Getting Help

### Logs

Check Claude Code logs for detailed error information.

### State Files

Review these files for debugging:
- `.ceo-ralph-state.json` - Current state
- `.progress.md` - Execution history
- `tasks.md` - Task status

### Reporting Issues

When reporting issues, include:
1. Error message
2. Contents of .ceo-ralph-state.json
3. Relevant section of .progress.md
4. Claude Code version
5. Node.js version

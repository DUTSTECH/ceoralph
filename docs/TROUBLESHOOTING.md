# Troubleshooting

Common issues and solutions for CEO Ralph.

---

## Installation Issues

### "Codex MCP not configured"

**Solution:**
```bash
/ceo-ralph:setup
```

Then restart Claude Code.

---

### "stop-handler.sh: No such file or directory"

```
Stop hook error: Failed with non-blocking status code: bash: .../hooks/scripts/stop-handler.sh: No such file or directory
```

This error occurs when you have an old plugin installation (v1.x) that references `stop-handler.sh`, which was renamed to `stop-watcher.sh` in v2.0.0.

**Solutions:**

1. **Reinstall the plugin** (recommended):
   ```bash
   /plugin uninstall ceo-ralph
   /plugin install ceo-ralph@dutstech-ceoralph
   ```

2. **Remove stale installation** if you have a local dev copy:
   ```bash
   # Remove old plugin directory
   rm -rf /path/to/old/ceo-ralph-plugin
   ```

3. **Manual fix** - update `hooks/hooks.json` in your old installation:
   ```json
   {
     "hooks": {
       "Stop": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/stop-watcher.sh"
             }
           ]
         }
       ]
     }
   }
   ```

---

## Execution Issues

### Task keeps failing / Max iterations reached

After max iterations (default: 5), the Codex MCP stops to prevent infinite loops.

**Solutions:**

1. Check `.progress.md` in your spec folder for error details
2. Fix the issue manually
3. Resume with `/ceo-ralph:implement`

**Common causes:**
- Missing dependencies
- Failing tests that need manual intervention
- Ambiguous task instructions

---

### "Loop state conflict"

Another execution loop may already be running in this session.

**Solution:**
```bash
# Cancel the existing loop
/ceo-ralph:cancel

# Then retry
/ceo-ralph:implement
```

---

### Task marked complete but work not done

The spec-executor may have output `TASK_COMPLETE` prematurely.

**Solutions:**

1. Check the task checkbox in `tasks.md` - uncheck it if needed
2. Review `.progress.md` for what was actually completed
3. Run `/ceo-ralph:implement` to retry

---

## State Issues

### Want to start over completely

```bash
# Cancel and cleanup
/ceo-ralph:cancel

# Delete the spec folder if you want a fresh start
rm -rf ./specs/your-spec-name

# Start fresh
/ceo-ralph:new your-spec-name Your goal here
```

---

### Resume existing spec

Just run `/ceo-ralph:start` - it auto-detects existing specs and continues where you left off.

If you want to force a specific spec:
```bash
/ceo-ralph:switch spec-name
/ceo-ralph:implement
```

---

### State file corrupted

If `.ralph-state.json` gets corrupted:

```bash
# View current state
cat ./specs/your-spec-name/.ralph-state.json

# Delete and restart execution
rm ./specs/your-spec-name/.ralph-state.json
/ceo-ralph:implement
```

---

## Spec Phase Issues

### Research taking too long

The research-analyst agent searches the web and analyzes your codebase. For large codebases, this can take time.

**Solutions:**
- Be more specific in your goal description
- Skip research with `--skip-research` flag on start command

---

### Design doesn't match requirements

Re-run the design phase:
```bash
/ceo-ralph:design
```

The architect-reviewer will regenerate the design based on current requirements.

---

### Tasks don't follow POC-first pattern

The task-planner should generate tasks in 4 phases:
1. Make It Work (POC)
2. Refactoring
3. Testing
4. Quality Gates

If tasks are out of order, re-run:
```bash
/ceo-ralph:tasks
```

---

## Plugin Development Issues

### Changes not taking effect

Claude Code caches plugin files. After making changes:

1. Restart Claude Code completely
2. Or use `--plugin-dir` flag to load fresh:
   ```bash
   claude --plugin-dir ./ceoralph
   ```

---

### Hook not triggering

Check that `hooks/hooks.json` is valid JSON and properly formatted:

```bash
cat ceoralph/hooks/hooks.json | jq .
```

---

## Remote UI Issues

### "Access denied" on Remote UI

**Symptoms**: Login fails or API returns 401

**Solutions**:
1. Re-run `python remote-ui/remote_ui.py rotate-key`
2. Re-run `python remote-ui/remote_ui.py rotate-password`
3. Use the new password to sign in
4. Confirm the browser is hitting the correct URL

### Remote UI not reachable externally

**Symptoms**: Public URL fails to load

**Solutions**:
1. Ensure the local server is running: `python remote-ui/remote_ui.py start`
2. Restart the tunnel:
   ```bash
   cloudflared tunnel --url http://127.0.0.1:8123
   ```
3. Update the public URL:
   ```bash
   python remote-ui/remote_ui.py set-public-url https://your-url.trycloudflare.com
   ```

---

## Still stuck?

1. Check [MIGRATION.md](MIGRATION.md) if upgrading from v1.x
2. Open an issue: https://github.com/DUTSTECH/ceoralph/issues
3. Include:
   - Error message
   - Contents of `.ralph-state.json`
   - Contents of `.progress.md`
   - Claude Code version

---
description: Start, stop, or open the CEO Ralph web dashboard
argument-hint: [start|stop|open|status]
allowed-tools: [Bash, Read, Write, AskUserQuestion]
---

# Dashboard

Manage the CEO Ralph real-time web dashboard.

## Usage

```
/ceo-ralph:dashboard           — Show status and URL
/ceo-ralph:dashboard start     — Start the dashboard daemon
/ceo-ralph:dashboard stop      — Stop the dashboard daemon
/ceo-ralph:dashboard open      — Open dashboard in browser
```

## Determine Action

Parse `$ARGUMENTS`:
- No args or `status` → show status
- `start` → start daemon
- `stop` → stop daemon
- `open` → open browser

## Action: Status

Check if dashboard is running:

```bash
curl -s http://localhost:${RALPH_DASHBOARD_PORT:-3200}/health 2>/dev/null
```

If running, output:
```
CEO Ralph Dashboard
===================
Status: RUNNING
URL: http://localhost:3200
WebSocket: ws://localhost:3200/ws
```

If not running:
```
CEO Ralph Dashboard
===================
Status: NOT RUNNING

Start with: /ceo-ralph:dashboard start
```

## Action: Start

### Step 1: Check Node.js

```bash
node --version 2>&1 | head -1
```

If missing:
```
Node.js is required for the dashboard.
Install from: https://nodejs.org
```

### Step 2: Resolve Dashboard Directory

Resolve the plugin root:
```bash
ROOT="${CLAUDE_PLUGIN_ROOT:-${CLAUDE_PLUGIN_DIR:-}}"
echo "$ROOT/dashboard"
```

If not available, use relative path from CWD or ask user.

### Step 3: Install Dependencies

Check if `node_modules` exists in the dashboard directory:

```bash
if [ ! -d "$DASHBOARD_DIR/node_modules" ]; then
  npm install --prefix "$DASHBOARD_DIR"
fi
```

### Step 4: Start Daemon

```bash
cd "$DASHBOARD_DIR" && nohup npx tsx src/index.ts > /tmp/ralph-dashboard.log 2>&1 &
echo $! > /tmp/ralph-dashboard.pid
```

### Step 5: Verify

Wait 3 seconds, then health check:

```bash
sleep 3
curl -s http://localhost:${RALPH_DASHBOARD_PORT:-3200}/health
```

Output:
```
CEO Ralph Dashboard started!
URL: http://localhost:3200

View logs: tail -f /tmp/ralph-dashboard.log
Stop: /ceo-ralph:dashboard stop
```

## Action: Stop

```bash
if [ -f /tmp/ralph-dashboard.pid ]; then
  kill $(cat /tmp/ralph-dashboard.pid) 2>/dev/null
  rm -f /tmp/ralph-dashboard.pid
  echo "Dashboard stopped."
else
  echo "No dashboard PID file found. Checking for process..."
  pkill -f "ralph-dashboard" 2>/dev/null || echo "No dashboard process found."
fi
```

## Action: Open

```bash
# Linux
xdg-open http://localhost:${RALPH_DASHBOARD_PORT:-3200} 2>/dev/null || \
# macOS
open http://localhost:${RALPH_DASHBOARD_PORT:-3200} 2>/dev/null || \
# Windows
cmd.exe /c start http://localhost:${RALPH_DASHBOARD_PORT:-3200} 2>/dev/null || \
echo "Open http://localhost:${RALPH_DASHBOARD_PORT:-3200} in your browser"
```

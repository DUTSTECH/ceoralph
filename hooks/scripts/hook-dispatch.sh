#!/bin/bash
# CEO Ralph Hook Dispatcher
# Reads hook JSON from stdin and POSTs to the dashboard daemon.
# Usage: hook-dispatch.sh <event-name>
# Fails silently if dashboard is not running.

EVENT="$1"
if [ -z "$EVENT" ]; then
  exit 0
fi

# Read hook input from stdin
INPUT=$(cat)

# POST to dashboard daemon (fail silently)
curl -s -X POST "http://localhost:${RALPH_DASHBOARD_PORT:-3200}/hooks/$EVENT" \
  -H "Content-Type: application/json" \
  -d "$INPUT" 2>/dev/null || true

exit 0

#!/bin/bash
# Wrapper to normalize CLAUDE_PLUGIN_ROOT on Windows and invoke stop-watcher.sh.

ROOT="${CLAUDE_PLUGIN_ROOT:-}"
if [ -z "$ROOT" ]; then
    exit 0
fi

ROOT="${ROOT//\\//}"
if printf '%s' "$ROOT" | grep -Eq '^[A-Za-z]:/'; then
    DRIVE=$(printf '%s' "$ROOT" | cut -c1 | tr 'A-Z' 'a-z')
    ROOT="/$DRIVE/${ROOT:3}"
fi

SCRIPT="$ROOT/hooks/scripts/stop-watcher.sh"
if [ -f "$SCRIPT" ]; then
    "$SCRIPT"
else
    echo "CEO Ralph cleanup: stop hook script not found"
fi

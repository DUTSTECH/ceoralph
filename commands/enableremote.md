---
description: One-shot Remote UI + HTTPS tunnel setup
argument-hint: []
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# /ceo-ralph:enableremote

One-shot command to set up the Remote UI, start it locally, and expose it via a free HTTPS tunnel.

## Usage

```
/ceo-ralph:enableremote
```

## What It Does

- Prompts you to set and confirm a password
- Starts the Remote UI server
- Launches Cloudflare Quick Tunnel
- Prints the public HTTPS URL
 
Requires `cloudflared` installed (auto-checked below).

## Step 1: Check Cloudflared

```bash
cloudflared --version 2>&1 || echo "CLOUDFLARED_MISSING"
```

If you see `CLOUDFLARED_MISSING`, offer to install it automatically.

Ask the user:
```
Cloudflared is missing. Install it now? (yes/no)
```

If yes, install based on OS:

**Windows (PowerShell):**
```powershell
powershell -NoProfile -Command "winget install --id Cloudflare.cloudflared -e"
```

**macOS (Homebrew):**
```bash
brew install cloudflared
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update && sudo apt-get install -y cloudflared
```

If the OS is unknown, ask the user to choose an install method and provide the command.

Re-check:
```bash
cloudflared --version 2>&1 || echo "CLOUDFLARED_MISSING"
```

If still missing, stop and ask the user to install manually.

## Step 2: Enable Remote UI

If `cloudflared` is installed, resolve the Remote UI script path and run it:

```bash
SCRIPT=""
if [ -n "$CLAUDE_PLUGIN_ROOT" ] && [ -f "$CLAUDE_PLUGIN_ROOT/remote-ui/remote_ui.py" ]; then
  SCRIPT="$CLAUDE_PLUGIN_ROOT/remote-ui/remote_ui.py"
elif [ -n "$CLAUDE_PLUGIN_DIR" ] && [ -f "$CLAUDE_PLUGIN_DIR/remote-ui/remote_ui.py" ]; then
  SCRIPT="$CLAUDE_PLUGIN_DIR/remote-ui/remote_ui.py"
else
  BASE="${USERPROFILE:-$HOME}"
  BASE="${BASE//\\//}"
  if printf '%s' "$BASE" | grep -Eq '^[A-Za-z]:/'; then
    DRIVE=$(printf '%s' "$BASE" | cut -c1 | tr 'A-Z' 'a-z')
    BASE="/$DRIVE/${BASE:3}"
  fi
  for CANDIDATE in \
    "$BASE/.claude/plugins/cache/dutstech-ceoralph"/ceo-ralph/*/remote-ui/remote_ui.py \
    "$BASE/.claude/plugins/marketplaces/dutstech-ceoralph/remote-ui/remote_ui.py" \
    "$BASE/.claude/plugins/dutstech-ceoralph/remote-ui/remote_ui.py"; do
    if [ -f "$CANDIDATE" ]; then
      SCRIPT="$CANDIDATE"
      break
    fi
  done
fi
if [ -z "$SCRIPT" ]; then
  echo "REMOTE_UI_SCRIPT_NOT_FOUND"
  exit 1
fi
python "$SCRIPT" enable
```

## Step 3: Verify Configuration

Confirm a public URL was saved to config:

```bash
python - <<'PY'
import json, os
base = os.environ.get("USERPROFILE") or os.path.expanduser("~")
config = os.path.join(base, ".ceo-ralph", "remote-ui", "config.json")
try:
    with open(config, "r", encoding="utf-8") as f:
        data = json.load(f)
    print("publicUrl:", data.get("publicUrl", "MISSING"))
except FileNotFoundError:
    print("config_missing")
PY
```

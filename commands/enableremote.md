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
 
Requires `cloudflared` installed.

## Command

```bash
python remote-ui/remote_ui.py enable
```

## Cloudflare Check (Required)

Before running, check if `cloudflared` is installed:

```bash
cloudflared --version
```

If it returns a version, continue with `python remote-ui/remote_ui.py enable`.

If missing, ask the user to install it:

**Windows (PowerShell):**
```powershell
winget install --id Cloudflare.cloudflared
```

**macOS (Homebrew):**
```bash
brew install cloudflared
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update && sudo apt-get install -y cloudflared
```

Then re-run:

```
/ceo-ralph:enableremote
```

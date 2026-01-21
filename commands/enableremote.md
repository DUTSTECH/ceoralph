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

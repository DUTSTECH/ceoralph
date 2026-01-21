---
description: Configure and start the Remote UI for approvals
argument-hint: [start|setup|set-public-url|rotate-key]
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# /ceo-ralph:remote-ui

Configure and start the Remote UI approval dashboard.

## Usage

```
/ceo-ralph:remote-ui setup
/ceo-ralph:remote-ui start
/ceo-ralph:remote-ui set-public-url https://your-url.trycloudflare.com
/ceo-ralph:remote-ui enable
/ceo-ralph:remote-ui rotate-key
/ceo-ralph:remote-ui rotate-password
```

## What This Does

- Starts a local approval dashboard on `127.0.0.1:8123`
- Optionally exposes it via a free HTTPS tunnel
- Enforces strong access-key authentication

## Commands

### setup

Initialize the Remote UI config, prompt for a password, and generate a strong access key.

```bash
python remote-ui/remote_ui.py setup
```

### start

Start the dashboard server:

```bash
python remote-ui/remote_ui.py start
```

### set-public-url

After starting a free HTTPS tunnel (e.g. Cloudflare Quick Tunnel), set the public URL:

```bash
cloudflared tunnel --url http://127.0.0.1:8123
python remote-ui/remote_ui.py set-public-url https://your-url.trycloudflare.com
```

### rotate-key

Rotate the access key if it is ever exposed:

```bash
python remote-ui/remote_ui.py rotate-key
```

### rotate-password

Rotate the password if it is ever exposed:

```bash
python remote-ui/remote_ui.py rotate-password
```

### enable

Automate setup + server + HTTPS tunnel (Cloudflare):

```bash
python remote-ui/remote_ui.py enable
```

Requires `cloudflared` installed and will print the public URL automatically.

## Security Notes

- Access requires the password set during `setup`.
- Traffic is encrypted in transit when using an HTTPS tunnel.
- The server binds to `127.0.0.1` only by default.

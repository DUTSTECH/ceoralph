# Remote UI (Approvals Anywhere)

The Remote UI lets CEO Ralph request approvals and collect user input from a web page. It is designed to be free, easy to run, and secure by default.

## What It Does

- Hosts a local approval dashboard on `http://127.0.0.1:8123`
- Exposes the dashboard via a free HTTPS tunnel (Cloudflare Quick Tunnel)
- Requires a strong access key for authentication
- Keeps requests on disk so approvals persist across restarts

## Security Model

- **Strong auth**: Password (set at setup) plus a 32-byte access key for API usage.
- **Encrypted in transit**: Use Cloudflare Quick Tunnel for HTTPS.
- **Local bind**: Server only binds to `127.0.0.1` by default.

## Quick Start

1. One-shot setup + HTTPS tunnel (requires `cloudflared` installed):
   ```bash
   /ceo-ralph:enableremote
   ```
   Verify the public URL is printed and saved to `~/.ceo-ralph/remote-ui/config.json`.

2. Or run step-by-step:

   Initialize Remote UI (prompts for password):
   ```bash
   python remote-ui/remote_ui.py setup
   ```
   Save the access key shown in your password manager.

   Start the server:
   ```bash
   python remote-ui/remote_ui.py start
   ```

   (Optional) Create a free HTTPS tunnel:
   ```bash
   cloudflared tunnel --url http://127.0.0.1:8123
   ```
   Copy the `https://...trycloudflare.com` URL and set it:
   ```bash
   python remote-ui/remote_ui.py set-public-url https://your-url.trycloudflare.com
   ```

4. Open the page in a browser and sign in with the password you set.

## CLI Usage (for approvals)

Create a new approval request:
```bash
python remote-ui/remote_ui.py request \
  --title "Approve research findings" \
  --prompt "Review research.md and approve to continue."
```

Wait for a response:
```bash
python remote-ui/remote_ui.py wait req_12345
```

Rotate the access key:
```bash
python remote-ui/remote_ui.py rotate-key
```

Rotate the password:
```bash
python remote-ui/remote_ui.py rotate-password
```

## File Locations

- Config: `~/.ceo-ralph/remote-ui/config.json`
- Requests: `~/.ceo-ralph/remote-ui/requests.json`

## Troubleshooting

- If you see "Remote UI is not set up", run `setup` again.
- If access is denied, rotate the access key and sign in again.

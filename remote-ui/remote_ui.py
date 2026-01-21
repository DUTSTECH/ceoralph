#!/usr/bin/env python3
import argparse
import base64
import datetime as dt
import getpass
import hashlib
import json
import os
import re
import secrets
import subprocess
import sys
import threading
import time
import urllib.parse
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn


CONFIG_DIR = os.path.join(os.path.expanduser("~"), ".ceo-ralph", "remote-ui")
CONFIG_PATH = os.path.join(CONFIG_DIR, "config.json")
REQUESTS_PATH = os.path.join(CONFIG_DIR, "requests.json")
SESSION_COOKIE = "ceo_ralph_session"
SESSION_TTL_SECONDS = 60 * 60 * 12
KEY_ITERATIONS = 200_000
PASSWORD_ITERATIONS = 200_000
TUNNEL_URL_PATTERN = re.compile(r"https://[a-z0-9.-]+\.trycloudflare\.com")


def utc_now():
    return dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def b64encode(raw_bytes):
    return base64.urlsafe_b64encode(raw_bytes).decode("ascii").rstrip("=")


def b64decode(raw_str):
    padding = "=" * ((4 - len(raw_str) % 4) % 4)
    return base64.urlsafe_b64decode(raw_str + padding)


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def load_json(path, default):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        return default


def atomic_write_json(path, data):
    ensure_dir(os.path.dirname(path))
    tmp_path = f"{path}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, sort_keys=True)
        handle.write("\n")
    os.replace(tmp_path, path)


def hash_access_key(access_key, salt_bytes):
    digest = hashlib.pbkdf2_hmac(
        "sha256", access_key.encode("utf-8"), salt_bytes, KEY_ITERATIONS
    )
    return b64encode(digest)


def hash_password(password, salt_bytes):
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt_bytes, PASSWORD_ITERATIONS
    )
    return b64encode(digest)


def generate_access_key():
    return secrets.token_urlsafe(32)


def prompt_password():
    if not sys.stdin.isatty():
        raise RuntimeError("Interactive password prompt requires a TTY.")
    while True:
        password = getpass.getpass("Set Remote UI password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords do not match. Try again.")
            continue
        if len(password) < 12:
            print("Password must be at least 12 characters.")
            continue
        return password


def ensure_config(port, password=None):
    config = load_json(CONFIG_PATH, None)
    if config:
        return config, None
    access_key = generate_access_key()
    salt = secrets.token_bytes(16)
    password_salt = secrets.token_bytes(16)
    if password is None:
        raise RuntimeError("Remote UI setup requires a password.")
    config = {
        "port": port,
        "accessKeySalt": b64encode(salt),
        "accessKeyHash": hash_access_key(access_key, salt),
        "passwordSalt": b64encode(password_salt),
        "passwordHash": hash_password(password, password_salt),
        "publicUrl": None,
        "instanceId": secrets.token_hex(6),
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }
    atomic_write_json(CONFIG_PATH, config)
    return config, access_key


def update_config(updates):
    config = load_json(CONFIG_PATH, None)
    if not config:
        raise RuntimeError("Remote UI is not set up. Run `setup` first.")
    config.update(updates)
    config["updatedAt"] = utc_now()
    atomic_write_json(CONFIG_PATH, config)
    return config


def load_requests():
    return load_json(REQUESTS_PATH, {"requests": []})


def save_requests(payload):
    atomic_write_json(REQUESTS_PATH, payload)


def ensure_requests():
    payload = load_requests()
    if "requests" not in payload:
        payload = {"requests": []}
    save_requests(payload)


def create_request(title, prompt):
    payload = load_requests()
    request_id = f"req_{int(time.time())}_{secrets.token_hex(4)}"
    request = {
        "id": request_id,
        "title": title,
        "prompt": prompt,
        "status": "pending",
        "response": "",
        "createdAt": utc_now(),
        "decidedAt": None,
    }
    payload["requests"].append(request)
    save_requests(payload)
    return request


def find_request(payload, request_id):
    for request in payload.get("requests", []):
        if request.get("id") == request_id:
            return request
    return None


def verify_access_key(config, access_key):
    try:
        salt = b64decode(config["accessKeySalt"])
    except (KeyError, ValueError):
        return False
    return hash_access_key(access_key, salt) == config.get("accessKeyHash")


def verify_password(config, password):
    try:
        salt = b64decode(config["passwordSalt"])
    except (KeyError, ValueError):
        return False
    return hash_password(password, salt) == config.get("passwordHash")


SESSIONS = {}


def create_session():
    token = secrets.token_urlsafe(24)
    expires_at = time.time() + SESSION_TTL_SECONDS
    SESSIONS[token] = expires_at
    return token


def is_session_valid(token):
    expires_at = SESSIONS.get(token)
    if not expires_at:
        return False
    if expires_at < time.time():
        SESSIONS.pop(token, None)
        return False
    return True


def clean_sessions():
    now = time.time()
    expired = [token for token, exp in SESSIONS.items() if exp < now]
    for token in expired:
        SESSIONS.pop(token, None)


def json_response(handler, payload, status=HTTPStatus.OK):
    data = json.dumps(payload, indent=2).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(data)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(data)


def html_response(handler, body, status=HTTPStatus.OK):
    data = body.encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "text/html; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(data)


APP_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CEO Ralph Remote Approval</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: "Georgia", "Times New Roman", serif; background: #f6f2ea; color: #2b2b2b; }
    header { padding: 24px 32px; background: #1d1f1f; color: #f6f2ea; }
    h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
    main { padding: 24px 32px 48px; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .card { background: #fff; border: 1px solid #e0d9cd; border-radius: 12px; padding: 16px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
    .status { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
    .pending { color: #c56a00; }
    .approved { color: #1a7f37; }
    .denied { color: #b42318; }
    textarea { width: 100%; min-height: 80px; border: 1px solid #d7cdbf; border-radius: 8px; padding: 8px; font-family: inherit; }
    button { padding: 10px 14px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
    .approve { background: #1a7f37; color: #fff; }
    .deny { background: #b42318; color: #fff; margin-left: 8px; }
    .meta { font-size: 12px; color: #5b5b5b; }
  </style>
</head>
<body>
  <header>
    <h1>CEO Ralph Approval Queue</h1>
  </header>
  <main>
    <div class="grid" id="requests"></div>
  </main>
  <script>
    async function fetchRequests() {
      const res = await fetch('/api/requests');
      if (!res.ok) return;
      const data = await res.json();
      renderRequests(data.requests || []);
    }

    function renderRequests(items) {
      const container = document.getElementById('requests');
      if (!items.length) {
        container.innerHTML = '<div class="card">No pending requests.</div>';
        return;
      }
      container.innerHTML = '';
      items.slice().reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const statusClass = item.status || 'pending';
        card.innerHTML = `
          <div class="status ${statusClass}">${statusClass}</div>
          <h3>${item.title}</h3>
          <p>${item.prompt}</p>
          <div class="meta">Requested: ${item.createdAt || ''}</div>
          <div style="margin-top:12px;">
            <textarea placeholder="Add context or answer...">${item.response || ''}</textarea>
            <div style="margin-top:10px;">
              <button class="approve">Approve</button>
              <button class="deny">Deny</button>
            </div>
          </div>
        `;
        const textarea = card.querySelector('textarea');
        const approveBtn = card.querySelector('.approve');
        const denyBtn = card.querySelector('.deny');
        approveBtn.onclick = () => submitDecision(item.id, 'approved', textarea.value);
        denyBtn.onclick = () => submitDecision(item.id, 'denied', textarea.value);
        if (item.status !== 'pending') {
          approveBtn.disabled = true;
          denyBtn.disabled = true;
          textarea.disabled = true;
        }
        container.appendChild(card);
      });
    }

    async function submitDecision(id, decision, response) {
      const res = await fetch(`/api/requests/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, response })
      });
      if (res.ok) fetchRequests();
    }

    fetchRequests();
    setInterval(fetchRequests, 3000);
  </script>
</body>
</html>
"""

LOGIN_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login - CEO Ralph Remote UI</title>
  <style>
    body { margin: 0; font-family: "Georgia", "Times New Roman", serif; background: #f6f2ea; color: #2b2b2b; }
    main { max-width: 420px; margin: 10vh auto; background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e0d9cd; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
    label { display: block; margin-bottom: 8px; font-weight: 600; }
    input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #d7cdbf; font-family: inherit; }
    button { margin-top: 16px; padding: 10px 14px; border-radius: 8px; border: none; background: #1d1f1f; color: #f6f2ea; font-weight: 600; cursor: pointer; width: 100%; }
  </style>
</head>
<body>
  <main>
    <h1>Remote UI Access</h1>
    <form method="post" action="/login">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required>
      <button type="submit">Sign In</button>
    </form>
  </main>
</body>
</html>
"""


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class RemoteUIHandler(BaseHTTPRequestHandler):
    server_version = "CEO-Ralph-RemoteUI/1.0"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), fmt % args))

    @property
    def config(self):
        return self.server.config

    def _parse_cookies(self):
        raw = self.headers.get("Cookie", "")
        cookies = {}
        for chunk in raw.split(";"):
            if "=" in chunk:
                name, value = chunk.strip().split("=", 1)
                cookies[name] = value
        return cookies

    def _authenticated(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            return verify_access_key(self.config, token)
        cookies = self._parse_cookies()
        session_token = cookies.get(SESSION_COOKIE)
        if session_token and is_session_valid(session_token):
            return True
        return False

    def _require_auth(self):
        if self._authenticated():
            return True
        self.send_response(HTTPStatus.UNAUTHORIZED)
        self.send_header("WWW-Authenticate", "Bearer")
        self.end_headers()
        return False

    def _set_session_cookie(self, token):
        parts = [
            f"{SESSION_COOKIE}={token}",
            "Path=/",
            "HttpOnly",
            "SameSite=Strict",
        ]
        self.send_header("Set-Cookie", "; ".join(parts))

    def _read_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return b""
        return self.rfile.read(length)

    def _redirect(self, target):
        self.send_response(HTTPStatus.FOUND)
        self.send_header("Location", target)
        self.end_headers()

    def do_GET(self):
        clean_sessions()
        path = urllib.parse.urlparse(self.path).path
        if path == "/login":
            html_response(self, LOGIN_HTML)
            return
        if path == "/":
            if not self._authenticated():
                self._redirect("/login")
                return
            html_response(self, APP_HTML)
            return
        if path == "/api/requests":
            if not self._require_auth():
                return
            payload = load_requests()
            json_response(self, payload)
            return
        self.send_response(HTTPStatus.NOT_FOUND)
        self.end_headers()

    def do_POST(self):
        clean_sessions()
        path = urllib.parse.urlparse(self.path).path
        if path == "/login":
            body = self._read_body().decode("utf-8")
            fields = urllib.parse.parse_qs(body)
            password = fields.get("password", [""])[0]
            if verify_password(self.config, password):
                token = create_session()
                self.send_response(HTTPStatus.FOUND)
                self._set_session_cookie(token)
                self.send_header("Location", "/")
                self.end_headers()
            else:
                html_response(self, LOGIN_HTML, status=HTTPStatus.UNAUTHORIZED)
            return
        if path.startswith("/api/requests/") and path.endswith("/decision"):
            if not self._require_auth():
                return
            request_id = path.split("/")[3] if len(path.split("/")) > 3 else None
            if not request_id:
                json_response(self, {"error": "invalid request id"}, status=HTTPStatus.BAD_REQUEST)
                return
            try:
                payload = json.loads(self._read_body().decode("utf-8") or "{}")
            except json.JSONDecodeError:
                json_response(self, {"error": "invalid json"}, status=HTTPStatus.BAD_REQUEST)
                return
            decision = payload.get("decision")
            response_text = payload.get("response", "")
            if decision not in {"approved", "denied"}:
                json_response(self, {"error": "decision must be approved or denied"}, status=HTTPStatus.BAD_REQUEST)
                return
            requests_payload = load_requests()
            request = find_request(requests_payload, request_id)
            if not request:
                json_response(self, {"error": "request not found"}, status=HTTPStatus.NOT_FOUND)
                return
            if request.get("status") != "pending":
                json_response(self, {"error": "request already decided"}, status=HTTPStatus.CONFLICT)
                return
            request["status"] = decision
            request["response"] = response_text
            request["decidedAt"] = utc_now()
            save_requests(requests_payload)
            json_response(self, {"ok": True, "request": request})
            return
        self.send_response(HTTPStatus.NOT_FOUND)
        self.end_headers()


def cmd_setup(args):
    password = args.password or prompt_password()
    config, access_key = ensure_config(args.port, password=password)
    ensure_requests()
    if access_key:
        print("Remote UI configured.")
        print(f"Access key (store securely): {access_key}")
    else:
        print("Remote UI already configured.")
    print(f"Config path: {CONFIG_PATH}")
    print(f"Local URL: http://127.0.0.1:{config['port']}")


def cmd_set_public_url(args):
    config = update_config({"publicUrl": args.public_url})
    print(f"Public URL set: {config.get('publicUrl')}")


def cmd_start(args):
    config = load_json(CONFIG_PATH, None)
    if not config:
        raise RuntimeError("Remote UI is not set up. Run `setup` first.")
    if not config.get("instanceId"):
        config = update_config({"instanceId": secrets.token_hex(6)})
    access_key = None
    ensure_requests()
    port = config["port"]
    if access_key:
        print("Remote UI configured.")
        print(f"Access key (store securely): {access_key}")
    print(f"Instance ID: {config.get('instanceId')}")
    print(f"Local URL: http://127.0.0.1:{port}")
    if config.get("publicUrl"):
        print(f"Public URL: {config['publicUrl']}")
    server = ThreadingHTTPServer((args.bind, port), RemoteUIHandler)
    server.config = config
    print("Remote UI server running. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")


def cmd_request(args):
    config = load_json(CONFIG_PATH, None)
    if not config:
        raise RuntimeError("Remote UI is not set up. Run `setup` first.")
    ensure_requests()
    request = create_request(args.title, args.prompt)
    response = {"request": request}
    if config.get("publicUrl"):
        response["publicUrl"] = config["publicUrl"]
    response["localUrl"] = f"http://127.0.0.1:{config['port']}"
    print(json.dumps(response, indent=2))


def cmd_wait(args):
    start_time = time.time()
    while True:
        payload = load_requests()
        request = find_request(payload, args.request_id)
        if not request:
            print(json.dumps({"error": "request not found"}, indent=2))
            return 1
        if request.get("status") != "pending":
            print(json.dumps({"request": request}, indent=2))
            return 0
        if args.timeout and (time.time() - start_time) > args.timeout:
            print(json.dumps({"error": "timeout"}, indent=2))
            return 1
        time.sleep(2)


def cmd_rotate_key(args):
    config = load_json(CONFIG_PATH, None)
    if not config:
        raise RuntimeError("Remote UI is not set up. Run `setup` first.")
    access_key = generate_access_key()
    salt = secrets.token_bytes(16)
    config.update(
        {
            "accessKeySalt": b64encode(salt),
            "accessKeyHash": hash_access_key(access_key, salt),
            "updatedAt": utc_now(),
        }
    )
    atomic_write_json(CONFIG_PATH, config)
    print(f"New access key (store securely): {access_key}")


def cmd_rotate_password(args):
    config = load_json(CONFIG_PATH, None)
    if not config:
        raise RuntimeError("Remote UI is not set up. Run `setup` first.")
    password = prompt_password()
    password_salt = secrets.token_bytes(16)
    config.update(
        {
            "passwordSalt": b64encode(password_salt),
            "passwordHash": hash_password(password, password_salt),
            "updatedAt": utc_now(),
        }
    )
    atomic_write_json(CONFIG_PATH, config)
    print("Password rotated.")


def start_server_thread(bind_addr, port, config):
    server = ThreadingHTTPServer((bind_addr, port), RemoteUIHandler)
    server.config = config
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def cmd_enable(args):
    config = load_json(CONFIG_PATH, None)
    if not config:
        password = args.password or prompt_password()
        config, access_key = ensure_config(args.port, password=password)
        print("Remote UI configured.")
        print(f"Access key (store securely): {access_key}")
    if not config.get("instanceId"):
        config = update_config({"instanceId": secrets.token_hex(6)})
    ensure_requests()
    port = config["port"]
    start_server_thread(args.bind, port, config)
    print(f"Instance ID: {config.get('instanceId')}")
    print(f"Local URL: http://127.0.0.1:{port}")
    try:
        process = subprocess.Popen(
            [
                "cloudflared",
                "tunnel",
                "--url",
                f"http://127.0.0.1:{port}",
                "--no-autoupdate",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
    except FileNotFoundError:
        raise RuntimeError("cloudflared is not installed.")
    public_url = None
    while True:
        line = process.stdout.readline()
        if not line:
            break
        match = TUNNEL_URL_PATTERN.search(line)
        if match:
            public_url = match.group(0)
            break
    if public_url:
        update_config({"publicUrl": public_url})
        print(f"Public URL: {public_url}")
    else:
        print("Public URL not detected. Check cloudflared output.")
    print("Remote UI running. Press Ctrl+C to stop.")
    try:
        process.wait()
    except KeyboardInterrupt:
        process.terminate()


def build_parser():
    parser = argparse.ArgumentParser(description="CEO Ralph Remote UI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    setup_parser = subparsers.add_parser("setup", help="Initialize remote UI config")
    setup_parser.add_argument("--port", type=int, default=8123)
    setup_parser.add_argument("--password")
    setup_parser.set_defaults(func=cmd_setup)

    start_parser = subparsers.add_parser("start", help="Start the remote UI server")
    start_parser.add_argument("--port", type=int, default=8123)
    start_parser.add_argument("--bind", default="127.0.0.1")
    start_parser.set_defaults(func=cmd_start)

    enable_parser = subparsers.add_parser("enable", help="Start server + HTTPS tunnel")
    enable_parser.add_argument("--port", type=int, default=8123)
    enable_parser.add_argument("--bind", default="127.0.0.1")
    enable_parser.add_argument("--password")
    enable_parser.set_defaults(func=cmd_enable)

    request_parser = subparsers.add_parser("request", help="Create an approval request")
    request_parser.add_argument("--title", required=True)
    request_parser.add_argument("--prompt", required=True)
    request_parser.set_defaults(func=cmd_request)

    wait_parser = subparsers.add_parser("wait", help="Wait for approval response")
    wait_parser.add_argument("request_id")
    wait_parser.add_argument("--timeout", type=int, default=0)
    wait_parser.set_defaults(func=cmd_wait)

    public_parser = subparsers.add_parser("set-public-url", help="Set the public URL")
    public_parser.add_argument("public_url")
    public_parser.set_defaults(func=cmd_set_public_url)

    rotate_parser = subparsers.add_parser("rotate-key", help="Rotate access key")
    rotate_parser.set_defaults(func=cmd_rotate_key)

    rotate_password_parser = subparsers.add_parser("rotate-password", help="Rotate password")
    rotate_password_parser.set_defaults(func=cmd_rotate_password)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    try:
        result = args.func(args)
    except RuntimeError as exc:
        print(str(exc))
        return 1
    return 0 if result is None else result


if __name__ == "__main__":
    raise SystemExit(main())

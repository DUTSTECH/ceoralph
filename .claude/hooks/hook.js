#!/usr/bin/env node
// clnode hook script for Windows — Claude Code stdin→stdout protocol
// Replaces hook.sh + jq + curl with pure Node.js
//
// Safety: always exit 0 to never block Claude Code.
// If daemon is unreachable, silently pass through.

const http = require("http");

const CLNODE_PORT = process.env.CLNODE_PORT || "3100";
const CLNODE_URL = `http://localhost:${CLNODE_PORT}`;

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
    // If no data comes within 2s, resolve empty
    setTimeout(() => resolve(data), 2000);
  });
}

function postToHook(event, body) {
  return new Promise((resolve) => {
    const url = new URL(`/hooks/${event}`, CLNODE_URL);
    const req = http.request(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        timeout: 3000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
        res.on("error", () => resolve(""));
      }
    );
    req.on("error", () => resolve(""));
    req.on("timeout", () => {
      req.destroy();
      resolve("");
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  try {
    const input = await readStdin();
    if (!input) process.exit(0);

    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch {
      process.exit(0);
    }

    const event = parsed.hook_event_name || "unknown";
    const response = await postToHook(event, input);

    if (response && response !== "{}") {
      process.stdout.write(response);
    }
  } catch {
    // Never block Claude Code
  }
  process.exit(0);
}

main();

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { initDb, closeDb } from "./db.js";
import { initWebSocket } from "./ws.js";
import api from "./routes/api.js";
import hooks from "./routes/hooks.js";
import ui from "./routes/ui.js";

const PORT = parseInt(process.env.RALPH_DASHBOARD_PORT ?? "3200", 10);

const app = new Hono();

// Middleware
app.use("/*", cors());

// Routes
app.route("/api", api);
app.route("/hooks", hooks);
app.route("/", ui);

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

async function main() {
  // Initialize database
  const dbPath = process.env.RALPH_DB_PATH ?? ":memory:";
  await initDb(dbPath);
  console.log(`[ralph-dashboard] Database initialized (${dbPath})`);

  // Start server
  const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`[ralph-dashboard] Running at http://localhost:${info.port}`);
    console.log(`[ralph-dashboard] WebSocket at ws://localhost:${info.port}/ws`);
  });

  // Initialize WebSocket on the underlying HTTP server
  initWebSocket(server);

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[ralph-dashboard] Shutting down...");
    await closeDb();
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[ralph-dashboard] Fatal error:", err);
  process.exit(1);
});

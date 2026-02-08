import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

let wss: WebSocketServer;

export function initWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "connected", timestamp: new Date().toISOString() }));

    ws.on("error", (err) => {
      console.error("[ws] client error:", err.message);
    });
  });

  return wss;
}

export function broadcast(event: string, data: unknown): void {
  if (!wss) return;

  const message = JSON.stringify({ type: event, data, timestamp: new Date().toISOString() });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function getWss(): WebSocketServer | undefined {
  return wss;
}

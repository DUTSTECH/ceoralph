import { Hono } from "hono";
import { query } from "../db.js";

const api = new Hono();

// GET /api/specs — All specs with progress
api.get("/specs", async (c) => {
  const specs = await query(`
    SELECT
      s.*,
      COUNT(w.worker_id) as total_workers,
      COUNT(CASE WHEN w.status = 'completed' THEN 1 END) as completed_workers,
      COUNT(CASE WHEN w.status = 'failed' THEN 1 END) as failed_workers,
      COUNT(CASE WHEN w.status = 'running' THEN 1 END) as running_workers
    FROM specs s
    LEFT JOIN workers w ON s.spec_id = w.spec_id
    GROUP BY s.spec_id, s.name, s.goal, s.phase, s.executor, s.branch, s.created_at, s.completed_at
    ORDER BY s.created_at DESC
  `);
  return c.json(specs);
});

// GET /api/specs/:id — Single spec details
api.get("/specs/:id", async (c) => {
  const id = c.req.param("id");
  const specs = await query(
    `SELECT * FROM specs WHERE spec_id = $1 OR name = $1`,
    id
  );
  if (specs.length === 0) return c.json({ error: "Spec not found" }, 404);
  return c.json(specs[0]);
});

// GET /api/specs/:id/workers — Workers for a spec
api.get("/specs/:id/workers", async (c) => {
  const id = c.req.param("id");
  const workers = await query(
    `SELECT w.* FROM workers w
     JOIN specs s ON w.spec_id = s.spec_id
     WHERE s.spec_id = $1 OR s.name = $1
     ORDER BY w.started_at ASC`,
    id
  );
  return c.json(workers);
});

// GET /api/workers — All workers (filterable)
api.get("/workers", async (c) => {
  const status = c.req.query("status");
  const executor = c.req.query("executor");

  let sql = "SELECT * FROM workers WHERE 1=1";
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }
  if (executor) {
    params.push(executor);
    sql += ` AND executor = $${params.length}`;
  }

  sql += " ORDER BY started_at DESC";

  const workers = await query(sql, ...params);
  return c.json(workers);
});

// GET /api/delegation-log — Event log
api.get("/delegation-log", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "100", 10);
  const specId = c.req.query("spec_id");

  let sql = "SELECT * FROM delegation_log";
  const params: unknown[] = [];

  if (specId) {
    params.push(specId);
    sql += ` WHERE spec_id = $${params.length}`;
  }

  sql += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const logs = await query(sql, ...params);
  return c.json(logs);
});

// GET /api/stats — Aggregate statistics
api.get("/stats", async (c) => {
  const [stats] = await query(`
    SELECT
      COUNT(DISTINCT s.spec_id) as total_specs,
      COUNT(DISTINCT CASE WHEN s.completed_at IS NOT NULL THEN s.spec_id END) as completed_specs,
      COUNT(w.worker_id) as total_workers,
      COUNT(CASE WHEN w.status = 'completed' THEN 1 END) as completed_workers,
      COUNT(CASE WHEN w.status = 'failed' THEN 1 END) as failed_workers,
      COUNT(CASE WHEN w.status = 'running' THEN 1 END) as running_workers,
      AVG(CASE WHEN w.duration_ms IS NOT NULL THEN w.duration_ms END) as avg_duration_ms,
      COUNT(CASE WHEN w.executor = 'codex' THEN 1 END) as codex_workers,
      COUNT(CASE WHEN w.executor = 'task-agent' THEN 1 END) as task_agent_workers
    FROM specs s
    LEFT JOIN workers w ON s.spec_id = w.spec_id
  `);
  return c.json(stats ?? {});
});

// GET /api/context/:specId — Smart context for a spec
api.get("/context/:specId", async (c) => {
  const specId = c.req.param("specId");
  const entries = await query(
    `SELECT * FROM context_entries WHERE spec_id = $1 ORDER BY created_at DESC`,
    specId
  );
  return c.json(entries);
});

export default api;

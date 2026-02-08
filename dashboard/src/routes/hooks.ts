import { Hono } from "hono";
import { query, run } from "../db.js";
import { broadcast } from "../ws.js";

const hooks = new Hono();

// POST /hooks/worker-start — Called when a worker is spawned
hooks.post("/worker-start", async (c) => {
  const body = await c.req.json();

  const {
    workerId,
    specId,
    specName,
    sessionId,
    taskId,
    taskTitle,
    executor,
  } = body;

  // Ensure spec exists
  const existingSpecs = await query(
    `SELECT spec_id FROM specs WHERE name = $1`,
    specName ?? specId
  );

  let resolvedSpecId = specId;
  if (existingSpecs.length === 0 && specName) {
    await run(
      `INSERT INTO specs (spec_id, name) VALUES ($1, $2)`,
      specId ?? specName,
      specName
    );
    resolvedSpecId = specId ?? specName;
  } else if (existingSpecs.length > 0) {
    resolvedSpecId = (existingSpecs[0] as { spec_id: string }).spec_id;
  }

  // Insert worker
  await run(
    `INSERT INTO workers (worker_id, spec_id, session_id, task_id, task_title, executor, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'running')`,
    workerId,
    resolvedSpecId,
    sessionId ?? null,
    taskId,
    taskTitle ?? null,
    executor
  );

  // Log event
  await run(
    `INSERT INTO delegation_log (spec_id, worker_id, event, data)
     VALUES ($1, $2, 'worker-start', $3)`,
    resolvedSpecId,
    workerId,
    JSON.stringify(body)
  );

  // Broadcast to WebSocket clients
  broadcast("worker-start", {
    workerId,
    specId: resolvedSpecId,
    taskId,
    taskTitle,
    executor,
    status: "running",
  });

  return c.json({ ok: true });
});

// POST /hooks/worker-stop — Called when a worker completes
hooks.post("/worker-stop", async (c) => {
  const body = await c.req.json();

  const {
    workerId,
    result,
    summary,
    filesChanged,
    commitHash,
    durationMs,
  } = body;

  const status = result === "TASK_COMPLETE" ? "completed" : "failed";

  await run(
    `UPDATE workers SET
      status = $1,
      completed_at = now(),
      result = $2,
      summary = $3,
      files_changed = $4,
      commit_hash = $5,
      duration_ms = $6
     WHERE worker_id = $7`,
    status,
    result ?? null,
    summary ?? null,
    filesChanged ?? [],
    commitHash ?? null,
    durationMs ?? null,
    workerId
  );

  // Log event
  await run(
    `INSERT INTO delegation_log (spec_id, worker_id, event, data)
     VALUES (
       (SELECT spec_id FROM workers WHERE worker_id = $1),
       $1, 'worker-stop', $2
     )`,
    workerId,
    JSON.stringify(body)
  );

  // Broadcast
  broadcast("worker-stop", { workerId, status, result, durationMs });

  return c.json({ ok: true });
});

// POST /hooks/session-stop — Called when session stops
hooks.post("/session-stop", async (c) => {
  const body = await c.req.json();

  // Mark any running workers as failed
  await run(
    `UPDATE workers SET status = 'failed', completed_at = now(), result = 'SESSION_STOPPED'
     WHERE status = 'running'`
  );

  // Log event
  await run(
    `INSERT INTO delegation_log (event, data)
     VALUES ('session-stop', $1)`,
    JSON.stringify(body)
  );

  broadcast("session-stop", body);

  return c.json({ ok: true });
});

// POST /hooks/subagent-start — Generic Claude Code hook for subagent start
hooks.post("/subagent-start", async (c) => {
  const body = await c.req.json();

  await run(
    `INSERT INTO delegation_log (event, data)
     VALUES ('subagent-start', $1)`,
    JSON.stringify(body)
  );

  broadcast("subagent-start", body);

  return c.json({ ok: true });
});

// POST /hooks/subagent-stop — Generic Claude Code hook for subagent stop
hooks.post("/subagent-stop", async (c) => {
  const body = await c.req.json();

  await run(
    `INSERT INTO delegation_log (event, data)
     VALUES ('subagent-stop', $1)`,
    JSON.stringify(body)
  );

  broadcast("subagent-stop", body);

  return c.json({ ok: true });
});

export default hooks;

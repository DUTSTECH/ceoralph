import { query } from "./db.js";

interface ContextEntry {
  entry_id: string;
  spec_id: string;
  worker_id: string | null;
  entry_type: string;
  content: string;
  tags: string[];
  created_at: string;
}

export async function addContextEntry(
  specId: string,
  entryType: string,
  content: string,
  workerId?: string,
  tags?: string[]
): Promise<void> {
  const tagsSql = tags && tags.length > 0
    ? `ARRAY[${tags.map((t) => `'${t.replace(/'/g, "''")}'`).join(",")}]`
    : "NULL";

  await query(
    `INSERT INTO context_entries (spec_id, worker_id, entry_type, content, tags)
     VALUES ($1, $2, $3, $4, ${tagsSql})`,
    specId,
    workerId ?? null,
    entryType,
    content
  );
}

export async function getContextForSpec(specId: string): Promise<ContextEntry[]> {
  return query<ContextEntry>(
    `SELECT * FROM context_entries WHERE spec_id = $1 ORDER BY created_at DESC`,
    specId
  );
}

export async function getContextByType(
  specId: string,
  entryType: string
): Promise<ContextEntry[]> {
  return query<ContextEntry>(
    `SELECT * FROM context_entries WHERE spec_id = $1 AND entry_type = $2 ORDER BY created_at DESC`,
    specId,
    entryType
  );
}

export async function getRecentDecisions(specId: string, limit = 10): Promise<ContextEntry[]> {
  return query<ContextEntry>(
    `SELECT * FROM context_entries
     WHERE spec_id = $1 AND entry_type = 'decision'
     ORDER BY created_at DESC LIMIT $2`,
    specId,
    limit
  );
}

export async function getBlockers(specId: string): Promise<ContextEntry[]> {
  return query<ContextEntry>(
    `SELECT * FROM context_entries
     WHERE spec_id = $1 AND entry_type = 'blocker'
     ORDER BY created_at DESC`,
    specId
  );
}

export async function buildSmartContext(specId: string): Promise<{
  decisions: ContextEntry[];
  blockers: ContextEntry[];
  learnings: ContextEntry[];
  handoffs: ContextEntry[];
}> {
  const [decisions, blockers, learnings, handoffs] = await Promise.all([
    getContextByType(specId, "decision"),
    getContextByType(specId, "blocker"),
    getContextByType(specId, "learning"),
    getContextByType(specId, "handoff"),
  ]);

  return { decisions, blockers, learnings, handoffs };
}

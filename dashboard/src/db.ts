import duckdb from "duckdb";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: duckdb.Database;
let connection: duckdb.Connection;

export function getDb(): duckdb.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export function getConnection(): duckdb.Connection {
  if (!connection) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return connection;
}

export async function initDb(dbPath = ":memory:"): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new duckdb.Database(dbPath, (err) => {
      if (err) return reject(err);
      connection = db.connect();
      const schemaPath = join(__dirname, "schema.sql");
      const schema = readFileSync(schemaPath, "utf-8");
      connection.exec(schema, (execErr) => {
        if (execErr) return reject(execErr);
        resolve();
      });
    });
  });
}

export function query<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (params.length > 0) {
      connection.all(sql, ...params, (err: Error | null, rows: T[]) => {
        if (err) return reject(err);
        resolve(rows ?? []);
      });
    } else {
      connection.all(sql, (err: Error | null, rows: T[]) => {
        if (err) return reject(err);
        resolve(rows ?? []);
      });
    }
  });
}

export function run(sql: string, ...params: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (params.length > 0) {
      connection.run(sql, ...params, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    } else {
      connection.run(sql, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    }
  });
}

export async function closeDb(): Promise<void> {
  return new Promise((resolve) => {
    if (db) {
      db.close(() => resolve());
    } else {
      resolve();
    }
  });
}

-- CEO Ralph Dashboard Schema
-- DuckDB tables for tracking specs, workers, and delegation events

CREATE TABLE IF NOT EXISTS specs (
  spec_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  name VARCHAR NOT NULL UNIQUE,
  goal TEXT,
  phase VARCHAR DEFAULT 'research',
  executor VARCHAR DEFAULT 'auto',
  branch VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
  worker_id VARCHAR PRIMARY KEY,
  spec_id VARCHAR REFERENCES specs(spec_id),
  session_id VARCHAR,
  task_id VARCHAR NOT NULL,
  task_title VARCHAR,
  executor VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  attempt INTEGER DEFAULT 1,
  result VARCHAR,
  summary TEXT,
  files_changed VARCHAR[],
  commit_hash VARCHAR,
  duration_ms INTEGER,
  token_usage JSON
);

CREATE TABLE IF NOT EXISTS delegation_log (
  log_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  spec_id VARCHAR,
  worker_id VARCHAR,
  event VARCHAR NOT NULL,
  data JSON,
  timestamp TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS context_entries (
  entry_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  spec_id VARCHAR,
  worker_id VARCHAR,
  entry_type VARCHAR,
  content TEXT,
  tags VARCHAR[],
  created_at TIMESTAMP DEFAULT now()
);

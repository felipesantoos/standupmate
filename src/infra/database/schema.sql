/**
 * SQLite Database Schema
 * 
 * Infrastructure layer - database structure.
 * Domain doesn't know about this.
 */

-- =============================================================================
-- TEMPLATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  author TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- Sections stored as JSON for flexibility
  sections_json TEXT NOT NULL,
  
  -- Constraints
  CHECK (length(name) >= 3),
  CHECK (length(name) <= 200)
);

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_is_default ON templates(is_default);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at);

-- =============================================================================
-- TICKETS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  template_version TEXT NOT NULL,
  status TEXT NOT NULL,
  -- Ticket data stored as JSON (flexible schema based on template)
  data_json TEXT NOT NULL,
  -- Metadata stored as JSON
  metadata_json TEXT NOT NULL,
  -- Tags stored as JSON array
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  
  -- Foreign key to templates
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT,
  
  -- Constraints
  CHECK (status IN ('draft', 'in_progress', 'completed', 'archived'))
);

-- Indexes for tickets (optimize queries)
CREATE INDEX IF NOT EXISTS idx_tickets_template_id ON tickets(template_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at);
CREATE INDEX IF NOT EXISTS idx_tickets_completed_at ON tickets(completed_at);

-- =============================================================================
-- FULL-TEXT SEARCH (FTS5)
-- =============================================================================

-- Full-text search on ticket data for fast search
CREATE VIRTUAL TABLE IF NOT EXISTS tickets_fts USING fts5(
  id UNINDEXED,
  data_text,
  tags_text,
  content='tickets',
  content_rowid='rowid'
);

-- Triggers to keep FTS table synchronized
CREATE TRIGGER IF NOT EXISTS tickets_fts_insert AFTER INSERT ON tickets BEGIN
  INSERT INTO tickets_fts(rowid, id, data_text, tags_text)
  VALUES (
    NEW.rowid,
    NEW.id,
    NEW.data_json,
    NEW.tags_json
  );
END;

CREATE TRIGGER IF NOT EXISTS tickets_fts_update AFTER UPDATE ON tickets BEGIN
  UPDATE tickets_fts
  SET data_text = NEW.data_json,
      tags_text = NEW.tags_json
  WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER IF NOT EXISTS tickets_fts_delete AFTER DELETE ON tickets BEGIN
  DELETE FROM tickets_fts WHERE rowid = OLD.rowid;
END;

-- =============================================================================
-- DEFAULT DATA (Optional)
-- =============================================================================

-- Insert default template if not exists
INSERT OR IGNORE INTO templates (
  id,
  name,
  description,
  version,
  is_default,
  created_at,
  updated_at,
  sections_json
) VALUES (
  'template-default',
  'Default Template',
  'Basic template for tracking work',
  '1.0.0',
  1,
  datetime('now'),
  datetime('now'),
  '[{"id":"section-1","title":"Details","order":1,"fields":[{"id":"title","label":"Title","type":"text","required":true,"order":1},{"id":"description","label":"Description","type":"textarea","required":false,"order":2}]}]'
);


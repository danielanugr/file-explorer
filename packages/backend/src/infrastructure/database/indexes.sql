-- Performance indexes for scalability

-- Index for folder parent-child relationships
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

-- Index for folder name searches
CREATE INDEX IF NOT EXISTS idx_folders_name ON folders(name);

-- Composite index for folder hierarchy queries
CREATE INDEX IF NOT EXISTS idx_folders_parent_name ON folders(parent_id, name);

-- Index for file folder relationships
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);

-- Index for file name searches
CREATE INDEX IF NOT EXISTS idx_files_name ON files(name);

-- Index for file size queries
CREATE INDEX IF NOT EXISTS idx_files_size ON files(size_bytes);

-- Composite index for file queries
CREATE INDEX IF NOT EXISTS idx_files_folder_name ON files(folder_id, name);

-- Indexes for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at);
CREATE INDEX IF NOT EXISTS idx_folders_updated_at ON folders(updated_at);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_updated_at ON files(updated_at);

-- Full-text search indexes (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_folders_name_gin ON folders USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_files_name_gin ON files USING gin(to_tsvector('english', name));
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

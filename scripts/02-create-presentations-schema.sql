-- Create presentations table to store uploaded presentation metadata
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  total_slides INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create slides table with vector embeddings for similarity search
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  slide_type TEXT NOT NULL, -- 'title', 'content', 'toc', 'thankyou'
  title TEXT,
  content TEXT NOT NULL,
  bullet_points TEXT[],
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(presentation_id, slide_number)
);

-- Create index for faster similarity searches using cosine distance
CREATE INDEX IF NOT EXISTS slides_embedding_idx ON slides 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for faster lookups by presentation
CREATE INDEX IF NOT EXISTS slides_presentation_id_idx ON slides(presentation_id);

-- Create index for slide type filtering
CREATE INDEX IF NOT EXISTS slides_type_idx ON slides(slide_type);

-- Add comments for documentation
COMMENT ON TABLE presentations IS 'Stores uploaded presentation files for similarity matching';
COMMENT ON TABLE slides IS 'Stores individual slides with vector embeddings for semantic search';
COMMENT ON COLUMN slides.embedding IS 'Vector embedding from OpenAI text-embedding-3-small (1536 dimensions)';

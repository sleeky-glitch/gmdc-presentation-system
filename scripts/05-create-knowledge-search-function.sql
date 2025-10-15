-- Search function for knowledge base
-- Run this AFTER script 04

CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  document_title TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kbc.id,
    kbc.document_id,
    kbd.title as document_title,
    kbc.content,
    kbc.metadata,
    1 - (kbc.embedding <=> query_embedding) as similarity
  FROM knowledge_base_chunks kbc
  JOIN knowledge_base_documents kbd ON kbc.document_id = kbd.id
  WHERE 1 - (kbc.embedding <=> query_embedding) > match_threshold
  ORDER BY kbc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_slides(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  presentation_id UUID,
  slide_number INT,
  slide_type TEXT,
  title TEXT,
  content TEXT,
  bullet_points TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    slides.id,
    slides.presentation_id,
    slides.slide_number,
    slides.slide_type,
    slides.title,
    slides.content,
    slides.bullet_points,
    1 - (slides.embedding <=> query_embedding) AS similarity
  FROM slides
  WHERE 1 - (slides.embedding <=> query_embedding) > match_threshold
  ORDER BY slides.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment
COMMENT ON FUNCTION match_slides IS 'Finds slides similar to query embedding using cosine similarity';

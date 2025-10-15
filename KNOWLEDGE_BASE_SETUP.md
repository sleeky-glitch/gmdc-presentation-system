# GMDC Knowledge Base Setup Guide

## Overview

The GMDC Presentation System now includes a comprehensive knowledge base feature that allows you to store domain-specific content and use it to generate more accurate, contextually relevant presentations.

## Setup Steps

### 1. Run Database Scripts

Execute the following SQL scripts in order:

\`\`\`bash
# Enable pgvector extension for vector similarity search
Run script: scripts/01-enable-vector-extension.sql

# Create presentations and slides tables for reference presentations
Run script: scripts/02-create-presentations-schema.sql

# Create similarity search function
Run script: scripts/03-create-similarity-function.sql

# Create knowledge base tables
Run script: scripts/04-create-knowledge-base-schema.sql
\`\`\`

### 2. Ingest Knowledge Base Content

Use the Knowledge Base Manager in the UI to add your domain-specific content:

1. Navigate to the main page
2. Find the "Knowledge Base Manager" card at the top
3. Enter document details:
   - **Title**: Descriptive name (e.g., "GMDC Digital Initiatives Review 2024")
   - **Document Type**: Select from presentation, report, policy, technical, or other
   - **Content**: Paste your structured content

4. Click "Ingest Knowledge Base" to process and store the content

### 3. Content Format

The system works best with structured content. For presentations, use this format:

\`\`\`
SLIDE 1: Title of Slide
- Main point 1
- Main point 2
  • Sub-point
  • Sub-point

TABLE: Table Title
Column1 | Column2 | Column3
Value1 | Value2 | Value3

---

SLIDE 2: Next Slide Title
...
\`\`\`

### 4. Using Knowledge Base in Generation

When creating a new presentation:

1. Toggle "Use Knowledge Base" ON (blue toggle)
2. The system will automatically search for relevant content based on your presentation title and summary
3. Retrieved knowledge will be used as authoritative context for content generation

## Features

### Vector Similarity Search

- Content is automatically chunked and converted to embeddings
- Semantic search finds relevant content even if exact keywords don't match
- Similarity threshold of 0.7 ensures high-quality matches

### Multi-Source Context

The system can combine:
- **Knowledge Base**: Domain-specific facts and figures
- **Similar Presentations**: Style and structure patterns
- **Uploaded Documents**: Additional context from files

### Metadata Tracking

Each knowledge chunk stores:
- Slide number (for presentation content)
- Section index
- Document type
- Custom metadata

## API Endpoints

### Ingest Knowledge

\`\`\`typescript
POST /api/knowledge-base/ingest
{
  "title": "Document Title",
  "documentType": "presentation",
  "content": "Full document content...",
  "metadata": { "uploadedAt": "2024-01-15" }
}
\`\`\`

### Search Knowledge

\`\`\`typescript
POST /api/knowledge-base/search
{
  "query": "digital transformation initiatives",
  "matchThreshold": 0.7,
  "matchCount": 5
}
\`\`\`

## Example: GMDC Content

The system has been pre-configured with comprehensive GMDC content including:

1. **Digital and IT Initiatives** (June 2024)
   - Digital Fleet Management System
   - Customer Experience Improvements
   - System-Based Allocation Mechanism
   - Integrated Digital Control Tower

2. **Kadipani Fluorspar Asset**
   - Project reserves and capacity
   - JV structure and terms
   - Financial projections
   - Market positioning

3. **Environmental Sustainability**
   - Legal framework
   - NGT guidelines
   - Compliance requirements
   - Case studies

## Best Practices

1. **Chunk Size**: Keep individual content chunks under 1000 characters for optimal embedding quality
2. **Structure**: Use clear headings and bullet points for better parsing
3. **Updates**: Re-ingest updated documents with new titles to maintain version history
4. **Relevance**: More specific queries return better matches - use detailed presentation summaries

## Troubleshooting

### No Knowledge Base Results

- Check that scripts 01-04 have been executed successfully
- Verify content has been ingested (check Supabase `knowledge_base_documents` table)
- Lower the match threshold (default 0.7) if needed

### Poor Quality Matches

- Ensure content is well-structured with clear topics
- Use more specific presentation titles and summaries
- Add more domain-specific content to the knowledge base

### Performance Issues

- Knowledge base search adds ~500ms to generation time
- Consider increasing `match_count` parameter for more context
- Monitor Supabase vector index performance

## Deployment

After pushing to git and deploying to your server:

\`\`\`bash
cd gmdc-presentation-system
git pull origin main
npm install
npm run build
pm2 restart gmdc-presentation
\`\`\`

The knowledge base feature is now ready to use!

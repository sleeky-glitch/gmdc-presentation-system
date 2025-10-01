# GMDC Presentation System with AI-Powered Similarity Matching

An advanced presentation generation system for Gujarat Mineral Development Corporation (GMDC) that uses AI and vector embeddings to create professional presentations based on patterns from existing presentations.

## Features

### Core Functionality
- **AI-Powered Content Generation**: Uses OpenAI GPT-4 to generate professional presentation content
- **PowerPoint Export**: Native .pptx export with GMDC branding
- **Document Processing**: Supports Excel, PDF, and Word documents as knowledge base
- **Custom Templates**: Professional GMDC-branded slide layouts

### Advanced Features (NEW)
- **Vector Similarity Search**: Uses pgvector to find similar presentations
- **RAG (Retrieval-Augmented Generation)**: Generates content based on patterns from uploaded reference presentations
- **Semantic Understanding**: Embeddings-based matching for intelligent content suggestions
- **Reference Library**: Upload and manage a library of reference presentations

## Architecture

### Technology Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase PostgreSQL with pgvector extension
- **AI/ML**: OpenAI GPT-4, text-embedding-3-small
- **Export**: PptxGenJS for PowerPoint generation

### Database Schema

\`\`\`sql
-- Presentations table
CREATE TABLE presentations (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  total_slides INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Slides table with vector embeddings
CREATE TABLE slides (
  id UUID PRIMARY KEY,
  presentation_id UUID REFERENCES presentations(id),
  slide_number INTEGER NOT NULL,
  slide_type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  bullet_points TEXT[],
  embedding VECTOR(1536), -- OpenAI embedding
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Vector similarity search index
CREATE INDEX slides_embedding_idx ON slides 
USING ivfflat (embedding vector_cosine_ops);
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account with PostgreSQL database
- OpenAI API key

### Environment Variables

\`\`\`bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL (from Supabase)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host
\`\`\`

### Installation

1. **Clone and install dependencies**:
\`\`\`bash
npm install
\`\`\`

2. **Set up database**:
Run the SQL scripts in order:
\`\`\`bash
# Enable pgvector extension
# Run scripts/01-enable-vector-extension.sql

# Create tables
# Run scripts/02-create-presentations-schema.sql

# Create similarity search function
# Run scripts/03-create-similarity-function.sql
\`\`\`

3. **Start development server**:
\`\`\`bash
npm run dev
\`\`\`

4. **For production deployment**:
\`\`\`bash
npm run build
PORT=5050 pm2 start npm --name "gmdc-presentation" -- start
pm2 save
\`\`\`

## Usage

### Basic Presentation Generation

1. Fill in presentation details (title, summary, date)
2. Optionally upload knowledge base documents
3. Click "Generate Presentation"
4. Preview and export to PowerPoint

### Using Similarity Matching

1. **Upload Reference Presentations**:
   - Click "Upload PPTX" in the Reference Presentations section
   - Upload existing PowerPoint files
   - System extracts content and generates embeddings

2. **Enable Similarity Matching**:
   - Toggle "Use Similar Presentations" switch
   - System will find similar slides from uploaded references
   - Generated content follows patterns from similar presentations

3. **Generate with Context**:
   - AI uses similar presentations as examples
   - Maintains consistent style and structure
   - Learns from your organization's presentation patterns

## API Endpoints

### Presentation Generation
\`\`\`typescript
POST /api/generate-presentation
Body: FormData {
  title: string
  summary: string
  date: string
  tableOfContents: string
  useSimilarContent: boolean
  file_0, file_1, ... : File[]
}
\`\`\`

### Upload Reference Presentation
\`\`\`typescript
POST /api/presentations/upload
Body: FormData {
  file: File (PPTX)
}
\`\`\`

### Search Similar Slides
\`\`\`typescript
POST /api/presentations/search-similar
Body: {
  query: string
  limit?: number
  slideType?: string
}
\`\`\`

### List Presentations
\`\`\`typescript
GET /api/presentations/list
\`\`\`

## How It Works

### Vector Similarity Pipeline

1. **Upload Phase**:
   - Parse PowerPoint file
   - Extract text from each slide
   - Generate embeddings using OpenAI
   - Store in PostgreSQL with pgvector

2. **Generation Phase**:
   - Convert user prompt to embedding
   - Query database for similar slides (cosine similarity)
   - Retrieve top K most relevant examples
   - Pass to GPT-4 as context

3. **Content Creation**:
   - GPT-4 generates content following patterns
   - Maintains consistent style and structure
   - Includes similar formatting and terminology

### Benefits

- **Consistency**: Maintains organizational style
- **Quality**: Learns from best presentations
- **Efficiency**: Reduces manual formatting
- **Scalability**: Improves with more references

## Deployment

### PM2 Commands

\`\`\`bash
# Start
PORT=5050 pm2 start npm --name "gmdc-presentation" -- start

# Restart
pm2 restart gmdc-presentation

# Stop
pm2 stop gmdc-presentation

# View logs
pm2 logs gmdc-presentation

# Monitor
pm2 monit
\`\`\`

### Access
- Production: `https://tender.gmdcltd.co.in:5050`
- Development: `http://localhost:3000`

## Future Enhancements

- [ ] Support for more file formats (Google Slides, Keynote)
- [ ] Advanced slide templates and themes
- [ ] Collaborative editing features
- [ ] Version control for presentations
- [ ] Analytics and usage tracking
- [ ] Fine-tuning on organization-specific content

## License

Proprietary - Gujarat Mineral Development Corporation Ltd

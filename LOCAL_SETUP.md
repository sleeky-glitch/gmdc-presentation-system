# GMDC Presentation System - Local Setup Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account with project created
- OpenAI API key

## Step-by-Step Setup

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd gmdc-presentation-system
\`\`\`

### 2. Create Environment File

Create `.env.local` in the root directory:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

**Where to find these values:**
- Supabase URL and keys: Supabase Dashboard → Settings → API
- OpenAI API key: platform.openai.com → API keys

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these scripts **in order**:

1. `scripts/01-enable-vector-extension.sql`
2. `scripts/02-create-presentations-schema.sql`
3. `scripts/03-create-similarity-function.sql`
4. `scripts/04-create-knowledge-base-schema.sql`
5. `scripts/05-create-knowledge-search-function.sql`

### 5. Build the Application

\`\`\`bash
npm run build
\`\`\`

### 6. Ingest GMDC Knowledge Base

The knowledge base content is already embedded in the code. Run:

\`\`\`bash
npx tsx scripts/ingest-gmdc-knowledge.ts
\`\`\`

This will automatically ingest:
- Digital and IT Initiatives Review (June 2024)
- Kadipani Fluorspar Asset Action Plan
- Environmental Sustainability and Governance

**Expected output:**
\`\`\`
🚀 Starting GMDC Knowledge Base ingestion...
✅ Created knowledge base document: <uuid>
📄 Processing section: Digital and IT Initiatives Review...
   Split into X chunks
   ✓ Chunk 1/X ingested
   ...
✅ Knowledge base ingestion completed successfully!
\`\`\`

### 7. Start the Application

**Development mode:**
\`\`\`bash
npm run dev
\`\`\`

**Production mode with PM2:**
\`\`\`bash
PORT=5050 pm2 start npm --name "gmdc-presentation" -- start
pm2 save
pm2 status
\`\`\`

### 8. Verify Setup

1. Open `http://localhost:3000` (dev) or `http://localhost:5050` (production)
2. You should see three sections:
   - **Knowledge Base** (top)
   - **Reference Presentations Library** (middle)
   - **Generate Presentation** (bottom)
3. Toggle "Use knowledge base" in the generation form
4. Generate a test presentation about "Digital Fleet Management"

## Alternative: Using PDF File Directly

If you have the PDF file and want to place it on the server:

### Option A: Manual Placement (Not Recommended)
The system doesn't currently support direct PDF parsing. The knowledge base content is pre-extracted and embedded in `scripts/ingest-gmdc-knowledge.ts`.

### Option B: Add PDF Parsing (Future Enhancement)
To add PDF support, you would need to:
1. Install `pdf-parse`: `npm install pdf-parse`
2. Create a PDF upload endpoint
3. Extract text and ingest similar to the current script

**For now, the embedded knowledge base in the script is the recommended approach.**

## Troubleshooting

### "Tenant or user not found" Error
- Verify your Supabase credentials in `.env.local`
- Check that you're using the correct project URL
- Ensure the service role key (not anon key) is used for migrations

### "Module not found: tsx"
\`\`\`bash
npm install -D tsx
\`\`\`

### Knowledge Base Not Working
1. Check Supabase SQL Editor → Run:
   \`\`\`sql
   SELECT COUNT(*) FROM knowledge_base_documents;
   SELECT COUNT(*) FROM knowledge_base_chunks;
   \`\`\`
2. Should show 1 document and multiple chunks
3. If empty, re-run: `npx tsx scripts/ingest-gmdc-knowledge.ts`

### PM2 Issues
\`\`\`bash
# View logs
pm2 logs gmdc-presentation

# Restart
pm2 restart gmdc-presentation

# Stop and delete
pm2 stop gmdc-presentation
pm2 delete gmdc-presentation
\`\`\`

## Quick Setup Script

For convenience, run:

\`\`\`bash
chmod +x setup-local.sh
./setup-local.sh
\`\`\`

This will guide you through the entire setup process.

## Production Deployment

After setup on your VM:

\`\`\`bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart gmdc-presentation

# Check status
pm2 status
pm2 logs gmdc-presentation --lines 20
\`\`\`

## Support

For issues or questions, check the logs:
\`\`\`bash
pm2 logs gmdc-presentation --follow

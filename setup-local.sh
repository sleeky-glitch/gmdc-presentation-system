#!/bin/bash

echo "🚀 GMDC Presentation System - Local Setup"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your environment variables:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo "OPENAI_API_KEY=your_openai_key"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
echo "Please run these SQL scripts in your Supabase SQL Editor:"
echo "  1. scripts/01-enable-vector-extension.sql"
echo "  2. scripts/02-create-presentations-schema.sql"
echo "  3. scripts/03-create-similarity-function.sql"
echo "  4. scripts/04-create-knowledge-base-schema.sql"
echo "  5. scripts/05-create-knowledge-search-function.sql"
echo ""
read -p "Press Enter once you've run all SQL scripts in Supabase..."
echo ""

# Build the application
echo "🔨 Building application..."
npm run build
echo ""

# Ingest knowledge base
echo "📚 Ingesting GMDC knowledge base..."
npx tsx scripts/ingest-gmdc-knowledge.ts
echo ""

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Development: npm run dev"
echo "  Production: PORT=5050 pm2 start npm --name 'gmdc-presentation' -- start"
echo ""

import { createClient } from "@supabase/supabase-js"
import { generateEmbedding } from "./openai-embeddings"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface KnowledgeDocument {
  title: string
  documentType: string
  source: string
  content: string
  metadata?: Record<string, any>
}

interface KnowledgeChunk {
  content: string
  metadata: Record<string, any>
}

/**
 * Parse structured knowledge base content into chunks
 * Handles slide-based content, sections, and hierarchical data
 */
export function parseKnowledgeContent(content: string, documentType: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = []

  if (documentType === "presentation") {
    // Split by slides
    const slidePattern = /(?:SLIDE|Slide)\s+(\d+)[:\s—-]+(.+?)(?=(?:SLIDE|Slide)\s+\d+|$)/gis
    const matches = content.matchAll(slidePattern)

    for (const match of matches) {
      const slideNumber = match[1]
      const slideContent = match[2].trim()

      // Further split large slides into sub-chunks if needed
      const subChunks = splitLargeContent(slideContent, 1000)

      subChunks.forEach((subContent, index) => {
        chunks.push({
          content: subContent,
          metadata: {
            slideNumber: Number.parseInt(slideNumber),
            chunkIndex: index,
            type: "slide",
          },
        })
      })
    }
  } else {
    // Generic chunking for other document types
    const sections = content.split(/\n\n+/)
    sections.forEach((section, index) => {
      if (section.trim().length > 50) {
        const subChunks = splitLargeContent(section, 1000)
        subChunks.forEach((subContent, subIndex) => {
          chunks.push({
            content: subContent,
            metadata: {
              sectionIndex: index,
              chunkIndex: subIndex,
              type: "section",
            },
          })
        })
      }
    })
  }

  return chunks
}

/**
 * Split large content into smaller chunks while preserving context
 */
function splitLargeContent(content: string, maxLength: number): string[] {
  if (content.length <= maxLength) {
    return [content]
  }

  const chunks: string[] = []
  const paragraphs = content.split(/\n+/)
  let currentChunk = ""

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = paragraph
    } else {
      currentChunk += (currentChunk ? "\n" : "") + paragraph
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

/**
 * Ingest knowledge base document into database with embeddings
 */
export async function ingestKnowledgeDocument(doc: KnowledgeDocument): Promise<{
  success: boolean
  documentId?: string
  chunksProcessed?: number
  error?: string
}> {
  try {
    // Insert document metadata
    const { data: document, error: docError } = await supabase
      .from("knowledge_base_documents")
      .insert({
        title: doc.title,
        document_type: doc.documentType,
        source: doc.source,
        metadata: doc.metadata || {},
      })
      .select()
      .single()

    if (docError) throw docError

    // Parse content into chunks
    const chunks = parseKnowledgeContent(doc.content, doc.documentType)

    // Generate embeddings and insert chunks
    let processedCount = 0
    const batchSize = 10

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)

      const chunksWithEmbeddings = await Promise.all(
        batch.map(async (chunk, index) => {
          const embedding = await generateEmbedding(chunk.content)
          return {
            document_id: document.id,
            content: chunk.content,
            chunk_index: i + index,
            embedding,
            metadata: chunk.metadata,
          }
        }),
      )

      const { error: chunkError } = await supabase.from("knowledge_base_chunks").insert(chunksWithEmbeddings)

      if (chunkError) throw chunkError

      processedCount += chunksWithEmbeddings.length
    }

    return {
      success: true,
      documentId: document.id,
      chunksProcessed: processedCount,
    }
  } catch (error: any) {
    console.error("[v0] Knowledge base ingestion error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Search knowledge base for relevant content
 */
export async function searchKnowledgeBase(
  query: string,
  matchThreshold = 0.7,
  matchCount = 5,
): Promise<
  Array<{
    id: string
    documentId: string
    documentTitle: string
    content: string
    metadata: Record<string, any>
    similarity: number
  }>
> {
  try {
    const queryEmbedding = await generateEmbedding(query)

    const { data, error } = await supabase.rpc("search_knowledge_base", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("[v0] Knowledge base search error:", error)
    return []
  }
}

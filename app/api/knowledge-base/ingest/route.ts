import { type NextRequest, NextResponse } from "next/server"
import { ingestKnowledgeDocument } from "@/lib/knowledge-base-parser"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, documentType, source, content, metadata } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    console.log("[v0] Ingesting knowledge base document:", title)

    const result = await ingestKnowledgeDocument({
      title,
      documentType: documentType || "document",
      source: source || "manual_upload",
      content,
      metadata,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      chunksProcessed: result.chunksProcessed,
      message: `Successfully ingested ${result.chunksProcessed} chunks from "${title}"`,
    })
  } catch (error: any) {
    console.error("[v0] Knowledge base ingest API error:", error)
    return NextResponse.json({ error: error.message || "Failed to ingest knowledge base" }, { status: 500 })
  }
}

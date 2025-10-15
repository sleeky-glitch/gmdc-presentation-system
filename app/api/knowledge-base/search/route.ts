import { type NextRequest, NextResponse } from "next/server"
import { searchKnowledgeBase } from "@/lib/knowledge-base-parser"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, matchThreshold, matchCount } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    console.log("[v0] Searching knowledge base for:", query)

    const results = await searchKnowledgeBase(query, matchThreshold || 0.7, matchCount || 5)

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    })
  } catch (error: any) {
    console.error("[v0] Knowledge base search API error:", error)
    return NextResponse.json({ error: error.message || "Failed to search knowledge base" }, { status: 500 })
  }
}

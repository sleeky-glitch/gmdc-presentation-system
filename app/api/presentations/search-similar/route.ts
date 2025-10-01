import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { generateEmbedding } from "@/lib/openai-embeddings"

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5, slideType } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Search for similar slides using vector similarity
    const supabase = await createClient()

    let queryBuilder = supabase.rpc("match_slides", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
    })

    if (slideType) {
      queryBuilder = queryBuilder.eq("slide_type", slideType)
    }

    const { data: similarSlides, error } = await queryBuilder

    if (error) {
      console.error("[v0] Error searching similar slides:", error)
      return NextResponse.json({ error: "Failed to search similar slides" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      slides: similarSlides || [],
    })
  } catch (error) {
    console.error("[v0] Error in similarity search:", error)
    return NextResponse.json({ error: "Failed to perform similarity search" }, { status: 500 })
  }
}

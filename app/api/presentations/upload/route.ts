import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { parsePowerPoint } from "@/lib/pptx-parser"
import { generateEmbeddings } from "@/lib/openai-embeddings"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".pptx")) {
      return NextResponse.json({ error: "Only .pptx files are supported" }, { status: 400 })
    }

    // Parse the PowerPoint file
    const parsed = await parsePowerPoint(file)

    if (parsed.slides.length === 0) {
      return NextResponse.json({ error: "No slides found in presentation" }, { status: 400 })
    }

    // Generate embeddings for all slides
    const slideTexts = parsed.slides.map(
      (slide) => `${slide.title}\n${slide.content}\n${slide.bulletPoints.join("\n")}`,
    )
    const embeddings = await generateEmbeddings(slideTexts)

    // Store in Supabase
    const supabase = await createClient()

    // Insert presentation
    const { data: presentation, error: presentationError } = await supabase
      .from("presentations")
      .insert({
        title: parsed.title,
        file_name: parsed.fileName,
        total_slides: parsed.totalSlides,
      })
      .select()
      .single()

    if (presentationError) {
      console.error("[v0] Error inserting presentation:", presentationError)
      return NextResponse.json({ error: "Failed to store presentation" }, { status: 500 })
    }

    // Insert slides with embeddings
    const slidesData = parsed.slides.map((slide, index) => ({
      presentation_id: presentation.id,
      slide_number: slide.slideNumber,
      slide_type: slide.slideType,
      title: slide.title,
      content: slide.content,
      bullet_points: slide.bulletPoints,
      embedding: embeddings[index],
    }))

    const { error: slidesError } = await supabase.from("slides").insert(slidesData)

    if (slidesError) {
      console.error("[v0] Error inserting slides:", slidesError)
      return NextResponse.json({ error: "Failed to store slides" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      presentation: {
        id: presentation.id,
        title: presentation.title,
        totalSlides: presentation.total_slides,
      },
    })
  } catch (error) {
    console.error("[v0] Error uploading presentation:", error)
    return NextResponse.json({ error: "Failed to upload presentation" }, { status: 500 })
  }
}

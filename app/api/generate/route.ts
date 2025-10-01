import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase-server"
import { generateEmbedding } from "@/lib/openai-embeddings"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, slideCount = 5, useSimilarContent = true } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    let contextFromSimilarSlides = ""

    if (useSimilarContent) {
      try {
        const queryEmbedding = await generateEmbedding(topic)
        const supabase = await createClient()

        const { data: similarSlides } = await supabase.rpc("match_slides", {
          query_embedding: queryEmbedding,
          match_threshold: 0.75,
          match_count: 10,
        })

        if (similarSlides && similarSlides.length > 0) {
          contextFromSimilarSlides = `\n\nHere are examples from similar presentations for reference:\n\n${similarSlides
            .map(
              (slide: any, idx: number) =>
                `Example ${idx + 1}:\nTitle: ${slide.title}\nContent: ${slide.content}\nBullet Points: ${slide.bullet_points?.join(", ") || "None"}`,
            )
            .join("\n\n")}`
        }
      } catch (error) {
        console.error("[v0] Error fetching similar content:", error)
        // Continue without similar content if there's an error
      }
    }

    const prompt = `Create a professional business presentation about "${topic}" with ${slideCount} slides.

${contextFromSimilarSlides}

Generate a JSON response with the following structure:
{
  "title": "Presentation title",
  "slides": [
    {
      "type": "title",
      "title": "Main title",
      "subtitle": "Subtitle"
    },
    {
      "type": "toc",
      "title": "Table of Contents",
      "items": ["Item 1", "Item 2", "Item 3"]
    },
    {
      "type": "content",
      "title": "Slide title",
      "subtitle": "Optional subtitle",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"]
    },
    {
      "type": "thankyou",
      "title": "THANK YOU"
    }
  ]
}

Requirements:
- First slide must be type "title"
- Include a "toc" slide after the title
- Use "content" slides for main points
- Last slide must be type "thankyou"
- Keep bullet points concise and professional
- Follow the style and structure of the example slides provided above (if any)
- Use similar terminology and formatting patterns from the examples`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional presentation designer. Generate well-structured, professional presentations in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error("No content generated")
    }

    const presentation = JSON.parse(content)

    return NextResponse.json({
      success: true,
      presentation,
    })
  } catch (error) {
    console.error("[v0] Error generating presentation:", error)
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 })
  }
}

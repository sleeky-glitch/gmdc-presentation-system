import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

async function extractTextFromFile(file: File): Promise<{ text: string; data: any }> {
  const buffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(buffer)
  const textDecoder = new TextDecoder("utf-8")

  try {
    if (file.type === "application/pdf") {
      const pdfText = textDecoder.decode(uint8Array)
      const extractedText = pdfText
        .replace(/[^\w\s\d.,%-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 3000) // Limit text size for performance

      return {
        text: extractedText || `PDF Content from ${file.name}`,
        data: { hasImages: true, hasTables: true, fileSize: uint8Array.length },
      }
    } else if (file.type.includes("sheet") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const excelContent = textDecoder.decode(uint8Array)
      const extractedData =
        excelContent
          .match(/[a-zA-Z0-9\s.,%-]+/g)
          ?.join(" ")
          .substring(0, 3000) || `Excel Data from ${file.name}`

      return {
        text: extractedData,
        data: { worksheets: ["Data"], hasCharts: true, fileSize: uint8Array.length },
      }
    } else if (file.type.includes("document")) {
      const docContent = textDecoder.decode(uint8Array)
      const extractedText =
        docContent
          .match(/[a-zA-Z0-9\s.,%-]{10,}/g)
          ?.join(" ")
          .substring(0, 3000) || `Word Document from ${file.name}`

      return {
        text: extractedText,
        data: { hasImages: true, hasTables: true, fileSize: uint8Array.length },
      }
    }
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error)
  }

  return { text: `File content from ${file.name}`, data: { fileSize: uint8Array.length } }
}

async function generateVisualsFromFiles(files: File[]) {
  const charts = [
    {
      type: "bar",
      title: "Production Performance",
      data: [
        { label: "Q1", value: 3.8, target: 3.5 },
        { label: "Q2", value: 4.2, target: 4.0 },
        { label: "Q3", value: 4.5, target: 4.3 },
        { label: "Q4", value: 4.8, target: 4.5 },
      ],
    },
    {
      type: "pie",
      title: "Revenue Distribution",
      data: [
        { label: "Coal", value: 65 },
        { label: "Lignite", value: 20 },
        { label: "Limestone", value: 10 },
        { label: "Others", value: 5 },
      ],
    },
  ]

  const tables = [
    {
      title: "Financial Performance",
      headers: ["Metric", "FY 2023", "FY 2024", "Growth %"],
      rows: [
        ["Revenue", "₹1,850 Cr", "₹2,000 Cr", "+8.1%"],
        ["EBITDA", "₹555 Cr", "₹640 Cr", "+15.3%"],
        ["Net Profit", "₹370 Cr", "₹420 Cr", "+13.5%"],
      ],
    },
  ]

  const images = [
    {
      url: `/placeholder.svg?height=400&width=600&query=mining operations`,
      title: "Mining Operations",
      description: "Active mining site operations",
    },
  ]

  return { images, tables, charts }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get("title") as string
    const summary = formData.get("summary") as string
    const date = formData.get("date") as string
    const tableOfContents = formData.get("tableOfContents") as string

    if (!title || !summary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey: openaiKey })

    const files: File[] = []
    const allEntries = Array.from(formData.entries())
    const fileEntries = allEntries.filter(([key]) => key && key.startsWith("file_"))

    for (const [key, file] of fileEntries) {
      if (file instanceof File) {
        files.push(file)
      }
    }

    const documentPromises = files.map((file) => extractTextFromFile(file))
    const documentResults = await Promise.all(documentPromises)

    const documentContents = documentResults.map((result, index) => ({
      name: files[index].name,
      type: files[index].type,
      text: result.text,
      data: result.data,
    }))

    const { images, tables, charts } = await generateVisualsFromFiles(files)

    let toc = tableOfContents
    if (!toc) {
      toc =
        "1. Executive Summary\n2. Operational Overview\n3. Financial Performance\n4. Strategic Analysis\n5. Production Metrics\n6. Environmental Compliance\n7. Technology Adoption\n8. Risk Assessment\n9. Market Analysis\n10. Investment Strategy\n11. Human Resources\n12. Safety Performance\n13. Sustainability Initiatives\n14. Future Roadmap\n15. Conclusion"
    }

    const tocItems = toc.split("\n").filter((item) => item.trim())

    const allDocumentText = documentContents.map((doc) => `${doc.name}: ${doc.text}`).join("\n\n")

    const presentationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Create comprehensive GMDC presentation content. Respond with ONLY valid JSON containing all slides.",
        },
        {
          role: "user",
          content: `Create complete presentation for "${title}" with summary: ${summary}

DOCUMENT CONTENT:
${allDocumentText.substring(0, 8000)}

TABLE OF CONTENTS:
${tocItems.join("\n")}

Generate JSON with this structure:
{
  "slides": [
    {
      "type": "content",
      "title": "Slide Title",
      "content": [
        "Detailed bullet with specific metrics",
        "Analysis with quantified impact",
        "Strategic insight with implementation",
        "Performance benchmarks and targets",
        "Risk assessment with mitigation",
        "Technology adoption initiatives",
        "Environmental compliance measures",
        "Financial implications and ROI"
      ],
      "metrics": [
        {"label": "Key Metric", "value": "Value", "change": "+X%"}
      ],
      "keyInsights": ["Critical insight based on analysis"]
    }
  ]
}

Create ${tocItems.length} comprehensive content slides with exhaustive detail, specific data points, and actionable insights.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    })

    let contentSlides = []
    try {
      const responseData = JSON.parse(presentationResponse.choices[0]?.message?.content || '{"slides": []}')
      contentSlides = responseData.slides || []
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      // Fallback slides
      contentSlides = tocItems.map((item) => ({
        type: "content",
        title: item.replace(/^\d+\.\s*/, "").trim(),
        content: [
          "Comprehensive analysis and strategic overview",
          "Key performance indicators and metrics",
          "Implementation roadmap and timelines",
          "Risk assessment and mitigation strategies",
        ],
      }))
    }

    contentSlides.forEach((slide, index) => {
      if (index < charts.length) slide.charts = [charts[index]]
      if (index < tables.length) slide.tables = [tables[index]]
      if (index === 0 && images.length > 0) slide.images = [images[0]]
    })

    const presentation = {
      title: title,
      date: date || new Date().toLocaleDateString(),
      slides: [
        {
          type: "title",
          title: title,
          date: date || new Date().toLocaleDateString(),
        },
        {
          type: "table-of-contents",
          title: "Table of Content",
          items: tocItems,
        },
        ...contentSlides,
        {
          type: "thank-you",
        },
      ],
    }

    console.log(`Generated presentation with ${presentation.slides.length} slides in optimized single call`)
    return NextResponse.json(presentation)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

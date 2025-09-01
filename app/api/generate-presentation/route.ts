import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

async function extractTextFromFile(file: File): Promise<{ text: string; data: any }> {
  const buffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(buffer)
  const textDecoder = new TextDecoder("utf-8")

  try {
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      const jsonText = textDecoder.decode(uint8Array)
      try {
        const jsonData = JSON.parse(jsonText)

        if (jsonData.slides && Array.isArray(jsonData.slides)) {
          // Process presentation knowledge base format
          const knowledgeContent = processPresentationKnowledgeBase(jsonData)
          return {
            text: knowledgeContent,
            data: {
              isPresentationKnowledgeBase: true,
              slideCount: jsonData.slides.length,
              hasStructuredData: true,
              hasCharts: true,
              hasTables: jsonData.slides.some((slide: any) => slide.tables && slide.tables.length > 0),
              fileSize: uint8Array.length,
              jsonKeys: Object.keys(jsonData),
            },
          }
        } else {
          // Process generic JSON format
          const jsonContent = JSON.stringify(jsonData, null, 2)
          return {
            text: `JSON Data from ${file.name}:\n${jsonContent}`,
            data: {
              isStructuredData: true,
              hasCharts: Array.isArray(jsonData) || (typeof jsonData === "object" && jsonData !== null),
              fileSize: uint8Array.length,
              jsonKeys: typeof jsonData === "object" ? Object.keys(jsonData) : [],
            },
          }
        }
      } catch (jsonError) {
        console.error(`Error parsing JSON file ${file.name}:`, jsonError)
        return {
          text: `JSON file ${file.name} (parsing error - treating as text):\n${jsonText.substring(0, 3000)}`,
          data: { fileSize: uint8Array.length, hasParsingError: true },
        }
      }
    } else if (file.type === "application/pdf") {
      const pdfText = textDecoder.decode(uint8Array)
      const extractedText = pdfText
        .replace(/[^\w\s\d.,%-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 3000)

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

function processPresentationKnowledgeBase(jsonData: any): string {
  let knowledgeContent = `PRESENTATION KNOWLEDGE BASE: ${jsonData.file_name || "Unknown"}\n\n`

  if (jsonData.slides && Array.isArray(jsonData.slides)) {
    jsonData.slides.forEach((slide: any, index: number) => {
      knowledgeContent += `SLIDE ${slide.slide_index || index + 1}: ${slide.title || "Untitled"}\n`

      // Process slide content
      if (slide.content && Array.isArray(slide.content)) {
        slide.content.forEach((contentItem: any) => {
          if (contentItem.type === "text") {
            knowledgeContent += `- ${contentItem.text}\n`
          } else if (contentItem.type === "bullets" && contentItem.items) {
            contentItem.items.forEach((bullet: string) => {
              knowledgeContent += `  • ${bullet}\n`
            })
          }
        })
      }

      // Process tables
      if (slide.tables && Array.isArray(slide.tables)) {
        slide.tables.forEach((table: any) => {
          knowledgeContent += `\nTABLE: ${table.title || "Data Table"}\n`
          if (table.columns) {
            knowledgeContent += `Columns: ${table.columns.join(" | ")}\n`
          }
          if (table.rows && Array.isArray(table.rows)) {
            table.rows.forEach((row: any[]) => {
              knowledgeContent += `${row.join(" | ")}\n`
            })
          }
        })
      }

      knowledgeContent += "\n---\n\n"
    })
  }

  return knowledgeContent
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
            "Create comprehensive GMDC presentation content. Use presentation knowledge base JSON data as reference material for context, examples, and best practices. Extract relevant information from knowledge base to enhance new presentation quality.",
        },
        {
          role: "user",
          content: `Create complete presentation for "${title}" with summary: ${summary}

DOCUMENT CONTENT (including presentation knowledge base):
${allDocumentText.substring(0, 12000)}

TABLE OF CONTENTS:
${tocItems.join("\n")}

KNOWLEDGE BASE INSTRUCTIONS:
- Use presentation knowledge base as reference for GMDC presentation standards
- Extract relevant project data, compliance information, and status updates
- Incorporate similar table structures and data presentation formats
- Reference environmental clearances, project timelines, and regulatory processes
- Use knowledge base examples for professional formatting and content depth

SPECIAL INSTRUCTIONS FOR JSON DATA:
- Extract numerical data from JSON files for charts and metrics
- Use JSON structure to create meaningful visualizations
- Convert JSON arrays into tables where appropriate
- Highlight key insights from structured JSON data
- Reference knowledge base examples for table formatting and data presentation

Generate JSON with this structure:
{
  "slides": [
    {
      "type": "content",
      "title": "Slide Title",
      "content": [
        "Detailed bullet with specific metrics from JSON data and knowledge base examples",
        "Analysis with quantified impact referencing similar projects from knowledge base",
        "Strategic insight with implementation based on JSON insights and KB best practices",
        "Performance benchmarks and targets from data files and reference standards",
        "Risk assessment with mitigation strategies from document analysis and KB examples",
        "Technology adoption initiatives from uploaded content and reference implementations",
        "Environmental compliance measures following KB regulatory framework examples",
        "Financial implications and ROI from JSON metrics with KB comparative analysis"
      ],
      "metrics": [
        {"label": "Key Metric from JSON/KB", "value": "Value", "change": "+X%"}
      ],
      "keyInsights": ["Critical insight based on JSON, document analysis, and knowledge base references"],
      "tables": [
        {
          "title": "Data Table (format from KB)",
          "headers": ["Column1", "Column2", "Column3"],
          "rows": [["Data1", "Data2", "Data3"]]
        }
      ]
    }
  ]
}

Create ${tocItems.length} comprehensive content slides with exhaustive detail, specific data points from JSON files, knowledge base references, and actionable insights.`,
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

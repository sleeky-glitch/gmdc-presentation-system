import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { presentation } = await request.json()

    if (!presentation || !presentation.slides) {
      return NextResponse.json({ error: "Invalid presentation data" }, { status: 400 })
    }

    // Dynamic import to avoid bundling issues
    const officegen = await import("officegen")
    const pptx = officegen.default("pptx")

    // Set presentation properties
    pptx.setDocTitle(presentation.title || "GMDC Presentation")
    pptx.setDocAuthor("GMDC")
    pptx.setDocSubject("Generated Presentation")

    // Process each slide
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i]
      const pptxSlide = pptx.makeNewSlide()

      // Add slide title
      if (slide.title) {
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 1,
          font_size: 24,
          bold: true,
          color: "1f2937",
        })
      }

      // Add slide content
      if (slide.content) {
        const contentY = slide.title ? 2 : 1

        if (slide.type === "bullet_points" && Array.isArray(slide.content)) {
          // Handle bullet points
          slide.content.forEach((point: string, index: number) => {
            pptxSlide.addText(`• ${point}`, {
              x: 0.5,
              y: contentY + index * 0.5,
              w: 9,
              h: 0.4,
              font_size: 16,
              color: "374151",
            })
          })
        } else if (slide.type === "table" && slide.content.headers && slide.content.rows) {
          // Handle table content
          const tableData = [slide.content.headers, ...slide.content.rows]

          pptxSlide.addTable(tableData, {
            x: 0.5,
            y: contentY,
            w: 9,
            h: 4,
            font_size: 12,
            color: "374151",
          })
        } else if (typeof slide.content === "string") {
          // Handle regular text content
          pptxSlide.addText(slide.content, {
            x: 0.5,
            y: contentY,
            w: 9,
            h: 4,
            font_size: 16,
            color: "374151",
          })
        }
      }

      // Add slide number (except for title slide)
      if (i > 0) {
        pptxSlide.addText(`${i + 1}`, {
          x: 9.5,
          y: 6.8,
          w: 0.5,
          h: 0.3,
          font_size: 10,
          color: "6b7280",
          align: "right",
        })
      }

      // Add GMDC branding footer
      pptxSlide.addText("GMDC", {
        x: 0.5,
        y: 6.8,
        w: 2,
        h: 0.3,
        font_size: 10,
        color: "6b7280",
        bold: true,
      })
    }

    // Generate the PowerPoint file
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      pptx.on("data", (chunk: Buffer) => {
        chunks.push(chunk)
      })

      pptx.on("end", () => {
        const buffer = Buffer.concat(chunks)

        resolve(
          new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "Content-Disposition": `attachment; filename="${presentation.title || "presentation"}.pptx"`,
              "Content-Length": buffer.length.toString(),
            },
          }),
        )
      })

      pptx.on("error", (error: Error) => {
        console.error("PowerPoint generation error:", error)
        reject(NextResponse.json({ error: "Failed to generate PowerPoint file" }, { status: 500 }))
      })

      // Start generation
      pptx.generate()
    })
  } catch (error) {
    console.error("PowerPoint export error:", error)
    return NextResponse.json(
      {
        error: "Failed to export PowerPoint presentation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

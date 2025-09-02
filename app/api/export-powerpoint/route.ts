import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const officegen = (await import("officegen")).default

    const { presentation } = await request.json()

    if (!presentation || !presentation.slides) {
      return NextResponse.json({ error: "Invalid presentation data" }, { status: 400 })
    }

    // Create a new PowerPoint presentation
    const pptx = officegen("pptx")

    // Set presentation properties
    pptx.setDocTitle(presentation.title || "GMDC Presentation")
    pptx.setDocAuthor("GMDC Presentation System")
    pptx.setDocSubject("Generated Presentation")

    // Process each slide
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i]
      const pptxSlide = pptx.makeNewSlide()

      if (slide.type === "title") {
        // Title slide
        pptxSlide.addText(slide.title, {
          x: "c",
          y: "c",
          font_size: 48,
          font_face: "Arial",
          color: "D97706",
          bold: true,
          align: "center",
        })
      } else if (slide.type === "thank-you") {
        // Thank you slide
        pptxSlide.addText("THANK YOU", {
          x: "c",
          y: "c",
          font_size: 72,
          font_face: "Arial",
          color: "D97706",
          bold: true,
          align: "center",
        })

        // Add slide number (skip for title slide)
        if (i > 0) {
          pptxSlide.addText(`${i + 1}`, {
            x: "90%",
            y: "90%",
            font_size: 16,
            font_face: "Arial",
            color: "666666",
          })
        }
      } else {
        // Content slide
        // Add title
        pptxSlide.addText(slide.title, {
          x: "5%",
          y: "10%",
          font_size: 36,
          font_face: "Arial",
          color: "D97706",
          bold: true,
        })

        // Add content
        let contentText = ""
        if (Array.isArray(slide.content)) {
          contentText = slide.content.map((item: string) => `• ${item}`).join("\n")
        } else {
          contentText = slide.content || ""
        }

        pptxSlide.addText(contentText, {
          x: "5%",
          y: "25%",
          w: "90%",
          h: "60%",
          font_size: 24,
          font_face: "Arial",
          color: "374151",
          line_spacing: 1.6,
        })

        // Add slide number (skip for title slide)
        if (i > 0) {
          pptxSlide.addText(`${i + 1}`, {
            x: "90%",
            y: "90%",
            font_size: 16,
            font_face: "Arial",
            color: "666666",
          })
        }
      }
    }

    // Generate the PowerPoint file
    return new Promise((resolve) => {
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
            },
          }),
        )
      })

      pptx.on("error", (error: Error) => {
        console.error("PowerPoint generation error:", error)
        resolve(NextResponse.json({ error: "Failed to generate PowerPoint file" }, { status: 500 }))
      })

      // Start generating the file
      pptx.generate()
    })
  } catch (error) {
    console.error("Export API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

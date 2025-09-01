import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { presentation, formData } = await request.json()

    // Dynamic import to avoid build issues
    const officegen = (await import("officegen")).default

    // Create PowerPoint presentation
    const pptx = officegen("pptx")

    // Set presentation properties
    pptx.setDocTitle(formData.title || "GMDC Presentation")
    pptx.setDocAuthor("GMDC")
    pptx.setDocSubject("Generated Presentation")

    // Title slide
    const titleSlide = pptx.makeNewSlide()
    titleSlide.name = "Title Slide"

    // Add title
    titleSlide.addText(formData.title || "Presentation Title", {
      x: 100,
      y: 200,
      cx: 600,
      cy: 100,
      font_size: 36,
      bold: true,
      color: "8B4513",
      align: "center",
    })

    // Add date if provided
    if (formData.date) {
      titleSlide.addText(formData.date, {
        x: 100,
        y: 320,
        cx: 600,
        cy: 50,
        font_size: 18,
        color: "666666",
        align: "center",
      })
    }

    // Table of Contents slide
    if (presentation.tableOfContents) {
      const tocSlide = pptx.makeNewSlide()
      tocSlide.name = "Table of Contents"

      tocSlide.addText("Table of Content", {
        x: 50,
        y: 50,
        cx: 700,
        cy: 60,
        font_size: 28,
        bold: true,
        color: "333333",
      })

      const tocItems = presentation.tableOfContents
        .split("\n")
        .filter((item: string) => item.trim())
        .map((item: string, index: number) => `${index + 1}. ${item.trim()}`)
        .join("\n")

      tocSlide.addText(tocItems, {
        x: 50,
        y: 120,
        cx: 700,
        cy: 300,
        font_size: 16,
        color: "333333",
      })
    }

    // Content slides
    const slides = presentation.slides || []
    slides.forEach((slide: any) => {
      const contentSlide = pptx.makeNewSlide()
      contentSlide.name = slide.title || "Content Slide"

      // Add title
      contentSlide.addText(slide.title || "", {
        x: 50,
        y: 50,
        cx: 700,
        cy: 60,
        font_size: 28,
        bold: true,
        color: "333333",
      })

      // Extract and add content
      if (slide.content) {
        // Remove HTML tags for plain text
        const textContent = slide.content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")

        contentSlide.addText(textContent, {
          x: 50,
          y: 120,
          cx: 700,
          cy: 300,
          font_size: 16,
          color: "333333",
        })
      }
    })

    // Thank you slide
    const thankYouSlide = pptx.makeNewSlide()
    thankYouSlide.name = "Thank You"

    thankYouSlide.addText("THANK YOU", {
      x: 100,
      y: 200,
      cx: 600,
      cy: 100,
      font_size: 48,
      bold: true,
      color: "8B4513",
      align: "center",
    })

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
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "Content-Disposition": `attachment; filename="${formData.title?.replace(/[^a-z0-9]/gi, "_") || "GMDC-Presentation"}.pptx"`,
            },
          }),
        )
      })

      pptx.on("error", (error: Error) => {
        console.error("PowerPoint generation error:", error)
        reject(new NextResponse("Failed to generate PowerPoint", { status: 500 }))
      })

      pptx.generate()
    })
  } catch (error) {
    console.error("PowerPoint export error:", error)
    return new NextResponse("Failed to export PowerPoint", { status: 500 })
  }
}

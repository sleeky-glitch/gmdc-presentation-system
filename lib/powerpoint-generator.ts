"use server"

export async function generatePowerPoint(presentationData: any) {
  try {
    console.log("[v0] Starting PowerPoint generation with Server Action")

    // Dynamic import of officegen
    const officegen = await import("officegen")
    console.log("[v0] Officegen imported successfully")

    const pptx = officegen.default("pptx")

    // Set presentation properties
    pptx.setDocTitle(presentationData.title || "GMDC Presentation")
    pptx.setDocAuthor("GMDC")
    pptx.setDocSubject("Mining Operations Presentation")

    console.log("[v0] Creating slides...")

    // Title slide
    const titleSlide = pptx.makeNewSlide()
    titleSlide.addText(presentationData.title || "GMDC Presentation", {
      x: 1,
      y: 2,
      cx: 8,
      cy: 1.5,
      font_size: 36,
      bold: true,
      color: "1f4e79",
    })

    if (presentationData.subtitle) {
      titleSlide.addText(presentationData.subtitle, {
        x: 1,
        y: 4,
        cx: 8,
        cy: 1,
        font_size: 24,
        color: "666666",
      })
    }

    // Add GMDC logo placeholder
    titleSlide.addText("GMDC", {
      x: 8,
      y: 6,
      cx: 2,
      cy: 0.5,
      font_size: 18,
      bold: true,
      color: "1f4e79",
    })

    // Content slides
    if (presentationData.slides) {
      presentationData.slides.forEach((slideData: any, index: number) => {
        console.log(`[v0] Creating slide ${index + 2}`)
        const slide = pptx.makeNewSlide()

        // Add slide title
        if (slideData.title) {
          slide.addText(slideData.title, {
            x: 1,
            y: 0.5,
            cx: 8,
            cy: 1,
            font_size: 28,
            bold: true,
            color: "1f4e79",
          })
        }

        // Add content based on type
        if (slideData.content) {
          if (Array.isArray(slideData.content)) {
            // Bullet points
            slideData.content.forEach((point: string, pointIndex: number) => {
              slide.addText(`• ${point}`, {
                x: 1,
                y: 2 + pointIndex * 0.8,
                cx: 8,
                cy: 0.6,
                font_size: 18,
                color: "333333",
              })
            })
          } else {
            // Regular text
            slide.addText(slideData.content, {
              x: 1,
              y: 2,
              cx: 8,
              cy: 4,
              font_size: 18,
              color: "333333",
            })
          }
        }

        // Add slide number
        slide.addText(`${index + 2}`, {
          x: 9,
          y: 6.5,
          cx: 0.5,
          cy: 0.3,
          font_size: 12,
          color: "666666",
        })
      })
    }

    // Thank you slide
    const thankYouSlide = pptx.makeNewSlide()
    thankYouSlide.addText("Thank You", {
      x: 2,
      y: 3,
      cx: 6,
      cy: 1.5,
      font_size: 48,
      bold: true,
      color: "1f4e79",
      align: "center",
    })

    console.log("[v0] Generating PowerPoint buffer...")

    // Generate the PowerPoint file
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []

      pptx.on("data", (chunk: Buffer) => {
        chunks.push(chunk)
      })

      pptx.on("end", () => {
        console.log("[v0] PowerPoint generation completed")
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })

      pptx.on("error", (error: Error) => {
        console.error("[v0] PowerPoint generation error:", error)
        reject(error)
      })

      // Start generation
      pptx.generate()
    })
  } catch (error) {
    console.error("[v0] Server Action error:", error)
    throw new Error(`PowerPoint generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

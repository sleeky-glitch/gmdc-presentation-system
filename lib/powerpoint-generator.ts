"use server"

export async function generatePowerPoint(presentationData: any) {
  try {
    console.log("[v0] Starting PowerPoint generation with Server Action")
    console.log("[v0] Presentation data:", JSON.stringify(presentationData, null, 2))

    if (!presentationData) {
      throw new Error("No presentation data provided")
    }

    let officegen: any
    try {
      const officegenModule = await import("officegen")
      officegen = officegenModule.default || officegenModule
      console.log("[v0] Officegen imported successfully")
    } catch (importError) {
      console.error("[v0] Failed to import officegen:", importError)
      throw new Error(`Failed to import officegen: ${importError}`)
    }

    if (typeof officegen !== "function") {
      throw new Error("Officegen is not a function")
    }

    const pptx = officegen("pptx")
    console.log("[v0] PowerPoint object created")

    try {
      // Set presentation properties
      pptx.setDocTitle(presentationData.title || "GMDC Presentation")
      pptx.setDocAuthor("GMDC")
      pptx.setDocSubject("Mining Operations Presentation")
      console.log("[v0] Document properties set")

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
      console.log("[v0] Title slide created")

      // Content slides
      if (presentationData.slides && Array.isArray(presentationData.slides)) {
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
      console.log("[v0] All slides created successfully")
    } catch (slideError) {
      console.error("[v0] Error creating slides:", slideError)
      throw new Error(`Failed to create slides: ${slideError}`)
    }

    console.log("[v0] Generating PowerPoint buffer...")

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      let resolved = false

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          reject(new Error("PowerPoint generation timed out after 30 seconds"))
        }
      }, 30000)

      pptx.on("data", (chunk: Buffer) => {
        console.log("[v0] Received data chunk:", chunk.length, "bytes")
        chunks.push(chunk)
      })

      pptx.on("end", () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          console.log("[v0] PowerPoint generation completed")
          const buffer = Buffer.concat(chunks)
          console.log("[v0] Final buffer size:", buffer.length, "bytes")
          resolve(buffer)
        }
      })

      pptx.on("error", (error: Error) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          console.error("[v0] PowerPoint generation error:", error)
          reject(error)
        }
      })

      try {
        // Start generation
        pptx.generate()
        console.log("[v0] PowerPoint generation started")
      } catch (generateError) {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          console.error("[v0] Failed to start generation:", generateError)
          reject(new Error(`Failed to start PowerPoint generation: ${generateError}`))
        }
      }
    })
  } catch (error) {
    console.error("[v0] Server Action error:", error)
    throw new Error(`PowerPoint generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

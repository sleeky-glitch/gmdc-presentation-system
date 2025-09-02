import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] PowerPoint export API called")

    let presentation
    try {
      const body = await request.json()
      presentation = body.presentation
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    console.log("[v0] Received presentation data:", presentation?.title, "slides:", presentation?.slides?.length)

    if (!presentation || !presentation.slides || !Array.isArray(presentation.slides)) {
      console.log("[v0] Invalid presentation data structure")
      return NextResponse.json({ error: "Invalid presentation data structure" }, { status: 400 })
    }

    console.log("[v0] Importing officegen...")

    let officegen
    try {
      const officegenModule = await import("officegen")
      officegen = officegenModule.default || officegenModule
      console.log("[v0] Officegen imported successfully, type:", typeof officegen)
    } catch (importError) {
      console.error("[v0] Failed to import officegen:", importError)
      return NextResponse.json(
        { error: "Failed to load PowerPoint library", details: importError.message },
        { status: 500 },
      )
    }

    if (typeof officegen !== "function") {
      console.error("[v0] Officegen is not a function:", typeof officegen)
      return NextResponse.json({ error: "PowerPoint library not properly loaded" }, { status: 500 })
    }

    console.log("[v0] Creating PPTX instance...")
    let pptx
    try {
      pptx = officegen("pptx")
      console.log("[v0] PPTX instance created successfully")
    } catch (createError) {
      console.error("[v0] Failed to create PPTX instance:", createError)
      return NextResponse.json(
        { error: "Failed to create PowerPoint instance", details: createError.message },
        { status: 500 },
      )
    }

    // Set presentation properties
    try {
      pptx.setDocTitle(presentation.title || "GMDC Presentation")
      pptx.setDocAuthor("GMDC")
      pptx.setDocSubject("Generated Presentation")
      console.log("[v0] Document properties set")
    } catch (propError) {
      console.error("[v0] Failed to set document properties:", propError)
      // Continue anyway, this is not critical
    }

    // Process each slide
    console.log("[v0] Processing", presentation.slides.length, "slides...")
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i]
      console.log("[v0] Processing slide", i + 1, ":", slide.title)

      try {
        const pptxSlide = pptx.makeNewSlide()
        console.log("[v0] Created new slide", i + 1)

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
          console.log("[v0] Added title to slide", i + 1)
        }

        // Add slide content
        if (slide.content) {
          const contentY = slide.title ? 2 : 1

          if (slide.type === "bullet_points" && Array.isArray(slide.content)) {
            // Handle bullet points
            slide.content.forEach((point: string, index: number) => {
              if (typeof point === "string") {
                pptxSlide.addText(`• ${point}`, {
                  x: 0.5,
                  y: contentY + index * 0.5,
                  w: 9,
                  h: 0.4,
                  font_size: 16,
                  color: "374151",
                })
              }
            })
            console.log("[v0] Added bullet points to slide", i + 1)
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
            console.log("[v0] Added table to slide", i + 1)
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
            console.log("[v0] Added text content to slide", i + 1)
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

        console.log("[v0] Completed slide", i + 1)
      } catch (slideError) {
        console.error("[v0] Error processing slide", i + 1, ":", slideError)
        return NextResponse.json(
          { error: `Failed to process slide ${i + 1}`, details: slideError.message },
          { status: 500 },
        )
      }
    }

    console.log("[v0] All slides processed, generating PowerPoint file...")

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      let hasResolved = false

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true
          console.error("[v0] PowerPoint generation timeout")
          reject(NextResponse.json({ error: "PowerPoint generation timeout" }, { status: 500 }))
        }
      }, 30000) // 30 second timeout

      pptx.on("data", (chunk: Buffer) => {
        if (!hasResolved) {
          chunks.push(chunk)
          console.log("[v0] Received data chunk, size:", chunk.length, "total chunks:", chunks.length)
        }
      })

      pptx.on("end", () => {
        if (!hasResolved) {
          hasResolved = true
          clearTimeout(timeout)
          console.log("[v0] PowerPoint generation completed")

          try {
            const buffer = Buffer.concat(chunks)
            console.log("[v0] Final buffer size:", buffer.length)

            if (buffer.length === 0) {
              reject(NextResponse.json({ error: "Generated PowerPoint file is empty" }, { status: 500 }))
              return
            }

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
          } catch (bufferError) {
            console.error("[v0] Error creating buffer:", bufferError)
            reject(
              NextResponse.json(
                { error: "Failed to create PowerPoint buffer", details: bufferError.message },
                { status: 500 },
              ),
            )
          }
        }
      })

      pptx.on("error", (error: Error) => {
        if (!hasResolved) {
          hasResolved = true
          clearTimeout(timeout)
          console.error("[v0] PowerPoint generation error:", error)
          reject(
            NextResponse.json({ error: "Failed to generate PowerPoint file", details: error.message }, { status: 500 }),
          )
        }
      })

      // Start generation
      try {
        console.log("[v0] Starting PowerPoint generation...")
        pptx.generate()
      } catch (generateError) {
        if (!hasResolved) {
          hasResolved = true
          clearTimeout(timeout)
          console.error("[v0] Error starting generation:", generateError)
          reject(
            NextResponse.json(
              { error: "Failed to start PowerPoint generation", details: generateError.message },
              { status: 500 },
            ),
          )
        }
      }
    })
  } catch (error) {
    console.error("[v0] PowerPoint export error:", error)
    return NextResponse.json(
      {
        error: "Failed to export PowerPoint presentation",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

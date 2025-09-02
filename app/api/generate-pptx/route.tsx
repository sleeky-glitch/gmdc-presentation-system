import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting PowerPoint generation with pptxgenjs...")

    const data = await request.json()
    console.log("[v0] Received data:", JSON.stringify(data, null, 2))

    const PptxGenJS = (await import("pptxgenjs")).default
    const pres = new PptxGenJS()

    // Set presentation properties to match preview
    pres.layout = "LAYOUT_16x9"
    pres.author = "GMDC"
    pres.company = "GMDC Ltd"
    pres.title = data.title || "GMDC Presentation"

    console.log("[v0] PptxGenJS initialized successfully")

    // Process each slide to match the preview exactly
    data.slides?.forEach((slide: any, index: number) => {
      const slideNumber = index + 1
      const totalSlides = data.slides.length

      console.log(`[v0] Processing slide ${slideNumber}: ${slide.type}`)

      if (slide.type === "title") {
        const titleSlide = pres.addSlide()

        // Add background image
        titleSlide.background = {
          path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg",
        }

        titleSlide.addText(slide.title || "Untitled", {
          x: "10%",
          y: "35%",
          w: "80%",
          h: "10%",
          align: "center",
          valign: "middle",
          fontSize: 36,
          bold: true,
          color: "B45309", // Amber-700 color to match preview
          fontFace: "Calibri",
        })

        titleSlide.addShape(pres.ShapeType.rect, {
          x: "10%",
          y: "47%",
          w: "80%",
          h: "0.3%",
          fill: { color: "D97706" }, // Amber-600 color
        })

        // Add subtitle if present
        if (slide.subtitle) {
          titleSlide.addText(slide.subtitle, {
            x: "10%",
            y: "75%",
            w: "80%",
            h: "8%",
            align: "center",
            valign: "middle",
            fontSize: 20,
            color: "374151", // Gray color
            fontFace: "Calibri",
          })
        }
      } else if (slide.type === "thank-you" || slideNumber === totalSlides) {
        const thankYouSlide = pres.addSlide()

        thankYouSlide.background = {
          path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LFnRVQiz9vMDJdWEQl4VHawgbzCxLR.png",
        }

        thankYouSlide.addText("THANK YOU", {
          x: "10%",
          y: "25%", // Moved higher to be above the horizontal line in background
          w: "80%",
          h: "15%",
          align: "center",
          valign: "middle",
          fontSize: 60,
          bold: true,
          color: "B45309", // Amber-700 color to match preview
          fontFace: "Calibri",
        })

        // Add slide number (bottom right)
        thankYouSlide.addText(slideNumber.toString(), {
          x: "92%",
          y: "92%",
          w: "6%",
          h: "6%",
          align: "right",
          valign: "middle",
          fontSize: 12,
          color: "374151",
          fontFace: "Calibri",
        })
      } else if (slide.type === "table-of-contents") {
        const tocSlide = pres.addSlide()

        tocSlide.background = {
          path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LFnRVQiz9vMDJdWEQl4VHawgbzCxLR.png",
        }

        tocSlide.addText("Table of Content", {
          x: "10%",
          y: "5%", // Moved up to be above the horizontal line
          w: "80%",
          h: "8%",
          align: "center",
          valign: "middle",
          fontSize: 24,
          bold: true,
          color: "111827",
          fontFace: "Calibri",
        })

        // Add numbered items with proper spacing and blue numbers
        if (slide.items && slide.items.length > 0) {
          const itemsPerColumn = Math.ceil(slide.items.length / 2)
          const useColumns = slide.items.length > 10

          slide.items.slice(0, 12).forEach((item: string, itemIndex: number) => {
            const itemNumber = itemIndex + 1
            const cleanItem = item.replace(/^\d+\.\s*/, "")

            let x, y, w
            if (useColumns) {
              // Two column layout
              if (itemIndex < itemsPerColumn) {
                x = "10%"
                w = "35%"
              } else {
                x = "55%"
                w = "35%"
              }
              y = `${18 + (itemIndex % itemsPerColumn) * 5}%` // Adjusted for new title position
            } else {
              // Single column layout
              x = "15%"
              w = "70%"
              y = `${18 + itemIndex * 5}%` // Adjusted for new title position
            }

            // Add blue number
            tocSlide.addText(`${itemNumber}.`, {
              x: useColumns ? (itemIndex < itemsPerColumn ? "8%" : "53%") : "12%",
              y: y,
              w: "3%",
              h: "4%",
              align: "left",
              valign: "middle",
              fontSize: 16,
              bold: true,
              color: "2563EB", // Blue-600 color to match preview
              fontFace: "Calibri",
            })

            // Add item text
            tocSlide.addText(cleanItem, {
              x: x,
              y: y,
              w: w,
              h: "4%",
              align: "left",
              valign: "middle",
              fontSize: 16,
              color: "1F2937",
              fontFace: "Calibri",
            })
          })
        }

        // Add slide number (bottom right)
        tocSlide.addText(slideNumber.toString(), {
          x: "92%",
          y: "92%",
          w: "6%",
          h: "6%",
          align: "right",
          valign: "middle",
          fontSize: 12,
          color: "374151",
          fontFace: "Calibri",
        })
      } else {
        const contentSlide = pres.addSlide()

        contentSlide.background = {
          path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LFnRVQiz9vMDJdWEQl4VHawgbzCxLR.png",
        }

        contentSlide.addText(slide.title || "Content", {
          x: "5%",
          y: "5%", // Moved up to be above the horizontal line
          w: "90%",
          h: "8%",
          align: "left",
          valign: "middle",
          fontSize: 20,
          bold: true,
          color: "111827",
          fontFace: "Calibri",
        })

        // Add subtitle if present
        if (slide.subtitle) {
          contentSlide.addText(slide.subtitle, {
            x: "5%",
            y: "13%", // Adjusted for new title position
            w: "90%",
            h: "6%",
            align: "left",
            valign: "middle",
            fontSize: 16,
            color: "374151",
            fontFace: "Calibri",
          })
        }

        // Add content with bullet points using ➢ symbol and blue color
        if (slide.content) {
          let contentText = ""
          if (Array.isArray(slide.content)) {
            if (slide.content.length > 12) {
              // Two column layout for many items
              const midPoint = Math.ceil(slide.content.length / 2)

              // Left column
              const leftContent = slide.content
                .slice(0, Math.min(8, midPoint))
                .map((item: string) => `➢ ${item}`)
                .join("\n")

              contentSlide.addText(leftContent, {
                x: "5%",
                y: slide.subtitle ? "21%" : "15%", // Adjusted for new title position
                w: "42%",
                h: "55%", // Reduced height to avoid overlapping with bottom imagery
                align: "left",
                valign: "top",
                fontSize: 14,
                color: "111827",
                fontFace: "Calibri",
                lineSpacing: 20,
                bullet: { type: "none" },
              })

              // Right column
              const rightContent = slide.content
                .slice(midPoint, Math.min(16, slide.content.length))
                .map((item: string) => `➢ ${item}`)
                .join("\n")

              contentSlide.addText(rightContent, {
                x: "53%",
                y: slide.subtitle ? "21%" : "15%", // Adjusted for new title position
                w: "42%",
                h: "55%", // Reduced height to avoid overlapping with bottom imagery
                align: "left",
                valign: "top",
                fontSize: 14,
                color: "111827",
                fontFace: "Calibri",
                lineSpacing: 20,
                bullet: { type: "none" },
              })
            } else {
              // Single column layout
              contentText = slide.content
                .slice(0, 10)
                .map((item: string) => `➢ ${item}`)
                .join("\n")

              contentSlide.addText(contentText, {
                x: "5%",
                y: slide.subtitle ? "21%" : "15%", // Adjusted for new title position
                w: "90%",
                h: "55%", // Reduced height to avoid overlapping with bottom imagery
                align: "left",
                valign: "top",
                fontSize: 14,
                color: "111827",
                fontFace: "Calibri",
                lineSpacing: 20,
                bullet: { type: "none" },
              })
            }
          } else if (typeof slide.content === "string") {
            contentText = slide.content.length > 500 ? slide.content.substring(0, 500) + "..." : slide.content

            contentSlide.addText(contentText, {
              x: "5%",
              y: slide.subtitle ? "21%" : "15%", // Adjusted for new title position
              w: "90%",
              h: "55%", // Reduced height to avoid overlapping with bottom imagery
              align: "left",
              valign: "top",
              fontSize: 14,
              color: "111827",
              fontFace: "Calibri",
              lineSpacing: 20,
            })
          }
        }

        // Add slide number (bottom right) - positioned above the bottom imagery
        contentSlide.addText(slideNumber.toString(), {
          x: "85%", // Moved left to avoid overlapping with bottom imagery
          y: "85%", // Moved up to avoid overlapping with bottom imagery
          w: "6%",
          h: "6%",
          align: "right",
          valign: "middle",
          fontSize: 12,
          color: "374151",
          fontFace: "Calibri",
        })
      }
    })

    console.log("[v0] All slides processed, generating PowerPoint file...")

    // Generate the PowerPoint file
    const pptxBuffer = await pres.write({ outputType: "nodebuffer" })

    console.log("[v0] PowerPoint generation completed successfully")

    return new Response(pptxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${data.title || "presentation"}.pptx"`,
        "Content-Length": pptxBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] PowerPoint generation error:", error)
    return new Response(
      JSON.stringify({
        error: "PowerPoint generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

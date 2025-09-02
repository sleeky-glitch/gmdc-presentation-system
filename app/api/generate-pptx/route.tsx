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
        // Title slide with amber title and divider line
        const titleSlide = pres.addSlide()

        // Add background image
        titleSlide.background = {
          path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg",
        }

        // Add title text (amber colored, positioned like preview)
        titleSlide.addText(slide.title || "Untitled", {
          x: "50%",
          y: "58%",
          w: "80%",
          h: "15%",
          align: "center",
          valign: "middle",
          fontSize: 44,
          bold: true,
          color: "F59E0B", // Amber color
          fontFace: "Calibri",
        })

        // Add subtitle if present
        if (slide.subtitle) {
          titleSlide.addText(slide.subtitle, {
            x: "50%",
            y: "70%",
            w: "80%",
            h: "10%",
            align: "center",
            valign: "middle",
            fontSize: 20,
            color: "374151", // Gray color
            fontFace: "Calibri",
          })
        }

        // Add website at bottom
        titleSlide.addText("www.gmdcltd.com", {
          x: "50%",
          y: "88%",
          w: "100%",
          h: "8%",
          align: "center",
          valign: "middle",
          fontSize: 14,
          bold: true,
          color: "374151",
          fontFace: "Calibri",
        })
      } else if (slide.type === "thank-you" || slideNumber === totalSlides) {
        // Thank you slide
        const thankYouSlide = pres.addSlide()

        // Add background image
        thankYouSlide.background = { color: "FFFFFF" }

        // Add GMDC logo (top left)
        thankYouSlide.addText("GMDC", {
          x: "2%",
          y: "2%",
          w: "20%",
          h: "8%",
          align: "left",
          valign: "middle",
          fontSize: 16,
          bold: true,
          color: "000000",
          fontFace: "Calibri",
        })

        // Add website (top right)
        thankYouSlide.addText("www.gmdcltd.com", {
          x: "78%",
          y: "2%",
          w: "20%",
          h: "8%",
          align: "right",
          valign: "middle",
          fontSize: 14,
          color: "374151",
          fontFace: "Calibri",
        })

        // Add large "THANK YOU" text (center)
        thankYouSlide.addText("THANK YOU", {
          x: "50%",
          y: "45%",
          w: "80%",
          h: "20%",
          align: "center",
          valign: "middle",
          fontSize: 66,
          bold: true,
          color: "F59E0B", // Amber color
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
        // Table of contents slide
        const tocSlide = pres.addSlide()

        // Add background
        tocSlide.background = { color: "FFFFFF" }

        // Add GMDC logo (top left)
        tocSlide.addText("GMDC", {
          x: "2%",
          y: "2%",
          w: "20%",
          h: "8%",
          align: "left",
          valign: "middle",
          fontSize: 16,
          bold: true,
          color: "000000",
          fontFace: "Calibri",
        })

        // Add website (top right)
        tocSlide.addText("www.gmdcltd.com", {
          x: "78%",
          y: "2%",
          w: "20%",
          h: "8%",
          align: "right",
          valign: "middle",
          fontSize: 14,
          color: "374151",
          fontFace: "Calibri",
        })

        // Add title
        tocSlide.addText("Table of Content", {
          x: "50%",
          y: "15%",
          w: "100%",
          h: "8%",
          align: "center",
          valign: "middle",
          fontSize: 24,
          bold: true,
          color: "111827",
          fontFace: "Calibri",
        })

        // Add numbered items
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
              y = `${25 + (itemIndex % itemsPerColumn) * 4}%`
            } else {
              // Single column layout
              x = "20%"
              w = "60%"
              y = `${25 + itemIndex * 4}%`
            }

            tocSlide.addText(`${itemNumber}. ${cleanItem}`, {
              x: x,
              y: y,
              w: w,
              h: "4%",
              align: "left",
              valign: "middle",
              fontSize: 16,
              color: "111827",
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
        // Content slide
        const contentSlide = pres.addSlide()

        // Add background
        contentSlide.background = { color: "FFFFFF" }

        // Add GMDC logo (top left)
        contentSlide.addText("GMDC", {
          x: "2%",
          y: "2%",
          w: "20%",
          h: "8%",
          align: "left",
          valign: "middle",
          fontSize: 16,
          bold: true,
          color: "000000",
          fontFace: "Calibri",
        })

        // Add website (top right)
        contentSlide.addText("www.gmdcltd.com", {
          x: "78%",
          y: "2%",
          w: "20%",
          h: "8%",
          align: "right",
          valign: "middle",
          fontSize: 14,
          color: "374151",
          fontFace: "Calibri",
        })

        // Add slide title
        contentSlide.addText(slide.title || "Content", {
          x: "5%",
          y: "12%",
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
            y: "20%",
            w: "90%",
            h: "6%",
            align: "left",
            valign: "middle",
            fontSize: 16,
            color: "374151",
            fontFace: "Calibri",
          })
        }

        // Add content with bullet points
        if (slide.content) {
          let contentText = ""
          if (Array.isArray(slide.content)) {
            // Use bullet points with ➢ symbol like in preview
            contentText = slide.content
              .slice(0, 10)
              .map((item: string) => `➢ ${item}`)
              .join("\n")
          } else if (typeof slide.content === "string") {
            contentText = slide.content.length > 500 ? slide.content.substring(0, 500) + "..." : slide.content
          }

          if (contentText) {
            contentSlide.addText(contentText, {
              x: "5%",
              y: slide.subtitle ? "28%" : "22%",
              w: "90%",
              h: "60%",
              align: "left",
              valign: "top",
              fontSize: 14,
              color: "111827",
              fontFace: "Calibri",
              lineSpacing: 20,
            })
          }
        }

        // Add slide number (bottom right)
        contentSlide.addText(slideNumber.toString(), {
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

export async function POST(request: Request) {
  try {
    console.log("[v0] Starting PowerPoint generation with node-pptx...")

    const data = await request.json()
    console.log("[v0] Received data:", JSON.stringify(data, null, 2))

    const { default: PPTX } = await import("node-pptx")
    console.log("[v0] node-pptx imported successfully")

    const pptx = new PPTX.Composer()
    console.log("[v0] Created PPTX composer instance")

    // Add slides based on data
    data.slides?.forEach((slideData: any, index: number) => {
      console.log(`[v0] Adding slide ${index + 1}: ${slideData.type}`)

      if (slideData.type === "title") {
        pptx.compose((pres: any) => {
          pres.addSlide((slide: any) => {
            slide.addText((text: any) => {
              text.value(slideData.title || data.title)
              text.x(100).y(200).cx(800).cy(200)
              text.fontSize(36).bold().color("1f4e79")
            })

            if (slideData.subtitle) {
              slide.addText((text: any) => {
                text.value(slideData.subtitle)
                text.x(100).y(400).cx(800).cy(100)
                text.fontSize(24).color("666666")
              })
            }
          })
        })
      } else if (slideData.type === "content") {
        pptx.compose((pres: any) => {
          pres.addSlide((slide: any) => {
            // Title
            slide.addText((text: any) => {
              text.value(slideData.title)
              text.x(100).y(50).cx(800).cy(100)
              text.fontSize(28).bold().color("1f4e79")
            })

            // Content
            if (slideData.content) {
              slide.addText((text: any) => {
                text.value(slideData.content)
                text.x(100).y(200).cx(800).cy(400)
                text.fontSize(16).color("333333")
              })
            }

            // Slide number (except for title slide)
            if (index > 0) {
              slide.addText((text: any) => {
                text.value(`${index + 1}`)
                text.x(900).y(650).cx(50).cy(50)
                text.fontSize(12).color("666666")
              })
            }
          })
        })
      } else if (slideData.type === "table" && slideData.tableData) {
        pptx.compose((pres: any) => {
          pres.addSlide((slide: any) => {
            slide.addText((text: any) => {
              text.value(slideData.title)
              text.x(100).y(50).cx(800).cy(100)
              text.fontSize(28).bold().color("1f4e79")
            })

            // Add table
            slide.addTable((table: any) => {
              table.x(100).y(150).cx(800).cy(400)

              // Add headers
              if (slideData.tableData.headers) {
                table.addRow((row: any) => {
                  slideData.tableData.headers.forEach((header: string) => {
                    row.addCell((cell: any) => {
                      cell.value(header).bold().color("ffffff").backgroundColor("1f4e79")
                    })
                  })
                })
              }

              // Add data rows
              if (slideData.tableData.rows) {
                slideData.tableData.rows.forEach((rowData: string[]) => {
                  table.addRow((row: any) => {
                    rowData.forEach((cellData: string) => {
                      row.addCell((cell: any) => {
                        cell.value(cellData).color("333333")
                      })
                    })
                  })
                })
              }
            })
          })
        })
      }
    })

    console.log("[v0] All slides added, generating buffer...")

    const buffer = await pptx.save()
    console.log("[v0] PowerPoint generation completed with node-pptx")

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${data.title || "presentation"}.pptx"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
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

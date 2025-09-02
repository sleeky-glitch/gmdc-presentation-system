import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] PowerPoint export API called")

    const { presentation } = await request.json()
    console.log("[v0] Received presentation data:", {
      title: presentation?.title,
      slideCount: presentation?.slides?.length,
    })

    if (!presentation || !presentation.slides) {
      console.log("[v0] Invalid presentation data")
      return NextResponse.json({ error: "Invalid presentation data" }, { status: 400 })
    }

    console.log("[v0] Generating HTML presentation file")

    const htmlContent = generatePresentationHTML(presentation)

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${presentation.title || "presentation"}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] Export API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generatePresentationHTML(presentation: any): string {
  const slides = presentation.slides
    .map((slide: any, index: number) => {
      if (slide.type === "title") {
        return `
        <div class="slide title-slide">
          <div class="slide-content">
            <h1>${slide.title}</h1>
            <div class="gmdc-logo">
              <img src="/gmdc-logo-white.png" alt="GMDC Logo" />
            </div>
          </div>
        </div>
      `
      } else if (slide.type === "thank-you") {
        return `
        <div class="slide thank-you-slide">
          <div class="slide-content">
            <h1>THANK YOU</h1>
            <div class="slide-number">${index + 1}</div>
          </div>
        </div>
      `
      } else {
        const contentHtml = Array.isArray(slide.content)
          ? `<ul>${slide.content.map((item: string) => `<li>${item}</li>`).join("")}</ul>`
          : `<p>${slide.content || ""}</p>`

        return `
        <div class="slide content-slide">
          <div class="slide-content">
            <h2>${slide.title}</h2>
            ${contentHtml}
            <div class="slide-number">${index + 1}</div>
          </div>
        </div>
      `
      }
    })
    .join("")

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${presentation.title || "GMDC Presentation"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #000; }
        .slide {
          width: 1920px;
          height: 1080px;
          page-break-after: always;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: cover;
          background-position: center;
        }
        .title-slide {
          background: linear-gradient(135deg, #D97706 0%, #92400E 100%);
        }
        .content-slide {
          background-image: url('/content-slide-background.png');
          background-color: #1F2937;
        }
        .thank-you-slide {
          background-image: url('/content-slide-background.png');
          background-color: #1F2937;
        }
        .slide-content {
          width: 90%;
          height: 90%;
          padding: 60px;
          position: relative;
        }
        .title-slide h1 {
          font-size: 72px;
          color: white;
          text-align: center;
          font-weight: bold;
          margin-top: 200px;
        }
        .content-slide h2 {
          font-size: 48px;
          color: #D97706;
          margin-bottom: 40px;
          font-weight: bold;
        }
        .thank-you-slide h1 {
          font-size: 96px;
          color: #D97706;
          text-align: center;
          font-weight: bold;
          margin-top: 300px;
        }
        .content-slide ul {
          font-size: 32px;
          color: #F9FAFB;
          line-height: 1.8;
          list-style: none;
        }
        .content-slide li {
          margin-bottom: 20px;
          padding-left: 40px;
          position: relative;
        }
        .content-slide li:before {
          content: "•";
          color: #D97706;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        .content-slide p {
          font-size: 32px;
          color: #F9FAFB;
          line-height: 1.6;
        }
        .slide-number {
          position: absolute;
          bottom: 40px;
          right: 60px;
          font-size: 24px;
          color: #9CA3AF;
        }
        .gmdc-logo {
          position: absolute;
          bottom: 60px;
          left: 60px;
        }
        .gmdc-logo img {
          height: 80px;
          width: auto;
        }
        @media print {
          .slide { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      ${slides}
    </body>
    </html>
  `
}

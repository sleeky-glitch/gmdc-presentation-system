"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowLeft, Download } from "lucide-react"
import { SlideRenderer } from "./slide-renderer"
import pptxgenjs from "pptxgenjs"

interface PresentationViewerProps {
  presentation: any
  onBackToForm: () => void
}

export function PresentationViewer({ presentation, onBackToForm }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  if (!presentation || !presentation.slides) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No presentation data available</p>
        <Button onClick={onBackToForm} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Form
        </Button>
      </div>
    )
  }

  const { slides, title } = presentation
  const totalSlides = slides.length

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      console.log("[v0] Starting client-side PowerPoint export")

      // Create new presentation
      const pptx = new pptxgenjs()

      // Set presentation properties
      pptx.author = "GMDC"
      pptx.company = "Gujarat Mineral Development Corporation"
      pptx.subject = title || "GMDC Presentation"
      pptx.title = title || "GMDC Presentation"

      console.log("[v0] Processing slides:", slides.length)

      // Process each slide
      slides.forEach((slide: any, index: number) => {
        console.log(`[v0] Processing slide ${index + 1}:`, slide.type)

        const pptxSlide = pptx.addSlide()

        // Add GMDC logo to all slides except title slide
        if (index > 0) {
          pptxSlide.addImage({
            path: "/gmdc-logo-white.png",
            x: 0.5,
            y: 0.2,
            w: 1.5,
            h: 0.8,
          })
        }

        // Add slide number to all slides except title slide
        if (index > 0) {
          pptxSlide.addText(`${index + 1}`, {
            x: 9.5,
            y: 7,
            w: 0.5,
            h: 0.3,
            fontSize: 12,
            color: "FFFFFF",
            align: "center",
          })
        }

        // Process slide content based on type
        if (slide.type === "title") {
          // Title slide
          pptxSlide.addText(slide.title || title, {
            x: 1,
            y: 2,
            w: 8,
            h: 2,
            fontSize: 44,
            bold: true,
            color: "FFFFFF",
            align: "center",
          })

          if (slide.subtitle) {
            pptxSlide.addText(slide.subtitle, {
              x: 1,
              y: 4.5,
              w: 8,
              h: 1,
              fontSize: 24,
              color: "FFFFFF",
              align: "center",
            })
          }

          // Add GMDC logo to title slide
          pptxSlide.addImage({
            path: "/gmdc-logo-white.png",
            x: 4,
            y: 6,
            w: 2,
            h: 1,
          })
        } else if (slide.type === "content") {
          // Content slide with background
          pptxSlide.addImage({
            path: "/content-slide-background.png",
            x: 0,
            y: 0,
            w: 10,
            h: 7.5,
          })

          // Add title
          if (slide.title) {
            pptxSlide.addText(slide.title, {
              x: 2,
              y: 1,
              w: 7,
              h: 1,
              fontSize: 32,
              bold: true,
              color: "FFFFFF",
            })
          }

          // Add content
          if (slide.content) {
            if (Array.isArray(slide.content)) {
              // Bullet points
              const bulletText = slide.content.map((item: string) => `• ${item}`).join("\n")
              pptxSlide.addText(bulletText, {
                x: 2,
                y: 2.5,
                w: 7,
                h: 4,
                fontSize: 18,
                color: "FFFFFF",
                lineSpacing: 24,
              })
            } else {
              // Regular text
              pptxSlide.addText(slide.content, {
                x: 2,
                y: 2.5,
                w: 7,
                h: 4,
                fontSize: 18,
                color: "FFFFFF",
              })
            }
          }
        } else if (slide.type === "table") {
          // Table slide
          pptxSlide.addImage({
            path: "/content-slide-background.png",
            x: 0,
            y: 0,
            w: 10,
            h: 7.5,
          })

          if (slide.title) {
            pptxSlide.addText(slide.title, {
              x: 2,
              y: 1,
              w: 7,
              h: 1,
              fontSize: 32,
              bold: true,
              color: "FFFFFF",
            })
          }

          if (slide.table && slide.table.rows) {
            const tableData = slide.table.rows.map((row: any) =>
              slide.table.headers ? [row.header, row.value] : [row],
            )

            pptxSlide.addTable(tableData, {
              x: 2,
              y: 2.5,
              w: 6,
              h: 3,
              fontSize: 14,
              color: "FFFFFF",
              fill: { color: "363636" },
              border: { pt: 1, color: "FFFFFF" },
            })
          }
        } else if (slide.type === "thank_you") {
          // Thank you slide
          pptxSlide.addText("Thank You", {
            x: 1,
            y: 3,
            w: 8,
            h: 2,
            fontSize: 48,
            bold: true,
            color: "FFFFFF",
            align: "center",
          })

          // Add GMDC logo
          pptxSlide.addImage({
            path: "/gmdc-logo-white.png",
            x: 4,
            y: 5.5,
            w: 2,
            h: 1,
          })
        }
      })

      console.log("[v0] All slides processed, generating PowerPoint file")

      // Generate and download the presentation
      const fileName = `${title || "presentation"}.pptx`
      await pptx.writeFile({ fileName })

      console.log("[v0] PowerPoint file generated and downloaded successfully")
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBackToForm}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Form
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PPTX"}
          </Button>
        </div>
      </div>

      {/* Main Presentation Area */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Slide Thumbnails */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Slides ({totalSlides})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {slides.map((slide: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-full p-2 text-left rounded-lg border transition-colors ${
                      currentSlide === index
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">Slide {index + 1}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {slide.title || slide.content?.substring(0, 30) + "..."}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Slide Display */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="aspect-[16/9] bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                <SlideRenderer slide={slides[currentSlide]} slideNumber={currentSlide + 1} totalSlides={totalSlides} />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentSlide + 1} of {totalSlides}
              </span>
            </div>

            <Button variant="outline" onClick={nextSlide} disabled={currentSlide === totalSlides - 1}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

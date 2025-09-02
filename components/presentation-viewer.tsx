"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowLeft, Download } from "lucide-react"
import { SlideRenderer } from "./slide-renderer"

interface PresentationViewerProps {
  presentation: any
  onBackToForm: () => void
}

export function PresentationViewer({ presentation, onBackToForm }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

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
    try {
      // Dynamic import to avoid build issues
      const PptxGenJS = (await import("pptxgenjs")).default

      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: "LAYOUT_16x9", width: 10, height: 5.625 })
      pptx.layout = "LAYOUT_16x9"

      slides.forEach((slide: any, index: number) => {
        const pptxSlide = pptx.addSlide()

        if (slide.type === "title") {
          // Title slide
          pptxSlide.background = {
            path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg",
          }
          pptxSlide.addText(slide.title, {
            x: 1,
            y: 2.5,
            w: 8,
            h: 1,
            fontSize: 36,
            color: "D97706",
            bold: true,
            align: "center",
          })
        } else if (slide.type === "thank-you") {
          // Thank you slide
          pptxSlide.background = { path: "/content-slide-background.png" }
          pptxSlide.addText("THANK YOU", {
            x: 2,
            y: 2,
            w: 6,
            h: 2,
            fontSize: 48,
            color: "D97706",
            bold: true,
            align: "center",
          })
        } else {
          // Content slide
          pptxSlide.background = { path: "/content-slide-background.png" }

          // Add GMDC logo
          pptxSlide.addImage({
            path: "/gmdc-logo-white.png",
            x: 0.2,
            y: 0.2,
            w: 0.8,
            h: 0.8,
          })

          // Add website URL
          pptxSlide.addText("www.gmdcltd.com", {
            x: 8,
            y: 0.2,
            w: 1.8,
            h: 0.3,
            fontSize: 12,
            color: "666666",
          })

          // Add title
          pptxSlide.addText(slide.title, {
            x: 1,
            y: 1,
            w: 8,
            h: 0.8,
            fontSize: 28,
            color: "1F2937",
            bold: true,
            align: "center",
          })

          // Add content
          if (Array.isArray(slide.content)) {
            slide.content.forEach((item: string, itemIndex: number) => {
              pptxSlide.addText(`• ${item}`, {
                x: 1,
                y: 2 + itemIndex * 0.4,
                w: 8,
                h: 0.4,
                fontSize: 16,
                color: "374151",
              })
            })
          } else if (slide.content) {
            pptxSlide.addText(slide.content, {
              x: 1,
              y: 2,
              w: 8,
              h: 2.5,
              fontSize: 16,
              color: "374151",
            })
          }

          // Add slide number
          pptxSlide.addText((index + 1).toString(), {
            x: 9,
            y: 4.8,
            w: 0.8,
            h: 0.3,
            fontSize: 14,
            color: "666666",
            align: "right",
          })
        }
      })

      // Generate and download PPTX
      await pptx.writeFile({ fileName: `${title || "presentation"}.pptx` })
    } catch (error) {
      console.error("Export error:", error)
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`)
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
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

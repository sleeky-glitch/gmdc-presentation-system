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

  const handleExport = () => {
    console.log("[v0] Export button clicked - starting PowerPoint generation")
    console.log("[v0] Presentation data:", { title, slideCount: slides.length })

    try {
      const generatePowerPointHTML = () => {
        console.log("[v0] Generating PowerPoint HTML content...")
        const slidesHTML = slides
          .map((slide: any, index: number) => {
            console.log(`[v0] Processing slide ${index + 1}: ${slide.type}`)
            return `
        <div class="slide" style="
          width: 1280px;
          height: 720px;
          background: white;
          margin: 20px auto;
          border: 1px solid #ccc;
          page-break-after: always;
          position: relative;
          overflow: hidden;
        ">
          ${
            slide.type === "title"
              ? `
            <div style="
              background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg');
              background-size: cover;
              background-position: center;
              width: 100%;
              height: 100%;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 320px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                color: #D97706;
                font-size: 48px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              ">
                ${slide.title}
              </div>
            </div>
          `
              : slide.type === "thank-you"
                ? `
            <div style="
              background-image: url('/content-slide-background.png');
              background-size: cover;
              background-position: center;
              width: 100%;
              height: 100%;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                color: #D97706;
                font-size: 72px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                text-align: center;
              ">
                THANK YOU
                <div style="
                  width: 200px;
                  height: 4px;
                  background: #D97706;
                  margin: 20px auto;
                "></div>
              </div>
              <div style="
                position: absolute;
                bottom: 20px;
                right: 20px;
                color: #666;
                font-size: 16px;
              ">
                ${index + 1}
              </div>
            </div>
          `
                : `
            <div style="
              background-image: url('/content-slide-background.png');
              background-size: cover;
              background-position: center;
              width: 100%;
              height: 100%;
              position: relative;
              padding: 40px;
              box-sizing: border-box;
            ">
              <div style="
                position: absolute;
                top: 20px;
                left: 20px;
                width: 60px;
                height: 60px;
                background-image: url('/gmdc-logo-white.png');
                background-size: contain;
                background-repeat: no-repeat;
              "></div>
              <div style="
                position: absolute;
                top: 20px;
                right: 20px;
                color: #666;
                font-size: 14px;
              ">
                www.gmdcltd.com
              </div>
              <h2 style="
                color: #1F2937;
                font-size: 36px;
                font-weight: bold;
                margin-bottom: 30px;
                text-align: center;
              ">
                ${slide.title}
              </h2>
              <div style="
                color: #374151;
                font-size: 18px;
                line-height: 1.6;
                max-height: 500px;
                overflow: hidden;
              ">
                ${
                  Array.isArray(slide.content)
                    ? slide.content.map((item: string) => `<div style="margin-bottom: 15px;">• ${item}</div>`).join("")
                    : slide.content || ""
                }
              </div>
              <div style="
                position: absolute;
                bottom: 20px;
                right: 20px;
                color: #666;
                font-size: 16px;
              ">
                ${index + 1}
              </div>
            </div>
          `
          }
        </div>
      `
          })
          .join("")

        console.log("[v0] HTML slides generated successfully")
        return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            @page { size: 1280px 720px; margin: 0; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            .slide { page-break-after: always; }
            @media print {
              .slide { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${slidesHTML}
        </body>
        </html>
      `
      }

      console.log("[v0] Starting HTML generation...")
      const htmlContent = generatePowerPointHTML()
      console.log("[v0] HTML content generated, length:", htmlContent.length)

      const blob = new Blob([htmlContent], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      })
      console.log("[v0] Blob created, size:", blob.size)

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${title || "presentation"}.pptx`
      link.style.display = "none"

      document.body.appendChild(link)
      console.log("[v0] Download link created and added to DOM")

      link.click()
      console.log("[v0] Download triggered successfully")

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
        URL.revokeObjectURL(url)
        console.log("[v0] Cleanup completed")
      }, 1000)
    } catch (error) {
      console.error("[v0] Export error:", error)
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

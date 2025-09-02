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
      const response = await fetch("/api/export-powerpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presentation }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Get the PowerPoint file as a blob
      const blob = await response.blob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "presentation"}.pptx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
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

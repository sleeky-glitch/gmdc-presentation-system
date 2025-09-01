"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Calendar, FileText, List, Eye, Download } from "lucide-react"
import { FileUpload } from "./file-upload"
import { toast } from "@/hooks/use-toast"

interface PresentationFormProps {
  onPresentationGenerated: (presentation: any) => void
}

export function PresentationForm({ onPresentationGenerated }: PresentationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    date: "",
    tableOfContents: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files)
  }

  const handleGenerate = async () => {
    if (!formData.title || !formData.summary) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("summary", formData.summary)
      formDataToSend.append("date", formData.date)
      formDataToSend.append("tableOfContents", formData.tableOfContents)

      uploadedFiles.forEach((file, index) => {
        formDataToSend.append(`file_${index}`, file)
      })

      const response = await fetch("/api/generate-presentation", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate presentation: ${errorText}`)
      }

      const presentation = await response.json()
      setGeneratedPresentation(presentation)
      onPresentationGenerated(presentation)

      toast({
        title: "Success!",
        description: "Your presentation has been generated successfully",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: `There was an error generating your presentation: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    console.log("[v0] Download button clicked")
    if (!generatedPresentation) {
      console.log("[v0] No generated presentation found")
      toast({
        title: "No Presentation",
        description: "Please generate a presentation first",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Generating PowerPoint presentation...")

      const { default: PptxGenJS } = await import("pptxgenjs")

      // Check if we're in browser environment
      if (typeof window === "undefined") {
        throw new Error("PowerPoint generation must run in browser environment")
      }

      const pptx = new PptxGenJS()

      // Set presentation properties
      pptx.author = "GMDC"
      pptx.company = "Gujarat Mineral Development Corporation Ltd"
      pptx.title = formData.title || "GMDC Presentation"
      pptx.subject = formData.summary || "GMDC Presentation"

      // Standard presentation dimensions (16:9)
      pptx.defineLayout({ name: "GMDC_LAYOUT", width: 13.33, height: 7.5 })
      pptx.layout = "GMDC_LAYOUT"

      // Title Slide
      const titleSlide = pptx.addSlide()
      titleSlide.background = {
        path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg",
      }

      titleSlide.addText(formData.title || "Presentation Title", {
        x: 1,
        y: 4.5,
        w: 11.33,
        h: 1.5,
        fontSize: 36,
        bold: true,
        color: "8B4513",
        align: "center",
        fontFace: "Arial",
      })

      if (formData.date) {
        titleSlide.addText(formData.date, {
          x: 1,
          y: 6,
          w: 11.33,
          h: 0.5,
          fontSize: 18,
          color: "666666",
          align: "center",
          fontFace: "Arial",
        })
      }

      titleSlide.addText("www.gmdcltd.com", {
        x: 1,
        y: 7,
        w: 11.33,
        h: 0.3,
        fontSize: 14,
        color: "666666",
        align: "center",
        fontFace: "Arial",
      })

      // Table of Contents Slide
      if (generatedPresentation.tableOfContents) {
        const tocSlide = pptx.addSlide()
        tocSlide.background = {
          path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KKzuc0o3AdSKVw2TJMYYwRhJi9QsGD.png",
        }

        tocSlide.addImage({
          path: "https://www.gmdcltd.com/assets/img/logo.jpg",
          x: 0.5,
          y: 0.3,
          w: 1.5,
          h: 0.8,
        })

        tocSlide.addText("www.gmdcltd.com", {
          x: 10.5,
          y: 0.3,
          w: 2.5,
          h: 0.3,
          fontSize: 14,
          color: "666666",
          fontFace: "Arial",
        })

        tocSlide.addText("Table of Content", {
          x: 1,
          y: 1.5,
          w: 11.33,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: "333333",
          fontFace: "Arial",
        })

        const tocItems = generatedPresentation.tableOfContents
          .split("\n")
          .filter((item: string) => item.trim())
          .map((item: string, index: number) => `${index + 1}. ${item.trim()}`)
          .join("\n")

        tocSlide.addText(tocItems, {
          x: 1,
          y: 2.5,
          w: 11.33,
          h: 4,
          fontSize: 16,
          color: "333333",
          fontFace: "Arial",
          bullet: true,
        })

        tocSlide.addText("2", {
          x: 12.5,
          y: 7,
          w: 0.5,
          h: 0.3,
          fontSize: 12,
          color: "666666",
          fontFace: "Arial",
        })
      }

      // Content Slides
      const slides = generatedPresentation.slides || []
      slides.forEach((slide: any, index: number) => {
        const contentSlide = pptx.addSlide()
        contentSlide.background = {
          path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KKzuc0o3AdSKVw2TJMYYwRhJi9QsGD.png",
        }

        // Header with logo and website
        contentSlide.addImage({
          path: "https://www.gmdcltd.com/assets/img/logo.jpg",
          x: 0.5,
          y: 0.3,
          w: 1.5,
          h: 0.8,
        })

        contentSlide.addText("www.gmdcltd.com", {
          x: 10.5,
          y: 0.3,
          w: 2.5,
          h: 0.3,
          fontSize: 14,
          color: "666666",
          fontFace: "Arial",
        })

        // Slide title
        contentSlide.addText(slide.title || `Slide ${index + 1}`, {
          x: 1,
          y: 1.5,
          w: 11.33,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: "333333",
          fontFace: "Arial",
        })

        // Content - extract text from HTML
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = slide.content || ""
        const plainText = tempDiv.textContent || tempDiv.innerText || ""

        contentSlide.addText(plainText, {
          x: 1,
          y: 2.5,
          w: 11.33,
          h: 4,
          fontSize: 16,
          color: "333333",
          fontFace: "Arial",
          bullet: true,
        })

        // Slide number
        const slideNumber = index + (generatedPresentation.tableOfContents ? 3 : 2)
        contentSlide.addText(slideNumber.toString(), {
          x: 12.5,
          y: 7,
          w: 0.5,
          h: 0.3,
          fontSize: 12,
          color: "666666",
          fontFace: "Arial",
        })
      })

      // Thank You Slide
      const thankYouSlide = pptx.addSlide()
      thankYouSlide.background = {
        path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg",
      }

      thankYouSlide.addText("THANK YOU", {
        x: 1,
        y: 3.5,
        w: 11.33,
        h: 1.5,
        fontSize: 48,
        bold: true,
        color: "8B4513",
        align: "center",
        fontFace: "Arial",
      })

      const finalSlideNumber = slides.length + (generatedPresentation.tableOfContents ? 3 : 2)
      thankYouSlide.addText(finalSlideNumber.toString(), {
        x: 12.5,
        y: 7,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: "666666",
        fontFace: "Arial",
      })

      // Generate and download PowerPoint file
      const fileName = `${formData.title?.replace(/[^a-z0-9]/gi, "_") || "GMDC-Presentation"}.pptx`
      await pptx.writeFile({ fileName })

      toast({
        title: "PowerPoint Generated!",
        description: "Your presentation has been downloaded as a PowerPoint file",
      })
    } catch (error) {
      console.error("[v0] PowerPoint generation error:", error)

      console.log("[v0] Falling back to HTML download...")
      try {
        const htmlContent = generatePresentationHTML(generatedPresentation, formData)
        const dataBlob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${formData.title?.replace(/[^a-z0-9]/gi, "_") || "GMDC-Presentation"}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "HTML Presentation Downloaded",
          description: "PowerPoint generation failed, but HTML version has been downloaded",
        })
      } catch (fallbackError) {
        toast({
          title: "Export Failed",
          description: `Error generating presentation: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleTextExport = () => {
    if (!generatedPresentation) return

    const textContent = generateSlideBySlideText(generatedPresentation, formData)
    const dataBlob = new Blob([textContent], { type: "text/plain" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${formData.title || "GMDC-Presentation"}-slides.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Text Exported!",
      description: "Slide content has been downloaded as text file",
    })
  }

  const handlePreview = () => {
    if (generatedPresentation) {
      onPresentationGenerated(generatedPresentation)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6" />
            Create New Presentation
          </CardTitle>
          <CardDescription className="text-green-100">
            Fill in the details below to generate your professional GMDC presentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-gray-700 font-semibold">
                <FileText className="h-4 w-4 text-green-600" />
                Presentation Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Manpower Planning for Year 2024-25"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-gray-700 font-semibold">
                <Calendar className="h-4 w-4 text-green-600" />
                Date of Presentation
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-gray-700 font-semibold">
              Brief Summary *
            </Label>
            <Textarea
              id="summary"
              placeholder="Provide a brief summary of what this presentation should cover..."
              rows={4}
              value={formData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {/* Table of Contents */}
          <div className="space-y-2">
            <Label htmlFor="tableOfContents" className="flex items-center gap-2 text-gray-700 font-semibold">
              <List className="h-4 w-4 text-green-600" />
              Table of Contents (Optional)
            </Label>
            <Textarea
              id="tableOfContents"
              placeholder="Leave empty to auto-generate, or specify your own structure..."
              rows={3}
              value={formData.tableOfContents}
              onChange={(e) => handleInputChange("tableOfContents", e.target.value)}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
            <p className="text-sm text-gray-600">
              If not provided, we'll automatically generate a table of contents based on your summary
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Knowledge Base Documents (Optional)</Label>
            <FileUpload onFilesUploaded={handleFilesUploaded} />
            <p className="text-sm text-gray-600">Upload Excel, PDF, or Word documents to enhance content generation</p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Presentation...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Presentation
              </>
            )}
          </Button>

          {generatedPresentation && (
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1 h-12 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                <Eye className="mr-2 h-5 w-5" />
                Preview Presentation
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 h-12 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                <Download className="mr-2 h-5 w-5" />
                Export PowerPoint
              </Button>
              <Button
                onClick={handleTextExport}
                variant="outline"
                className="flex-1 h-12 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                <FileText className="mr-2 h-5 w-5" />
                Export Text
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function generatePresentationHTML(presentation: any, formData: any): string {
  const slides = presentation.slides || []

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${(formData.title || "GMDC Presentation").replace(/[<>]/g, "")}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #333;
        }
        .slide {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            margin: 0;
            page-break-after: always;
            /* Added background image for content slides */
            background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KKzuc0o3AdSKVw2TJMYYwRhJi9QsGD.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        .slide.title-slide {
            background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg');
        }
        .slide.thank-you-slide {
            background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg');
        }
        .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-shrink: 0;
        }
        .gmdc-logo {
            height: 40px;
        }
        .slide-number {
            background: rgba(0,0,0,0.1);
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 14px;
        }
        .slide-title {
            font-size: 36px;
            font-weight: bold;
            color: #8B4513;
            text-align: center;
            margin: 40px 0;
            text-decoration: underline;
            text-decoration-color: #D2691E;
        }
        .slide-content {
            flex: 1;
            overflow: hidden;
        }
        .slide-content h2 {
            font-size: 28px;
            color: #333;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .slide-content ul {
            list-style: none;
            padding: 0;
        }
        .slide-content li {
            font-size: 16px;
            line-height: 1.4;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        .slide-content li:before {
            content: "➢";
            color: #4169E1;
            position: absolute;
            left: 0;
        }
        .thank-you-content {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-size: 48px;
            font-weight: bold;
            color: #8B4513;
            text-decoration: underline;
            text-decoration-color: #D2691E;
        }
        @media print {
            .slide { 
                page-break-after: always;
                margin: 0;
                width: 100%;
                height: 100vh;
            }
        }
    </style>
</head>
<body>
         Title Slide 
        <div class="slide title-slide">
            <div style="position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%); text-align: center;">
                <div class="slide-title">${(formData.title || "Presentation Title").replace(/[<>]/g, "")}</div>
                ${formData.date ? `<div style="font-size: 18px; color: #666; margin-top: 20px;">${formData.date}</div>` : ""}
            </div>
            <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); font-size: 14px; color: #666;">
                www.gmdcltd.com
            </div>
            <div style="position: absolute; bottom: 10px; left: 20px; font-size: 12px; color: #666;">1</div>
        </div>

        ${
          presentation.tableOfContents
            ? `
        <div class="slide">
            <div class="slide-header">
                <img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" class="gmdc-logo" />
                <div style="font-size: 14px; color: #666;">www.gmdcltd.com</div>
            </div>
            <div class="slide-content">
                <h2>Table of Content</h2>
                <ul>
                    ${presentation.tableOfContents
                      .split("\n")
                      .filter((item: string) => item.trim())
                      .map(
                        (item: string, index: number) => `<li>${index + 1}. ${item.trim().replace(/[<>]/g, "")}</li>`,
                      )
                      .join("")}
                </ul>
            </div>
            <div style="position: absolute; bottom: 10px; right: 20px; font-size: 12px; color: #666;">2</div>
        </div>`
            : ""
        }

        ${slides
          .map(
            (slide: any, index: number) => `
        <div class="slide">
            <div class="slide-header">
                <img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" class="gmdc-logo" />
                <div style="font-size: 14px; color: #666;">www.gmdcltd.com</div>
            </div>
            <div class="slide-content">
                <h2>${(slide.title || "").replace(/[<>]/g, "")}</h2>
                <div>${slide.content || ""}</div>
            </div>
            <div style="position: absolute; bottom: 10px; right: 20px; font-size: 12px; color: #666;">${index + (presentation.tableOfContents ? 3 : 2)}</div>
        </div>`,
          )
          .join("")}

        <div class="slide thank-you-slide">
            <div class="thank-you-content" style="margin-top: 10px;">
                THANK YOU
            </div>
            <div style="position: absolute; bottom: 10px; right: 20px; font-size: 12px; color: #666;">${slides.length + (presentation.tableOfContents ? 3 : 2)}</div>
        </div>
</body>
</html>`
}

function generateSlideBySlideText(presentation: any, formData: any): string {
  const slides = presentation.slides || []
  let textContent = ""

  // Title slide
  textContent += `SLIDE 1: TITLE SLIDE\n`
  textContent += `Title: ${formData.title || "Presentation Title"}\n`
  if (formData.date) {
    textContent += `Date: ${formData.date}\n`
  }
  textContent += `\n${"=".repeat(50)}\n\n`

  // Table of Contents
  if (presentation.tableOfContents) {
    textContent += `SLIDE 2: TABLE OF CONTENTS\n`
    textContent += `Table of Content:\n`
    presentation.tableOfContents.split("\n").forEach((item: string, index: number) => {
      if (item.trim()) {
        textContent += `${index + 1}. ${item.trim()}\n`
      }
    })
    textContent += `\n${"=".repeat(50)}\n\n`
  }

  // Content slides
  slides.forEach((slide: any, index: number) => {
    const slideNumber = index + (presentation.tableOfContents ? 3 : 2)
    textContent += `SLIDE ${slideNumber}: ${slide.title.toUpperCase()}\n`
    textContent += `Title: ${slide.title}\n\n`

    // Extract text content from HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = slide.content
    const plainText = tempDiv.textContent || tempDiv.innerText || ""
    textContent += `Content:\n${plainText}\n`

    if (slide.chart) {
      textContent += `\nChart: ${slide.chart.type}\n`
      if (slide.chart.data) {
        textContent += `Chart Data: ${JSON.stringify(slide.chart.data, null, 2)}\n`
      }
    }

    if (slide.table) {
      textContent += `\nTable Data:\n`
      const tempTableDiv = document.createElement("div")
      tempTableDiv.innerHTML = slide.table
      const tableText = tempTableDiv.textContent || tempTableDiv.innerText || ""
      textContent += `${tableText}\n`
    }

    textContent += `\n${"=".repeat(50)}\n\n`
  })

  // Thank you slide
  const finalSlideNumber = slides.length + (presentation.tableOfContents ? 3 : 2)
  textContent += `SLIDE ${finalSlideNumber}: THANK YOU SLIDE\n`
  textContent += `Content: THANK YOU\n`
  textContent += `\n${"=".repeat(50)}\n\n`

  textContent += `Generated on: ${new Date().toLocaleString()}\n`
  textContent += `Total Slides: ${finalSlideNumber}\n`

  return textContent
}

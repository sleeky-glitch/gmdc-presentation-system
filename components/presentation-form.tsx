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

  const handleDownload = () => {
    if (!generatedPresentation) return

    const htmlContent = generatePresentationHTML(generatedPresentation, formData)
    const dataBlob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${formData.title || "GMDC-Presentation"}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "Presentation has been downloaded as HTML file",
    })
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
                Download HTML
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
    <title>${formData.title || "GMDC Presentation"}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: #f8f9fa;
        }
        .presentation-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
        .slide {
            width: 100%;
            height: 100vh;
            padding: 60px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            page-break-after: always;
            position: relative;
            /* Added GMDC background texture */
            background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Env%20PPTsENV.%20PPT%20%20%2823.01.2023%29.jpg-GzEIJX7CGTKIxusfQ5fi9SSvkA7RKs.jpeg');
            background-size: cover;
            background-position: center;
        }
        .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            /* Updated border color to GMDC green */
            border-bottom: 3px solid #16a34a;
            padding-bottom: 20px;
        }
        .gmdc-logo img {
            height: 48px;
            width: auto;
            background: white;
            padding: 4px;
            border-radius: 4px;
        }
        .slide-title {
            font-size: 48px;
            font-weight: bold;
            /* Updated title color to GMDC green */
            color: #16a34a;
            text-align: center;
            margin: 100px 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .slide-content h2 {
            font-size: 36px;
            /* Updated heading color to GMDC green */
            color: #16a34a;
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .slide-content h3 {
            font-size: 28px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .slide-content p, .slide-content li {
            font-size: 20px;
            line-height: 1.6;
            color: #1f2937;
            margin-bottom: 15px;
            /* Added text shadow for better readability on textured background */
            text-shadow: 0 1px 1px rgba(255,255,255,0.8);
        }
        .slide-content ul {
            padding-left: 30px;
        }
        .chart-container {
            margin: 30px 0;
            text-align: center;
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 8px;
        }
        .table-container {
            margin: 30px 0;
            overflow-x: auto;
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        th {
            /* Updated table header to GMDC green */
            background-color: #16a34a;
            color: white;
            font-weight: bold;
        }
        .thank-you-slide {
            display: flex;
            align-items: center;
            justify-content: center;
            /* Updated thank you slide gradient to GMDC colors */
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
        }
        .thank-you-text {
            font-size: 72px;
            font-weight: bold;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .slide-number {
            font-size: 18px;
            font-weight: bold;
            color: #16a34a;
            background: rgba(255,255,255,0.9);
            padding: 8px 12px;
            border-radius: 20px;
        }
        @media print {
            .slide {
                height: 297mm;
                width: 210mm;
            }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <!-- Title Slide -->
        <div class="slide">
            <div class="slide-header">
                <div class="gmdc-logo"><img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" /></div>
                <div class="slide-number">1</div>
            </div>
            <div class="slide-title">${formData.title || "Presentation Title"}</div>
            ${formData.date ? `<div style="text-align: center; font-size: 24px; color: #6b7280; text-shadow: 0 1px 1px rgba(255,255,255,0.8);">${formData.date}</div>` : ""}
        </div>

        <!-- Table of Contents -->
        ${
          presentation.tableOfContents
            ? `
        <div class="slide">
            <div class="slide-header">
                <div class="gmdc-logo"><img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" /></div>
                <div class="slide-number">2</div>
            </div>
            <div class="slide-content">
                <h2>Table of Content</h2>
                <ul>
                    ${presentation.tableOfContents
                      .split("\n")
                      .map((item: string, index: number) =>
                        item.trim() ? `<li>${index + 1}. ${item.trim()}</li>` : "",
                      )
                      .join("")}
                </ul>
            </div>
        </div>
        `
            : ""
        }

        <!-- Content Slides -->
        ${slides
          .map(
            (slide: any, index: number) => `
        <div class="slide">
            <div class="slide-header">
                <div class="gmdc-logo"><img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" /></div>
                <div class="slide-number">${index + (presentation.tableOfContents ? 3 : 2)}</div>
            </div>
            <div class="slide-content">
                <h2>${slide.title}</h2>
                ${slide.content}
                ${slide.chart ? `<div class="chart-container">[Chart: ${slide.chart.type}]</div>` : ""}
                ${slide.table ? `<div class="table-container">${slide.table}</div>` : ""}
            </div>
        </div>
        `,
          )
          .join("")}

        <!-- Thank You Slide -->
        <div class="slide thank-you-slide">
            <div class="slide-header" style="position: absolute; top: 60px; left: 60px; right: 60px; border-bottom: 3px solid white;">
                <div class="gmdc-logo"><img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" style="filter: brightness(0) invert(1);" /></div>
                <div class="slide-number" style="color: white; background: rgba(255,255,255,0.2);">${slides.length + (presentation.tableOfContents ? 3 : 2)}</div>
            </div>
            <div class="thank-you-text">THANK YOU</div>
        </div>
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

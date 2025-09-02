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
    console.log("[v0] PPTX export button clicked")
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
      console.log("[v0] Creating PPTX presentation...")

      const pptxContent = generatePowerPointHTML(generatedPresentation, formData)
      console.log("[v0] PPTX HTML content generated")

      const blob = new Blob([pptxContent], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      })
      console.log("[v0] PPTX Blob created")

      const fileName = `${formData.title?.replace(/[^a-z0-9]/gi, "_") || "GMDC-Presentation"}.pptx`

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.style.display = "none"

      document.body.appendChild(link)
      console.log("[v0] PPTX download link created, triggering download...")

      link.click()

      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
        URL.revokeObjectURL(url)
        console.log("[v0] PPTX download cleanup completed")
      }, 100)

      toast({
        title: "Downloaded!",
        description: "PowerPoint presentation has been downloaded successfully.",
      })
    } catch (error) {
      console.error("[v0] PPTX export error:", error)
      toast({
        title: "Export Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
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
              <Button onClick={handleDownload} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-5 w-5" />
                Export PPTX
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
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .presentation-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .slide {
            width: 100%;
            min-height: 600px;
            padding: 40px;
            border-bottom: 2px solid #e5e7eb;
            page-break-after: always;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .slide:last-child { border-bottom: none; }
        .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #16a34a;
        }
        .gmdc-logo {
            font-weight: bold;
            color: #16a34a;
            font-size: 24px;
        }
        .slide-number {
            background: #16a34a;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
        }
        .slide-title {
            font-size: 42px;
            font-weight: bold;
            color: #16a34a;
            text-align: center;
            margin: 60px 0;
        }
        .slide-content h2 {
            font-size: 32px;
            color: #16a34a;
            margin-bottom: 25px;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 10px;
        }
        .slide-content h3 {
            font-size: 24px;
            color: #1f2937;
            margin: 20px 0 15px 0;
        }
        .slide-content p, .slide-content li {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        .slide-content ul {
            padding-left: 25px;
        }
        .slide-content li {
            margin-bottom: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #16a34a;
            color: white;
            font-weight: bold;
        }
        .thank-you-slide {
            background: linear-gradient(135deg, #16a34a, #22c55e);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .thank-you-text {
            font-size: 64px;
            font-weight: bold;
        }
        @media print {
            body { background: white; padding: 0; }
            .slide { 
                min-height: 90vh; 
                page-break-after: always;
                margin-bottom: 0;
            }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <!-- Title Slide -->
        <div class="slide">
            <div class="slide-header">
                <div class="gmdc-logo">GMDC</div>
                <div class="slide-number">1</div>
            </div>
            <div class="slide-title">${(formData.title || "Presentation Title").replace(/[<>]/g, "")}</div>
            ${formData.date ? `<div style="text-align: center; font-size: 20px; color: #6b7280; margin-top: 20px;">${formData.date}</div>` : ""}
        </div>

        ${
          presentation.tableOfContents
            ? `
        <div class="slide">
            <div class="slide-header">
                <div class="gmdc-logo">GMDC</div>
                <div class="slide-number">2</div>
            </div>
            <div class="slide-content">
                <h2>Table of Contents</h2>
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
        </div>`
            : ""
        }

        ${slides
          .map(
            (slide: any, index: number) => `
        <div class="slide">
            <div class="slide-header">
                <div class="gmdc-logo">GMDC</div>
                <div class="slide-number">${index + (presentation.tableOfContents ? 3 : 2)}</div>
            </div>
            <div class="slide-content">
                <h2>${(slide.title || "").replace(/[<>]/g, "")}</h2>
                <div>${slide.content || ""}</div>
                ${slide.table ? `<div style="margin: 20px 0;">${slide.table}</div>` : ""}
            </div>
        </div>`,
          )
          .join("")}

        <div class="slide thank-you-slide">
            <div style="position: absolute; top: 40px; left: 40px; right: 40px;">
                <div class="slide-header" style="border-bottom: 3px solid white;">
                    <div class="gmdc-logo" style="color: white;">GMDC</div>
                    <div class="slide-number" style="background: rgba(255,255,255,0.2);">${slides.length + (presentation.tableOfContents ? 3 : 2)}</div>
                </div>
            </div>
            <div class="thank-you-text">THANK YOU</div>
        </div>
    </div>
</body>
</html>`
}

function generatePowerPointHTML(presentation: any, formData: any): string {
  const slides = presentation.slides || []

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${(formData.title || "GMDC Presentation").replace(/[<>]/g, "")}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            background: #000;
            color: #333;
            overflow: hidden;
        }
        .presentation-container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        .slide {
            width: 1280px;
            height: 720px;
            background: #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            padding: 60px;
            box-sizing: border-box;
            border: 1px solid #ddd;
        }
        .slide.active { display: block; }
        .slide-header {
            position: absolute;
            top: 20px;
            left: 60px;
            right: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
        }
        .gmdc-logo {
            font-weight: bold;
            color: #16a34a;
            font-size: 28px;
        }
        .slide-number {
            background: #16a34a;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 16px;
        }
        .title-slide {
            background: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg') no-repeat center center;
            background-size: cover;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .slide-title {
            font-size: 64px;
            font-weight: bold;
            color: #d97706;
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: absolute;
            top: 320px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
        }
        .content-slide {
            background: url('/content-slide-background.png') no-repeat center center;
            background-size: cover;
        }
        .slide-content {
            margin-top: 80px;
            height: calc(100% - 140px);
            overflow: hidden;
            background: rgba(255,255,255,0.9);
            padding: 40px;
            border-radius: 10px;
        }
        .slide-content h2 {
            font-size: 48px;
            color: #16a34a;
            margin-bottom: 40px;
            border-bottom: 4px solid #16a34a;
            padding-bottom: 15px;
        }
        .slide-content h3 {
            font-size: 32px;
            color: #1f2937;
            margin: 30px 0 20px 0;
        }
        .slide-content p, .slide-content li {
            font-size: 24px;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .slide-content ul {
            padding-left: 40px;
        }
        .slide-content li {
            margin-bottom: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 16px;
            text-align: left;
            font-size: 20px;
        }
        th {
            background-color: #16a34a;
            color: white;
            font-weight: bold;
        }
        .thank-you-slide {
            background: url('/content-slide-background.png') no-repeat center center;
            background-size: cover;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .thank-you-text {
            font-size: 96px;
            font-weight: bold;
            color: #d97706;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .navigation {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 1000;
        }
        @media print {
            .slide { 
                width: 100vw;
                height: 100vh;
                position: static;
                transform: none;
                page-break-after: always;
                display: block !important;
            }
            .navigation { display: none; }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
         Title Slide 
        <div class="slide title-slide active">
            <div class="slide-header">
                <div class="gmdc-logo">GMDC</div>
                <div class="slide-number">1</div>
            </div>
            <div class="slide-title">${(formData.title || "Presentation Title").replace(/[<>]/g, "")}</div>
        </div>

        ${
          presentation.tableOfContents
            ? `
        <div class="slide content-slide">
            <div class="slide-header">
                <div class="gmdc-logo">GMDC</div>
                <div class="slide-number">2</div>
            </div>
            <div class="slide-content">
                <h2>Table of Contents</h2>
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
        </div>`
            : ""
        }

        ${slides
          .map(
            (slide: any, index: number) => `
        <div class="slide content-slide">
            <div class="slide-header">
                <div class="gmdc-logo">GMDC</div>
                <div class="slide-number">${index + (presentation.tableOfContents ? 3 : 2)}</div>
            </div>
            <div class="slide-content">
                <h2>${(slide.title || "").replace(/[<>]/g, "")}</h2>
                <div>${slide.content || ""}</div>
                ${slide.table ? `<div style="margin: 30px 0;">${slide.table}</div>` : ""}
            </div>
        </div>`,
          )
          .join("")}

         Thank You Slide 
        <div class="slide thank-you-slide">
            <div class="slide-header">
                <div class="gmdc-logo">GMDC</div>
                <div class="slide-number">${slides.length + (presentation.tableOfContents ? 3 : 2)}</div>
            </div>
            <div class="thank-you-text">THANK YOU</div>
        </div>
    </div>

    <div class="navigation">
        Use arrow keys or spacebar to navigate • Press Ctrl+P to print as PDF
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        
        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            if (slides[n]) {
                slides[n].classList.add('active');
                document.querySelector('.navigation').textContent = 
                    \`Slide \${n + 1} of \${slides.length} • Use arrow keys to navigate • Press Ctrl+P to print\`;
            }
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                currentSlide = Math.min(currentSlide + 1, slides.length - 1);
                showSlide(currentSlide);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                currentSlide = Math.max(currentSlide - 1, 0);
                showSlide(currentSlide);
            } else if (e.key === 'Home') {
                e.preventDefault();
                currentSlide = 0;
                showSlide(currentSlide);
            } else if (e.key === 'End') {
                e.preventDefault();
                currentSlide = slides.length - 1;
                showSlide(currentSlide);
            }
        });
        
        // Click navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.slide')) {
                currentSlide = Math.min(currentSlide + 1, slides.length - 1);
                showSlide(currentSlide);
            }
        });
        
        showSlide(0);
    </script>
</body>
</html>`
}

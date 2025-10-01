"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function PresentationUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadStatus({ type: null, message: "" })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/presentations/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus({
          type: "success",
          message: `Successfully uploaded "${data.presentation.title}" with ${data.presentation.totalSlides} slides`,
        })
      } else {
        setUploadStatus({
          type: "error",
          message: data.error || "Failed to upload presentation",
        })
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "An error occurred while uploading",
      })
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Reference Presentations</CardTitle>
        <CardDescription>
          Upload existing PowerPoint presentations to improve AI-generated content through similarity matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            disabled={uploading}
            onClick={() => document.getElementById("file-upload")?.click()}
            className="relative"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload PPTX
              </>
            )}
          </Button>
          <input id="file-upload" type="file" accept=".pptx" onChange={handleFileUpload} className="hidden" />
        </div>

        {uploadStatus.type && (
          <div
            className={`flex items-start gap-2 rounded-lg border p-4 ${
              uploadStatus.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{uploadStatus.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

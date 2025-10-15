"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

export function KnowledgeBaseManager() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [documentType, setDocumentType] = useState("presentation")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleIngest = async () => {
    if (!title || !content) {
      setUploadStatus({
        type: "error",
        message: "Please provide both title and content",
      })
      return
    }

    setIsUploading(true)
    setUploadStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/knowledge-base/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          documentType,
          content,
          source: "manual_upload",
          metadata: { uploadedAt: new Date().toISOString() },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUploadStatus({
          type: "success",
          message: `Successfully ingested ${data.chunksProcessed} chunks from "${title}"`,
        })
        setTitle("")
        setContent("")
      } else {
        setUploadStatus({
          type: "error",
          message: data.error || "Failed to ingest knowledge base",
        })
      }
    } catch (error: any) {
      setUploadStatus({
        type: "error",
        message: error.message || "Failed to ingest knowledge base",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Knowledge Base Manager
        </CardTitle>
        <CardDescription>Add domain-specific content to improve presentation generation accuracy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kb-title">Document Title</Label>
          <Input
            id="kb-title"
            placeholder="e.g., GMDC Digital Initiatives Review 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kb-type">Document Type</Label>
          <select
            id="kb-type"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="presentation">Presentation</option>
            <option value="report">Report</option>
            <option value="policy">Policy Document</option>
            <option value="technical">Technical Document</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kb-content">Content</Label>
          <Textarea
            id="kb-content"
            placeholder="Paste your document content here (supports structured text, slide content, etc.)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        {uploadStatus.type && (
          <div
            className={`flex items-center gap-2 rounded-md p-3 ${
              uploadStatus.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm">{uploadStatus.message}</span>
          </div>
        )}

        <Button onClick={handleIngest} disabled={isUploading || !title || !content} className="w-full">
          {isUploading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Ingest Knowledge Base
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Presentation } from "lucide-react"
import { PresentationForm } from "@/components/presentation-form"
import { PresentationViewer } from "@/components/presentation-viewer"
import { PresentationUpload } from "@/components/presentation-upload"
import { KnowledgeBaseManager } from "@/components/knowledge-base-manager"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"form" | "viewer">("form")
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null)

  const handlePresentationGenerated = (presentation: any) => {
    setGeneratedPresentation(presentation)
    setCurrentView("viewer")
  }

  const handleBackToForm = () => {
    setCurrentView("form")
    setGeneratedPresentation(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src="https://www.gmdcltd.com/assets/img/logo.jpg"
                alt="GMDC Logo"
                className="h-20 w-auto bg-white p-2 rounded"
              />
              <div>
                <h1 className="text-2xl font-bold">Gujarat Mineral Development Corporation Ltd</h1>
                <p className="text-green-100 text-base">A Government of Gujarat Enterprise</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Presentation className="h-6 w-6" />
              <span className="font-semibold">Presentation System</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {currentView === "form" && (
          <>
            <div className="max-w-4xl mx-auto mb-8">
              <KnowledgeBaseManager />
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <PresentationUpload />
            </div>
          </>
        )}

        {/* Main Content */}
        {currentView === "form" ? (
          <PresentationForm onPresentationGenerated={handlePresentationGenerated} />
        ) : (
          <PresentationViewer presentation={generatedPresentation} onBackToForm={handleBackToForm} />
        )}
      </div>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="https://www.gmdcltd.com/assets/img/logo.jpg"
              alt="GMDC Logo"
              className="h-8 w-auto bg-white p-1 rounded"
            />
            <div className="text-sm">
              <div className="font-semibold">Gujarat Mineral Development Corporation Ltd</div>
              <div className="text-gray-400">Putting Nature's Wealth to Nation's Use</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 GMDC Ltd. All rights reserved. | AI Presentation Generation System
          </p>
        </div>
      </footer>
    </div>
  )
}

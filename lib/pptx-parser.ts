interface ParsedSlide {
  slideNumber: number
  slideType: "title" | "content" | "toc" | "thankyou"
  title: string
  content: string
  bulletPoints: string[]
}

interface ParsedPresentation {
  title: string
  fileName: string
  totalSlides: number
  slides: ParsedSlide[]
}

export async function parsePowerPoint(file: File): Promise<ParsedPresentation> {
  // For now, we'll use a simple text extraction approach
  // In production, you'd use a library like 'pptx' or 'officegen'

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // This is a placeholder - in production you'd use proper PPTX parsing
  // For now, we'll return a mock structure that you can replace with actual parsing

  return {
    title: file.name.replace(".pptx", ""),
    fileName: file.name,
    totalSlides: 0,
    slides: [],
  }
}

// Helper function to classify slide type based on content
export function classifySlideType(title: string, content: string): "title" | "content" | "toc" | "thankyou" {
  const lowerTitle = title.toLowerCase()
  const lowerContent = content.toLowerCase()

  if (lowerTitle.includes("thank") || lowerContent.includes("thank you")) {
    return "thankyou"
  }

  if (lowerTitle.includes("table of contents") || lowerTitle.includes("agenda") || lowerTitle.includes("outline")) {
    return "toc"
  }

  // First slide is usually title
  if (!content || content.length < 50) {
    return "title"
  }

  return "content"
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[Test PowerPoint] Starting test...")

  try {
    // Test 1: Basic response
    console.log("[Test PowerPoint] Test 1: Basic response works")

    // Test 2: Dynamic import
    console.log("[Test PowerPoint] Test 2: Attempting dynamic import...")
    const officegen = await import("officegen")
    console.log("[Test PowerPoint] Test 2: Dynamic import successful")

    // Test 3: Create officegen instance
    console.log("[Test PowerPoint] Test 3: Creating officegen instance...")
    const pptx = officegen.default("pptx")
    console.log("[Test PowerPoint] Test 3: Officegen instance created")

    // Test 4: Add a simple slide
    console.log("[Test PowerPoint] Test 4: Adding simple slide...")
    const slide = pptx.makeNewSlide()
    slide.addText("Test Slide", { x: "c", y: "c" })
    console.log("[Test PowerPoint] Test 4: Slide added successfully")

    return NextResponse.json({
      success: true,
      message: "All tests passed - officegen is working",
    })
  } catch (error: any) {
    console.error("[Test PowerPoint] Error:", error)
    console.error("[Test PowerPoint] Error stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

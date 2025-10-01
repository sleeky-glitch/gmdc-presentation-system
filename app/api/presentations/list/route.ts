import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: presentations, error } = await supabase
      .from("presentations")
      .select("id, title, file_name, total_slides, created_at")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching presentations:", error)
      return NextResponse.json({ error: "Failed to fetch presentations" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      presentations: presentations || [],
    })
  } catch (error) {
    console.error("[v0] Error in list presentations:", error)
    return NextResponse.json({ error: "Failed to list presentations" }, { status: 500 })
  }
}

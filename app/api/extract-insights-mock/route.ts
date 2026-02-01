import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Mock extraction for testing
    return NextResponse.json({
      extracted: {
        energy_level: 8,
        difficulty_rating: 7,
        mood: "energized",
        highlights: ["Great core work", "Felt strong", "Good energy"],
        challenges: ["Hip flexors tight", "Balance poses were tough"],
        body_feelings: ["Core engaged", "Hip flexors tight", "Upper body strong"],
        instructor_feedback: "Amazing coaching and energy",
        tags: ["core-focused", "flexibility-challenge", "high-energy"]
      }
    })
  } catch (error: any) {
    console.error('Mock extraction error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
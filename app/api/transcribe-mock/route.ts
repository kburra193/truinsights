import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Mock transcription for testing
    return NextResponse.json({
      transcript: "This is a mock transcription. Hot pilates class was amazing today! Energy level was really high, about 8 out of 10. Core work was challenging but felt great. Hip flexors were a bit tight but managed to push through.",
    })
  } catch (error: any) {
    console.error('Mock transcription error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
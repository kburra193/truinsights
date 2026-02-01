import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const EXTRACTION_PROMPT = `You are analyzing a voice journal entry from a fitness class. 
Extract the following structured information from the transcript.

Transcript: {transcript}

Please extract and return a JSON object with:
{
  "energy_level": <1-10, how energetic they felt>,
  "difficulty_rating": <1-10, how difficult the class was>,
  "mood": "<one word: energized/tired/accomplished/frustrated/motivated/relaxed>",
  "highlights": ["<positive aspects they mentioned>"],
  "challenges": ["<difficulties or struggles they mentioned>"],
  "body_feelings": ["<how their body felt, specific muscle groups or sensations>"],
  "instructor_feedback": "<any comments about the instructor, or empty string>",
  "tags": ["<relevant tags like 'core-focused', 'cardio-heavy', 'flexibility', 'strength', 'recovery', etc>"]
}

If the transcript is very short or unclear, make reasonable inferences but be conservative with ratings.
Return ONLY valid JSON, no markdown formatting or other text.`

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      )
    }

    console.log('Extracting insights from transcript:', transcript)

    const prompt = EXTRACTION_PROMPT.replace('{transcript}', transcript)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text from Claude's response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    console.log('Claude response:', responseText)

    // Parse JSON (remove any markdown code blocks if present)
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const extracted = JSON.parse(cleanedText)

    console.log('Extracted insights:', extracted)

    return NextResponse.json({
      extracted,
    })
  } catch (error: any) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: error.message || 'Extraction failed' },
      { status: 500 }
    )
  }
}
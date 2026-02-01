export interface AudioRecording {
    blob: Blob
    url: string
    duration: number
  }
  
  export interface JournalExtraction {
    energy_level: number
    difficulty_rating: number
    mood: string
    highlights: string[]
    challenges: string[]
    body_feelings: string[]
    instructor_feedback: string
    tags: string[]
  }
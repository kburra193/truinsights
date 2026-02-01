import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type ClassType = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type ClassSession = {
  id: string
  user_id: string
  class_type_id: string
  instructor_name: string
  class_date: string
  class_time: string | null
  created_at: string
}

export type Journal = {
  id: string
  session_id: string
  user_id: string
  audio_url: string | null
  audio_duration_seconds: number | null
  transcript: string | null
  energy_level: number | null
  difficulty_rating: number | null
  mood: string | null
  extracted_data: any | null
  tags: string[] | null
  created_at: string
  updated_at: string
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mic, Square, Play, Pause, Trash2, Send, ArrowLeft } from 'lucide-react'

export default function NewJournalPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    checkUser()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
    } else {
      setUser(session.user)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
    chunksRef.current = []
  }

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSubmit = async () => {
    if (!audioBlob || !user) return

    setIsSubmitting(true)

    try {
      // 1. Upload audio to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-journals')
        .upload(fileName, audioBlob)

      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-journals')
        .getPublicUrl(fileName)

      // 3. Create journal entry in database (without AI processing for now)
      const { data: journalData, error: journalError } = await supabase
        .from('journals')
        .insert({
          user_id: user.id,
          audio_url: publicUrl,
          audio_duration_seconds: duration,
          transcript: null, // We'll add AI processing later
          energy_level: null,
          difficulty_rating: null,
          mood: null,
          extracted_data: null,
          tags: null,
        })
        .select()
        .single()

      if (journalError) throw journalError

      alert('Journal saved successfully! 🎉')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error submitting journal:', error)
      alert('Error saving journal: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">New Journal Entry</h1>
          <p className="text-gray-600 mb-8">Record your post-class thoughts (30-60 seconds recommended)</p>

          {/* Recording Interface */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 mb-6">
            {/* Timer */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-gray-800 mb-2">
                {formatTime(duration)}
              </div>
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Recording...</span>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center gap-4">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-full hover:opacity-90 transition shadow-lg"
                >
                  <Mic size={32} />
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="bg-yellow-500 text-white p-6 rounded-full hover:opacity-90 transition shadow-lg"
                  >
                    {isPaused ? <Play size={32} /> : <Pause size={32} />}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="bg-red-500 text-white p-6 rounded-full hover:opacity-90 transition shadow-lg"
                  >
                    <Square size={32} />
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <>
                  <button
                    onClick={togglePlayback}
                    className="bg-green-500 text-white p-6 rounded-full hover:opacity-90 transition shadow-lg"
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                  </button>
                  <button
                    onClick={deleteRecording}
                    className="bg-red-500 text-white p-6 rounded-full hover:opacity-90 transition shadow-lg"
                  >
                    <Trash2 size={32} />
                  </button>
                </>
              )}
            </div>

            {/* Hidden audio element for playback */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}
          </div>

          {/* Submit Button */}
          {audioBlob && !isRecording && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Save Journal
                </>
              )}
            </button>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for a great journal:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mention how you felt during the class</li>
              <li>• Note any specific exercises that were challenging or felt great</li>
              <li>• Share your energy level and any body sensations</li>
              <li>• Keep it natural - just talk like you're texting a friend</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
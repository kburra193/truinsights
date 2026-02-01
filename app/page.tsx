'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session check:', session)
      
      if (session) {
        console.log('User is logged in, redirecting to dashboard')
        router.replace('/dashboard')
      } else {
        console.log('No session, redirecting to auth')
        router.replace('/auth')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      router.replace('/auth')
    } finally {
      setChecking(false)
    }
  }

  if (!checking) {
    return null // Don't show anything after redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  )
}
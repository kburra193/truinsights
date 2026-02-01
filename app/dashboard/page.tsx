'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogOut, Mic, TrendingUp, Calendar, Zap } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [journals, setJournals] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
    } else {
      setUser(session.user)
      loadJournals(session.user.id)
      setLoading(false)
    }
  }

  const loadJournals = async (userId: string) => {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) {
      setJournals(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🏋️ TruInsights</h1>
              <p className="text-sm opacity-90">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Journal Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Quick Journal</h2>
          <p className="opacity-90 mb-6">Record your post-class thoughts</p>
          
          <button
            onClick={() => router.push('/journal/new')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition flex items-center gap-3 text-lg"
          >
            <Mic size={24} />
            Start Recording
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Journals</p>
                <p className="text-2xl font-bold text-gray-800">{journals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Zap className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">This Week</p>
                <p className="text-2xl font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-lg">
                <TrendingUp className="text-pink-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Avg Energy</p>
                <p className="text-2xl font-bold text-gray-800">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Journals */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Journals</h3>
          
          {journals.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg mb-2">No journals yet</p>
              <p className="text-gray-400 mb-6">Start by recording your first post-class journal!</p>
              <button
                onClick={() => router.push('/journal/new')}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Record Your First Journal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {new Date(journal.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </h4>
                    {journal.energy_level && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        Energy: {journal.energy_level}/10
                      </span>
                    )}
                  </div>
                  {journal.transcript && (
                    <p className="text-gray-600 text-sm line-clamp-2">{journal.transcript}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
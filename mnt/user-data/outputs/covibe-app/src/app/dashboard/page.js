'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser, getProfile, signOut } from '@/lib/supabase'
import { calculateCompatibility, filterPotentialMatches, getMatchQuality } from '@/lib/matching'
import Logo from '@/components/Logo'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      const userProfile = await getProfile(currentUser.id)
      if (!userProfile.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      setUser(currentUser)
      setProfile(userProfile)

      // Load potential matches
      await loadMatches(userProfile)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMatches(userProfile) {
    try {
      // Get all profiles in the same city
      const { data: potentialMatches, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('city', userProfile.city)
        .eq('onboarding_completed', true)
        .eq('is_active', true)
        .neq('id', userProfile.id)

      if (error) throw error

      // Filter based on preferences
      const filtered = filterPotentialMatches(userProfile, potentialMatches || [])

      // Calculate compatibility scores
      const scored = filtered.map(match => ({
        ...match,
        compatibility: calculateCompatibility(userProfile, match)
      }))

      // Sort by compatibility score
      scored.sort((a, b) => b.compatibility.overall - a.compatibility.overall)

      setMatches(scored.slice(0, 20)) // Top 20 matches
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Logo size={60} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-pink-500/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={50} />
            <h1 className="text-2xl font-black text-gradient">CoVibe</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Hey, {profile?.full_name}!</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 glass rounded-lg text-white hover:bg-white/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-5xl font-black text-white mb-4">Your Matches</h2>
          <p className="text-xl text-gray-400">
            We found <span className="text-pink-400 font-bold">{matches.length}</span> potential roommates in {profile?.city}
          </p>
        </div>

        {/* Matches Grid */}
        {matches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const quality = getMatchQuality(match.compatibility.overall)
              return (
                <div key={match.id} className="card-gradient p-6 rounded-2xl border-gradient hover:scale-[1.02] transition-transform cursor-pointer">
                  {/* Profile Photo Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-6xl">👤</span>
                  </div>

                  {/* Match Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{match.full_name}</h3>
                    <p className="text-gray-400 text-sm">{match.age} • {match.occupation}</p>
                  </div>

                  {/* Compatibility Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Compatibility</span>
                      <span className="text-lg font-bold text-white">{match.compatibility.overall}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                        style={{ width: `${match.compatibility.overall}%` }}
                      />
                    </div>
                    <p className={`text-sm mt-1 font-semibold ${
                      quality.color === 'green' ? 'text-green-400' :
                      quality.color === 'blue' ? 'text-blue-400' :
                      quality.color === 'yellow' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {quality.label}
                    </p>
                  </div>

                  {/* Key Compatibility Points */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-2xl">🕐</span>
                      <span className="text-gray-300">
                        {match.schedule_type === profile.schedule_type ? 'Same schedule' : 'Different schedule'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-2xl">🎨</span>
                      <span className="text-gray-300">
                        {match.occupation_category === 'creative' ? 'Creative professional' : match.occupation_category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-2xl">💰</span>
                      <span className="text-gray-300">
                        ${match.budget_min}-${match.budget_max}/mo
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                      Connect
                    </button>
                    <button className="px-4 py-2 glass rounded-lg text-white hover:bg-white/20 transition-all">
                      Pass
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card-gradient p-12 rounded-2xl border-gradient text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No matches yet</h3>
            <p className="text-gray-400">
              We're still looking for potential roommates in {profile?.city}. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

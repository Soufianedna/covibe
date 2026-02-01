'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [signupCount] = useState(347)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const user = await getCurrentUser()
      if (user) {
        // User is logged in - redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      // User not logged in - stay on landing page
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    
    try {
      // For now, just show success (you can integrate with Google Forms later)
      setShowSuccess(true)
      setEmail('')
    } catch (error) {
      console.error('Error:', error)
    }
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
            <h1 className="text-3xl font-black text-gradient">CoVibe</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login"
              className="px-6 py-2 glass rounded-lg text-white hover:bg-white/20 transition-all"
            >
              Login
            </Link>
            <Link
              href="/auth/signup" 
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full">
          <p className="text-pink-300 font-semibold flex items-center gap-2 justify-center">
            📈 <span className="text-2xl font-bold text-white">{signupCount}</span> people already signed up
          </p>
        </div>

        <h1 className="text-7xl font-black text-white mb-4 leading-tight">
          More than just a roommate
        </h1>
        <p className="text-3xl text-gradient font-bold mb-6">
          Find your roommate by vibe, not by budget
        </p>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Tired of awkward roommate situations? CoVibe matches you with people who share your lifestyle, schedule, and values.
        </p>

        {!showSuccess ? (
          <div className="max-w-xl mx-auto mb-8">
            <Link
              href="/auth/signup"
              className="inline-block px-12 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105"
            >
              Get Started Now →
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl p-8 max-w-xl mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-white mb-2">You're on the list!</h3>
            <p className="text-gray-300 text-lg">We'll email you when CoVibe launches. Get ready to find your perfect roommate!</p>
          </div>
        )}

        <p className="text-pink-300 mt-6 font-semibold">🚀 Launching Soon Across Canada</p>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-5xl font-black text-white text-center mb-16">Why CoVibe?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { 
              title: 'Lifestyle Matching', 
              desc: 'Match based on schedules, habits, and values - not just budget', 
              emoji: '✨', 
              color: 'from-pink-500 to-purple-500' 
            },
            { 
              title: 'Creative Communities', 
              desc: 'Find other creators, musicians, artists who understand your craft', 
              emoji: '👥', 
              color: 'from-purple-500 to-cyan-500' 
            },
            { 
              title: 'Zero Judgment', 
              desc: 'Be yourself. Night owl? Early bird? We match you accordingly', 
              emoji: '⚡', 
              color: 'from-cyan-500 to-blue-500' 
            },
            { 
              title: 'Smart Algorithm', 
              desc: 'Our compatibility score ensures you match with the right people', 
              emoji: '📈', 
              color: 'from-blue-500 to-indigo-500' 
            }
          ].map((feature, idx) => (
            <div key={idx} className="card-gradient p-6 rounded-2xl border-gradient">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 text-3xl`}>
                {feature.emoji}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-1 rounded-3xl">
          <div className="bg-slate-900 p-12 rounded-3xl text-center">
            <h2 className="text-5xl font-black text-white mb-4">Ready to Find Your Match?</h2>
            <p className="text-xl text-gray-300 mb-8">Join hundreds waiting to experience the future of roommate finding</p>
            <Link
              href="/auth/signup"
              className="inline-block px-12 py-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-pink-500/20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size={40} />
            <span className="text-xl font-bold text-gradient">CoVibe</span>
          </div>
          <p className="text-gray-400">CoVibe © 2026 - Vancouver, BC</p>
        </div>
      </footer>
    </div>
  )
}

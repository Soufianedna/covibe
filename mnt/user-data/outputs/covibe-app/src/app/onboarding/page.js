'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser, updateProfile } from '@/lib/supabase'
import Logo from '@/components/Logo'

const QUIZ_QUESTIONS = [
  // Step 1: Basic Info
  {
    id: 'basic',
    title: 'Let\'s start with the basics',
    fields: [
      { name: 'age', label: 'How old are you?', type: 'number', min: 18, max: 35, required: true },
      { 
        name: 'city', 
        label: 'Which city are you looking in?', 
        type: 'select', 
        options: ['Vancouver', 'Montreal'],
        required: true 
      },
      { name: 'phone', label: 'Phone number (optional)', type: 'tel', required: false },
    ]
  },
  
  // Step 2: Schedule
  {
    id: 'schedule',
    title: 'When do you feel most productive?',
    subtitle: 'This helps us match you with people who have similar rhythms',
    type: 'single-choice',
    field: 'schedule_type',
    options: [
      { value: 'early', emoji: '🌅', label: 'Early morning', sublabel: '6-10am - I rise with the sun' },
      { value: 'day', emoji: '☀️', label: 'Afternoon', sublabel: '12-6pm - Standard work hours' },
      { value: 'late', emoji: '🌆', label: 'Evening', sublabel: '6pm-12am - Night is my prime time' },
      { value: 'night', emoji: '🦉', label: 'Night owl', sublabel: '12am-6am - I thrive after midnight' },
    ]
  },
  
  // Step 3: Weekend Style
  {
    id: 'weekend',
    title: 'What\'s your ideal weekend?',
    type: 'single-choice',
    field: 'weekend_style',
    options: [
      { value: 'creative', emoji: '🎨', label: 'Working on creative projects', sublabel: 'Music, art, content creation' },
      { value: 'social', emoji: '🎉', label: 'Going out and socializing', sublabel: 'Friends, events, parties' },
      { value: 'chill', emoji: '🛋️', label: 'Relaxing at home', sublabel: 'Movies, reading, recharging' },
      { value: 'active', emoji: '🏔️', label: 'Outdoor activities', sublabel: 'Hiking, sports, adventures' },
    ]
  },
  
  // Step 4: Living Space Style
  {
    id: 'living',
    title: 'How would you describe your living space?',
    type: 'single-choice',
    field: 'living_space_style',
    options: [
      { value: 'creative', emoji: '🎬', label: 'Creative studio', sublabel: 'My workspace, my sanctuary' },
      { value: 'organized', emoji: '✨', label: 'Clean and minimalist', sublabel: 'Everything has its place' },
      { value: 'cozy', emoji: '🏡', label: 'Cozy and lived-in', sublabel: 'Comfortable and homey' },
      { value: 'social', emoji: '👥', label: 'Always has people over', sublabel: 'The gathering spot' },
    ]
  },
  
  // Step 5: Occupation
  {
    id: 'occupation',
    title: 'What do you do?',
    fields: [
      { 
        name: 'occupation', 
        label: 'Your occupation', 
        type: 'text', 
        placeholder: 'e.g., Musician, Software Engineer, Content Creator',
        required: true 
      },
      { 
        name: 'occupation_category', 
        label: 'Category', 
        type: 'select', 
        options: [
          { value: 'creative', label: '🎨 Creative (Artist, Musician, Designer)' },
          { value: 'tech', label: '💻 Tech (Engineer, Developer, Data)' },
          { value: 'business', label: '💼 Business (Marketing, Sales, Finance)' },
          { value: 'student', label: '📚 Student' },
          { value: 'other', label: '🌟 Other' },
        ],
        required: true 
      },
      { 
        name: 'work_from_home', 
        label: 'Do you work from home?', 
        type: 'checkbox',
        description: 'Important for matching schedules and space usage'
      },
    ]
  },
  
  // Step 6: Hobbies
  {
    id: 'hobbies',
    title: 'What are you into?',
    subtitle: 'Select all that apply',
    type: 'multi-choice',
    field: 'hobbies',
    options: [
      { value: 'music', emoji: '🎵', label: 'Music' },
      { value: 'coding', emoji: '💻', label: 'Coding' },
      { value: 'photography', emoji: '📸', label: 'Photography' },
      { value: 'gaming', emoji: '🎮', label: 'Gaming' },
      { value: 'fitness', emoji: '💪', label: 'Fitness' },
      { value: 'cooking', emoji: '👨‍🍳', label: 'Cooking' },
      { value: 'art', emoji: '🎨', label: 'Art' },
      { value: 'writing', emoji: '✍️', label: 'Writing' },
      { value: 'film', emoji: '🎬', label: 'Film/Video' },
      { value: 'travel', emoji: '✈️', label: 'Travel' },
    ]
  },
  
  // Step 7: Living Habits
  {
    id: 'habits',
    title: 'Living habits matter',
    fields: [
      { 
        name: 'cleanliness_level', 
        label: 'How clean do you keep your space? (1 = relaxed, 5 = spotless)', 
        type: 'range', 
        min: 1, 
        max: 5,
        required: true 
      },
      { 
        name: 'noise_tolerance', 
        label: 'Noise tolerance? (1 = need silence, 5 = bring it on)', 
        type: 'range', 
        min: 1, 
        max: 5,
        required: true 
      },
      { 
        name: 'social_frequency', 
        label: 'How often do you socialize at home?', 
        type: 'select', 
        options: [
          { value: 'daily', label: 'Daily - My place is the hub' },
          { value: 'weekly', label: 'Weekly - Regular hangouts' },
          { value: 'monthly', label: 'Monthly - Occasional gatherings' },
          { value: 'rarely', label: 'Rarely - I prefer quiet' },
        ],
        required: true 
      },
    ]
  },
  
  // Step 8: Dealbreakers
  {
    id: 'dealbreakers',
    title: 'Let\'s talk about dealbreakers',
    fields: [
      { name: 'has_pets', label: 'I have pets', type: 'checkbox' },
      { name: 'pets_ok', label: 'I\'m okay with roommates having pets', type: 'checkbox' },
      { name: 'smoker', label: 'I smoke', type: 'checkbox' },
      { name: 'smoking_ok', label: 'I\'m okay with roommates smoking', type: 'checkbox' },
    ]
  },
  
  // Step 9: Housing Preferences
  {
    id: 'housing',
    title: 'What are you looking for?',
    fields: [
      { 
        name: 'budget_min', 
        label: 'Minimum budget (CAD/month)', 
        type: 'number', 
        min: 0,
        placeholder: '800',
        required: true 
      },
      { 
        name: 'budget_max', 
        label: 'Maximum budget (CAD/month)', 
        type: 'number', 
        min: 0,
        placeholder: '1500',
        required: true 
      },
      { 
        name: 'move_in_date', 
        label: 'Preferred move-in date', 
        type: 'date',
        required: true 
      },
      { 
        name: 'room_type', 
        label: 'Room type', 
        type: 'select', 
        options: [
          { value: 'private', label: 'Private room' },
          { value: 'shared', label: 'Shared room (lower cost)' },
        ],
        required: true 
      },
    ]
  },
  
  // Step 10: Priorities
  {
    id: 'priorities',
    title: 'What matters most to you?',
    type: 'single-choice',
    field: 'priority',
    options: [
      { value: 'private', emoji: '🚪', label: 'Having personal space', sublabel: 'I value my privacy' },
      { value: 'social', emoji: '❤️', label: 'Building friendships', sublabel: 'Looking for community' },
      { value: 'budget', emoji: '💰', label: 'Keeping costs low', sublabel: 'Budget is priority #1' },
      { value: 'values', emoji: '🤝', label: 'Sharing same values', sublabel: 'Deep compatibility matters' },
    ]
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/signup')
        return
      }
      setUserId(user.id)
    } catch (error) {
      router.push('/auth/signup')
    }
  }

  const currentQuestion = QUIZ_QUESTIONS[currentStep]
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1

  const handleNext = async () => {
    if (isLastStep) {
      await handleSubmit()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Update profile with all onboarding data
      await updateProfile(userId, {
        ...formData,
        onboarding_completed: true,
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const isStepValid = () => {
    const question = currentQuestion
    
    if (question.type === 'single-choice') {
      return formData[question.field] !== undefined
    }
    
    if (question.type === 'multi-choice') {
      return formData[question.field]?.length > 0
    }
    
    if (question.fields) {
      return question.fields.every(field => {
        if (!field.required) return true
        return formData[field.name] !== undefined && formData[field.name] !== ''
      })
    }
    
    return true
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size={50} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gradient mb-2">CoVibe</h1>
          <p className="text-gray-400">Let's find your perfect match</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-1">
            {QUIZ_QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx <= currentStep
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Step {currentStep + 1} of {QUIZ_QUESTIONS.length}
          </p>
        </div>

        {/* Question Card */}
        <div className="card-gradient p-8 rounded-3xl border-gradient mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">{currentQuestion.title}</h2>
          {currentQuestion.subtitle && (
            <p className="text-gray-400 mb-8">{currentQuestion.subtitle}</p>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Single Choice Question */}
          {currentQuestion.type === 'single-choice' && (
            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFormData(currentQuestion.field, option.value)}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                    formData[currentQuestion.field] === option.value
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-gray-600 bg-slate-700/50 hover:border-pink-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{option.emoji}</span>
                    <div>
                      <p className="text-lg font-semibold text-white">{option.label}</p>
                      {option.sublabel && <p className="text-sm text-gray-400">{option.sublabel}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Multi Choice Question */}
          {currentQuestion.type === 'multi-choice' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentQuestion.options.map((option) => {
                const selected = formData[currentQuestion.field]?.includes(option.value) || false
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const current = formData[currentQuestion.field] || []
                      const updated = selected
                        ? current.filter(v => v !== option.value)
                        : [...current, option.value]
                      updateFormData(currentQuestion.field, updated)
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selected
                        ? 'border-pink-500 bg-pink-500/20'
                        : 'border-gray-600 bg-slate-700/50 hover:border-pink-500/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{option.emoji}</div>
                    <p className="text-sm font-semibold text-white">{option.label}</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Form Fields */}
          {currentQuestion.fields && (
            <div className="space-y-6">
              {currentQuestion.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                  </label>
                  
                  {field.type === 'text' || field.type === 'number' || field.type === 'tel' || field.type === 'date' ? (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => updateFormData(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      required={field.required}
                      className="w-full px-4 py-3 bg-white/10 border border-pink-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => updateFormData(field.name, e.target.value)}
                      required={field.required}
                      className="w-full px-4 py-3 bg-white/10 border border-pink-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Select...</option>
                      {(field.options || []).map((opt) => (
                        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                          {typeof opt === 'string' ? opt : opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[field.name] || false}
                        onChange={(e) => updateFormData(field.name, e.target.checked)}
                        className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-300">{field.description || field.label}</span>
                    </label>
                  ) : field.type === 'range' ? (
                    <div>
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        value={formData[field.name] || field.min}
                        onChange={(e) => updateFormData(field.name, parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>{field.min}</span>
                        <span className="text-pink-400 font-bold">{formData[field.name] || field.min}</span>
                        <span>{field.max}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-8 py-4 glass rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isLastStep ? 'Complete Setup →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

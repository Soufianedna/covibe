import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Camera } from 'lucide-react';

export const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user.user_metadata?.name || '',
    age: '',
    gender: '',
    city: '',
    bio: '',
    photo_url: '',
    // Quiz answers
    productive_time: '',
    weekend_style: '',
    creative_type: '',
    living_space_style: '',
    cleanliness: 3,
    priority: '',
    // Religion & Diet
    religious_practice: 'none',
    seeks_same_religion: false,
    // Substances
    alcohol_ok: true,
    cannabis_friendly: false,
    no_substances: false,
    // Safe Space
    lgbtq_friendly: true,
    safe_space_preferences: [],
    // Preferences
    smoking: false,
    pets: false,
    pets_ok: true,
    noise_tolerance: 5,
    guests_frequency: 3,
    budget_min: '',
    budget_max: '',
    move_in_date: '',
  });

  const questions = [
    {
      id: 'basics',
      title: 'Commençons par les bases',
      fields: [
        { name: 'name', label: 'Nom complet', type: 'text', required: true },
        { name: 'age', label: 'Âge', type: 'number', min: 18, max: 100, required: true },
        {
          name: 'gender',
          label: 'Genre',
          type: 'select',
          options: [
            { value: 'man', label: 'Homme' },
            { value: 'woman', label: 'Femme' },
            { value: 'non_binary', label: 'Non-binaire' },
            { value: 'prefer_not_to_say', label: 'Préfère ne pas répondre' },
          ],
          required: true,
        },
        {
          name: 'city',
          label: 'Ville',
          type: 'select',
          options: [
            { value: 'vancouver', label: 'Vancouver' },
            { value: 'montreal', label: 'Montréal' },
          ],
          required: true,
        },
      ],
    },
    {
      id: 'productive_time',
      title: 'Quand es-tu le plus productif·ve ?',
      type: 'choice',
      options: [
        { value: 'early', label: 'Tôt le matin (6-10h)', emoji: '🌅' },
        { value: 'day', label: "L'après-midi (12-18h)", emoji: '☀️' },
        { value: 'late', label: 'En soirée (18h-minuit)', emoji: '🌆' },
        { value: 'night', label: 'Noctambule (minuit-6h)', emoji: '🦉' },
      ],
    },
    {
      id: 'creative_type',
      title: 'Quel est ton domaine créatif ?',
      type: 'choice',
      options: [
        { value: 'musician', label: 'Musicien·ne', emoji: '🎵' },
        { value: 'artist', label: 'Artiste visuel·le', emoji: '🎨' },
        { value: 'content_creator', label: 'Créateur·rice de contenu', emoji: '🎬' },
        { value: 'photographer', label: 'Photographe', emoji: '📸' },
        { value: 'developer', label: 'Développeur·se', emoji: '💻' },
        { value: 'writer', label: 'Écrivain·e', emoji: '✍️' },
        { value: 'entrepreneur', label: 'Entrepreneur·e', emoji: '🚀' },
        { value: 'other', label: 'Autre', emoji: '✨' },
      ],
    },
    {
      id: 'weekend_style',
      title: 'Ton weekend idéal ?',
      type: 'choice',
      options: [
        { value: 'creative', label: 'Travailler sur des projets créatifs', emoji: '🎨' },
        { value: 'social', label: 'Sortir et socialiser', emoji: '🎉' },
        { value: 'chill', label: 'Relaxer à la maison', emoji: '🛋️' },
        { value: 'active', label: 'Activités extérieures', emoji: '🏔️' },
      ],
    },
    {
      id: 'living_space_style',
      title: 'Comment décrirais-tu ton espace de vie idéal ?',
      type: 'choice',
      options: [
        { value: 'creative', label: 'Studio créatif / Espace de travail', emoji: '🎬' },
        { value: 'organized', label: 'Propre et minimaliste', emoji: '✨' },
        { value: 'cozy', label: 'Cosy et accueillant', emoji: '🏡' },
        { value: 'social', label: 'Toujours du monde', emoji: '👥' },
      ],
    },
    {
      id: 'cleanliness',
      title: 'Niveau de propreté attendu (1=décontracté, 5=très propre)',
      type: 'slider',
      min: 1,
      max: 5,
      field: 'cleanliness',
    },
    {
      id: 'priority',
      title: "Qu'est-ce qui est le plus important pour toi ?",
      type: 'choice',
      options: [
        { value: 'private', label: 'Avoir mon espace personnel', emoji: '🚪' },
        { value: 'social', label: 'Créer des amitiés', emoji: '❤️' },
        { value: 'budget', label: 'Garder les coûts bas', emoji: '💰' },
        { value: 'values', label: 'Partager les mêmes valeurs', emoji: '🤝' },
      ],
    },
    {
      id: 'religious_practice',
      title: 'Pratiques religieuses ou alimentaires importantes ?',
      subtitle: 'Pour compatibilité, pas pour discrimination',
      type: 'choice',
      options: [
        { value: 'none', label: 'Aucune préférence particulière', emoji: '🤝' },
        { value: 'muslim', label: 'Pratiques musulmanes (halal, pas d\'alcool)', emoji: '🕌' },
        { value: 'christian', label: 'Pratiques chrétiennes', emoji: '⛪' },
        { value: 'jewish', label: 'Pratiques juives (kasher)', emoji: '🕍' },
        { value: 'vegetarian_vegan', label: 'Végétarien/Végan strict (cuisine séparée)', emoji: '🌱' },
        { value: 'spiritual', label: 'Spirituel/Autre', emoji: '🙏' },
        { value: 'secular', label: 'Préfère un espace laïc', emoji: '🚫' },
      ],
    },
    {
      id: 'religion_follow_up',
      title: 'Cherches-tu un·e coloc qui partage ces pratiques ?',
      type: 'fields',
      fields: [
        { name: 'seeks_same_religion', label: 'Je cherche un·e coloc qui respecte/partage ces pratiques', type: 'checkbox' },
      ],
      skip: () => profile.religious_practice === 'none',
    },
    {
      id: 'substances',
      title: 'Préférences concernant les substances',
      subtitle: 'Cannabis légal au Canada. Pas de jugement, juste compatibilité.',
      type: 'fields',
      fields: [
        { name: 'alcohol_ok', label: '🍷 Alcool OK dans l\'appart', type: 'checkbox' },
        { name: 'cannabis_friendly', label: '🌿 420 friendly (cannabis OK)', type: 'checkbox' },
        { name: 'no_substances', label: '✨ Sobre/Clean living (pas de substances)', type: 'checkbox' },
      ],
    },
    {
      id: 'safe_space',
      title: 'Quel environnement te permettrait d\'être toi-même ?',
      subtitle: 'Crée un espace où chacun·e se sent en sécurité et respecté·e',
      type: 'multi_choice',
      field: 'safe_space_preferences',
      options: [
        { value: 'lgbtq_friendly', label: 'LGBTQ+ friendly (important pour moi)', emoji: '🏳️‍🌈' },
        { value: 'trans_affirming', label: 'Trans-affirming space', emoji: '🏳️‍⚧️' },
        { value: 'women_only', label: 'Women-only space (sécurité)', emoji: '♀️' },
        { value: 'men_only', label: 'Men-only space', emoji: '♂️' },
        { value: 'multicultural', label: 'Multiculturel et inclusif', emoji: '🌍' },
        { value: 'open_to_all', label: 'Ouvert à tous', emoji: '🤝' },
      ],
    },
    {
      id: 'dealbreakers',
      title: 'Préférences importantes',
      type: 'fields',
      fields: [
        { name: 'smoking', label: 'Je fume (cigarettes)', type: 'checkbox' },
        { name: 'pets', label: "J'ai des animaux", type: 'checkbox' },
        { name: 'pets_ok', label: "J'accepte les animaux", type: 'checkbox' },
        {
          name: 'noise_tolerance',
          label: 'Tolérance au bruit (1=faible, 5=haute)',
          type: 'slider',
          min: 1,
          max: 5,
        },
        {
          name: 'guests_frequency',
          label: 'Fréquence invités (1=rare, 5=souvent)',
          type: 'slider',
          min: 1,
          max: 5,
        },
      ],
    },
    {
      id: 'budget',
      title: 'Budget mensuel (CAD)',
      type: 'fields',
      fields: [
        { name: 'budget_min', label: 'Minimum', type: 'number', min: 0, required: true },
        { name: 'budget_max', label: 'Maximum', type: 'number', min: 0, required: true },
        { name: 'move_in_date', label: "Date d'emménagement souhaitée", type: 'date' },
      ],
    },
    {
      id: 'bio',
      title: 'Parle-nous de toi !',
      type: 'fields',
      fields: [
        {
          name: 'bio',
          label: 'Bio (décris ton mode de vie, tes passions, ce que tu cherches)',
          type: 'textarea',
          placeholder: 'Ex: Musicien électro qui travaille la nuit, recherche coloc qui comprend les horaires créatifs...',
          required: true,
        },
      ],
    },
    {
      id: 'photo',
      title: 'Ajoute une photo de profil',
      subtitle: 'Pour la sécurité de tous, une photo est requise',
      type: 'photo',
    },
  ];

  // Filter out questions that should be skipped
  const currentQuestion = questions.filter((q, idx) => {
    if (idx !== step) return false;
    if (q.skip && q.skip()) return false;
    return true;
  })[0] || questions[step];

  const handleNext = async () => {
    // Check if current question should be skipped
    let nextStep = step + 1;
    while (nextStep < questions.length && questions[nextStep].skip && questions[nextStep].skip()) {
      nextStep++;
    }

    if (nextStep < questions.length) {
      setStep(nextStep);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    let prevStep = step - 1;
    while (prevStep >= 0 && questions[prevStep].skip && questions[prevStep].skip()) {
      prevStep--;
    }
    if (prevStep >= 0) setStep(prevStep);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          email: user.email,
          onboarding_complete: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      onComplete(data);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setProfile({ ...profile, photo_url: publicUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erreur upload photo. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSafeSpacePreference = (value) => {
    const current = profile.safe_space_preferences || [];
    if (current.includes(value)) {
      setProfile({
        ...profile,
        safe_space_preferences: current.filter(v => v !== value)
      });
    } else {
      setProfile({
        ...profile,
        safe_space_preferences: [...current, value]
      });
    }
  };

  const renderField = (field) => {
    if (field.type === 'select') {
      return (
        <select
          value={profile[field.name]}
          onChange={(e) => setProfile({ ...profile, [field.name]: e.target.value })}
          required={field.required}
          className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Sélectionne...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={profile[field.name]}
          onChange={(e) => setProfile({ ...profile, [field.name]: e.target.value })}
          required={field.required}
          placeholder={field.placeholder}
          rows={6}
          className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
        />
      );
    }

    if (field.type === 'checkbox') {
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={profile[field.name]}
            onChange={(e) => setProfile({ ...profile, [field.name]: e.target.checked })}
            className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
          />
          <span className="text-gray-300">{field.label}</span>
        </label>
      );
    }

    if (field.type === 'slider') {
      return (
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{field.min}</span>
            <span className="text-white font-bold">{profile[field.name]}</span>
            <span>{field.max}</span>
          </div>
          <input
            type="range"
            min={field.min}
            max={field.max}
            value={profile[field.name]}
            onChange={(e) => setProfile({ ...profile, [field.name]: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-pink"
          />
        </div>
      );
    }

    return (
      <input
        type={field.type}
        value={profile[field.name]}
        onChange={(e) => setProfile({ ...profile, [field.name]: e.target.value })}
        required={field.required}
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-1 mb-2">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx <= step
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Question {step + 1} / {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-pink-500/30 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {currentQuestion.title}
          </h2>
          {currentQuestion.subtitle && (
            <p className="text-gray-400 mb-6">{currentQuestion.subtitle}</p>
          )}

          {/* Choice type */}
          {currentQuestion.type === 'choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setProfile({ ...profile, [currentQuestion.id]: option.value });
                    setTimeout(handleNext, 300);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    profile[currentQuestion.id] === option.value
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-500'
                      : 'bg-slate-700/50 border-2 border-gray-600 hover:border-pink-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{option.emoji}</span>
                    <span className="text-lg text-white">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Multi-choice type */}
          {currentQuestion.type === 'multi_choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleSafeSpacePreference(option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    profile[currentQuestion.field]?.includes(option.value)
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-500'
                      : 'bg-slate-700/50 border-2 border-gray-600 hover:border-pink-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{option.emoji}</span>
                    <span className="text-lg text-white">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Slider type */}
          {currentQuestion.type === 'slider' && (
            <div className="py-6">
              {renderField({
                type: 'slider',
                name: currentQuestion.field,
                min: currentQuestion.min,
                max: currentQuestion.max,
              })}
            </div>
          )}

          {/* Photo type */}
          {currentQuestion.type === 'photo' && (
            <div className="text-center">
              {profile.photo_url ? (
                <div className="mb-6">
                  <img
                    src={profile.photo_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-pink-500"
                  />
                  <button
                    onClick={() => setProfile({ ...profile, photo_url: '' })}
                    className="mt-4 text-pink-400 hover:text-pink-300 text-sm"
                  >
                    Changer la photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-32 h-32 mx-auto bg-slate-700/50 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center hover:border-pink-500 transition-all">
                    <Camera size={40} className="text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-pink-400 mt-4 font-semibold">
                    Clique pour ajouter une photo
                  </p>
                </label>
              )}
            </div>
          )}

          {/* Fields type */}
          {currentQuestion.type === 'fields' && (
            <div className="space-y-6">
              {currentQuestion.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {field.label}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all"
              >
                ← Retour
              </button>
            )}
            {(currentQuestion.type !== 'choice' || currentQuestion.type === 'multi_choice') && (
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading
                  ? '...'
                  : step === questions.length - 1
                  ? 'Terminer 🎉'
                  : 'Suivant →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

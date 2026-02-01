import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

export const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    user_id: user.id,
    name: '',
    age: '',
    gender: '',
    city: '',
    creative_type: '',
    productive_time: '',
    seeking_roommate: false,
    seeking_studio: false,
    has_space: false,
    budget_min: '',
    budget_max: '',
    cleanliness: 3,
    noise_tolerance: 5,
    guests_frequency: 3,
    smoking: false,
    pets: false,
    pets_ok: false,
    alcohol_ok: false,
    cannabis_friendly: false,
    no_substances: false,
    religious_practice: '',
    safe_space_preferences: [],
    move_in_date: '',
    bio: '',
    photo_url: '',
  });
  const [uploading, setUploading] = useState(false);

  const questions = [
    {
      id: 'basics',
      title: 'Commençons par les bases',
      type: 'fields',
      fields: [
        { name: 'name', label: 'Nom complet', type: 'text', required: true },
        { name: 'age', label: 'Âge', type: 'number', required: true },
        {
          name: 'gender',
          label: 'Genre',
          type: 'select',
          required: true,
          options: [
            { value: 'man', label: 'Homme' },
            { value: 'woman', label: 'Femme' },
            { value: 'non_binary', label: 'Non-binaire' },
            { value: 'prefer_not_to_say', label: 'Préfère ne pas dire' },
          ],
        },
        {
          name: 'city',
          label: 'Ville',
          type: 'select',
          required: true,
          options: [
            { value: 'vancouver', label: 'Vancouver' },
            { value: 'montreal', label: 'Montréal' },
          ],
        },
      ],
    },
    {
      id: 'productive',
      title: 'Ton rythme de vie',
      subtitle: 'Quand es-tu le plus productif·ve ?',
      type: 'buttons',
      field: {
        name: 'productive_time',
        options: [
          { value: 'early', label: '🌅 Matinal (6h-10h)' },
          { value: 'day', label: '☀️ Après-midi (12h-18h)' },
          { value: 'late', label: '🌆 Soirée (18h-minuit)' },
          { value: 'night', label: '🌙 Noctambule (minuit-6h)' },
        ],
      },
    },
    {
      id: 'creative',
      title: 'Ton parcours créatif',
      subtitle: 'Aide-nous à comprendre ton univers',
      type: 'buttons',
      field: {
        name: 'creative_type',
        options: [
          { value: 'musician', label: '🎵 Musicien·ne' },
          { value: 'artist', label: '🎨 Artiste visuel·le' },
          { value: 'content_creator', label: '📹 Créateur·rice de contenu' },
          { value: 'photographer', label: '📸 Photographe' },
          { value: 'developer', label: '💻 Développeur·se' },
          { value: 'writer', label: '✍️ Écrivain·e' },
          { value: 'entrepreneur', label: '🚀 Entrepreneur·e' },
          { value: 'other', label: '✨ Autre' },
        ],
      },
    },
    {
      id: 'seeking',
      title: 'Que cherches-tu ?',
      subtitle: 'Coche toutes les options qui te correspondent',
      type: 'checkboxes',
      fields: [
        { name: 'seeking_roommate', label: '🏠 Je cherche un·e coloc' },
        { name: 'seeking_studio', label: '🎨 Je cherche un espace de création' },
        { name: 'has_space', label: '✨ J\'ai un espace à partager' },
      ],
    },
    {
      id: 'lifestyle',
      title: 'Ton style de vie',
      subtitle: 'Parle-nous de tes habitudes',
      type: 'combined',
    },
    {
      id: 'religion',
      title: 'Pratiques religieuses ou alimentaires',
      subtitle: 'Y a-t-il des pratiques importantes pour toi ?',
      type: 'buttons',
      field: {
        name: 'religious_practice',
        options: [
          { value: 'none', label: '🤷 Aucune préférence' },
          { value: 'muslim', label: '☪️ Halal' },
          { value: 'jewish', label: '✡️ Kasher' },
          { value: 'vegetarian_vegan', label: '🌱 Végétarien/Végan' },
          { value: 'spiritual', label: '🕉️ Spirituel' },
          { value: 'secular', label: '🔬 Laïc' },
        ],
      },
    },
    {
      id: 'safe_space',
      title: 'Espace sécuritaire',
      subtitle: 'Sélectionne les valeurs importantes pour toi',
      type: 'buttons',
      field: {
        name: 'safe_space_preferences',
        options: [
          { value: 'lgbtq_friendly', label: '🏳️‍🌈 LGBTQ+ friendly' },
          { value: 'trans_affirming', label: '🏳️‍⚧️ Trans-affirming' },
          { value: 'women_only', label: '♀️ Women-only' },
          { value: 'men_only', label: '♂️ Men-only' },
          { value: 'multicultural', label: '🌍 Multiculturel' },
          { value: 'open_to_all', label: '🤝 Ouvert à tous' },
        ],
        multi: true,
      },
    },
    {
      id: 'move_in',
      title: 'Date d\'emménagement',
      subtitle: 'Quand souhaites-tu emménager ?',
      type: 'fields',
      fields: [
        { name: 'move_in_date', label: "Date d'emménagement souhaitée", type: 'date' },
      ],
    },
    {
      id: 'bio',
      title: 'Parle-nous de toi',
      subtitle: 'Écris une courte bio pour te présenter',
      type: 'fields',
      fields: [
        {
          name: 'bio',
          label: 'Ta bio',
          type: 'textarea',
          placeholder: 'Parle de tes passions, tes projets, ce que tu recherches...',
          required: true,
        },
      ],
    },
    {
      id: 'photo',
      title: 'Ta photo de profil',
      subtitle: 'Ajoute une photo pour que les autres te reconnaissent',
      type: 'photo',
    },
  ];

  const currentQuestion = questions[step];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
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
      alert('Erreur lors du téléchargement de la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const missing = [];
    if (!profile.name) missing.push('Nom');
    if (!profile.age) missing.push('Âge');
    if (!profile.gender) missing.push('Genre');
    if (!profile.city) missing.push('Ville');
    if (!profile.creative_type) missing.push('Type créatif');
    if (!profile.productive_time) missing.push('Moment productif');
    if (!profile.budget_min) missing.push('Budget minimum');
    if (!profile.budget_max) missing.push('Budget maximum');
    if (!profile.bio) missing.push('Bio');
    if (!profile.photo_url) missing.push('Photo');

    if (missing.length > 0) {
      alert('⚠️ Champs manquants : ' + missing.join(', '));
      return;
    }

    try {
      const cleanProfile = {
        ...profile,
        age: profile.age ? parseInt(profile.age) : null,
        budget_min: profile.budget_min ? parseInt(profile.budget_min) : null,
        budget_max: profile.budget_max ? parseInt(profile.budget_max) : null,
        cleanliness: parseInt(profile.cleanliness) || 3,
        noise_tolerance: parseInt(profile.noise_tolerance) || 5,
        guests_frequency: parseInt(profile.guests_frequency) || 3,
        onboarding_complete: true,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(cleanProfile, { onConflict: 'user_id' });

      if (error) throw error;

      onComplete(cleanProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde du profil');
    }
  };

  const canSubmit = () => {
    return profile.name && profile.age && profile.gender && profile.city &&
      profile.creative_type && profile.productive_time &&
      profile.budget_min && profile.budget_max && profile.bio && profile.photo_url;
  };

  const isLastStep = () => step === questions.length - 1;

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
    
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <input
        type={field.type}
        value={profile[field.name]}
        min={field.type === 'date' ? today : undefined}
        onChange={(e) => setProfile({ ...profile, [field.name]: e.target.value })}
        required={field.required}
        placeholder={field.placeholder}
        className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="mb-8 flex gap-1">
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

        <div className="bg-slate-800/50 backdrop-blur-lg border border-pink-500/30 rounded-3xl p-8">
          <div className="mb-8 text-center">
            <Logo size={60} className="mx-auto mb-4" />
            <p className="text-gray-400 text-sm">
              Question {step + 1} / {questions.length}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{currentQuestion.title}</h2>
            {currentQuestion.subtitle && (
              <p className="text-gray-400">{currentQuestion.subtitle}</p>
            )}
          </div>

          {currentQuestion.type === 'fields' && (
            <div className="space-y-4">
              {currentQuestion.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-white mb-2 font-medium">{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'buttons' && (
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.field.options.map((opt) => {
                const isSelected = currentQuestion.field.multi
                  ? profile[currentQuestion.field.name]?.includes(opt.value)
                  : profile[currentQuestion.field.name] === opt.value;
                
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (currentQuestion.field.multi) {
                        const current = profile[currentQuestion.field.name] || [];
                        const updated = isSelected
                          ? current.filter(v => v !== opt.value)
                          : [...current, opt.value];
                        setProfile({ ...profile, [currentQuestion.field.name]: updated });
                      } else {
                        setProfile({ ...profile, [currentQuestion.field.name]: opt.value });
                      }
                    }}
                    className={`p-6 rounded-2xl text-lg font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'checkboxes' && (
            <div className="space-y-4">
              {currentQuestion.fields.map((field) => (
                <label key={field.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile[field.name]}
                    onChange={(e) =>
                      setProfile({ ...profile, [field.name]: e.target.checked })
                    }
                    className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-white text-lg">{field.label}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'combined' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Budget mensuel</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-medium">Minimum ($)</label>
                    <input
                      type="number"
                      value={profile.budget_min}
                      onChange={(e) => setProfile({ ...profile, budget_min: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-medium">Maximum ($)</label>
                    <input
                      type="number"
                      value={profile.budget_max}
                      onChange={(e) => setProfile({ ...profile, budget_max: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Tolérance au bruit</h3>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={profile.noise_tolerance}
                  onChange={(e) => setProfile({ ...profile, noise_tolerance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>Silence absolu</span>
                  <span>Modéré</span>
                  <span>Très tolérant</span>
                </div>
                <p className="text-center text-2xl font-bold text-pink-400 mt-2">{profile.noise_tolerance}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Fréquence des invités</h3>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={profile.guests_frequency}
                  onChange={(e) => setProfile({ ...profile, guests_frequency: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>Jamais</span>
                  <span>Occasionnellement</span>
                  <span>Souvent</span>
                </div>
                <p className="text-center text-2xl font-bold text-pink-400 mt-2">{profile.guests_frequency}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Fumeur·se ?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setProfile({ ...profile, smoking: false })}
                    className={`p-6 rounded-2xl text-lg font-bold transition-all ${
                      profile.smoking === false
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    ❌ Non
                  </button>
                  <button
                    onClick={() => setProfile({ ...profile, smoking: true })}
                    className={`p-6 rounded-2xl text-lg font-bold transition-all ${
                      profile.smoking === true
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    🚬 Oui
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Animaux de compagnie</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.pets}
                      onChange={(e) => setProfile({ ...profile, pets: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="text-white text-lg">🐾 J'ai des animaux</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.pets_ok}
                      onChange={(e) => setProfile({ ...profile, pets_ok: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="text-white text-lg">✅ J'accepte les animaux</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Préférences de consommation</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.alcohol_ok}
                      onChange={(e) => setProfile({ ...profile, alcohol_ok: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="text-white text-lg">🍷 Alcool OK</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.cannabis_friendly}
                      onChange={(e) => setProfile({ ...profile, cannabis_friendly: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="text-white text-lg">🌿 420 friendly</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.no_substances}
                      onChange={(e) => setProfile({ ...profile, no_substances: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="text-white text-lg">✨ Mode de vie sobre</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentQuestion.type === 'photo' && (
            <div className="text-center">
              {profile.photo_url ? (
                <div className="mb-4">
                  <img
                    src={profile.photo_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-pink-500"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-6xl mb-4">
                  👤
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold cursor-pointer hover:shadow-lg transition-all"
              >
                {uploading ? 'Téléchargement...' : profile.photo_url ? 'Changer la photo' : 'Ajouter une photo'}
              </label>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
              >
                ← Précédent
              </button>
            )}
            <button
              onClick={isLastStep() ? handleSubmit : handleNext}
              disabled={isLastStep() && !canSubmit()}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLastStep() ? '✨ Terminer' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

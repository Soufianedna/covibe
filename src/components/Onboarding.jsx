import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';
import { PropertyPhotosUploader } from './PropertyPhotosUploader';
import { getNeighborhoodCoordinates, neighborhoodGroups } from '../lib/neighborhoods';

export const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [propertyPhotos, setPropertyPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const appleOrGoogleName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const [profile, setProfile] = useState({
    user_id: user.id,
    name: appleOrGoogleName,
    age: '',
    gender: '',
    city: '',
    neighborhood: null,
    latitude: null,
    longitude: null,
    location_mode: 'on_site',
    creative_type: '',
    productive_time: '',
    work_location: 'hybrid',
    seeking_roommate: false,
    languages: [],
    seeking_studio: false,
    has_space: false,
    open_to_group_search: false,
    budget_min: '',
    budget_max: '',
    room_price: null,
    property_type: null,
    property_description: '',
    is_furnished: false,
    has_creative_space: false,
    creative_space_type: [],
    lease_duration: null,
    amenities: [],
    cleanliness: 3,
    noise_tolerance: 5,
    guests_frequency: 3,
    smoking: false,
    pets: false,
    pet_type: null,
    pets_ok: false,
    alcohol_ok: false,
    cannabis_friendly: false,
    no_substances: false,
    religious_practice: '',
    safe_space_preferences: [],
    move_in_date: '',
    bio: '',
    photo_url: '',
    relationship_status: null,
  });

  const questions = [
    { id: 'basics', title: 'Commençons par les bases', type: 'fields', motivation: '👋 Bienvenue ! Plus tu es précis·e, meilleurs seront tes matchs.' },
    { id: 'productive', title: 'Ton rythme de vie', subtitle: 'Quand es-tu le plus productif·ve ?', motivation: '⏰ Les colocs avec des rythmes similaires vivent mieux ensemble !', type: 'buttons',
      field: { name: 'productive_time', options: [
        { value: 'early', label: '🌅 Matinal (6h-10h)' },
        { value: 'day', label: '☀️ Après-midi (12h-18h)' },
        { value: 'late', label: '🌆 Soirée (18h-minuit)' },
        { value: 'night', label: '🌙 Noctambule (minuit-6h)' },
      ]}
    },
    { id: 'creative', title: 'Ton parcours créatif', subtitle: 'Aide-nous à comprendre ton univers', motivation: '🎨 Ta créativité est ce qui te rend unique — montre-la !', type: 'buttons',
      field: { name: 'creative_type', options: [
        { value: 'musician', label: '🎵 Musicien·ne' },
        { value: 'artist', label: '🎨 Artiste visuel·le' },
        { value: 'content_creator', label: '📹 Créateur·rice de contenu' },
        { value: 'photographer', label: '📸 Photographe' },
        { value: 'developer', label: '💻 Développeur·se' },
        { value: 'writer', label: '✍️ Écrivain·e' },
        { value: 'entrepreneur', label: '🚀 Entrepreneur·e' },
        { value: 'other', label: '✨ Autre' },
      ]}
    },
    { id: 'languages', title: 'Langues parlées', subtitle: 'Sélectionne toutes les langues que tu parles', motivation: '🌍 Partager une langue facilite la vie en colocation !', type: 'buttons',
      field: { name: 'languages', multi: true, options: [
        { value: 'french', label: 'Français' },
        { value: 'english', label: 'Anglais' },
        { value: 'spanish', label: 'Espagnol' },
        { value: 'arabic', label: 'Arabe' },
        { value: 'portuguese', label: 'Portugais' },
        { value: 'mandarin', label: 'Mandarin' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'farsi', label: 'Farsi' },
        { value: 'cantonese', label: 'Cantonais' },
        { value: 'other', label: 'Autre' },
      ]}
    },
    { id: 'seeking', title: 'Que cherches-tu ?', subtitle: 'Coche toutes les options qui te correspondent', motivation: '🏠 Cette info nous aide à te trouver les meilleurs profils !', type: 'seeking' },
    { id: 'location', title: 'Où cherches-tu une coloc ?', subtitle: 'Indique ta localisation', motivation: '📍 Ta localisation augmente ton score de compatibilité de 30% !', type: 'location' },
    { id: 'lifestyle', title: 'Ton style de vie', subtitle: 'Parle-nous de tes habitudes', motivation: '✨ Les habitudes du quotidien font toute la différence en coloc !', type: 'combined' },
    { id: 'religion', title: 'Pratiques religieuses ou alimentaires', subtitle: 'Y a-t-il des pratiques importantes pour toi ?', motivation: '🙏 Respecter les pratiques de chacun crée une vraie harmonie !', type: 'buttons',
      field: { name: 'religious_practice', options: [
        { value: 'none', label: '🤷 Aucune préférence' },
        { value: 'muslim', label: '☪️ Halal' },
        { value: 'jewish', label: '✡️ Kasher' },
        { value: 'vegetarian_vegan', label: '🌱 Végétarien/Végan' },
        { value: 'spiritual', label: '🕉️ Spirituel' },
        { value: 'secular', label: '🔬 Laïc' },
      ]}
    },
    { id: 'safe_space', title: 'Espace sécuritaire', subtitle: 'Sélectionne les valeurs importantes pour toi', motivation: '💜 CoVibe croit en un espace respectueux pour tout le monde !', type: 'buttons',
      field: { name: 'safe_space_preferences', multi: true, options: [
        { value: 'lgbtq_friendly', label: '🏳️‍🌈 LGBTQ+ friendly' },
        { value: 'trans_affirming', label: '🏳️‍⚧️ Trans-affirming' },
        { value: 'women_only', label: '♀️ Women-only' },
        { value: 'men_only', label: '♂️ Men-only' },
        { value: 'multicultural', label: '🌍 Multiculturel' },
        { value: 'open_to_all', label: '🤝 Ouvert à tous' },
      ]}
    },
    { id: 'move_in', title: "Date d'emménagement", subtitle: 'Quand souhaites-tu emménager ?', motivation: '📅 On ne te montrera que des profils disponibles au bon moment !', type: 'fields',
      fields: [{ name: 'move_in_date', label: "Date d'emménagement souhaitée", type: 'date' }]
    },
    { id: 'bio', title: 'Parle-nous de toi', subtitle: 'Écris une courte bio pour te présenter', motivation: '✍️ Les profils avec une bio reçoivent 3x plus de likes !', type: 'fields',
      fields: [{ name: 'bio', label: 'Ta bio', type: 'textarea', placeholder: 'Parle de tes passions, tes projets, ce que tu recherches...', required: true }]
    },
    { id: 'photo', title: 'Ta photo de profil', subtitle: 'Ajoute une photo pour que les autres te reconnaissent', motivation: '📸 Les profils avec photo reçoivent 10x plus de likes !', type: 'photo' },
  ];

  const currentQuestion = questions[step];
  const handleNext = () => { if (step < questions.length - 1) setStep(step + 1); };
  const handleBack = () => { if (step > 0) setStep(step - 1); };
  const isLastStep = () => step === questions.length - 1;

  const handleSeekingChange = (field) => {
    const newProfile = { ...profile };
    if (field === 'has_space') {
      if (!newProfile.has_space) { newProfile.has_space = true; newProfile.seeking_studio = false; }
      else { newProfile.has_space = false; }
    } else if (field === 'seeking_roommate') {
      newProfile.seeking_roommate = !newProfile.seeking_roommate;
    } else if (field === 'seeking_studio') {
      if (!newProfile.seeking_studio && newProfile.has_space) return;
      newProfile.seeking_studio = !newProfile.seeking_studio;
    }
    setProfile(newProfile);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('profile-photos').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
      setProfile({ ...profile, photo_url: publicUrl });
    } catch (error) {
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
    if (!profile.has_space && (!profile.budget_min || !profile.budget_max)) missing.push('Budget');
    if (!profile.bio) missing.push('Bio');
    if (!profile.photo_url) missing.push('Photo');
    if (!acceptedTerms) missing.push("Conditions d'utilisation");
    // Validation souple - on continue même si des champs manquent
    try {
      const cleanProfile = {
        ...profile,
        age: profile.age ? parseInt(profile.age) : null,
        budget_min: profile.budget_min ? parseInt(profile.budget_min) : null,
        budget_max: profile.budget_max ? parseInt(profile.budget_max) : null,
        cleanliness: parseInt(profile.cleanliness) || 3,
        noise_tolerance: parseInt(profile.noise_tolerance) || 5,
        guests_frequency: parseInt(profile.guests_frequency) || 3,
        religious_practice: profile.religious_practice || 'none',
        productive_time: profile.productive_time || 'flexible',
        creative_type: profile.creative_type || 'other',
        gender: profile.gender || 'prefer_not_to_say',
        city: profile.city || 'vancouver',
        onboarding_complete: true,
      };
      // Refresh session avant upsert
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expirée, reconnecte-toi');
      await supabase.auth.refreshSession();
      
      const { error } = await supabase.from('profiles').upsert(cleanProfile, { onConflict: 'user_id' });
      if (error) throw error;
      onComplete(cleanProfile);
    } catch (error) {
      console.error('SAVE ERROR:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const canSubmit = () => true;

  const inputClass = "w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500";
  const checkboxClass = "w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500";

  const renderField = (field) => {
    if (field.type === 'textarea') return (
      <textarea value={profile[field.name]} onChange={(e) => setProfile({ ...profile, [field.name]: e.target.value })}
        required={field.required} placeholder={field.placeholder} rows={6}
        className={`${inputClass} resize-none placeholder-gray-400`} />
    );
    const today = new Date().toISOString().split('T')[0];
    return (
      <input type={field.type} value={profile[field.name]} min={field.type === 'date' ? today : undefined}
        onChange={(e) => setProfile({ ...profile, [field.name]: e.target.value })}
        required={field.required} placeholder={field.placeholder}
        className={`${inputClass} placeholder-gray-400`} />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="mb-8 flex gap-1">
          {questions.map((_, idx) => (
            <div key={idx} className={`h-2 flex-1 rounded-full transition-all ${idx <= step ? 'bg-gradient-to-r from-violet-600 to-indigo-500' : 'bg-gray-700'}`} />
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-violet-500/30 rounded-3xl p-8">
          <div className="mb-8 text-center">
            <Logo size={60} className="mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Question {step + 1} / {questions.length}</p>
          </div>
          <div className="mb-8">
            {currentQuestion.motivation && <div className="mb-3 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl"><p className="text-violet-300 text-sm font-medium">{currentQuestion.motivation}</p></div>}
            <h2 className="text-3xl font-bold text-white mb-2">{currentQuestion.title}</h2>
            {currentQuestion.subtitle && <p className="text-gray-400">{currentQuestion.subtitle}</p>}
          </div>

          {/* BASICS */}
          {currentQuestion.id === 'basics' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-medium">Nom complet</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-white mb-2 font-medium">Âge</label>
                <input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-white mb-2 font-medium">Genre</label>
                <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className={inputClass}>
                  <option value="">Sélectionne...</option>
                  <option value="man">Homme</option>
                  <option value="woman">Femme</option>
                  <option value="non_binary">Non-binaire</option>
                  <option value="prefer_not_to_say">Préfère ne pas dire</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2 font-medium">Ville</label>
                <select value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className={inputClass}>
                  <option value="">Sélectionne...</option>
                  <option value="vancouver">Vancouver</option>
                  <option value="montreal">Montréal</option>
                  <option value="toronto">Toronto</option>
                </select>
              </div>
            </div>
          )}

          {/* FIELDS (move_in, bio) */}
          {currentQuestion.type === 'fields' && currentQuestion.id !== 'basics' && (
            <div className="space-y-4">
              {currentQuestion.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-white mb-2 font-medium">{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {/* BUTTONS */}
          {currentQuestion.type === 'buttons' && (
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.field.options.map((opt) => {
                const isSelected = currentQuestion.field.multi
                  ? profile[currentQuestion.field.name]?.includes(opt.value)
                  : profile[currentQuestion.field.name] === opt.value;
                return (
                  <button key={opt.value} onClick={() => {
                    if (currentQuestion.field.multi) {
                      const current = profile[currentQuestion.field.name] || [];
                      const updated = isSelected ? current.filter(v => v !== opt.value) : [...current, opt.value];
                      setProfile({ ...profile, [currentQuestion.field.name]: updated });
                    } else {
                      setProfile({ ...profile, [currentQuestion.field.name]: opt.value });
                    }
                  }} className={`p-6 rounded-2xl text-lg font-bold transition-all break-words overflow-wrap-anywhere text-center leading-snug ${isSelected ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white scale-105' : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* SEEKING */}
          {currentQuestion.type === 'seeking' && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input type="checkbox" checked={profile.seeking_roommate} onChange={() => handleSeekingChange('seeking_roommate')} className={checkboxClass} />
                <span className="text-gray-300">🏠 Je cherche un·e coloc</span>
              </label>
              <label className={`flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl transition-all ${profile.has_space ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700'}`}>
                <input type="checkbox" checked={profile.seeking_studio} onChange={() => handleSeekingChange('seeking_studio')} disabled={profile.has_space} className={checkboxClass} />
                <span className="text-gray-300">🎨 Je cherche un espace de création</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input type="checkbox" checked={profile.has_space} onChange={() => handleSeekingChange('has_space')} className={checkboxClass} />
                <span className="text-gray-300">✨ J'ai un espace à partager</span>
              </label>
              {!profile.has_space && (
                <label className="flex items-start gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                  <input type="checkbox" checked={profile.open_to_group_search} onChange={(e) => setProfile({ ...profile, open_to_group_search: e.target.checked })} className={`${checkboxClass} mt-1`} />
                  <div>
                    <span className="text-gray-300">🤝 Ouvert à chercher ensemble</span>
                    <p className="text-xs text-gray-500 mt-1">Cette personne est ouverte à chercher un logement avec d'autres</p>
                  </div>
                </label>
              )}

              {profile.has_space && (
                <div className="mt-6 border-t border-violet-500/30 pt-6">
                  <h3 className="text-xl font-bold text-white mb-4">🏠 Mon espace</h3>
                  <PropertyPhotosUploader userId={user.id} existingPhotos={propertyPhotos} onPhotosChange={setPropertyPhotos} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Prix de la chambre ($/mois)</label>
                      <input type="number" value={profile.room_price || ''} onChange={(e) => setProfile({ ...profile, room_price: parseInt(e.target.value) || null })} className={inputClass} placeholder="800" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Type de logement</label>
                      <select value={profile.property_type || ''} onChange={(e) => setProfile({ ...profile, property_type: e.target.value })} className={inputClass}>
                        <option value="">---</option>
                        <option value="apartment">Appartement</option>
                        <option value="house">Maison</option>
                        <option value="loft">Loft</option>
                        <option value="studio">Studio</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Durée du bail</label>
                    <select value={profile.lease_duration || ''} onChange={(e) => setProfile({ ...profile, lease_duration: e.target.value })} className={inputClass}>
                      <option value="">---</option>
                      <option value="monthly">Mois par mois</option>
                      <option value="3months">3 mois</option>
                      <option value="6months">6 mois</option>
                      <option value="1year">1 an</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Description de l'espace</label>
                    <textarea value={profile.property_description} onChange={(e) => setProfile({ ...profile, property_description: e.target.value })}
                      className={`${inputClass} resize-none`} rows="3" placeholder="Décris ton espace..." />
                  </div>
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={profile.is_furnished} onChange={(e) => setProfile({ ...profile, is_furnished: e.target.checked })} className={checkboxClass} />
                      <span className="text-gray-300">✅ Meublé</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={profile.has_creative_space} onChange={(e) => setProfile({ ...profile, has_creative_space: e.target.checked })} className={checkboxClass} />
                      <span className="text-gray-300">🎨 Inclut un espace créatif partagé</span>
                    </label>
                    {profile.has_creative_space && (
                      <div className="mt-3 ml-8">
                        <p className="text-sm font-semibold text-gray-300 mb-2">Type d'espace :</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'youtube_studio', label: '🎬 Studio YouTube' },
                            { value: 'photo_studio', label: '📸 Espace photo' },
                            { value: 'music_studio', label: '🎵 Studio musique' },
                            { value: 'yoga_gym', label: '🧘 Yoga / Gym' },
                            { value: 'nail_makeup', label: '💅 Nail / Makeup' },
                            { value: 'art_studio', label: '🎨 Atelier art' },
                          ].map(({ value, label }) => (
                            <label key={value} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox"
                                checked={(profile.creative_space_type || []).includes(value)}
                                onChange={(e) => {
                                  const current = profile.creative_space_type || [];
                                  setProfile({ ...profile, creative_space_type: e.target.checked ? [...current, value] : current.filter(t => t !== value) });
                                }}
                                className="w-4 h-4 rounded bg-slate-700 border-gray-600 text-violet-500"
                              />
                              <span className="text-gray-300 text-sm">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Équipements</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[['wifi','WiFi'],['laundry','Lessive'],['parking','Parking'],['balcony','Balcon'],['dishwasher','Lave-vaisselle'],['airConditioning','Climatisation'],['heating','Chauffage']].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={(profile.amenities || []).includes(key)} onChange={(e) => {
                            const current = profile.amenities || [];
                            setProfile({ ...profile, amenities: e.target.checked ? [...current, key] : current.filter(a => a !== key) });
                          }} className="w-4 h-4 rounded bg-slate-700 border-gray-600 text-violet-500" />
                          <span className="text-gray-300 text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOCATION */}
          {currentQuestion.type === 'location' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                  <input type="radio" name="location_mode" value="on_site" checked={profile.location_mode === 'on_site'}
                    onChange={() => setProfile({ ...profile, location_mode: 'on_site' })} className="w-5 h-5" />
                  <span className="text-gray-300">🏠 Je suis déjà sur place</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                  <input type="radio" name="location_mode" value="remote" checked={profile.location_mode === 'remote'}
                    onChange={() => setProfile({ ...profile, location_mode: 'remote' })} className="w-5 h-5" />
                  <span className="text-gray-300">✈️ Je cherche à distance (j'arrive bientôt)</span>
                </label>
              </div>

              {profile.location_mode === 'on_site' && (
                <button type="button" onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        let cityName = '';
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                          const data = await res.json();
                          const rawCity = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
                          if (rawCity.toLowerCase().includes('vancouver')) cityName = 'vancouver';
                          else if (rawCity.toLowerCase().includes('montreal') || rawCity.toLowerCase().includes('montréal')) cityName = 'montreal';
                          else cityName = rawCity.toLowerCase();
                        } catch(e) {}
                        setProfile({ ...profile, latitude: lat, longitude: lng, city: cityName });
                      },
                      () => alert("Impossible d'obtenir ta position. Vérifie tes permissions.")
                    );
                  }
                }} className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  📍 Utiliser ma position actuelle
                </button>
              )}

              {profile.location_mode === 'remote' && (
                <div className="space-y-4">
                  <select value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value, neighborhood: '' })}
                    className="w-full px-4 py-3 bg-slate-700 border border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-violet-500">
                    <option value="">Dans quelle ville ?</option>
                    <option value="vancouver">Vancouver</option>
                    <option value="montreal">Montréal</option>
                    <option value="toronto">Toronto</option>
                  </select>
                  {profile.city && (
                    <select value={profile.neighborhood || ''} onChange={(e) => {
                      const nId = e.target.value;
                      let coords = null;
                      if (nId.startsWith('all__')) {
                        const gName = nId.replace('all__', '');
                        const grp = (neighborhoodGroups[profile.city] || []).find(g => g.group === gName);
                        if (grp && grp.neighborhoods.length > 0) {
                          const lats = grp.neighborhoods.map(n => n.lat);
                          const lngs = grp.neighborhoods.map(n => n.lng);
                          coords = { lat: lats.reduce((a,b)=>a+b,0)/lats.length, lng: lngs.reduce((a,b)=>a+b,0)/lngs.length };
                        }
                      } else {
                        coords = getNeighborhoodCoordinates(profile.city, nId);
                      }
                      setProfile({ ...profile, neighborhood: nId, latitude: coords?.lat || null, longitude: coords?.lng || null });
                    }} className="w-full px-4 py-3 bg-slate-700 border border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-violet-500">
                      <option value="">Dans quel quartier ?</option>
                      {(neighborhoodGroups[profile.city] || []).map(group => (
                        <optgroup key={group.group} label={group.group}>
                          <option value={`all__${group.group}`}>✦ Tout {group.group}</option>
                          {group.neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {profile.latitude && profile.longitude && (
                <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-semibold">✅ Position enregistrée !</p>
                  <p className="text-sm text-gray-400 mt-1">📍 {profile.city || 'Localisation détectée'}</p>
                </div>
              )}
            </div>
          )}

          {/* LIFESTYLE */}
          {currentQuestion.type === 'combined' && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Lieu de travail</label>
                <select value={profile.work_location} onChange={(e) => setProfile({ ...profile, work_location: e.target.value })} className={inputClass}>
                  <option value="remote">🏠 Télétravail</option>
                  <option value="office">🏢 Bureau</option>
                  <option value="hybrid">🔄 Hybride</option>
                  <option value="freelance">💼 Freelance</option>
                  <option value="student">📚 Étudiant·e</option>
                  <option value="other">🎨 Autre</option>
                </select>
              </div>

              {!profile.has_space && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Budget mensuel</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 font-medium">Minimum ($)</label>
                      <input type="number" value={profile.budget_min} onChange={(e) => setProfile({ ...profile, budget_min: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">Maximum ($)</label>
                      <input type="number" value={profile.budget_max} onChange={(e) => setProfile({ ...profile, budget_max: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Préférences de vie</h3>
                <div className="space-y-3">
                  {[['smoking','🚬 Je fume'],['alcohol_ok','🍷 Alcool OK'],['cannabis_friendly','🌿 420 friendly'],['no_substances','✨ Mode de vie sobre']].map(([field, label]) => (
                    <label key={field} className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                      <input type="checkbox" checked={profile[field]} onChange={(e) => setProfile({ ...profile, [field]: e.target.checked })} className={checkboxClass} />
                      <span className="text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Animaux de compagnie</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                    <input type="checkbox" checked={profile.pets_ok} onChange={(e) => setProfile({ ...profile, pets_ok: e.target.checked })} className={checkboxClass} />
                    <span className="text-gray-300">✅ J'accepte les animaux</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                    <input type="checkbox" checked={profile.pets} onChange={(e) => setProfile({ ...profile, pets: e.target.checked, pet_type: e.target.checked ? profile.pet_type : null })} className={checkboxClass} />
                    <span className="text-gray-300">🐾 J'ai des animaux</span>
                  </label>
                  {profile.pets && (
                    <div className="ml-8">
                      <select value={profile.pet_type || ''} onChange={(e) => setProfile({ ...profile, pet_type: e.target.value })} className={inputClass}>
                        <option value="">Quel type ?</option>
                        <option value="dog">🐶 J'ai un chien</option>
                        <option value="cat">🐱 J'ai un chat</option>
                        <option value="other">🐾 Autre</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Statut relationnel</label>
                <select value={profile.relationship_status || ''} onChange={(e) => setProfile({ ...profile, relationship_status: e.target.value })} className={inputClass}>
                  <option value="">---</option>
                  <option value="single">Célibataire</option>
                  <option value="couple">En couple</option>
                  <option value="married">Marié·e</option>
                </select>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Tolérance au bruit</h3>
                <input type="range" min="1" max="10" value={profile.noise_tolerance} onChange={(e) => setProfile({ ...profile, noise_tolerance: parseInt(e.target.value) })} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between mt-2 text-sm text-gray-400"><span>Silence absolu</span><span>Modéré</span><span>Très tolérant</span></div>
                <p className="text-center text-2xl font-bold text-violet-400 mt-2">{profile.noise_tolerance}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Fréquence des invités</h3>
                <input type="range" min="1" max="5" value={profile.guests_frequency} onChange={(e) => setProfile({ ...profile, guests_frequency: parseInt(e.target.value) })} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between mt-2 text-sm text-gray-400"><span>Jamais</span><span>Occasionnellement</span><span>Souvent</span></div>
                <p className="text-center text-2xl font-bold text-violet-400 mt-2">{profile.guests_frequency}</p>
              </div>
            </div>
          )}

          {/* PHOTO */}
          {currentQuestion.type === 'photo' && (
            <div className="text-center">
              {profile.photo_url ? (
                <div className="mb-4">
                  <img src={profile.photo_url} alt="Profile" className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-violet-500" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-6xl mb-4">👤</div>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold cursor-pointer hover:shadow-lg transition-all">
                {uploading ? 'Téléchargement...' : profile.photo_url ? 'Changer la photo' : 'Ajouter une photo'}
              </label>
              <div className="mt-6 text-left">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className={`${checkboxClass} mt-1`} />
                  <span className="text-gray-300 text-sm">
                    J'accepte les <a href="/terms" target="_blank" className="text-violet-400 hover:underline">Conditions d'utilisation</a> et la <a href="/privacy" target="_blank" className="text-violet-400 hover:underline">Politique de confidentialité</a>
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {step > 0 && (
              <button onClick={handleBack} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all">
                ← Précédent
              </button>
            )}
            <button onClick={isLastStep() ? handleSubmit : handleNext} disabled={isLastStep() && !canSubmit()}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {isLastStep() ? '✨ Terminer' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

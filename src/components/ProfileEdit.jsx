import { PhotoUploader } from './PhotoUploader';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, X } from 'lucide-react';

export const ProfileEdit = ({ userProfile, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [profile, setProfile] = useState({
    name: userProfile.name || '',
    age: userProfile.age || '',
    gender: userProfile.gender || '',
    city: userProfile.city || '',
    creative_type: userProfile.creative_type || '',
    productive_time: userProfile.productive_time || '',
    seeking_roommate: userProfile.seeking_roommate || false,
    seeking_studio: userProfile.seeking_studio || false,
    has_space: userProfile.has_space || false,
    bio: userProfile.bio || '',
    budget_min: userProfile.budget_min || '',
    budget_max: userProfile.budget_max || '',
    photo_url: userProfile.photo_url || '',
    smoking: userProfile.smoking || false,
    pets: userProfile.pets || false,
    pets_ok: userProfile.pets_ok || true,
    alcohol_ok: userProfile.alcohol_ok || true,
    cannabis_friendly: userProfile.cannabis_friendly || false,
    no_substances: userProfile.no_substances || false,
    noise_tolerance: userProfile.noise_tolerance || 5,
    guests_frequency: userProfile.guests_frequency || 3,
    cleanliness: userProfile.cleanliness || 3,
    religious_practice: userProfile.religious_practice || 'none',
    safe_space_preferences: userProfile.safe_space_preferences || [],
    move_in_date: userProfile.move_in_date || '',
  });

  useEffect(() => {
    loadPhotos();
  }, [userProfile]);

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('user_id', userProfile.user_id)
      .order('position');
    
    console.log("🔍 LOADED PHOTOS:", data);
    setExistingPhotos(data || []);
  };

  const handleSeekingChange = (field) => {
    const newProfile = { ...profile };
    
    if (field === 'has_space') {
      if (!newProfile.has_space) {
        newProfile.has_space = true;
        newProfile.seeking_studio = false;
      } else {
        newProfile.has_space = false;
      }
    } else if (field === 'seeking_roommate') {
      newProfile.seeking_roommate = !newProfile.seeking_roommate;
    } else if (field === 'seeking_studio') {
      if (!newProfile.seeking_studio && newProfile.has_space) {
        alert('⚠️ Tu ne peux pas chercher un studio si tu as déjà un espace à partager !');
        return;
      }
      newProfile.seeking_studio = !newProfile.seeking_studio;
    }
    
    setProfile(newProfile);
  };

  const handleSave = async () => {
    if (!profile.name || !profile.age || !profile.bio || !profile.budget_min || !profile.budget_max) {
      alert('⚠️ Les champs obligatoires sont : nom, âge, bio, budget');
      return;
    }

    setLoading(true);
    try {
      const cleanProfile = {
        ...profile,
        age: parseInt(profile.age),
        budget_min: parseInt(profile.budget_min),
        budget_max: parseInt(profile.budget_max),
        noise_tolerance: parseInt(profile.noise_tolerance),
        guests_frequency: parseInt(profile.guests_frequency),
        cleanliness: parseInt(profile.cleanliness),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(cleanProfile)
        .eq('user_id', userProfile.user_id)
        .select()
        .single();

      if (error) throw error;

      alert('✅ Profil mis à jour !');
      onSave(data);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-slate-800 border border-pink-500/30 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-pink-500/30 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Modifier mon profil</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
            <X size={24} className="text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* PHOTOS MULTIPLES */}
          <PhotoUploader
            userId={userProfile.user_id}
            existingPhotos={existingPhotos}
            onPhotosChange={setExistingPhotos}
          />

          {/* INFOS DE BASE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Nom complet</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Âge</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Genre</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="man">Homme</option>
                <option value="woman">Femme</option>
                <option value="non_binary">Non-binaire</option>
                <option value="prefer_not_to_say">Préfère ne pas dire</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Ville</label>
              <select
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="vancouver">Vancouver</option>
                <option value="montreal">Montréal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Type créatif</label>
            <select
              value={profile.creative_type}
              onChange={(e) => setProfile({ ...profile, creative_type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="musician">🎵 Musicien·ne</option>
              <option value="artist">🎨 Artiste visuel·le</option>
              <option value="content_creator">📹 Créateur·rice de contenu</option>
              <option value="photographer">📸 Photographe</option>
              <option value="developer">💻 Développeur·se</option>
              <option value="writer">✍️ Écrivain·e</option>
              <option value="entrepreneur">🚀 Entrepreneur·e</option>
              <option value="other">✨ Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Rythme de vie</label>
            <select
              value={profile.productive_time}
              onChange={(e) => setProfile({ ...profile, productive_time: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="early">🌅 Matinal (6h-10h)</option>
              <option value="day">☀️ Après-midi (12h-18h)</option>
              <option value="late">🌆 Soirée (18h-minuit)</option>
              <option value="night">🌙 Noctambule (minuit-6h)</option>
            </select>
          </div>

          {/* QUE CHERCHES-TU */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Que cherches-tu ?</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.seeking_roommate}
                  onChange={() => handleSeekingChange('seeking_roommate')}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">🏠 Je cherche un·e coloc</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.seeking_studio}
                  onChange={() => handleSeekingChange('seeking_studio')}
                  disabled={profile.has_space}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                />
                <span className="text-gray-300">🎨 Je cherche un espace de création</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.has_space}
                  onChange={() => handleSeekingChange('has_space')}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">✨ J'ai un espace à partager</span>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">💡 Tu ne peux pas chercher un studio ET avoir un espace en même temps</p>
          </div>

          {/* BIO */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={5}
              placeholder="Décris ton mode de vie, tes passions, ce que tu cherches..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          {/* BUDGET */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Budget mensuel (CAD)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Minimum</label>
                <input
                  type="number"
                  value={profile.budget_min}
                  onChange={(e) => setProfile({ ...profile, budget_min: e.target.value })}
                  min={0}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Maximum</label>
                <input
                  type="number"
                  value={profile.budget_max}
                  onChange={(e) => setProfile({ ...profile, budget_max: e.target.value })}
                  min={0}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* PREFERENCES */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Préférences de vie</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.smoking}
                  onChange={(e) => setProfile({ ...profile, smoking: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">🚬 Je fume</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.pets}
                  onChange={(e) => setProfile({ ...profile, pets: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">🐾 J'ai des animaux</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.pets_ok}
                  onChange={(e) => setProfile({ ...profile, pets_ok: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">✅ J'accepte les animaux</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.alcohol_ok}
                  onChange={(e) => setProfile({ ...profile, alcohol_ok: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">🍷 Alcool OK</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.cannabis_friendly}
                  onChange={(e) => setProfile({ ...profile, cannabis_friendly: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">🌿 420 friendly</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.no_substances}
                  onChange={(e) => setProfile({ ...profile, no_substances: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300">✨ Mode de vie sobre</span>
              </label>
            </div>
          </div>

          {/* SLIDERS */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Propreté (1=désordonné, 5=très propre)
            </label>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>1</span>
              <span className="text-white font-bold">{profile.cleanliness}</span>
              <span>5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={profile.cleanliness}
              onChange={(e) => setProfile({ ...profile, cleanliness: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Tolérance au bruit (1=silence, 10=très tolérant)
            </label>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>1</span>
              <span className="text-white font-bold">{profile.noise_tolerance}</span>
              <span>10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={profile.noise_tolerance}
              onChange={(e) => setProfile({ ...profile, noise_tolerance: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Fréquence invités (1=jamais, 5=très souvent)
            </label>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>1</span>
              <span className="text-white font-bold">{profile.guests_frequency}</span>
              <span>5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={profile.guests_frequency}
              onChange={(e) => setProfile({ ...profile, guests_frequency: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* DATE EMMENAGEMENT */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Date d'emménagement souhaitée</label>
            <input
              type="date"
              value={profile.move_in_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setProfile({ ...profile, move_in_date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* BOUTONS */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-slate-800 pb-4 border-t border-pink-500/30 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : 'Enregistrer 💾'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

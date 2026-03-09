import { X } from 'lucide-react';
import { getCompatibilityLevel } from '../lib/matching';

export const ProfileView = ({ profile, currentUser, onClose, onOpenChat, onUnmatch }) => {
  // Calculer la compatibilité (score fixe 70% pour l'instant)
  const compatibility = 70;
  const { level, color, emoji } = getCompatibilityLevel(compatibility);

  const getGenderLabel = (gender) => {
    const labels = { man: 'Homme', woman: 'Femme', non_binary: 'Non-binaire', prefer_not_to_say: 'Non précisé' };
    return labels[gender] || gender;
  };

  const getCityLabel = (city) => city === 'vancouver' ? 'Vancouver' : 'Montréal';

  const getCreativeTypeLabel = (type) => {
    const labels = { 
      musician: 'Musicien·ne', 
      artist: 'Artiste visuel·le', 
      content_creator: 'Créateur·rice de contenu', 
      photographer: 'Photographe', 
      developer: 'Développeur·se', 
      writer: 'Écrivain·e', 
      entrepreneur: 'Entrepreneur·e', 
      other: 'Autre' 
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-[110]">
      <div className="bg-slate-800 border border-violet-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-violet-500/30 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Profil Détaillé</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
            <X size={24} className="text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo + Infos principales */}
          <div className="text-center">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-violet-500 mb-4" />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-6xl mb-4">👤</div>
            )}
            <h2 className="text-3xl font-bold text-white mb-2">{profile.name}</h2>
            <p className="text-gray-300 text-lg mb-4">
              {profile.age} ans • {getGenderLabel(profile.gender)} • {getCityLabel(profile.city)}
            </p>
            <p className="text-violet-400 font-bold text-xl">{getCreativeTypeLabel(profile.creative_type)}</p>
          </div>

          {/* Compatibilité */}
          <div className="bg-slate-700/50 rounded-2xl p-6 text-center">
            <p className="text-gray-300 mb-2">Compatibilité</p>
            <p className={`text-5xl font-bold ${color} mb-2`}>{compatibility}%</p>
            <p className={`text-xl ${color}`}>{emoji} {level}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Bio</h3>
              <p className="text-gray-300 bg-slate-700/50 rounded-xl p-4">{profile.bio}</p>
            </div>
          )}

          {/* Que cherche */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Recherche</h3>
            <div className="flex flex-wrap gap-2">
              {profile.seeking_roommate && (
                <span className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/30">
                  🏠 Cherche coloc
                </span>
              )}
              {profile.seeking_studio && (
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  🎨 Cherche studio
                </span>
              )}
              {profile.has_space && (
                <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                  ✨ A un espace
                </span>
              )}
            </div>
          </div>

          {/* Budget */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">💰 Budget</h3>
            <p className="text-gray-300 text-lg">{profile.budget_min}$ - {profile.budget_max}$ CAD/mois</p>
          </div>

          {/* Préférences */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Préférences</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-xl p-3">
                <p className="text-gray-400 text-sm">Tabac</p>
                <p className="text-white font-semibold">{profile.smoking ? '🚬 Oui' : '🚭 Non'}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <p className="text-gray-400 text-sm">Animaux</p>
                <p className="text-white font-semibold">{profile.pets ? '🐾 Oui' : profile.pets_ok ? '✅ OK' : '❌ Non'}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <p className="text-gray-400 text-sm">Propreté</p>
                <p className="text-white font-semibold">{profile.cleanliness}/5</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <p className="text-gray-400 text-sm">Tolérance bruit</p>
                <p className="text-white font-semibold">{profile.noise_tolerance}/10</p>
              </div>
            </div>
          </div>

          {/* Bouton chat */}
          <button
            onClick={() => {
              onClose();
              onOpenChat(profile);
            }}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
          >
            💬 Envoyer un message
          </button>
          {onUnmatch && (
            <button
              onClick={() => onUnmatch(profile.user_id)}
              className="w-full py-3 mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              ❌ Unmatch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

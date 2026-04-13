import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCompatibilityLevel, calculateCompatibility } from '../lib/matching';

export const ProfileView = ({ profile, currentUser, onClose, onOpenChat, onUnmatch, extraActions, fullPage = false }) => {
  const { t } = useTranslation();
  const compatibility = currentUser ? calculateCompatibility(currentUser, profile) : 0;
  const { levelKey, color, emoji } = getCompatibilityLevel(compatibility);

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
      other: 'Autre',
      language_exchange: '🗣️ Coloc linguistique'
    };
    return labels[type] || type;
  };

  return (
    <div className={fullPage ? "w-full" : "fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-[110]"}>
      <div className={fullPage ? "w-full" : "bg-slate-800 border border-violet-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"}>
        {!fullPage && <div className="sticky top-0 bg-slate-800 border-b border-violet-500/30 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Profil Détaillé</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
            <X size={24} className="text-gray-300" />
          </button>
        </div>}

        <div className="p-6 space-y-6">
          {/* Photo + Infos principales */}
          {!fullPage && <div className="text-center">
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
          </div>}

          {/* Compatibilité */}
          <div className="bg-slate-700/50 rounded-2xl p-6 text-center">
            <p className="text-gray-300 mb-2">Compatibilité</p>
            <p className={`text-5xl font-bold ${color} mb-2`}>{compatibility}%</p>
            <p className={`text-xl font-semibold ${color}`}>{emoji} {t(levelKey)}</p>
          </div>


          <div className="space-y-3 mt-4 border-t border-slate-600 pt-4">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">POURQUOI CE SCORE ?</p>
            {[
              { label: '💰 Budget', value: currentUser && profile ? (() => { const b1min = currentUser.budget_min||0; const b1max = currentUser.budget_max||9999; const b2min = profile.budget_min||0; const b2max = profile.budget_max||9999; const overlap = Math.min(b1max,b2max)-Math.max(b1min,b2min); return overlap>0 ? Math.round((overlap/(Math.max(b1max,b2max)-Math.min(b1min,b2min)))*30) : 0; })() : 0, max: 30 },
              { label: '🌅 Rythme de vie', value: currentUser?.productive_time === profile?.productive_time ? 20 : 5, max: 20 },
              { label: '🏠 Habitudes', value: (() => { let s=0; if(currentUser?.smoking === profile?.smoking) s+=8; if(currentUser?.pets === profile?.pets || currentUser?.pets_ok || profile?.pets_ok) s+=8; if(Math.abs((currentUser?.cleanliness||3)-(profile?.cleanliness||3))<=1) s+=9; return s; })(), max: 25 },
              { label: '🙏 Pratiques', value: currentUser?.religious_practice === profile?.religious_practice ? 15 : 5, max: 15 },
              { label: '✨ Style de vie', value: (() => { let s=0; if(Math.abs((currentUser?.noise_tolerance||5)-(profile?.noise_tolerance||5))<=2) s+=5; if(Math.abs((currentUser?.guests_frequency||2)-(profile?.guests_frequency||2))<=1) s+=5; return s; })(), max: 10 },
            ].map(({ label, value, max }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{label}</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-400 h-2 rounded-full transition-all" style={{width: `${(value/max)*100}%`}}></div>
                </div>
              </div>
            ))}
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
                <span className="px-3 py-2 bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/30 text-sm text-center">
                  🏠 Cherche coloc
                </span>
              )}
              {profile.seeking_studio && (
                <span className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30 text-sm text-center">
                  🎨 Ouvert à un espace de création partagé
                </span>
              )}
              {profile.has_space && (
                <span className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 text-sm text-center">
                  ✨ A un espace
                </span>
              )}
            </div>
          </div>

          {/* Espace disponible */}
          {profile.has_space && (
            <div className="border border-violet-500/30 rounded-2xl p-4 bg-slate-700/30">
              <h3 className="text-xl font-bold text-white mb-3">🏠 Espace disponible</h3>
              {profile.room_price && (
                <div className="bg-violet-600/20 rounded-xl p-3 mb-3 text-center">
                  <p className="text-2xl font-bold text-white">{profile.room_price}$ /mois</p>
                  {profile.utilities_included && <p className="text-green-400 text-sm">✅ Charges comprises</p>}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {profile.property_type && (
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-gray-400 text-sm">Type</p>
                    <p className="text-white font-semibold">{profile.property_type}</p>
                  </div>
                )}
                {profile.lease_duration && (
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-gray-400 text-sm">Durée</p>
                    <p className="text-white font-semibold">{profile.lease_duration}</p>
                  </div>
                )}
                {profile.is_furnished !== undefined && (
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-gray-400 text-sm">Meublé</p>
                    <p className="text-white font-semibold">{profile.is_furnished ? '✅ Oui' : '❌ Non'}</p>
                  </div>
                )}
                {profile.has_existing_roommates !== undefined && (
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-gray-400 text-sm">Colocataires présents</p>
                    <p className="text-white font-semibold">{profile.has_existing_roommates ? '✅ Oui' : '❌ Non'}</p>
                  </div>
                )}
              </div>
              {profile.amenities && profile.amenities.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Équipements</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.amenities.map(a => (
                      <span key={a} className="px-3 py-1 bg-slate-600/50 text-gray-300 rounded-lg text-sm">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.property_description && (
                <div className="mt-3">
                  <p className="text-gray-400 text-sm mb-1">Description</p>
                  <p className="text-gray-300 text-sm">{profile.property_description}</p>
                </div>
              )}
            </div>
          )}
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
          {onOpenChat && <button
            onClick={() => {
              onClose();
              onOpenChat(profile);
            }}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
          >
            💬 Envoyer un message
          </button>}
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

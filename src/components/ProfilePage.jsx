import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Settings, LogOut, FileText, Shield, Edit3 } from 'lucide-react';
import { ProfileScore } from './ProfileScore';
import { useTranslation } from 'react-i18next';

export const ProfilePage = ({ currentUser, onEdit, onLogout }) => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);

  const getCityLabel = (city) => city === 'vancouver' ? 'Vancouver' : 'Montréal';
  const getGenderLabel = (g) => ({ man: 'Homme', woman: 'Femme', non_binary: 'Non-binaire', prefer_not_to_say: 'Non précisé' }[g] || g);
  const getCreativeTypeLabel = (type) => ({ musician: 'Musicien·ne', artist: 'Artiste visuel·le', developer: 'Développeur·se', content_creator: 'Créateur·rice de contenu', entrepreneur: 'Entrepreneur·e', designer: 'Designer', writer: 'Écrivain·e', photographer: 'Photographe', other: 'Autre créatif·ve' }[type] || type);
  const getProductiveTimeLabel = (t) => ({ early: '🌅 Lève-tôt', late: '🌙 Couche-tard', flexible: '🔄 Flexible' }[t] || t);
  const getReligionLabel = (r) => ({ none: 'Aucune', christian: 'Chrétien·ne', muslim: 'Musulman·e', jewish: 'Juif·ve', buddhist: 'Bouddhiste', hindu: 'Hindou·e', spiritual: 'Spirituel·le', other: 'Autre' }[r] || r);

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-40 bg-slate-900 overflow-y-auto pb-24">
        <div className="p-6 pt-16">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
            <h2 className="text-2xl font-bold text-white">⚙️ Paramètres</h2>
          </div>

          <div className="space-y-3">
            <button onClick={() => window.open("https://www.covibe.ca/terms", "_blank")} className="w-full flex items-center gap-4 p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all">
              <FileText size={22} className="text-violet-400" />
              <span className="text-white font-semibold">Conditions d'utilisation</span>
            </button>
            <button onClick={() => window.open("https://www.covibe.ca/privacy", "_blank")} className="w-full flex items-center gap-4 p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all">
              <Shield size={22} className="text-violet-400" />
              <span className="text-white font-semibold">Politique de confidentialité</span>
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl hover:bg-red-500/20 transition-all">
              <LogOut size={22} className="text-red-400" />
              <span className="text-red-400 font-semibold">Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900 overflow-y-auto pb-24">
      <div className="p-6 pt-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Mon Profil</h2>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
            <Settings size={24} className="text-gray-300" />
          </button>
        </div>

        {/* Photo + infos */}
        <div className="text-center mb-6">
          {currentUser.photo_url ? (
            <LazyLoadImage effect="blur" src={currentUser.photo_url} alt={currentUser.name} className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-violet-500 mb-4" />
          ) : (
            <div className="w-28 h-28 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-5xl mb-4">👤</div>
          )}
          <h3 className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            {currentUser.name}
            {currentUser.verified && <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-500 rounded-full text-white text-xs font-bold">✓</span>}
          </h3>
          <p className="text-gray-400 mb-1">{currentUser.age} ans • {getGenderLabel(currentUser.gender)} • {getCityLabel(currentUser.city)}</p>
          <p className="text-violet-400 font-semibold">{getCreativeTypeLabel(currentUser.creative_type)}</p>
        </div>

        {/* Score */}
        <div className="mb-6">
          <ProfileScore profile={currentUser} />
        </div>

        {/* Bouton modifier */}
        <button onClick={onEdit} className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 mb-6 hover:shadow-lg transition-all">
          <Edit3 size={20} /> Modifier mon profil
        </button>

        {/* Bio */}
        {currentUser.bio && (
          <div className="mb-4 bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">Bio</p>
            <p className="text-white">{currentUser.bio}</p>
          </div>
        )}

        {/* Préférences */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">🌅 Rythme</p>
            <p className="text-white font-semibold text-sm">{getProductiveTimeLabel(currentUser.productive_time)}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">🧹 Propreté</p>
            <p className="text-white font-semibold text-sm">{currentUser.cleanliness}/5</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">💰 Budget</p>
            <p className="text-white font-semibold text-sm">{currentUser.has_space ? `${currentUser.room_price}$/mois` : `${currentUser.budget_min}$ - ${currentUser.budget_max}$`}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">🙏 Pratiques</p>
            <p className="text-white font-semibold text-sm">{getReligionLabel(currentUser.religious_practice)}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">🚬 Tabac</p>
            <p className="text-white font-semibold text-sm">{currentUser.smoking ? 'Oui' : 'Non'}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">🐾 Animaux</p>
            <p className="text-white font-semibold text-sm">{currentUser.pets ? 'Oui' : 'Non'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

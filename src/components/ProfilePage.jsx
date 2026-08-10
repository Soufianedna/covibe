import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Settings, LogOut, FileText, Shield, Edit3 } from 'lucide-react';
import { ProfileScore } from './ProfileScore';
import { ProfileEdit } from './ProfileEdit';
import { useTranslation } from 'react-i18next';

export const ProfilePage = ({ currentUser, onSave, onLogout, onDeleteAccount, searchPartnerships = [] }) => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(currentUser?.is_paused || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState('view');
  const [partnerProfile, setPartnerProfile] = useState(null);

  const myPartnership = searchPartnerships.find(p =>
    p.status === 'accepted' && (p.requester_id === currentUser?.user_id || p.partner_id === currentUser?.user_id)
  );
  const partnerId = myPartnership
    ? (myPartnership.requester_id === currentUser.user_id ? myPartnership.partner_id : myPartnership.requester_id)
    : null;

  useEffect(() => {
    if (!partnerId) {
      setPartnerProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('user_id, name, photo_url')
      .eq('user_id', partnerId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading partner profile:', error);
          setPartnerProfile(null);
          return;
        }
        setPartnerProfile(data || null);
      });
  }, [partnerId]);

  const togglePause = async () => {
    const newVal = !isPaused;
    setIsPaused(newVal);
    await supabase.from('profiles').update({ is_paused: newVal }).eq('user_id', currentUser.user_id);
  };

  const getCityLabel = (city) => city === 'vancouver' ? 'Vancouver' : 'Montréal';
  const getGenderLabel = (g) => ({ man: 'Homme', woman: 'Femme', non_binary: 'Non-binaire', prefer_not_to_say: 'Non précisé' }[g] || g);
  const getCreativeTypeLabel = (type) => ({ musician: 'Musicien·ne', artist: 'Artiste visuel·le', developer: 'Développeur·se', content_creator: 'Créateur·rice de contenu', entrepreneur: 'Entrepreneur·e', designer: 'Designer', writer: 'Écrivain·e', photographer: 'Photographe', other: 'Autre créatif·ve' }[type] || type);
  const getProductiveTimeLabel = (t) => ({ early: '🌅 Lève-tôt', late: '🌙 Couche-tard', flexible: '🔄 Flexible' }[t] || t);
  const getReligionLabel = (r) => ({ none: 'Aucune', christian: 'Chrétien·ne', muslim: 'Musulman·e', jewish: 'Juif·ve', buddhist: 'Bouddhiste', hindu: 'Hindou·e', spiritual: 'Spirituel·le', other: 'Autre' }[r] || r);
  const getWorkLocationLabel = (w) => ({ remote: '🏠 Télétravail', office: '🏢 Bureau', hybrid: '🔄 Hybride', freelance: '💼 Freelance', student: '📚 Étudiant·e', other: '🎨 Autre' }[w] || w);
  const getRelationshipLabel = (r) => ({ single: 'Célibataire', couple: 'En couple', married: 'Marié·e' }[r] || r);
  const getLanguageLabel = (l) => ({ french: 'Français', english: 'Anglais', spanish: 'Espagnol', arabic: 'Arabe', portuguese: 'Portugais', mandarin: 'Mandarin', hindi: 'Hindi', farsi: 'Farsi', cantonese: 'Cantonais', other: 'Autre' }[l] || l);

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
            {/* Mode Fantôme */}
            <button onClick={togglePause} className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{isPaused ? '👻' : '🌙'}</span>
                <div className="text-left">
                  <p className="text-white font-semibold">Mode Fantôme</p>
                  <p className="text-gray-400 text-xs">{isPaused ? 'Ton profil est masqué' : 'Masque ton profil temporairement'}</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all ${isPaused ? 'bg-violet-600' : 'bg-slate-600'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${isPaused ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>

            <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl hover:bg-red-500/20 transition-all">
              <LogOut size={22} className="text-red-400" />
              <span className="text-red-400 font-semibold">Se déconnecter</span>
            </button>

            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl hover:bg-red-500/20 transition-all">
              <span className="text-red-400 text-xl">🗑️</span>
              <span className="text-red-400 font-semibold">Supprimer mon compte</span>
            </button>

            {showDeleteConfirm && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <p className="text-white font-bold mb-2">⚠️ Es-tu sûr·e ?</p>
                <p className="text-gray-400 text-sm mb-4">Cette action est irréversible. Toutes tes données seront supprimées.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold">Annuler</button>
                  <button onClick={onDeleteAccount} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">Supprimer</button>
                </div>
              </div>
            )}
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
          <h2 className="text-2xl font-bold text-white">{activeSection === 'view' ? 'Mon Profil' : 'Modifier'}</h2>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
            <Settings size={24} className="text-gray-300" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-2xl">
          <button onClick={() => setActiveSection('view')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeSection === 'view' ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white' : 'text-gray-400'}`}>
            Mon Profil
          </button>
          <button onClick={() => setActiveSection('edit')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeSection === 'edit' ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white' : 'text-gray-400'}`}>
            Modifier
          </button>
        </div>

        {activeSection === 'edit' ? (
          <ProfileEdit
            userProfile={currentUser}
            onSave={(updated) => { onSave && onSave(updated); setActiveSection('view'); }}
            onCancel={() => setActiveSection('view')}
          />
        ) : (
        <>
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

        {/* Binôme de recherche */}
        {partnerProfile && (
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-300">
            <span>🤝 cherche une coloc avec</span>
            <div className="flex items-center gap-2">
              {partnerProfile.photo_url ? (
                <img src={partnerProfile.photo_url} alt={partnerProfile.name} className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm border-2 border-cyan-400">👤</div>
              )}
              <span className="text-cyan-400 font-semibold">{partnerProfile.name?.split(' ')[0]}</span>
            </div>
          </div>
        )}

        {/* Score */}
        <div className="mb-6">
          <ProfileScore profile={currentUser} />
        </div>


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
          {currentUser.work_location && (
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1">💼 Travail</p>
              <p className="text-white font-semibold text-sm">{getWorkLocationLabel(currentUser.work_location)}</p>
            </div>
          )}
          {currentUser.relationship_status && (
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1">💜 Statut</p>
              <p className="text-white font-semibold text-sm">{getRelationshipLabel(currentUser.relationship_status)}</p>
            </div>
          )}
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">🔊 Bruit</p>
            <p className="text-white font-semibold text-sm">{currentUser.noise_tolerance}/10</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-1">🎉 Invités</p>
            <p className="text-white font-semibold text-sm">{currentUser.guests_frequency}/5</p>
          </div>
          {currentUser.move_in_date && (
            <div className="bg-slate-800 rounded-2xl p-4 col-span-2">
              <p className="text-gray-400 text-xs mb-1">📅 Emménagement</p>
              <p className="text-white font-semibold text-sm">{new Date(currentUser.move_in_date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          )}
        </div>

        {/* Langues */}
        {currentUser.languages && currentUser.languages.length > 0 && (
          <div className="mt-4 bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-2">🌍 Langues</p>
            <div className="flex flex-wrap gap-2">
              {currentUser.languages.map((lang) => (
                <span key={lang} className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm font-semibold">{getLanguageLabel(lang)}</span>
              ))}
            </div>
          </div>
        )}

        {/* Style de vie */}
        {(currentUser.alcohol_ok || currentUser.cannabis_friendly || currentUser.no_substances) && (
          <div className="mt-4 bg-slate-800 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-2">✨ Style de vie</p>
            <div className="flex flex-wrap gap-2">
              {currentUser.alcohol_ok && <span className="px-3 py-1 bg-slate-700 text-gray-200 rounded-full text-sm font-semibold">🍷 Alcool OK</span>}
              {currentUser.cannabis_friendly && <span className="px-3 py-1 bg-slate-700 text-gray-200 rounded-full text-sm font-semibold">🌿 420 friendly</span>}
              {currentUser.no_substances && <span className="px-3 py-1 bg-slate-700 text-gray-200 rounded-full text-sm font-semibold">✨ Mode de vie sobre</span>}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

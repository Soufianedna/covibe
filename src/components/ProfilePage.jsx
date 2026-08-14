import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, LogOut, FileText, Shield, Edit3 } from 'lucide-react';
import { ProfileScore } from './ProfileScore';
import { ProfileEdit } from './ProfileEdit';
import { ProfileDetailView } from './ProfileDetailView';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const ProfilePage = ({ currentUser, onSave, onLogout, onDeleteAccount, searchPartnerships = [] }) => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(currentUser?.is_paused || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState('view');
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [propertyPhotos, setPropertyPhotos] = useState([]);
  const [loadingPropertyPhotos, setLoadingPropertyPhotos] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

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

  useEffect(() => {
    if (!currentUser?.has_space) {
      setPropertyPhotos([]);
      setLoadingPropertyPhotos(false);
      return;
    }
    setLoadingPropertyPhotos(true);
    supabase
      .from('property_photos')
      .select('*')
      .eq('user_id', currentUser.user_id)
      .order('position')
      .then(({ data, error }) => {
        if (error) console.error('Error loading property photos:', error);
        setPropertyPhotos(data || []);
        setLoadingPropertyPhotos(false);
      });
  }, [currentUser?.user_id, currentUser?.has_space, activeSection]);

  const togglePause = async () => {
    const newVal = !isPaused;
    setIsPaused(newVal);
    await supabase.from('profiles').update({ is_paused: newVal }).eq('user_id', currentUser.user_id);
  };


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

            {/* Langue */}
            <LanguageSwitcher variant="settings" />

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
        {/* Alerte espace sans photo */}
        {currentUser?.has_space && !loadingPropertyPhotos && propertyPhotos.length === 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-400 font-semibold">Ton espace n'est pas mis en valeur</p>
              <p className="text-amber-200/70 text-sm mt-1">Ajoute au moins une photo de ton logement pour qu'il inspire confiance dans Discover.</p>
              <button onClick={() => setActiveSection('edit')} className="mt-3 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-all underline">
                Ajouter une photo →
              </button>
            </div>
          </div>
        )}

        {/* Score */}
        <div className="mb-6">
          <ProfileScore profile={currentUser} />
        </div>

        <ProfileDetailView
          profile={currentUser}
          isPreview={true}
          hideCompatibility={true}
          currentUserProfile={currentUser}
          searchPartnerships={searchPartnerships}
          partnerProfile={partnerProfile}
          propertyPhotos={propertyPhotos}
          onPropertyPhotoClick={(url) => setLightboxPhoto(url)}
        />
        </>
        )}
      </div>

      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer">
          <img src={lightboxPhoto} alt="Photo" className="max-w-full max-h-screen object-contain rounded-2xl" />
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-4 right-4 text-white text-3xl font-bold">✕</button>
        </div>
      )}
    </div>
  );
};

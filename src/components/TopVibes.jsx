import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateCompatibility, getCompatibilityLevel } from '../lib/matching';
import { Heart, X } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { usePropertyPhotos } from '../lib/usePropertyPhotos';
import { getCityLabel } from '../lib/cityLabel';

export const TopVibes = ({ currentUserProfile, onLike, onPass }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    loadTopVibes();
  }, []);

  useEffect(() => {
    setPhotoIndex(0);
  }, [currentIndex]);

  const loadTopVibes = async () => {
    try {
      const { data: swiped } = await supabase
        .from('swipes')
        .select('swiped_user_id')
        .eq('user_id', currentUserProfile.user_id);

      const swipedIds = (swiped || []).map(s => s.swiped_user_id);

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*, profile_photos(photo_url, position)')
        .eq('city', currentUserProfile.city)
        .eq('onboarding_complete', true)
        .neq('user_id', currentUserProfile.user_id);

      const withPhotos = (allProfiles || []).map((p) => {
        const photos = (p.profile_photos || []).sort((a,b) => a.position - b.position);
        const compatibility = calculateCompatibility(currentUserProfile, p);
        return { ...p, photos, compatibility };
      });

      const topVibes = withPhotos
        .filter(p => p.compatibility >= 90 && !swipedIds.includes(p.user_id))
        .sort((a, b) => b.compatibility - a.compatibility);

      setProfiles(topVibes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const current = profiles[currentIndex];
  const photos = current ? (current.photos?.length > 0 ? current.photos.map(p => p.photo_url) : [current.photo_url]) : [];
  const { color, emoji } = current ? getCompatibilityLevel(current.compatibility) : {};
  const currentPropertyPhotos = usePropertyPhotos(current?.user_id, current?.has_space);

  if (loading) return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex items-center justify-center pb-24">
      <div className="space-y-4 w-full px-4">
        <div className="w-full h-64 bg-slate-800 rounded-3xl animate-pulse"></div>
        <div className="h-8 bg-slate-800 rounded-xl animate-pulse w-2/3"></div>
        <div className="h-4 bg-slate-800 rounded-xl animate-pulse w-1/2"></div>
      </div>
    </div>
  );

  if (profiles.length === 0) return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col items-center justify-center pb-24 px-6 text-center">
      <div className="text-6xl mb-4">⚡️</div>
      <h3 className="text-2xl font-bold text-white mb-2">Aucun Top Vibe pour l'instant</h3>
      <p className="text-gray-400">Continue à swiper pour trouver des profils à 90%+ !</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-safe-screen pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">⚡️ Top Vibes</h2>
          <p className="text-gray-400 text-sm">{profiles.length} profil{profiles.length > 1 ? 's' : ''} à 90%+</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="p-2 bg-slate-700 rounded-full disabled:opacity-30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-gray-400 text-sm">{currentIndex + 1}/{profiles.length}</span>
          <button onClick={() => setCurrentIndex(Math.min(profiles.length - 1, currentIndex + 1))} disabled={currentIndex === profiles.length - 1} className="p-2 bg-slate-700 rounded-full disabled:opacity-30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Zone scrollable */}
      <div className="flex-1 overflow-y-auto pb-40">
        {/* Photo */}
        <div className="relative mx-4 rounded-3xl overflow-hidden" style={{height: '55vh'}}
          onTouchStart={(e) => { window._touchStartX = e.touches[0].clientX; }}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - window._touchStartX; if (dx > 50) setPhotoIndex(Math.max(0, photoIndex-1)); else if (dx < -50) setPhotoIndex(Math.min(photos.length-1, photoIndex+1)); }}>
          {photos[photoIndex] ? (
            <img src={photos[photoIndex]} alt={current.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-6xl">👤</div>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setPhotoIndex(i)} className={`w-2 h-2 rounded-full ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
          <div className="absolute top-4 right-4 bg-violet-600 rounded-full px-3 py-1">
            <span className="text-white text-sm font-bold">{current.compatibility}% {emoji}</span>
          </div>
        </div>

        {/* Infos */}
        <div className="px-6 pt-4">
          <h2 className="text-3xl font-bold text-white">{current.name}, {current.age}</h2>
          <p className="text-gray-400 mt-1">{getCityLabel(current.city)}</p>
          {current.bio && <p className="text-gray-300 mt-3">{current.bio}</p>}

          <ProfileDetailView
            profile={current}
            isPreview={true}
            hideCompatibility={false}
            hideHeroPhoto={true}
            currentUserProfile={currentUserProfile}
            propertyPhotos={currentPropertyPhotos}
            onPropertyPhotoClick={(url) => setLightboxPhoto(url)}
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="fixed left-0 right-0 px-6 py-4 bg-slate-900 border-t border-slate-700 flex gap-4 z-10" style={{bottom: '120px'}}>
        <button onClick={() => { const next = profiles.filter((_, i) => i !== currentIndex); setProfiles(next); setCurrentIndex(Math.min(currentIndex, next.length - 1)); }} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
          <X size={22} /> Passer
        </button>
        <button onClick={() => { onLike && onLike(current); const next = profiles.filter((_, i) => i !== currentIndex); setProfiles(next); setCurrentIndex(Math.min(currentIndex, next.length - 1)); }} className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
          <Heart size={22} /> Liker
        </button>
      </div>

      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)} className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 cursor-pointer">
          <img src={lightboxPhoto} alt="Photo" className="max-w-full max-h-screen object-contain rounded-2xl" />
          <button onClick={() => setLightboxPhoto(null)} className="absolute right-4 text-white text-3xl font-bold" style={{ top: 'calc(var(--safe-top) + 16px)' }}>✕</button>
        </div>
      )}
    </div>
  );
};

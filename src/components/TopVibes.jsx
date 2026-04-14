import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateCompatibility, getCompatibilityLevel } from '../lib/matching';
import { Heart, X } from 'lucide-react';
import { ProfileView } from './ProfileView';

export const TopVibes = ({ currentUser, onLike, onPass }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

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
        .eq('user_id', currentUser.user_id);

      const swipedIds = (swiped || []).map(s => s.swiped_user_id);

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('city', currentUser.city)
        .eq('onboarding_complete', true)
        .neq('user_id', currentUser.user_id);

      const withPhotos = await Promise.all((allProfiles || []).map(async (p) => {
        const { data: photos } = await supabase.from('profile_photos').select('photo_url').eq('user_id', p.user_id).order('position');
        const compatibility = calculateCompatibility(currentUser, p);
        return { ...p, photos: photos || [], compatibility };
      }));

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

  if (loading) return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex items-center justify-center pb-24">
      <p className="text-white text-xl">⏳ Chargement...</p>
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
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-16 pb-4">
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
          <p className="text-gray-400 mt-1">{current.city === 'vancouver' ? 'Vancouver' : 'Montréal'}</p>
          {current.bio && <p className="text-gray-300 mt-3">{current.bio}</p>}

          <ProfileView profile={current} currentUser={currentUser} fullPage={true} onClose={() => {}} />
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
    </div>
  );
};

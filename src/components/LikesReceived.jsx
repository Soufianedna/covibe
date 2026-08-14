import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateCompatibility, getCompatibilityLevel } from '../lib/matching';
import { ProfileDetailView } from './ProfileDetailView';
import { useTranslation } from 'react-i18next';
import { usePropertyPhotos } from '../lib/usePropertyPhotos';
import { getCreativeTypeKey } from '../lib/creativeType';

export const LikesReceived = ({ currentUserProfile, onClose, onLike, onViewLikes, initialLikes = [] }) => {
  const { t } = useTranslation();
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    loadLikes();
  }, []);

  useEffect(() => {
    setPhotoIndex(0);
  }, [currentIndex]);

  const loadLikes = async () => {
    try {
      const { data: receivedLikes } = await supabase
        .from('swipes')
        .select('user_id')
        .eq('swiped_user_id', currentUserProfile.user_id)
        .eq('is_like', true)
        .eq('viewed', false);

      if (!receivedLikes || receivedLikes.length === 0) { setLoading(false); return; }

      const { data: myLikes } = await supabase
        .from('swipes')
        .select('swiped_user_id')
        .eq('user_id', currentUserProfile.user_id);

      const myLikedIds = (myLikes || []).map(l => l.swiped_user_id);
      const pending = receivedLikes.filter(l => !myLikedIds.includes(l.user_id)).map(l => l.user_id);

      if (pending.length === 0) { setLoading(false); return; }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', pending);

      const withPhotos = await Promise.all((profiles || []).map(async (p) => {
        const { data: photos } = await supabase.from('profile_photos').select('photo_url').eq('user_id', p.user_id).order('position');
        return { ...p, photos: photos || [] };
      }));

      setLikes(withPhotos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePass = async (profile) => {
    await supabase.from('swipes').upsert({ user_id: currentUserProfile.user_id, swiped_user_id: profile.user_id, is_like: false });
    const next = likes.filter(l => l.user_id !== profile.user_id);
    setLikes(next);
    setCurrentIndex(Math.min(currentIndex, next.length - 1));
  };

  const current = likes[currentIndex];
  const photos = current ? (current.photos?.length > 0 ? current.photos.map(p => p.photo_url) : [current.photo_url]) : [];
  const compatibility = current && currentUserProfile ? calculateCompatibility(currentUserProfile, current) : 0;
  const { color, emoji } = getCompatibilityLevel(compatibility);
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

  if (likes.length === 0) return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col items-center justify-center pb-24">
      <div className="text-6xl mb-4">💙</div>
      <h3 className="text-2xl font-bold text-white mb-2">Aucun like pour l'instant</h3>
      <p className="text-gray-400">Continue à swiper !</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col">
      {/* Header fixe */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-safe-screen pb-4">
        <h2 className="text-xl font-bold text-white">💙 {likes.length} like{likes.length > 1 ? "s" : ""} reçu{likes.length > 1 ? "s" : ""}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="p-2 bg-slate-700 rounded-full disabled:opacity-30">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <span className="text-gray-400 text-sm">{currentIndex + 1}/{likes.length}</span>
          <button onClick={() => setCurrentIndex(Math.min(likes.length - 1, currentIndex + 1))} disabled={currentIndex === likes.length - 1} className="p-2 bg-slate-700 rounded-full disabled:opacity-30">
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Zone scrollable */}
      <div className="flex-1 overflow-y-auto pb-40">
      {/* Photo principale */}
      <div className="relative mx-4 rounded-3xl overflow-hidden" style={{height: '55vh'}}
        onTouchStart={(e) => { window._touchStartX = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - window._touchStartX; if (dx > 50) setPhotoIndex(Math.max(0, photoIndex-1)); else if (dx < -50) setPhotoIndex(Math.min(photos.length-1, photoIndex+1)); }}
        onClick={(e) => { const x = e.nativeEvent.offsetX; const w = e.currentTarget.offsetWidth; if (x < w/2) setPhotoIndex(Math.max(0, photoIndex-1)); else setPhotoIndex(Math.min(photos.length-1, photoIndex+1)); }}>
        {photos[photoIndex] ? (
          <img src={photos[photoIndex]} alt={current.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center text-6xl">👤</div>
        )}
        {/* Navigation photos */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setPhotoIndex(i)} className={`w-2 h-2 rounded-full ${i === photoIndex ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        )}
        {/* Badge compatibilité */}
        <div className="absolute top-4 right-4 bg-black/60 rounded-full px-3 py-1">
          <span className="text-white text-sm font-bold">{compatibility}% {emoji}</span>
        </div>
      </div>

      {/* Infos profil */}
      <div className="px-6 pt-4">
        <h2 className="text-3xl font-bold text-white">{current.name}, {current.age}</h2>
        <p className="text-gray-400 mt-1">{current.city === "vancouver" ? "Vancouver" : "Montréal"} • {t(getCreativeTypeKey(current.creative_type, current.gender))}</p>
        <ProfileDetailView
          profile={{ ...current, compatibility }}
          isPreview={true}
          hideCompatibility={false}
          hideHeroPhoto={true}
          currentUserProfile={currentUserProfile}
          propertyPhotos={currentPropertyPhotos}
          onPropertyPhotoClick={(url) => setLightboxPhoto(url)}
        />
      </div>

      </div>
      {/* Boutons action */}
      <div className="fixed left-0 right-0 px-6 py-4 bg-slate-900 border-t border-slate-700 flex gap-4 z-10" style={{bottom: "120px"}}>
        <button
          onClick={() => handlePass(current)}
          className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
        >
          <X size={22} /> Passer
        </button>
        <button
          onClick={() => { onLike(current); const next = likes.filter(l => l.user_id !== current.user_id); setLikes(next); setCurrentIndex(Math.min(currentIndex, next.length - 1)); }}
          className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg"
        >
          <Heart size={22} /> Like Back
        </button>
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

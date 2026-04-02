import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, X, MapPin } from 'lucide-react';
import { getCompatibilityLevel } from '../lib/matching';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export default function SwipeView({ profiles, onSwipe, onViewProfile, currentUser }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(profiles.length - 1);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef(false);

  const canSwipe = currentIndex >= 0;

  const handleSwipe = async (dir) => {
    if (currentIndex < 0) return;
    const profile = profiles[currentIndex];
    setDragX(dir === 'right' ? 400 : -400);
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setDragX(0);
    }, 200);
    if (dir === 'right') await onSwipe(profile, 'like');
    else await onSwipe(profile, 'pass');
  };

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = false;
    setIsDragging(false);
  };

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!isDragging) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        isHorizontal.current = true;
        setIsDragging(true);
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        isHorizontal.current = false;
        return;
      }
    }

    if (isHorizontal.current) {
      e.preventDefault();
      setDragX(dx);
    }
  };

  const onTouchEnd = () => {
    if (isHorizontal.current && Math.abs(dragX) > 100) {
      handleSwipe(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
    }
    setIsDragging(false);
    isHorizontal.current = false;
  };

  if (profiles.length === 0) return (
    <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-violet-500/30">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold text-white mb-2">{t('noMoreProfiles')}</h3>
      <p className="text-gray-300">{t('checkBackLater')}</p>
    </div>
  );

  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      <div className="relative h-[540px] mb-4">
        {profiles.map((profile, index) => {
          const { levelKey, color, emoji } = getCompatibilityLevel(profile.compatibility);
          const isTop = index === currentIndex;
          const isNext = index === currentIndex - 1;
          if (!isTop && !isNext) return null;

          const rotation = isTop ? dragX * 0.05 : 0;
          const scale = isTop ? 1 : 0.95;
          const translateX = isTop ? dragX : 0;
          const opacity = isTop ? 1 : 0.7;
          const likeOpacity = isTop && dragX > 30 ? Math.min(dragX / 100, 1) : 0;
          const passOpacity = isTop && dragX < -30 ? Math.min(-dragX / 100, 1) : 0;

          return (
            <div
              key={profile.user_id}
              className="absolute w-full h-full"
              style={{
                transform: `translateX(${translateX}px) rotate(${rotation}deg) scale(${scale})`,
                opacity,
                transition: isDragging ? 'none' : 'all 0.2s ease',
                zIndex: isTop ? 10 : 5,
              }}
              onTouchStart={isTop ? onTouchStart : undefined}
              onTouchMove={isTop ? onTouchMove : undefined}
              onTouchEnd={isTop ? onTouchEnd : undefined}
            >
              <div className="relative w-full h-full bg-slate-800/50 backdrop-blur-lg border-2 border-violet-500/30 rounded-2xl overflow-hidden shadow-2xl">
                {likeOpacity > 0 && (
                  <div className="absolute top-8 left-8 z-20 border-4 border-green-400 rounded-xl px-4 py-2" style={{opacity: likeOpacity}}>
                    <span className="text-green-400 text-3xl font-black">LIKE</span>
                  </div>
                )}
                {passOpacity > 0 && (
                  <div className="absolute top-8 right-8 z-20 border-4 border-red-400 rounded-xl px-4 py-2" style={{opacity: passOpacity}}>
                    <span className="text-red-400 text-3xl font-black">PASS</span>
                  </div>
                )}
                <div className="relative h-[380px] overflow-hidden">
                  {profile.photo_url ? (
                    <LazyLoadImage effect="blur" src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center"><span className="text-9xl">👤</span></div>
                  )}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-violet-500/50">
                    <span className={`text-3xl font-bold ${color}`}>{profile.compatibility}%</span>
                  </div>
                  {profile.verified && <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">✓ {t('verified')}</div>}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-4xl font-bold mb-2">{profile.name}, {profile.age}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1"><MapPin size={18} className="text-violet-400"/><span className="text-lg">{profile.distance_text || "< 1 km"}</span></div>
                      <span className="text-lg">🎨 {t(profile.creative_type)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className={`${color==='text-green-500'?'bg-green-500/20 border-green-500/50':color==='text-blue-500'?'bg-blue-500/20 border-blue-500/50':'bg-yellow-500/20 border-yellow-500/50'} p-3 rounded-lg border`}>
                    <p className="text-white font-bold text-center">{emoji} {t(levelKey)}</p>
                  </div>
                  {profile.has_space && (
                    <div className="flex gap-3 mt-3">
                      {profile.room_price && <div className="flex-1 bg-slate-700/50 rounded-xl p-2 text-center"><p className="text-xs text-gray-400">💰 Prix</p><p className="text-white font-bold">{profile.room_price}$/mois</p></div>}
                      {profile.property_type && <div className="flex-1 bg-slate-700/50 rounded-xl p-2 text-center"><p className="text-xs text-gray-400">🏠 Logement</p><p className="text-white font-bold">{t(profile.property_type)}</p></div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {canSwipe && currentIndex >= 0 && (
        <button onClick={() => onViewProfile(profiles[currentIndex])}
          className="w-full mb-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
          style={{touchAction:'manipulation'}}>
          {t('viewProfile')}
        </button>
      )}

      {canSwipe && (
        <div className="flex justify-center items-center gap-12 mb-4">
          <button onClick={() => handleSwipe('left')} style={{touchAction:'manipulation'}} className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-indigo-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all"><X className="w-14 h-14"/></button>
          <button onClick={() => handleSwipe('right')} style={{touchAction:'manipulation'}} className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all"><Heart className="w-14 h-14"/></button>
        </div>
      )}

      <div className="text-center">
        <p className="text-gray-400 text-lg">{profiles.length - currentIndex - 1} / {profiles.length} {t('profilesRemaining')}</p>
      </div>
    </div>
  );
}

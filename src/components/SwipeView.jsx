import React from "react";
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import TinderCard from 'react-tinder-card';
import { Heart, X, MapPin } from 'lucide-react';
import { getCompatibilityLevel } from '../lib/matching';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export default function SwipeView({ 
  profiles, 
  onSwipe, 
  onViewProfile, 
  currentUser 
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(profiles.length - 1);
  const currentIndexRef = useRef(currentIndex);
  const canSwipe = currentIndex >= 0;

  const childRefs = useRef(
    Array(profiles.length).fill(0).map(() => React.createRef())
  );

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const swiped = async (direction, profile, index) => {
    updateCurrentIndex(index - 1);
    let action;
    if (direction === 'right') action = 'like';
    else if (direction === 'left') action = 'pass';
    await onSwipe(profile, action);
  };

  const swipe = async (dir) => {
    const index = currentIndexRef.current;
    if (index >= 0 && index < profiles.length && childRefs.current[index]?.current) {
      childRefs.current[index].current.swipe(dir);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-violet-500/30">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-white mb-2">{t('noMoreProfiles')}</h3>
        <p className="text-gray-300">{t('checkBackLater')}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative h-[600px] mb-6">
        {profiles.map((profile, index) => {
          const { levelKey, color, emoji } = getCompatibilityLevel(profile.compatibility);
          
          return (
            <TinderCard
              ref={childRefs.current[index]}
              key={profile.user_id}
              onSwipe={(dir) => swiped(dir, profile, index)}
              preventSwipe={['down', 'up']}
              className="absolute w-full h-full"
            >
              <div className="relative w-full h-full bg-slate-800/50 backdrop-blur-lg border-2 border-violet-500/30 rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative h-[450px] overflow-hidden">
                  {profile.photo_url ? (
                    <LazyLoadImage 
                      effect="blur"
                      src={profile.photo_url} 
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center">
                      <span className="text-9xl">👤</span>
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-violet-500/50">
                    <span className={`text-3xl font-bold ${color}`}>
                      {profile.compatibility}%
                    </span>
                  </div>

                  {profile.verified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✓ {t('verified')}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-4xl font-bold mb-2">
                      {profile.name}, {profile.age}
                    </h2>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={18} className="text-violet-400" />
                        <span className="text-lg">{profile.distance_text || "< 1 km"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">🎨 {t(profile.creative_type)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className={`${color === 'text-green-500' ? 'bg-green-500/20 border-green-500/50' : color === 'text-blue-500' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-yellow-500/20 border-yellow-500/50'} p-3 rounded-lg border`}>
                    <p className="text-white font-bold text-center">
                      {emoji} {t(levelKey)}
                    </p>
                  </div>

                  <button
                    onClick={() => onViewProfile(profile)}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-600 hover:to-purple-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                  >
                    {t('viewProfile')}
                  </button>
                </div>
              </div>
            </TinderCard>
          );
        })}
      </div>

      {canSwipe && (
        <div className="flex justify-center items-center gap-12 mb-4">
          <button
            onClick={() => swipe('left')}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-indigo-500 hover:from-red-600 hover:to-indigo-600 text-white shadow-2xl hover:shadow-violet-500/50 transition-all flex items-center justify-center group hover:scale-110"
          >
            <X className="w-14 h-14" />
          </button>

          <button
            onClick={() => swipe('right')}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl hover:shadow-green-500/50 transition-all flex items-center justify-center group hover:scale-110"
          >
            <Heart className="w-14 h-14" />
          </button>
        </div>
      )}

      <div className="text-center">
        <p className="text-gray-400 text-lg">
          {profiles.length - currentIndex - 1} / {profiles.length} {t('profilesRemaining')}
        </p>
      </div>
    </div>
  );
}

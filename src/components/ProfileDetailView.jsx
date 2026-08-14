import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { getCompatibilityLevel } from '../lib/matching';
import { calculateDistance, formatDistance } from '../lib/distance';
import { getDisplayAmenities } from '../lib/amenities';
import { getCreativeTypeKey } from '../lib/creativeType';

export const ProfileDetailView = ({
  profile,
  isPreview = false,
  hideCompatibility = false,
  hideHeroPhoto = false,
  currentUserProfile,
  searchPartnerships = [],
  partnerProfile,
  propertyPhotos = [],
  onClose,
  onViewPartner,
  onToggleFlexible,
  onPropertyPhotoClick,
  children,
}) => {
  const { t } = useTranslation();

  const getGenderLabel = (gender) => gender;
  const getCityLabel = (city) => city;
  const getProductiveTimeLabel = (time) => time;
  const getReligionLabel = (religion) => {
    const labels = {
      muslim: 'muslim', christian: 'christian', jewish: 'jewish',
      buddhist: 'buddhist', hindu: 'hindu', atheist: 'atheist',
      vegetarian_vegan: 'vegetarian_vegan', none: 'none', other: 'other'
    };
    return labels[religion] || religion;
  };
  const getWorkLocationLabel = (w) => ({ remote: 'remote', office: 'office', hybrid: 'hybrid', freelance: 'freelance', student: 'student', other: 'other' }[w] || w);
  const getRelationshipLabel = (r) => ({ single: 'single', couple: 'couple', married: 'married' }[r] || r);
  const getLeaseDurationLabel = (d) => ({ monthly: 'monthToMonth', '3months': 'threeMonths', '6months': 'sixMonths', '1year': 'oneYear' }[d] || d);
  const getLanguageLabel = (l) => ({ french: 'Français', english: 'Anglais', spanish: 'Espagnol', arabic: 'Arabe', portuguese: 'Portugais', mandarin: 'Mandarin', hindi: 'Hindi', farsi: 'Farsi', cantonese: 'Cantonais', other: 'Autre' }[l] || l);
  const getProfilePhotoUrls = (p) => {
    const raw = p?.photos && p.photos.length > 0 ? p.photos : [p?.photo_url];
    return raw.map((photo) => (typeof photo === 'string' ? photo : photo?.photo_url)).filter(Boolean);
  };

  if (!profile) return null;

  const photos = hideHeroPhoto ? [] : getProfilePhotoUrls(profile);

  const acceptedPartnership = searchPartnerships.find(p =>
    p.status === 'accepted' && (p.requester_id === profile.user_id || p.partner_id === profile.user_id)
  );
  const myPartnershipWithProfile = searchPartnerships.find(p =>
    p.status === 'accepted' &&
    ((p.requester_id === profile.user_id && p.partner_id === currentUserProfile?.user_id) ||
     (p.requester_id === currentUserProfile?.user_id && p.partner_id === profile.user_id))
  );

  const body = (
    <div className={isPreview ? 'space-y-6' : 'px-6 pb-4 space-y-6'}>
      {/* Photo 1 en hero, pleine largeur */}
      {!hideHeroPhoto && (
        <div className={`${isPreview ? '' : '-mx-6'} relative aspect-[4/5] bg-slate-700 overflow-hidden ${isPreview ? 'rounded-2xl' : 'rounded-b-2xl'}`}>
          {photos[0] ? (
            <img src={photos[0]} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">👤</div>
          )}
          {!hideCompatibility && (
            <div className="absolute left-4 top-4 z-20 px-3 py-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg rounded-full">
              <span className={`text-sm font-bold ${getCompatibilityLevel(profile.compatibility).color}`}>{getCompatibilityLevel(profile.compatibility).emoji} {profile.compatibility}%</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6 pt-16 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-3xl font-bold text-white flex items-center gap-2">
              {profile.name?.trim()}, {profile.age}
              {profile.verified && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-violet-500 rounded-full text-white text-sm font-bold">✓</span>
              )}
            </h3>
            <p className="text-gray-200 mt-1">
              📍 {getCityLabel(profile.city)}
              {!hideCompatibility && currentUserProfile?.latitude && profile.latitude && (
                <> · {formatDistance(calculateDistance(currentUserProfile.latitude, currentUserProfile.longitude, profile.latitude, profile.longitude))}</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Bloc identité */}
      <div className="text-center space-y-1">
        <p className="text-gray-300">{t(getGenderLabel(profile.gender))} · <span className="text-violet-400 font-semibold">{t(getCreativeTypeKey(profile.creative_type, profile.gender))}</span></p>
      </div>

      {partnerProfile && (
        <div className="flex flex-col items-center gap-1 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span>🤝 cherche une coloc avec</span>
            {onViewPartner ? (
              <button onClick={() => onViewPartner(partnerProfile)} className="flex items-center gap-2 hover:opacity-80 transition-all">
                {partnerProfile.photo_url ? (
                  <img src={partnerProfile.photo_url} alt={partnerProfile.name} className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm border-2 border-cyan-400">👤</div>
                )}
                <span className="text-cyan-400 font-semibold">{partnerProfile.name?.split(' ')[0]}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {partnerProfile.photo_url ? (
                  <img src={partnerProfile.photo_url} alt={partnerProfile.name} className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm border-2 border-cyan-400">👤</div>
                )}
                <span className="text-cyan-400 font-semibold">{partnerProfile.name?.split(' ')[0]}</span>
              </div>
            )}
          </div>
          {myPartnershipWithProfile && onToggleFlexible ? (
            <button
              onClick={() => onToggleFlexible(myPartnershipWithProfile)}
              className="flex items-center gap-2 mt-1 text-xs text-gray-400 hover:text-gray-300 transition-all"
            >
              <div className={`w-8 h-4 rounded-full transition-all ${myPartnershipWithProfile.is_flexible ? 'bg-cyan-500/40' : 'bg-slate-600'}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all mt-0.5 ${myPartnershipWithProfile.is_flexible ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span>{myPartnershipWithProfile.is_flexible ? 'Ouverts aussi à une place seule' : 'Cherchent ensemble · 2 chambres'}</span>
            </button>
          ) : (
            <p className="text-xs text-gray-500">
              {acceptedPartnership?.is_flexible ? 'Ouverts aussi à une place seule' : 'Cherchent ensemble · 2 chambres'}
            </p>
          )}
        </div>
      )}

      {!profile.has_space && profile.open_to_group_search && (
        <div className="p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-center">
          <p className="text-cyan-400 font-semibold">🤝 {t('openToGroupSearch')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('groupSearchDescription')}</p>
        </div>
      )}

      {/* Bio */}
      <div>
        <h4 className="text-lg font-bold text-white mb-2">{t('bio')}</h4>
        <p className="text-gray-200 bg-slate-800 rounded-2xl p-6 text-lg leading-relaxed">{profile.bio}</p>
      </div>

      {/* Photo 2 */}
      {photos[1] && (
        <div className={`${isPreview ? '' : '-mx-6'} relative aspect-[4/5] rounded-2xl overflow-hidden`}>
          <img src={photos[1]} alt={profile.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Infos clés en tags groupés */}
      <div>
        <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Le quotidien</h5>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">⏰ {t(getProductiveTimeLabel(profile.productive_time))}</span>
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">🧹 {t('cleanliness')} {profile.cleanliness}/5</span>
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">🔊 {t('noiseTolerance')} {profile.noise_tolerance}/10</span>
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">🎉 {t('guestsFrequency')} {profile.guests_frequency}/5</span>
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">{profile.smoking ? '🚬' : '🚭'} {t('tobacco')}: {profile.smoking ? t('yes') : t('no')}</span>
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">{profile.pets ? '✅' : '❌'} {t('animals')}: {profile.pets ? t('yes') : t('no')}</span>
        </div>
      </div>

      <div>
        <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Logement</h5>
        <div className="flex flex-wrap gap-2">
          {profile.seeking_roommate && (
            <span className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/50 rounded-full text-sm text-violet-300">
              ✓ {t('lookingForRoommate')}
            </span>
          )}
          {profile.seeking_studio && (
            <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300">
              🎨 {t('lookingForStudio')}
            </span>
          )}
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">
            💰 {profile.has_space ? `${t('roomPriceLabel')} ${profile.room_price}$/mois` : `${profile.budget_min}$ - ${profile.budget_max}$ CAD${t('perMonth')}`}
          </span>
          {profile.work_location && (
            <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">💼 {t(getWorkLocationLabel(profile.work_location))}</span>
          )}
          {profile.relationship_status && (
            <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">💜 {t(getRelationshipLabel(profile.relationship_status))}</span>
          )}
          {profile.move_in_date && (
            <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">📅 {new Date(profile.move_in_date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          )}
        </div>
      </div>

      <div>
        <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Style de vie</h5>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">🙏 {t(getReligionLabel(profile.religious_practice))}</span>
          {profile.alcohol_ok && <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">🍷 Alcool OK</span>}
          {profile.cannabis_friendly && <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">🌿 420 friendly</span>}
          {profile.no_substances && <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">✨ Mode de vie sobre</span>}
          {!profile.alcohol_ok && !profile.cannabis_friendly && !profile.no_substances && <span className="text-gray-500 text-xs">{t('notSpecified')}</span>}
        </div>
      </div>

      {/* Langues */}
      {profile.languages && profile.languages.length > 0 && (
        <div>
          <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">🌍 Langues</h5>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang) => (
              <span key={lang} className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/50 rounded-full text-violet-300 text-sm font-semibold">{getLanguageLabel(lang)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Photo 3 et suivantes */}
      {photos.slice(2).map((url, idx) => (
        <div key={idx} className={`${isPreview ? '' : '-mx-6'} relative aspect-[4/5] rounded-2xl overflow-hidden`}>
          <img src={url} alt={`${profile.name} ${idx + 3}`} className="w-full h-full object-cover" />
        </div>
      ))}

      {/* SECTION ESPACE DISPONIBLE */}
      {profile.has_space && (
        <div className="bg-slate-800 rounded-2xl p-6 space-y-5">
          <h4 className="text-lg font-bold text-white">🏠 {t('availableSpace')}</h4>

          {/* Prix — information principale de la section */}
          <div className="bg-gradient-to-r from-violet-600/20 to-indigo-500/20 border border-violet-500/30 rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold text-white">
              {profile.room_price}$ <span className="text-lg font-semibold text-gray-300">{t('perMonth')}</span>
            </p>
          </div>

          {/* Photo du logement */}
          {propertyPhotos[0] && (
            <img
              src={propertyPhotos[0].url}
              alt="Property"
              onClick={onPropertyPhotoClick ? () => onPropertyPhotoClick(propertyPhotos[0].url) : undefined}
              className={`w-full aspect-[4/5] object-cover rounded-2xl transition-all ${onPropertyPhotoClick ? 'cursor-pointer hover:opacity-90' : ''}`}
            />
          )}

          {/* Caractéristiques */}
          {(profile.property_type || profile.is_furnished !== null || profile.lease_duration) && (
            <div className="flex flex-wrap gap-2">
              {profile.property_type && (
                <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">🏠 {t(profile.property_type)}</span>
              )}
              {profile.is_furnished !== null && (
                <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">{profile.is_furnished ? '✅' : '❌'} {profile.is_furnished ? t('furnished') : t('unfurnished')}</span>
              )}
              {profile.lease_duration && (
                <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-gray-200">📅 {t(getLeaseDurationLabel(profile.lease_duration))}</span>
              )}
            </div>
          )}

          {/* Deuxième photo du logement */}
          {propertyPhotos[1] && (
            <img
              src={propertyPhotos[1].url}
              alt="Property"
              onClick={onPropertyPhotoClick ? () => onPropertyPhotoClick(propertyPhotos[1].url) : undefined}
              className={`w-full aspect-[4/5] object-cover rounded-2xl transition-all ${onPropertyPhotoClick ? 'cursor-pointer hover:opacity-90' : ''}`}
            />
          )}

          {/* Description */}
          {profile.property_description && (
            <div>
              <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">{t('propertyDescription')}</h5>
              <p className="text-gray-200 bg-slate-700/50 rounded-2xl p-6 text-lg leading-relaxed">{profile.property_description}</p>
            </div>
          )}

          {/* Équipements */}
          {getDisplayAmenities(profile.amenities).length > 0 && (
            <div>
              <h5 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">{t('amenities')}</h5>
              <div className="flex flex-wrap gap-2">
                {getDisplayAmenities(profile.amenities).map(amenity => (
                  <span key={amenity} className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-sm">
                    ✓ {t(amenity)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Badge espace créatif */}
          {profile.has_creative_space && (
            <div className="p-3 bg-purple-500/20 border border-purple-500/50 rounded-2xl text-center">
              <p className="text-purple-400 font-semibold">🎨 {t('creativeSpaceAvailable')}</p>
            </div>
          )}

          {/* Photos du logement supplémentaires */}
          {propertyPhotos.slice(2).map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt="Property"
              onClick={onPropertyPhotoClick ? () => onPropertyPhotoClick(photo.url) : undefined}
              className={`w-full aspect-[4/5] object-cover rounded-2xl transition-all ${onPropertyPhotoClick ? 'cursor-pointer hover:opacity-90' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Compatibilité, condensée en bas */}
      {!hideCompatibility && (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">{t('compatibility')}</span>
            <span className={`text-lg font-bold ${getCompatibilityLevel(profile.compatibility).color}`}>{getCompatibilityLevel(profile.compatibility).emoji} {profile.compatibility}% · {t(getCompatibilityLevel(profile.compatibility).levelKey)}</span>
          </div>
          <div className="space-y-2">
            {[
              { label: '💰 ' + t('budget'), value: currentUserProfile && profile ? (() => { const b1min = currentUserProfile.budget_min||0; const b1max = currentUserProfile.budget_max||9999; const b2min = profile.budget_min||0; const b2max = profile.budget_max||9999; const overlap = Math.min(b1max,b2max)-Math.max(b1min,b2min); return overlap>0 ? Math.round((overlap/(Math.max(b1max,b2max)-Math.min(b1min,b2min)))*30) : 0; })() : 0, max: 30 },
              { label: '🌅 ' + t('scheduleLabel'), value: currentUserProfile?.schedule === profile?.schedule ? 20 : (currentUserProfile?.schedule && profile?.schedule ? 5 : 10), max: 20 },
              { label: '🏠 ' + t('habits'), value: (() => { let s=0; if(currentUserProfile?.smoking === profile?.smoking) s+=8; if(currentUserProfile?.pets === profile?.pets || currentUserProfile?.pets_ok || profile?.pets_ok) s+=8; if(Math.abs((currentUserProfile?.cleanliness||3)-(profile?.cleanliness||3))<=1) s+=9; return s; })(), max: 25 },
              { label: '🙏 ' + t('practices'), value: currentUserProfile?.religious_practice === profile?.religious_practice ? 15 : ((!currentUserProfile?.religious_practice||currentUserProfile?.religious_practice==='none') || (!profile?.religious_practice||profile?.religious_practice==='none') ? 10 : 5), max: 15 },
              { label: '✨ ' + t('lifestyle'), value: (() => { let s=0; if(Math.abs((currentUserProfile?.noise_tolerance||5)-(profile?.noise_tolerance||5))<=2) s+=5; if(Math.abs((currentUserProfile?.guests_frequency||2)-(profile?.guests_frequency||2))<=1) s+=5; return s; })(), max: 10 },
            ].map(({ label, value, max }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{label}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-400 h-1.5 rounded-full transition-all" style={{width: `${(value/max)*100}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isPreview) {
    return body;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 z-[110]">
      <div className="fixed -top-20 -left-20 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-0 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />

      {/* Bandeau opaque fixe au-dessus de la safe area : indépendant du scroll, reste toujours visible au-dessus du contenu */}
      <div className="fixed top-0 inset-x-0 z-10 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950" style={{ height: 'var(--safe-top)' }} />

      <button onClick={onClose} className="fixed right-4 z-20 p-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-slate-900/80 rounded-full transition-all" style={{ top: 'calc(var(--safe-top) + 16px)' }}>
        <X size={24} className="text-white" />
      </button>

      {/* Conteneur scrollable séparé du conteneur fixe : commence sous la safe area, indépendamment du scroll */}
      <div className="absolute inset-x-0 bottom-0 overflow-y-auto" style={{ top: 'var(--safe-top)' }}>
        {body}

        {children && (
          <div className="sticky bottom-0 bg-white/5 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.25)] p-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

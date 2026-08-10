import { PhotoUploader } from './PhotoUploader';
import { PropertyPhotosUploader } from './PropertyPhotosUploader';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, X } from 'lucide-react';
import { getNeighborhoodsForCity, getNeighborhoodCoordinates, neighborhoodGroups } from '../lib/neighborhoods';
import { useTranslation } from 'react-i18next';

export const ProfileEdit = ({ userProfile, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [propertyPhotos, setPropertyPhotos] = useState([]);
  const [profile, setProfile] = useState({
    name: userProfile.name || '',
    age: userProfile.age || '',
    gender: userProfile.gender || '',
    city: userProfile.city || '',
    creative_type: userProfile.creative_type || '',
    productive_time: userProfile.productive_time || '',
    seeking_roommate: userProfile.seeking_roommate || false,
    seeking_studio: userProfile.seeking_studio || false,
    has_space: userProfile.has_space || false,
    bio: userProfile.bio || '',
    budget_min: userProfile.budget_min || '',
    budget_max: userProfile.budget_max || '',
    photo_url: userProfile.photo_url || '',
    smoking: userProfile.smoking || false,
    pets: userProfile.pets || false,
    pets_ok: userProfile.pets_ok || true,
    alcohol_ok: userProfile.alcohol_ok || true,
    cannabis_friendly: userProfile.cannabis_friendly || false,
    no_substances: userProfile.no_substances || false,
    noise_tolerance: userProfile.noise_tolerance || 5,
    guests_frequency: userProfile.guests_frequency || 3,
    cleanliness: userProfile.cleanliness || 3,
    religious_practice: userProfile.religious_practice || 'none',
    languages: userProfile.languages || [],
    safe_space_preferences: userProfile.safe_space_preferences || [],
    move_in_date: userProfile.move_in_date || '',
    work_location: userProfile.work_location || 'hybrid',
    latitude: userProfile.latitude || null,
    longitude: userProfile.longitude || null,
    search_radius: userProfile.search_radius || 25,
    location_mode: userProfile.location_mode || 'on_site',
    neighborhood: userProfile.neighborhood || null,
    room_price: userProfile.room_price || null,
    property_type: userProfile.property_type || null,
    property_description: userProfile.property_description || null,
    is_furnished: userProfile.is_furnished || false,
    amenities: userProfile.amenities || [],
    has_creative_space: userProfile.has_creative_space || false,
    creative_space_type: userProfile.creative_space_type || [],
    open_to_group_search: userProfile.open_to_group_search || false,
  });

  useEffect(() => {
    loadPhotos();
  }, [userProfile]);

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('user_id', userProfile.user_id)
      .order('position');
    
    console.log("🔍 LOADED PHOTOS:", data);
    
    // Si profile_photos vide mais photo_url existe dans profiles → on la migre
    if ((!data || data.length === 0) && userProfile.photo_url) {
      const { error } = await supabase
        .from('profile_photos')
        .insert({ user_id: userProfile.user_id, photo_url: userProfile.photo_url, position: 0 });
      if (!error) {
        setExistingPhotos([{ photo_url: userProfile.photo_url, position: 0 }]);
        return;
      }
    }
    setExistingPhotos(data || []);

    const { data: propPhotos } = await supabase
      .from('property_photos')
      .select('*')
      .eq('user_id', userProfile.user_id)
      .order('position');
    setPropertyPhotos(propPhotos || []);
  };

  const handleSeekingChange = (field) => {
    const newProfile = { ...profile };
    
    if (field === 'has_space') {
      if (!newProfile.has_space) {
        newProfile.has_space = true;
        newProfile.seeking_studio = false;
      } else {
        newProfile.has_space = false;
      }
    } else if (field === 'seeking_roommate') {
      newProfile.seeking_roommate = !newProfile.seeking_roommate;
    } else if (field === 'seeking_studio') {
      if (!newProfile.seeking_studio && newProfile.has_space) {
        showToast('⚠️ Tu ne peux pas chercher un studio si tu as déjà un espace', 'warning');
        return;
      }
      newProfile.seeking_studio = !newProfile.seeking_studio;
    }
    
    setProfile(newProfile);
  };

  const trimIfString = (value) => (typeof value === 'string' ? value.trim() : value);

  const handleSave = async () => {
    if (!profile.name || !profile.age || !profile.bio || (!profile.has_space && (!profile.budget_min || !profile.budget_max))) {
      showToast('⚠️ Champs obligatoires manquants', 'warning'); return;
      return;
    }

    setLoading(true);
    try {
      const cleanProfile = {
        ...profile,
        name: trimIfString(profile.name),
        bio: trimIfString(profile.bio),
        property_description: trimIfString(profile.property_description),
        age: parseInt(profile.age),
        budget_min: parseInt(profile.budget_min),
        budget_max: parseInt(profile.budget_max),
        noise_tolerance: parseInt(profile.noise_tolerance),
        guests_frequency: parseInt(profile.guests_frequency),
        cleanliness: parseInt(profile.cleanliness),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(cleanProfile)
        .eq('user_id', userProfile.user_id)
        .select()
        .single();

      if (error) throw error;

      showToast('✅ Profil mis à jour !', 'success');
      onSave(data);
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('❌ Erreur lors de la sauvegarde. Réessaie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-6">
          {/* PHOTOS MULTIPLES */}
          <PhotoUploader
            userId={userProfile.user_id}
            existingPhotos={existingPhotos}
            onPhotosChange={setExistingPhotos}
          />

          {/* INFOS DE BASE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('fullName')}</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('age')}</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('gender')}</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="man">Homme</option>
                <option value="woman">Femme</option>
                <option value="non_binary">Non-binaire</option>
                <option value="prefer_not_to_say">Préfère ne pas dire</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('city')}</label>
              <select
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="vancouver">Vancouver</option>
                <option value="montreal">Montréal</option>
                <option value="toronto">Toronto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('creativeType')}</label>
            <select
              value={profile.creative_type}
              onChange={(e) => setProfile({ ...profile, creative_type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="musician">🎵 {t('musician')}</option>
              <option value="artist">🎨 {t('visualArtist')}</option>
              <option value="content_creator">📹 {t('contentCreator')}</option>
              <option value="photographer">📸 {t('photographer')}</option>
              <option value="developer">💻 Développeur·se</option>
              <option value="writer">✍️ {t('writer')}</option>
              <option value="entrepreneur">🚀 {t('entrepreneur')}</option>
              <option value="other">✨ {t('other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('lifeRhythm')}</label>
            <select
              value={profile.productive_time}
              onChange={(e) => setProfile({ ...profile, productive_time: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="early">🌅 {t('earlyBird')}</option>
              <option value="day">☀️ {t('afternoon')}</option>
              <option value="late">🌆 {t('evening')}</option>
              <option value="night">🌙 {t('nightOwl')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('workLocation')}</label>
            <select
              value={profile.work_location}
              onChange={(e) => setProfile({ ...profile, work_location: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="remote">🏠 {t('remote')}</option>
              <option value="office">🏢 {t('office')}</option>
              <option value="hybrid">🔄 {t('hybrid')}</option>
              <option value="freelance">💼 {t('freelance')}</option>
              <option value="student">📚 {t('student')}</option>
              <option value="other">🎨 Autre</option>
            </select>
          </div>

          {/* QUE CHERCHES-TU */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">{t('whatAreYouLookingFor')}</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.has_space || profile.seeking_roommate}
                  onChange={() => handleSeekingChange('seeking_roommate')}
                  disabled={profile.has_space}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">🏠 {t('iLookForRoommate')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.seeking_studio}
                  onChange={() => handleSeekingChange('seeking_studio')}
                  disabled={profile.has_space}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                />
                <span className="text-gray-300">🎨 {t('iLookForCreativeSpace')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.has_space}
                  onChange={() => handleSeekingChange('has_space')}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">✨ {t('iHaveSpaceToShare')}</span>
              </label>

              {/* Open to group search - seulement si pas d'espace */}
              {!profile.has_space && (
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    checked={profile.open_to_group_search || false}
                    onChange={(e) => setProfile({ ...profile, open_to_group_search: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                  />
                  <div>
                    <span className="text-gray-300">{t('openToGroupSearch')}</span>
                    <p className="text-xs text-gray-500 mt-1">{t('groupSearchDescription')}</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* LOCALISATION */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">{t('whereAreYouSearching')}</label>
            <div className="space-y-4">
              {/* Radio buttons pour choisir le mode */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                  <input
                    type="radio"
                    name="location_mode"
                    value="on_site"
                    checked={profile.location_mode === 'on_site'}
                    onChange={() => setProfile({ ...profile, location_mode: 'on_site' })}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-300">🏠 {t('alreadyHere')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-all">
                  <input
                    type="radio"
                    name="location_mode"
                    value="remote"
                    checked={profile.location_mode === 'remote'}
                    onChange={() => setProfile({ ...profile, location_mode: 'remote' })}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-300">✈️ {t('searchingRemotely')}</span>
                </label>
              </div>

              {/* Si sur place: bouton GPS */}
              {profile.location_mode === 'on_site' && (
                <button
                  type="button"
                  onClick={async () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const lat = position.coords.latitude;
                          const lng = position.coords.longitude;
                          let cityName = profile.city || '';
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                            const data = await res.json();
                            const rawCity = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
                            if (rawCity.toLowerCase().includes('vancouver')) cityName = 'vancouver';
                            else if (rawCity.toLowerCase().includes('montreal') || rawCity.toLowerCase().includes('montréal')) cityName = 'montreal';
                            else cityName = rawCity.toLowerCase();
                          } catch(e) {}
                          setProfile({
                            ...profile,
                            latitude: lat,
                            longitude: lng,
                            city: cityName,
                          });
                          showToast('📍 ' + cityName, 'success');
                        },
                        (error) => {
                          showToast('❌ Impossible d\'obtenir ta position', 'error');
                        }
                      );
                    }
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  📍 Utiliser ma position actuelle
                </button>
              )}

              {/* Si à distance: dropdown ville + quartier */}
              {profile.location_mode === 'remote' && (
                <div className="space-y-4">
                  <select
                    value={profile.city || ''}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value, neighborhood: '' })}
                    className="w-full px-4 py-3 bg-slate-700 border border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Dans quelle ville ?</option>
                    <option value="vancouver">Vancouver</option>
                    <option value="montreal">Montréal</option>
                <option value="toronto">Toronto</option>
                  </select>

                  {profile.city && (
                    <select
                      value={profile.neighborhood || ''}
                      onChange={(e) => {
                        const neighborhoodId = e.target.value;
                        let coords = null;
                        if (neighborhoodId.startsWith('all__')) {
                          const groupName = neighborhoodId.replace('all__', '');
                          const group = (neighborhoodGroups[profile.city] || []).find(g => g.group === groupName);
                          if (group && group.neighborhoods.length > 0) {
                            const lats = group.neighborhoods.map(n => n.lat);
                            const lngs = group.neighborhoods.map(n => n.lng);
                            coords = { lat: lats.reduce((a,b) => a+b,0)/lats.length, lng: lngs.reduce((a,b) => a+b,0)/lngs.length };
                          }
                        } else {
                          coords = getNeighborhoodCoordinates(profile.city, neighborhoodId);
                        }
                        setProfile({
                          ...profile,
                          neighborhood: neighborhoodId,
                          latitude: coords?.lat || null,
                          longitude: coords?.lng || null,
                        });
                      }}
                      className="w-full px-4 py-3 bg-slate-700 border border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="">Dans quel quartier ?</option>
                      {(neighborhoodGroups[profile.city] || []).map(group => (
                        <optgroup key={group.group} label={group.group}>
                          <option value={'all__' + group.group}>✦ Tout {group.group}</option>
                          {group.neighborhoods.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Confirmation */}
              {profile.latitude && profile.longitude && (
                <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-semibold">{t('locationSaved')}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    📍 {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                  </p>
                </div>
              )}
          </div>
          </div>


          {/* MON ESPACE À PARTAGER */}
          {profile.has_space && (
            <div className="border-t border-violet-500/30 pt-6">
              <h3 className="text-xl font-bold text-white mb-4">🏠 {t('mySpace')}</h3>
              
              {/* Photos de l'espace */}
              <PropertyPhotosUploader
                userId={userProfile.user_id}
                existingPhotos={propertyPhotos}
                onPhotosChange={setPropertyPhotos}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Prix */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{t('roomPrice')}</label>
                  <input
                    type="number"
                    value={profile.room_price || ''}
                    onChange={(e) => setProfile({ ...profile, room_price: parseInt(e.target.value) || null })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="800"
                  />
                </div>

                {/* Type de logement */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{t('propertyType')}</label>
                  <select
                    value={profile.property_type || ''}
                    onChange={(e) => setProfile({ ...profile, property_type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">---</option>
                    <option value="apartment">{t('apartment')}</option>
                    <option value="house">{t('house')}</option>
                    <option value="loft">{t('loft')}</option>
                    <option value="studio">{t('studio')}</option>
                  </select>
                </div>
              </div>

              {/* Lease Duration */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">{t('leaseDuration')}</label>
                <select
                  value={profile.lease_duration || ''}
                  onChange={(e) => setProfile({ ...profile, lease_duration: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">---</option>
                  <option value="monthly">{t('monthToMonth')}</option>
                  <option value="3months">{t('threeMonths')}</option>
                  <option value="6months">{t('sixMonths')}</option>
                  <option value="1year">{t('oneYear')}</option>
                </select>
              </div>
              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">{t('propertyDescription')}</label>
                <textarea
                  value={profile.property_description || ''}
                  onChange={(e) => setProfile({ ...profile, property_description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  rows="3"
                  placeholder="Décris ton espace..."
                />
              </div>

              {/* Meublé */}
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.is_furnished || false}
                    onChange={(e) => setProfile({ ...profile, is_furnished: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                  />
                  <span className="text-gray-300">{t('furnished')}</span>
                </label>
              </div>

              {/* Espace de création */}
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.has_creative_space || false}
                    onChange={(e) => setProfile({ ...profile, has_creative_space: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                  />
                  <span className="text-gray-300">{t('hasCreativeSpace')}</span>
                </label>
                {profile.has_creative_space && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm font-semibold text-gray-300 mb-2">Type d'espace :</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'youtube_studio', label: '🎬 Studio YouTube' },
                        { value: 'photo_studio', label: '📸 Espace photo' },
                        { value: 'music_studio', label: '🎵 Studio musique' },
                        { value: 'yoga_gym', label: '🧘 Yoga / Gym' },
                        { value: 'nail_makeup', label: '💅 Nail / Makeup' },
                        { value: 'art_studio', label: '🎨 Atelier art' },
                      ].map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox"
                            checked={(profile.creative_space_type || []).includes(value)}
                            onChange={(e) => {
                              const current = profile.creative_space_type || [];
                              setProfile({ ...profile, creative_space_type: e.target.checked ? [...current, value] : current.filter(t => t !== value) });
                            }}
                            className="w-4 h-4 rounded bg-slate-700 border-gray-600 text-violet-500"
                          />
                          <span className="text-gray-300 text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Équipements */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-300 mb-3">{t('amenities')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {['wifi', 'laundry', 'parking', 'balcony', 'dishwasher', 'airConditioning', 'heating'].map(amenity => (
                    <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.amenities?.includes(amenity) || false}
                        onChange={(e) => {
                          const current = profile.amenities || [];
                          const updated = e.target.checked
                            ? [...current, amenity]
                            : current.filter(a => a !== amenity);
                          setProfile({ ...profile, amenities: updated });
                        }}
                        className="w-4 h-4 rounded bg-slate-700 border-gray-600 text-violet-500"
                      />
                      <span className="text-sm text-gray-300">{t(amenity)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* LANGUES */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">🌍 Langues parlées</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'french', label: 'Français' },
                { value: 'english', label: 'Anglais' },
                { value: 'spanish', label: 'Espagnol' },
                { value: 'arabic', label: 'Arabe' },
                { value: 'portuguese', label: 'Portugais' },
                { value: 'mandarin', label: 'Mandarin' },
                { value: 'hindi', label: 'Hindi' },
                { value: 'farsi', label: 'Farsi' },
                { value: 'cantonese', label: 'Cantonais' },
                { value: 'other', label: 'Autre' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const langs = profile.languages || [];
                    setProfile({ ...profile, languages: langs.includes(value) ? langs.filter(l => l !== value) : [...langs, value] });
                  }}
                  className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                    (profile.languages || []).includes(value)
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* BIO */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={5}
              placeholder="Décris ton mode de vie, tes passions, ce que tu cherches..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          {!profile.has_space && (<>
          {/* BUDGET */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Budget mensuel (CAD)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Minimum</label>
                <input
                  type="number"
                  value={profile.budget_min}
                  onChange={(e) => setProfile({ ...profile, budget_min: e.target.value })}
                  min={0}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Maximum</label>
                <input
                  type="number"
                  value={profile.budget_max}
                  onChange={(e) => setProfile({ ...profile, budget_max: e.target.value })}
                  min={0}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
          </>)}

          {/* PREFERENCES */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">{t('lifePreferences')}</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.smoking}
                  onChange={(e) => setProfile({ ...profile, smoking: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">🚬 {t('smoke')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.pets}
                  onChange={(e) => setProfile({ ...profile, pets: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">🐾 {t('pets')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.pets_ok}
                  onChange={(e) => setProfile({ ...profile, pets_ok: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">🐾 {t('acceptsPets')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.alcohol_ok}
                  onChange={(e) => setProfile({ ...profile, alcohol_ok: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">🍷 {t('alcoholOk')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.cannabis_friendly}
                  onChange={(e) => setProfile({ ...profile, cannabis_friendly: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">🌿 420 friendly</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={profile.no_substances}
                  onChange={(e) => setProfile({ ...profile, no_substances: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-gray-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-300">✨ {t('soberLifestyle')}</span>
              </label>
            </div>
          </div>

          {/* Relationship Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('relationshipStatus')}</label>
            <select
              value={profile.relationship_status || ''}
              onChange={(e) => setProfile({ ...profile, relationship_status: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">---</option>
              <option value="single">{t('single')}</option>
              <option value="couple">{t('couple')}</option>
              <option value="married">{t('married')}</option>
            </select>
          </div>
          {/* SLIDERS */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              {t('cleanlinessLabel')}
            </label>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>1</span>
              <span className="text-white font-bold">{profile.cleanliness}</span>
              <span>5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={profile.cleanliness}
              onChange={(e) => setProfile({ ...profile, cleanliness: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              {t('noiseToleranceLabel')}
            </label>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>1</span>
              <span className="text-white font-bold">{profile.noise_tolerance}</span>
              <span>10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={profile.noise_tolerance}
              onChange={(e) => setProfile({ ...profile, noise_tolerance: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              {t('guestsFrequencyLabel')}
            </label>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>1</span>
              <span className="text-white font-bold">{profile.guests_frequency}</span>
              <span>5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={profile.guests_frequency}
              onChange={(e) => setProfile({ ...profile, guests_frequency: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* DATE EMMENAGEMENT */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('moveInDate')}</label>
            <input
              type="date"
              value={profile.move_in_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setProfile({ ...profile, move_in_date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* BOUTONS */}
          {/* Toast notification */}
          {toast && (
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all ${
              toast.type === 'success' ? 'bg-gradient-to-r from-violet-600 to-indigo-500' :
              toast.type === 'error' ? 'bg-red-500' : 'bg-orange-500'
            }`}>
              {toast.msg}
            </div>
          )}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-slate-800 pb-4 border-t border-violet-500/30 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
  );
};

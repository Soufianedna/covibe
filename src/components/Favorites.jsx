import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { supabase } from '../lib/supabase';
import { X, Star, Heart, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCompatibilityLevel } from '../lib/matching';

export const Favorites = ({ currentUser, onClose, onOpenChat, onLike, mutualMatches }) => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Récupère les IDs des favoris
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('favorited_user_id')
        .eq('user_id', currentUser.user_id);

      if (favError) throw favError;

      if (!favData || favData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const favoriteIds = favData.map(f => f.favorited_user_id);

      // Récupère les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', favoriteIds);

      if (profilesError) throw profilesError;

      setFavorites(profiles || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (userId) => {
    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser.user_id)
        .eq('favorited_user_id', userId);

      setFavorites(favorites.filter(f => f.user_id !== userId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const getGenderLabel = (gender) => {
    const labels = { man: 'Homme', woman: 'Femme', non_binary: 'Non-binaire', prefer_not_to_say: 'Non précisé' };
    return labels[gender] || gender;
  };

  const getCityLabel = (city) => city === 'vancouver' ? 'Vancouver' : 'Montréal';

  const getCreativeTypeLabel = (type) => {
    const labels = { musician: 'Musicien·ne', artist: 'Artiste visuel·le', content_creator: 'Créateur·rice de contenu', photographer: 'Photographe', developer: 'Développeur·se', writer: 'Écrivain·e', entrepreneur: 'Entrepreneur·e', other: 'Autre' };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900 pb-24">
      <div className="p-6 pt-16">
        <h2 className="text-2xl font-bold text-white mb-6">⭐ Mes Favoris</h2>
        <div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-white text-xl font-semibold">Chargement...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20">
              <Star className="mx-auto mb-4 text-gray-600" size={64} />
              <h3 className="text-2xl font-bold text-white mb-2">{t('noFavorites')}</h3>
              <p className="text-gray-400">{t('noFavoritesSub')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((profile) => {
                const { level, color, emoji } = getCompatibilityLevel(profile.compatibility || 70);
                
                return (
                  <div key={profile.user_id} className="bg-slate-700/50 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-500 transition-all relative">
                    <button
                      onClick={() => handleRemoveFavorite(profile.user_id)}
                      className="absolute top-4 right-4 p-2 bg-yellow-500/20 hover:bg-red-500/20 rounded-full transition-all"
                    >
                      <Star size={20} className="text-yellow-400 hover:text-red-400 fill-yellow-400" />
                    </button>

                    <div className="mb-4">
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt={profile.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-violet-500" />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto bg-slate-600 flex items-center justify-center text-4xl">👤</div>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{profile.age} ans • {getGenderLabel(profile.gender)} • {getCityLabel(profile.city)}</p>
                      <p className="text-violet-400 font-semibold">{getCreativeTypeLabel(profile.creative_type)}</p>
                    </div>
                    {mutualMatches && mutualMatches.includes(profile.user_id) ? (
                      <button
                        onClick={() => onOpenChat(profile)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        <MessageCircle size={18} />
                        {t("send")}
                      </button>
                    ) : (
                      <div className="text-center py-3 text-gray-400 text-sm">
                        💔 Pas encore de match mutuel
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};


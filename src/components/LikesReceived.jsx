import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Heart } from 'lucide-react';
import { getCompatibilityLevel } from '../lib/matching';

export const LikesReceived = ({ currentUser, onClose, onLike }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    try {
      // Récupère les user_id qui t'ont liké ET que tu n'as pas encore vu
      const { data: receivedLikes, error: likesError } = await supabase
        .from('swipes')
        .select('user_id')
        .eq('swiped_user_id', currentUser.user_id)
        .eq('is_like', true)
        .eq('viewed', false);  // ✅ AJOUTER CETTE LIGNE

      if (likesError) throw likesError;

      const likerIds = receivedLikes.map(like => like.user_id);

      if (likerIds.length === 0) {
        setLikes([]);
        setLoading(false);
        return;
      }

      // Récupère TOUS les swipes que tu as fait (like ET pass)
      const { data: mySwipes, error: mySwipesError } = await supabase
        .from('swipes')
        .select('swiped_user_id')
        .eq('user_id', currentUser.user_id);

      if (mySwipesError) throw mySwipesError;

      const mySwipedIds = mySwipes.map(s => s.swiped_user_id);

      // Filtre pour garder seulement ceux que tu n'as PAS ENCORE swipé (ni like ni pass)
      const pendingLikerIds = likerIds.filter(id => !mySwipedIds.includes(id));

      if (pendingLikerIds.length === 0) {
        setLikes([]);
        setLoading(false);
        return;
      }

      // Récupère les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', pendingLikerIds);

      if (profilesError) throw profilesError;
      setLikes(profiles || []);
      
      // Marquer SEULEMENT ces likes comme vus (ceux qu'on affiche vraiment)
      if (pendingLikerIds.length > 0) {
        await supabase
          .from('swipes')
          .update({ viewed: true })
          .in('user_id', pendingLikerIds)
          .eq('swiped_user_id', currentUser.user_id)
          .eq('is_like', true);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setLoading(false);
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

  const handlePass = async (profile) => {
    try {
      console.log('🚫 Passing profile:', profile.name);
      
      // Vérifie si tu as déjà un swipe vers cette personne
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', currentUser.user_id)
        .eq('swiped_user_id', profile.user_id)
        .maybeSingle();
      
      if (existingSwipe) {
        // Update le swipe existant
        console.log('📝 Updating existing swipe to pass');
        const { error } = await supabase
          .from('swipes')
          .update({ is_like: false })
          .eq('id', existingSwipe.id);
        
        if (error) throw error;
      } else {
        // Crée un nouveau swipe "pass"
        console.log('➕ Creating new pass swipe');
        const { error } = await supabase
          .from('swipes')
          .insert({
            user_id: currentUser.user_id,
            swiped_user_id: profile.user_id,
            is_like: false
          });
        
        if (error) throw error;
      }

      // IMPORTANT: Marque le like de l'autre personne comme "vu"
      await supabase
        .from('swipes')
        .update({ viewed: true })
        .eq('user_id', profile.user_id)
        .eq('swiped_user_id', currentUser.user_id);

      console.log('✅ Profile passed successfully');

      // Retire le profil de la liste
      setLikes(likes.filter(p => p.user_id !== profile.user_id));
      
      // Ferme le profil détaillé s'il est ouvert
      if (selectedProfile?.user_id === profile.user_id) {
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error('❌ Error passing profile:', error);
      alert('Erreur lors du pass. Réessaie.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
        <div className="bg-slate-800 border border-pink-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-slate-800 border-b border-pink-500/30 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">💕 Likes Reçus</h2>
              <p className="text-gray-400 mt-1">{likes.length} {likes.length > 1 ? 'personnes t\'ont liké' : 'personne t\'a liké'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
              <X size={24} className="text-gray-300" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-white text-xl">Chargement...</p>
              </div>
            ) : likes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-2xl font-bold text-white mb-2">Aucun like pour l'instant</h3>
                <p className="text-gray-400">Continue à swiper pour trouver ton match parfait !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likes.map((profile) => (
                  <div 
                    key={profile.user_id} 
                    className="bg-slate-700/50 rounded-2xl p-6 hover:bg-slate-700 transition-all cursor-pointer"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="text-center mb-4">
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt={profile.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-pink-500 mb-3" />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto bg-slate-600 flex items-center justify-center text-4xl mb-3">👤</div>
                      )}
                      <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{profile.age} ans • {getGenderLabel(profile.gender)}</p>
                      <p className="text-pink-400 font-semibold">{getCreativeTypeLabel(profile.creative_type)}</p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(profile);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Heart size={20} />
                      Like en retour !
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePass(profile);
                      }}
                      className="w-full mt-2 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      Pas intéressé
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
          <div className="bg-slate-800 border border-pink-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-pink-500/30 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">Profil Détaillé</h2>
              <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
                <X size={24} className="text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Photo + Infos principales */}
              <div className="text-center">
                {selectedProfile.photo_url ? (
                  <img src={selectedProfile.photo_url} alt={selectedProfile.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-pink-500 mb-4" />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-6xl mb-4">👤</div>
                )}
                <h2 className="text-3xl font-bold text-white mb-2">{selectedProfile.name}</h2>
                <p className="text-gray-300 text-lg mb-4">
                  {selectedProfile.age} ans • {getGenderLabel(selectedProfile.gender)} • {getCityLabel(selectedProfile.city)}
                </p>
                <p className="text-pink-400 font-bold text-xl">{getCreativeTypeLabel(selectedProfile.creative_type)}</p>
              </div>

              {/* Bio */}
              {selectedProfile.bio && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Bio</h3>
                  <p className="text-gray-300 bg-slate-700/50 rounded-xl p-4">{selectedProfile.bio}</p>
                </div>
              )}

              {/* Boutons Like / Pas intéressé */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onLike(selectedProfile);
                    setSelectedProfile(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Heart size={20} />
                  Like en retour !
                </button>
                
                <button
                  onClick={() => handlePass(selectedProfile)}
                  className="w-full py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Pas intéressé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

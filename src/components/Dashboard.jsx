import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getTopMatches, getCompatibilityLevel } from '../lib/matching';
import { Logo } from './Logo';
import { MessageNotification } from './MessageNotification';
import { ProfileEdit } from './ProfileEdit';
import { MatchModal } from './MatchModal';
import { Chat } from './Chat';
import { ConversationsList } from './ConversationsList';
import { LogOut, User, X, Heart, XCircle, MessageCircle, Star } from 'lucide-react';
import { Filters } from './Filters';
import { LikesReceived } from './LikesReceived';
import { Favorites } from './Favorites';
import { PhotoCarousel } from './PhotoCarousel';
export const Dashboard = ({ user, userProfile, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(userProfile);
  const [mutualMatches, setMutualMatches] = useState([]);
  const [mutualMatchProfiles, setMutualMatchProfiles] = useState([]);
  const [matchModalData, setMatchModalData] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLikesReceived, setShowLikesReceived] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unviewedLikesCount, setUnviewedLikesCount] = useState(0);
  const [filters, setFilters] = useState({});
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadMatches();
    loadUnreadCount();
    loadUnviewedLikesCount();
    loadFavoritesCount();
    loadFavorites();
    const unsubscribe = subscribeToNewMessages();
    const unsubscribeLikes = subscribeToNewLikes();
  return () => { if (unsubscribe) unsubscribe(); if (unsubscribeLikes) unsubscribeLikes(); };
  }, []);

  // Charger les photos du user actuel
  useEffect(() => {
    const loadCurrentUserPhotos = async () => {
      const { data: photos } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .order('position');
      
      if (photos && photos.length > 0) {
        setCurrentUserProfile({ ...userProfile, photos, photo_url: photos[0].photo_url });
      }
    };
    
    loadCurrentUserPhotos();
  }, []);

  useEffect(() => {
    if (mutualMatches.length > 0) {
      loadMutualMatchProfiles();
    }
  }, [mutualMatches]);

  const loadMutualMatchProfiles = async () => {
    console.log("🔥 LOADING MUTUAL MATCH PROFILES, mutualMatches:", mutualMatches);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", mutualMatches);
    setMutualMatchProfiles(data || []);

    // Charger les photos pour chaque match
    for (let profile of data || []) {
      const { data: photos } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('position');
      
      profile.photos = photos || [];
    }
    console.log("🎨 SET TO STATE:", data || []);
    setMutualMatchProfiles(data || []);
  };

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('favorited_user_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data.map(f => f.favorited_user_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${currentUserProfile.user_id},user2_id.eq.${currentUserProfile.user_id}`);

      if (convError) throw convError;

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = conversations.map(c => c.id);

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadUnviewedLikesCount = async () => {
    try {
      // Récupère les user_id qui t'ont liké
      const { data: receivedLikes, error: likesError } = await supabase
        .from('swipes')
        .select('user_id')
        .eq('swiped_user_id', user.id)
        .eq('is_like', true)
        .eq('viewed', false);

      if (likesError) throw likesError;

      const likerIds = receivedLikes.map(like => like.user_id);

      if (likerIds.length === 0) {
        setUnviewedLikesCount(0);
        return;
      }

      // Récupère les user_id que tu as déjà liké
      const { data: myLikes, error: myLikesError } = await supabase
        .from('swipes')
        .select('swiped_user_id')
        .eq('user_id', user.id)
        ;

      if (myLikesError) throw myLikesError;

      const myLikedIds = myLikes.map(l => l.swiped_user_id);

      // Compte seulement ceux que tu n'as pas encore liké
      const pendingLikes = likerIds.filter(id => !myLikedIds.includes(id));
      setUnviewedLikesCount(pendingLikes.length);
    } catch (error) {
      console.error('Error loading unviewed likes count:', error);
    }
  };

  const loadFavoritesCount = async () => {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setFavoritesCount(count || 0);
    } catch (error) {
      console.error('Error loading favorites count:', error);
    }
  };


  const subscribeToNewMessages = () => {
    const channel = supabase
      .channel('new-messages')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (payload.new.sender_id !== user.id) {
            const { data: conversation } = await supabase
              .from('conversations')
              .select('id')
              .eq('id', payload.new.conversation_id)
              .or(`user1_id.eq.${currentUserProfile.user_id},user2_id.eq.${currentUserProfile.user_id}`)
              .single();

            if (conversation) {
              
              // Récupérer le nom du sender
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('name')
                .eq('user_id', payload.new.sender_id)
                .single();
              
              if (senderProfile) {
                const notifId = Date.now();
                setNotifications(prev => [...prev, { 
                  id: notifId, 
                  sender: senderProfile.name, message: payload.new.content, senderId: payload.new.sender_id 
              }]);
              }
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  };

  const subscribeToNewLikes = () => {
    const channel = supabase
      .channel('new-likes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `swiped_user_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.new.is_like) {
            const { data: likerProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', payload.new.user_id)
              .single();
            
            if (likerProfile) {
              const notifId = Date.now();
              setNotifications(prev => [...prev, {
                id: notifId,
                sender: likerProfile.name,
                message: `${likerProfile.name} t'a liké ! 💖`,
                senderId: payload.new.user_id
              }]);
            }
            
            setUnviewedLikesCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  };

  const loadMatches = async () => {
    try {
      console.log('🔍 Loading matches for user:', user.id);
      
      const { data: mySwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('swiped_user_id, is_like')
        .eq('user_id', user.id);

      if (swipesError) throw swipesError;

      const swipedIds = mySwipes.map(s => s.swiped_user_id);
      console.log('📋 Already swiped:', swipedIds);

      const { data: theirSwipes, error: mutualError } = await supabase
        .from('swipes')
        .select('user_id')
        .eq('swiped_user_id', user.id)
        .eq('is_like', true);

      if (mutualError) throw mutualError;

      const mutualIds = theirSwipes
        .filter(swipe => mySwipes.some(mySwipe => mySwipe.swiped_user_id === swipe.user_id && mySwipe.is_like))
        .map(swipe => swipe.user_id);

      setMutualMatches(mutualIds);
      console.log("🎯 MUTUAL MATCHES FOUND:", mutualIds);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_complete', true)
        .neq('user_id', user.id);

      if (error) throw error;

      console.log('🔥 PROFILES RETURNED:', data);
      console.log('🔥 PROFILES LENGTH:', data?.length);

      const unswipedProfiles = data.filter(profile => !swipedIds.includes(profile.user_id));
      
      console.log('✅ UNSWIPED PROFILES:', unswipedProfiles.length);
      console.log('🐛 DEBUG currentUserProfile:', currentUserProfile);
      console.log('🐛 DEBUG currentUserProfile.city:', currentUserProfile.city);
      console.log('🐛 DEBUG unswipedProfiles:', unswipedProfiles.map(p => ({ name: p.name, city: p.city })));


      // Charger les photos pour chaque profil
      for (let profile of unswipedProfiles) {
        const { data: photos } = await supabase
          .from('profile_photos')
          .select('*')
          .eq('user_id', profile.user_id)
          .order('position');
        
        profile.photos = photos || [];
      }
      const topMatches = getTopMatches(currentUserProfile, unswipedProfiles);
      console.log('🎯 TOP MATCHES:', topMatches.length);
      
      setMatches(topMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (likedUserId) => {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({ user_id: user.id, swiped_user_id: likedUserId, is_like: true });

      if (error) throw error;

      const { data: theyLikedMe, error: checkError } = await supabase
        .from('swipes')
        .select('*')
        .eq('user_id', likedUserId)
        .eq('swiped_user_id', user.id)
        .eq('is_like', true)
        .single();

      if (theyLikedMe) {
        const matchedUser = matches.find(m => m.user_id === likedUserId);
        setMatchModalData({
          currentUser: currentUserProfile,
          matchedUser: matchedUser
        });
        setMutualMatches([...mutualMatches, likedUserId]);
      }

      setMatches(matches.filter(m => m.user_id !== likedUserId));
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  const handlePass = async (passedUserId) => {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({ user_id: user.id, swiped_user_id: passedUserId, is_like: false });

      if (error) throw error;

      setMatches(matches.filter(m => m.user_id !== passedUserId));
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error passing user:', error);
    }
  };

  const openChatWithMatch = async (matchedUser) => {
    setChatUser(matchedUser);
    setMatchModalData(null);
    setSelectedMatch(null);
    setShowConversations(false);

    const user1 = user.id < matchedUser.user_id ? user.id : matchedUser.user_id;
    const user2 = user.id < matchedUser.user_id ? matchedUser.user_id : user.id;

    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('user1_id', user1)
      .eq('user2_id', user2)
      .maybeSingle();

    if (conversation) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user.id);

      await loadUnreadCount();
    loadUnviewedLikesCount();
    loadFavoritesCount();
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

  const getProductiveTimeLabel = (time) => {
    const labels = { early: 'Matinal (6-10h)', day: 'Après-midi (12-18h)', late: 'Soirée (18h-minuit)', night: 'Noctambule (minuit-6h)' };
    return labels[time] || time;
  };

  const getReligionLabel = (religion) => {
    const labels = { none: 'Aucune préférence', muslim: 'Musulman', christian: 'Chrétien', jewish: 'Juif', vegetarian_vegan: 'Végan/Végétarien', spiritual: 'Spirituel', secular: 'Laïc' };
    return labels[religion] || religion;
  };

  const isMutualMatch = (matchId) => mutualMatches.includes(matchId);

  const applyFilters = (matchesList) => {
    if (Object.keys(filters).length === 0) return matchesList;
    return matchesList.filter(match => {
      if (filters.budgetMin && match.budget_min < parseInt(filters.budgetMin)) return false;
      if (filters.budgetMax && match.budget_max > parseInt(filters.budgetMax)) return false;
      if (filters.ageMin && match.age < parseInt(filters.ageMin)) return false;
      if (filters.ageMax && match.age > parseInt(filters.ageMax)) return false;
      console.log("🔍 FILTRE GENDER:", filters.gender, "MATCH GENDER:", match.gender);
      if (filters.gender?.length > 0 && !filters.gender.includes(match.gender)) return false;
      if (filters.languages?.length > 0 && !filters.languages.some(lang => match.languages?.includes(lang))) return false;
      if (filters.creativeTypes?.length > 0 && !filters.creativeTypes.includes(match.creative_type)) return false;
      if (filters.seeking?.length > 0 && !filters.seeking.includes(match.seeking)) return false;
      if (filters.productiveTimes?.length > 0 && !filters.productiveTimes.includes(match.productive_time)) return false;
      if (filters.religion?.length > 0 && !filters.religion.includes(match.religious_practice)) return false;
      if (match.cleanliness < filters.minCleanliness) return false;
      if (filters.smoking !== null && match.smoking !== filters.smoking) return false;
      if (filters.pets !== null && match.pets !== filters.pets) return false;
      return true;
    });
  };

  const filteredMatches = applyFilters(matches);

  const handleUnmatch = async (unmatchedUserId) => {
    if (!confirm('Es-tu sûr de vouloir unmatch ? La conversation sera supprimée définitivement.')) {
      return;
    }

    try {
      console.log('🔥 UNMATCH START');
      
      const { error: rpcError } = await supabase.rpc('unmatch_users', {
        current_user_id: user.id,
        other_user_id: unmatchedUserId
      });

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError);
        alert('Erreur: ' + rpcError.message);
        return;
      }

      console.log('✅ Swipes supprimés via RPC');

      const user1 = user.id < unmatchedUserId ? user.id : unmatchedUserId;
      const user2 = user.id < unmatchedUserId ? unmatchedUserId : user.id;

      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', user1)
        .eq('user2_id', user2)
        .maybeSingle();

      if (conversation) {
        await supabase.from('messages').delete().eq('conversation_id', conversation.id);
        await supabase.from('conversations').delete().eq('id', conversation.id);
      }

      console.log('🎉 UNMATCH TERMINÉ - Reload...');
      window.location.reload();
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const toggleFavorite = async (profileUserId) => {
    try {
      // Vérifier si déjà en favori
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('favorited_user_id', profileUserId)
        .maybeSingle();

      if (existing) {
        // Retirer des favoris
        await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);
        setFavoritesCount(prev => prev - 1);
        setFavorites(prev => prev.filter(id => id !== profileUserId));
      } else {
        // Ajouter aux favoris
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, favorited_user_id: profileUserId });
        setFavoritesCount(prev => prev + 1);
        setFavorites(prev => [...prev, profileUserId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = async (profileUserId) => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('favorited_user_id', profileUserId)
      .maybeSingle();
    return !!data;
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-pink-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">CoVibe</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowLikesReceived(true)} className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl transition-all">
              <Heart size={20} />
              <span className="hidden sm:inline">Likes</span>
              {unviewedLikesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                  {unviewedLikesCount > 9 ? '9+' : unviewedLikesCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowFavorites(true)} className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl transition-all">
              <Star size={20} />
              <span className="hidden sm:inline">Favoris</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowConversations(true)} className="relative flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all">
              <MessageCircle size={20} />
              <span className="hidden sm:inline">Messages</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all">
              <User size={20} />
              <span className="hidden sm:inline">Mon Profil</span>
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all">
              <LogOut size={20} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Tes Matches 🔥</h2>
          <p className="text-gray-300">
            {filteredMatches.length > 0 ? `${filteredMatches.length} coloc${filteredMatches.length > 1 ? 's' : ''} compatible${filteredMatches.length > 1 ? 's' : ''} à découvrir à ${getCityLabel(currentUserProfile.city)}` : `Tu as vu tous les profils disponibles ! Reviens plus tard pour de nouveaux membres.`}
          </p>
        </div>
        {/* Filtres de recherche */}
        <Filters onFilterChange={setFilters} />
        {/* Rangée de bulles photos */}
        {mutualMatchProfiles.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {mutualMatchProfiles.map((match) => (
                <div
                  key={match.user_id}
                  className="flex-shrink-0 text-center relative"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(match.user_id);
                    }}
                    className="absolute -top-1 -left-1 p-1.5 bg-slate-800/80 hover:bg-yellow-500/20 rounded-full transition-all z-10"
                    title="Ajouter aux favoris"
                  >
                    <Star size={16} className={favorites.includes(match.user_id) ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"} />
                  </button>
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="hover:scale-105 transition-transform"
                  >
                    {match.photo_url ? (
                      <img
                        src={match.photo_url}
                        alt={match.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-pink-500 mb-2"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl border-4 border-pink-500 mb-2">
                        👤
                      </div>
                    )}
                    <p className="text-white text-sm font-semibold max-w-[80px] truncate">{match.name}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-white text-xl font-semibold">Recherche de matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-pink-500/30">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">Tu as tout vu !</h3>
            <p className="text-gray-300">Tu as swipé tous les profils disponibles. Reviens plus tard pour de nouveaux membres !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => {
              const { level, color, emoji } = getCompatibilityLevel(match.compatibility);
              const mutual = isMutualMatch(match.user_id);
              
              return (
                <div key={match.user_id} onClick={() => setSelectedMatch(match)} className="bg-slate-800/50 backdrop-blur-lg border border-pink-500/30 rounded-2xl p-6 hover:border-pink-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-pink-500/20">
                  <div className="mb-4 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(match.user_id);
                      }}
                      className="absolute top-2 left-2 p-2 bg-slate-800/80 hover:bg-yellow-500/20 rounded-full transition-all z-10"
                      title="Ajouter aux favoris"
                    >
                      <Star size={20} className={favorites.includes(match.user_id) ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"} />
                    </button>
                    {match.photo_url ? (
                      <img src={match.photo_url} alt={match.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-pink-500" />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-4xl">👤</div>
                    )}
                    {mutual && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ✨ MATCH!
                      </div>
                    )}
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">{match.name} {match.verified && <span className="inline-flex items-center justify-center w-5 h-5 bg-pink-500 rounded-full text-white text-xs font-bold">✓</span>}</h3>
                    <p className="text-gray-400 text-sm mb-2">{match.age} ans • {getGenderLabel(match.gender)}</p>
                    <p className="text-pink-400 font-semibold">{getCreativeTypeLabel(match.creative_type)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Compatibilité</span>
                      <span className={`text-2xl font-bold ${color}`}>{match.compatibility}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{emoji}</span>
                      <span className={`font-semibold ${color}`}>{level}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span>⏰</span>
                      <span>{getProductiveTimeLabel(match.productive_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span>💰</span>
                      <span>{match.budget_min}$ - {match.budget_max}$</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    {mutual ? 'Ouvrir le chat 💬' : 'Voir le profil →'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 border border-pink-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-pink-500/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Profil Détaillé</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(selectedMatch.user_id);
                }}
                className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl transition-all"
                title="Ajouter aux favoris"
              >
                <Star size={24} className={favorites.includes(selectedMatch.user_id) ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"} />
              </button>
              <button onClick={() => setSelectedMatch(null)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
                <X size={24} className="text-gray-300" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <PhotoCarousel photos={selectedMatch.photos || [selectedMatch.photo_url]} name={selectedMatch.name} />
                <h3 className="text-3xl font-bold text-white mb-2">{selectedMatch.name}</h3>
                <p className="text-gray-400 mb-2">{selectedMatch.age} ans • {getGenderLabel(selectedMatch.gender)} • {getCityLabel(selectedMatch.city)}</p>
                <p className="text-pink-400 font-semibold text-lg">{getCreativeTypeLabel(selectedMatch.creative_type)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-6">
                <div className="text-center">
                  <p className="text-gray-300 mb-2">Compatibilité</p>
                  <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">{selectedMatch.compatibility}%</div>
                  <p className={`text-xl font-semibold ${getCompatibilityLevel(selectedMatch.compatibility).color}`}>{getCompatibilityLevel(selectedMatch.compatibility).emoji} {getCompatibilityLevel(selectedMatch.compatibility).level}</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Bio</h4>
                <p className="text-gray-300 bg-slate-700/50 rounded-xl p-4">{selectedMatch.bio}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">Recherche</h4>
                <div className="flex gap-2">
                  <span className="px-4 py-2 bg-pink-500/20 border border-pink-500/50 rounded-xl text-pink-400 text-sm">
                    ✓ {selectedMatch.seeking === 'room' ? 'Cherche coloc' : 'Cherche studio'}
                  </span>
                  <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-xl text-purple-400 text-sm">
                    🎨 {selectedMatch.seeking === 'room' ? 'Cherche studio' : 'Cherche coloc'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">💰 Budget</h4>
                <p className="text-gray-300 bg-slate-700/50 rounded-xl p-4">
                  {selectedMatch.budget_min}$ - {selectedMatch.budget_max}$ CAD/mois
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">Préférences</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Tabac</p>
                    <p className="text-white font-semibold">{selectedMatch.smoking ? '🚬 Oui' : '🚭 Non'}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Animaux</p>
                    <p className="text-white font-semibold">{selectedMatch.pets ? '✅ OK' : '❌ Non'}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Propreté</p>
                    <p className="text-white font-semibold">{selectedMatch.cleanliness}/5</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Tolérance bruit</p>
                    <p className="text-white font-semibold">{selectedMatch.noise_tolerance}/10</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Fréquence invités</p>
                    <p className="text-white font-semibold">{selectedMatch.guest_frequency}/5</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Horaires</p>
                    <p className="text-white font-semibold">{getProductiveTimeLabel(selectedMatch.productive_time)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 col-span-2">
                    <p className="text-gray-400 mb-1">Pratiques alimentaires/religieuses</p>
                    <p className="text-white font-semibold">{getReligionLabel(selectedMatch.religious_practice)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 col-span-2">
                    <p className="text-gray-400 mb-1">Substances</p>
                    <p className="text-white font-semibold">{selectedMatch.substances || 'Non précisé'}</p>
                  </div>
                </div>
              </div>

              {isMutualMatch(selectedMatch.user_id) ? (
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/50 rounded-xl p-6 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-white font-bold mb-2">C'est un match !</p>
                  <p className="text-gray-300 mb-4">Vous vous êtes likés mutuellement</p>
                  <button onClick={() => openChatWithMatch(selectedMatch)} className="flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    <MessageCircle size={24} />
                    Envoyer un message
                  </button>
                  <button onClick={() => handleUnmatch(selectedMatch.user_id)} className="flex items-center justify-center gap-3 w-full py-3 mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-xl font-bold transition-all">
                    <XCircle size={20} />
                    Unmatch
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/50 rounded-xl p-6">
                  <p className="text-white text-center mb-4">Que penses-tu de {selectedMatch.name.split(' ')[0]} ?</p>
                  <div className="flex gap-4">
                    <button onClick={() => handlePass(selectedMatch.user_id)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all">
                      <XCircle size={24} />
                      Passer
                    </button>
                    <button onClick={() => handleLike(selectedMatch.user_id)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                      <Heart size={24} />
                      Like
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showProfile && !showEditProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 border border-pink-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-pink-500/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Mon Profil</h2>
              <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
                <X size={24} className="text-gray-300" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                {currentUserProfile.photo_url ? (
                  <img src={currentUserProfile.photo_url} alt={currentUserProfile.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-pink-500 mb-4" />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-6xl mb-4">👤</div>
                )}
                <h3 className="text-3xl font-bold text-white mb-2">{currentUserProfile.name}</h3>
                <p className="text-gray-400 mb-2">{currentUserProfile.age} ans • {getGenderLabel(currentUserProfile.gender)} • {getCityLabel(currentUserProfile.city)}</p>
                <p className="text-pink-400 font-semibold text-lg">{getCreativeTypeLabel(currentUserProfile.creative_type)}</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Bio</h4>
                <p className="text-gray-300 bg-slate-700/50 rounded-xl p-4">{currentUserProfile.bio}</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Mes Préférences</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Horaires</p>
                    <p className="text-white font-semibold">{getProductiveTimeLabel(currentUserProfile.productive_time)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Propreté</p>
                    <p className="text-white font-semibold">{currentUserProfile.cleanliness}/5</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Budget</p>
                    <p className="text-white font-semibold">{currentUserProfile.budget_min}$ - {currentUserProfile.budget_max}$</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">Pratiques</p>
                    <p className="text-white font-semibold">{getReligionLabel(currentUserProfile.religious_practice)}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowEditProfile(true)} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">✏️ Modifier mon profil</button>
              <button onClick={() => setShowDeleteAccount(true)} className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-all mt-3">🗑️ Supprimer mon profil</button>
            </div>
          </div>
        </div>
      )}

      {showEditProfile && (
        <ProfileEdit userProfile={currentUserProfile} onSave={(updatedProfile) => { setCurrentUserProfile(updatedProfile); setShowEditProfile(false); setShowProfile(false); }} onCancel={() => setShowEditProfile(false)} />
      )}

      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-500/30">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">😢 Supprimer mon profil</h2>
              <button onClick={() => setShowDeleteAccount(false)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
                <X size={24} className="text-gray-300" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-xl text-white mb-2">Nous sommes tristes de vous voir partir 💔</p>
                <p className="text-gray-400">Pour nous aider à améliorer CoVibe, pouvez-vous nous dire pourquoi vous partez ?</p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Sélectionnez une ou plusieurs raisons :</h3>
                <div className="space-y-2">
                  {[
                    { id: 'not_ready', label: "Je ne suis pas prêt·e à chercher une coloc" },
                    { id: 'too_complicated', label: "L'application est trop compliquée" },
                    { id: 'no_matches', label: "Je n'ai pas trouvé de match" },
                    { id: 'found_roommate', label: "J'ai trouvé une coloc ailleurs" },
                    { id: 'too_many_options', label: "Trop de profils à swiper" },
                    { id: 'privacy_concerns', label: "Préoccupations sur la confidentialité" },
                    { id: 'other', label: "Autre raison" }
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        const isSelected = btn.classList.contains('bg-red-500');
                        if (isSelected) {
                          btn.classList.remove('bg-red-500', 'text-white', 'border-red-500');
                          btn.classList.add('bg-slate-700', 'text-gray-300', 'border-slate-600');
                        } else {
                          btn.classList.remove('bg-slate-700', 'text-gray-300', 'border-slate-600');
                          btn.classList.add('bg-red-500', 'text-white', 'border-red-500');
                        }
                        btn.setAttribute('data-selected', isSelected ? 'false' : 'true');
                      }}
                      data-reason={id}
                      data-selected="false"
                      className="w-full px-4 py-3 bg-slate-700 text-gray-300 border border-slate-600 rounded-xl font-semibold transition-all hover:bg-slate-600 text-left"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 font-semibold mb-2">⚠️ Attention !</p>
                <p className="text-gray-300 text-sm">
                  Cette action est <strong>irréversible</strong>. Toutes vos données (profil, messages, matches) seront définitivement supprimées.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Êtes-vous absolument sûr·e de vouloir supprimer votre compte ?")) return;

                    try {
                      const selectedButtons = document.querySelectorAll('[data-reason][data-selected="true"]');
                      const selectedReasons = Array.from(selectedButtons).map(btn => btn.getAttribute('data-reason'));

                      if (selectedReasons.length === 0) {
                        alert("Merci de sélectionner au moins une raison avant de continuer.");
                        return;
                      }

                      await supabase.from('deletion_feedback').insert({
                        user_id: currentUserProfile.user_id,
                        reasons: selectedReasons
                      });

                      await supabase.from('messages').delete().or('sender_id.eq.' + currentUserProfile.user_id + ',receiver_id.eq.' + currentUserProfile.user_id);
                      await supabase.from('swipes').delete().or('user_id.eq.' + currentUserProfile.user_id + ',swiped_user_id.eq.' + currentUserProfile.user_id);
                      await supabase.from('conversations').delete().or('user1_id.eq.' + currentUserProfile.user_id + ',user2_id.eq.' + currentUserProfile.user_id);
                      await supabase.from('favorites').delete().or('user_id.eq.' + currentUserProfile.user_id + ',favorited_user_id.eq.' + currentUserProfile.user_id);

                      const { data: photos } = await supabase.from('profile_photos').select('photo_url').eq('user_id', currentUserProfile.user_id);
                      if (photos && photos.length > 0) {
                        for (const photo of photos) {
                          const path = photo.photo_url.split('/profile-photos/')[1];
                          if (path) await supabase.storage.from('profile-photos').remove([path]);
                        }
                      }

                      await supabase.from('profile_photos').delete().eq('user_id', currentUserProfile.user_id);
                      await supabase.from('profiles').delete().eq('user_id', currentUserProfile.user_id);

                      // Supprimer le compte auth
                      await supabase.rpc('delete_user_account', { target_user_id: currentUserProfile.user_id });

                      alert("Votre compte a été supprimé. Nous espérons vous revoir bientôt ! 👋");
                      await supabase.auth.signOut();
                      window.location.href = '/';

                    } catch (error) {
                      console.error('Erreur lors de la suppression:', error);
                      alert("Une erreur s'est produite. Veuillez réessayer ou contacter le support.");
                    }
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      )}

      {showConversations && (
        <ConversationsList
          currentUser={currentUserProfile}
          onClose={() => setShowConversations(false)}
          onOpenChat={openChatWithMatch}
        />
      )}

      {matchModalData && (
        <MatchModal
          currentUser={matchModalData.currentUser}
          matchedUser={matchModalData.matchedUser}
          onClose={() => setMatchModalData(null)}
          onOpenChat={() => openChatWithMatch(matchModalData.matchedUser)}
        />
      )}

      {chatUser && (
        <Chat
          currentUser={currentUserProfile}
          matchedUser={chatUser}
          onUnmatch={handleUnmatch}
          onClose={() => {
            setChatUser(null);
            loadUnreadCount();
    loadUnviewedLikesCount();
    loadFavoritesCount();
          }}
        />
      )}
      {showLikesReceived && (
        <LikesReceived
          currentUser={currentUserProfile}
          onClose={() => setShowLikesReceived(false)}
          onViewLikes={() => { setUnviewedLikesCount(0); }}
          onLike={async (profile) => {
            await handleLike(profile.user_id);
            setShowLikesReceived(false);
          }}
        />
      )}

      {showFavorites && (
        <Favorites
          currentUser={currentUserProfile}
          onClose={() => setShowFavorites(false)}
          onOpenChat={openChatWithMatch}
          onLike={async (profile) => {
            await handleLike(profile.user_id);
            await loadFavoritesCount();
          }}
        />
      )}

      {notifications.map(notif => (
        <MessageNotification 
          key={notif.id}
          message={notif.message}
          onClick={async () => {
            const { data: senderProfile } = await supabase.from('profiles').select('*').eq('user_id', notif.senderId).single();
            if (senderProfile) openChatWithMatch(senderProfile);
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
          }}
          sender={notif.sender}
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
        />
      ))}
    </div>
  );
};

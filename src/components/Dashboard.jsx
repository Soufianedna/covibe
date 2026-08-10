import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { supabase } from '../lib/supabase';
import { getTopMatches, getCompatibilityLevel, calculateCompatibility } from '../lib/matching';
import { calculateDistance, formatDistance } from '../lib/distance';
import { Logo } from './Logo';
import { MessageNotification } from './MessageNotification';
import { ProfilePage } from './ProfilePage';
import { MatchModal } from './MatchModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Chat } from './Chat';
import { ConversationsList } from './ConversationsList';
import { LogOut, User, X, Heart, XCircle, MessageCircle, Star, LayoutGrid, Layers } from 'lucide-react';
import { FilterPills } from './FilterPills';
import { LikesReceived } from './LikesReceived';
import { Favorites } from './Favorites';
import { TopVibes } from './TopVibes';
import { PhotoCarousel } from './PhotoCarousel';
import { ProfileScore } from './ProfileScore';
import SwipeView from "./SwipeView";
export const Dashboard = ({ user, userProfile, onLogout }) => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [allProfilesForSwipe, setAllProfilesForSwipe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchPropertyPhotos, setSelectedMatchPropertyPhotos] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showConversations, setShowConversations] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(userProfile);
  const [mutualMatches, setMutualMatches] = useState([]);
  const [mutualMatchProfiles, setMutualMatchProfiles] = useState([]);
  const [matchModalData, setMatchModalData] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLikesReceived, setShowLikesReceived] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "swipe"
  const [isMobile, setIsMobile] = useState(false);
  const [unviewedLikesCount, setUnviewedLikesCount] = useState(0);
  const [likerProfiles, setLikerProfiles] = useState([]);
  const [filters, setFilters] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [searchPartnerships, setSearchPartnerships] = useState([]);
  const [selectedMatchPartner, setSelectedMatchPartner] = useState(null);


  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Forcer swipe sur mobile
  useEffect(() => {
    if (isMobile) setViewMode("swipe");
  }, [isMobile]);
  useEffect(() => {
    loadMatches();
    loadUnreadCount();
    loadUnviewedLikesCount();
    loadFavoritesCount();
    loadFavorites();
    loadSearchPartnerships();
    const unsubscribe = subscribeToNewMessages();
    const unsubscribeLikes = subscribeToNewLikes();
    const unsubscribeConvDelete = subscribeToConversationDeletes();
  return () => { if (unsubscribe) unsubscribe(); if (unsubscribeLikes) unsubscribeLikes(); if (unsubscribeConvDelete) unsubscribeConvDelete(); };
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

  // Charger le profil du binôme de recherche accepté du profil actuellement affiché
  useEffect(() => {
    if (!selectedMatch) {
      setSelectedMatchPartner(null);
      return;
    }
    const partnership = getAcceptedPartnershipFor(selectedMatch.user_id);
    if (!partnership) {
      setSelectedMatchPartner(null);
      return;
    }
    const partnerId = partnership.requester_id === selectedMatch.user_id ? partnership.partner_id : partnership.requester_id;
    loadPartnerProfile(partnerId);
  }, [selectedMatch, searchPartnerships]);

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
        .select('id, user1_id, user2_id')
        .or(`user1_id.eq.${currentUserProfile.user_id},user2_id.eq.${currentUserProfile.user_id}`);
      if (conversations) {
        const otherUserIds = conversations.map(c => c.user1_id === currentUserProfile.user_id ? c.user2_id : c.user1_id);
        const { data: activeProfiles } = await supabase.from('profiles').select('user_id').in('user_id', otherUserIds);
        const activeIds = new Set((activeProfiles || []).map(p => p.user_id));
        conversations.splice(0, conversations.length, ...conversations.filter(c => {
          const otherId = c.user1_id === currentUserProfile.user_id ? c.user2_id : c.user1_id;
          return activeIds.has(otherId);
        }));
      }

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
      // Charge les profils des gens qui ont liké
      if (pendingLikes.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, photo_url')
          .in('user_id', pendingLikes);
        setLikerProfiles(profiles || []);
      } else {
        setLikerProfiles([]);
      }
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
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('name, photo_url')
                .eq('user_id', payload.new.sender_id)
                .single();
              
              // Vérifier si le match existe encore (pas unmatch)
              const { data: matchSwipe } = await supabase
                .from('swipes')
                .select('id')
                .eq('user_id', currentUserProfile.user_id)
                .eq('swiped_user_id', payload.new.sender_id)
                .eq('is_like', true)
                .maybeSingle();
              
              if (!matchSwipe) return; // Unmatch détecté, ignorer

              setChatUser(prev => {
                const chatIsOpen = prev && prev.user_id === payload.new.sender_id;
                if (!chatIsOpen && senderProfile) {
                  const notifId = Date.now();
                  setNotifications(p => [...p, { 
                    id: notifId, 
                    sender: senderProfile.name, message: payload.new.content, senderId: payload.new.sender_id, senderPhoto: senderProfile.photo_url 
                  }]);
                  setUnreadCount(p => p + 1);
                }
                return prev;
              });
            }
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  };

  const subscribeToConversationDeletes = () => {
    const channel = supabase
      .channel('conversation-deletes')
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'conversations' },
        () => {
          loadUnreadCount();
          setChatUser(null);
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
              .select('name, photo_url')
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


  const loadPropertyPhotos = async (userId) => {
    try {
      const { data } = await supabase
        .from('property_photos')
        .select('*')
        .eq('user_id', userId)
        .order('position');
      setSelectedMatchPropertyPhotos(data || []);
    } catch (error) {
      console.error('Error loading property photos:', error);
      setSelectedMatchPropertyPhotos([]);
    }
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
      
      // Pour le mode swipe : tous les profils avec scores
      const allTopMatches = getTopMatches(currentUserProfile, data);
      setAllProfilesForSwipe(allTopMatches);
      console.log("🎯 ALL PROFILES FOR SWIPE:", allTopMatches.length, allTopMatches);
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
        // Récupérer le profil complet depuis la DB au lieu de chercher dans matches
        const { data: matchedUserData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", likedUserId)
          .single();
        const matchedUser = matchedUserData;
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
    setUnreadCount(0);
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

  const getGenderLabel = (gender) => gender;
  const getCityLabel = (city) => city;
  const getCreativeTypeLabel = (type) => type;
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
  const getLanguageLabel = (l) => ({ french: 'Français', english: 'Anglais', spanish: 'Espagnol', arabic: 'Arabe', portuguese: 'Portugais', mandarin: 'Mandarin', hindi: 'Hindi', farsi: 'Farsi', cantonese: 'Cantonais', other: 'Autre' }[l] || l);
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
      if (filters.workLocation?.length > 0 && !filters.workLocation.includes(match.work_location)) return false;
      if (filters.religion?.length > 0 && !filters.religion.includes(match.religious_practice)) return false;
      if (filters.creative_space_type?.length > 0 && !filters.creative_space_type.some(t => match.creative_space_type?.includes(t))) return false;
      if (match.cleanliness < filters.minCleanliness) return false;
      if (filters.smoking !== null && match.smoking !== filters.smoking) return false;
      if (filters.pets !== null && match.pets !== filters.pets) return false;
      // Filtre par ville
      if (filters.city && match.city !== filters.city) return false;
      // Filtre de distance
      if (filters.searchRadius && currentUserProfile?.latitude && match.latitude) {
        const distance = calculateDistance(currentUserProfile.latitude, currentUserProfile.longitude, match.latitude, match.longitude);
        if (distance > filters.searchRadius) return false;
      }
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

      console.log('🎉 UNMATCH TERMINÉ');
      setChatUser(null);
      setSelectedMatch(null);
      setUnreadCount(0);
      setMutualMatches(prev => prev.filter(id => id !== unmatchedUserId));
      setMutualMatchProfiles(prev => prev.filter(p => p.user_id !== unmatchedUserId));
      await loadUnreadCount();
      await loadMatches();
      await loadMutualMatchProfiles();
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const loadSearchPartnerships = async () => {
    try {
      // On charge mes propres partnerships (peu importe le status) + tous les
      // partnerships déjà acceptés, quel qu'en soit le participant (RLS : policy
      // "Anyone can view accepted partnerships"). Ça permet de savoir si la
      // personne consultée est déjà en binôme avec quelqu'un d'autre que moi.
      const { data, error } = await supabase
        .from('search_partnerships')
        .select('*')
        .or(`status.eq.accepted,requester_id.eq.${user.id},partner_id.eq.${user.id}`);
      if (error) throw error;
      setSearchPartnerships(data || []);
    } catch (error) {
      console.error('Error loading search partnerships:', error);
    }
  };

  const getPartnershipWith = (otherUserId) => searchPartnerships.find(p =>
    (p.requester_id === user.id && p.partner_id === otherUserId) ||
    (p.requester_id === otherUserId && p.partner_id === user.id)
  );

  const hasAcceptedPartnershipElsewhere = (otherUserId) => searchPartnerships.some(p =>
    p.status === 'accepted' &&
    (p.requester_id === user.id || p.partner_id === user.id) &&
    p.requester_id !== otherUserId && p.partner_id !== otherUserId
  );

  const isUserAlreadyPartnered = (userId) => searchPartnerships.some(p =>
    p.status === 'accepted' && (p.requester_id === userId || p.partner_id === userId)
  );

  // Contrairement à getPartnershipWith (relatif à moi), celle-ci trouve le binôme
  // accepté de N'IMPORTE QUEL profil consulté (utile pour afficher "cherche avec X").
  const getAcceptedPartnershipFor = (userId) => searchPartnerships.find(p =>
    p.status === 'accepted' && (p.requester_id === userId || p.partner_id === userId)
  );

  const loadPartnerProfile = async (partnerId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', partnerId)
        .maybeSingle();
      if (error) throw error;
      setSelectedMatchPartner(data || null);
    } catch (error) {
      console.error('Error loading partner profile:', error);
      setSelectedMatchPartner(null);
    }
  };

  const handleSendPartnershipInvite = async (partnerId) => {
    try {
      const { error } = await supabase
        .from('search_partnerships')
        .insert({ requester_id: user.id, partner_id: partnerId, status: 'pending' });
      if (error) throw error;
      await loadSearchPartnerships();
    } catch (error) {
      console.error('Error sending search partnership invite:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleAcceptPartnership = async (partnership) => {
    try {
      const { error } = await supabase
        .from('search_partnerships')
        .update({ status: 'accepted' })
        .eq('id', partnership.id);
      if (error) throw error;

      const otherId = partnership.requester_id === user.id ? partnership.partner_id : partnership.requester_id;

      // Nettoyage intentionnel : accepter un binôme annule automatiquement toutes
      // les autres invitations en attente impliquant l'un des deux membres du
      // nouveau binôme (moi ou l'autre personne), qu'ils y soient requester ou
      // partner. Les invitations pending entre deux tiers qui ne nous concernent
      // pas ne sont pas touchées.
      await supabase
        .from('search_partnerships')
        .delete()
        .eq('status', 'pending')
        .or(`requester_id.eq.${user.id},partner_id.eq.${user.id},requester_id.eq.${otherId},partner_id.eq.${otherId}`);

      await loadSearchPartnerships();
    } catch (error) {
      console.error('Error accepting search partnership:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleLeavePartnership = async (partnership) => {
    if (!confirm('Es-tu sûr de vouloir quitter ce binôme de recherche ?')) return;
    try {
      const { error } = await supabase
        .from('search_partnerships')
        .delete()
        .eq('id', partnership.id);
      if (error) throw error;
      await loadSearchPartnerships();
    } catch (error) {
      console.error('Error leaving search partnership:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleDeclinePartnership = async (partnership) => {
    try {
      const { error } = await supabase
        .from('search_partnerships')
        .delete()
        .eq('id', partnership.id);
      if (error) throw error;
      await loadSearchPartnerships();
    } catch (error) {
      console.error('Error declining search partnership:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleToggleFlexible = async (partnership) => {
    try {
      const { error } = await supabase
        .from('search_partnerships')
        .update({ is_flexible: !partnership.is_flexible })
        .eq('id', partnership.id);
      if (error) throw error;
      await loadSearchPartnerships();
    } catch (error) {
      console.error('Error toggling partnership flexibility:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const renderPartnershipButton = (match) => {
    const partnership = getPartnershipWith(match.user_id);

    if (partnership?.status === 'accepted') {
      return (
        <div className="mt-3">
          <div className="py-2 px-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400/90 text-xs font-semibold rounded-lg text-center">
            🤝 Vous cherchez ensemble
          </div>
          <button
            onClick={() => handleToggleFlexible(partnership)}
            className="w-full flex items-center justify-center gap-2 mt-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-all"
          >
            <div className={`w-8 h-4 rounded-full transition-all ${partnership.is_flexible ? 'bg-cyan-500/40' : 'bg-slate-600'}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all mt-0.5 ${partnership.is_flexible ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span>{partnership.is_flexible ? 'Ouverts aussi à une place seule' : 'Cherchent ensemble · 2 chambres'}</span>
          </button>
        </div>
      );
    }

    if (partnership?.status === 'pending' && partnership.requester_id === user.id) {
      return (
        <button disabled className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 bg-slate-600/30 text-gray-400 border border-slate-500/30 rounded-xl text-sm font-semibold cursor-not-allowed">
          ⏳ Invitation envoyée
        </button>
      );
    }

    if (partnership?.status === 'pending' && partnership.partner_id === user.id) {
      return (
        <button onClick={() => handleAcceptPartnership(partnership)} className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-semibold transition-all">
          ✅ Accepter de chercher ensemble
        </button>
      );
    }

    if (hasAcceptedPartnershipElsewhere(match.user_id)) {
      return (
        <button disabled className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 bg-slate-600/30 text-gray-400 border border-slate-500/30 rounded-xl text-sm font-semibold cursor-not-allowed">
          Tu es déjà en binôme
        </button>
      );
    }

    if (isUserAlreadyPartnered(match.user_id)) {
      return (
        <button disabled className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 bg-slate-600/30 text-gray-400 border border-slate-500/30 rounded-xl text-sm font-semibold cursor-not-allowed">
          Déjà en binôme
        </button>
      );
    }

    return (
      <button onClick={() => handleSendPartnershipInvite(match.user_id)} className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-semibold transition-all">
        🤝 Chercher ensemble
      </button>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* {t('filters')} */}
        <FilterPills onFilterChange={setFilters} hasSpace={currentUserProfile?.has_space} />
                {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-white text-xl font-semibold">{ t('searchingMatches') }</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-violet-500/30">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">{ t('allProfilesSeen') }</h3>
            <p className="text-gray-300">{ t('checkBackLater') }</p>
          </div>
        ) : viewMode === "swipe" ? (
          <SwipeView
            profiles={filteredMatches}
            currentUser={currentUserProfile}
            onSwipe={async (profile, action) => {
              if (action === "like") {
                await handleLike(profile.user_id);
              } else if (action === "pass") {
                await handlePass(profile.user_id);
              } else if (action === "favorite") {
                await toggleFavorite(profile.user_id);
              }
            }}
            onViewProfile={async (profile) => {
              const { data: fullProfile } = await supabase.from('profiles').select('*').eq('user_id', profile.user_id).single();
              const profileWithScore = { ...(fullProfile || profile), compatibility: profile.compatibility || calculateCompatibility(currentUserProfile, fullProfile || profile) };
              setSelectedMatch(profileWithScore);
              if (profile.has_space) loadPropertyPhotos(profile.user_id);
            }}
            onMatch={(profile) => {}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => {
              const { levelKey, color, emoji } = getCompatibilityLevel(match.compatibility);
              const mutual = isMutualMatch(match.user_id);
              
              return (
                <div key={match.user_id} onClick={() => { setSelectedMatch(match); if (match.has_space) loadPropertyPhotos(match.user_id); }} className="bg-slate-800/50 backdrop-blur-lg border border-violet-500/30 rounded-2xl p-6 hover:border-violet-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-violet-500/20">
                  <div className="mb-4 relative text-center">

                    {match.photo_url ? (
                      <LazyLoadImage effect="blur" src={match.photo_url} alt={match.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-violet-500" />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-4xl">👤</div>
                    )}
                    {mutual && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ✨ MATCH!
                      </div>
                    )}
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">{match.name} {match.verified && <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-500 rounded-full text-white text-xs font-bold">✓</span>}</h3>
                    <div className="text-center mb-2">
                    {match.has_space && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-xs font-bold rounded-full">
                          {t('hasSpace')}
                        </span>
                      </div>
                    )}
                    {!match.has_space && match.open_to_group_search && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full">
                          🤝 {t('seekingTogether')}
                        </span>
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">
                      {match.age} ans • {t(getGenderLabel(match.gender))}
                      {currentUserProfile?.latitude && match.latitude && (
                        <> • 📍 À {formatDistance(calculateDistance(currentUserProfile.latitude, currentUserProfile.longitude, match.latitude, match.longitude))} de toi</>
                      )}
                    </p>
                    </div>
                    <p className="text-violet-400 font-semibold">{t(getCreativeTypeLabel(match.creative_type))}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">{t('compatibility')}</span>
                      <span className={`text-2xl font-bold ${color}`}>{match.compatibility}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{emoji}</span>
                      <span className={`font-semibold ${color}`}>{t(levelKey)}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span>⏰</span>
                      <span>{t(getProductiveTimeLabel(match.productive_time))}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span>💰</span>
                      <span>{match.has_space ? `${t('roomPriceLabel')} ${match.room_price}$/mois` : `${match.budget_min}$ - ${match.budget_max}$`}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    {mutual ? t('openChat') : t('viewProfile')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <div className="bg-slate-800 border border-violet-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-violet-500/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{t('detailedProfile')}</h2>

              <button onClick={() => setSelectedMatch(null)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
                <X size={24} className="text-gray-300" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <PhotoCarousel photos={(selectedMatch.photos && selectedMatch.photos.length > 0 ? selectedMatch.photos : [selectedMatch.photo_url])} name={selectedMatch.name} />
                <h3 className="text-3xl font-bold text-white mb-2">{selectedMatch.name}</h3>
                <p className="text-gray-400 mb-2">
                  {selectedMatch.age} ans • {t(getGenderLabel(selectedMatch.gender))} • {getCityLabel(selectedMatch.city)}
                  {currentUserProfile?.latitude && selectedMatch.latitude && (
                    <> • 📍 À {formatDistance(calculateDistance(currentUserProfile.latitude, currentUserProfile.longitude, selectedMatch.latitude, selectedMatch.longitude))} de toi</>
                  )}
                </p>
                <p className="text-violet-400 font-semibold text-lg">{t(getCreativeTypeLabel(selectedMatch.creative_type))}</p>
              </div>
              {selectedMatchPartner && (
                <div className="flex flex-col items-center gap-1 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span>🤝 cherche une coloc avec</span>
                    <button
                      onClick={() => {
                        const profileWithScore = { ...selectedMatchPartner, compatibility: calculateCompatibility(currentUserProfile, selectedMatchPartner) };
                        setSelectedMatch(profileWithScore);
                        if (selectedMatchPartner.has_space) loadPropertyPhotos(selectedMatchPartner.user_id);
                      }}
                      className="flex items-center gap-2 hover:opacity-80 transition-all"
                    >
                      {selectedMatchPartner.photo_url ? (
                        <img src={selectedMatchPartner.photo_url} alt={selectedMatchPartner.name} className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm border-2 border-cyan-400">👤</div>
                      )}
                      <span className="text-cyan-400 font-semibold">{selectedMatchPartner.name?.split(' ')[0]}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {getAcceptedPartnershipFor(selectedMatch.user_id)?.is_flexible ? 'Ouverts aussi à une place seule' : 'Cherchent ensemble · 2 chambres'}
                  </p>
                </div>
              )}
              <div className="bg-slate-700/50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <p className="text-gray-300 mb-2">{t('compatibility')}</p>
                  <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">{selectedMatch.compatibility}%</div>
                  <p className={`text-xl font-semibold ${getCompatibilityLevel(selectedMatch.compatibility).color}`}>{getCompatibilityLevel(selectedMatch.compatibility).emoji} {t(getCompatibilityLevel(selectedMatch.compatibility).levelKey)}</p>
                </div>
                <div className="space-y-3 mt-4 border-t border-slate-600 pt-4">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">{t('whyThisScore')}</p>
                  {[
                    { label: '💰 ' + t('budget'), value: currentUserProfile && selectedMatch ? (() => { const b1min = currentUserProfile.budget_min||0; const b1max = currentUserProfile.budget_max||9999; const b2min = selectedMatch.budget_min||0; const b2max = selectedMatch.budget_max||9999; const overlap = Math.min(b1max,b2max)-Math.max(b1min,b2min); return overlap>0 ? Math.round((overlap/(Math.max(b1max,b2max)-Math.min(b1min,b2min)))*30) : 0; })() : 0, max: 30 },
                    { label: '🌅 ' + t('scheduleLabel'), value: currentUserProfile?.schedule === selectedMatch?.schedule ? 20 : (currentUserProfile?.schedule && selectedMatch?.schedule ? 5 : 10), max: 20 },
                    { label: '🏠 ' + t('habits'), value: (() => { let s=0; if(currentUserProfile?.smoking === selectedMatch?.smoking) s+=8; if(currentUserProfile?.pets === selectedMatch?.pets || currentUserProfile?.pets_ok || selectedMatch?.pets_ok) s+=8; if(Math.abs((currentUserProfile?.cleanliness||3)-(selectedMatch?.cleanliness||3))<=1) s+=9; return s; })(), max: 25 },
                    { label: '🙏 ' + t('practices'), value: currentUserProfile?.religious_practice === selectedMatch?.religious_practice ? 15 : ((!currentUserProfile?.religious_practice||currentUserProfile?.religious_practice==='none') || (!selectedMatch?.religious_practice||selectedMatch?.religious_practice==='none') ? 10 : 5), max: 15 },
                    { label: '✨ ' + t('lifestyle'), value: (() => { let s=0; if(Math.abs((currentUserProfile?.noise_tolerance||5)-(selectedMatch?.noise_tolerance||5))<=2) s+=5; if(Math.abs((currentUserProfile?.guests_frequency||2)-(selectedMatch?.guests_frequency||2))<=1) s+=5; return s; })(), max: 10 },
                  ].map(({ label, value, max }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{label}</span>
                        
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-gradient-to-r from-violet-500 to-indigo-400 h-2 rounded-full transition-all" style={{width: `${(value/max)*100}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">{t('bio')}</h4>
                <p className="text-gray-300 bg-slate-700/50 rounded-xl p-4">{selectedMatch.bio}</p>
              </div>

              {/* SECTION ESPACE DISPONIBLE */}
              {selectedMatch.has_space && (
                <div className="border-t border-violet-500/30 pt-6">
                  <h4 className="text-lg font-bold text-white mb-4">🏠 {t('availableSpace')}</h4>
                  
                  {/* Prix */}
                  <div className="bg-gradient-to-r from-violet-600/20 to-indigo-500/20 border border-violet-500/30 rounded-xl p-4 mb-4">
                    <p className="text-2xl font-bold text-white text-center">
                      {selectedMatch.room_price}$ {t('perMonth')}
                    </p>
                  </div>

                  {/* Photos de l'appart */}
                  {selectedMatchPropertyPhotos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-300 mb-2">{t('propertyPhotos')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedMatchPropertyPhotos.map((photo) => (
                          <img key={photo.id} src={photo.url} alt="Property" onClick={() => setLightboxPhoto(photo.url)} className="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-all" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Type + Meublé */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {selectedMatch.property_type && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{t('propertyType')}</p>
                        <p className="text-white font-semibold">{t(selectedMatch.property_type)}</p>
                      </div>
                    )}
                    {selectedMatch.is_furnished !== null && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{t('isFurnished')}</p>
                        <p className="text-white font-semibold">{selectedMatch.is_furnished ? '✅ ' + t('furnished') : t('unfurnished')}</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedMatch.property_description && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-1">{t('propertyDescription')}</p>
                      <p className="text-gray-300 bg-slate-700/50 rounded-xl p-3 text-sm">{selectedMatch.property_description}</p>
                    </div>
                  )}

                  {/* Équipements */}
                  {selectedMatch.amenities && (Array.isArray(selectedMatch.amenities) ? selectedMatch.amenities : JSON.parse(selectedMatch.amenities || "[]")).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">{t('amenities')}</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedMatch.amenities) ? selectedMatch.amenities : JSON.parse(selectedMatch.amenities || "[]")).map(amenity => (
                          <span key={amenity} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-xs">
                            ✓ {t(amenity)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badge espace créatif */}
                  {selectedMatch.has_creative_space && (
                    <div className="mt-4 p-3 bg-purple-500/20 border border-purple-500/50 rounded-xl text-center">
                      <p className="text-purple-400 font-semibold">🎨 {t('creativeSpaceAvailable')}</p>
                  {!selectedMatch.has_space && selectedMatch.open_to_group_search && (
                    <div className="mt-4 p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-center">
                      <p className="text-cyan-400 font-semibold">🤝 {t('openToGroupSearch')}</p>
                      <p className="text-xs text-gray-400 mt-1">{t('groupSearchDescription')}</p>
                    </div>
                  )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold text-white mb-3">{ t('seeking') }</h4>
                <div className="flex gap-2">
                  <span className="px-4 py-2 bg-violet-500/20 border border-violet-500/50 rounded-xl text-violet-400 text-sm">
                    ✓ {selectedMatch.seeking === 'room' ? t('lookingForRoommate') : t('lookingForStudio')}
                  </span>
                  <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-xl text-purple-400 text-sm">
                    🎨 {selectedMatch.seeking === 'room' ? t('lookingForStudio') : t('lookingForRoommate')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">💰 { t('budget') }</h4>
                <p className="text-gray-300 bg-slate-700/50 rounded-xl p-4">
                  {selectedMatch.has_space ? `${t('roomPriceLabel')} ${selectedMatch.room_price}$/mois` : `${selectedMatch.budget_min}$ - ${selectedMatch.budget_max}$ CAD${t('perMonth')}`}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">{t('preferences')}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">{ t('tobacco') }</p>
                    <p className="text-white font-semibold">{selectedMatch.smoking ? '🚬 ' + t('yes') : '🚭 ' + t('no')}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">{ t('animals') }</p>
                    <p className="text-white font-semibold">{selectedMatch.pets ? '✅ ' + t('yes') : '❌ ' + t('no')}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">{ t('cleanliness') }</p>
                    <p className="text-white font-semibold">{selectedMatch.cleanliness}/5</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">{ t('noiseTolerance') }</p>
                    <p className="text-white font-semibold">{selectedMatch.noise_tolerance}/10</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">{ t('guestsFrequency') }</p>
                    <p className="text-white font-semibold">{selectedMatch.guests_frequency}/5</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-gray-400 mb-1">{ t('schedule') }</p>
                    <p className="text-white font-semibold">{t(getProductiveTimeLabel(selectedMatch.productive_time))}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 col-span-2">
                    <p className="text-gray-400 mb-1">{ t('practices') }</p>
                    <p className="text-white font-semibold break-words">{t(getReligionLabel(selectedMatch.religious_practice))}</p>
                  </div>
                  {selectedMatch.work_location && (
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <p className="text-gray-400 mb-1">💼 Travail</p>
                      <p className="text-white font-semibold">{t(getWorkLocationLabel(selectedMatch.work_location))}</p>
                    </div>
                  )}
                  {selectedMatch.relationship_status && (
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <p className="text-gray-400 mb-1">💜 Statut</p>
                      <p className="text-white font-semibold">{t(getRelationshipLabel(selectedMatch.relationship_status))}</p>
                    </div>
                  )}
                  {selectedMatch.move_in_date && (
                    <div className="bg-slate-700/50 rounded-xl p-4 col-span-2">
                      <p className="text-gray-400 mb-1">📅 Emménagement</p>
                      <p className="text-white font-semibold">{new Date(selectedMatch.move_in_date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                  <div className="bg-slate-700/50 rounded-xl p-4 col-span-2">
                    <p className="text-gray-400 mb-1">✨ Style de vie</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedMatch.alcohol_ok && <span className="px-3 py-1 bg-slate-600 text-gray-200 rounded-full text-xs font-semibold">🍷 Alcool OK</span>}
                      {selectedMatch.cannabis_friendly && <span className="px-3 py-1 bg-slate-600 text-gray-200 rounded-full text-xs font-semibold">🌿 420 friendly</span>}
                      {selectedMatch.no_substances && <span className="px-3 py-1 bg-slate-600 text-gray-200 rounded-full text-xs font-semibold">✨ Mode de vie sobre</span>}
                      {!selectedMatch.alcohol_ok && !selectedMatch.cannabis_friendly && !selectedMatch.no_substances && <span className="text-gray-500 text-xs">{t('notSpecified')}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {selectedMatch.languages && selectedMatch.languages.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">🌍 Langues</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.languages.map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-violet-500/20 border border-violet-500/50 rounded-full text-violet-300 text-sm font-semibold">{getLanguageLabel(lang)}</span>
                    ))}
                  </div>
                </div>
              )}

              {isMutualMatch(selectedMatch.user_id) ? (
                <div className="bg-gradient-to-r from-violet-600/20 to-indigo-500/20 border border-violet-500/50 rounded-xl p-6 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-white font-bold mb-2">C'est un match !</p>
                  <p className="text-gray-300 mb-4">Vous vous êtes likés mutuellement</p>
                  <button onClick={() => openChatWithMatch(selectedMatch)} className="flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    <MessageCircle size={24} />
                    Envoyer un message
                  </button>
                  {renderPartnershipButton(selectedMatch)}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button onClick={() => handleUnmatch(selectedMatch.user_id)} className="text-sm text-red-400/60 hover:text-red-400/90 transition-all">
                      Unmatch
                    </button>
                    {getPartnershipWith(selectedMatch.user_id)?.status === 'accepted' && (
                      <>
                        <span className="text-slate-600">|</span>
                        <button onClick={() => handleLeavePartnership(getPartnershipWith(selectedMatch.user_id))} className="text-sm text-red-400/60 hover:text-red-400/90 transition-all">
                          Quitter le binôme
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-violet-600/20 to-indigo-500/20 border border-violet-500/50 rounded-xl p-6">
                  <p className="text-white text-center mb-4">{ t('whatDoYouThink') } {selectedMatch.name.split(' ')[0]} ?</p>
                  <div className="flex gap-4">
                    <button onClick={() => handlePass(selectedMatch.user_id)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all">
                      <XCircle size={24} />
                      {t('pass')}
                    </button>
                    <button onClick={() => handleLike(selectedMatch.user_id)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
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

      {showProfile && currentUserProfile && (
        <ProfilePage
          currentUser={currentUserProfile}
          onSave={(updatedProfile) => setCurrentUserProfile(updatedProfile)}
          onLogout={onLogout}
          searchPartnerships={searchPartnerships}
        />
      )}

      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-500/30">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">😢 {t('deleteProfile')}</h2>
              <button onClick={() => setShowDeleteAccount(false)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
                <X size={24} className="text-gray-300" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-xl text-white mb-2">{t('sadToSeeYouGo')}</p>
                <p className="text-gray-400">{t('helpUsImprove')}</p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">{t('selectReasons')}</h3>
                <div className="space-y-2">
                  {[
                    { id: 'not_ready', labelKey: 'notReady' },
                    { id: 'too_complicated', labelKey: 'tooComplicated' },
                    { id: 'no_matches', labelKey: 'noMatches' },
                    { id: 'found_roommate', labelKey: 'foundElsewhere' },
                    { id: 'too_many_options', labelKey: 'tooManyProfiles' },
                    { id: 'privacy_concerns', labelKey: 'privacyConcerns' },
                    { id: 'other', labelKey: 'otherReason' }
                  ].map(({ id, labelKey }) => (
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
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 font-semibold mb-2">{t('warning')}</p>
                <p className="text-gray-300 text-sm">
                  {t('irreversibleAction_allDataDeleted')}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(t('confirmDeleteAccount'))) return;

                    try {
                      const selectedButtons = document.querySelectorAll('[data-reason][data-selected="true"]');
                      const selectedReasons = Array.from(selectedButtons).map(btn => btn.getAttribute('data-reason'));

                      if (selectedReasons.length === 0) {
                        alert(t('selectAtLeastOne'));
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

                      alert(t('accountDeleted'));
                      await supabase.auth.signOut();
                      window.location.href = '/';

                    } catch (error) {
                      console.error('Erreur lors de la suppression:', error);
                      alert(t('errorOccurred'));
                    }
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
                >
                  {t('confirmDelete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConversations && (
        <ConversationsList
          currentUser={currentUserProfile}
          onClose={() => { setShowConversations(false); setActiveTab("discover"); }}
          onUnmatch={handleUnmatch}
          onOpenChat={openChatWithMatch}
          mutualMatchProfiles={mutualMatchProfiles}
          onSelectMatch={(match) => setSelectedMatch({ ...match, compatibility: match.compatibility || calculateCompatibility(currentUserProfile, match) })}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          likerProfiles={likerProfiles}
          onViewLikes={(liker) => { setShowLikesReceived(true); setShowConversations(false); setActiveTab("likes"); if (liker) setTimeout(() => { window._openLikerProfile && window._openLikerProfile(liker.user_id); }, 300); }}
          searchPartnerships={searchPartnerships}
          onAcceptPartnership={handleAcceptPartnership}
          onDeclinePartnership={handleDeclinePartnership}
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
          onClose={() => { setShowLikesReceived(false); setActiveTab("discover"); }}
          onViewLikes={() => { setUnviewedLikesCount(0); }}
          initialLikes={likerProfiles}
          onLike={async (profile) => {
            await handleLike(profile.user_id);
            setShowLikesReceived(false);
          }}
        />
      )}

      {showFavorites && (
        <TopVibes
          currentUser={currentUserProfile}
          onLike={async (profile) => { await handleLike(profile.user_id); }}
        />
      )}

      {notifications.map(notif => (
        <MessageNotification 
          key={notif.id}
          message={notif.message}
          onClick={async () => {
            const { data: senderProfile } = await supabase.from('profiles').select('*').eq('user_id', notif.senderId).single();
            if (senderProfile) {
              setSelectedMatch(senderProfile);
              if (senderProfile.has_space) loadPropertyPhotos(senderProfile.user_id);
            }
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
          }}
          sender={notif.sender}
          senderPhoto={notif.senderPhoto}
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
        />
      ))}
      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer">
          <img src={lightboxPhoto} alt="Photo" className="max-w-full max-h-screen object-contain rounded-2xl" />
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-4 right-4 text-white text-3xl font-bold">✕</button>
        </div>
      )}

      {/* BARRE DE NAVIGATION EN BAS */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-violet-500/20 flex items-center justify-around px-2" style={{paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)'}}>
        <button onClick={() => { setActiveTab('discover'); setShowFavorites(false); setShowLikesReceived(false); setShowConversations(false); setShowProfile(false); }} className={`flex flex-col items-center gap-1 py-3 px-4 transition-all ${activeTab === 'discover' ? 'text-violet-400' : 'text-gray-500'}`}>
          <Logo size={32} />
          <span className="text-xs font-medium">Discover</span>
        </button>
        <button onClick={() => { setActiveTab('favorites'); setShowFavorites(true); setShowLikesReceived(false); setShowConversations(false); setShowProfile(false); }} className={`flex flex-col items-center gap-1 py-3 px-4 transition-all relative ${activeTab === 'favorites' ? 'text-violet-400' : 'text-gray-500'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span className="text-xs font-medium">Top Vibes</span>
        </button>
        <button onClick={() => { setActiveTab('likes'); setShowLikesReceived(true); setShowFavorites(false); setShowConversations(false); setShowProfile(false); }} className={`flex flex-col items-center gap-1 py-3 px-4 transition-all relative ${activeTab === 'likes' ? 'text-pink-400' : 'text-gray-500'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span className="text-xs font-medium">Likes</span>
          {unviewedLikesCount > 0 && <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{unviewedLikesCount > 9 ? '9+' : unviewedLikesCount}</span>}
        </button>
        <button onClick={() => { setActiveTab('vibes'); setShowConversations(true); setUnreadCount(0); setShowFavorites(false); setShowLikesReceived(false); setShowProfile(false); }} className={`flex flex-col items-center gap-1 py-3 px-4 transition-all relative ${activeTab === 'vibes' ? 'text-violet-400' : 'text-gray-500'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span className="text-xs font-medium">Mes Vibes</span>
          {unreadCount > 0 && <span className="absolute top-2 right-2 bg-violet-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <button onClick={() => { setActiveTab('profile'); setShowProfile(true); setShowFavorites(false); setShowLikesReceived(false); setShowConversations(false); }} className={`flex flex-col items-center gap-1 py-3 px-4 transition-all ${activeTab === 'profile' ? 'text-violet-400' : 'text-gray-500'}`}>
          {currentUserProfile?.photo_url ? (
            <img src={currentUserProfile.photo_url} className={`w-7 h-7 rounded-full object-cover border-2 ${activeTab === 'profile' ? 'border-violet-400' : 'border-gray-500'}`} />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          )}
          <span className="text-xs font-medium">Profil</span>
        </button>
      </nav>
    </div>
  );
};

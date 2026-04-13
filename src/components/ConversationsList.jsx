import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { supabase } from '../lib/supabase';
import { X, MessageCircle } from 'lucide-react';
import { ProfileView } from './ProfileView';
import { useTranslation } from 'react-i18next';

export const ConversationsList = ({ currentUser, onClose, onOpenChat, onUnmatch }) => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conversationData, setConversationData] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    loadMatches();
    
    const interval = setInterval(() => {
      if (matches.length > 0) {
        loadConversationData(matches);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [matches.length]);

  const loadMatches = async () => {
    try {
      const { data: myLikes, error: myError } = await supabase
        .from('swipes')
        .select('swiped_user_id')
        .eq('user_id', currentUser.user_id)
        .eq('is_like', true);

      if (myError) throw myError;

      const { data: theirLikes, error: theirError } = await supabase
        .from('swipes')
        .select('user_id')
        .eq('swiped_user_id', currentUser.user_id)
        .eq('is_like', true);

      if (theirError) throw theirError;

      const mutualIds = myLikes
        .filter(like => theirLikes.some(their => their.user_id === like.swiped_user_id))
        .map(like => like.swiped_user_id);

      if (mutualIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', mutualIds);

      if (profilesError) throw profilesError;

      setMatches(profiles || []);
      await loadConversationData(profiles || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading matches:', error);
      setLoading(false);
    }
  };

  const loadConversationData = async (matchProfiles) => {
    const data = {};
    
    for (const match of matchProfiles) {
      const user1 = currentUser.user_id < match.user_id ? currentUser.user_id : match.user_id;
      const user2 = currentUser.user_id < match.user_id ? match.user_id : currentUser.user_id;

      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', user1)
        .eq('user2_id', user2)
        .maybeSingle();

      if (conversation) {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .neq('sender_id', currentUser.user_id)
          .eq('read', false);

        data[match.user_id] = {
          unreadCount: count || 0,
          lastMessage: lastMessage
        };
      } else {
        data[match.user_id] = {
          unreadCount: 0,
          lastMessage: null
        };
      }
    }

    setConversationData(data);
  };

  const getPreviewText = (matchUserId) => {
    const convData = conversationData[matchUserId];
    
    if (!convData) return 'Match CoVibe ✨';
    
    if (convData.unreadCount > 0) {
      return `${convData.unreadCount} nouveau${convData.unreadCount > 1 ? 'x' : ''} message${convData.unreadCount > 1 ? 's' : ''}`;
    }
    
    if (convData.lastMessage && convData.lastMessage.sender_id !== currentUser.user_id && !convData.lastMessage.read) {
      return '💬 À ton tour de répondre';
    }
    
    if (convData.lastMessage) {
      const isMe = convData.lastMessage.sender_id === currentUser.user_id;
      const prefix = isMe ? 'Toi: ' : '';
      const preview = convData.lastMessage.content.substring(0, 40);
      return prefix + (preview.length < convData.lastMessage.content.length ? `${preview}...` : preview);
    }
    
    return 'Match CoVibe ✨';
  };

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900 pb-24">
        <div className="p-6 pt-16">
          <h2 className="text-2xl font-bold text-white mb-6">💬 Mes Conversations</h2>
          <div>
            {loading ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-gray-400">Chargement...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun match pour l'instant</h3>
                <p className="text-gray-400">{t('keepSwiping')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => {
                  const convData = conversationData[match.user_id];
                  const unreadCount = convData?.unreadCount || 0;
                  
                  return (
                    <button
                      key={match.user_id}
                      onClick={() => {
                        onOpenChat(match);
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all relative"
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProfile(match);
                        }}
                        className="relative hover:opacity-80 transition-all"
                      >
                        {match.photo_url ? (
                          <img src={match.photo_url} alt={match.name} className="w-16 h-16 rounded-full object-cover border-2 border-violet-500" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-3xl">👤</div>
                        )}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-600 to-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-white">{match.name}</h3>
                        <p className="text-sm text-gray-400">
                          {getPreviewText(match.user_id)}
                        </p>
                      </div>
                      <MessageCircle size={24} className={unreadCount > 0 ? 'text-violet-400' : 'text-gray-400'} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <ProfileView
          profile={selectedProfile}
          currentUser={currentUser}
          onClose={() => setSelectedProfile(null)}
          onUnmatch={onUnmatch}
          onOpenChat={(profile) => {
            setSelectedProfile(null);
            onOpenChat(profile);
            onClose();
          }}
        />
      )}
    </>
  );
};

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MessageCircle } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { ProfileMatchActions } from './ProfileMatchActions';
import { calculateCompatibility } from '../lib/matching';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';

export const ConversationsList = ({ currentUserProfile, onClose, onOpenChat, onUnmatch, mutualMatchProfiles = [], onSelectMatch, favorites = [], onToggleFavorite, likerProfiles = [], onViewLikes, searchPartnerships = [], onAcceptPartnership, onDeclinePartnership, getPartnershipWith, renderPartnershipButton, onLeavePartnership, onToggleFlexible }) => {
  const { t } = useTranslation();
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationData, setConversationData] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProfilePartner, setSelectedProfilePartner] = useState(null);
  const [selectedProfilePhotos, setSelectedProfilePhotos] = useState([]);
  const [inviterProfiles, setInviterProfiles] = useState({});
  const conversationDataRef = useRef({});

  useEffect(() => {
    conversationDataRef.current = conversationData;
  }, [conversationData]);

  const pendingInvitesReceived = searchPartnerships.filter(p => p.status === 'pending' && p.partner_id === currentUserProfile.user_id);

  useEffect(() => {
    if (pendingInvitesReceived.length === 0) {
      setInviterProfiles({});
      return;
    }
    const requesterIds = pendingInvitesReceived.map(p => p.requester_id);
    supabase
      .from('profiles')
      .select('user_id, name, photo_url')
      .in('user_id', requesterIds)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading partnership inviter profiles:', error);
          setInviterProfiles({});
          return;
        }
        const map = {};
        (data || []).forEach((p) => { map[p.user_id] = p; });
        setInviterProfiles(map);
      });
  }, [searchPartnerships, currentUserProfile.user_id]);

  useEffect(() => {
    if (!selectedProfile) {
      setSelectedProfilePartner(null);
      setSelectedProfilePhotos([]);
      return;
    }

    const partnership = searchPartnerships.find(p =>
      p.status === 'accepted' && (p.requester_id === selectedProfile.user_id || p.partner_id === selectedProfile.user_id)
    );
    if (partnership) {
      const partnerId = partnership.requester_id === selectedProfile.user_id ? partnership.partner_id : partnership.requester_id;
      supabase
        .from('profiles')
        .select('user_id, name, photo_url')
        .eq('user_id', partnerId)
        .maybeSingle()
        .then(({ data }) => setSelectedProfilePartner(data || null));
    } else {
      setSelectedProfilePartner(null);
    }

    if (selectedProfile.has_space) {
      supabase
        .from('property_photos')
        .select('*')
        .eq('user_id', selectedProfile.user_id)
        .order('position')
        .then(({ data }) => setSelectedProfilePhotos(data || []));
    } else {
      setSelectedProfilePhotos([]);
    }
  }, [selectedProfile, searchPartnerships]);

  const fetchConversationEntry = async (matchUserId) => {
    const user1 = currentUserProfile.user_id < matchUserId ? currentUserProfile.user_id : matchUserId;
    const user2 = currentUserProfile.user_id < matchUserId ? matchUserId : currentUserProfile.user_id;

    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('user1_id', user1)
      .eq('user2_id', user2)
      .maybeSingle();

    if (!conversation) {
      return { conversationId: null, unreadCount: 0, lastMessage: null };
    }

    const [{ data: lastMessage }, { count }] = await Promise.all([
      supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', currentUserProfile.user_id)
        .eq('read', false),
    ]);

    return { conversationId: conversation.id, unreadCount: count || 0, lastMessage: lastMessage || null };
  };

  useEffect(() => {
    if (mutualMatchProfiles.length === 0) {
      setConversationData({});
      setLoadingConversations(false);
      return;
    }

    let cancelled = false;
    setLoadingConversations(true);

    Promise.all(mutualMatchProfiles.map(async (m) => [m.user_id, await fetchConversationEntry(m.user_id)]))
      .then((entries) => {
        if (cancelled) return;
        setConversationData(Object.fromEntries(entries));
      })
      .catch((error) => {
        console.error('Error loading conversation data:', error);
      })
      .finally(() => {
        if (!cancelled) setLoadingConversations(false);
      });

    return () => { cancelled = true; };
  }, [mutualMatchProfiles]);

  useEffect(() => {
    if (mutualMatchProfiles.length === 0) return;

    const handleMessageChange = async (message) => {
      const known = Object.entries(conversationDataRef.current).find(([, v]) => v.conversationId === message.conversation_id);
      let matchUserId = known?.[0];

      if (!matchUserId) {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('user1_id, user2_id')
          .eq('id', message.conversation_id)
          .maybeSingle();
        if (!conversation) return;
        const otherUserId = conversation.user1_id === currentUserProfile.user_id ? conversation.user2_id : conversation.user1_id;
        const isKnownMatch = mutualMatchProfiles.some((m) => m.user_id === otherUserId);
        if (!isKnownMatch) return;
        matchUserId = otherUserId;
      }

      const entry = await fetchConversationEntry(matchUserId);
      setConversationData((prev) => ({ ...prev, [matchUserId]: entry }));
    };

    const channel = supabase
      .channel('conversations-list-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => handleMessageChange(payload.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => handleMessageChange(payload.new))
      .subscribe();

    return () => channel.unsubscribe();
  }, [mutualMatchProfiles, currentUserProfile.user_id]);

  const getPreviewText = (matchUserId) => {
    const convData = conversationData[matchUserId];

    if (!convData) return 'Match CoVibe ✨';

    if (convData.unreadCount > 0) {
      return `${convData.unreadCount} nouveau${convData.unreadCount > 1 ? 'x' : ''} message${convData.unreadCount > 1 ? 's' : ''}`;
    }

    if (convData.lastMessage && convData.lastMessage.sender_id !== currentUserProfile.user_id && !convData.lastMessage.read) {
      return '💬 À ton tour de répondre';
    }

    if (convData.lastMessage) {
      const isMe = convData.lastMessage.sender_id === currentUserProfile.user_id;
      const prefix = isMe ? 'Toi: ' : '';
      const preview = convData.lastMessage.content.substring(0, 40);
      return prefix + (preview.length < convData.lastMessage.content.length ? `${preview}...` : preview);
    }

    return 'Match CoVibe ✨';
  };

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH}h`;
    const diffDays = Math.floor(diffH / 24);
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
  };

  const railMatches = mutualMatchProfiles.filter((m) => !conversationData[m.user_id]?.lastMessage);
  const listMatches = mutualMatchProfiles
    .filter((m) => conversationData[m.user_id]?.lastMessage)
    .sort((a, b) => new Date(conversationData[b.user_id].lastMessage.created_at) - new Date(conversationData[a.user_id].lastMessage.created_at));

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 pb-24">
        <div className="fixed -top-20 -left-20 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />
        <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />
        <div className="fixed top-1/3 right-0 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />

        <div className="p-6 pt-16">
          {pendingInvitesReceived.length > 0 && (
            <div className="mb-6 space-y-3">
              {pendingInvitesReceived.map((invite) => {
                const inviter = inviterProfiles[invite.requester_id];
                if (!inviter) return null;
                return (
                  <div key={invite.id} className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                    {inviter.photo_url ? (
                      <img src={inviter.photo_url} alt={inviter.name} className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-2xl border-2 border-cyan-400">👤</div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold">{inviter.name?.split(' ')[0]} t'invite à chercher une coloc ensemble</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => onAcceptPartnership(invite)} className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                          Accepter
                        </button>
                        <button onClick={() => onDeclinePartnership(invite)} className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-xl font-bold text-sm transition-all">
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loadingConversations && railMatches.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Logo size={28} /> Tes VibeMatches</h2>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {railMatches.map((match) => (
                  <div key={match.user_id} className="flex-shrink-0 text-center relative">
                    <button onClick={() => onSelectMatch && onSelectMatch(match)} className="hover:scale-105 transition-transform">
                      <div className="relative">
                        {match.photo_url ? (
                          <img src={match.photo_url} alt={match.name} className="w-24 h-24 rounded-full object-cover border-4 border-violet-500 mb-1" />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-4xl border-4 border-violet-500 mb-1">👤</div>
                        )}
                        <span className="absolute top-0 right-0 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-900" />
                      </div>
                      <p className="text-white text-xs font-semibold max-w-[88px] truncate">{match.name}</p>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {likerProfiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">💙 Nouveau Like</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {likerProfiles.map((liker) => (
                  <button key={liker.user_id} onClick={() => onViewLikes(liker)} className="flex-shrink-0 text-center relative hover:scale-105 transition-transform">
                    <div className="relative w-20 h-20 mb-1">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-400">
                        {liker.photo_url ? (
                          <img src={liker.photo_url} alt="?" className="w-full h-full object-cover" style={{filter: 'blur(8px)', transform: 'scale(1.1)'}} />
                        ) : (
                          <div className="w-full h-full bg-slate-700 flex items-center justify-center text-3xl">👤</div>
                        )}
                      </div>
                      <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">💙</span>
                    </div>
                    <p className="text-blue-400 text-xs font-semibold">Voir</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-4">💬 Mes Conversations</h2>
          <div>
            {loadingConversations ? (
              <div className="text-center py-10">
                <div className="space-y-3 w-full"><div className="h-16 bg-slate-800 rounded-2xl animate-pulse"></div><div className="h-16 bg-slate-800 rounded-2xl animate-pulse"></div><div className="h-16 bg-slate-800 rounded-2xl animate-pulse"></div></div>
              </div>
            ) : mutualMatchProfiles.length === 0 ? (
              <div className="text-center py-10">
                <div className="mb-4 flex justify-center"><Logo size={64} /></div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun match pour l'instant</h3>
                <p className="text-gray-400">{t('keepSwiping')}</p>
              </div>
            ) : listMatches.length === 0 ? (
              <div className="text-center py-10">
                <div className="mb-4 flex justify-center"><Logo size={64} /></div>
                <h3 className="text-xl font-bold text-white mb-2">Aucune conversation pour l'instant</h3>
                <p className="text-gray-400">Envoie un message à l'un de tes matchs ci-dessus pour démarrer !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {listMatches.map((match) => {
                  const convData = conversationData[match.user_id];
                  const unreadCount = convData?.unreadCount || 0;
                  const hasUnread = unreadCount > 0;

                  return (
                    <button
                      key={match.user_id}
                      onClick={() => onOpenChat(match)}
                      className="w-full flex items-center gap-4 p-4 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/60 rounded-2xl transition-all relative"
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProfile({ ...match, compatibility: calculateCompatibility(currentUserProfile, match) });
                        }}
                        className="relative hover:opacity-80 transition-all shrink-0"
                      >
                        {match.photo_url ? (
                          <img src={match.photo_url} alt={match.name} className="w-16 h-16 rounded-full object-cover border-2 border-violet-500" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-3xl">👤</div>
                        )}
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-600 to-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`truncate ${hasUnread ? 'text-lg font-bold text-white' : 'text-lg font-semibold text-gray-200'}`}>{match.name}</h3>
                          {convData?.lastMessage && (
                            <span className={`text-xs shrink-0 ${hasUnread ? 'text-violet-400 font-semibold' : 'text-gray-500'}`}>
                              {formatRelativeTime(convData.lastMessage.created_at)}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${hasUnread ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                          {getPreviewText(match.user_id)}
                        </p>
                      </div>
                      <MessageCircle size={22} className={hasUnread ? 'text-violet-400 shrink-0' : 'text-gray-500 shrink-0'} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <ProfileDetailView
          profile={selectedProfile}
          currentUserProfile={currentUserProfile}
          searchPartnerships={searchPartnerships}
          partnerProfile={selectedProfilePartner}
          propertyPhotos={selectedProfilePhotos}
          onClose={() => setSelectedProfile(null)}
          onToggleFlexible={onToggleFlexible}
        >
          <ProfileMatchActions
            onSendMessage={() => {
              setSelectedProfile(null);
              onOpenChat(selectedProfile);
              onClose();
            }}
            onUnmatch={() => {
              onUnmatch(selectedProfile.user_id);
              setSelectedProfile(null);
            }}
            partnershipSlot={renderPartnershipButton && renderPartnershipButton(selectedProfile)}
            onLeavePartnership={
              getPartnershipWith?.(selectedProfile.user_id)?.status === 'accepted'
                ? () => onLeavePartnership(getPartnershipWith(selectedProfile.user_id))
                : undefined
            }
          />
        </ProfileDetailView>
      )}
    </>
  );
};

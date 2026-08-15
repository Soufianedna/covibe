import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send, XCircle, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { ProfileDetailView } from './ProfileDetailView';
import { ProfileMatchActions } from './ProfileMatchActions';
import { calculateCompatibility } from '../lib/matching';
import { useTranslation } from 'react-i18next';

export const Chat = ({ currentUserProfile, matchedUser, onClose, onUnmatch, onMessagesRead, searchPartnerships = [] }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [matchedUserPartner, setMatchedUserPartner] = useState(null);
  const [matchedUserPhotos, setMatchedUserPhotos] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const messagesEndRef = useRef(null);
  const typingChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    if (conversationId) {
      console.log('📝 Conversation ID:', conversationId);
      loadMessages();
      markMessagesAsRead();
      const unsubscribe = subscribeToMessages();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [conversationId]);

  // Canal presence dédié à l'indicateur de saisie — dépendances stables
  // (conversationId uniquement) pour ne pas rouvrir le canal à chaque frappe.
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { presence: { key: currentUserProfile.user_id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherTyping = Object.entries(state)
          .filter(([key]) => key !== currentUserProfile.user_id)
          .some(([, presences]) => presences.some((p) => p.typing));
        setIsOtherTyping(otherTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ typing: false });
        }
      });

    typingChannelRef.current = channel;

    return () => {
      clearTimeout(typingTimeoutRef.current);
      channel.unsubscribe();
      typingChannelRef.current = null;
    };
  }, [conversationId]);

  useEffect(() => {
    const partnership = searchPartnerships.find(p =>
      p.status === 'accepted' && (p.requester_id === matchedUser.user_id || p.partner_id === matchedUser.user_id)
    );
    if (!partnership) {
      setMatchedUserPartner(null);
      return;
    }
    const partnerId = partnership.requester_id === matchedUser.user_id ? partnership.partner_id : partnership.requester_id;
    supabase
      .from('profiles')
      .select('user_id, name, photo_url')
      .eq('user_id', partnerId)
      .maybeSingle()
      .then(({ data }) => setMatchedUserPartner(data || null));
  }, [matchedUser.user_id, searchPartnerships]);

  useEffect(() => {
    if (!matchedUser.has_space) {
      setMatchedUserPhotos([]);
      return;
    }
    supabase
      .from('property_photos')
      .select('*')
      .eq('user_id', matchedUser.user_id)
      .order('position')
      .then(({ data }) => setMatchedUserPhotos(data || []));
  }, [matchedUser.user_id, matchedUser.has_space]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async () => {
    try {
      console.log('✅ Marquage des messages comme lus...');
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserProfile.user_id)
        .eq('read', false);
      if (error) {
        console.error('❌ Erreur marquage lu:', error);
      } else {
        console.log("✅ Messages marqués comme lus");
        if (onMessagesRead) onMessagesRead();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const loadConversation = async () => {
    try {
      const user1 = currentUserProfile.user_id < matchedUser.user_id ? currentUserProfile.user_id : matchedUser.user_id;
      const user2 = currentUserProfile.user_id < matchedUser.user_id ? matchedUser.user_id : currentUserProfile.user_id;
      console.log('🔍 Recherche conversation entre:', user1, user2);
      let { data: conversation, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', user1)
        .eq('user2_id', user2)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur:', error);
        throw error;
      }
      if (!conversation) {
        console.log('➕ Création nouvelle conversation');
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({ user1_id: user1, user2_id: user2 })
          .select('id')
          .single();
        if (createError) {
          console.error('❌ Erreur création:', createError);
          throw createError;
        }
        conversation = newConv;
      }
      console.log('✅ Conversation trouvée/créée:', conversation.id);
      setConversationId(conversation.id);
    } catch (error) {
      console.error('Error loading conversation:', error);
      if (error.message && error.message.includes('row-level security')) {
        alert(`💔 ${matchedUser.name} t'a unmatch.`);
        onClose();
      } else {
        alert('Erreur lors du chargement de la conversation: ' + error.message);
      }
    }
  };

  const loadMessages = async () => {
    try {
      console.log('📨 Chargement messages pour conversation:', conversationId);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      console.log('✅ Messages chargés:', data?.length || 0);
      setMessages(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    console.log('🔔 Abonnement aux nouveaux messages...');
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('📩 Nouveau message reçu:', payload.new);
          setMessages(current => [...current, payload.new]);
          if (payload.new.sender_id !== currentUserProfile.user_id) {
            markMessagesAsRead();
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('✏️ Message mis à jour:', payload.new);
          setMessages(current => current.map((m) => (m.id === payload.new.id ? payload.new : m)));
        }
      )
      .on('postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`
        },
        () => {
          console.log('💔 Conversation supprimée - fermeture chat');
          onClose();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status subscription:', status);
      });
    return () => {
      console.log('🔇 Déconnexion subscription');
      channel.unsubscribe();
    };
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    const channel = typingChannelRef.current;
    if (!channel) return;
    channel.track({ typing: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channel.track({ typing: false });
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;
    const messageContent = newMessage.trim();
    setNewMessage('');
    clearTimeout(typingTimeoutRef.current);
    typingChannelRef.current?.track({ typing: false });
    try {
      console.log('📤 Envoi message:', messageContent);
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserProfile.user_id,
          content: messageContent,
          read: false
        })
        .select()
        .single();
      if (error) throw error;
      console.log('✅ Message envoyé:', data);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur envoi message. Réessaie.');
      setNewMessage(messageContent);
    }
  };

  const formatDayLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const buildTimeline = (msgs) => {
    const items = [];
    let currentDay = null;
    let currentGroup = null;
    for (const message of msgs) {
      const day = new Date(message.created_at).toDateString();
      if (day !== currentDay) {
        items.push({ type: 'day', date: message.created_at });
        currentDay = day;
        currentGroup = null;
      }
      if (currentGroup && currentGroup.senderId === message.sender_id) {
        currentGroup.messages.push(message);
      } else {
        currentGroup = { type: 'group', senderId: message.sender_id, messages: [message] };
        items.push(currentGroup);
      }
    }
    return items;
  };

  const timeline = buildTimeline(messages);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 z-[100] flex flex-col">
        <div className="fixed -top-20 -left-20 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />
        <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />
        <div className="fixed top-1/3 right-0 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-[0.18] pointer-events-none z-0" />

        <div className="shrink-0 relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
          <div className="px-4 pb-3 flex items-center justify-between gap-2">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 hover:opacity-80 transition-all min-w-0"
            >
              {matchedUser.photo_url ? (
                <img src={matchedUser.photo_url} alt={matchedUser.name} className="w-11 h-11 rounded-full object-cover border-2 border-violet-500 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center text-2xl shrink-0">👤</div>
              )}
              <div className="text-left min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{matchedUser.name}</h2>
                <p className="text-xs text-gray-400 truncate">{t('matchCovibe')}</p>
              </div>
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <div className="relative">
                <button onClick={() => setShowMenu((v) => !v)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <MoreVertical size={20} className="text-gray-300" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-20 min-w-[160px]">
                      <button
                        onClick={() => { setShowMenu(false); onUnmatch(matchedUser.user_id); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                      >
                        <XCircle size={16} />
                        {t('unmatch')}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={22} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative z-10">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-4xl">⏳</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">{t('startConversation')}</h3>
              <p className="text-gray-400">{t('sendFirstMessage')} {matchedUser.name}</p>
            </div>
          ) : (
            <>
              {timeline.map((item, idx) => {
                if (item.type === 'day') {
                  return (
                    <div key={`day-${idx}`} className="flex justify-center my-4">
                      <span className="text-xs text-gray-400 bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        {formatDayLabel(item.date)}
                      </span>
                    </div>
                  );
                }

                const isMe = item.senderId === currentUserProfile.user_id;
                const lastMessage = item.messages[item.messages.length - 1];

                return (
                  <div key={item.messages[0].id} className="mb-3">
                    {item.messages.map((message, i) => {
                      const isLast = i === item.messages.length - 1;
                      const tailClass = isMe
                        ? (isLast ? 'rounded-br-md' : '')
                        : (isLast ? 'rounded-bl-md' : '');
                      return (
                        <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${i > 0 ? 'mt-1' : ''}`}>
                          <div
                            className={`w-fit max-w-[75%] rounded-2xl px-4 py-2.5 ${tailClass} ${isMe ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white' : 'bg-slate-700/80 backdrop-blur-sm text-white'}`}
                          >
                            <p className="break-words">{message.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div className={`flex items-center gap-1 px-1 mt-1 ${isMe ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">
                        {new Date(lastMessage.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        lastMessage.read
                          ? <CheckCheck size={14} className="text-cyan-400" />
                          : <Check size={14} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                );
              })}

              {isOtherTyping && (
                <div className="flex justify-start mb-3">
                  <div className="bg-slate-700/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 relative z-10 bg-white/5 backdrop-blur-xl border-t border-white/10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
          <form onSubmit={sendMessage} className="p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {showProfile && (
        <ProfileDetailView
          profile={{ ...matchedUser, compatibility: calculateCompatibility(currentUserProfile, matchedUser) }}
          currentUserProfile={currentUserProfile}
          searchPartnerships={searchPartnerships}
          partnerProfile={matchedUserPartner}
          propertyPhotos={matchedUserPhotos}
          onClose={() => setShowProfile(false)}
          onPropertyPhotoClick={(url) => setLightboxPhoto(url)}
        >
          <ProfileMatchActions
            onSendMessage={() => setShowProfile(false)}
            onUnmatch={() => { onUnmatch(matchedUser.user_id); setShowProfile(false); onClose(); }}
          />
        </ProfileDetailView>
      )}

      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)} className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 cursor-pointer">
          <img src={lightboxPhoto} alt="Photo" className="max-w-full max-h-screen object-contain rounded-2xl" />
          <button onClick={() => setLightboxPhoto(null)} className="absolute right-4 text-white text-3xl font-bold" style={{ top: 'calc(var(--safe-top) + 16px)' }}>✕</button>
        </div>
      )}
    </>
  );
};

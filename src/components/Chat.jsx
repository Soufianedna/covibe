import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send, XCircle } from 'lucide-react';
import { ProfileView } from './ProfileView';

export const Chat = ({ currentUser, matchedUser, onClose, onUnmatch }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        .neq('sender_id', currentUser.user_id)
        .eq('read', false);
      if (error) {
        console.error('❌ Erreur marquage lu:', error);
      } else {
        console.log('✅ Messages marqués comme lus');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const loadConversation = async () => {
    try {
      const user1 = currentUser.user_id < matchedUser.user_id ? currentUser.user_id : matchedUser.user_id;
      const user2 = currentUser.user_id < matchedUser.user_id ? matchedUser.user_id : currentUser.user_id;
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
      alert('Erreur lors du chargement de la conversation: ' + error.message);
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
          if (payload.new.sender_id !== currentUser.user_id) {
            markMessagesAsRead();
          }
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;
    const messageContent = newMessage.trim();
    setNewMessage('');
    try {
      console.log('📤 Envoi message:', messageContent);
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.user_id,
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

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
        <div className="bg-slate-800 border border-pink-500/30 rounded-3xl max-w-2xl w-full h-[80vh] flex flex-col">
          <div className="sticky top-0 bg-slate-800 border-b border-pink-500/30 p-6 flex items-center justify-between rounded-t-3xl">
            <button 
              onClick={() => setShowProfile(true)} 
              className="flex items-center gap-3 hover:opacity-80 transition-all"
            >
              {matchedUser.photo_url ? (
                <img src={matchedUser.photo_url} alt={matchedUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-pink-500" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">👤</div>
              )}
              <div className="text-left">
                <h2 className="text-xl font-bold text-white">{matchedUser.name}</h2>
                <p className="text-sm text-gray-400">Match CoVibe</p>
              </div>
            </button>
            <button onClick={() => onUnmatch(matchedUser.user_id)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all text-sm border border-slate-600 hover:border-red-500/50">
              <XCircle size={16} />
              <span className="text-xs font-medium">Unmatch</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
              <X size={24} className="text-gray-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-4xl">⏳</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-white mb-2">Commence la conversation !</h3>
                <p className="text-gray-400">Envoie le premier message à {matchedUser.name}</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.sender_id === currentUser.user_id;
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-slate-700 text-white'}`}>
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                        {new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-6 border-t border-pink-500/30">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écris ton message..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {showProfile && (
        <ProfileView
          profile={matchedUser}
          currentUser={currentUser}
          onClose={() => setShowProfile(false)}
          onOpenChat={() => setShowProfile(false)}
        />
      )}
    </>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search,
  Users,
  Clock,
  Phone,
  Video
} from 'lucide-react';
import { chatService, authService } from '../../../../../services/api';
import { toArray } from '../../../../../utils/apiHelpers';

const ChatModule = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  // using shared toArray from utils/apiHelpers

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await chatService.getConversations();
      const list = toArray(resp?.data);
      // Normalize to UI shape
      const mapped = list.map(c => ({
        id: c._id || c.id,
        customer: c.customer?.name || c.title || 'Client',
        lastMessage: c.lastMessage?.content || '',
        time: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        unread: Number(c.unreadCount || 0),
        status: c.status === 'active' ? 'online' : (c.status || 'offline'),
        raw: c,
      }));
      setConversations(mapped);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || 'Erreur inconnue';
      setError(`Erreur ${status || ''} - Impossible de charger les conversations. ${msg}`.trim());
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const resp = await chatService.getMessages(conversationId);
      const list = toArray(resp?.data);
      setMessages(list);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      // Mark latest customer message as read
      const lastIncoming = [...list].reverse().find(m => m.sender && m.sender.role !== 'admin' && (m._id || m.id));
      if (lastIncoming && (lastIncoming._id || lastIncoming.id)) {
        try { await chatService.markMessageRead(lastIncoming._id || lastIncoming.id); } catch {}
      }
    } catch (e) {
      setMessages([]);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  // Auto-refresh every 10s for conversations and active chat messages
  useEffect(() => {
    const id = setInterval(() => {
      fetchConversations();
      if (selectedChat?.id) {
        fetchMessages(selectedChat.id);
      }
    }, 10000);
    return () => clearInterval(id);
  }, [selectedChat?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement du chat...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded p-4 text-sm text-red-700">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chat Support Client</h1>
          <p className="text-sm sm:text-base text-gray-600">Communiquez en temps réel avec vos clients</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                setError('');
                // Fetch current user to build participants
                const me = await authService.getProfile();
                const myId = me?.data?.user?.id || me?.data?.user?._id || me?.data?.data?._id || me?.data?._id;
                const created = await chatService.createConversation({
                  type: 'support',
                  title: `Test ${new Date().toLocaleString('fr-FR')}`,
                  participants: myId ? [{ user: myId, role: 'admin' }] : [],
                  metadata: { createdBy: 'admin-ui' },
                });
                const conv = created?.data?.data || created?.data;
                const id = conv?._id || conv?.id;
                if (!id) throw new Error('ID de conversation introuvable dans la réponse API');
                await chatService.sendMessage(id, { content: 'Bonjour, ceci est une conversation de test.', type: 'text' });
                await fetchConversations();
                if (id) {
                  const mapped = {
                    id,
                    customer: 'Client (test)',
                    lastMessage: 'Bonjour, ceci est une conversation de test.',
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    unread: 0,
                    status: 'online'
                  };
                  setSelectedChat(mapped);
                  await fetchMessages(id);
                }
              } catch (e) {
                const status = e?.response?.status;
                const errors = e?.response?.data?.errors;
                const details = Array.isArray(errors) ? errors.map(er => `${er.param||er.path||''}: ${er.msg||er.message||''}`).join('; ') : '';
                const msg = e?.response?.data?.message || e?.message || 'Erreur inconnue';
                setError(`Erreur ${status || ''} - Impossible de créer une conversation de test. ${msg}${details ? ' - ' + details : ''}`.trim());
              }
            }}
            className="w-full sm:w-auto px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            title="Créer une conversation de test"
          >
            Créer une conversation de test
          </button>
          <button
            onClick={() => fetchConversations()}
            className="w-full sm:w-auto px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            title="Actualiser"
          >
            Actualiser
          </button>
          {selectedChat?.id && (
            <button
              onClick={() => fetchMessages(selectedChat.id)}
              className="w-full sm:w-auto px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              title="Rafraîchir la conversation"
            >
              Rafraîchir la conversation
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Conversations</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{conversations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">En Ligne</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {conversations.filter(c => c.status === 'online').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Messages Non Lus</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {conversations.reduce((sum, c) => sum + c.unread, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Temps Réponse Moy.</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">2.5 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interface de chat */}
      <div className="flex flex-col lg:flex-row h-96 lg:h-[600px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Liste des conversations */}
        <div className={`${selectedChat ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200`}>
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Conversations</h3>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.map((conv, idx) => (
              <div
                key={conv.id || `conv-${idx}`}
                onClick={async () => {
                  setSelectedChat(conv);
                  await fetchMessages(conv.id);
                }}
                className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.id === conv.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{conv.customer}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">{conv.time}</p>
                    {conv.unread > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`${selectedChat ? 'block' : 'hidden lg:block'} flex-1 flex flex-col`}>
          {selectedChat ? (
            <>
              {/* En-tête du chat */}
              <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <button 
                      onClick={() => { setSelectedChat(null); setMessages([]); }}
                      className="lg:hidden mr-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      ←
                    </button>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedChat.customer}</p>
                      <p className="text-xs text-gray-500">
                        {selectedChat.status === 'online' ? 'En ligne' : 'Hors ligne'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((m, idx) => (
                    <div key={m._id || m.id || `msg-${idx}-${m.createdAt || ''}`} className={`flex ${m.sender?.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${m.sender?.role === 'admin' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-lg p-2 sm:p-3 max-w-xs`}>
                        <p className="text-xs sm:text-sm">{m.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${m.sender?.role === 'admin' ? 'text-green-100' : 'text-gray-500'}`}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                          {m.sender?.role === 'admin' && (
                            <span className="text-[10px] ml-2">
                              {(m.readAt || m.isRead || (Array.isArray(m.readBy) && m.readBy.length>0)) ? 'Lu ✓✓' : 'Envoyé ✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              </div>

              {/* Zone de saisie */}
              <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
                {attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((f, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {f.name}
                        <button
                          type="button"
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i!==idx))}
                          title="Retirer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e)=> setAttachments(Array.from(e.target.files||[]))} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title="Joindre des fichiers"
                  >
                    📎
                  </button>
                  <button
                    onClick={async () => {
                      if (!message.trim() || !selectedChat) return;
                      try {
                        const payload = attachments.length ? { content: message, type: 'text', attachments } : { content: message, type: 'text' };
                        const resp = await chatService.sendMessage(selectedChat.id, payload);
                        const sent = resp?.data || { content: message, sender: { role: 'admin' }, createdAt: new Date().toISOString(), id: Date.now() };
                        setMessages(prev => [...prev, sent]);
                        setMessage('');
                        setAttachments([]);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
                      } catch (e) {
                        // Ignorer pour l'instant
                      }
                    }}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500">Sélectionnez une conversation pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModule;

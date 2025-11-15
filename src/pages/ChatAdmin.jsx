import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Bot, Phone, Video, MoreVertical, Paperclip, Smile, Search, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatService, authService } from '../services/api';
import { toArray } from '../utils/apiHelpers';

const ChatAdmin = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  // using shared toArray from utils/apiHelpers

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError('');
        const resp = await chatService.getConversations();
        const list = toArray(resp?.data);
        const mapped = list.map(c => ({
          id: c._id || c.id,
          participant: { 
            id: c.customer?._id || c.participant?._id || 'n/a', 
            name: c.customer?.name || c.title || 'Client', 
            role: c.customer?.role || 'client', 
            avatar: c.customer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', 
            status: c.status === 'active' ? 'online' : 'offline' 
          },
          lastMessage: c.lastMessage?.content || '',
          timestamp: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          unreadCount: Number(c.unreadCount || 0),
          type: c.type || 'support'
        }));
        setConversations(mapped);
        if (mapped.length) {
          setSelectedConversation(mapped[0]);
          await loadMessages(mapped[0].id);
        }
        setOnlineUsers([]);
      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message || e?.message || 'Erreur inconnue';
        setError(`Erreur ${status || ''} - Impossible de charger les conversations. ${msg}`.trim());
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [user]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const payload = attachments.length ? { content: newMessage, type: 'text', attachments } : { content: newMessage, type: 'text' };
      const resp = await chatService.sendMessage(selectedConversation.id, payload);
      const sent = resp?.data || { id: Date.now(), sender: { role: 'admin' }, content: newMessage, createdAt: new Date() };
      const msg = { id: sent._id || sent.id, senderId: user?.id || 1, senderName: user?.name || 'Admin', message: sent.content, timestamp: new Date(sent.createdAt || Date.now()), type: 'text' };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      // noop
    }
  };
  
  const loadMessages = async (conversationId) => {
    try {
      const resp = await chatService.getMessages(conversationId);
      const list = toArray(resp?.data);
      const normalized = list.map(m => ({ id: m._id || m.id, senderId: m.sender?._id || m.senderId, senderName: m.sender?.name || 'Utilisateur', message: m.content, timestamp: new Date(m.createdAt || Date.now()), type: m.type || 'text' }));
      setMessages(normalized);
      // Mark last incoming message as read
      const lastIncoming = [...normalized].reverse().find(m => m.senderId && m.senderId !== (user?.id || 1));
      if (lastIncoming && (lastIncoming.id)) {
        try { await chatService.markMessageRead(lastIncoming.id); } catch {}
      }
    } catch (e) {
      setMessages([]);
    }
  };
  
  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
  };
  
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatLastMessageTime = (date) => {
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      }).format(date);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen">
          {/* Sidebar des conversations */}
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{onlineUsers.length} en ligne</span>
                  <button
                    onClick={async () => {
                      try {
                        setError('');
                        // Get current user id for participants
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
                        // seed first message
                        await chatService.sendMessage(id, { content: "Bonjour, ceci est une conversation de test.", type: 'text' });
                        // Fetch conversations to include the new one and select it
                        const resp = await chatService.getConversations();
                        const list = toArray(resp?.data);
                        const mapped = list.map(c => ({
                          id: c._id || c.id,
                          participant: { 
                            id: c.customer?._id || c.participant?._id || 'n/a', 
                            name: c.customer?.name || c.title || 'Client', 
                            role: c.customer?.role || 'client', 
                            avatar: c.customer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', 
                            status: c.status === 'active' ? 'online' : 'offline' 
                          },
                          lastMessage: c.lastMessage?.content || '',
                          timestamp: c.updatedAt ? new Date(c.updatedAt) : new Date(),
                          unreadCount: Number(c.unreadCount || 0),
                          type: c.type || 'support'
                        }));
                        setConversations(mapped);
                        const newly = mapped.find(m => m.id === id) || mapped[0];
                        if (newly) {
                          setSelectedConversation(newly);
                          await loadMessages(newly.id);
                        }
                      } catch (e) {
                        const status = e?.response?.status;
                        const errors = e?.response?.data?.errors;
                        const details = Array.isArray(errors) ? errors.map(er => `${er.param||er.path||''}: ${ er.msg || er.message || ''}`).join('; ') : '';
                        const msg = e?.response?.data?.message || e?.message || 'Erreur inconnue';
                        setError(`Erreur ${status || ''} - Impossible de créer une conversation de test. ${msg}${details ? ' - ' + details : ''}`.trim());
                      }
                    }}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    title="Créer une conversation de test"
                  >
                    Conversation de test
                  </button>
                  <button
                    onClick={() => {
                      // manual refresh
                      (async () => {
                        try {
                          setError('');
                          const resp = await chatService.getConversations();
                          const list = resp?.data || [];
                          const mapped = list.map(c => ({
                            id: c._id || c.id,
                            participant: { 
                              id: c.customer?._id || c.participant?._id || 'n/a', 
                              name: c.customer?.name || c.title || 'Client', 
                              role: c.customer?.role || 'client', 
                              avatar: c.customer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', 
                              status: c.status === 'active' ? 'online' : 'offline' 
                            },
                            lastMessage: c.lastMessage?.content || '',
                            timestamp: c.updatedAt ? new Date(c.updatedAt) : new Date(),
                            unreadCount: Number(c.unreadCount || 0),
                            type: c.type || 'support'
                          }));
                          setConversations(mapped);
                        } catch (e) {
                          const status = e?.response?.status;
                          const msg = e?.response?.data?.message || e?.message || 'Erreur inconnue';
                          setError(`Erreur ${status || ''} - Impossible de charger les conversations. ${msg}`.trim());
                        }
                      })();
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    title="Actualiser"
                  >
                    Actualiser
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Liste des conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={conversation.participant.avatar}
                        alt={conversation.participant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        conversation.participant.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participant.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(conversation.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conversation.type === 'support' ? 'bg-blue-100 text-blue-800' :
                          conversation.type === 'producteur' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {conversation.type === 'support' ? 'Support' :
                           conversation.type === 'producteur' ? 'Producteur' : 'Livraison'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Zone de chat principale */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header de la conversation */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedConversation.participant.avatar}
                        alt={selectedConversation.participant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedConversation.participant.name}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedConversation.participant.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm text-gray-600">
                            {selectedConversation.participant.status === 'online' ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === (user?.id || 1) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${
                        msg.senderId === (user?.id || 1) ? 'order-2' : 'order-1'
                      }`}>
                        <div className={`px-4 py-2 rounded-2xl ${
                          msg.senderId === (user?.id || 1)
                            ? 'bg-green-600 text-white rounded-br-md' 
                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <div className={`flex items-center mt-1 space-x-1 text-xs text-gray-500 ${
                          msg.senderId === (user?.id || 1) ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{formatTime(msg.timestamp)}</span>
                          {msg.senderId === (user?.id || 1) && (
                            <span>✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Zone de saisie */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {selectedConversation?.id && (
                        <button
                          type="button"
                          onClick={() => loadMessages(selectedConversation.id)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                          title="Rafraîchir la conversation"
                        >
                          ↻
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e)=> setAttachments(Array.from(e.target.files||[]))} />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-9 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                        title="Joindre des fichiers"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
                  <p className="text-gray-600">Choisissez une conversation dans la liste pour commencer à discuter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAdmin;

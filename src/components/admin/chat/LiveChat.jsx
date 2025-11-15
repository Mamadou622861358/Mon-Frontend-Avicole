import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Minimize2,
  Maximize2,
  User,
  Bot
} from 'lucide-react';
import { chatService, authService } from '../../../services/api';
import { toArray } from '../../../utils/apiHelpers';

const LiveChat = () => {
  const location = useLocation();
  const incomingTicket = location.state?.ticket; // { id, farmId, farmName }
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMinimized, setIsMinimized] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  // Using shared toArray helper from utils/apiHelpers

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError('');
    
      const resp = await chatService.getConversations();
      const list = toArray(resp?.data);
      // Map to UI shape used here
      const mapped = list.map(c => ({
        id: c._id || c.id,
        customer: {
          name: c.customer?.name || c.title || 'Client',
          avatar: c.customer?.avatar || null,
          email: c.customer?.email || '—',
          phone: c.customer?.phone || '—',
          location: c.customer?.location || '—',
        },
        status: c.status || 'active',
        priority: c.priority || 'medium',
        lastMessage: c.lastMessage?.content || '',
        timestamp: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        unreadCount: Number(c.unreadCount || 0),
        ticket: c.metadata?.ticket || null,
        raw: c,
      }));

      // If a ticket is passed from inbox, create contextual conversation if none
      let initial = mapped;
      if (incomingTicket) {
        try {
          const created = await chatService.createConversation({
            type: 'support',
            subject: `Ticket #${incomingTicket.id} - ${incomingTicket.farmName || 'Ferme'}`,
            metadata: { ticket: { id: incomingTicket.id, farmId: incomingTicket.farmId, farmName: incomingTicket.farmName } },
          });
          const conv = created?.data || created;
          initial = [{
            id: conv._id || conv.id,
            customer: {
              name: incomingTicket.farmName || 'Client ferme',
              avatar: null,
              email: '—',
              phone: '—',
              location: '—'
            },
            status: conv.status || 'active',
            priority: conv.priority || 'high',
            lastMessage: conv.lastMessage?.content || '',
            timestamp: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
            unreadCount: Number(conv.unreadCount || 0),
            ticket: { id: incomingTicket.id, farmName: incomingTicket.farmName, farmId: incomingTicket.farmId },
            raw: conv,
          }, ...mapped];
        } catch {
          // ignore if creation fails
        }
      }

      setConversations(initial);
      if (initial.length > 0) {
        setActiveConversation(initial[0]);
        await loadMessages(initial[0].id);
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || 'Erreur inconnue';
      setError(`Erreur ${status || ''} - Impossible de charger les conversations. ${msg}`.trim());
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const resp = await chatService.getMessages(conversationId);
      const list = toArray(resp?.data);
      setActiveConversation(prev => prev); // keep
      // Ensure timestamps are Date for formatter
      const normalized = list.map(m => ({ ...m, timestamp: m.createdAt ? new Date(m.createdAt) : (m.timestamp ? new Date(m.timestamp) : new Date()) }));
      setActiveConversation(prev => prev ? { ...prev, messages: normalized } : prev);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
      // Mark last incoming message as read
      const lastIncoming = [...normalized].reverse().find(m => m.sender && m.sender.role !== 'admin' && (m._id || m.id));
      if (lastIncoming && (lastIncoming._id || lastIncoming.id)) {
        try { await chatService.markMessageRead(lastIncoming._id || lastIncoming.id); } catch {}
      }
    } catch {
      setActiveConversation(prev => prev ? { ...prev, messages: [] } : prev);
    }
  };

  useEffect(() => { loadConversations(); }, [incomingTicket]);

  // Auto-refresh every 10s: refresh conversations and active conversation messages
  useEffect(() => {
    const id = setInterval(() => {
      loadConversations();
      if (activeConversation?.id) {
        loadMessages(activeConversation.id);
      }
    }, 10000);
    return () => clearInterval(id);
  }, [activeConversation?.id, incomingTicket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    try {
      const payload = attachments.length ? { content: message, type: 'text', attachments } : { content: message, type: 'text' };
      const resp = await chatService.sendMessage(activeConversation.id, payload);
      const sent = resp?.data || { id: Date.now(), sender: { role: 'admin' }, content: message, createdAt: new Date() };
      const msg = { ...sent, timestamp: sent.createdAt ? new Date(sent.createdAt) : new Date() };
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, lastMessage: msg.content, timestamp: new Date() }
          : conv
      ));
      setActiveConversation(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), msg]
      }));
      setMessage('');
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch (e) {
      // Optionally show error toast
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60 * 1000) return 'À l\'instant';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} min`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} h`;
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat Support Client</h1>
            <p className="text-gray-600">Gérez les conversations en temps réel avec vos clients</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {onlineAgents} agents en ligne
            </div>
            <button
              onClick={async () => {
                try {
                  setError('');
                  // Fetch current user profile to satisfy participants validator
                  const me = await authService.getProfile();
                  const myId = me?.data?.user?.id || me?.data?.user?._id || me?.data?.data?._id || me?.data?._id;
                  const created = await chatService.createConversation({
                    type: 'support',
                    title: `Test ${new Date().toLocaleString('fr-FR')}`,
                    participants: myId ? [{ user: myId, role: 'admin' }] : [],
                    metadata: { createdBy: 'admin-ui' },
                  });
                  const conv = created?.data?.data || created?.data;
                  const newId = conv?._id || conv?.id;
                  if (!newId) throw new Error('ID de conversation introuvable dans la réponse API');
                  await chatService.sendMessage(newId, { content: 'Bonjour, ceci est une conversation de test.', type: 'text' });
                  await loadConversations();
                  setActiveConversation({ id: newId, customer: { name: 'Client (test)' }, status: 'active', priority: 'high', messages: [] });
                  await loadMessages(newId);
                } catch (e) {
                  const status = e?.response?.status;
                  const errors = e?.response?.data?.errors;
                  const details = Array.isArray(errors) ? errors.map(er => `${er.param||er.path||''}: ${ er.msg || er.message || ''}`).join('; ') : '';
                  const msg = e?.response?.data?.message || e?.message || 'Erreur inconnue';
                  setError(`Erreur ${status || ''} - Impossible de créer une conversation de test. ${msg}${details ? ' - ' + details : ''}`.trim());
                }
              }}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Créer une conversation de test
            </button>
            <button
              onClick={() => loadConversations()}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            >
              Actualiser
            </button>
            {activeConversation?.id && (
              <button
                onClick={() => loadMessages(activeConversation.id)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Rafraîchir la conversation
              </button>
            )}
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Users className="w-4 h-4 mr-2" />
              Équipe
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[700px] flex">
        {/* Liste des conversations */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header de la liste */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="waiting">En attente</option>
                <option value="resolved">Résolus</option>
              </select>
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={async () => { setActiveConversation(conversation); await loadMessages(conversation.id); }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 border-l-4 ${getPriorityColor(conversation.priority)} ${
                  activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{conversation.customer.name}</h4>
                        {conversation.ticket && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Ticket #{conversation.ticket.id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{conversation.customer.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">{formatDate(conversation.timestamp)}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conversation.status)}`}>
                    {conversation.status === 'active' && 'Actif'}
                    {conversation.status === 'waiting' && 'En attente'}
                    {conversation.status === 'resolved' && 'Résolu'}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{conversation.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Header du chat */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{activeConversation.customer.name}</h3>
                        {activeConversation.ticket && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Ticket #{activeConversation.ticket.id}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{activeConversation.customer.email}</span>
                        <span className="mx-2">•</span>
                        <span>{activeConversation.customer.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(activeConversation.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender?.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender?.role === 'admin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender?.role === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows="2"
                    />
                  </div>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e)=> setAttachments(Array.from(e.target.files||[]))} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="Joindre des fichiers"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-500">Choisissez une conversation dans la liste pour commencer à chatter</p>
              </div>
            </div>
          )}
        </div>

        {/* Panneau d'informations client */}
        {activeConversation && (
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Informations Client</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">{activeConversation.customer.name}</h4>
                  <p className="text-sm text-gray-500">{activeConversation.customer.location}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">{activeConversation.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Téléphone:</span>
                    <span className="text-sm text-gray-900">{activeConversation.customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Statut:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(activeConversation.status)}`}>
                      {activeConversation.status === 'active' && 'Actif'}
                      {activeConversation.status === 'waiting' && 'En attente'}
                      {activeConversation.status === 'resolved' && 'Résolu'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priorité:</span>
                    <span className="text-sm text-gray-900 capitalize">{activeConversation.priority}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Actions rapides</h5>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                      Voir l'historique des commandes
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                      Créer un ticket de support
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                      Transférer à un spécialiste
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                      Bloquer l'utilisateur
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Réponses rapides</h5>
                  <div className="space-y-1">
                    {[
                      'Merci pour votre message',
                      'Je vérifie votre commande',
                      'Pouvez-vous me donner plus de détails ?',
                      'Je vous recontacte dans 24h'
                    ].map((response, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(response)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {response}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;

import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Eye, MessageCircle, Clock, User, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from "react-router-dom";
import { forumService } from '../../services/api';

const Forums = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sort, setSort] = useState('recent'); // recent | popular | oldest
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: 'general' });

  // Align with backend enum in backend/src/routes/forums.js
  const categories = [
    { value: 'all', label: 'Toutes les catégories', color: 'gray' },
    { value: 'general', label: 'Général', color: 'blue' },
    { value: 'technique', label: 'Technique', color: 'green' },
    { value: 'sante', label: 'Santé', color: 'red' },
    { value: 'alimentation', label: 'Alimentation', color: 'yellow' },
    { value: 'equipement', label: 'Équipement', color: 'purple' },
    { value: 'vente', label: 'Vente', color: 'indigo' },
    { value: 'achat', label: 'Achat', color: 'pink' },
    { value: 'conseils', label: 'Conseils', color: 'teal' },
  ];

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const sortBy = sort === 'popular' ? 'views' : 'createdAt';
        const sortOrder = sort === 'oldest' ? 'asc' : 'desc';
        const params = {
          limit: 10,
          page,
          sortBy,
          sortOrder,
          ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
          ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
        };
        const res = await forumService.getAll(params);
        const payload = res?.data;
        const list = payload?.data?.forums || payload?.data || payload?.forums || [];
        const items = Array.isArray(list) ? list : [];
        // Normalize minimal fields for rendering
        const normalized = items.map((t) => {
          const id = (t && (t._id || t.id)) ? String(t._id || t.id) : undefined;
          const authorFromObj = (obj) =>
            obj?.name || obj?.fullName || obj?.prenom && obj?.nom && `${obj.prenom} ${obj.nom}`.trim() || obj?.email || null;
          const authorRaw = typeof t?.author === 'string' ? t.author : authorFromObj(t?.author);
          const userRaw = authorFromObj(t?.user);
          const author = authorRaw || userRaw || t?.authorName || 'Utilisateur';
          const tagsArr = Array.isArray(t?.tags) ? t.tags.map((tg) => {
            if (typeof tg === 'string') return tg;
            if (tg && (tg.name || tg.label || tg.value)) return String(tg.name || tg.label || tg.value);
            try { return JSON.stringify(tg); } catch { return String(tg); }
          }) : [];
          return {
            id,
            title: typeof t?.title === 'string' ? t.title : String(t?.title || ''),
            content: typeof t?.content === 'string' ? t.content : String(t?.content || ''),
            author,
            authorAvatar: t?.authorAvatar || '/images/avatars/default.png',
            category: typeof t?.category === 'string' ? t.category : 'general',
            createdAt: t?.createdAt || null,
            replies: t?.repliesCount || (Array.isArray(t?.replies) ? t.replies.length : 0),
            views: t?.views || 0,
            likes: (typeof t?.likesCount === 'number') ? t.likesCount : (Array.isArray(t?.likes) ? t.likes.length : (t?.likes || 0)),
            lastReply: t?.lastReplyAt || null,
            lastReplyBy: typeof t?.lastReplyBy === 'string' ? t.lastReplyBy : authorFromObj(t?.lastReplyBy) || null,
            pinned: !!t?.pinned,
            tags: tagsArr,
          };
        });
        if (!cancelled) {
          setTopics(normalized);
          const meta = payload?.meta || {};
          if (meta && (meta.totalPages || meta.page)) {
            setTotalPages(Number(meta.totalPages) || 1);
          } else {
            setTotalPages(normalized.length === 10 ? page + 1 : page);
          }
        }
      } catch (e) {
        console.error('[Forums] Chargement des forums échoué:', e);
        if (!cancelled) {
          setTopics([]);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250); // debounce 250ms
    return () => { cancelled = true; clearTimeout(t); };
  }, [searchTerm, selectedCategory, sort, page]);

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'gray';
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const handleSubmitTopic = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vous devez être connecté pour créer un sujet');
      return;
    }
    try {
      const payload = {
        title: newTopic.title,
        content: newTopic.content,
        category: newTopic.category,
      };
      await forumService.create(payload);
      setShowAddTopic(false);
      setNewTopic({ title: '', content: '', category: 'general' });
      // Reload list
      try {
        const res = await forumService.getAll({ limit: 50 });
        const list = res?.data?.data?.forums || res?.data?.data || [];
        const items = Array.isArray(list) ? list : [];
        const normalized = items.map((t) => {
          const id = (t && (t._id || t.id)) ? String(t._id || t.id) : undefined;
          const authorFromObj = (obj) =>
            obj?.name || obj?.fullName || obj?.prenom && obj?.nom && `${obj.prenom} ${obj.nom}`.trim() || obj?.email || null;
          const authorRaw = typeof t?.author === 'string' ? t.author : authorFromObj(t?.author);
          const userRaw = authorFromObj(t?.user);
          const author = authorRaw || userRaw || t?.authorName || 'Utilisateur';
          const tagsArr = Array.isArray(t?.tags) ? t.tags.map((tg) => {
            if (typeof tg === 'string') return tg;
            if (tg && (tg.name || tg.label || tg.value)) return String(tg.name || tg.label || tg.value);
            try { return JSON.stringify(tg); } catch { return String(tg); }
          }) : [];
          return {
            id,
            title: typeof t?.title === 'string' ? t.title : String(t?.title || ''),
            content: typeof t?.content === 'string' ? t.content : String(t?.content || ''),
            author,
            authorAvatar: t?.authorAvatar || '/images/avatars/default.png',
            category: typeof t?.category === 'string' ? t.category : 'general',
            createdAt: t?.createdAt || null,
            replies: t?.repliesCount || (Array.isArray(t?.replies) ? t.replies.length : 0),
            views: t?.views || 0,
            lastReply: t?.lastReplyAt || null,
            lastReplyBy: typeof t?.lastReplyBy === 'string' ? t.lastReplyBy : authorFromObj(t?.lastReplyBy) || null,
            pinned: !!t?.pinned,
            tags: tagsArr,
          };
        });
        setTopics(normalized);
      } catch {}
    } catch (err) {
      console.error('[Forums] Création échouée:', err);
      alert("Impossible de créer le sujet. Vérifiez les champs.");
    }
  };

  const filteredTopics = topics; // déjà filtré côté serveur par search/category


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Chargement du forum...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forum Communautaire</h1>
          <p className="text-gray-600">Échangez avec la communauté d'éleveurs avicoles</p>
        </div>

        {/* Barre d'actions */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Recherche */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher dans le forum..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Filtre catégorie */}
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {/* Tri */}
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="recent">Plus récents</option>
                <option value="popular">Populaires</option>
                <option value="oldest">Plus anciens</option>
              </select>
            </div>

            {/* Bouton nouveau sujet */}
            <button
              onClick={() => setShowAddTopic(true)}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau sujet
            </button>
          </div>
        </div>

        {/* Liste des sujets */}
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${topic.pinned ? 'border-green-200 bg-green-50' : ''}`}>
              <div className="flex items-start space-x-4">
                <img
                  src={topic.authorAvatar}
                  alt={topic.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {topic.pinned && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Épinglé
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                      {getCategoryLabel(topic.category)}
                    </span>
                    {topic.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600">
                    <Link to={`/forums/${topic.id}`} className="cursor-pointer">{topic.title}</Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{topic.content}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {topic.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(topic.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Link to={`/forums/${topic.id}`} className="flex items-center text-gray-500 hover:text-green-600">
                        <Eye className="w-4 h-4 mr-1" />
                        {topic.views}
                      </Link>
                      <Link to={`/forums/${topic.id}#replies`} className="flex items-center text-gray-500 hover:text-green-600">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {topic.replies}
                      </Link>
                      <Link to={`/forums/${topic.id}`} className="flex items-center text-gray-500 hover:text-green-600">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {topic.likes}
                      </Link>
                    </div>
                  </div>
                  
                  {topic.lastReply && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Dernière réponse par <span className="font-medium">{topic.lastReplyBy}</span> • {formatDate(topic.lastReply)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>

        {/* Modal d'ajout de sujet */}
        {showAddTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Créer un nouveau sujet</h2>
              <form onSubmit={handleSubmitTopic}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={newTopic.category}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    {categories.filter(c => c.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du sujet
                  </label>
                  <input
                    type="text"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Décrivez votre sujet en quelques mots..."
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu
                  </label>
                  <textarea
                    value={newTopic.content}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Décrivez votre question ou sujet en détail..."
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTopic(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Publier le sujet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun sujet trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Soyez le premier à créer un sujet dans cette catégorie !
            </p>
            <button
              onClick={() => setShowAddTopic(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Créer un sujet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forums;

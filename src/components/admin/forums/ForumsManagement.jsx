import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Users,
  Calendar,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../../services/api';

const ForumsManagement = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedForum, setSelectedForum] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    categorie: '',
    tags: '',
    statut: 'actif'
  });

  const categories = [
    'Élevage',
    'Alimentation',
    'Santé animale',
    'Équipements',
    'Vente',
    'Conseils',
    'Général'
  ];

  const statuses = [
    { value: 'actif', label: 'Actif', color: 'text-green-600 bg-green-100' },
    { value: 'suspendu', label: 'Suspendu', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'supprime', label: 'Supprimé', color: 'text-red-600 bg-red-100' }
  ];

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      setLoading(true);
      // Simuler des données de forums
      const mockForums = [
        {
          _id: '1',
          titre: 'Conseils pour l\'élevage de poussins',
          contenu: 'Je cherche des conseils pour bien élever mes poussins...',
          categorie: 'Élevage',
          auteur: { nom: 'Jean Dupont', email: 'jean@example.com' },
          statut: 'actif',
          likes: 15,
          reponses: 8,
          vues: 120,
          createdAt: '2024-01-15T10:00:00Z',
          tags: ['poussins', 'élevage', 'conseils']
        },
        {
          _id: '2',
          titre: 'Problème de santé chez mes poules',
          contenu: 'Mes poules semblent malades, que faire ?',
          categorie: 'Santé animale',
          auteur: { nom: 'Marie Martin', email: 'marie@example.com' },
          statut: 'actif',
          likes: 23,
          reponses: 12,
          vues: 89,
          createdAt: '2024-01-14T15:30:00Z',
          tags: ['santé', 'poules', 'maladie']
        },
        {
          _id: '3',
          titre: 'Vente de matériel d\'élevage',
          contenu: 'Je vends du matériel d\'élevage en bon état...',
          categorie: 'Vente',
          auteur: { nom: 'Paul Durand', email: 'paul@example.com' },
          statut: 'suspendu',
          likes: 5,
          reponses: 3,
          vues: 45,
          createdAt: '2024-01-13T09:15:00Z',
          tags: ['vente', 'matériel', 'équipement']
        }
      ];
      setForums(mockForums);
    } catch (error) {
      console.error('Erreur lors du chargement des forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddForum = async (e) => {
    e.preventDefault();
    try {
      // Ici vous appelleriez l'API pour créer le forum
      const newForum = {
        _id: Date.now().toString(),
        ...formData,
        auteur: { nom: 'Admin System', email: 'admin@guineeavicole.com' },
        likes: 0,
        reponses: 0,
        vues: 0,
        createdAt: new Date().toISOString(),
        tags: formData.tags.split(',').map(tag => tag.trim())
      };
      
      setForums(prev => [newForum, ...prev]);
      setShowAddModal(false);
      setFormData({ titre: '', contenu: '', categorie: '', tags: '', statut: 'actif' });
      alert('Forum ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du forum:', error);
      alert('Erreur lors de l\'ajout du forum');
    }
  };

  const handleEditForum = async (e) => {
    e.preventDefault();
    try {
      // Ici vous appelleriez l'API pour modifier le forum
      setForums(prev => prev.map(forum => 
        forum._id === selectedForum._id 
          ? { ...forum, ...formData, tags: formData.tags.split(',').map(tag => tag.trim()) }
          : forum
      ));
      setShowEditModal(false);
      setSelectedForum(null);
      setFormData({ titre: '', contenu: '', categorie: '', tags: '', statut: 'actif' });
      alert('Forum modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification du forum:', error);
      alert('Erreur lors de la modification du forum');
    }
  };

  const handleDeleteForum = async (forumId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce forum ?')) {
      try {
        // Ici vous appelleriez l'API pour supprimer le forum
        setForums(prev => prev.filter(forum => forum._id !== forumId));
        alert('Forum supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du forum:', error);
        alert('Erreur lors de la suppression du forum');
      }
    }
  };

  const handleStatusChange = async (forumId, newStatus) => {
    try {
      // Ici vous appelleriez l'API pour changer le statut
      setForums(prev => prev.map(forum => 
        forum._id === forumId ? { ...forum, statut: newStatus } : forum
      ));
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const openEditModal = (forum) => {
    setSelectedForum(forum);
    setFormData({
      titre: forum.titre,
      contenu: forum.contenu,
      categorie: forum.categorie,
      tags: forum.tags.join(', '),
      statut: forum.statut
    });
    setShowEditModal(true);
  };

  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.contenu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.auteur.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || forum.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Gestion des Forums</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Forum
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans les forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            {filteredForums.length} forum(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Liste des forums */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistiques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredForums.map((forum) => (
                <tr key={forum._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {forum.titre}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {forum.contenu.substring(0, 100)}...
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {forum.categorie}
                        </span>
                        {forum.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {forum.auteur.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {forum.auteur.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {forum.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {forum.reponses}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {forum.vues}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={forum.statut}
                      onChange={(e) => handleStatusChange(forum._id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 ${
                        statuses.find(s => s.value === forum.statut)?.color
                      }`}
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(forum.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(forum)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteForum(forum._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Ajouter un nouveau forum</h2>
            <form onSubmit={handleAddForum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu
                </label>
                <textarea
                  name="contenu"
                  value={formData.contenu}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="élevage, conseils, poules"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Modifier le forum</h2>
            <form onSubmit={handleEditForum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu
                </label>
                <textarea
                  name="contenu"
                  value={formData.contenu}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="élevage, conseils, poules"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumsManagement;

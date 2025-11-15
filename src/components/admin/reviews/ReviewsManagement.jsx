import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Search, 
  Filter,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const reviewStatuses = [
    { value: 'approuve', label: 'Approuvé', color: 'text-green-600 bg-green-100' },
    { value: 'en_attente', label: 'En attente', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'rejete', label: 'Rejeté', color: 'text-red-600 bg-red-100' }
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const mockReviews = [
        {
          _id: '1',
          client: { nom: 'Jean Dupont', email: 'jean@example.com' },
          produit: { nom: 'Poules pondeuses Rhode Island', id: 'prod-001' },
          note: 5,
          commentaire: 'Excellentes poules, très productives en œufs. Je recommande vivement !',
          statut: 'approuve',
          likes: 8,
          dislikes: 0,
          createdAt: '2024-01-15T10:00:00Z',
          photos: ['photo1.jpg', 'photo2.jpg']
        },
        {
          _id: '2',
          client: { nom: 'Marie Martin', email: 'marie@example.com' },
          produit: { nom: 'Aliment volaille premium', id: 'prod-002' },
          note: 4,
          commentaire: 'Bon produit, mes poules semblent l\'apprécier. Livraison rapide.',
          statut: 'en_attente',
          likes: 3,
          dislikes: 1,
          createdAt: '2024-01-14T15:30:00Z',
          photos: []
        },
        {
          _id: '3',
          client: { nom: 'Paul Diallo', email: 'paul@example.com' },
          produit: { nom: 'Poussins Leghorn', id: 'prod-003' },
          note: 2,
          commentaire: 'Poussins arrivés en mauvais état, plusieurs sont morts rapidement.',
          statut: 'en_attente',
          likes: 0,
          dislikes: 5,
          createdAt: '2024-01-13T09:15:00Z',
          photos: ['photo3.jpg']
        }
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      setReviews(prev => prev.map(review => 
        review._id === reviewId ? { ...review, statut: newStatus } : review
      ));
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      alert('Avis supprimé avec succès');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.commentaire.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !selectedRating || review.note.toString() === selectedRating;
    const matchesStatus = !selectedStatus || review.statut === selectedStatus;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Gestion des Avis Clients</h1>
        <div className="text-sm text-gray-600">
          {reviews.filter(r => r.statut === 'en_attente').length} avis en attente de modération
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les notes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              {reviewStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            {filteredReviews.length} avis trouvé(s)
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const statusInfo = reviewStatuses.find(s => s.value === review.statut);
          
          return (
            <div key={review._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        {renderStars(review.note)}
                        <span className="ml-2 text-sm font-medium text-gray-900">{review.note}/5</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{review.client.nom}</span>
                      <span className="text-gray-500 ml-2">({review.client.email})</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Produit: <span className="font-medium text-gray-900">{review.produit.nom}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">{review.commentaire}</p>
                  </div>

                  {review.photos && review.photos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Photos jointes:</p>
                      <div className="flex space-x-2">
                        {review.photos.map((photo, index) => (
                          <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Eye className="w-6 h-6 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.likes} utile(s)
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {review.dislikes} pas utile(s)
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-6 mt-4 lg:mt-0">
                  <select
                    value={review.statut}
                    onChange={(e) => handleStatusChange(review._id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {reviewStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(review._id, 'approuve')}
                      className="flex items-center justify-center px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(review._id, 'rejete')}
                      className="flex items-center justify-center px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="flex items-center justify-center px-3 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun avis trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;

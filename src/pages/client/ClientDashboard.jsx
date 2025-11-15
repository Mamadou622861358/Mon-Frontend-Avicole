import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  Star, 
  Heart, 
  MessageSquare,
  MapPin,
  Plus,
  ChevronRight
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    favoriteProducts: 0,
    savedFarms: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [savedFarms, setSavedFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientDashboardData();
  }, []);

  const loadClientDashboardData = async () => {
    try {
      // TODO: Remplacer par des appels API réels
      // Données de test pour le moment
      setStats({
        totalOrders: 5,
        pendingOrders: 2,
        favoriteProducts: 3,
        savedFarms: 2
      });

      setRecentOrders([
        {
          id: 'ORD-001',
          date: '2023-10-15',
          status: 'en_cours',
          total: 125000,
          items: [
            { name: 'Poulet Fermier', quantity: 2, price: 5000 },
            { name: 'Œufs Frais (12)', quantity: 1, price: 2500 }
          ]
        },
        {
          id: 'ORD-002',
          date: '2023-10-10',
          status: 'livre',
          total: 75000,
          items: [
            { name: 'Poulet de Chair', quantity: 1, price: 5000 }
          ]
        }
      ]);

      setRecommendedProducts([
        {
          id: 1,
          name: 'Poulet Fermier Bio',
          price: 6000,
          unit: 'kg',
          rating: 4.8,
          image: '/images/products/chicken.jpg',
          farm: 'Ferme Bio du Sahel'
        },
        {
          id: 2,
          name: 'Œufs Frais',
          price: 1200,
          unit: 'douzaine',
          rating: 4.9,
          image: '/images/products/eggs.jpg',
          farm: 'Élevage Moderne'
        },
        {
          id: 3,
          name: 'Pintade Fermière',
          price: 8000,
          unit: 'kg',
          rating: 4.7,
          image: '/images/products/guinea-fowl.jpg',
          farm: 'Ferme Avicole de Kindia'
        }
      ]);

      setSavedFarms([
        {
          id: 1,
          name: 'Ferme Bio du Sahel',
          location: 'Kindia',
          rating: 4.8,
          image: '/images/farms/farm1.jpg',
          products: ['Poulet Fermier Bio', 'Œufs Bio']
        },
        {
          id: 2,
          name: 'Élevage Moderne',
          location: 'Mamou',
          rating: 4.5,
          image: '/images/farms/farm2.jpg',
          products: ['Poulet de Chair', 'Œufs Frais']
        }
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
      showError('Impossible de charger les données du tableau de bord');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'en_cours': 'En cours',
      'livre': 'Livré',
      'annule': 'Annulé',
      'en_attente': 'En attente'
    };
    
    const statusClass = {
      'en_cours': 'bg-blue-100 text-blue-800',
      'livre': 'bg-green-100 text-green-800',
      'annule': 'bg-red-100 text-red-800',
      'en_attente': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto py-8">
      {/* En-tête de bienvenue */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.name || 'Client'}
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité sur GuinéeAvicole
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Commandes</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Favoris</p>
              <p className="text-2xl font-semibold">{stats.favoriteProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fermes suivies</p>
              <p className="text-2xl font-semibold">{stats.savedFarms}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dernières commandes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Dernières commandes</h2>
                <Link 
                  to="/mes-commandes" 
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Voir tout
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            Commande #{order.id}
                          </p>
                          <span className="ml-2">{getStatusBadge(order.status)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.date)}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {order.items.length} article{order.items.length > 1 ? 's' : ''} • {order.total.toLocaleString()} GNF
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/commande/${order.id}`}
                        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                      >
                        Voir les détails <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Aucune commande récente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fermes suivies */}
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Fermes suivies</h2>
                <Link 
                  to="/mes-fermes" 
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Voir tout
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {savedFarms.length > 0 ? (
                savedFarms.map((farm) => (
                  <div key={farm.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                        <img 
                          src={farm.image} 
                          alt={farm.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <Link 
                          to={`/ferme/${farm.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary"
                        >
                          {farm.name}
                        </Link>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">
                            {farm.rating}
                          </span>
                          <span className="mx-1 text-gray-300">•</span>
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span className="ml-1 text-sm text-gray-600">
                            {farm.location}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500 truncate">
                            Produits: {farm.products.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Vous ne suivez aucune ferme pour le moment
                  </p>
                  <Link
                    to="/fermes"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Plus className="-ml-1 mr-2 h-4 w-4" />
                    Découvrir des fermes
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Produits recommandés */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recommandés pour vous</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex">
                    <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-200">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            <Link to={`/produit/${product.id}`} className="hover:text-primary">
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500">{product.farm}</p>
                        </div>
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          <Heart className="h-5 w-5" />
                          <span className="sr-only">Ajouter aux favoris</span>
                        </button>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">
                            {product.rating}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.price.toLocaleString()} GNF
                          <span className="text-xs text-gray-500"> / {product.unit}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 text-center">
              <Link
                to="/produits"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Voir tous les produits <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section d'aide et support */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-medium text-gray-900">Besoin d'aide ?</h3>
            <p className="mt-1 text-sm text-gray-600">
              Notre équipe est là pour vous aider avec vos commandes ou toute question.
            </p>
          </div>
          <div className="flex flex-shrink-0 space-x-3">
            <Link
              to="/aide"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-50"
            >
              <MessageSquare className="-ml-1 mr-2 h-5 w-5" />
              Contacter le support
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
            >
              Voir la FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

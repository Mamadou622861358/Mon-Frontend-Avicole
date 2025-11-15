import {
  BarChart3,
  DollarSign,
  MapPin,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeFarms: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data - TODO: Remplacer par des appels API
      setStats({
        totalProducts: 12,
        totalOrders: 45,
        totalRevenue: 1250000,
        activeFarms: 3,
      });

      setRecentOrders([
        {
          id: 1,
          customerName: "Mamadou Diallo",
          product: "Poulet de chair",
          amount: 25000,
          status: "completed",
          date: "2025-08-16",
        },
        {
          id: 2,
          customerName: "Fatou Camara",
          product: "Œufs frais",
          amount: 15000,
          status: "pending",
          date: "2025-08-15",
        },
        {
          id: 3,
          customerName: "Ibrahima Barry",
          product: "Poussins",
          amount: 50000,
          status: "processing",
          date: "2025-08-14",
        },
      ]);

      setTopProducts([
        {
          id: 1,
          name: "Poulet de chair",
          sales: 25,
          revenue: 625000,
          rating: 4.8,
        },
        {
          id: 2,
          name: "Œufs frais",
          sales: 40,
          revenue: 60000,
          rating: 4.9,
        },
        {
          id: 3,
          name: "Poussins d'un jour",
          sales: 15,
          revenue: 75000,
          rating: 4.7,
        },
      ]);
    } catch (error) {
      showError(
        "Erreur",
        "Impossible de charger les données du tableau de bord"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "pending":
        return "En attente";
      case "processing":
        return "En cours";
      default:
        return "Inconnu";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Vérifier le rôle de l'utilisateur et afficher le contenu approprié
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
            <p className="text-gray-600 mt-2">
              Bienvenue, {user?.firstName} {user?.lastName}
            </p>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produits</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commandes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenus</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalRevenue.toLocaleString()} FG
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Fermes actives
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.activeFarms}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link
              to="/product-management"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Plus className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Ajouter un produit</p>
                  <p className="text-sm text-gray-500">
                    Créer un nouveau produit
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/farm-management"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Gérer les fermes</p>
                  <p className="text-sm text-gray-500">
                    Voir et modifier vos fermes
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/stats"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Statistiques</p>
                  <p className="text-sm text-gray-500">
                    Analyser vos performances
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/profile"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Settings className="h-6 w-6 text-gray-600" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Paramètres</p>
                  <p className="text-sm text-gray-500">Gérer votre profil</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Commandes récentes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Commandes récentes
                </h2>
              </div>
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-gray-500">{order.product}</p>
                          <p className="text-xs text-gray-400">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {order.amount.toLocaleString()} FG
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucune commande récente
                  </p>
                )}
              </div>
            </div>

            {/* Produits populaires */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Produits populaires
                </h2>
              </div>
              <div className="p-6">
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {product.rating}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {product.revenue.toLocaleString()} FG
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.sales} ventes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucun produit populaire
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Graphique de performance (placeholder) */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Performance du mois
              </h2>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique de performance à venir</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage par défaut pour les utilisateurs non-admin
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalRevenue.toLocaleString()} FG
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Fermes actives
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeFarms}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/product-management"
            className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors duration-200">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Ajouter un produit</p>
                <p className="text-sm text-gray-500">
                  Créer un nouveau produit
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/farm-management"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Gérer les fermes</p>
                <p className="text-sm text-gray-500">
                  Voir et modifier vos fermes
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/stats"
            // Ajouter ces classes aux cartes de statistiques
            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-50">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produits</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Paramètres</p>
                <p className="text-sm text-gray-500">Gérer votre profil</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Commandes récentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Commandes récentes
              </h2>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-500">{order.product}</p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.amount.toLocaleString()} FG
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune commande récente
                </p>
              )}
            </div>
          </div>

          {/* Produits populaires */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Produits populaires
              </h2>
            </div>
            <div className="p-6">
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {product.revenue.toLocaleString()} FG
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.sales} ventes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucun produit populaire
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Graphique de performance (placeholder) */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Performance du mois
            </h2>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graphique de performance à venir</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

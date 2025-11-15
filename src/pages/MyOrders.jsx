import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, AlertCircle, Eye, MapPin, User, DollarSign } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { orderService } from "../services/api";
import { useToast } from "../contexts/ToastContext";

const MyOrders = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll({ producer: user._id });
      setOrders(response.data.data.orders || []);
    } catch (error) {
      showError("Erreur", "Impossible de charger vos commandes");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      showSuccess("Statut mis à jour", "Le statut de la commande a été modifié");
      loadOrders();
    } catch (error) {
      showError("Erreur", "Impossible de mettre à jour le statut");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-purple-100 text-purple-800";
      case "shipped": return "bg-indigo-100 text-indigo-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "preparing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "En attente";
      case "confirmed": return "Confirmée";
      case "preparing": return "En préparation";
      case "shipped": return "Expédiée";
      case "delivered": return "Livrée";
      case "cancelled": return "Annulée";
      default: return "Inconnu";
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending": return "confirmed";
      case "confirmed": return "preparing";
      case "preparing": return "shipped";
      case "shipped": return "delivered";
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length
  };

  const totalRevenue = orders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
          <p className="text-gray-600 mt-2">
            Gérez et suivez les commandes de vos produits
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Livrées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} GNF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toutes ({stats.total})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En attente ({stats.pending})
            </button>
            <button
              onClick={() => setFilter("confirmed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "confirmed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmées ({stats.confirmed})
            </button>
            <button
              onClick={() => setFilter("preparing")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "preparing"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En préparation ({stats.preparing})
            </button>
            <button
              onClick={() => setFilter("shipped")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "shipped"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Expédiées ({stats.shipped})
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "delivered"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Livrées ({stats.delivered})
            </button>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-4">
          {loading ? (
            // Squelettes de chargement
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredOrders.length === 0 ? (
            // Aucune commande trouvée
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all" ? "Aucune commande pour le moment" : "Aucune commande trouvée"}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all" 
                  ? "Les commandes de vos produits apparaîtront ici"
                  : "Aucune commande ne correspond aux critères sélectionnés"
                }
              </p>
            </div>
          ) : (
            // Liste des commandes
            filteredOrders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Statut de la commande */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                  </div>

                  {/* Informations de la commande */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Commande #{order.orderNumber}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {order.items?.length || 0} produit(s) commandé(s)
                    </h3>

                    {/* Produits de la commande */}
                    <div className="space-y-2 mb-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>• {item.product?.name || "Produit"} x{item.quantity}</span>
                          <span className="text-gray-400">|</span>
                          <span>{item.price?.toLocaleString()} GNF</span>
                        </div>
                      ))}
                    </div>

                    {/* Informations client et livraison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{order.shippingAddress?.city}, {order.shippingAddress?.district}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Total: {order.totalAmount?.toLocaleString()} GNF</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Commande du {new Date(order.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir détails
                    </Link>
                    
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        {getNextStatus(order.status) === "confirmed" && "Confirmer"}
                        {getNextStatus(order.status) === "preparing" && "Préparer"}
                        {getNextStatus(order.status) === "shipped" && "Expédier"}
                        {getNextStatus(order.status) === "delivered" && "Marquer livrée"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

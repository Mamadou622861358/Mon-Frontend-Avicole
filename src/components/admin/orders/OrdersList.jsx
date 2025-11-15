import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Check, X, Truck, Package, Clock, ShoppingCart } from 'lucide-react';
import api from '../../../services/api';

const statusConfig = {
  en_attente: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  confirmee: {
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-800',
    icon: Package
  },
  en_preparation: {
    label: 'En préparation',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Package
  },
  expediee: {
    label: 'Expédiée',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck
  },
  livree: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800',
    icon: Check
  },
  annulee: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800',
    icon: X
  }
};

const OrdersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les commandes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/v1/orders');
      setOrders(data || []);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Mettre à jour le statut d'une commande
  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm('Confirmer le changement de statut ?')) {
      try {
        await api.put(`/api/v1/orders/${orderId}`, { statut: newStatus });
        alert('Statut de la commande mis à jour');
        fetchOrders();
      } catch (error) {
        alert(`Erreur lors de la mise à jour: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Filtrer les commandes
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.numeroCommande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || order.statut === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.dateCommande || b.createdAt) - new Date(a.dateCommande || a.createdAt));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Erreur lors du chargement des commandes: {error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Gestion des Commandes</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Aucune commande ne correspond aux critères de recherche.' : 'Aucune commande pour le moment.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = statusConfig[order.statut] || statusConfig.en_attente;
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.numeroCommande || order._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.client?.prenom} {order.client?.nom}
                        </div>
                        <div className="text-sm text-gray-500">{order.client?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.dateCommande || order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.dateCommande || order.createdAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('fr-GN', {
                            style: 'currency',
                            currency: 'GNF',
                            minimumFractionDigits: 0,
                          }).format(order.montantTotal || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border-0 ${statusInfo.color}`}
                          value={order.statut}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <option key={status} value={status}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;

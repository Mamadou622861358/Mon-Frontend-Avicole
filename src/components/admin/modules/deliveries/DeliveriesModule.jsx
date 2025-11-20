import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Trash2
} from 'lucide-react';
import { adminService } from '../../../../../services/api';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { useToast } from '../../../../contexts/ToastContext';

const DeliveriesModule = () => {
  const { showSuccess, showError } = useToast?.() || { showSuccess: ()=>{}, showError: ()=>{} };
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: 20 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newDelivery, setNewDelivery] = useState({
    orderId: '',
    customer: '',
    address: '',
    driver: '',
    phone: '',
    notes: ''
  });

  const fetchDeliveries = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDeliveries({
        q: searchTerm,
        status: filterStatus,
        page,
        limit: meta.limit,
        sort: 'createdAt',
        order: 'desc'
      });
      const data = res?.data?.data || [];
      const m = res?.data?.meta || { total: data.length, page: 1, totalPages: 1, limit: 20 };
      setDeliveries(data);
      setMeta(m);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      setError('Impossible de charger les livraisons');
      setDeliveries([]);
      setMeta({ total: 0, totalPages: 1, page: 1, limit: 20 });
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (delivery) => {
    setEditing({ ...delivery });
    setShowEditModal(true);
  };

  const onDelete = async (delivery) => {
    if (!confirm(`Supprimer la livraison #${delivery.id} ?`)) return;
    try {
      await adminService.deleteDelivery(delivery.id);
      showSuccess && showSuccess('Supprimée', 'La livraison a été supprimée.');
      await fetchDeliveries(meta.page);
    } catch (e) {
      showError && showError('Suppression impossible', e?.response?.data?.message || 'Erreur inconnue');
    }
  };

  useEffect(() => { fetchDeliveries(1); }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchDeliveries(1), 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterStatus]);

  // Escape key to close modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        if (showEditModal) setShowEditModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAddModal, showEditModal]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredDeliveries = Array.isArray(deliveries) ? deliveries : [];

  if (loading) {
    return <LoadingSpinner text="Chargement des livraisons..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6 relative">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Livraisons</h1>
          <p className="text-sm sm:text-base text-gray-600">Suivez et gérez toutes les livraisons</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle Livraison</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Livraisons</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{deliveries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-xl font-bold text-gray-900">
                {(Array.isArray(deliveries) ? deliveries : []).filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Truck className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">En Transit</p>
              <p className="text-xl font-bold text-gray-900">
                {(Array.isArray(deliveries) ? deliveries : []).filter(d => d.status === 'in_transit').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Livrées</p>
              <p className="text-xl font-bold text-gray-900">
                {(Array.isArray(deliveries) ? deliveries : []).filter(d => d.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une livraison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_transit">En transit</option>
              <option value="delivered">Livrée</option>
              <option value="failed">Échec</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des livraisons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livreur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heure Estimée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.id}</div>
                    <div className="text-sm text-gray-500">Commande: {delivery.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{delivery.customer}</div>
                    <div className="text-sm text-gray-500">{delivery.items} articles</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {delivery.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.driver}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1 capitalize">{delivery.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.estimatedTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" onClick={() => onEdit(delivery)}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => onDelete(delivery)}>
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

      {/* Modal d'ajout de livraison */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50" onClick={(e)=>{ if(e.target===e.currentTarget) setShowAddModal(false); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle Livraison</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await adminService.createDelivery({
                  orderId: newDelivery.orderId,
                  customer: newDelivery.customer,
                  address: newDelivery.address,
                  driver: newDelivery.driver,
                  phone: newDelivery.phone,
                  notes: newDelivery.notes,
                  status: 'pending'
                });
                await fetchDeliveries(meta.page);
                setNewDelivery({ orderId: '', customer: '', address: '', driver: '', phone: '', notes: '' });
                setShowAddModal(false);
                showSuccess && showSuccess('Créée', 'La livraison a été créée.');
              } catch (err) {
                showError && showError('Création impossible', err?.response?.data?.message || 'Erreur inconnue');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Commande</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: CMD-001"
                    value={newDelivery.orderId}
                    onChange={(e) => setNewDelivery({...newDelivery, orderId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    required
                    value={newDelivery.customer}
                    onChange={(e) => setNewDelivery({...newDelivery, customer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
                  <textarea
                    rows={2}
                    required
                    value={newDelivery.address}
                    onChange={(e) => setNewDelivery({...newDelivery, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Livreur</label>
                    <input
                      type="text"
                      required
                      value={newDelivery.driver}
                      onChange={(e) => setNewDelivery({...newDelivery, driver: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      required
                      value={newDelivery.phone}
                      onChange={(e) => setNewDelivery({...newDelivery, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                  <textarea
                    rows={2}
                    value={newDelivery.notes}
                    onChange={(e) => setNewDelivery({...newDelivery, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Créer la livraison
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de livraison */}
      {showEditModal && editing && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50" onClick={(e)=>{ if(e.target===e.currentTarget) setShowEditModal(false); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier la Livraison</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await adminService.updateDelivery(editing.id, {
                  orderId: editing.orderId,
                  customer: editing.customer,
                  address: editing.address,
                  driver: editing.driver,
                  phone: editing.phone,
                  notes: editing.notes,
                  status: editing.status || 'pending',
                  estimatedTime: editing.estimatedTime || ''
                });
                await fetchDeliveries(meta.page);
                setShowEditModal(false);
                showSuccess && showSuccess('Modifiée', 'La livraison a été mise à jour.');
              } catch (err) {
                showError && showError('Mise à jour impossible', err?.response?.data?.message || 'Erreur inconnue');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Commande</label>
                  <input type="text" required value={editing.orderId} onChange={(e)=>setEditing({...editing, orderId:e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input type="text" required value={editing.customer} onChange={(e)=>setEditing({...editing, customer:e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <textarea rows={2} required value={editing.address} onChange={(e)=>setEditing({...editing, address:e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Livreur</label>
                    <input type="text" required value={editing.driver} onChange={(e)=>setEditing({...editing, driver:e.target.value})} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" required value={editing.phone} onChange={(e)=>setEditing({...editing, phone:e.target.value})} className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows={2} value={editing.notes || ''} onChange={(e)=>setEditing({...editing, notes:e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select value={editing.status || 'pending'} onChange={(e)=>setEditing({...editing, status:e.target.value})} className="w-full px-3 py-2 border rounded">
                      <option value="pending">En attente</option>
                      <option value="in_transit">En transit</option>
                      <option value="delivered">Livrée</option>
                      <option value="failed">Échec</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure estimée</label>
                    <input type="text" value={editing.estimatedTime || ''} onChange={(e)=>setEditing({...editing, estimatedTime:e.target.value})} className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button type="button" onClick={()=>setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesModule;

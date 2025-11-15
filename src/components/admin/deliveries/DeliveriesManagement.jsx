import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Edit, 
  Search, 
  MapPin,
  Calendar,
  Package,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const DeliveriesManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const deliveryStatuses = [
    { value: 'en_attente', label: 'En attente', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
    { value: 'en_cours', label: 'En cours', color: 'text-blue-600 bg-blue-100', icon: Truck },
    { value: 'livree', label: 'Livrée', color: 'text-green-600 bg-green-100', icon: CheckCircle },
    { value: 'annulee', label: 'Annulée', color: 'text-red-600 bg-red-100', icon: XCircle }
  ];

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const mockDeliveries = [
        {
          _id: '1',
          numeroCommande: 'CMD-001',
          client: { nom: 'Jean Dupont', telephone: '+224 123 456 789' },
          adresse: 'Kaloum, Conakry',
          produits: [
            { nom: 'Poules pondeuses', quantite: 10, prix: 50000 },
            { nom: 'Aliment volaille', quantite: 2, prix: 25000 }
          ],
          montantTotal: 550000,
          statut: 'en_attente',
          livreur: null,
          dateCommande: '2024-01-15T10:00:00Z',
          dateLivraison: '2024-01-17T14:00:00Z'
        },
        {
          _id: '2',
          numeroCommande: 'CMD-002',
          client: { nom: 'Marie Martin', telephone: '+224 987 654 321' },
          adresse: 'Matam, Conakry',
          produits: [
            { nom: 'Poussins', quantite: 50, prix: 5000 }
          ],
          montantTotal: 250000,
          statut: 'en_cours',
          livreur: { nom: 'Amadou Diallo', telephone: '+224 555 123 456' },
          dateCommande: '2024-01-14T15:30:00Z',
          dateLivraison: '2024-01-16T10:00:00Z'
        }
      ];
      setDeliveries(mockDeliveries);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      setDeliveries(prev => prev.map(delivery => 
        delivery._id === deliveryId ? { ...delivery, statut: newStatus } : delivery
      ));
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.numeroCommande.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || delivery.statut === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF'
    }).format(amount);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Gestion des Livraisons</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Truck className="w-4 h-4 mr-2" />
            Assigner Livreur
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              {deliveryStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            {filteredDeliveries.length} livraison(s) trouvée(s)
          </div>
        </div>
      </div>

      {/* Liste des livraisons */}
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => {
          const statusInfo = deliveryStatuses.find(s => s.value === delivery.statut);
          const StatusIcon = statusInfo?.icon || Package;
          
          return (
            <div key={delivery._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Package className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{delivery.numeroCommande}</h3>
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{delivery.client.nom}</p>
                        <p className="text-xs text-gray-500">{delivery.client.telephone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{delivery.adresse}</p>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Livraison prévue</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(delivery.dateLivraison)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Montant total</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(delivery.montantTotal)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Produits */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Produits commandés:</h4>
                    <div className="space-y-1">
                      {delivery.produits.map((produit, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {produit.nom} x {produit.quantite}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(produit.prix * produit.quantite)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Livreur */}
                  {delivery.livreur && (
                    <div className="flex items-center mb-4">
                      <Truck className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Livreur assigné</p>
                        <p className="text-sm font-medium text-gray-900">
                          {delivery.livreur.nom} - {delivery.livreur.telephone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 lg:ml-6">
                  <select
                    value={delivery.statut}
                    onChange={(e) => handleStatusChange(delivery._id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {deliveryStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <button className="flex items-center justify-center px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune livraison trouvée</p>
        </div>
      )}
    </div>
  );
};

export default DeliveriesManagement;

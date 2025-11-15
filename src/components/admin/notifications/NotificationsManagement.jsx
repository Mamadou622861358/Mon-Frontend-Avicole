import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Send, 
  Search, 
  Filter,
  User,
  Users,
  Calendar,
  Eye,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    message: '',
    type: 'info',
    destinataires: 'tous',
    dateEnvoi: ''
  });

  const notificationTypes = [
    { value: 'info', label: 'Information', color: 'text-blue-600 bg-blue-100', icon: Info },
    { value: 'alerte', label: 'Alerte', color: 'text-red-600 bg-red-100', icon: AlertTriangle },
    { value: 'succes', label: 'Succès', color: 'text-green-600 bg-green-100', icon: CheckCircle },
    { value: 'promotion', label: 'Promotion', color: 'text-purple-600 bg-purple-100', icon: MessageSquare }
  ];

  const recipientTypes = [
    { value: 'tous', label: 'Tous les utilisateurs' },
    { value: 'clients', label: 'Clients uniquement' },
    { value: 'producteurs', label: 'Producteurs uniquement' },
    { value: 'admins', label: 'Administrateurs uniquement' }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const mockNotifications = [
        {
          _id: '1',
          titre: 'Nouvelle promotion sur les poules pondeuses',
          message: 'Profitez de 20% de réduction sur toutes les poules pondeuses ce mois-ci !',
          type: 'promotion',
          destinataires: 'clients',
          nombreDestinataires: 245,
          nombreVues: 189,
          createdAt: '2024-01-15T10:00:00Z',
          dateEnvoi: '2024-01-15T10:00:00Z',
          statut: 'envoye'
        },
        {
          _id: '2',
          titre: 'Maintenance programmée du système',
          message: 'Le système sera indisponible demain de 2h à 4h du matin pour maintenance.',
          type: 'alerte',
          destinataires: 'tous',
          nombreDestinataires: 1234,
          nombreVues: 892,
          createdAt: '2024-01-14T15:30:00Z',
          dateEnvoi: '2024-01-14T15:30:00Z',
          statut: 'envoye'
        },
        {
          _id: '3',
          titre: 'Nouveaux produits disponibles',
          message: 'Découvrez notre nouvelle gamme d\'aliments pour volailles premium.',
          type: 'info',
          destinataires: 'tous',
          nombreDestinataires: 1234,
          nombreVues: 456,
          createdAt: '2024-01-13T09:15:00Z',
          dateEnvoi: null,
          statut: 'brouillon'
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const newNotification = {
        _id: Date.now().toString(),
        ...formData,
        nombreDestinataires: 0,
        nombreVues: 0,
        createdAt: new Date().toISOString(),
        dateEnvoi: formData.dateEnvoi ? new Date(formData.dateEnvoi).toISOString() : null,
        statut: formData.dateEnvoi ? 'programme' : 'brouillon'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setShowCreateModal(false);
      setFormData({
        titre: '', message: '', type: 'info', destinataires: 'tous', dateEnvoi: ''
      });
      alert('Notification créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  };

  const handleSendNotification = async (notificationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir envoyer cette notification maintenant ?')) {
      try {
        setNotifications(prev => prev.map(notif => 
          notif._id === notificationId 
            ? { 
                ...notif, 
                statut: 'envoye', 
                dateEnvoi: new Date().toISOString(),
                nombreDestinataires: notif.destinataires === 'tous' ? 1234 : 
                                   notif.destinataires === 'clients' ? 245 : 
                                   notif.destinataires === 'producteurs' ? 89 : 15
              }
            : notif
        ));
        alert('Notification envoyée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
      }
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      alert('Notification supprimée avec succès');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || notification.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Non programmé';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'envoye':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100">Envoyé</span>;
      case 'programme':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100">Programmé</span>;
      case 'brouillon':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 bg-gray-100">Brouillon</span>;
      default:
        return null;
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Gestion des Notifications</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Notification
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total envoyées</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.statut === 'envoye').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Programmées</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.statut === 'programme').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Taux de lecture</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (notifications.reduce((acc, n) => acc + n.nombreVues, 0) / 
                   notifications.reduce((acc, n) => acc + n.nombreDestinataires, 1)) * 100
                )}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Utilisateurs atteints</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.reduce((acc, n) => acc + n.nombreDestinataires, 0)}
              </p>
            </div>
          </div>
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
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            {filteredNotifications.length} notification(s) trouvée(s)
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const typeInfo = notificationTypes.find(t => t.value === notification.type);
          const TypeIcon = typeInfo?.icon || Bell;
          
          return (
            <div key={notification._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <TypeIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">{notification.titre}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo?.color}`}>
                      {typeInfo?.label}
                    </span>
                    {getStatusBadge(notification.statut)}
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{notification.message}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Destinataires:</span>
                      <p>{recipientTypes.find(r => r.value === notification.destinataires)?.label}</p>
                    </div>
                    <div>
                      <span className="font-medium">Nombre:</span>
                      <p>{notification.nombreDestinataires} utilisateur(s)</p>
                    </div>
                    <div>
                      <span className="font-medium">Vues:</span>
                      <p>{notification.nombreVues} lecture(s)</p>
                    </div>
                    <div>
                      <span className="font-medium">Date d'envoi:</span>
                      <p>{formatDate(notification.dateEnvoi)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-6 mt-4 lg:mt-0">
                  {notification.statut === 'brouillon' && (
                    <button
                      onClick={() => handleSendNotification(notification._id)}
                      className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Envoyer
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="flex items-center justify-center px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Créer une nouvelle notification</h2>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires</label>
                  <select
                    name="destinataires"
                    value={formData.destinataires}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {recipientTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'envoi programmée (optionnel)
                </label>
                <input
                  type="datetime-local"
                  name="dateEnvoi"
                  value={formData.dateEnvoi}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, MapPin, Phone, Mail, User, Home } from 'lucide-react';
import api from '../../../services/api';

const FarmsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer la liste des fermes
  const fetchFarms = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/v1/farms');
      setFarms(data || []);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des fermes:', error);
      setError(error.message);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  // Gérer la suppression d'une ferme
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ferme ? Cette action est irréversible.')) {
      try {
        await api.delete(`/api/v1/farms/${id}`);
        alert('Ferme supprimée avec succès');
        fetchFarms();
      } catch (error) {
        alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Filtrer les fermes en fonction du terme de recherche
  const filteredFarms = farms.filter(farm =>
    farm.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.proprietaire?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
                <p>Erreur lors du chargement des fermes: {error}</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Gestion des Fermes</h1>
        <Link
          to="/admin/farms/new"
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Ajouter une ferme
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une ferme..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredFarms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune ferme</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Aucune ferme ne correspond aux critères de recherche.' : 'Commencez par ajouter une ferme.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => (
            <div key={farm._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="h-48 bg-gray-200 relative">
                {farm.images?.[0] ? (
                  <img
                    src={farm.images[0]}
                    alt={farm.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-xl font-semibold text-white">{farm.nom}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="mr-2 text-green-600 w-4 h-4" />
                  <span className="text-sm">{farm.localisation || 'Localisation non spécifiée'}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <User className="mr-2 text-green-600 w-4 h-4" />
                  <span className="text-sm">{farm.proprietaire || 'Propriétaire non spécifié'}</span>
                </div>
                {farm.telephone && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <Phone className="mr-2 text-green-600 w-4 h-4" />
                    <a href={`tel:${farm.telephone}`} className="hover:text-green-600 text-sm">
                      {farm.telephone}
                    </a>
                  </div>
                )}
                {farm.email && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <Mail className="mr-2 text-green-600 w-4 h-4" />
                    <a href={`mailto:${farm.email}`} className="hover:text-green-600 truncate text-sm">
                      {farm.email}
                    </a>
                  </div>
                )}
                {farm.superficie && (
                  <div className="text-sm text-gray-500 mb-3">
                    Superficie: {farm.superficie} hectares
                  </div>
                )}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/admin/farms/edit/${farm._id}`}
                    className="text-green-600 hover:text-green-800 flex items-center text-sm"
                  >
                    <Edit className="mr-1 w-4 h-4" /> Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(farm._id)}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                  >
                    <Trash2 className="mr-1 w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmsList;

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bird, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Heart,
  Activity,
  Calendar
} from 'lucide-react';
import { adminService } from '../../../../services/adminService.js';
import { useToast } from '../../../../contexts/ToastContext';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';

// Hook personnalisé pour les opérations CRUD
const useCrud = (service) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await service.getAll(params);
      const list = response?.data?.data || response?.data?.animals || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Impossible de charger les données');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const create = useCallback(async (itemData) => {
    try {
      const response = await service.create(itemData);
      const newItem = response?.data?.data || response?.data || response;
      setData(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError('Erreur lors de la création');
      throw err;
    }
  }, [service]);

  const update = useCallback(async (id, itemData) => {
    try {
      const response = await service.update(id, itemData);
      const updatedItem = response?.data?.data || response?.data || response;
      setData(prev => prev.map(item => (String(item.id) === String(id) ? updatedItem : item)));
      return updatedItem;
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      throw err;
    }
  }, [service]);

  const remove = useCallback(async (id) => {
    try {
      await service.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
  }, [service]);

  return { data, loading, error, fetchAll, create, update, remove };
};

const AnimalsModule = () => {
  const { showSuccess, showError } = useToast?.() || { showSuccess: ()=>{}, showError: ()=>{} };
  const { data: animals, loading, error, fetchAll, create, update, remove } = useCrud(adminService.animals);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newAnimal, setNewAnimal] = useState({
    type: 'Poule',
    breed: '',
    age: '',
    weight: '',
    quantity: '',
    farm: '',
    health: 'Bonne',
    vaccinated: true
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const normalizeHealth = (h) => {
    const s = String(h || '').toLowerCase();
    if (s.startsWith('excel')) return 'Excellent'; // Excellente/Excellent
    if (s.startsWith('bon')) return 'Bon'; // Bon/Bonne
    if (s.startsWith('moy')) return 'Moyen'; // Moyen/Moyenne
    if (s.startsWith('mau') || s.startsWith('mal')) return 'Mauvais'; // Mauvais/Mauvaise/Malade
    return 'Bon';
  };

  const getHealthColor = (health) => {
    switch (normalizeHealth(health)) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Bon': return 'bg-blue-100 text-blue-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Mauvais': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Chargement des animaux..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchAll()} />;
  }

  // Comptes & pourcentages par santé (par groupe)
  const list = Array.isArray(animals) ? animals : [];
  const totalGroups = list.length;
  const countExcellent = list.filter(a => normalizeHealth(a?.health) === 'Excellent').length;
  const countGood = list.filter(a => normalizeHealth(a?.health) === 'Bon').length;
  const countAverage = list.filter(a => normalizeHealth(a?.health) === 'Moyen').length;
  const countBad = list.filter(a => normalizeHealth(a?.health) === 'Mauvais').length;
  const pct = (n) => (totalGroups > 0 ? Math.round((n * 100) / totalGroups) : 0);

  const filteredAnimals = (Array.isArray(animals) ? animals : []).filter(animal => {
    const breed = String(animal?.breed || '').toLowerCase();
    const farm = String(animal?.farm || '').toLowerCase();
    const type = String(animal?.type || '');
    const searchLower = String(searchTerm || '').toLowerCase();
    const matchesSearch = breed.includes(searchLower) || farm.includes(searchLower);
    const matchesType = filterType === 'all' || type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Animaux</h1>
          <p className="text-sm sm:text-base text-gray-600">Suivez la santé et le bien-être de vos animaux</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouvel animal</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Statistiques compactes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Bird className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Animaux</p>
              <p className="text-xl font-bold text-gray-900">
                {animals.reduce((sum, a) => sum + (parseInt(a.quantity) || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <Bird className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{animals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Santé Excellente</p>
              <p className="text-xl font-bold text-gray-900">{countExcellent}</p>
              <p className="text-xs text-gray-500">{pct(countExcellent)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Santé Bonne</p>
              <p className="text-xl font-bold text-gray-900">{countGood}</p>
              <p className="text-xs text-gray-500">{pct(countGood)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Santé Moyenne</p>
              <p className="text-xl font-bold text-gray-900">{countAverage}</p>
              <p className="text-xs text-gray-500">{pct(countAverage)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Santé Malade</p>
              <p className="text-xl font-bold text-gray-900">{countBad}</p>
              <p className="text-xs text-gray-500">{pct(countBad)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Groupes</p>
              <p className="text-xl font-bold text-gray-900">{animals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres compacts */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les types</option>
              <option value="Poussins">Poussins</option>
              <option value="Poules">Poules</option>
              <option value="Coqs">Coqs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des animaux */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Race
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Quantité
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Âge
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Santé
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Ferme
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Vaccination
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnimals.map((animal, index) => {
                const id = animal.id || animal._id || animal.uuid || `idx-${index}`;
                return (
                <tr key={`animal-${id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bird className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{animal.type}</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">{animal.breed}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{animal.quantity} animaux</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    {animal.quantity}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {animal.age}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(animal.health)}`}>
                      {animal.health}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    {animal.farm}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      animal.vaccination === 'À jour' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {animal.vaccination}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded" onClick={() => { setEditing({
                        id,
                        type: animal?.type || 'Poule',
                        breed: animal?.breed || '',
                        age: Number.isFinite(Number(animal?.age)) ? Number(animal.age) : 0,
                        weight: Number.isFinite(Number(animal?.weight)) ? Number(animal.weight) : 0,
                        quantity: Number.isFinite(Number(animal?.quantity)) ? Number(animal.quantity) : 0,
                        farm: animal?.farm || '',
                        health: animal?.health || 'Bonne',
                        vaccinated: !!animal?.vaccinated,
                        vaccination: animal?.vaccination || (animal?.vaccinated ? 'À jour' : 'Non vacciné')
                      }); setShowEditModal(true); }}>
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded" onClick={async () => {
                        if (!confirm(`Supprimer le groupe d'animaux #${id} ?`)) return;
                        try {
                          await remove(id);
                          showSuccess && showSuccess('Supprimé', "Le groupe d'animaux a été supprimé.");
                          await fetchAll();
                        } catch (err) {
                          showError && showError('Suppression impossible', err?.response?.data?.message || 'Erreur inconnue');
                        }
                      }}>
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout d'animal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Nouvel Animal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await create({
                  type: newAnimal.type || 'Poule',
                  breed: newAnimal.breed || '',
                  age: parseInt(newAnimal.age ?? 0),
                  weight: parseFloat(newAnimal.weight ?? 0),
                  quantity: parseInt(newAnimal.quantity ?? 0),
                  farm: newAnimal.farm || '',
                  health: newAnimal.health || 'Bonne',
                  vaccinated: !!newAnimal.vaccinated
                });
                showSuccess && showSuccess('Créé', "Le groupe d'animaux a été créé.");
                await fetchAll();
                setNewAnimal({
                  type: 'Poule',
                  breed: '',
                  age: '',
                  weight: '',
                  quantity: '',
                  farm: '',
                  health: 'Bonne',
                  vaccinated: true
                });
                setShowAddModal(false);
              } catch (err) {
                showError && showError('Création impossible', err?.response?.data?.message || 'Erreur inconnue');
              }
            }}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={newAnimal.type || 'Poule'}
                      onChange={(e) => setNewAnimal({...newAnimal, type: e.target.value})}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="Poule">Poule</option>
                      <option value="Coq">Coq</option>
                      <option value="Poussin">Poussin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Race *</label>
                    <input
                      type="text"
                      value={newAnimal.breed ?? ''}
                      onChange={(e) => setNewAnimal({...newAnimal, breed: e.target.value})}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Âge (semaines) *</label>
                    <input
                      type="number"
                      value={newAnimal.age ?? 0}
                      onChange={(e) => setNewAnimal({...newAnimal, age: e.target.value})}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Poids (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newAnimal.weight ?? 0}
                      onChange={(e) => setNewAnimal({...newAnimal, weight: e.target.value})}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ferme *</label>
                  <input
                    type="text"
                    value={newAnimal.farm ?? ''}
                    onChange={(e) => setNewAnimal({...newAnimal, farm: e.target.value})}
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">État de santé</label>
                  <select
                    value={newAnimal.health || 'Bonne'}
                    onChange={(e) => setNewAnimal({...newAnimal, health: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Excellente">Excellente</option>
                    <option value="Bonne">Bonne</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Malade">Malade</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vaccinated"
                    checked={!!newAnimal.vaccinated}
                    onChange={(e) => setNewAnimal({...newAnimal, vaccinated: e.target.checked})}
                    className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="vaccinated" className="ml-2 block text-xs text-gray-700">
                    Animal vacciné
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'En cours...' : 'Ajouter l\'animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition d'animal */}
      {showEditModal && editing && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Modifier l'Animal</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!editing?.id) {
                  showError && showError('Mise à jour impossible', 'Identifiant manquant. Veuillez réessayer.');
                  return;
                }
                await update(editing.id, {
                  type: editing.type || 'Poule',
                  breed: editing.breed || '',
                  age: Number.parseInt(editing.age ?? 0),
                  weight: Number.parseFloat(editing.weight ?? 0),
                  quantity: Number.parseInt(editing.quantity ?? 0),
                  farm: editing.farm || '',
                  health: editing.health || 'Bonne',
                  vaccinated: !!editing.vaccinated,
                });
                await fetchAll();
                setShowEditModal(false);
                showSuccess && showSuccess('Modifié', "Le groupe d'animaux a été mis à jour.");
              } catch (err) {
                showError && showError('Mise à jour impossible', err?.response?.data?.message || 'Erreur inconnue');
              }
            }}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                    <select value={editing.type || 'Poule'} onChange={(e)=>setEditing({...editing, type:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded">
                      <option value="Poule">Poule</option>
                      <option value="Coq">Coq</option>
                      <option value="Poussin">Poussin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Race *</label>
                    <input type="text" value={editing.breed || ''} onChange={(e)=>setEditing({...editing, breed:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded" required/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Âge (semaines) *</label>
                    <input type="number" value={editing.age ?? 0} onChange={(e)=>setEditing({...editing, age:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded" required/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Poids (kg) *</label>
                    <input type="number" step="0.1" value={editing.weight ?? 0} onChange={(e)=>setEditing({...editing, weight:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded" required/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                    <input type="number" value={editing.quantity ?? 0} onChange={(e)=>setEditing({...editing, quantity:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ferme *</label>
                    <input type="text" value={editing.farm || ''} onChange={(e)=>setEditing({...editing, farm:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded" required/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">État de santé</label>
                  <select value={editing.health || 'Bonne'} onChange={(e)=>setEditing({...editing, health:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded">
                    <option value="Excellente">Excellente</option>
                    <option value="Bonne">Bonne</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Malade">Malade</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="vaccinated-edit" checked={!!editing.vaccinated} onChange={(e)=>setEditing({...editing, vaccinated:e.target.checked})} className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"/>
                  <label htmlFor="vaccinated-edit" className="ml-2 block text-xs text-gray-700">Animal vacciné</label>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
                <button type="button" onClick={()=>setShowEditModal(false)} className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalsModule;

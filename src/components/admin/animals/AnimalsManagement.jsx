import React, { useState, useEffect } from 'react';
import { 
  Bird, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Heart,
  Activity,
  Utensils,
  AlertTriangle
} from 'lucide-react';

const AnimalsManagement = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    race: '',
    age: '',
    poids: '',
    sante: 'bonne',
    alimentation: '',
    ferme: '',
    notes: ''
  });

  const animalTypes = ['Poussins', 'Poules', 'Coqs', 'Canards', 'Oies'];
  const healthStatus = [
    { value: 'excellente', label: 'Excellente', color: 'text-green-600 bg-green-100' },
    { value: 'bonne', label: 'Bonne', color: 'text-blue-600 bg-blue-100' },
    { value: 'moyenne', label: 'Moyenne', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'mauvaise', label: 'Mauvaise', color: 'text-red-600 bg-red-100' }
  ];

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const mockAnimals = [
        {
          _id: '1',
          type: 'Poules',
          race: 'Rhode Island Red',
          age: '6 mois',
          poids: '2.5 kg',
          sante: 'bonne',
          alimentation: 'Grains mélangés + légumes',
          ferme: 'Ferme Dubois',
          notes: 'Très productive en œufs',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          _id: '2',
          type: 'Poussins',
          race: 'Leghorn',
          age: '3 semaines',
          poids: '0.3 kg',
          sante: 'excellente',
          alimentation: 'Starter pour poussins',
          ferme: 'Ferme Martin',
          notes: 'Croissance rapide',
          createdAt: '2024-01-14T15:30:00Z'
        }
      ];
      setAnimals(mockAnimals);
    } catch (error) {
      console.error('Erreur lors du chargement des animaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    try {
      const newAnimal = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setAnimals(prev => [newAnimal, ...prev]);
      setShowAddModal(false);
      setFormData({
        type: '', race: '', age: '', poids: '', sante: 'bonne',
        alimentation: '', ferme: '', notes: ''
      });
      alert('Animal ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'animal:', error);
    }
  };

  const handleDeleteAnimal = async (animalId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
      setAnimals(prev => prev.filter(animal => animal._id !== animalId));
      alert('Animal supprimé avec succès');
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.ferme.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || animal.type === selectedType;
    return matchesSearch && matchesType;
  });

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Gestion des Animaux</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Animal
        </button>
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
              {animalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <Bird className="w-4 h-4 mr-2" />
            {filteredAnimals.length} animal(aux) trouvé(s)
          </div>
        </div>
      </div>

      {/* Grille des animaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <div key={animal._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Bird className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{animal.type}</h3>
                  <p className="text-sm text-gray-500">{animal.race}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAnimal(animal._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Âge:</span>
                <span className="text-sm font-medium">{animal.age}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Poids:</span>
                <span className="text-sm font-medium">{animal.poids}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Santé:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  healthStatus.find(s => s.value === animal.sante)?.color
                }`}>
                  {healthStatus.find(s => s.value === animal.sante)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ferme:</span>
                <span className="text-sm font-medium">{animal.ferme}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-start">
                <Utensils className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">Alimentation:</p>
                  <p className="text-sm text-gray-900">{animal.alimentation}</p>
                </div>
              </div>
              {animal.notes && (
                <div className="flex items-start mt-3">
                  <Activity className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Notes:</p>
                    <p className="text-sm text-gray-900">{animal.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Ajouter un nouvel animal</h2>
            <form onSubmit={handleAddAnimal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner un type</option>
                    {animalTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Race</label>
                  <input
                    type="text"
                    name="race"
                    value={formData.race}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="ex: 6 mois"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poids</label>
                  <input
                    type="text"
                    name="poids"
                    value={formData.poids}
                    onChange={handleInputChange}
                    placeholder="ex: 2.5 kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Santé</label>
                  <select
                    name="sante"
                    value={formData.sante}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {healthStatus.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ferme</label>
                <input
                  type="text"
                  name="ferme"
                  value={formData.ferme}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alimentation</label>
                <input
                  type="text"
                  name="alimentation"
                  value={formData.alimentation}
                  onChange={handleInputChange}
                  placeholder="ex: Grains mélangés + légumes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalsManagement;

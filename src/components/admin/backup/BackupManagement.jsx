import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  Package, 
  ShoppingCart,
  Settings,
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react';

const BackupManagement = () => {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [exportOptions, setExportOptions] = useState({
    users: true,
    products: true,
    orders: true,
    farms: true,
    forums: true,
    animals: true,
    reviews: true,
    settings: true
  });
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [autoBackup, setAutoBackup] = useState(true);

  // Données simulées des sauvegardes
  useEffect(() => {
    const mockBackups = [
      {
        id: 1,
        name: 'Sauvegarde_Automatique_2024-01-15',
        date: '2024-01-15T10:30:00Z',
        size: '45.2 MB',
        type: 'Automatique',
        status: 'Complète',
        tables: ['users', 'products', 'orders', 'farms', 'forums', 'animals', 'reviews', 'settings'],
        records: 15420
      },
      {
        id: 2,
        name: 'Sauvegarde_Manuelle_2024-01-14',
        date: '2024-01-14T16:45:00Z',
        size: '44.8 MB',
        type: 'Manuelle',
        status: 'Complète',
        tables: ['users', 'products', 'orders', 'farms'],
        records: 12350
      },
      {
        id: 3,
        name: 'Sauvegarde_Automatique_2024-01-14',
        date: '2024-01-14T10:30:00Z',
        size: '44.5 MB',
        type: 'Automatique',
        status: 'Complète',
        tables: ['users', 'products', 'orders', 'farms', 'forums', 'animals', 'reviews', 'settings'],
        records: 15200
      },
      {
        id: 4,
        name: 'Sauvegarde_Automatique_2024-01-13',
        date: '2024-01-13T10:30:00Z',
        size: '43.9 MB',
        type: 'Automatique',
        status: 'Erreur',
        tables: ['users', 'products'],
        records: 8500,
        error: 'Connexion à la base de données interrompue'
      }
    ];
    setBackups(mockBackups);
  }, []);

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Simulation de l'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedTables = Object.keys(exportOptions).filter(key => exportOptions[key]);
      const exportData = {
        timestamp: new Date().toISOString(),
        tables: selectedTables,
        format: 'JSON'
      };

      // Créer un fichier JSON simulé
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `guineeavicole_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Export réalisé avec succès !');
    } catch (error) {
      alert('Erreur lors de l\'export : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      // Simulation de la création de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup = {
        id: backups.length + 1,
        name: `Sauvegarde_Manuelle_${new Date().toISOString().split('T')[0]}`,
        date: new Date().toISOString(),
        size: '45.5 MB',
        type: 'Manuelle',
        status: 'Complète',
        tables: Object.keys(exportOptions).filter(key => exportOptions[key]),
        records: 15500
      };

      setBackups(prev => [newBackup, ...prev]);
      alert('Sauvegarde créée avec succès !');
    } catch (error) {
      alert('Erreur lors de la création de la sauvegarde : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      alert('Sauvegarde supprimée avec succès !');
    }
  };

  const handleRestoreBackup = async (backup) => {
    if (window.confirm(`Êtes-vous sûr de vouloir restaurer la sauvegarde "${backup.name}" ? Cette action est irréversible.`)) {
      setLoading(true);
      try {
        // Simulation de la restauration
        await new Promise(resolve => setTimeout(resolve, 5000));
        alert('Restauration effectuée avec succès !');
      } catch (error) {
        alert('Erreur lors de la restauration : ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Complète':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Erreur':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTableIcon = (tableName) => {
    const icons = {
      users: <Users className="w-4 h-4" />,
      products: <Package className="w-4 h-4" />,
      orders: <ShoppingCart className="w-4 h-4" />,
      farms: <Database className="w-4 h-4" />,
      forums: <FileText className="w-4 h-4" />,
      animals: <Database className="w-4 h-4" />,
      reviews: <Database className="w-4 h-4" />,
      settings: <Settings className="w-4 h-4" />
    };
    return icons[tableName] || <Database className="w-4 h-4" />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sauvegarde et Export</h1>
        <p className="text-gray-600">Gérez les sauvegardes et exportez vos données</p>
      </div>

      {/* Configuration des sauvegardes automatiques */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Automatique</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Activer les sauvegardes automatiques</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
            <select
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!autoBackup}
            >
              <option value="hourly">Toutes les heures</option>
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export personnalisé */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Personnalisé</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(exportOptions).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setExportOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 capitalize">{key}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            disabled={loading || !Object.values(exportOptions).some(v => v)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Export en cours...' : 'Exporter les données'}
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Création en cours...' : 'Créer une sauvegarde'}
          </button>
        </div>
      </div>

      {/* Liste des sauvegardes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des Sauvegardes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                    <div className="text-sm text-gray-500">{backup.records.toLocaleString()} enregistrements</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(backup.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      backup.type === 'Automatique' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(backup.status)}
                      <span className={`ml-2 text-sm ${
                        backup.status === 'Complète' ? 'text-green-600' : 
                        backup.status === 'Erreur' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {backup.status}
                      </span>
                    </div>
                    {backup.error && (
                      <div className="text-xs text-red-500 mt-1">{backup.error}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBackup(backup)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {backup.status === 'Complète' && (
                        <>
                          <button
                            onClick={() => handleRestoreBackup(backup)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Restaurer"
                            disabled={loading}
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              // Simulation du téléchargement
                              alert('Téléchargement de la sauvegarde...');
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Supprimer"
                      >
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

      {/* Modal des détails de sauvegarde */}
      {selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la Sauvegarde</h3>
              <button
                onClick={() => setSelectedBackup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-sm text-gray-900">{selectedBackup.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedBackup.date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Taille</label>
                  <p className="text-sm text-gray-900">{selectedBackup.size}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre d'enregistrements</label>
                  <p className="text-sm text-gray-900">{selectedBackup.records.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tables incluses</label>
                <div className="flex flex-wrap gap-2">
                  {selectedBackup.tables.map((table, index) => (
                    <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      {getTableIcon(table)}
                      <span className="ml-2 text-sm text-gray-700 capitalize">{table}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedBackup.error && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Erreur</label>
                  <p className="text-sm text-red-600">{selectedBackup.error}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedBackup(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              {selectedBackup.status === 'Complète' && (
                <button
                  onClick={() => {
                    handleRestoreBackup(selectedBackup);
                    setSelectedBackup(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={loading}
                >
                  Restaurer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManagement;

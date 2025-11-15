import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Upload, 
  Globe,
  Bell,
  Shield,
  Mail,
  Database
} from 'lucide-react';

const SettingsModule = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSettings({
        siteName: 'GuinéeAvicole',
        siteDescription: 'Plateforme avicole de Guinée',
        contactEmail: 'contact@guineeavicole.com',
        notifications: true,
        maintenance: false
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm sm:text-base text-gray-600">Configurez les paramètres généraux de votre plateforme</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Sauvegarder</span>
            <span className="sm:hidden">Sauver</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Informations Générales</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom du site</label>
              <input
                type="text"
                value={settings.siteName}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={settings.siteDescription}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email de contact</label>
              <input
                type="email"
                value={settings.contactEmail}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;

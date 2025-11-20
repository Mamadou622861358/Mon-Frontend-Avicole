import React, { useState, useEffect } from 'react';
import { Save, Image, Upload, Loader2 } from 'lucide-react';
import api from '../../../../services/api';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  const [errors, setErrors] = useState({});

  // Récupérer les paramètres actuels
  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      // Simuler des paramètres par défaut car l'endpoint n'existe peut-être pas encore
      const mockSettings = {
        siteName: 'GuinéeAvicole',
        siteDescription: 'Plateforme de vente de produits avicoles en Guinée',
        contactEmail: 'contact@guineeavicole.com',
        contactPhone: '+224 123 456 789',
        address: 'Conakry, Guinée',
        logo: '',
        favicon: '',
        socialMedia: {
          facebook: 'guineeavicole',
          twitter: 'guineeavicole',
          instagram: 'guineeavicole',
          linkedin: 'guineeavicole'
        }
      };
      
      setFormData(mockSettings);
      if (mockSettings.logo) setLogoPreview(mockSettings.logo);
      if (mockSettings.favicon) setFaviconPreview(mockSettings.favicon);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Gérer les changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialMedia.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gérer le téléchargement des fichiers
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Prévisualisation de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
      } else {
        setFaviconPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.siteName.trim()) {
      newErrors.siteName = 'Le nom du site est requis';
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'L\'email de contact est requis';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Adresse email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const dataToSend = {
        ...formData,
        logo: logoPreview,
        favicon: faviconPreview,
      };
      
      // Ici vous pourriez appeler l'API pour sauvegarder les paramètres
      // await api.put('/api/v1/settings', dataToSend);
      
      alert('Paramètres mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      alert('Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Paramètres</h1>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>

      <div className="bg-white shadow-sm overflow-hidden rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Section Informations générales */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  Nom du site
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.siteName && (
                  <p className="mt-1 text-sm text-red-600">{errors.siteName}</p>
                )}
              </div>

              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  Description du site
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  rows={3}
                  value={formData.siteDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section Logo et Favicon */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Logo et Favicon</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo du site
                </label>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 overflow-hidden bg-gray-100 rounded-md">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <Image className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <label className="ml-4 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>Changer</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 overflow-hidden bg-gray-100 rounded-md flex items-center justify-center">
                    {faviconPreview ? (
                      <img
                        src={faviconPreview}
                        alt="Favicon"
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <Image className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <label className="ml-4 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>Changer</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Coordonnées</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Email de contact
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section Réseaux sociaux */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Réseaux sociaux</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                <div key={platform}>
                  <label
                    htmlFor={platform}
                    className="block text-sm font-medium text-gray-700 capitalize"
                  >
                    {platform}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://{platform}.com/
                    </span>
                    <input
                      type="text"
                      id={platform}
                      name={`socialMedia.${platform}`}
                      value={formData.socialMedia[platform]}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="nom-utilisateur"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

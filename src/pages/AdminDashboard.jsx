import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Edit, Trash, Plus } from 'lucide-react';
import authService from '../../services/authService';
import ProductForm from '../components/ProductForm';
import FarmForm from '../components/FarmForm';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // État pour le formulaire de profil
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photo: null
  });
  
  // État pour prévisualiser la photo
  const [photoPreview, setPhotoPreview] = useState('');
  
  // État pour afficher/masquer les mots de passe
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (!userData || userData.role !== 'admin') {
          navigate('/login');
          return;
        }
        setUser(userData);
        setProfileForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          photo: null
        });
        if (userData.photo) {
          setPhotoPreview(`/uploads/profiles/${userData.photo}`);
        }
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La taille de la photo ne doit pas dépasser 5MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Format de photo invalide. Utilisez JPG, JPEG ou PNG');
        return;
      }
      setProfileForm({ ...profileForm, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(profileForm).forEach(key => {
        if (profileForm[key] !== null && profileForm[key] !== '') {
          formData.append(key, profileForm[key]);
        }
      });

      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      setError('Profil mis à jour avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord Administrateur</h1>
        
        {/* Onglets de navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('profile')}
          >
            Mon Profil
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('products')}
          >
            Produits
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'farms' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('farms')}
          >
            Fermes
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className={`p-4 rounded mb-4 ${error.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Contenu de l'onglet Profil */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Modifier mon profil</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Photo de profil */}
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <img
                    className="h-32 w-32 object-cover rounded-full"
                    src={photoPreview || '/default-avatar.png'}
                    alt="Photo de profil"
                  />
                </div>
                <label className="block">
                  <span className="sr-only">Choisir une photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>
              </div>

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Modification du mot de passe */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Modifier le mot de passe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                        className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contenu de l'onglet Produits */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Gestion des produits</h2>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  setSelectedProduct(null);
                  setShowProductForm(true);
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un produit
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Aucun produit disponible</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={product.images?.[0] ? `/uploads/products/${product.images[0]}` : '/default-product.png'}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.price} GNF</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showProductForm && (
              <ProductForm
                product={selectedProduct}
                onSubmit={handleProductSubmit}
                onClose={() => {
                  setShowProductForm(false);
                  setSelectedProduct(null);
                }}
              />
            )}
          </div>
        )}

        {/* Contenu de l'onglet Fermes */}
        {activeTab === 'farms' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Gestion des fermes</h2>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  setSelectedFarm(null);
                  setShowFarmForm(true);
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une ferme
              </button>
            </div>
            {/* TODO: Implémenter la liste des fermes */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
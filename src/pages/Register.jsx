import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    confirmPassword: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError('La taille de la photo ne doit pas dépasser 5MB');
          return;
        }
        setFormData({ ...formData, photo: file });
        setPhotoPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
      return false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
  
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return false;
    }
  
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    if (!validateForm()) {
      setLoading(false);
      return;
    }
  
    try {
      // Envoyer directement l'objet formData
      await authService.register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <div className="mt-1">
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <div className="mt-1">
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <div className="mt-1">
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <div className="mt-1">
                <textarea
                  id="adresse"
                  name="adresse"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo de profil
              </label>
              <div className="mt-1 flex items-center">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-full"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      onClick={() => {
                        setPhotoPreview(null);
                        setFormData({ ...formData, photo: null });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <label htmlFor="photo" className="cursor-pointer">
                      <span className="text-gray-500">Ajouter</span>
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

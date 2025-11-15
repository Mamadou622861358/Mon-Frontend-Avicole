import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // <-- importe ton service

const RegisterEnhanced = () => {
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
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  // Gestion des champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion de la photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError('La taille de la photo ne doit pas dépasser 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation mot de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await authService.register(formData); // utilise authService
      if (response.token) {
        navigate('/login'); // après inscription redirige vers login
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte client
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
            {/* Nom */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
              <input id="nom" name="nom" type="text" required
                autoComplete="family-name"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                value={formData.nom}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input id="prenom" name="prenom" type="text" required
                autoComplete="given-name"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                value={formData.prenom}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input id="email" name="email" type="email" required
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input id="telephone" name="telephone" type="tel" required
                autoComplete="tel"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>

            {/* Adresse */}
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
              <textarea id="adresse" name="adresse" required
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>

            {/* Photo */}
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo de profil</label>
              <input id="photo" name="photo" type="file" accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1 block w-full"
              />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="mt-2 h-16 w-16 rounded-full object-cover" />
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input id="password" name="password" type="password" required
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Bouton */}
            <div>
              <button type="submit"
                className="w-full py-2 px-4 rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                S'inscrire
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterEnhanced;

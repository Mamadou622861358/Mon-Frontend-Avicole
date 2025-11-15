/**
 * Page de profil utilisateur
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import ImageUpload from "../components/ImageUpload";
import { Eye, EyeOff } from "lucide-react";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    district: user?.district || "",
    farmName: user?.farmName || "",
    profileImage: user?.profileImage || null,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (image) => {
    setFormData(prev => ({
      ...prev,
      profileImage: image
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du mot de passe
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      showError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await updateProfile(formData);
      showSuccess("Profil mis à jour avec succès");
      setIsEditing(false);
      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error) {
      showError("Erreur lors de la mise à jour du profil");
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header du profil */}
        <div className="px-6 py-8 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Photo de profil"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-lg text-gray-600">
                {user.role === "admin" && "Administrateur"}
                {user.role === "producteur" && "Producteur"}
                {user.role === "client" && "Client"}
              </p>
              <p className="text-gray-500">
                Membre depuis{" "}
                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Informations personnelles
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {isEditing ? "Annuler" : "Modifier"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo de profil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil
                </label>
                <ImageUpload
                  currentImage={formData.profileImage}
                  onImageChange={handleImageChange}
                  className="mb-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    District
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {user.role === "producteur" && (
                <div>
                  <label
                    htmlFor="farmName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nom de la ferme
                  </label>
                  <input
                    type="text"
                    id="farmName"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}

              {/* Section changement de mot de passe */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Laissez vide si vous ne souhaitez pas changer votre mot de passe
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Prénom</h3>
                <p className="text-lg text-gray-900">{user.firstName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                <p className="text-lg text-gray-900">{user.lastName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                <p className="text-lg text-gray-900">{user.phone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Ville</h3>
                <p className="text-lg text-gray-900">{user.city}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">District</h3>
                <p className="text-lg text-gray-900">{user.district}</p>
              </div>

              {user.role === "producteur" && user.farmName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Nom de la ferme
                  </h3>
                  <p className="text-lg text-gray-900">{user.farmName}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

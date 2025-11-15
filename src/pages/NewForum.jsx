import { ArrowLeft, MessageSquare, Tag } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { forumService } from "../services/api";

const NewForum = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
    isPublic: true,
  });

  const [errors, setErrors] = useState({});

  // Catégories disponibles
  const categories = [
    { value: "general", label: "Général", icon: "💬" },
    { value: "technique", label: "Technique", icon: "🔧" },
    { value: "sante", label: "Santé & Maladies", icon: "🏥" },
    { value: "nutrition", label: "Nutrition", icon: "🌾" },
    { value: "elevage", label: "Élevage", icon: "🐔" },
    { value: "vente", label: "Vente & Marché", icon: "💰" },
    { value: "conseils", label: "Conseils", icon: "💡" },
    { value: "actualites", label: "Actualités", icon: "📰" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (formData.title.length < 10) {
      newErrors.title = "Le titre doit contenir au moins 10 caractères";
    } else if (formData.title.length > 100) {
      newErrors.title = "Le titre ne peut pas dépasser 100 caractères";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Le contenu est requis";
    } else if (formData.content.length < 50) {
      newErrors.content = "Le contenu doit contenir au moins 50 caractères";
    }

    if (!formData.category) {
      newErrors.category = "Veuillez sélectionner une catégorie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Préparer les données
      const forumData = {
        ...formData,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      await forumService.create(forumData);
      showSuccess(
        "Sujet créé avec succès",
        "Votre sujet a été publié sur le forum"
      );
      navigate("/forums");
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de la création du sujet";
      showError("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/forums")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux forums
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nouveau sujet de forum
              </h1>
              <p className="text-gray-600 mt-1">
                Partagez vos questions et expériences avec la communauté
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titre du sujet *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Ex: Comment gérer la chaleur en période sèche ?"
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 caractères
              </p>
            </div>

            {/* Catégorie */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Catégorie *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.category
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Tags (optionnel)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Ex: chaleur, ventilation, poulets, conseils"
              />
              <p className="mt-1 text-xs text-gray-500">
                Séparez les tags par des virgules pour faciliter la recherche
              </p>
            </div>

            {/* Contenu */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contenu du sujet *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical ${
                  errors.content
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Décrivez votre question ou partagez votre expérience en détail..."
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">{errors.content}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.content.length}/∞ caractères (minimum 50)
              </p>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 text-sm text-gray-700"
                >
                  Rendre ce sujet public
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Les sujets publics sont visibles par tous les utilisateurs
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/forums")}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </div>
                ) : (
                  "Créer le sujet"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Conseils */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            💡 Conseils pour un bon sujet
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Soyez clair et précis dans votre titre</li>
            <li>• Décrivez bien le contexte de votre question</li>
            <li>• Utilisez des tags pertinents pour faciliter la recherche</li>
            <li>• Respectez la communauté et soyez constructif</li>
            <li>• Vérifiez que votre question n'a pas déjà été posée</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewForum;

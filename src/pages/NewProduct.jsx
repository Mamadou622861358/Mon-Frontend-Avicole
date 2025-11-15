/**
 * Page Nouveau Produit - Formulaire d'ajout de produit
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { farmService, productService } from "../services/api";

const NewProduct = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "poulets",
    price: "",
    quantity: "",
    unit: "piece",
    farmId: "",
    images: [],
    specifications: {
      age: "",
      weight: "",
      breed: "",
      healthStatus: "excellent",
    },
    availability: "available",
  });

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await farmService.getAll({});
        setFarms(res.data.data?.docs || res.data.data || []);
        // Sélectionner automatiquement la première ferme si disponible
        if (res.data.data?.docs?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            farmId: res.data.data.docs[0]._id,
          }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des fermes:", error);
      }
    };
    fetchFarms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer le produit
      const productData = { ...formData };
      const response = await productService.create(productData);

      // Upload des images si présentes
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          await productService.uploadImage(response.data.data._id, image);
        }
      }

      showSuccess("Produit créé avec succès");
      navigate("/products");
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de la création";
      showError("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryOptions = () => {
    switch (formData.category) {
      case "poulets":
        return (
          <>
            <option value="poulets_viande">Poulets de chair</option>
            <option value="poulets_race">Poulets de race</option>
          </>
        );
      case "poules":
        return (
          <>
            <option value="poules_pondeuses">Poules pondeuses</option>
            <option value="poules_race">Poules de race</option>
          </>
        );
      case "poussins":
        return (
          <>
            <option value="poussins_viande">Poussins de chair</option>
            <option value="poussins_pondeuses">Poussins pondeuses</option>
          </>
        );
      case "oeufs":
        return (
          <>
            <option value="oeufs_consommation">Œufs de consommation</option>
            <option value="oeufs_incubation">Œufs d'incubation</option>
          </>
        );
      default:
        return null;
    }
  };

  const getUnitOptions = () => {
    switch (formData.category) {
      case "oeufs":
        return (
          <>
            <option value="piece">Pièce</option>
            <option value="douzaine">Douzaine</option>
            <option value="carton">Carton (30 pièces)</option>
          </>
        );
      default:
        return (
          <>
            <option value="piece">Pièce</option>
            <option value="kg">Kilogramme</option>
            <option value="lot">Lot</option>
          </>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nouveau Produit</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Informations de base</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Poulets de chair frais"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="poulets">Poulets</option>
                <option value="poules">Poules</option>
                <option value="poussins">Poussins</option>
                <option value="oeufs">Œufs</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Description détaillée du produit..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (GNF) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 25000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {getUnitOptions()}
              </select>
            </div>
          </div>
        </div>

        {/* Ferme */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ferme de production</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionner une ferme *
            </label>
            <select
              name="farmId"
              value={formData.farmId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sélectionner une ferme</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name} - {farm.location.city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Spécifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Spécifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Âge (semaines)
              </label>
              <input
                type="number"
                name="specifications.age"
                value={formData.specifications.age}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poids (kg)
              </label>
              <input
                type="number"
                name="specifications.weight"
                value={formData.specifications.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Race
              </label>
              <input
                type="text"
                name="specifications.breed"
                value={formData.specifications.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Sussex, Rhode Island"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                État de santé
              </label>
              <select
                name="specifications.healthStatus"
                value={formData.specifications.healthStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="excellent">Excellent</option>
                <option value="bon">Bon</option>
                <option value="moyen">Moyen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Images du produit</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos du produit
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Vous pouvez sélectionner plusieurs images (JPG, PNG)
            </p>
          </div>
        </div>

        {/* Disponibilité */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Disponibilité</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut de disponibilité
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="available">Disponible</option>
              <option value="limited">Stock limité</option>
              <option value="preorder">Précommande</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProduct;

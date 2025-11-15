/**
 * Page Statistiques de Ferme - Affichage des statistiques détaillées
 */
import { Calendar, DollarSign, Package, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { farmService, productService } from "../services/api";

const FarmStats = () => {
  const { id } = useParams();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer les informations de la ferme
        const farmResponse = await farmService.getById(id);
        setFarm(farmResponse.data.data);

        // Récupérer les statistiques
        const statsResponse = await farmService.getStats(id);
        setStats(statsResponse.data.data);

        // Récupérer les produits de la ferme
        const productsResponse = await productService.getAll({ farmId: id });
        setProducts(
          productsResponse.data.data?.docs || productsResponse.data.data || []
        );
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        showError("Erreur", "Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showError]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("fr-FR").format(number);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ferme non trouvée
        </h2>
        <p className="text-gray-600 mb-6">
          La ferme que vous recherchez n'existe pas.
        </p>
        <Link to="/farms" className="text-green-600 hover:text-green-700">
          Retour aux fermes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
            <p className="text-gray-600 mt-1">{farm.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>
                {farm.location.city}, {farm.location.district}
              </span>
              <span>•</span>
              <span>{farm.type}</span>
              {farm.size && (
                <>
                  <span>•</span>
                  <span>{formatNumber(farm.size)} oiseaux</span>
                </>
              )}
            </div>
          </div>
          <Link
            to={`/farms/${id}/edit`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Chiffre d'affaires
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.revenue ? formatCurrency(stats.revenue) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Produits vendus
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.productsSold ? formatNumber(stats.productsSold) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.customers ? formatNumber(stats.customers) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.orders ? formatNumber(stats.orders) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Produits de la ferme
          </h3>
          <Link
            to="/products/new"
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Ajouter un produit
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun produit pour le moment
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatNumber(product.quantity)} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.availability === "available"
                            ? "bg-green-100 text-green-800"
                            : product.availability === "limited"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.availability === "available"
                          ? "Disponible"
                          : product.availability === "limited"
                          ? "Stock limité"
                          : "Rupture"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmStats;

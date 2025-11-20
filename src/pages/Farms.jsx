import {
  Calendar,
  CheckCircle,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicFarmService } from "../../services/api";

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  // Server-side controls
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const categories = [
    { value: "all", label: "Toutes les fermes" },
    { value: "poules_pondeuses", label: "Poules pondeuses" },
    { value: "poulet_de_chair", label: "Poulets de chair" },
    { value: "reproduction", label: "Reproduction" },
    { value: "couvoir", label: "Couvoir" },
    { value: "autre", label: "Autre" },
  ];

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        // Build clean params expected by backend; only send when set
        const params = { page, limit };
        const q = String(searchTerm || "").trim();
        if (q.length > 0) params.search = q;
        if (selectedCategory && selectedCategory !== "all") params.farmType = selectedCategory;
        if (sort) params.sortBy = sort;
        if (order) params.sortOrder = order;

        const response = await publicFarmService.getAll(params);
        // Normalize various backend payload shapes
        const payload = response?.data;
        const list = payload?.data?.farms ?? payload?.farms ?? payload?.data ?? payload ?? [];
        const farmsData = Array.isArray(list) ? list : [];
        // Normalize fields to avoid rendering objects and ensure defaults
        const normalizedFarms = farmsData.map((farm) => {
          const id = farm._id || farm.id;
          const name = typeof farm.name === "string" ? farm.name : (farm.name?.value || farm.name?.title || "—");
          let location = farm.location;
          if (typeof location !== "string") {
            location = [farm?.address?.city, farm?.address?.region || farm?.address?.district, farm?.address?.country]
              .filter(Boolean)
              .join(", ") || [farm?.location?.city, farm?.location?.region || farm?.location?.district, farm?.location?.country]
              .filter(Boolean)
              .join(", ");
          }
          const totalAnimals = Number(farm?.capacity?.totalBirds) || Number(farm?.totalAnimals) || 0;
          const established = farm.established || farm.createdAt || "N/A";
          const specialties = Array.isArray(farm.specialties) ? farm.specialties : [];
          const rating = Number(farm.rating) || 0;
          const reviews = Number(farm.reviews || farm.reviewCount) || 0;
          const image = farm.image || farm.coverImage || farm.thumbnail || "/images/placeholders/farm.jpg";
          return {
            ...farm,
            _id: id,
            name,
            location,
            totalAnimals,
            established,
            specialties,
            rating,
            reviews,
            image,
          };
        });
        setFarms(normalizedFarms);
        const meta = payload?.meta || payload?.data?.meta;
        if (meta?.totalPages) setTotalPages(meta.totalPages);
        if (meta?.total != null) setTotal(meta.total); else setTotal(normalizedFarms.length);
      } catch (error) {
        console.error("Erreur lors du chargement des fermes:", error);
        setFarms([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
    // Refetch on server-control changes
  }, [page, limit, searchTerm, selectedCategory, sort, order]);

  const openFarmDetails = async (farm) => {
    // Log pour debug
    console.log("Farm data:", farm);
    const id = farm?._id || farm?.id;
    if (!id) {
      // Changement de id à _id pour MongoDB
      console.error("ID de ferme manquant");
      return;
    }
    setModalError(null);
    setModalLoading(true);
    setSelectedFarm(null);
    try {
      const response = await publicFarmService.getById(id);
      // normalize details as well for safe rendering
      const data = response?.data || null;
      if (data) {
        const image = data.image || data.coverImage || data.thumbnail || "/images/placeholders/farm.jpg";
        const location = typeof data.location === "string" ? data.location : [data?.address?.city, data?.address?.region || data?.address?.district, data?.address?.country]
          .filter(Boolean)
          .join(", ") || [data?.location?.city, data?.location?.region || data?.location?.district, data?.location?.country]
          .filter(Boolean)
          .join(", ");
        const normalized = {
          ...data,
          _id: data._id || data.id,
          name: typeof data.name === "string" ? data.name : (data.name?.value || data.name?.title || "—"),
          image,
          location,
          rating: Number(data.rating) || 0,
          reviews: Number(data.reviews || data.reviewCount) || 0,
          totalAnimals: Number(data?.capacity?.totalBirds) || Number(data?.totalAnimals) || 0,
          features: Array.isArray(data.features) ? data.features : [],
          products: Array.isArray(data.products) ? data.products : [],
        };
        setSelectedFarm(normalized);
      } else {
        setSelectedFarm(farm);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des détails de la ferme:", err);
      setModalError("Impossible de charger les détails de la ferme");
      // fallback to the list item so the modal still opens with basic info
      setSelectedFarm(farm);
    } finally {
      setModalLoading(false);
    }
  };

  const handleContactFarm = async (farmId) => {
    if (!farmId) {
      console.error("ID de ferme manquant");
      return;
    }
    try {
      await publicFarmService.contact(farmId, {
        message: "Je souhaite en savoir plus sur votre ferme.",
      });
      // Vous pouvez ajouter une notification de succès ici
    } catch (error) {
      console.error("Erreur lors de la prise de contact:", error);
      // Vous pouvez ajouter une notification d'erreur ici
    }
  };

  // Filtering is now handled server-side; keep fallback if needed
  const filteredFarms = farms;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
          {/* Pagination */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">
              Page {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Professional empty state when there are no farms
  const isEmpty = !Array.isArray(filteredFarms) || filteredFarms.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Nos Fermes Partenaires
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Découvrez nos fermes certifiées et leurs produits de qualité
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>
              {total} ferme{total > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une ferme..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Nom</option>
                <option value="rating">Note</option>
                <option value="totalAnimals">Nombre d'animaux</option>
                <option value="established">Année d'établissement</option>
              </select>
              <div className="flex items-center space-x-2">
                <select
                  value={order}
                  onChange={(e) => {
                    setOrder(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value) || 6);
                    setPage(1);
                  }}
                  className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => (
            <div
              key={farm._id}
              className="bg-white rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={farm.image}
                  alt={farm.name}
                  className="w-full h-48 object-cover"
                />
                {farm.certified && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Certifiée
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {farm.name}
                  </h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {farm.rating}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({farm.reviews})
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {farm.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {typeof farm.location === "string"
                        ? farm.location
                        : farm.location
                        ? `${farm.location.city || ""}, ${
                            farm.location.district || ""
                          }`
                        : "Emplacement non spécifié"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {farm.totalAnimals?.toLocaleString() || "N/A"} animaux
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Depuis {farm.established || "N/A"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {farm.specialties?.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  )) || null}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/fermes/${farm._id}`}
                    className="w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir la page
                  </Link>
                  <button
                    onClick={() => openFarmDetails(farm)}
                    className="w-full border border-green-600 text-green-700 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Aperçu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de détails de la ferme */}
        {selectedFarm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedFarm.name}
                </h2>
                <button
                  onClick={() => {
                    setSelectedFarm(null);
                    setModalError(null);
                    setModalLoading(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {modalLoading && (
                  <div className="flex items-center justify-center py-10 text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3">Chargement des détails...</span>
                  </div>
                )}
                {modalError && !modalLoading && (
                  <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
                    {modalError}
                  </div>
                )}
                {!modalLoading && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Images */}
                    <div>
                      <img
                        src={selectedFarm.image}
                        alt={selectedFarm.name}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        {selectedFarm.gallery?.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${selectedFarm.name} ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Informations */}
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-semibold">
                            {selectedFarm.rating}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({selectedFarm.reviews} avis)
                          </span>
                        </div>
                        {selectedFarm.certified && (
                          <div className="ml-4 flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                              Certifiée
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 mb-6">
                        {selectedFarm.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                          <span>
                            {typeof selectedFarm.location === "string"
                              ? selectedFarm.location
                              : selectedFarm.location
                              ? `${selectedFarm.location.city || ""}, ${
                                  selectedFarm.location.district || ""
                                }`
                              : "Emplacement non spécifié"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 mr-3 text-gray-400" />
                          <span>{selectedFarm.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 mr-3 text-gray-400" />
                          <span>{selectedFarm.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-3 text-gray-400" />
                          <span>
                            {selectedFarm.totalAnimals?.toLocaleString()}{" "}
                            animaux
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Établie en {selectedFarm.established}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Caractéristiques</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFarm.features?.map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">
                          Produits disponibles
                        </h4>
                        <div className="space-y-2">
                          {selectedFarm.products?.map((product, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded"
                            >
                              <span className="font-medium">
                                {product.name}
                              </span>
                              <span className="text-green-600 font-semibold">
                                {product.price.toLocaleString()} GNF/
                                {product.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => handleContactFarm(selectedFarm._id)}
                          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <Mail className="w-5 h-5 mr-2" />
                          Contacter la ferme
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Farms;

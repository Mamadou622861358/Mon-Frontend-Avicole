import React, { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import { adminService } from "../../../../../services/api";
import { useToast } from "../../../../contexts/ToastContext";
import LoadingSpinner from "../../../common/LoadingSpinner";
import ErrorMessage from "../../../common/ErrorMessage";

function ReviewsModule() {
  const { showSuccess, showError } = useToast?.() || {
    showSuccess: () => {},
    showError: () => {},
  };
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [newReview, setNewReview] = useState({
    customer: "",
    product: "",
    productId: "",
    rating: 5,
    comment: "",
    orderId: "",
  });

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const getAll = adminService.reviews?.getAll || adminService.getReviews;
      const params = {
        q: searchTerm,
        page,
        limit: meta.limit,
        sort: "createdAt",
        order: "desc",
      };
      if (filterRating && filterRating !== "all") params.rating = filterRating;
      if (filterStatus && filterStatus !== "all") params.status = filterStatus;

      const res = await getAll(params);

      let items = [];
      let m = res?.data?.meta;
      const d = res?.data;

      if (Array.isArray(d)) items = d;
      else if (Array.isArray(d?.data)) items = d.data;
      else if (Array.isArray(d?.reviews)) items = d.reviews;
      else if (Array.isArray(d?.data?.reviews)) items = d.data.reviews;

      if (!m) {
        const total =
          Number(res?.data?.total || res?.data?.results || items.length) ||
          items.length;
        m = { total, page, totalPages: 1, limit: meta.limit };
      }

      setReviews(items);
      setMeta(m);
    } catch (e) {
      console.error("Erreur lors du chargement des avis:", e);
      setError("Impossible de charger les avis");
      setReviews([]);
      setMeta({ total: 0, totalPages: 1, page: 1, limit: 20 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchReviews(1), 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterRating, filterStatus]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showAddModal) setShowAddModal(false);
        if (showEditModal) setShowEditModal(false);
        if (showViewModal) setShowViewModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddModal, showEditModal, showViewModal]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const onView = (review) => {
    setViewing(review);
    setShowViewModal(true);
  };

  const filteredReviews = Array.isArray(reviews) ? reviews : [];

  if (loading) {
    return <LoadingSpinner text="Chargement des avis..." />;
  }

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des Avis Clients
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Modérez et gérez les avis des clients
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Avis</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {reviews.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Note Moyenne</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {reviews.length
                  ? (
                      reviews.reduce(
                        (sum, r) => sum + (Number(r.rating) || 0),
                        0
                      ) / reviews.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ThumbsUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Approuvés</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  (Array.isArray(reviews) ? reviews : []).filter(
                    (r) => r.status === "approved"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ThumbsDown className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  (Array.isArray(reviews) ? reviews : []).filter(
                    (r) => r.status === "pending"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un avis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Toutes les notes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous statuts</option>
              <option value="approved">Approuvés</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commentaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {review.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {review.product}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderStars(Number(review.rating) || 0)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({review.rating})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {review.comment}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        review.status
                      )}`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => onView(review)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {
                          setEditing({ ...review });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={async () => {
                          if (!confirm("Supprimer cet avis ?")) return;
                          try {
                            await adminService.reviews.delete(review.id);
                            await fetchReviews(meta.page);
                            showSuccess &&
                              showSuccess("Supprimé", "L'avis a été supprimé.");
                          } catch (e) {
                            showError &&
                              showError(
                                "Suppression impossible",
                                e?.response?.data?.message || "Erreur inconnue"
                              );
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Voir Plus */}
      {showViewModal && viewing && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de l'avis
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-500">Client</div>
                <div className="font-medium text-gray-900 break-words">
                  {viewing.customer}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Produit</div>
                <div className="font-medium text-gray-900 break-words">
                  {viewing.product}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Note</div>
                <div className="flex items-center">
                  {renderStars(Number(viewing.rating) || 0)}
                  <span className="ml-2">({viewing.rating})</span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Commentaire</div>
                <div className="font-medium text-gray-900 whitespace-pre-wrap">
                  {viewing.comment}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-medium text-gray-900">
                    {viewing.date || viewing.createdAt}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Statut</div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      viewing.status
                    )}`}
                  >
                    {viewing.status}
                  </span>
                </div>
              </div>
              {viewing.orderId && (
                <div>
                  <div className="text-gray-500">ID Commande</div>
                  <div className="font-medium text-gray-900 break-words">
                    {viewing.orderId}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end mt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {meta.page} sur {meta.totalPages}
        </div>
        <div className="space-x-2">
          <button
            disabled={meta.page <= 1}
            onClick={() => fetchReviews(Math.max(meta.page - 1, 1))}
            className={`px-3 py-1.5 text-sm rounded border ${
              meta.page <= 1
                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                : "text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            Précédent
          </button>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() =>
              fetchReviews(Math.min(meta.page + 1, meta.totalPages))
            }
            className={`px-3 py-1.5 text-sm rounded border ${
              meta.page >= meta.totalPages
                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                : "text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && editing && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Modifier l'avis
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await adminService.reviews.update(editing.id, {
                    customer: editing.customer,
                    product: editing.product,
                    rating: Number(editing.rating),
                    comment: editing.comment,
                    orderId: editing.orderId || "",
                    target: editing.productId || undefined,
                    targetModel: editing.productId ? 'Product' : undefined,
                  });
                  await fetchReviews(meta.page);
                  setShowEditModal(false);
                  showSuccess &&
                    showSuccess("Modifié", "L'avis a été mis à jour.");
                } catch (err) {
                  showError &&
                    showError(
                      "Mise à jour impossible",
                      err?.response?.data?.message || "Erreur inconnue"
                    );
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.customer}
                    onChange={(e) =>
                      setEditing({ ...editing, customer: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produit
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.product}
                    onChange={(e) =>
                      setEditing({ ...editing, product: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID du produit (Mongo ObjectId)
                  </label>
                  <input
                    type="text"
                    value={editing.productId || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, productId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Renseignez l'ID pour lier l'avis à un produit précis.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <select
                    value={editing.rating}
                    onChange={(e) =>
                      setEditing({ ...editing, rating: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value={5}>5 étoiles</option>
                    <option value={4}>4 étoiles</option>
                    <option value={3}>3 étoiles</option>
                    <option value={2}>2 étoiles</option>
                    <option value={1}>1 étoile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Commande
                  </label>
                  <input
                    type="text"
                    value={editing.orderId || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, orderId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editing.comment}
                    onChange={(e) =>
                      setEditing({ ...editing, comment: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nouvel Avis
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await adminService.reviews.create({
                    customer: newReview.customer,
                    product: newReview.product,
                    rating: Number(newReview.rating),
                    comment: newReview.comment,
                    orderId: newReview.orderId || "",
                    target: newReview.productId || undefined,
                    targetModel: newReview.productId ? 'Product' : undefined,
                  });
                  await fetchReviews(meta.page);
                  setNewReview({
                    customer: "",
                    product: "",
                    productId: "",
                    rating: 5,
                    comment: "",
                    orderId: "",
                  });
                  setShowAddModal(false);
                  showSuccess && showSuccess("Créé", "L'avis a été créé.");
                } catch (err) {
                  showError &&
                    showError(
                      "Création impossible",
                      err?.response?.data?.message || "Erreur inconnue"
                    );
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.customer}
                    onChange={(e) =>
                      setNewReview({ ...newReview, customer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produit (nom)
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.product}
                    onChange={(e) =>
                      setNewReview({ ...newReview, product: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID du produit (Mongo ObjectId)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 650f2c6a9f... (optionnel mais recommandé)"
                    value={newReview.productId}
                    onChange={(e) =>
                      setNewReview({ ...newReview, productId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Conseillé: remplir l'ID produit pour lier l'avis au produit exact.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note
                    </label>
                    <select
                      value={newReview.rating}
                      onChange={(e) =>
                        setNewReview({ ...newReview, rating: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={5}>5 étoiles</option>
                      <option value={4}>4 étoiles</option>
                      <option value={3}>3 étoiles</option>
                      <option value={2}>2 étoiles</option>
                      <option value={1}>1 étoile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Commande
                    </label>
                    <input
                      type="text"
                      placeholder="ex: CMD-001"
                      value={newReview.orderId}
                      onChange={(e) =>
                        setNewReview({ ...newReview, orderId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Créer l'avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewsModule;

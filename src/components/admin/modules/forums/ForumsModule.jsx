import {
  Clock,
  Edit,
  Eye,
  Flag,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../../contexts/ToastContext";
import { adminService } from "../../../../services/adminService.js";

const ForumsModule = () => {
  const { showSuccess, showError } = useToast?.() || {
    showSuccess: () => {},
    showError: () => {},
  };
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    category: "Général",
    author: "",
    content: "",
    tags: "",
  });
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showEditTopic, setShowEditTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await adminService.forums.categories.getAll();
      const data = res?.data?.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch {}
  };

  const isValidObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v || ""));

  const fetchTopics = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.forums.topics.getAll({
        q: searchTerm,
        status: filterStatus,
        category: filterCategory,
        page,
        limit: meta.limit,
        sort: "lastActivity",
        order: "desc",
      });
      const data = res?.data?.data || [];
      setTopics(Array.isArray(data) ? data : []);
      setMeta(
        res?.data?.meta || {
          total: data.length,
          totalPages: 1,
          page,
          limit: meta.limit,
        }
      );
    } catch (e) {
      setError("Impossible de charger les forums");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTopics(1);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchTopics(1), 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterStatus, filterCategory]);

  // Escape key to close modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showAddModal) setShowAddModal(false);
        if (showEditTopic) setShowEditTopic(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddModal, showEditTopic]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pinned":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTopics = Array.isArray(topics) ? topics : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des forums...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-700 bg-red-50 border border-red-200 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Gestion des catégories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              Catégories
            </h2>
            <p className="text-xs text-gray-600">
              Créer ou supprimer des catégories de forum
            </p>
          </div>
          <form
            className="flex items-center gap-2 w-full sm:w-auto"
            onSubmit={async (e) => {
              e.preventDefault();
              const name = newCategoryName.trim();
              if (!name) return;
              try {
                await adminService.forums.categories.create({ name });
                await fetchCategories();
                setNewCategoryName("");
                showSuccess && showSuccess("Catégorie créée", `« ${name} »`);
              } catch (err) {
                showError &&
                  showError(
                    "Création impossible",
                    err?.response?.data?.message || "Erreur inconnue"
                  );
              }
            }}
          >
            <input
              type="text"
              placeholder="Nouvelle catégorie"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Créer
            </button>
          </form>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.length === 0 && (
            <span className="text-sm text-gray-500">Aucune catégorie</span>
          )}

          {/* Modal d'édition de sujet */}
          {showEditTopic && editingTopic && (
            <div
              className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowEditTopic(false);
              }}
            >
              <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Modifier le sujet
                  </h3>
                  <button
                    onClick={() => setShowEditTopic(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const payload = {
                        title: editingTopic.title,
                        category: editingTopic.category,
                        content: editingTopic.content,
                        tags: String(editingTopic.tags || "")
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                        status: editingTopic.status || "active",
                      };
                      if (isValidObjectId(editingTopic.author)) {
                        payload.author = editingTopic.author;
                      } else if (editingTopic.author) {
                        payload.authorName = editingTopic.author;
                      }
                      const res = await adminService.forums.topics.update(
                        editingTopic.id,
                        payload
                      );
                      if (res?.data) {
                        await fetchTopics(meta.page);
                      }
                      showSuccess &&
                        showSuccess("Modifié", "Le sujet a été mis à jour.");
                      setShowEditTopic(false);
                    } catch (e) {
                      showError &&
                        showError(
                          "Mise à jour impossible",
                          e?.response?.data?.message || "Erreur inconnue"
                        );
                    }
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={editingTopic.title}
                        onChange={(e) =>
                          setEditingTopic({
                            ...editingTopic,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catégorie
                        </label>
                        <select
                          value={editingTopic.category}
                          onChange={(e) =>
                            setEditingTopic({
                              ...editingTopic,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Auteur
                        </label>
                        <input
                          type="text"
                          value={editingTopic.author}
                          onChange={(e) =>
                            setEditingTopic({
                              ...editingTopic,
                              author: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contenu
                      </label>
                      <textarea
                        rows={4}
                        value={editingTopic.content}
                        onChange={(e) =>
                          setEditingTopic({
                            ...editingTopic,
                            content: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={editingTopic.tags}
                        onChange={(e) =>
                          setEditingTopic({
                            ...editingTopic,
                            tags: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        value={editingTopic.status || "active"}
                        onChange={(e) =>
                          setEditingTopic({
                            ...editingTopic,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="active">Actif</option>
                        <option value="pinned">Épinglé</option>
                        <option value="closed">Fermé</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditTopic(false)}
                      className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 px-2 py-1 text-xs border rounded"
            >
              <span>{c.name}</span>
              <button
                className="text-red-600 hover:text-red-800"
                title="Supprimer"
                onClick={async () => {
                  if (!confirm(`Supprimer la catégorie « ${c.name} » ?`))
                    return;
                  try {
                    await adminService.forums.categories.delete(c.id);
                    await fetchCategories();
                    showSuccess && showSuccess("Supprimée", `« ${c.name} »`);
                  } catch (err) {
                    showError &&
                      showError(
                        "Suppression impossible",
                        err?.response?.data?.message || "Erreur inconnue"
                      );
                  }
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des Forums
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Modérez les discussions et gérez les catégories
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouveau sujet</span>
            <span className="sm:hidden">Sujet</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Sujets</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {topics.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Réponses</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {topics.reduce((sum, f) => sum + f.replies, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Vues</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {topics.reduce((sum, f) => sum + f.views, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Épinglés</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {topics.filter((f) => f.status === "pinned").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Toutes catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous statuts</option>
              <option value="active">Actif</option>
              <option value="pinned">Épinglé</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des forums */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sujet
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Catégorie
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Auteur
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Réponses
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Vues
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTopics.map((forum) => (
                <tr key={forum.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {forum.title}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{forum.lastActivity}</span>
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {forum.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {forum.category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell truncate">
                    {forum.author}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    {forum.replies}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    {forum.views}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        forum.status
                      )}`}
                    >
                      {forum.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                        onClick={() => {
                          /* placeholder view */
                        }}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                        onClick={() => {
                          setEditingTopic({
                            ...forum,
                            tags: Array.isArray(forum.tags)
                              ? forum.tags.join(", ")
                              : forum.tags || "",
                          });
                          setShowEditTopic(true);
                        }}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        onClick={async () => {
                          if (
                            !confirm(`Supprimer le sujet « ${forum.title} » ?`)
                          )
                            return;
                          try {
                            await adminService.forums.topics.delete(forum.id);
                            showSuccess &&
                              showSuccess(
                                "Supprimé",
                                "Le sujet a été supprimé."
                              );
                            await fetchTopics(meta.page);
                          } catch (e) {
                            showError &&
                              showError(
                                "Suppression impossible",
                                e?.response?.data?.message || "Erreur inconnue"
                              );
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de sujet */}
      {showAddModal && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nouveau Sujet
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
                  const payload = {
                    title: newTopic.title,
                    category: newTopic.category,
                    content: newTopic.content,
                    tags: newTopic.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  };
                  if (isValidObjectId(newTopic.author)) {
                    payload.author = newTopic.author;
                  } else if (newTopic.author) {
                    payload.authorName = newTopic.author;
                  }
                  await adminService.forums.topics.create(payload);
                  await fetchTopics(meta.page);
                  setNewTopic({
                    title: "",
                    category: "Général",
                    author: "",
                    content: "",
                    tags: "",
                  });
                  setShowAddModal(false);
                } catch (err) {
                  alert(
                    "Création impossible: " +
                      (err?.response?.data?.message || "Erreur inconnue")
                  );
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du sujet
                  </label>
                  <input
                    type="text"
                    required
                    value={newTopic.title}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={newTopic.category}
                      onChange={(e) =>
                        setNewTopic({ ...newTopic, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="Général">Général</option>
                      <option value="Élevage">Élevage</option>
                      <option value="Alimentation">Alimentation</option>
                      <option value="Santé">Santé</option>
                      <option value="Vente">Vente</option>
                      <option value="Technique">Technique</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auteur
                    </label>
                    <input
                      type="text"
                      required
                      value={newTopic.author}
                      onChange={(e) =>
                        setNewTopic({ ...newTopic, author: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newTopic.content}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: poulets, alimentation, conseils"
                    value={newTopic.tags}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, tags: e.target.value })
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
                  Créer le sujet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumsModule;

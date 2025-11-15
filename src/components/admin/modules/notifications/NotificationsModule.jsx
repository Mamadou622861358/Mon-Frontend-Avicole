import {
  Bell,
  Clock,
  Edit,
  Eye,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { io as socketIOClient } from "socket.io-client";
import { useToast } from "../../../../contexts/ToastContext";
import { adminService } from "../../../../services/adminService.js";

const NotificationsModule = () => {
  const { showSuccess, showError } = useToast?.() || {
    showSuccess: () => {},
    showError: () => {},
  };
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null); // { id, title, message, type, target, status }
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "general",
    target: "all",
  });

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        q: searchTerm,
        page,
        limit: meta.limit,
        sort: "createdAt",
        order: "desc",
      };
      if (filterType && filterType !== "all") params.type = filterType;
      if (filterStatus && filterStatus !== "all") params.status = filterStatus;
      const res = await adminService.notifications.getAll(params);
      const data = res?.data?.data || [];
      const m = res?.data?.meta || {
        total: data.length,
        page,
        totalPages: 1,
        limit: meta.limit,
      };
      setNotifications(data);
      setMeta(m);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setError("Impossible de charger les notifications");
      setNotifications([]);
      setMeta({ total: 0, totalPages: 1, page: 1, limit: 20 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchNotifications(1), 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterType, filterStatus]);

  // Live updates via Server-Sent Events (no extra deps)
  useEffect(() => {
    try {
      const base =
        import.meta?.env?.VITE_API_URL || "http://localhost:5002/api/v1";
      const url = base.replace(/\/$/, "") + "/events";
      const es = new EventSource(url, { withCredentials: true });
      const onPing = () => fetchNotifications(meta.page || 1);
      const onWelcome = () => fetchNotifications(1);
      es.addEventListener("ping", onPing);
      es.addEventListener("welcome", onWelcome);
      es.onerror = () => {
        // fallback silent; browser will auto-retry per SSE retry header
      };
      return () => {
        es.removeEventListener("ping", onPing);
        es.removeEventListener("welcome", onWelcome);
        es.close();
      };
    } catch (e) {
      // ignore SSE errors in unsupported envs
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.page]);

  // Live updates via Socket.IO (instantané)
  useEffect(() => {
    try {
      const apiBase =
        import.meta?.env?.VITE_API_URL || "http://localhost:5002/api/v1";
      const socketBase = apiBase.replace(/\/api\/v1\/?$/, "");
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const socket = socketIOClient(socketBase, {
        auth: { token },
        withCredentials: true,
      });
      const onNotification = (payload) => {
        fetchNotifications(meta.page || 1);
        try {
          const title = payload?.title || "Notification reçue";
          showSuccess && showSuccess("Notification", title);
        } catch {}
      };
      socket.on("notification", onNotification);
      return () => {
        socket.off("notification", onNotification);
        socket.close();
      };
    } catch (e) {
      // en cas d'échec Socket.IO, SSE continue d'assurer un rafraîchissement périodique
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.page]);

  // Escape key to close modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showAddModal) setShowAddModal(false);
        if (showEditModal) setShowEditModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddModal, showEditModal]);

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "promotion":
        return "bg-purple-100 text-purple-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "product":
        return "bg-blue-100 text-blue-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredNotifications = Array.isArray(notifications)
    ? notifications
    : [];

  const handleBroadcast = async (id) => {
    try {
      await adminService.notifications.broadcast(id);
      await fetchNotifications(meta.page);
      showSuccess &&
        showSuccess("Notification envoyée", "La notification a été diffusée.");
    } catch (e) {
      showError &&
        showError(
          "Envoi impossible",
          e?.response?.data?.message || "Erreur inconnue"
        );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette notification ?")) return;
    try {
      await adminService.notifications.delete(id);
      await fetchNotifications(meta.page);
      showSuccess &&
        showSuccess("Supprimée", "La notification a été supprimée.");
    } catch (e) {
      showError &&
        showError(
          "Suppression impossible",
          e?.response?.data?.message || "Erreur inconnue"
        );
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.notifications.updateStatus(id, status);
      await fetchNotifications(meta.page);
      showSuccess && showSuccess("Statut mis à jour", `Statut → ${status}`);
    } catch (e) {
      showError &&
        showError(
          "Mise à jour impossible",
          e?.response?.data?.message || "Erreur inconnue"
        );
    }
  };

  const openEdit = (n) => {
    setEditing({ ...n });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">
          Chargement des notifications...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Créez et gérez les notifications pour vos utilisateurs
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Nouvelle notification</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Total Notifications
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Send className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Envoyées</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  (Array.isArray(notifications) ? notifications : []).filter(
                    (n) => n.status === "sent"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Programmées</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  (Array.isArray(notifications) ? notifications : []).filter(
                    (n) => n.status === "scheduled"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Destinataires</p>
              <p className="text-xl font-bold text-gray-900">
                {notifications.reduce(
                  (sum, n) => sum + (Number(n?.recipients) || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une notification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les types</option>
              <option value="promotion">Promotion</option>
              <option value="maintenance">Maintenance</option>
              <option value="product">Produit</option>
              <option value="general">Général</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous statuts</option>
              <option value="draft">Brouillon</option>
              <option value="scheduled">Programmé</option>
              <option value="sent">Envoyé</option>
              <option value="failed">Échec</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinataires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                        {!notification.isRead && (
                          <span title="Non lu" className="text-blue-600">
                            •
                          </span>
                        )}
                        <span>{notification.title}</span>
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {notification.message}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(notification?.recipients) || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        notification.status || "draft"
                      )}`}
                    >
                      {notification.status || "draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notification?.date ? String(notification.date) : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className={`$${"{"}notification.isRead ? 'text-gray-600 hover:text-gray-900' : 'text-indigo-600 hover:text-indigo-800'${"}"}`}
                        onClick={() =>
                          handleStatusChange(
                            notification.id,
                            notification.isRead ? "unread" : "read"
                          )
                        }
                        title={
                          notification.isRead
                            ? "Marquer comme non lu"
                            : "Marquer comme lu"
                        }
                      >
                        {notification.isRead ? "↺" : "✓"}
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => openEdit(notification)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-900"
                        onClick={() => handleBroadcast(notification.id)}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(notification.id)}
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {meta.page} sur {meta.totalPages}
        </div>
        <div className="space-x-2">
          <button
            disabled={meta.page <= 1}
            onClick={() => fetchNotifications(Math.max(meta.page - 1, 1))}
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
              fetchNotifications(Math.min(meta.page + 1, meta.totalPages))
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

      {/* Modal d'ajout de notification */}
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
                Nouvelle Notification
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
                  await adminService.notifications.create({
                    title: newNotification.title,
                    message: newNotification.message,
                    type: newNotification.type,
                    target: newNotification.target,
                    status: "draft",
                  });
                  await fetchNotifications(meta.page);
                  setNewNotification({
                    title: "",
                    message: "",
                    type: "general",
                    target: "all",
                  });
                  setShowAddModal(false);
                  showSuccess &&
                    showSuccess("Créée", "La notification a été créée.");
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
                    Titre
                  </label>
                  <input
                    type="text"
                    required
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newNotification.message}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        message: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newNotification.type}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="general">Général</option>
                      <option value="promotion">Promotion</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="product">Produit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cible
                    </label>
                    <select
                      value={newNotification.target}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          target: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Tous les utilisateurs</option>
                      <option value="clients">Clients seulement</option>
                      <option value="farmers">Éleveurs seulement</option>
                      <option value="admins">Administrateurs</option>
                    </select>
                  </div>
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
                  Créer la notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de notification */}
      {showEditModal && editing && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Modifier la Notification
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
                  await adminService.notifications.update(editing.id, {
                    title: editing.title,
                    message: editing.message,
                    type: editing.type,
                    target: editing.target,
                    status: editing.status,
                  });
                  await fetchNotifications(meta.page);
                  setShowEditModal(false);
                  showSuccess &&
                    showSuccess(
                      "Modifiée",
                      "La notification a été mise à jour."
                    );
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
                    Titre
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editing.message}
                    onChange={(e) =>
                      setEditing({ ...editing, message: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={editing.type}
                      onChange={(e) =>
                        setEditing({ ...editing, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="general">Général</option>
                      <option value="promotion">Promotion</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="product">Produit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cible
                    </label>
                    <select
                      value={editing.target}
                      onChange={(e) =>
                        setEditing({ ...editing, target: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Tous</option>
                      <option value="clients">Clients</option>
                      <option value="farmers">Éleveurs</option>
                      <option value="admins">Admins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={editing.status || "draft"}
                      onChange={(e) =>
                        setEditing({ ...editing, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="scheduled">Programmé</option>
                      <option value="sent">Envoyé</option>
                      <option value="failed">Échec</option>
                    </select>
                  </div>
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
    </div>
  );
};

export default NotificationsModule;

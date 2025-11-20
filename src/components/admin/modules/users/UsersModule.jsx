import {
  Edit,
  Eye,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../../contexts/ToastContext";
import { adminService } from "../../../../../services/api";

const UsersModule = () => {
  const { showSuccess, showError } = useToast?.() || {
    showSuccess: () => {},
    showError: () => {},
  };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "client",
    location: "",
    password: "",
  });
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const qTerm = (searchTerm || "").trim();
      const res = await adminService.getUsers({
        q: qTerm.length >= 2 ? qTerm : "",
        role: filterRole,
        status: filterStatus,
        page,
        limit: meta.limit,
        sort: "createdAt",
        order: "desc",
      });
      const payload = res?.data?.data;
      const data = Array.isArray(payload) ? payload : payload?.users || [];
      console.debug("Users payload:", {
        count: Array.isArray(data) ? data.length : 0,
        raw: res?.data,
      });
      const m = res?.data?.meta || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      setUsers(data);
      setMeta(m);
    } catch (e) {
      console.error("Erreur lors du chargement des utilisateurs:", e);
      setError("Impossible de charger les utilisateurs");
      setUsers([]);
      setMeta({ total: 0, totalPages: 1, page: 1, limit: 20 });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (user) => {
    if (!confirm(`Supprimer l'utilisateur "${user.name}" ?`)) return;
    try {
      await adminService.deleteUser(user.id);
      showSuccess && showSuccess("Supprimé", "L'utilisateur a été supprimé.");
      await fetchUsers(meta.page);
    } catch (e) {
      showError &&
        showError(
          "Suppression impossible",
          e?.response?.data?.message || "Erreur inconnue"
        );
    }
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewing, setViewing] = useState(null);
  const onView = (user) => {
    setViewing(user);
    setShowViewModal(true);
  };

  // Menu contextuel (trois points)
  const [menuOpenId, setMenuOpenId] = useState(null);
  const toggleMenu = (id) => setMenuOpenId((prev) => (prev === id ? null : id));
  const closeMenu = () => setMenuOpenId(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const onClick = (e) => {
      const target = e.target;
      if (!target.closest) return;
      if (!target.closest("[data-user-menu]")) closeMenu();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    fetchUsers(1); /* initial */
  }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterRole, filterStatus]);

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    const s = (searchTerm || "").toLowerCase();
    const matchesSearch =
      s.length < 1 ||
      (user.name && user.name.toLowerCase().includes(s)) ||
      (user.email && user.email.toLowerCase().includes(s)) ||
      (user.phone && String(user.phone).toLowerCase().includes(s)) ||
      (user.location && String(user.location).toLowerCase().includes(s));
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Statistiques et pourcentages
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const activeCount = Array.isArray(users)
    ? users.filter((u) => u.status === "active").length
    : 0;
  const adminCount = Array.isArray(users)
    ? users.filter((u) => (u.role || "").toLowerCase() === "admin").length
    : 0;
  const now = Date.now();
  const last30d = now - 30 * 24 * 60 * 60 * 1000;
  const newUsersCount = Array.isArray(users)
    ? users.filter(
        (u) => u.createdAt && new Date(u.createdAt).getTime() >= last30d
      ).length
    : 0;
  const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "producer":
        return "bg-green-100 text-green-800";
      case "client":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    return status === "active" ? (
      <UserCheck className="w-4 h-4 text-green-600" />
    ) : (
      <UserX className="w-4 h-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">
          Chargement des utilisateurs...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez les comptes utilisateurs de votre plateforme
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouvel utilisateur</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
          <div className="mt-2 sm:mt-0 text-xs text-gray-500">
            {filteredUsers.length} résultat(s)
            {searchTerm ? ` pour "${searchTerm}"` : ""}
          </div>
        </div>
      </div>

      {/* Statistiques compactes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {totalUsers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Actifs</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {activeCount}
              </p>
              <p className="text-xs text-gray-500">
                {pct(activeCount, totalUsers)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Nouveaux</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {newUsersCount}
              </p>
              <p className="text-xs text-gray-500">
                {pct(newUsersCount, totalUsers)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Admins</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {adminCount}
              </p>
              <p className="text-xs text-gray-500">
                {pct(adminCount, totalUsers)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres compacts */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher (nom, email, téléphone, localisation)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
              {searchTerm && (
                <button
                  aria-label="Effacer la recherche"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 text-gray-500"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full sm:w-auto px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous</option>
              <option value="admin">Admin</option>
              <option value="producer">Éleveur</option>
              <option value="client">Client</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* État aucun résultat */}
      {users.length > 0 && filteredUsers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md px-4 py-3">
          Aucun utilisateur ne correspond à votre recherche.
          <button className="ml-2 underline" onClick={() => setSearchTerm("")}>
            Réinitialiser
          </button>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Contact
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Statut
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Dernière connexion
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate sm:hidden">
                          {user.email}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
                          {user.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center">
                      {getStatusIcon(user.status)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {/* Date de création comme fallback */}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td
                    className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium relative"
                    data-user-menu
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                        onClick={() => onView(user)}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                        onClick={() => {
                          setEditing({ ...user });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded sm:block hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(user.id);
                        }}
                      >
                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    {menuOpenId === user.id && (
                      <div
                        className="absolute right-2 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            closeMenu();
                            onView(user);
                          }}
                        >
                          Voir
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            closeMenu();
                            setEditing({ ...user });
                            setShowEditModal(true);
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            closeMenu();
                            setEditing({
                              ...user,
                              status:
                                user.status === "active"
                                  ? "suspended"
                                  : "active",
                            });
                            setShowEditModal(true);
                          }}
                        >
                          {user.status === "active" ? "Suspendre" : "Activer"}
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            closeMenu();
                            onDelete(user);
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Page <span className="font-medium">{meta.page}</span> /{" "}
          <span className="font-medium">{meta.totalPages}</span> — {meta.total}{" "}
          utilisateurs
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={meta.page <= 1}
            onClick={() => fetchUsers(meta.page - 1)}
            className="px-3 py-2 text-sm text-gray-500 disabled:text-gray-300 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Précédent
          </button>
          <button
            disabled
            className="px-3 py-2 text-sm text-white bg-green-600 border border-green-600 rounded-lg"
          >
            {meta.page}
          </button>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchUsers(meta.page + 1)}
            className="px-3 py-2 text-sm text-gray-500 disabled:text-gray-300 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-4 sm:pt-8 z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nouvel Utilisateur
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
                  const role =
                    (newUser.role || "").toLowerCase() === "producer"
                      ? "producteur"
                      : (newUser.role || "client").toLowerCase();
                  const payload = {
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    localisation: newUser.location,
                    password: newUser.password,
                    role,
                  };
                  await adminService.createUser(payload);
                  await fetchUsers(meta.page);
                  setShowAddModal(false);
                  setNewUser({
                    name: "",
                    email: "",
                    phone: "",
                    role: "client",
                    location: "",
                    password: "",
                  });
                  showSuccess &&
                    showSuccess("Créé", "L'utilisateur a été créé.");
                } catch (err) {
                  const apiErr = err?.response?.data;
                  const details = Array.isArray(apiErr?.errors)
                    ? "\n" +
                      apiErr.errors.map((e) => `- ${e.message}`).join("\n")
                    : "";
                  showError &&
                    showError(
                      "Création impossible",
                      (apiErr?.message || "Erreur inconnue") + details
                    );
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="client">Client</option>
                    <option value="producer">Producteur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.location}
                    onChange={(e) =>
                      setNewUser({ ...newUser, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
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
                  Créer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation d'utilisateur */}
      {showViewModal && viewing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de l'utilisateur
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewing(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nom:</span>{" "}
                <span className="text-gray-900">{viewing.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>{" "}
                <span className="text-gray-900">{viewing.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Téléphone:</span>{" "}
                <span className="text-gray-900">{viewing.phone || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Localisation:</span>{" "}
                <span className="text-gray-900">{viewing.location || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Rôle:</span>{" "}
                <span className="text-gray-900 capitalize">{viewing.role}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Statut:</span>{" "}
                <span className="text-gray-900 capitalize">
                  {viewing.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Créé le:</span>{" "}
                <span className="text-gray-900">
                  {viewing.createdAt
                    ? new Date(viewing.createdAt).toLocaleString("fr-FR")
                    : "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewing(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const u = viewing;
                  setShowViewModal(false);
                  setViewing(null);
                  setEditing({ ...u });
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition d'utilisateur */}
      {showEditModal && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Modifier l'utilisateur
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
                  const role =
                    (editing.role || "").toLowerCase() === "producer"
                      ? "producteur"
                      : (editing.role || "").toLowerCase();
                  await adminService.updateUser(editing.id, {
                    name: editing.name,
                    email: editing.email,
                    phone: editing.phone,
                    role,
                    status: editing.status,
                  });
                  await fetchUsers(meta.page);
                  setShowEditModal(false);
                  showSuccess &&
                    showSuccess("Modifié", "L'utilisateur a été mis à jour.");
                } catch (err) {
                  showError &&
                    showError(
                      "Mise à jour impossible",
                      err?.response?.data?.message || "Erreur inconnue"
                    );
                }
              }}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editing.email}
                    onChange={(e) =>
                      setEditing({ ...editing, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={editing.phone || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle
                    </label>
                    <select
                      value={editing.role}
                      onChange={(e) =>
                        setEditing({ ...editing, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="client">Client</option>
                      <option value="producer">Producteur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={editing.status || "active"}
                      onChange={(e) =>
                        setEditing({ ...editing, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="active">Actif</option>
                      <option value="suspended">Suspendu</option>
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

export default UsersModule;

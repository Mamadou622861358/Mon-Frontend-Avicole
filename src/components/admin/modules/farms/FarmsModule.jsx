import {
  Activity,
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../../contexts/ToastContext";
import { adminService } from "../../../../../services/api";

// Normalise n'importe quelle forme (admin DTO ou schéma public) vers un objet plat attendu par l'UI
const normalizeFarm = (f) => {
  if (!f) return null;
  const id = f.id || f._id || f.uuid || String(Math.random());
  const name = f.name || f.nom || f.title || "—";
  let owner = f.owner;
  if (owner && typeof owner === "object") {
    owner =
      owner.name ||
      owner.fullName ||
      `${owner.prenom || ""} ${owner.nom || ""}`.trim() ||
      owner.email ||
      owner._id ||
      "—";
  }
  if (!owner && f.contactPerson) {
    owner = f.contactPerson.fullName || f.contactPerson.name || "—";
  }
  let contact = f.contact;
  if (!contact && f.contactPerson) {
    const ph = f.contactPerson.phone || f.contactPerson.telephone || "";
    const em = f.contactPerson.email || "";
    contact = [ph, em].filter(Boolean).join(" / ");
  }
  if (contact && typeof contact === "object") {
    contact = [contact.phone, contact.email].filter(Boolean).join(" / ");
  }
  let location = f.location;
  const addr = f.address || f.adresse;
  if (!location && addr && typeof addr === "object") {
    location = [
      addr.city || addr.ville,
      addr.region || addr.district,
      addr.country || "Guinée",
    ]
      .filter(Boolean)
      .join(", ");
  }
  if (location && typeof location === "object") {
    location = [
      location.city,
      location.region || location.district,
      location.country,
    ]
      .filter(Boolean)
      .join(", ");
  }
  let size = f.size;
  const capacity = f.capacity || {};
  const area = capacity.area || {};
  if (!size && (area.value || area.unit)) {
    size = `${area.value || 0} ${area.unit || "m²"}`;
  }
  let animals = f.animals;
  if (animals == null)
    animals =
      (capacity.totalBirds != null
        ? Number(capacity.totalBirds)
        : Number(f?.stats?.totalBirds)) || 0;
  let type = f.type;
  if (!type && Array.isArray(f.farmType)) {
    if (f.farmType.length > 1) type = "Mixte";
    else {
      const t0 = f.farmType[0];
      type =
        t0 === "poules_pondeuses"
          ? "Pondeuses"
          : t0 === "poulet_de_chair"
          ? "Poulets de chair"
          : "Autre";
    }
  }
  let status = f.status;
  if (["actif", "inactif", "en_pause", "en_construction"].includes(status)) {
    status =
      status === "actif"
        ? "active"
        : status === "inactif"
        ? "inactive"
        : status === "en_pause"
        ? "maintenance"
        : "inactive";
  }
  return {
    id,
    name,
    owner: typeof owner === "string" ? owner : String(owner || "—"),
    location: typeof location === "string" ? location : String(location || "—"),
    size: typeof size === "string" ? size : String(size || ""),
    animals: Number(animals) || 0,
    type: type || "Autre",
    contact: typeof contact === "string" ? contact : String(contact || ""),
    status: status || "active",
  };

  const onView = (farm) => {
    setViewing(farm);
    setShowViewModal(true);
  };
};

const FarmsModule = () => {
  const { showSuccess, showError } = useToast?.() || {
    showSuccess: () => {},
    showError: () => {},
  };
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [newFarm, setNewFarm] = useState({
    name: "",
    ownerId: "",
    addressStreet: "",
    addressRegion: "",
    size: "",
    animals: "",
    type: "Pondeuses",
    contactFullName: "",
    contactEmail: "",
    contactPhone: "",
    contactRole: "",
    description: "",
  });

  // Liste des utilisateurs pour sélectionner le propriétaire
  const [owners, setOwners] = useState([]);
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await adminService.getUsers({ role: "farmer" });
        const list = res?.data?.users ?? res?.data ?? [];
        setOwners(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("[FarmsModule] Impossible de charger les propriétaires:", e);
        setOwners([]);
      }
    };
    fetchOwners();
  }, []);

  const fetchFarms = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      // Construire des paramètres propres pour l'API réelle
      const params = {
        page,
        limit: meta.limit,
        sort: "createdAt",
        order: "desc",
      };
      const q = String(searchTerm || "").trim();
      if (q.length > 0) params.search = q;
      if (filterStatus && filterStatus !== "all") params.status = filterStatus;
      console.log("[FarmsModule] Paramètres API:", params);
      const res = await adminService.getFarms(params);
      console.log("Réponse reçue:", res);
      const raw =
        res?.data?.data?.farms ||
        res?.data?.farms ||
        res?.data?.data ||
        res?.data ||
        [];
      console.log("Données brutes:", raw);
      let data = Array.isArray(raw) ? raw : [];
      console.log("Données normalisées:", data);
      let m = res?.data?.meta ||
        res?.data?.data?.meta || {
          total: Array.isArray(data) ? data.length : 0,
          page: Number(page) || 1,
          totalPages: Math.ceil(
            (Array.isArray(data) ? data.length : 0) / (meta.limit || 20)
          ),
          limit: meta.limit || 20,
        };
      // Normaliser les données
      data = data.map((farm) => ({
        id: farm._id || farm.id,
        name: (typeof farm.name === "string"
                ? farm.name
                : (farm.name?.title || farm.name?.value || farm.nom || "—")),
        owner: farm.owner?.firstName
          ? `${farm.owner.firstName} ${farm.owner.lastName || ""}`.trim()
          : (typeof farm.owner === "string"
              ? farm.owner
              : (farm.owner?.fullName || farm.owner?.name || farm.owner?.email || farm.owner?._id || "—")),
        location: farm.address
          ? `${farm.address.city || ""}${farm.address.region ? ", " + farm.address.region : ""}`
          : (typeof farm.location === "string"
              ? farm.location
              : [farm.location?.city, farm.location?.region, farm.location?.district, farm.location?.country]
                .filter(Boolean)
                .join(", ") || "—"
            ),
        size: farm.capacity?.area
          ? `${farm.capacity.area.value} ${farm.capacity.area.unit}`
          : (typeof farm.size === "string" ? farm.size : String(farm.size || "")),
        animals: farm.capacity?.totalBirds || farm.animals || 0,
        type: Array.isArray(farm.farmType)
          ? farm.farmType.length > 1
            ? "Mixte"
            : farm.farmType[0]
          : (typeof farm.type === "string" ? farm.type : String(farm.type || "Autre")),
        contact: farm.contactPerson
          ? `${farm.contactPerson.phone || ""}${farm.contactPerson.email ? " / " + farm.contactPerson.email : ""}`
          : (typeof farm.contact === "string"
              ? farm.contact
              : [farm.contact?.phone, farm.contact?.email]
                  .filter(Boolean)
                  .join(" / ") || ""
            ),
        status: typeof farm.status === "string" ? farm.status : "active",
      }));
      // Les données sont déjà normalisées
      setFarms(data);
      setMeta(m);
    } catch (error) {
      console.error("Erreur lors du chargement des fermes:", error);
      setError("Impossible de charger les fermes");
      setFarms([]);
      setMeta({ total: 0, totalPages: 1, page: 1, limit: 20 });
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (farm) => {
    setEditing({ ...farm });
    setShowEditModal(true);
  };

  const onDelete = async (farm) => {
    if (!confirm(`Supprimer la ferme "${farm.name}" ?`)) return;
    try {
      await adminService.deleteFarm(farm.id);
      showSuccess && showSuccess("Supprimé", "La ferme a été supprimée.");
      await fetchFarms(meta.page);
    } catch (e) {
      showError &&
        showError(
          "Suppression impossible",
          e?.response?.data?.message || "Erreur inconnue"
        );
    }
  };

  useEffect(() => {
    fetchFarms(1);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchFarms(1), 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterStatus]);

  // Escape key to close modals
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
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredFarms = Array.isArray(farms) ? farms : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des fermes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des Fermes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez les fermes partenaires de votre plateforme
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle ferme</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Statistiques compactes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {farms.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Animaux</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {(Array.isArray(farms) ? farms : []).reduce(
                  (sum, farm) => sum + (Number(farm?.animals) || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Actives</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {
                  (Array.isArray(farms) ? farms : []).filter(
                    (farm) => farm?.status === "active"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Moyenne</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {Array.isArray(farms) && farms.length > 0
                  ? Math.round(
                      farms.reduce(
                        (sum, farm) => sum + (Number(farm?.animals) || 0),
                        0
                      ) / farms.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres compacts */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Statuts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des fermes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ferme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Animaux
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
              {(Array.isArray(filteredFarms) ? filteredFarms : []).map(
                (farm) => (
                  <tr key={farm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {farm.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {farm.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{farm.owner}</div>
                      <div className="text-sm text-gray-500">
                        {farm.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {farm.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {farm.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(farm?.animals || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          farm.status
                        )}`}
                      >
                        {farm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => onView(farm)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => onEdit(farm)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => onDelete(farm)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Voir Plus (lecture seule) */}
      {showViewModal && viewing && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Détails de la ferme
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Nom</div>
                <div className="font-medium text-gray-900 break-words">
                  {viewing.name}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500">Propriétaire</div>
                  <div className="font-medium text-gray-900 break-words">
                    {viewing.owner}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Contact</div>
                  <div className="font-medium text-gray-900 break-words">
                    {viewing.contact || "—"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500">Localisation</div>
                  <div className="font-medium text-gray-900 break-words">
                    {viewing.location}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Taille</div>
                  <div className="font-medium text-gray-900 break-words">
                    {viewing.size || "—"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500">Animaux</div>
                  <div className="font-medium text-gray-900">
                    {Number(viewing.animals || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="font-medium text-gray-900">
                    {viewing.type}
                  </div>
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

      {/* Modal d'ajout de ferme */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle Ferme</h3>
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
                  // Validation côté front
                  const name = String(newFarm.name || "").trim();
                  const ownerId = String(newFarm.ownerId || "").trim();
                  const addressStreet = String(newFarm.addressStreet || "").trim();
                  const addressRegion = String(newFarm.addressRegion || "").trim();
                  const contactFullName = String(newFarm.contactFullName || "").trim();
                  const contactEmail = String(newFarm.contactEmail || "").trim();
                  const contactPhone = String(newFarm.contactPhone || "").trim();
                  const contactRole = String(newFarm.contactRole || "").trim();
                  const description = String(newFarm.description || "").trim();
                  const type = String(newFarm.type || "Pondeuses");
                  const animalsNum = Number(newFarm.animals);
                  if (name.length < 2)
                    return (
                      showError &&
                      showError(
                        "Validation",
                        "Le nom de la ferme doit contenir au moins 2 caractères."
                      )
                    );
                  if (!ownerId)
                    return (
                      showError &&
                      showError("Validation", "Le propriétaire est requis.")
                    );
                  if (!addressRegion)
                    return (
                      showError &&
                      showError("Validation", "La région est requise.")
                    );
                  if (!addressStreet)
                    return (
                      showError &&
                      showError("Validation", "La rue est requise.")
                    );
                  if (!contactFullName)
                    return (
                      showError &&
                      showError("Validation", "Le nom complet du contact est requis.")
                    );
                  if (!contactEmail)
                    return (
                      showError &&
                      showError("Validation", "L'email du contact est requis.")
                    );
                  if (!contactRole)
                    return (
                      showError &&
                      showError("Validation", "Le rôle du contact est requis.")
                    );
                  if (!description)
                    return (
                      showError &&
                      showError("Validation", "La description est requise.")
                    );
                  if (Number.isNaN(animalsNum) || animalsNum < 0)
                    return (
                      showError &&
                      showError(
                        "Validation",
                        "Le nombre d'animaux doit être un nombre ≥ 0."
                      )
                    );

                  // Parsing simple de la taille: "12 ha" ou "2000 m²"
                  const sizeStr = String(newFarm.size || "").trim();
                  const sizeMatch = sizeStr.match(/^(\d+(?:[\.,]\d+)?)\s*(\S+)?$/);
                  const areaValue = sizeMatch ? Number(sizeMatch[1].replace(",", ".")) : undefined;
                  const areaUnit = sizeMatch ? (sizeMatch[2] || "m²") : undefined;

                  // Mapping du type vers les codes API probables
                  const mapTypeToFarmType = (t) => {
                    if (t === "Pondeuses") return ["poules_pondeuses"]; 
                    if (t === "Poulets de chair") return ["poulet_de_chair"]; 
                    if (t === "Mixte") return ["poules_pondeuses", "poulet_de_chair"]; 
                    return [String(t).toLowerCase()];
                  };

                  // Construire un payload compatible avec l'API admin (schéma structuré + champs plats)
                  const payload = {
                    name,
                    // owner doit être un ObjectId côté backend
                    owner: ownerId,
                    size: sizeStr,
                    animals: animalsNum,
                    type,
                    description,

                    address: {
                      street: addressStreet,
                      region: addressRegion,
                    },
                    contactPerson: {
                      fullName: contactFullName,
                      phone: contactPhone,
                      email: contactEmail,
                      role: contactRole,
                    },
                    capacity: {
                      totalBirds: animalsNum,
                      area: areaValue ? { value: areaValue, unit: areaUnit } : undefined,
                    },
                    farmType: mapTypeToFarmType(type),
                  };

                  // Nettoyer les champs undefined
                  Object.keys(payload).forEach((k) => {
                    if (payload[k] == null) delete payload[k];
                  });
                  if (payload.capacity && payload.capacity.area == null) {
                    delete payload.capacity.area;
                  }

                  await adminService.createFarm(payload);
                  await fetchFarms(meta.page);
                  setNewFarm({
                    name: "",
                    ownerId: "",
                    addressStreet: "",
                    addressRegion: "",
                    size: "",
                    animals: "",
                    type: "Pondeuses",
                    contactFullName: "",
                    contactEmail: "",
                    contactPhone: "",
                    contactRole: "",
                    description: "",
                  });
                  setShowAddModal(false);
                  showSuccess && showSuccess("Créé", "La ferme a été créée.");
                } catch (err) {
                  const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Erreur inconnue";
                  showError && showError("Création impossible", msg);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la ferme
                  </label>
                  <input
                    type="text"
                    required
                    value={newFarm.name}
                    onChange={(e) =>
                      setNewFarm({ ...newFarm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Propriétaire</label>
                  <select
                    required
                    value={newFarm.ownerId}
                    onChange={(e) => setNewFarm({ ...newFarm, ownerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {(owners || []).map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u._id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                    <input
                      type="text"
                      required
                      value={newFarm.addressStreet}
                      onChange={(e) => setNewFarm({ ...newFarm, addressStreet: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                    <input
                      type="text"
                      required
                      value={newFarm.addressRegion}
                      onChange={(e) => setNewFarm({ ...newFarm, addressRegion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taille
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: 2 hectares"
                      value={newFarm.size}
                      onChange={(e) =>
                        setNewFarm({ ...newFarm, size: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Animaux
                    </label>
                    <input
                      type="number"
                      required
                      value={newFarm.animals}
                      onChange={(e) =>
                        setNewFarm({ ...newFarm, animals: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'élevage
                  </label>
                  <select
                    value={newFarm.type}
                    onChange={(e) =>
                      setNewFarm({ ...newFarm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Pondeuses">Pondeuses</option>
                    <option value="Poulets de chair">Poulets de chair</option>
                    <option value="Mixte">Mixte</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet du contact</label>
                      <input
                        type="text"
                        required
                        value={newFarm.contactFullName}
                        onChange={(e) => setNewFarm({ ...newFarm, contactFullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email du contact</label>
                      <input
                        type="email"
                        required
                        value={newFarm.contactEmail}
                        onChange={(e) => setNewFarm({ ...newFarm, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du contact</label>
                      <input
                        type="tel"
                        value={newFarm.contactPhone}
                        onChange={(e) => setNewFarm({ ...newFarm, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle du contact</label>
                      <input
                        type="text"
                        required
                        value={newFarm.contactRole}
                        onChange={(e) => setNewFarm({ ...newFarm, contactRole: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newFarm.description}
                    onChange={(e) => setNewFarm({ ...newFarm, description: e.target.value })}
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
                  Créer la ferme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de ferme */}
      {showEditModal && editing && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Modifier la Ferme
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
                  const name = String(editing.name || "").trim();
                  const owner = String(editing.owner || "").trim();
                  const location = String(editing.location || "").trim();
                  const contact = String(editing.contact || "").trim();
                  const type = String(editing.type || "Pondeuses");
                  const animalsNum = Number(editing.animals);
                  if (name.length < 2)
                    return (
                      showError &&
                      showError(
                        "Validation",
                        "Le nom de la ferme doit contenir au moins 2 caractères."
                      )
                    );
                  if (!owner)
                    return (
                      showError &&
                      showError(
                        "Validation",
                        "Le nom du propriétaire est requis."
                      )
                    );
                  if (!location)
                    return (
                      showError &&
                      showError("Validation", "La localisation est requise.")
                    );
                  if (!contact)
                    return (
                      showError &&
                      showError("Validation", "Le contact est requis.")
                    );
                  if (Number.isNaN(animalsNum) || animalsNum < 0)
                    return (
                      showError &&
                      showError(
                        "Validation",
                        "Le nombre d'animaux doit être un nombre ≥ 0."
                      )
                    );

                  const payload = {
                    name,
                    owner,
                    location,
                    size: String(editing.size || "").trim(),
                    animals: animalsNum,
                    type,
                    contact,
                  };
                  await adminService.updateFarm(editing.id, payload);
                  await fetchFarms(meta.page);
                  setShowEditModal(false);
                  showSuccess &&
                    showSuccess("Modifié", "La ferme a été mise à jour.");
                } catch (err) {
                  const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Erreur inconnue";
                  showError && showError("Mise à jour impossible", msg);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la ferme
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
                    Propriétaire
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.owner}
                    onChange={(e) =>
                      setEditing({ ...editing, owner: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.location}
                    onChange={(e) =>
                      setEditing({ ...editing, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taille
                    </label>
                    <input
                      type="text"
                      required
                      value={editing.size}
                      onChange={(e) =>
                        setEditing({ ...editing, size: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Animaux
                    </label>
                    <input
                      type="number"
                      required
                      value={editing.animals}
                      onChange={(e) =>
                        setEditing({ ...editing, animals: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'élevage
                  </label>
                  <select
                    value={editing.type}
                    onChange={(e) =>
                      setEditing({ ...editing, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Pondeuses">Pondeuses</option>
                    <option value="Poulets de chair">Poulets de chair</option>
                    <option value="Mixte">Mixte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <input
                    type="tel"
                    required
                    value={editing.contact}
                    onChange={(e) =>
                      setEditing({ ...editing, contact: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
    </div>
  );
};

export default FarmsModule;

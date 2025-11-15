import React, { useState, useEffect } from 'react';
import { adminService, serviceService } from '../../../../services/api';
import { useToast } from '../../../../contexts/ToastContext';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Clock,
  DollarSign,
  BookOpen,
  HeadphonesIcon,
  Wrench,
  Award
} from 'lucide-react';

const ServicesModule = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: 'formation',
    description: '',
    price: '',
    duration: '',
    maxParticipants: '',
    image: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newServiceImage, setNewServiceImage] = useState(null);
  const [editServiceImage, setEditServiceImage] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [adminAvailable, setAdminAvailable] = useState(true);
  const { showSuccess, showError } = useToast();

  // Lire le cache de disponibilité admin pour éviter 404 répétés (StrictMode double rendu)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('adminServicesAvailable');
      if (cached === 'false') {
        setAdminAvailable(false);
      }
    } catch {}
    // ne pas mettre de dépendances; lecture au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCsv = () => {
    try {
      const rows = [
        ['ID','Nom','Catégorie','Prix','Durée','Participants max','Participants','Statut','Créée le']
      ];
      (filteredServices || []).forEach(s => {
        rows.push([
          s.id,
          s.name,
          s.category,
          String(s.price ?? ''),
          s.duration,
          String(s.maxParticipants ?? ''),
          String(s.participants ?? ''),
          s.status,
          s.createdAt || ''
        ]);
      });
      const csv = rows.map(r => r.map((cell)=>{
        const val = cell == null ? '' : String(cell);
        // Escape quotes and wrap with quotes if needed
        const escaped = '"' + val.replace(/"/g,'""') + '"';
        return escaped;
      }).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0,10);
      a.download = `services-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[ServicesModule] Export CSV échoué:', e);
      alert('Export CSV échoué');
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      // params sanitation
      const params = {};
      params.page = page;
      params.limit = limit;
      if (filterCategory && filterCategory !== 'all') params.category = filterCategory;
      if (searchTerm && searchTerm.trim().length > 0) params.search = searchTerm.trim();
      if (sort) params.sortBy = sort;
      if (order) params.sortOrder = order;

      // Si on sait que l'admin n'est pas dispo, éviter les 404 répétés
      if (!adminAvailable) {
        const resPub = await serviceService.getAll(params);
        const payload = resPub?.data;
        const list = payload?.data?.services ?? payload?.services ?? payload?.data ?? payload ?? [];
        const items = Array.isArray(list) ? list : [];
        const normalized = items.map(s => ({
          id: s._id || s.id,
          name: typeof s.name === 'string' ? s.name : (s.name?.value || s.name?.title || '—'),
          category: s.category || 'formation',
          description: s.description || '',
          price: Number(s.price) || 0,
          duration: s.duration || '—',
          maxParticipants: Number(s.maxParticipants) || 0,
          participants: Number(s.participants) || 0,
          status: typeof s.status === 'string' ? s.status : (s.published ? 'active' : 'inactive'),
          image: s.image || s.coverImage || '/images/placeholders/service.jpg',
          createdAt: s.createdAt || '',
        }));
        setServices(normalized);
        const m = payload?.meta || payload?.data?.meta;
        if (m) setMeta({ total: m.total ?? normalized.length, totalPages: m.totalPages ?? 1 });
        return; // ne pas continuer
      }

      // Essai admin si disponible
      try {
        const res = await adminService.services.getAll(params);
        const payload = res?.data;
        const list = payload?.data?.services ?? payload?.services ?? payload?.data ?? payload ?? [];
        const items = Array.isArray(list) ? list : [];
        const normalized = items.map(s => ({
          id: s._id || s.id,
          name: typeof s.name === 'string' ? s.name : (s.name?.value || s.name?.title || '—'),
          category: s.category || 'formation',
          description: s.description || '',
          price: Number(s.price) || 0,
          duration: s.duration || '—',
          maxParticipants: Number(s.maxParticipants) || 0,
          participants: Number(s.participants) || 0,
          status: typeof s.status === 'string' ? s.status : 'active',
          image: s.image || s.coverImage || '/images/placeholders/service.jpg',
          createdAt: s.createdAt || '',
        }));
        setServices(normalized);
        const m = payload?.meta || payload?.data?.meta;
        if (m) setMeta({ total: m.total ?? normalized.length, totalPages: m.totalPages ?? 1 });
        setAdminAvailable(true);
        try { localStorage.setItem('adminServicesAvailable', 'true'); } catch {}
      } catch (e) {
        if (e?.response?.status === 404) {
          // Basculer en mode public et ne plus retenter admin
          setAdminAvailable(false);
          try { localStorage.setItem('adminServicesAvailable', 'false'); } catch {}
          const resPub = await serviceService.getAll(params);
          const payload = resPub?.data;
          const list = payload?.data?.services ?? payload?.services ?? payload?.data ?? payload ?? [];
          const items = Array.isArray(list) ? list : [];
          const normalized = items.map(s => ({
            id: s._id || s.id,
            name: typeof s.name === 'string' ? s.name : (s.name?.value || s.name?.title || '—'),
            category: s.category || 'formation',
            description: s.description || '',
            price: Number(s.price) || 0,
            duration: s.duration || '—',
            maxParticipants: Number(s.maxParticipants) || 0,
            participants: Number(s.participants) || 0,
            status: typeof s.status === 'string' ? s.status : (s.published ? 'active' : 'inactive'),
            image: s.image || s.coverImage || '/images/placeholders/service.jpg',
            createdAt: s.createdAt || '',
          }));
          setServices(normalized);
          const m = payload?.meta || payload?.data?.meta;
          if (m) setMeta({ total: m.total ?? normalized.length, totalPages: m.totalPages ?? 1 });
        } else {
          console.error('[ServicesModule] Erreur chargement services:', e);
          setServices([]);
          setMeta({ total: 0, totalPages: 1 });
        }
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchServices();
  }, [filterCategory, searchTerm, page, limit, sort, order]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleStatus = async (svc) => {
    const next = svc.status === 'active' ? 'inactive' : 'active';
    try {
      await adminService.services.updateStatus(svc.id, next);
      await fetchServices();
      try { showSuccess('Statut mis à jour', `${svc.name}: ${next}`); } catch {}
    } catch (e) {
      console.error('[ServicesModule] Toggle statut échoué:', e);
      try { showError('Erreur', "Impossible de mettre à jour le statut"); } catch {}
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'formation': return BookOpen;
      case 'assistance': return HeadphonesIcon;
      case 'conseil': return Briefcase;
      case 'maintenance': return Wrench;
      default: return Award;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'formation': return 'bg-blue-100 text-blue-800';
      case 'assistance': return 'bg-green-100 text-green-800';
      case 'conseil': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des services...</span>
      </div>
    );
  }

  const isEmpty = !Array.isArray(services) || services.length === 0;

  return (
    <div className="space-y-6">
      {!adminAvailable && (
        <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-start justify-between gap-3">
          <div>
            Mode lecture seule: les endpoints d'administration des services ne sont pas disponibles. Les actions de création, édition, suppression et changement de statut sont désactivées.
          </div>
          <button
            onClick={async () => {
              // Effacer le cache et retenter l'admin immédiatement
              try { localStorage.removeItem('adminServicesAvailable'); } catch {}
              setAdminAvailable(true);
              await fetchServices();
            }}
            className="shrink-0 px-3 py-1.5 text-xs font-medium border border-yellow-400 text-yellow-800 rounded hover:bg-yellow-100"
          >
            Réessayer l'admin
          </button>
        </div>
      )}
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Services</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez les formations, assistance et conseils proposés</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={exportCsv}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouveau Service{!adminAvailable ? ' (projet industriel)' : ''}</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Services</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Formations</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {services.filter(s => s.category === 'formation').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Participants</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {services.reduce((sum, s) => sum + s.participants, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Revenus</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {(services.reduce((sum, s) => sum + (s.price * s.participants), 0)).toLocaleString()} GNF
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Toutes catégories</option>
              <option value="formation">Formations</option>
              <option value="assistance">Assistance</option>
              <option value="conseil">Conseil</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={sort}
              onChange={(e)=> { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="createdAt">Date de création</option>
              <option value="name">Nom</option>
              <option value="price">Prix</option>
            </select>
            <select
              value={order}
              onChange={(e)=> { setOrder(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <select
              value={limit}
              onChange={(e)=> { setLimit(parseInt(e.target.value)||10); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des services */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Services ({meta.total})</h3>
            <div className="text-sm text-gray-500">Page {page} / {meta.totalPages}</div>
          </div>
        </div>
        {isEmpty ? (
          <div className="p-8 text-center text-gray-600">Aucun service trouvé.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => {
                const CategoryIcon = getCategoryIcon(service.category);
                return (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <img 
                            src={service.image} 
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.duration} • Max {service.maxParticipants} pers.
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <CategoryIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {service.price.toLocaleString()} GNF
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {service.participants}/{service.maxParticipants}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(service.participants / (service.maxParticipants || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                        {service.status === 'active' ? 'Actif' : service.status === 'inactive' ? 'Inactif' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {adminAvailable && (
                          <button
                            onClick={() => toggleStatus(service)}
                            className={`px-2 py-1 rounded text-xs font-medium border ${service.status === 'active' ? 'text-red-600 border-red-600 hover:bg-red-50' : 'text-green-600 border-green-600 hover:bg-green-50'}`}
                          >
                            {service.status === 'active' ? 'Désactiver' : 'Activer'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            try { window.open('/services', '_blank'); } catch {}
                          }}
                          className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        {adminAvailable && (
                          <button
                            onClick={() => { setEditing(service); setShowEditModal(true); }}
                            className="text-green-600 hover:text-green-800">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {adminAvailable && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Supprimer le service "${service.name}" ?`)) return;
                              try {
                                await adminService.services.delete(service.id);
                                await fetchServices();
                                try { showSuccess('Supprimé', 'Service supprimé avec succès'); } catch {}
                              } catch (e) {
                                console.error('[ServicesModule] Suppression service échouée:', e);
                                try { showError('Erreur', 'Suppression impossible'); } catch {}
                              }
                            }}
                            className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">Total: {meta.total}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={()=> setPage(p => Math.max(1, p-1))}
                disabled={page<=1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Précédent</button>
              <button
                onClick={()=> setPage(p => Math.min(meta.totalPages||1, p+1))}
                disabled={page >= (meta.totalPages||1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Suivant</button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Modal Ajout Service */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nouveau Service</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (adminAvailable) {
                  const base = {
                    name: String(newService.name || '').trim(),
                    category: String(newService.category || 'formation'),
                    description: String(newService.description || '').trim(),
                    price: Number(newService.price) || 0,
                    duration: String(newService.duration || '').trim(),
                    maxParticipants: Number(newService.maxParticipants) || 0,
                    image: String(newService.image || '').trim(),
                    status: 'active',
                  };
                  if (newServiceImage instanceof File) {
                    const form = new FormData();
                    Object.entries(base).forEach(([k, v]) => {
                      if (v !== undefined && v !== null && v !== '') form.append(k, v);
                    });
                    form.append('image', newServiceImage);
                    await adminService.services.create(form);
                  } else {
                    await adminService.services.create(base);
                  }
                } else {
                  // Création via endpoint projets industriels
                  const name = String(newService.name || '').trim();
                  const category = String(newService.category || 'autre');
                  const description = String(newService.description || '').trim();
                  const basePrice = Number(newService.price) || 0;
                  const allowedCategories = [
                    'ferme_complete',
                    'equipement_pondeuses',
                    'equipement_chair',
                    'equipement_reproducteurs',
                    'abattoir_moderne',
                    'couvoir_industriel',
                    'usine_aliments',
                    'laboratoire',
                    'autre'
                  ];
                  // Validations côté front selon backend
                  if (name.length < 5) {
                    try { showError('Validation', 'Le nom doit contenir au moins 5 caractères'); } catch {}
                    return;
                  }
                  if (description.length < 50) {
                    try { showError('Validation', 'La description doit contenir au moins 50 caractères'); } catch {}
                    return;
                  }
                  if (!allowedCategories.includes(category)) {
                    try { showError('Validation', 'Catégorie invalide'); } catch {}
                    return;
                  }
                  if (!(basePrice > 0)) {
                    try { showError('Validation', 'Le prix de base doit être un nombre positif'); } catch {}
                    return;
                  }
                  const base = {
                    name,
                    category,
                    description,
                    pricing: { basePrice },
                  };
                  if (newServiceImage instanceof File) {
                    const form = new FormData();
                    Object.entries(base).forEach(([k, v]) => {
                      if (typeof v === 'object' && v !== null) {
                        // flatten pricing.basePrice
                        form.append('pricing.basePrice', String(v.basePrice ?? ''));
                      } else if (v !== undefined && v !== null && v !== '') {
                        form.append(k, v);
                      }
                    });
                    form.append('images', newServiceImage);
                    await serviceService.create(form);
                  } else {
                    await serviceService.create(base);
                  }
                }
                setShowAddModal(false);
                setNewService({ name:'', category:'formation', description:'', price:'', duration:'', maxParticipants:'', image:'' });
                setNewServiceImage(null);
                await fetchServices();
                try { showSuccess('Créé', 'Service créé avec succès'); } catch {}
              } catch (e) {
                console.error('[ServicesModule] Création service échouée:', e);
                try { showError('Erreur', 'Création impossible'); } catch {}
              }
            }}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" required value={newService.name} onChange={(e)=>setNewService({...newService, name:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  {adminAvailable ? (
                    <select value={newService.category} onChange={(e)=>setNewService({...newService, category:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="formation">Formation</option>
                      <option value="assistance">Assistance</option>
                      <option value="conseil">Conseil</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  ) : (
                    <select value={newService.category} onChange={(e)=>setNewService({...newService, category:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="ferme_complete">Ferme complète</option>
                      <option value="equipement_pondeuses">Équipement pondeuses</option>
                      <option value="equipement_chair">Équipement chair</option>
                      <option value="equipement_reproducteurs">Équipement reproducteurs</option>
                      <option value="abattoir_moderne">Abattoir moderne</option>
                      <option value="couvoir_industriel">Couvoir industriel</option>
                      <option value="usine_aliments">Usine d'aliments</option>
                      <option value="laboratoire">Laboratoire</option>
                      <option value="autre">Autre</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} required value={newService.description} onChange={(e)=>setNewService({...newService, description:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{adminAvailable ? 'Prix (GNF)' : 'Prix de base (GNF)'}</label>
                    <input type="number" min="0" value={newService.price} onChange={(e)=>setNewService({...newService, price:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  {adminAvailable && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                      <input type="text" value={newService.duration} onChange={(e)=>setNewService({...newService, duration:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                  )}
                </div>
                {adminAvailable ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Participants max</label>
                      <input type="number" min="0" value={newService.maxParticipants} onChange={(e)=>setNewService({...newService, maxParticipants:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                      <input type="text" value={newService.image} onChange={(e)=>setNewService({...newService, image:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                    <input type="text" value={newService.image} onChange={(e)=>setNewService({...newService, image:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ou téléverser une image</label>
                  <input type="file" accept="image/*" onChange={(e)=> setNewServiceImage(e.target.files?.[0] || null)} className="w-full" />
                  {newServiceImage && (
                    <p className="text-xs text-gray-500 mt-1">Fichier: {newServiceImage.name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button type="button" onClick={()=>setShowAddModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition Service */}
      {showEditModal && editing && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le Service</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const base = {
                  name: String(editing.name || '').trim(),
                  category: String(editing.category || 'formation'),
                  description: String(editing.description || '').trim(),
                  price: Number(editing.price) || 0,
                  duration: String(editing.duration || '').trim(),
                  maxParticipants: Number(editing.maxParticipants) || 0,
                  image: String(editing.image || '').trim(),
                  status: editing.status || 'active',
                };
                if (editServiceImage instanceof File) {
                  const form = new FormData();
                  Object.entries(base).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== '') form.append(k, v);
                  });
                  form.append('image', editServiceImage);
                  await adminService.services.update(editing.id, form);
                } else {
                  await adminService.services.update(editing.id, base);
                }
                setShowEditModal(false);
                setEditing(null);
                setEditServiceImage(null);
                await fetchServices();
                try { showSuccess('Enregistré', 'Service mis à jour'); } catch {}
              } catch (e) {
                console.error('[ServicesModule] Mise à jour service échouée:', e);
                try { showError('Erreur', 'Mise à jour impossible'); } catch {}
              }
            }}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" required value={editing.name} onChange={(e)=>setEditing({...editing, name:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select value={editing.category} onChange={(e)=>setEditing({...editing, category:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="formation">Formation</option>
                    <option value="assistance">Assistance</option>
                    <option value="conseil">Conseil</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} required value={editing.description} onChange={(e)=>setEditing({...editing, description:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (GNF)</label>
                    <input type="number" min="0" value={editing.price} onChange={(e)=>setEditing({...editing, price:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                    <input type="text" value={editing.duration} onChange={(e)=>setEditing({...editing, duration:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Participants max</label>
                    <input type="number" min="0" value={editing.maxParticipants} onChange={(e)=>setEditing({...editing, maxParticipants:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                    <input type="text" value={editing.image} onChange={(e)=>setEditing({...editing, image:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ou téléverser une nouvelle image</label>
                  <input type="file" accept="image/*" onChange={(e)=> setEditServiceImage(e.target.files?.[0] || null)} className="w-full" />
                  {editServiceImage && (
                    <p className="text-xs text-gray-500 mt-1">Fichier: {editServiceImage.name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button type="button" onClick={()=>setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesModule;

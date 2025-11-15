import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import adminService from '../../../../services/adminService';
import { useToast } from '../../../../contexts/ToastContext';

const CategoriesModule = () => {
  const { showError, showSuccess } = useToast?.() || {};

  // Query/filters
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [orderBy, setOrderBy] = useState('order');
  const [order, setOrder] = useState('asc');
  const [isActiveFilter, setIsActiveFilter] = useState('all');

  // Data state
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: 20 });
  const [error, setError] = useState(null);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null=create, object=edit

  const fetchCategories = async (targetPage = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getCategories({
        q: (q || '').trim(),
        page: targetPage,
        limit,
        sort: orderBy,
        order,
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter,
      });
      const list = res?.data?.data || [];
      const m = res?.data?.meta || { total: list.length, totalPages: 1, page: targetPage, limit };
      setCategories(list);
      setMeta(m);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur de chargement');
      setCategories([]);
      setMeta({ total: 0, totalPages: 1, page: 1, limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(1); }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchCategories(1), 300);
    return () => clearTimeout(id);
  }, [q, orderBy, order, isActiveFilter]);

  const openCreate = () => { setEditing({ name: '', description: '', isActive: true }); setShowModal(true); };
  const openEdit = (cat) => { setEditing({ ...cat }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const onDelete = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
    try {
      await adminService.deleteCategory(cat._id || cat.id);
      showSuccess && showSuccess('Supprimée', 'Catégorie supprimée');
      fetchCategories(meta.page);
    } catch (e) {
      showError && showError('Suppression impossible', e?.response?.data?.message || 'Erreur inconnue');
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        name: String(editing.name || '').trim(),
        description: editing.description || '',
        parent: editing.parent || null,
        isActive: !!editing.isActive,
        order: Number(editing.order) || 0,
      };
      if (!payload.name) {
        showError && showError('Validation', 'Le nom est requis');
        return;
      }
      if (editing._id || editing.id) {
        await adminService.updateCategory(editing._id || editing.id, payload);
        showSuccess && showSuccess('Modifiée', 'Catégorie mise à jour');
      } else {
        await adminService.createCategory(payload);
        showSuccess && showSuccess('Créée', 'Catégorie créée');
      }
      closeModal();
      fetchCategories(meta.page);
    } catch (e) {
      showError && showError('Enregistrement impossible', e?.response?.data?.message || 'Erreur inconnue');
    }
  };

  const localFiltered = useMemo(() => {
    const term = (q || '').trim().toLowerCase();
    if (!term) return categories;
    return (categories || []).filter(c =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term) ||
      (c.slug || '').toLowerCase().includes(term)
    );
  }, [q, categories]);

  return (
    <div>
      {/* Header responsive pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Catégories Produits</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez les catégories utilisées par le catalogue produits.</p>
        </div>
        <div className="w-full sm:w-auto flex items-center justify-center">
          <button onClick={openCreate} className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle Catégorie</span>
            <span className="sm:hidden">Nouvelle</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (nom, slug, description)"
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {q && (
              <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
            )}
          </div>
          <select value={isActiveFilter} onChange={(e)=>setIsActiveFilter(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">Tous statuts</option>
            <option value="true">Actives</option>
            <option value="false">Inactives</option>
          </select>
          <select value={orderBy} onChange={(e)=>setOrderBy(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg">
            <option value="name">Nom</option>
            <option value="createdAt">Création</option>
            <option value="order">Ordre</option>
          </select>
          <select value={order} onChange={(e)=>setOrder(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <button onClick={()=>fetchCategories(page)} className="w-full sm:w-auto inline-flex items-center px-3 py-2 border rounded-lg">
            <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-10 flex items-center justify-center text-gray-500">Chargement…</div>
      ) : error ? (
        <div className="py-10 text-center text-red-600">{error}</div>
      ) : localFiltered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-600">Aucune catégorie</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localFiltered.map(cat => (
                <tr key={cat._id || cat.id}>
                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">{cat.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{cat.slug || '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{typeof cat.order === 'number' ? cat.order : (cat.order || 0)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{cat.description || '—'}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    {cat.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    <button onClick={()=>openEdit(cat)} className="inline-flex items-center px-2 py-1 border rounded hover:bg-gray-50">
                      <Edit2 className="w-4 h-4 mr-1" /> Modifier
                    </button>
                    <button onClick={()=>onDelete(cat)} className="inline-flex items-center px-2 py-1 border rounded text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination simple */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div>Total: {meta.total}</div>
        <div className="space-x-2">
          <button disabled={meta.page <= 1} onClick={()=>{ const p = meta.page - 1; setPage(p); fetchCategories(p); }} className={`px-3 py-1 rounded border ${meta.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>Précédent</button>
          <span>Page {meta.page} / {meta.totalPages}</span>
          <button disabled={meta.page >= meta.totalPages} onClick={()=>{ const p = meta.page + 1; setPage(p); fetchCategories(p); }} className={`px-3 py-1 rounded border ${meta.page >= meta.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>Suivant</button>
        </div>
      </div>

      {/* Modal create/edit */}
      {showModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editing && (editing._id || editing.id) ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={onSave}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input value={editing?.name || ''} onChange={(e)=>setEditing(prev=>({ ...prev, name: e.target.value }))} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={editing?.description || ''} onChange={(e)=>setEditing(prev=>({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                  <input type="number" value={typeof editing?.order === 'number' ? editing.order : (editing?.order || 0)} onChange={(e)=>setEditing(prev=>({ ...prev, order: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={editing?.isActive ? 'true' : 'false'} onChange={(e)=>setEditing(prev=>({ ...prev, isActive: e.target.value === 'true' }))} className="w-full px-3 py-2 border rounded">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesModule;

import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Tag, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { collectionService } from '../../../../services/api';
import AdminBreadcrumb from '../../layout/AdminBreadcrumb';

const CollectionsModule = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', tags: '', isActive: true });
  const [error, setError] = useState('');

  const { data, isLoading, isFetching } = useQuery(
    ['collections', { search, page, limit }],
    async () => {
      const resp = await collectionService.getAll({ search, page, limit });
      const base = resp?.data ?? {};
      return { items: base.data || [], meta: base.meta || { total: 0, page: 1, limit } };
    },
    { keepPreviousData: true }
  );

  const items = data?.items || [];
  const meta = data?.meta || { total: 0, page: 1, limit };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', tags: '', isActive: true });
    setError('');
  };

  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      slug: row.slug || '',
      description: row.description || '',
      tags: Array.isArray(row.tags) ? row.tags.join(', ') : (row.tags || ''),
      isActive: !!row.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); resetForm(); };

  const createMutation = useMutation(
    async (payload) => {
      return collectionService.create(payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('collections');
        closeForm();
      },
      onError: (e) => {
        const msg = e?.response?.data?.message || e?.message || 'Erreur lors de la création';
        setError(msg);
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, payload }) => {
      return collectionService.update(id, payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('collections');
        closeForm();
      },
      onError: (e) => {
        const msg = e?.response?.data?.message || e?.message || 'Erreur lors de la mise à jour';
        setError(msg);
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      return collectionService.delete(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('collections');
      },
    }
  );

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim(),
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      isActive: !!form.isActive,
    };

    if (!payload.name || !payload.slug) {
      setError('Nom et slug sont requis');
      return;
    }

    if (editing?._id) {
      updateMutation.mutate({ id: editing._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const headerRight = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => queryClient.invalidateQueries('collections')}
        className="w-full sm:w-auto px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 flex items-center"
        title="Actualiser"
      >
        <RefreshCw className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Actualiser</span>
      </button>
      <button
        onClick={openCreate}
        className="w-full sm:w-auto px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        title="Nouvelle collection"
      >
        <Plus className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Nouvelle</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Collections produits</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez les collections (groupes) pour organiser vos produits</p>
        </div>
        {headerRight}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Rechercher par nom, slug ou description..."
            className="w-full sm:flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">{meta.total} collection(s)</div>
          {isFetching && (
            <div className="flex items-center text-gray-500 text-sm"><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Mise à jour...</div>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-600">Chargement des collections...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-600">Aucune collection trouvée</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((row) => (
              <div key={row._id} className="p-3 sm:p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{row.isActive ? 'Actif' : 'Inactif'}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">/{row.slug}</p>
                  {row.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{row.description}</p>
                  )}
                  {Array.isArray(row.tags) && row.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {row.tags.map((t, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(row)}
                    className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer cette collection ?')) {
                        deleteMutation.mutate(row._id);
                      }
                    }}
                    className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 flex items-center"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination simple */}
        {meta.total > meta.limit && (
          <div className="p-3 sm:p-4 flex items-center justify-between text-sm text-gray-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
              disabled={page <= 1}
            >
              Précédent
            </button>
            <div>Page {meta.page} / {Math.ceil(meta.total / meta.limit)}</div>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
              disabled={meta.page >= Math.ceil(meta.total / meta.limit)}
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg border border-gray-200">
            <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{editing ? 'Modifier la collection' : 'Nouvelle collection'}</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={closeForm}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="p-3 sm:p-4 space-y-3">
              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: promotions-ete"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[90px]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: promo, best, saison"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={closeForm} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">Annuler</button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsModule;

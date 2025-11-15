import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/api';
import { Mail, User, Calendar, Hash, RefreshCw, AlertTriangle, MapPin, Reply, CheckCircle, Download } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

const FarmContactsInbox = () => {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmFilter, setFarmFilter] = useState('all');
  const [period, setPeriod] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState(null); // 'mongo' | 'json'

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getFarmContacts();
        const data = res.data?.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Impossible de charger les messages de contact des fermes.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
    // Fetch integrity source indicator
    (async () => {
      try {
        const base = (import.meta?.env?.VITE_API_URL || 'http://localhost:5002/api/v1').replace(/\/$/, '');
        const res = await fetch(base + '/admin/integrity/summary', { credentials: 'include' });
        const data = await res.json().catch(() => null);
        const src = data?.sources?.farmContacts || null;
        if (src) setSource(src);
      } catch {}
    })();
  }, []);

  // Distinct farms for filter
  const farmOptions = useMemo(() => {
    const names = Array.from(new Set(items.map(i => i.farmName)));
    return ['all', ...names];
  }, [items]);

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const withinPeriod = (ts) => {
      if (period === 'all') return true;
      const d = new Date(ts).getTime();
      if (isNaN(d)) return false;
      switch (period) {
        case 'today':
          const start = new Date(); start.setHours(0,0,0,0);
          return d >= start.getTime();
        case '7d':
          return now - d <= 7 * 24 * 3600 * 1000;
        case '30d':
          return now - d <= 30 * 24 * 3600 * 1000;
        default: return true;
      }
    };
    const q = query.trim().toLowerCase();
    const matchQuery = (it) => {
      if (!q) return true;
      const fields = [
        it.name,
        it.email,
        it.message,
        it.farmName,
        it.ticketId && `#${it.ticketId}`
      ].map(v => (v ?? '').toString().toLowerCase());
      return fields.some(f => f.includes(q));
    };

    return items.filter(it => 
      (farmFilter === 'all' || it.farmName === farmFilter) && 
      withinPeriod(it.receivedAt) &&
      (statusFilter === 'all' || it.status === statusFilter) &&
      matchQuery(it)
    );
  }, [items, farmFilter, period, statusFilter, query]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages des fermes</h1>
            {source && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${source === 'mongo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                {source === 'mongo' ? 'MongoDB' : 'JSON'}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tous les messages envoyés depuis les pages de fermes</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Recherche</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, email, message, ferme, #ticket"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ferme</label>
          <select
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {farmOptions.map(name => (
              <option key={name} value={name}>{name === 'all' ? 'Toutes' : name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Période</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Toutes</option>
            <option value="today">Aujourd'hui</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Tous</option>
            <option value="new">Nouveaux</option>
            <option value="processed">Traités</option>
          </select>
        </div>
        <div className="flex items-end">
          <div className="text-sm text-gray-600">{filteredItems.length} message{filteredItems.length > 1 ? 's' : ''}</div>
        </div>
        <div className="flex items-end justify-end">
          <button
            onClick={async () => {
              try {
                const res = await adminService.exportFarmContacts();
                const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'farm-contacts.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                showSuccess('Export réussi', 'Le fichier CSV a été téléchargé.');
              } catch (e) {
                showError('Export impossible', 'Une erreur est survenue lors de l\'export CSV.');
              }
            }}
            className="inline-flex items-center px-3 py-2 border rounded hover:bg-gray-50 text-sm"
          >
            <Download className="w-4 h-4 mr-1"/> Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 text-gray-600">
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Chargement...
        </div>
      )}

      {error && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" /> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Hash className="inline w-3 h-3 mr-1"/>Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Calendar className="inline w-3 h-3 mr-1"/>Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><MapPin className="inline w-3 h-3 mr-1"/>Ferme</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><User className="inline w-3 h-3 mr-1"/>Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Mail className="inline w-3 h-3 mr-1"/>Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 text-sm">Aucun message pour le moment.</td>
                  </tr>
                ) : (
                  filteredItems.map((it) => (
                    <tr key={`${it.ticketId}-${it.receivedAt}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">#{it.ticketId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(it.receivedAt).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{it.farmName} (ID {it.farmId})</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{it.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{it.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={it.message}>{it.message}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${it.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {it.status === 'processed' ? 'Traité' : 'Nouveau'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          to="/admin/chat"
                          state={{ ticket: { id: it.ticketId, farmId: it.farmId, farmName: it.farmName }, from: 'farm-contacts' }}
                          className="inline-flex items-center px-3 py-1.5 text-sm border rounded hover:bg-gray-50 mr-2"
                        >
                          <Reply className="w-4 h-4 mr-1"/> Répondre
                        </Link>
                        {it.status !== 'processed' && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await adminService.updateFarmContactStatus(it.ticketId, 'processed');
                                setItems(prev => prev.map(x => x.ticketId === it.ticketId ? res.data.data : x));
                                showSuccess('Statut mis à jour', `Le ticket #${it.ticketId} est marqué comme traité.`);
                              } catch (e) {
                                showError('Mise à jour impossible', 'Veuillez réessayer.');
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm border rounded hover:bg-gray-50 text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1"/> Marquer traité
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmContactsInbox;

import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../../../../services/api';
import { useToast } from '../../../../contexts/ToastContext';
import { Search, Download, RefreshCw, Filter, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

const QuotesModule = () => {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtres
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all'); // new | in_review | quoted | rejected | closed | all
  const [projectType, setProjectType] = useState(''); // backend expects 'type' param matching category
  const [sortOrder, setSortOrder] = useState('desc'); // asc | desc
  const [period, setPeriod] = useState('all'); // all | 7d | 30d | 90d | 1y
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });
  const [viewItem, setViewItem] = useState(null);
  const [source, setSource] = useState(null); // 'mongo' | 'json'
  const [assigneeInput, setAssigneeInput] = useState('');
  const [noteText, setNoteText] = useState('');

  const typeOptions = [
    { value:'', label:'Tous types' },
    { value:'couvoir', label:'Couvoir' },
    { value:'abattoir', label:'Abattoir' },
    { value:'reproducteurs', label:'Reproducteurs' },
    { value:'aliments', label:"Fabrication d'aliments" },
    { value:'pondeuses', label:'Pondeuses' },
    { value:'chair', label:'Poulets de chair' },
    { value:'autre', label:'Autre' },
  ];

  const buildWhatsAppLink = (item) => {
    const raw = String(item.phone || '').replace(/[^0-9+]/g, '');
    const number = raw.startsWith('+') ? raw.slice(1) : raw;
    if (!number) return '#';
    const text = `Bonjour ${item.fullName || ''},\n\nMerci pour votre demande concernant: ${item.category}.\nNous revenons vers vous avec une proposition personnalisée.\n\nDétails reçus:\n- Type: ${item.category}\n- Budget: ${item.budget || '-'}\n- Téléphone: ${item.phone || '-'}\n- Créé le: ${new Date(item.createdAt).toLocaleString()}\n\nMessage:\n${item.message}\n\nCordialement,\nSupport GuinéeAvicole`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  useEffect(() => {
    // Fetch source indicator (Mongo/JSON)
    (async () => {
      try {
        const res = await adminService.getIntegritySummary();
        setSource(res.data?.sources?.quotes || null);
      } catch {}
    })();
  }, []);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(String(text || ''));
      showSuccess('Copié', `${label} copié dans le presse-papiers.`);
    } catch (e) {
      showError('Impossible de copier', `Veuillez copier manuellement ${label.toLowerCase()}.`);
    }
  };

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getQuotes({ q: query, status, page, limit, type: projectType, sort: 'createdAt', order: sortOrder, period });
      const data = res.data || res; // compat
      setItems(Array.isArray(data.data) ? data.data : []);
      setMeta(data.meta || { total: (Array.isArray(data.data) ? data.data.length : 0), totalPages: 1, page, limit });
    } catch (e) {
      setError('Impossible de charger les devis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotes(); /* eslint-disable-next-line */ }, [page, limit]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuotes();
  };

  const statusBadge = (s) => {
    const map = {
      new: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-indigo-100 text-indigo-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-0.5 rounded text-xs ${map[s] || 'bg-gray-100 text-gray-800'}`}>{s}</span>;
  };

  const changeStatus = async (id, next) => {
    try {
      const res = await adminService.updateQuoteStatus(id, next);
      const updated = res.data?.data || null;
      setItems((prev) => prev.map((q) => (q.id === id ? (updated || { ...q, status: next }) : q)));
      showSuccess('Statut mis à jour', `Devis #${id} → ${next}`);
    } catch (e) {
      showError('Échec', "Impossible de mettre à jour le statut");
    }
  };

  const exportCsv = async () => {
    try {
      const res = await adminService.exportQuotes({ q: query, status, type: projectType, period, sort: 'createdAt', order: sortOrder });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Export réussi', 'Le fichier CSV a été téléchargé.');
    } catch (e) {
      showError('Export impossible', 'Veuillez réessayer.');
    }
  };

  const totalPages = meta?.totalPages || 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Devis</h2>
            {source && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${source === 'mongo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                {source === 'mongo' ? 'MongoDB' : 'JSON'}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600">Liste des demandes de devis</p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto">
          <button onClick={exportCsv} className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50">
            <Download className="w-4 h-4 mr-1"/> <span className="hidden sm:inline">Exporter CSV</span><span className="sm:hidden">Export</span>
          </button>
          <button onClick={fetchQuotes} className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-1"/> Rafraîchir
          </button>
        </div>
      </div>

      {/* Filtres */}
      <form onSubmit={onSearch} className="bg-white p-3 rounded-lg border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="flex items-center border rounded px-2">
            <Search className="w-4 h-4 text-gray-400 mr-1"/>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Recherche (nom, email, type, #id)" className="w-full py-1.5 outline-none text-sm"/>
          </div>
          <div className="flex items-center border rounded px-2">
            <Filter className="w-4 h-4 text-gray-400 mr-1"/>
            <select value={status} onChange={(e)=>{setStatus(e.target.value); setPage(1);}} className="w-full py-1.5 text-sm outline-none bg-white">
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveau</option>
              <option value="in_review">En cours</option>
              <option value="quoted">Chiffré</option>
              <option value="rejected">Rejeté</option>
              <option value="closed">Clôturé</option>
            </select>
          </div>
          <div className="flex items-center border rounded px-2">
            <Filter className="w-4 h-4 text-gray-400 mr-1"/>
            <select value={projectType} onChange={(e)=>{setProjectType(e.target.value); setPage(1);}} className="w-full py-1.5 text-sm outline-none bg-white">
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center border rounded px-2">
            <Filter className="w-4 h-4 text-gray-400 mr-1"/>
            <select value={period} onChange={(e)=>{setPeriod(e.target.value); setPage(1);}} className="w-full py-1.5 text-sm outline-none bg-white">
              <option value="all">Toutes périodes</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">12 derniers mois</option>
            </select>
          </div>
          <div className="flex items-center border rounded px-2">
            <Filter className="w-4 h-4 text-gray-400 mr-1"/>
            <select value={sortOrder} onChange={(e)=>{setSortOrder(e.target.value); setPage(1);}} className="w-full py-1.5 text-sm outline-none bg-white">
              <option value="desc">Plus récents</option>
              <option value="asc">Plus anciens</option>
            </select>
          </div>
          <div className="flex items-center border rounded px-2">
            <Filter className="w-4 h-4 text-gray-400 mr-1"/>
            <select value={limit} onChange={(e)=>{setLimit(parseInt(e.target.value,10)); setPage(1);}} className="w-full py-1.5 text-sm outline-none bg-white">
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded text-sm">Rechercher</button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Nom</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 hidden md:table-cell">Email</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Catégorie</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 hidden lg:table-cell">Budget</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 hidden lg:table-cell">Créé</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 hidden lg:table-cell">Assigné</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Statut</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-gray-500">Chargement...</td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-gray-500">Aucun devis trouvé</td>
                </tr>
              )}
              {!loading && items.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="px-3 py-2">#{q.id}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900 truncate max-w-[180px]">{q.fullName}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[220px] md:hidden">{q.email}</div>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">{q.email}</td>
                  <td className="px-3 py-2">{q.category}</td>
                  <td className="px-3 py-2 hidden lg:table-cell">{q.budget || '-'}</td>
                  <td className="px-3 py-2 hidden lg:table-cell">{new Date(q.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 hidden lg:table-cell">{q.assignedTo || '-'}</td>
                  <td className="px-3 py-2">{statusBadge(q.status)}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button onClick={()=>setViewItem(q)} className="inline-flex items-center px-2 py-1 border rounded text-sm hover:bg-gray-50">
                      <Eye className="w-4 h-4 mr-1"/> Voir
                    </button>
                    {q.status !== 'in_review' && (
                      <button onClick={()=>changeStatus(q.id, 'in_review')} className="inline-flex items-center px-2 py-1 border rounded text-sm hover:bg-gray-50">
                        <Clock className="w-4 h-4 mr-1"/> En cours
                      </button>
                    )}
                    {q.status !== 'closed' && (
                      <button onClick={()=>changeStatus(q.id, 'closed')} className="inline-flex items-center px-2 py-1 border rounded text-sm text-green-700 hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 mr-1"/> Clôturer
                      </button>
                    )}
                    {q.status !== 'new' && (
                      <button onClick={()=>changeStatus(q.id, 'new')} className="inline-flex items-center px-2 py-1 border rounded text-sm text-blue-700 hover:bg-gray-50">
                        <XCircle className="w-4 h-4 mr-1"/> Revenir nouveau
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50 text-sm">
          <div className="text-gray-600">Page {meta.page} / {totalPages} • {meta.total} éléments</div>
          <div className="space-x-2">
            <button disabled={page <= 1} onClick={()=>setPage((p)=>Math.max(1, p-1))} className="px-2 py-1 border rounded disabled:opacity-50">Précédent</button>
            <button disabled={page >= totalPages} onClick={()=>setPage((p)=>Math.min(totalPages, p+1))} className="px-2 py-1 border rounded disabled:opacity-50">Suivant</button>
          </div>
        </div>
      </div>
      {/* Modal de détail */}
      {viewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Devis #{viewItem.id}</h3>
              <button onClick={()=>setViewItem(null)} className="text-gray-500 hover:text-gray-700 text-sm">Fermer</button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div><span className="text-gray-500">Nom:</span> <span className="font-medium text-gray-900">{viewItem.fullName}</span></div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{viewItem.email}</span></div>
                <button onClick={()=>copyToClipboard(viewItem.email, 'Email')} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Copier</button>
              </div>
              {viewItem.phone && (
                <div className="flex items-center justify-between gap-3">
                  <div><span className="text-gray-500">Téléphone:</span> <span className="font-medium text-gray-900">{viewItem.phone}</span></div>
                  <button onClick={()=>copyToClipboard(viewItem.phone, 'Téléphone')} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Copier</button>
                </div>
              )}
              <div><span className="text-gray-500">Catégorie:</span> <span className="font-medium text-gray-900">{viewItem.category}</span></div>
              {viewItem.budget && (<div><span className="text-gray-500">Budget:</span> <span className="font-medium text-gray-900">{viewItem.budget}</span></div>)}
              <div><span className="text-gray-500">Créé:</span> <span className="font-medium text-gray-900">{new Date(viewItem.createdAt).toLocaleString()}</span></div>
              <div className="pt-2"><span className="text-gray-500">Détails:</span>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-800 whitespace-pre-wrap">{viewItem.message}</div>
              </div>
              <div className="pt-3 border-t mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-900">Assigner à</div>
                  <div className="text-xs text-gray-600">Assigné: <span className="font-medium text-gray-900">{viewItem.assignedTo || '-'}</span></div>
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={assigneeInput} onChange={(e)=>setAssigneeInput(e.target.value)} placeholder="Nom de l'agent (ex: Amadou)" className="flex-1 border rounded px-2 py-1.5 text-sm"/>
                  <button
                    onClick={async ()=>{
                      try {
                        const res = await adminService.assignQuote(viewItem.id, assigneeInput.trim());
                        const updated = res.data?.data || null;
                        if (updated) {
                          setViewItem(updated);
                          setItems(prev => prev.map(x => x.id === updated.id ? updated : x));
                        }
                        showSuccess('Assignation réussie', `Devis #${viewItem.id} → ${assigneeInput || 'Non assigné'}`);
                        setAssigneeInput('');
                      } catch (e) {
                        showError('Échec assignation', 'Veuillez réessayer.');
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"
                  >Assigner</button>
                </div>
              </div>
              <div className="pt-3 border-t mt-2">
                <div className="text-sm font-semibold text-gray-900 mb-2">Notes internes</div>
                <div className="max-h-40 overflow-auto space-y-2">
                  {(viewItem.notes || []).length === 0 && (
                    <div className="text-xs text-gray-500">Aucune note</div>
                  )}
                  {(viewItem.notes || []).map((n)=> (
                    <div key={n.id} className="text-xs p-2 bg-gray-50 border rounded">
                      <div className="text-gray-800 whitespace-pre-wrap">{n.text}</div>
                      <div className="text-[11px] text-gray-500 mt-1">par {n.author || 'admin'} • {new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <textarea value={noteText} onChange={(e)=>setNoteText(e.target.value)} rows={2} placeholder="Ajouter une note interne" className="flex-1 border rounded px-2 py-1.5 text-sm"></textarea>
                  <button
                    onClick={async ()=>{
                      if (!noteText.trim()) { showError('Note vide', 'Veuillez saisir du texte.'); return; }
                      try {
                        const res = await adminService.addQuoteNote(viewItem.id, { text: noteText.trim(), author: 'admin' });
                        const updatedQuote = res.data?.quote || null;
                        if (updatedQuote) {
                          setViewItem(updatedQuote);
                          setItems(prev => prev.map(x => x.id === updatedQuote.id ? updatedQuote : x));
                        }
                        showSuccess('Note ajoutée', 'Votre note a été enregistrée.');
                        setNoteText('');
                      } catch (e) {
                        showError('Échec de l\'ajout', 'Veuillez réessayer.');
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"
                  >Ajouter</button>
                </div>
              </div>
            </div>
            <div className="border-t p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <a
                href={`mailto:${viewItem.email}?subject=${encodeURIComponent('Réponse à votre demande de devis #' + viewItem.id)}&body=${encodeURIComponent(`Bonjour ${viewItem.fullName || ''},\n\nMerci pour votre demande concernant: ${viewItem.category}.\nNous revenons vers vous avec une proposition personnalisée.\n\nDétails reçus:\n- Catégorie: ${viewItem.category}\n- Budget: ${viewItem.budget || '-'}\n- Téléphone: ${viewItem.phone || '-'}\n- Créé le: ${new Date(viewItem.createdAt).toLocaleString()}\n\nMessage:\n${viewItem.message}\n\nCordialement,\nSupport GuinéeAvicole`)}`}
                className="inline-flex items-center px-3 py-1.5 text-sm border rounded hover:bg-gray-50 text-blue-700"
              >
                Répondre par email
              </a>
              {viewItem.phone && (
                <a
                  href={buildWhatsAppLink({
                    phone: viewItem.phone,
                    name: viewItem.fullName,
                    projectType: viewItem.category,
                    budget: viewItem.budget,
                    createdAt: viewItem.createdAt,
                    details: viewItem.message,
                  })}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-sm border rounded hover:bg-gray-50 text-green-700"
                >
                  Répondre par WhatsApp
                </a>
              )}
              <div className="flex justify-end gap-2">
                {viewItem.status !== 'in_review' && (
                  <button onClick={()=>{changeStatus(viewItem.id, 'in_review');}} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"><Clock className="inline w-4 h-4 mr-1"/> En cours</button>
                )}
                {viewItem.status !== 'closed' && (
                  <button onClick={()=>{changeStatus(viewItem.id, 'closed');}} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 text-green-700"><CheckCircle className="inline w-4 h-4 mr-1"/> Clôturer</button>
                )}
                <button onClick={()=>setViewItem(null)} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesModule;

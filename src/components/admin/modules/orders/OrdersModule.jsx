import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import { adminService } from '../../../../../services/api';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { useToast } from '../../../../contexts/ToastContext';

// Hook personnalisé pour les opérations CRUD
const useCrud = (service) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 20 });

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await service.getAll(params);
      const list = response?.data?.data || response?.data?.orders || response?.data || [];
      const m = response?.data?.meta || { total: list.length, page: 1, totalPages: 1, limit: 20 };
      setData(Array.isArray(list) ? list : []);
      setMeta(m);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const create = useCallback(async (itemData) => {
    try {
      const response = await service.create(itemData);
      const newItem = response?.data?.data || response?.data;
      if (newItem) setData(prev => [ ...(Array.isArray(prev) ? prev : []), newItem ]);
      return newItem;
    } catch (err) {
      setError('Erreur lors de la création');
      throw err;
    }
  }, [service]);

  const update = useCallback(async (id, itemData) => {
    try {
      const response = await service.update(id, itemData);
      const updatedItem = response.data;
      setData(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      throw err;
    }
  }, [service]);

  const remove = useCallback(async (id) => {
    try {
      await service.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
  }, [service]);

  return { data, loading, error, fetchAll, create, update, remove };
};

const OrdersModule = () => {
  const { showSuccess, showError } = useToast?.() || { showSuccess: ()=>{}, showError: ()=>{} };
  const { data: orders, loading, error, fetchAll, create, update, remove } = useCrud(adminService.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 20 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [viewItems, setViewItems] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    items: '',
    total: '',
    location: '',
    notes: '',
    tax: '',
    shippingCost: '',
    paymentMethod: 'cod',
    paymentStatus: 'pending'
  });
  // Produits et lignes d'articles (pour construction détaillée)
  const [products, setProducts] = useState([]);
  const [itemLines, setItemLines] = useState([]); // [{ product, quantity, unitPrice }]
  // Utilisateurs (sélecteur client)
  const [users, setUsers] = useState([]); // [{ id, name, email }]
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  // États spécifiques à l'édition
  const [editItemLines, setEditItemLines] = useState([]);
  const [selectedEditCustomerId, setSelectedEditCustomerId] = useState('');
  const addEditItemLine = () => setEditItemLines(prev => [...prev, { product: '', quantity: 1, unitPrice: 0 }]);
  const removeEditItemLine = (idx) => setEditItemLines(prev => prev.filter((_, i) => i !== idx));
  const updateEditItemLine = (idx, patch) => setEditItemLines(prev => prev.map((ln, i) => i === idx ? { ...ln, ...patch } : ln));
  const editItemsSubtotal = (Array.isArray(editItemLines) ? editItemLines : []).reduce((sum, ln) => {
    const q = Math.max(Number(ln.quantity) || 0, 0);
    const up = Number(ln.unitPrice);
    const unit = !isNaN(up) && up >= 0 ? up : Number(getProductById(ln.product)?.price || 0);
    return sum + (unit * q);
  }, 0);

  const addItemLine = () => setItemLines(prev => [...prev, { product: '', quantity: 1, unitPrice: 0 }]);
  const removeItemLine = (idx) => setItemLines(prev => prev.filter((_, i) => i !== idx));
  const updateItemLine = (idx, patch) => setItemLines(prev => prev.map((ln, i) => i === idx ? { ...ln, ...patch } : ln));
  const getProductById = (id) => (Array.isArray(products) ? products.find(p => (p.id || p._id) === id) : null);
  const itemsSubtotal = (Array.isArray(itemLines) ? itemLines : []).reduce((sum, ln) => {
    const q = Math.max(Number(ln.quantity) || 0, 0);
    const up = Number(ln.unitPrice);
    const unit = !isNaN(up) && up >= 0 ? up : Number(getProductById(ln.product)?.basePrice || getProductById(ln.product)?.price || 0);
    return sum + (unit * q);
  }, 0);
  const addFormTax = Number(newOrder.tax || 0) || 0;
  const addFormShipping = Number(newOrder.shippingCost || 0) || 0;
  const addFormGrandTotal = (itemLines.length > 0 ? itemsSubtotal : (Number(newOrder.total || 0) || 0)) + addFormTax + addFormShipping;

  // Pré-chargement de la commande pour édition
  const onEdit = async (order) => {
    try {
      setEditing({ ...order });
      setShowEditModal(true);
      const resp = await adminService.orders.get(order.id);
      const raw = resp?.data?.data?.order || resp?.data?.order || resp?.data;
      const items = Array.isArray(raw?.items) ? raw.items : [];
      const prefilled = items.map(it => ({ product: (it?.product?._id || it?.product || ''), quantity: Number(it?.quantity) || 1, unitPrice: Number(it?.unitPrice) || 0 }));
      setEditItemLines(prefilled);
      const cid = (typeof raw?.customer === 'object') ? (raw.customer._id || '') : (raw?.customer || '');
      setSelectedEditCustomerId(cid);
      // Propager les champs paiement/frais si présents
      setEditing(prev => ({
        ...prev,
        tax: Number(raw?.tax || 0) || 0,
        shippingCost: Number(raw?.shippingCost || 0) || 0,
        paymentMethod: raw?.paymentMethod || 'cod',
        paymentStatus: raw?.paymentStatus || 'pending'
      }));
    } catch (e) {
      console.warn('Impossible de charger la commande pour édition:', e);
      setEditItemLines([]);
      setSelectedEditCustomerId('');
    }
  };

  // Afficher une commande en lecture seule
  const onView = async (order) => {
    try {
      console.debug('Viewing order clicked:', order?.id);
      setShowViewModal(true);
      setViewing({ ...order });
      showSuccess && showSuccess('Commande', `Ouverture des détails #${order?.id || ''}`);
      const resp = await adminService.orders.get(order.id);
      const raw = resp?.data?.data?.order || resp?.data?.order || resp?.data;
      const items = Array.isArray(raw?.items) ? raw.items : [];
      const normalized = items.map(it => ({
        name: it?.product?.name || it?.name || '—',
        quantity: Number(it?.quantity) || 0,
        unitPrice: Number(it?.unitPrice) || 0,
        totalPrice: Number(it?.totalPrice) || (Number(it?.unitPrice) || 0) * (Number(it?.quantity) || 0)
      }));
      setViewItems(normalized);
      // enrichir entête
      setViewing(prev => ({
        ...(prev || {}),
        tax: Number(raw?.tax || 0) || 0,
        shippingCost: Number(raw?.shippingCost || 0) || 0,
        paymentMethod: raw?.paymentMethod || 'cod',
        paymentStatus: raw?.paymentStatus || 'pending',
        date: (raw?.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : (prev?.date || ''))
      }));
    } catch (e) {
      console.warn('Impossible de charger la commande', e);
      // Afficher au moins le modal avec les infos disponibles
      setShowViewModal(true);
    }
  };

  // Impression / Export PDF robuste via iframe (évite le blocage des popups)
  const printViewing = () => {
    if (!viewing) return;
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111827; padding: 16px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        .row { display:flex; justify-content:space-between; margin: 6px 0; }
        table { width:100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border-bottom:1px solid #e5e7eb; padding:6px; font-size: 12px; text-align:right; }
        th:first-child, td:first-child { text-align:left; }
        .totals { margin-top: 10px; }
        .totals .row span:first-child { color:#6b7280; }
        .totals .row span:last-child { font-weight:600; }
      </style>`;
    const itemsRows = (Array.isArray(viewItems) ? viewItems : []).map(it => `
      <tr>
        <td>${(it.name || '').toString()}</td>
        <td>${Number(it.quantity || 0)}</td>
        <td>${Number(it.unitPrice || 0).toLocaleString()} GNF</td>
        <td>${Number(it.totalPrice || 0).toLocaleString()} GNF</td>
      </tr>
    `).join('');
    const html = `
      <html><head><meta charset="utf-8">${styles}</head><body>
        <h1>Commande #${viewing.id}</h1>
        <div class="row"><span>Client:</span><span>${(viewing.customer || '').toString()}</span></div>
        ${viewing.email ? `<div class="row"><span>Email:</span><span>${viewing.email}</span></div>` : ''}
        <div class="row"><span>Statut:</span><span>${(viewing.status || '').toString()}</span></div>
        <div class="row"><span>Statut paiement:</span><span>${(viewing.paymentStatus || '').toString()}</span></div>
        <div class="row"><span>Méthode paiement:</span><span>${(viewing.paymentMethod || 'cod').toString()}</span></div>
        <div class="row"><span>Date:</span><span>${(viewing.date || '').toString()}</span></div>
        <div class="row"><span>Localisation:</span><span>${(viewing.location || '—').toString()}</span></div>
        <table>
          <thead><tr><th>Produit</th><th>Qté</th><th>PU</th><th>Total</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <div class="totals">
          <div class="row"><span>Taxe</span><span>${Number(viewing?.tax||0).toLocaleString()} GNF</span></div>
          <div class="row"><span>Frais de livraison</span><span>${Number(viewing?.shippingCost||0).toLocaleString()} GNF</span></div>
          <div class="row"><span>Total à payer</span><span>${Number(viewing?.total||0).toLocaleString()} GNF</span></div>
        </div>
        ${viewing?.notes ? `<div style="margin-top:10px"><div style="color:#6b7280;">Notes</div><div>${(viewing.notes||'').toString()}</div></div>` : ''}
      </body></html>`;
    // Créer un iframe caché
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow || iframe.contentDocument;
    const iDoc = doc.document || doc;
    iDoc.open();
    iDoc.write(html);
    iDoc.close();
    // Imprimer après un court délai pour laisser le rendu se faire
    setTimeout(() => {
      try {
        doc.focus();
        doc.print();
      } catch {}
      // Nettoyage
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    }, 200);
  };

  const editFormTax = Number(editing?.tax || 0) || 0;
  const editFormShipping = Number(editing?.shippingCost || 0) || 0;
  const editFormGrandTotal = (editItemLines.length > 0 ? editItemsSubtotal : (Number(editing?.total || 0) || 0)) + editFormTax + editFormShipping;

  const fetchOrders = async (page = 1) => {
    const resp = await adminService.orders.getAll({ q: searchTerm, status: filterStatus, page, limit: meta.limit, sort: 'createdAt', order: 'desc' });
    const list = resp?.data?.data || [];
    setMeta(resp?.data?.meta || { total: list.length, page, totalPages: 1, limit: meta.limit });
    await fetchAll({ q: searchTerm, status: filterStatus, page, limit: meta.limit, sort: 'createdAt', order: 'desc' });
  };

  useEffect(() => {
    (async () => { await fetchOrders(1); })();
  }, []);

  // Charger des utilisateurs pour alimenter le sélecteur client
  useEffect(() => {
    (async () => {
      try {
        const resp = await adminService.getUsers({ page: 1, limit: 100, sort: 'createdAt', order: 'desc' });
        const list = resp?.data?.data || resp?.data || [];
        const normalized = (Array.isArray(list) ? list : []).map(u => ({ id: u.id || u._id, name: u.name || `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email, email: u.email }));
        setUsers(normalized);
      } catch (e) {
        console.warn('Impossible de charger les utilisateurs pour le sélecteur client:', e);
      }
    })();
  }, []);

  // Recherche client (debounced)
  useEffect(() => {
    if (!customerQuery) return; 
    const t = setTimeout(async () => {
      try {
        const resp = await adminService.getUsers({ q: customerQuery, page: 1, limit: 20 });
        const list = resp?.data?.data || resp?.data || [];
        const normalized = (Array.isArray(list) ? list : []).map(u => ({ id: u.id || u._id, name: u.name || `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email, email: u.email }));
        setUsers(normalized);
      } catch (e) {
        // silencieux
      }
    }, 300);
    return () => clearTimeout(t);
  }, [customerQuery]);

  useEffect(() => {
    const id = setTimeout(async () => { await fetchOrders(1); }, 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterStatus]);

  // Charger des produits pour alimenter le sélecteur
  useEffect(() => {
    (async () => {
      try {
        const resp = await adminService.getProducts({ page: 1, limit: 100, sort: 'createdAt', order: 'desc' });
        const list = resp?.data?.data || resp?.data || [];
        // Normaliser: accepter objets { _id, name, basePrice }
        const normalized = (Array.isArray(list) ? list : []).map(p => ({ id: p.id || p._id, name: p.name, price: Number(p.basePrice || p.price || 0) }));
        setProducts(normalized);
      } catch (e) {
        console.warn('Impossible de charger les produits pour le sélecteur:', e);
      }
    })();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const orderId = order.id ? String(order.id).toLowerCase() : '';
    const customerName = order.customer ? String(order.customer).toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = orderId.includes(searchLower) || customerName.includes(searchLower);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Affichage principal (le chargement devient un overlay non bloquant pour permettre l'ouverture des modals)

  return (
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 z-[9990] pointer-events-none flex items-start justify-center pt-6">
          <div className="flex items-center bg-white/80 backdrop-blur rounded-md px-3 py-2 shadow">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600 text-sm">Chargement…</span>
          </div>
        </div>
      )}

      {/* Modal de consultation (lecture seule) - rendu via portal */}
      {showViewModal && ReactDOM.createPortal((
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-[9999]">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4 shadow-lg max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Détails de la commande #{viewing?.id || ''}</h3>
              <div className="flex items-center space-x-2">
                <button type="button" onClick={printViewing} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Imprimer / PDF</button>
                <button type="button" onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">×</button>
              </div>
            </div>
            {!viewing ? (
              <div className="py-6 text-center text-gray-500 text-sm">Chargement…</div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Client</div>
                <div className="font-medium text-gray-900 break-words">{viewing?.customer}</div>
                {viewing?.email && <div className="text-gray-600">{viewing.email}</div>}
              </div>
              <div>
                <div className="text-gray-500">Statuts</div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewing?.status)}`}>{getStatusIcon(viewing?.status)}<span className="ml-1 capitalize">{viewing?.status}</span></span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">{viewing?.paymentStatus}</span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Méthode de paiement</div>
                <div className="font-medium text-gray-900 capitalize">{viewing?.paymentMethod || 'cod'}</div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="font-medium text-gray-900">{viewing?.date}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-gray-500">Localisation</div>
                <div className="font-medium text-gray-900 break-words">{viewing?.location || '—'}</div>
              </div>
            </div>
            )}
            <div className="mt-4">
              <div className="text-sm text-gray-700 mb-2">Articles</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-2 py-2">Produit</th>
                      <th className="text-right px-2 py-2">Qté</th>
                      <th className="text-right px-2 py-2">PU</th>
                      <th className="text-right px-2 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(viewItems) ? viewItems : []).map((it, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-2 py-1 text-gray-900">{it.name}</td>
                        <td className="px-2 py-1 text-right">{it.quantity}</td>
                        <td className="px-2 py-1 text-right">{Number(it.unitPrice).toLocaleString()} GNF</td>
                        <td className="px-2 py-1 text-right font-medium">{Number(it.totalPrice).toLocaleString()} GNF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 border-t pt-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Taxe</div>
                <div className="text-right font-medium">{Number(viewing?.tax||0).toLocaleString()} GNF</div>
                <div className="text-gray-600">Frais de livraison</div>
                <div className="text-right font-medium">{Number(viewing?.shippingCost||0).toLocaleString()} GNF</div>
                <div className="text-gray-800">Total à payer</div>
                <div className="text-right font-semibold text-gray-900">{Number(viewing?.total||0).toLocaleString()} GNF</div>
              </div>
              {viewing?.notes && (
                <div className="mt-3 text-sm text-gray-700">
                  <div className="text-gray-500">Notes</div>
                  <div className="bg-gray-50 rounded p-2 whitespace-pre-wrap">{viewing.notes}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end mt-4">
              <button onClick={() => setShowViewModal(false)} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Fermer</button>
            </div>
          </div>
        </div>
      ), document.body)}
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-sm sm:text-base text-gray-600">Suivez et gérez toutes les commandes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle commande</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
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
            onClick={() => fetchOrders(Math.max(meta.page - 1, 1))}
            className={`px-3 py-1.5 text-sm rounded border ${meta.page <= 1 ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Précédent
          </button>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchOrders(Math.min(meta.page + 1, meta.totalPages))}
            className={`px-3 py-1.5 text-sm rounded border ${meta.page >= meta.totalPages ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Statistiques compactes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">En attente</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {(Array.isArray(orders) ? orders : []).filter(order => order.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Expédiées</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {(Array.isArray(orders) ? orders : []).filter(o => o.status === 'shipped').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <div className="ml-2 min-w-0">
              <p className="text-xs text-gray-600">Livrées</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {(Array.isArray(orders) ? orders : []).filter(order => order.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Client
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Produits
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                    <div className="text-xs sm:text-sm text-gray-500 sm:hidden">{order.customer}</div>
                    <div className="text-xs text-gray-400 sm:hidden">{order.items} article(s){order.products ? ` • ${String(order.products).slice(0, 30)}${String(order.products).length>30?'…':''}` : ''}</div>
                    <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">{order.location}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm font-medium text-gray-900 truncate">{order.customer}</div>
                    <div className="text-sm text-gray-500 truncate">{order.email}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">{order.items} articles</div>
                    <div className="text-sm text-gray-500 truncate">{order.products}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{Number(order?.total || 0).toLocaleString()} GNF</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize hidden sm:inline">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {order.date}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button type="button" className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded" onClick={() => onView(order)}>
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button type="button" className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded" onClick={() => onEdit(order)}>
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button type="button" className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded" onClick={async () => {
                        if (!confirm(`Supprimer la commande #${order.id} ?`)) return;
                        try {
                          await adminService.orders.delete(order.id);
                          showSuccess && showSuccess('Supprimée', 'La commande a été supprimée.');
                          await fetchOrders(meta.page);
                        } catch (e) {
                          showError && showError('Suppression impossible', e?.response?.data?.message || 'Erreur inconnue');
                        }
                      }}>
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td colSpan={7} className="px-3 sm:px-6 py-2 text-[11px] sm:text-xs text-gray-600">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span>Taxe: <span className="font-medium text-gray-800">{Number(order?.tax||0).toLocaleString()} GNF</span></span>
                        <span>Frais livraison: <span className="font-medium text-gray-800">{Number(order?.shippingCost||0).toLocaleString()} GNF</span></span>
                        <span>Méthode: <span className="font-medium text-gray-800">{order?.paymentMethod || 'cod'}</span></span>
                        <span>Statut paiement: <span className="font-medium text-gray-800 capitalize">{order?.paymentStatus || 'pending'}</span></span>
                      </div>
                      <div className="text-right">
                        <span className="bg-white border rounded px-2 py-0.5">Total à payer: <span className="font-semibold">{Number(order?.total || 0).toLocaleString()} GNF</span></span>
                      </div>
                    </div>
                  </td>
                </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de commande */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Nouvelle Commande</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                // Validation stricte
                const customer = String(newOrder.customer || '').trim();
                const location = String(newOrder.location || '').trim();
                const notes = String(newOrder.notes || '').trim();
                const hasDetailedItems = Array.isArray(itemLines) && itemLines.length > 0 && itemLines.every(ln => ln.product && Number(ln.quantity) > 0);
                let payload;
                if (hasDetailedItems) {
                  // Construire les items détaillés
                  const detailed = itemLines.map(ln => {
                    const prod = getProductById(ln.product);
                    const up = Number(ln.unitPrice);
                    const unit = !isNaN(up) && up >= 0 ? up : Number(prod?.price || 0);
                    return { product: ln.product, quantity: Math.max(Number(ln.quantity) || 1, 1), unitPrice: unit };
                  });
                  // Valider au moins 1 item
                  if (detailed.length === 0) return showError && showError('Validation', 'Ajoutez au moins un article.');
                  payload = { customer: selectedCustomerId || customer, items: detailed, location, notes, tax: addFormTax, shippingCost: addFormShipping, paymentMethod: newOrder.paymentMethod || 'cod', paymentStatus: newOrder.paymentStatus || 'pending', status: 'pending', date: new Date().toISOString().split('T')[0] };
                } else {
                  const itemsNum = Number(newOrder.items);
                  const totalNum = Number(newOrder.total);
                  if (!Number.isInteger(itemsNum) || itemsNum < 1) return showError && showError('Validation', "Le nombre d'articles doit être un entier ≥ 1.");
                  if (Number.isNaN(totalNum) || totalNum < 0) return showError && showError('Validation', 'Le total doit être un nombre ≥ 0.');
                  payload = { customer: selectedCustomerId || customer, items: itemsNum, total: totalNum, location, notes, tax: addFormTax, shippingCost: addFormShipping, paymentMethod: newOrder.paymentMethod || 'cod', paymentStatus: newOrder.paymentStatus || 'pending', status: 'pending', date: new Date().toISOString().split('T')[0] };
                }

                await create(payload);
                // Refresh list current page
                const resp = await adminService.orders.getAll({ q: searchTerm, status: filterStatus, page: meta.page, limit: meta.limit, sort: 'createdAt', order: 'desc' });
                const list = resp?.data?.data || [];
                setMeta(resp?.data?.meta || { total: list.length, page: meta.page, totalPages: 1, limit: meta.limit });
                await fetchAll({ q: searchTerm, status: filterStatus, page: meta.page, limit: meta.limit, sort: 'createdAt', order: 'desc' });
                setNewOrder({ customer: '', items: '', total: '', location: '', notes: '', tax: '', shippingCost: '', paymentMethod: 'cod', paymentStatus: 'pending' });
                setItemLines([]);
                setSelectedCustomerId('');
                setShowAddModal(false);
                showSuccess && showSuccess('Créée', 'La commande a été créée.');
              } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Erreur inconnue';
                showError && showError('Création impossible', msg);
              }
            }}>
              <div className="space-y-3">
                {/* Articles détaillés (optionnels) */}
                <div className="border border-gray-200 rounded-md p-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Articles de la commande (optionnel)</label>
                    <button type="button" onClick={addItemLine} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Ajouter un article</button>
                  </div>
                  {itemLines.length === 0 ? (
                    <p className="text-xs text-gray-500">Vous pouvez ajouter des articles détaillés ou utiliser les champs simples en dessous.</p>
                  ) : (
                    <div className="space-y-2">
                      {itemLines.map((ln, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <select
                              value={ln.product}
                              onChange={(e) => updateItemLine(idx, { product: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500"
                            >
                              <option value="">Sélectionner un produit</option>
                              {(Array.isArray(products) ? products : []).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <input type="number" min={1} value={ln.quantity}
                              onChange={(e)=> updateItemLine(idx, { quantity: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"/>
                          </div>
                          <div className="col-span-2">
                            <input type="number" min={0} value={ln.unitPrice}
                              placeholder={String(getProductById(ln.product)?.price || 0)}
                              onChange={(e)=> updateItemLine(idx, { unitPrice: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"/>
                          </div>
                          <div className="col-span-1 text-right text-sm text-gray-700">
                            {(() => {
                              const q = Math.max(Number(ln.quantity) || 0, 0);
                              const up = Number(ln.unitPrice);
                              const unit = !isNaN(up) && up >= 0 ? up : Number(getProductById(ln.product)?.price || 0);
                              return (unit * q).toLocaleString();
                            })()} GNF
                          </div>
                          <div className="col-span-1 text-right">
                            <button type="button" onClick={() => removeItemLine(idx)} className="text-xs text-red-600 hover:underline">Retirer</button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-end pt-2 border-t border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">Total: {Math.round(itemsSubtotal).toLocaleString()} GNF</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Client *</label>
                  <input
                    type="text"
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="mt-1">
                    <input list="users-list" value={selectedCustomerId} onChange={(e)=> setSelectedCustomerId(e.target.value)} placeholder="Choisir un client par ID" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500" />
                    <datalist id="users-list">
                      {(Array.isArray(users) ? users : []).map(u => (
                        <option key={u.id} value={u.id}>{`${u.name} — ${u.email}`}</option>
                      ))}
                    </datalist>
                    <input type="text" value={customerQuery} onChange={(e)=> setCustomerQuery(e.target.value)} placeholder="Rechercher client… (nom/email)" className="mt-1 w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre d'articles *</label>
                    <input
                      type="number"
                      value={newOrder.items}
                      onChange={(e) => setNewOrder({...newOrder, items: e.target.value})}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      disabled={itemLines.length > 0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total (GNF) *</label>
                    <input
                      type="number"
                      value={newOrder.total}
                      onChange={(e) => setNewOrder({...newOrder, total: e.target.value})}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder={itemLines.length > 0 ? String(Math.round(itemsSubtotal)) : ''}
                      disabled={itemLines.length > 0}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Localisation *</label>
                  <input
                    type="text"
                    value={newOrder.location}
                    onChange={(e) => setNewOrder({...newOrder, location: e.target.value})}
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                  <textarea
                    rows={2}
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'En cours...' : 'Créer la commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de commande */}
      {showEditModal && editing && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Modifier la Commande</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const customerText = String(editing.customer || '').trim();
                const location = String(editing.location || '').trim();
                const notes = String(editing.notes || '').trim();
                if (!customerText && !selectedEditCustomerId) return showError && showError('Validation', 'Le client est requis.');
                if (!location) return showError && showError('Validation', 'La localisation est requise.');

                const hasDetailedEdit = Array.isArray(editItemLines) && editItemLines.length > 0 && editItemLines.every(ln => ln.product && Number(ln.quantity) > 0);
                let payload;
                if (hasDetailedEdit) {
                  const detailed = editItemLines.map(ln => {
                    const prod = getProductById(ln.product);
                    const up = Number(ln.unitPrice);
                    const unit = !isNaN(up) && up >= 0 ? up : Number(prod?.price || 0);
                    return { product: ln.product, quantity: Math.max(Number(ln.quantity) || 1, 1), unitPrice: unit };
                  });
                  payload = {
                    customer: selectedEditCustomerId || customerText,
                    items: detailed,
                    location,
                    notes,
                    tax: editFormTax,
                    shippingCost: editFormShipping,
                    paymentMethod: editing.paymentMethod || 'cod',
                    paymentStatus: editing.paymentStatus || 'pending',
                    status: editing.status || 'pending',
                    date: editing.date || new Date().toISOString().split('T')[0]
                  };
                } else {
                  const itemsNum = Number(editing.items);
                  const totalNum = Number(editing.total);
                  if (!Number.isInteger(itemsNum) || itemsNum < 1) return showError && showError('Validation', "Le nombre d'articles doit être un entier ≥ 1.");
                  if (Number.isNaN(totalNum) || totalNum < 0) return showError && showError('Validation', 'Le total doit être un nombre ≥ 0.');
                  payload = {
                    customer: selectedEditCustomerId || customerText,
                    items: itemsNum,
                    total: totalNum,
                    location,
                    notes,
                    tax: editFormTax,
                    shippingCost: editFormShipping,
                    paymentMethod: editing.paymentMethod || 'cod',
                    paymentStatus: editing.paymentStatus || 'pending',
                    status: editing.status || 'pending',
                    date: editing.date || new Date().toISOString().split('T')[0]
                  };
                }

                await adminService.orders.update(editing.id, payload);
                await fetchOrders(meta.page);
                setShowEditModal(false);
                showSuccess && showSuccess('Modifiée', 'La commande a été mise à jour.');
              } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Erreur inconnue';
                showError && showError('Mise à jour impossible', msg);
              }
            }}>
              <div className="space-y-3">
                {/* Articles détaillés (édition) */}
                <div className="border border-gray-200 rounded-md p-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Articles de la commande</label>
                    <button type="button" onClick={addEditItemLine} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Ajouter un article</button>
                  </div>
                  {editItemLines.length === 0 ? (
                    <p className="text-xs text-gray-500">Aucun article détaillé. Vous pouvez modifier via les champs simples ci-dessous.</p>
                  ) : (
                    <div className="space-y-2">
                      {editItemLines.map((ln, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <select value={ln.product} onChange={(e)=>updateEditItemLine(idx,{product:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded">
                              <option value="">Sélectionner un produit</option>
                              {(Array.isArray(products) ? products : []).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2"><input type="number" min={1} value={ln.quantity} onChange={(e)=>updateEditItemLine(idx,{quantity:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded"/></div>
                          <div className="col-span-2"><input type="number" min={0} value={ln.unitPrice} onChange={(e)=>updateEditItemLine(idx,{unitPrice:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded"/></div>
                          <div className="col-span-1 text-right text-sm text-gray-700">{(() => { const q=Math.max(Number(ln.quantity)||0,0); const up=Number(ln.unitPrice); const unit=!isNaN(up)&&up>=0?up:Number(getProductById(ln.product)?.price||0); return (unit*q).toLocaleString(); })()} GNF</div>
                          <div className="col-span-1 text-right"><button type="button" onClick={()=>removeEditItemLine(idx)} className="text-xs text-red-600 hover:underline">Retirer</button></div>
                        </div>
                      ))}
                      <div className="flex items-center justify-end pt-2 border-t border-gray-200"><div className="text-sm font-semibold text-gray-900">Total: {Math.round(editItemsSubtotal).toLocaleString()} GNF</div></div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Client *</label>
                  <input type="text" value={editing.customer || ''} onChange={(e)=>setEditing({...editing, customer:e.target.value})} required className="w-full px-2 py-1.5 text-sm border rounded"/>
                  <div className="mt-1">
                    <input list="users-list-edit" value={selectedEditCustomerId} onChange={(e)=> setSelectedEditCustomerId(e.target.value)} placeholder="Choisir un client par ID" className="w-full px-2 py-1.5 text-sm border rounded" />
                    <datalist id="users-list-edit">
                      {(Array.isArray(users) ? users : []).map(u => (
                        <option key={u.id} value={u.id}>{`${u.name} — ${u.email}`}</option>
                      ))}
                    </datalist>
                    <input type="text" value={customerQuery} onChange={(e)=> setCustomerQuery(e.target.value)} placeholder="Rechercher client… (nom/email)" className="mt-1 w-full px-2 py-1.5 text-xs border rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Articles *</label>
                    <input type="number" value={editing.items || 0} onChange={(e)=>setEditing({...editing, items:e.target.value})} required className="w-full px-2 py-1.5 text-sm border rounded" disabled={editItemLines.length>0}/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total (GNF) *</label>
                    <input type="number" value={editing.total || 0} onChange={(e)=>setEditing({...editing, total:e.target.value})} required className="w-full px-2 py-1.5 text-sm border rounded" disabled={editItemLines.length>0} placeholder={editItemLines.length>0?String(Math.round(editItemsSubtotal)):''}/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Localisation *</label>
                  <input type="text" value={editing.location || ''} onChange={(e)=>setEditing({...editing, location:e.target.value})} required className="w-full px-2 py-1.5 text-sm border rounded"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                  <select value={editing.status || 'pending'} onChange={(e)=>setEditing({...editing, status:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded">
                    <option value="pending">En attente</option>
                    <option value="processing">En traitement</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
                {/* Paiement & frais (édition) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Taxe (GNF)</label>
                    <input type="number" min={0} value={editing?.tax || ''} onChange={(e)=> setEditing({ ...editing, tax: e.target.value })} className="w-full px-2 py-1.5 text-sm border rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Frais de livraison (GNF)</label>
                    <input type="number" min={0} value={editing?.shippingCost || ''} onChange={(e)=> setEditing({ ...editing, shippingCost: e.target.value })} className="w-full px-2 py-1.5 text-sm border rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Méthode de paiement</label>
                    <select value={editing?.paymentMethod || 'cod'} onChange={(e)=> setEditing({ ...editing, paymentMethod: e.target.value })} className="w-full px-2 py-1.5 text-sm border rounded">
                      <option value="cod">Paiement à la livraison (COD)</option>
                      <option value="om">Orange Money</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="bank_transfer">Virement bancaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Statut de paiement</label>
                    <select value={editing?.paymentStatus || 'pending'} onChange={(e)=> setEditing({ ...editing, paymentStatus: e.target.value })} className="w-full px-2 py-1.5 text-sm border rounded">
                      <option value="pending">En attente</option>
                      <option value="paid">Payé</option>
                      <option value="failed">Échoué</option>
                      <option value="refunded">Remboursé</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end text-sm text-gray-700">
                  <div className="bg-gray-50 rounded px-2 py-1">Total à payer: <span className="font-semibold">{Math.round(editFormGrandTotal).toLocaleString()} GNF</span></div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows={2} value={editing.notes || ''} onChange={(e)=>setEditing({...editing, notes:e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded"/>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
                <button type="button" onClick={()=>setShowEditModal(false)} className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Annuler</button>
                <button type="submit" className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersModule;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  X
} from 'lucide-react';
import { adminService } from '../../../../../services/api';
import { collectionService } from '../../../../../services/api';
import { useToast } from '../../../../contexts/ToastContext';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';

const ProductsModule = () => {
  const { showSuccess, showError } = useToast?.() || { showSuccess: ()=>{}, showError: ()=>{} };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFarm, setFilterFarm] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    farm: '',
    price: '',
    stock: '',
    minStock: '',
    description: '',
    hasVariants: false,
    variants: [],
    collections: []
  });

  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: 20 });

  // Catégories dynamiques
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  // Fermes dynamiques
  const [farms, setFarms] = useState([]);
  const [farmLoading, setFarmLoading] = useState(false);
  // Collections dynamiques
  const [collections, setCollections] = useState([]);
  const fetchCollections = async () => {
    try {
      const res = await collectionService.getAll({ page: 1, limit: 200, search: '' });
      const base = res?.data || {};
      setCollections(Array.isArray(base.data) ? base.data : []);
    } catch (e) {
      console.warn('Impossible de charger les collections', e);
    }
  };
  const getCategoryName = (idOrName) => {
    if (!idOrName) return '—';
    const found = categories.find(c => c._id === idOrName || c.id === idOrName);
    return found?.name || String(idOrName);
  };
  const getFarmName = (idOrName) => {
    if (!idOrName) return '—';
    const list = Array.isArray(farms) ? farms : [];
    const f = list.find(x => x._id === idOrName || x.id === idOrName);
    return f?.nom || f?.name || String(idOrName);
  };

  const fetchFarms = async () => {
    try {
      setFarmLoading(true);
      const res = await adminService.getFarms({ page: 1, limit: 100, sort: 'createdAt', order: 'desc' });
      const raw = (res && res.data) ? res.data : [];
      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw?.data)) list = raw.data;
      else if (Array.isArray(raw?.farms)) list = raw.farms;
      setFarms(Array.isArray(list) ? list : []);
      setNewProduct(prev => ({ ...prev, farm: prev.farm || ((Array.isArray(list) && list.length > 0) ? (list[0]._id || list[0].id || '') : '') }));
    } catch (e) {
      console.warn('Impossible de charger les fermes', e);
    } finally {
      setFarmLoading(false);
    }
  };

  useEffect(() => { fetchFarms(); fetchCollections(); }, []);

  // Soumission du formulaire d'ajout
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation côté front pour conformité backend
      const nameStr = String(newProduct.name || '').trim();
      const descStr = String(newProduct.description || '').trim();
      if (nameStr.length < 2) return showError && showError('Validation', 'Le nom doit contenir au moins 2 caractères.');
      if (descStr.length < 10) return showError && showError('Validation', 'La description doit contenir au moins 10 caractères.');
      if (!newProduct.category) return showError && showError('Validation', 'Veuillez sélectionner une catégorie.');
      if (!newProduct.farm) return showError && showError('Validation', 'Veuillez sélectionner une ferme.');
      const priceNum = Number(newProduct.price);
      if (isNaN(priceNum) || priceNum < 0) return showError && showError('Validation', 'Le prix doit être un nombre positif.');
      if (!!newProduct.hasVariants) {
        const skuRe = /^[A-Z0-9-]+$/;
        const variants = Array.isArray(newProduct.variants) ? newProduct.variants : [];
        if (variants.length === 0) return showError && showError('Validation', 'Ajoutez au moins une variante ou décochez "Gérer par variantes".');
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i] || {};
          const sku = String(v.sku || '').toUpperCase();
          const vname = String(v.name || '').trim();
          const vprice = Number(v.price);
          const vqty = Number(v.quantity);
          if (!sku || !skuRe.test(sku)) return showError && showError('Validation', `Variante #${i+1}: SKU invalide (lettres majuscules, chiffres, tirets).`);
          if (vname.length < 1) return showError && showError('Validation', `Variante #${i+1}: nom requis.`);
          if (isNaN(vprice) || vprice < 0) return showError && showError('Validation', `Variante #${i+1}: prix doit être un nombre positif.`);
          if (!Number.isInteger(vqty) || vqty < 0) return showError && showError('Validation', `Variante #${i+1}: quantité doit être un entier ≥ 0.`);
        }
      } else {
        const stockNum = Number(newProduct.stock);
        const minNum = Number(newProduct.minStock);
        if (isNaN(stockNum) || stockNum < 0) return showError && showError('Validation', 'Le stock doit être un nombre ≥ 0.');
        if (isNaN(minNum) || minNum < 0) return showError && showError('Validation', 'Le stock minimum doit être un nombre ≥ 0.');
      }

      const payload = {
        name: newProduct.name,
        category: newProduct.category,
        farm: newProduct.farm,
        price: Number(newProduct.price),
        stock: newProduct.hasVariants ? undefined : Number(newProduct.stock),
        minStock: newProduct.hasVariants ? undefined : Number(newProduct.minStock),
        description: newProduct.description,
        status: 'active',
        hasVariants: !!newProduct.hasVariants,
        variants: newProduct.hasVariants
          ? (Array.isArray(newProduct.variants) ? newProduct.variants : []).map(v => ({
              sku: (v.sku || '').toUpperCase(),
              name: v.name || '',
              price: Number(v.price) || 0,
              quantity: Number(v.quantity) || 0,
              lowStockThreshold: Number(v.lowStockThreshold) || 0,
              options: v.options || {},
              trackInventory: v.trackInventory !== false
            }))
          : [],
        collections: Array.isArray(newProduct.collections) ? newProduct.collections : []
      };
      await adminService.createProduct(payload);
      await fetchProducts(meta.page);
      setNewProduct({ name: '', category: '', farm: '', price: '', stock: '', minStock: '', description: '', hasVariants: false, variants: [] });
      setShowAddModal(false);
      showSuccess && showSuccess('Créé', 'Le produit a été créé.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur inconnue';
      showError && showError('Création impossible', msg);
    }
  };

  const createCategoryInline = async (onCreated) => {
    if (!catName.trim()) return;
    try {
      setCatSaving(true);
      const res = await adminService.createCategory({ name: catName.trim(), description: catDesc, isActive: true });
      const created = res?.data?.data?.category;
      await fetchCategories();
      setShowCatForm(false);
      setCatName('');
      setCatDesc('');
      if (created?._id && typeof onCreated === 'function') onCreated(created._id);
      showSuccess && showSuccess('Catégorie créée', 'La catégorie a été ajoutée.');
    } catch (e) {
      showError && showError('Création catégorie impossible', e?.response?.data?.message || 'Erreur inconnue');
    } finally {
      setCatSaving(false);
    }
  };
  const fetchCategories = async () => {
    try {
      setCatLoading(true);
      const res = await adminService.getCategories({ page: 1, limit: 100, isActive: true, sort: 'name', order: 'asc' });
      const list = res?.data?.data || [];
      setCategories(list);
      // Définir une catégorie par défaut pour le formulaire d'ajout si vide
      setNewProduct(prev => ({ ...prev, category: prev.category || (list[0]?._id || '') }));
    } catch (e) {
      console.warn('Impossible de charger les catégories', e);
    } finally {
      setCatLoading(false);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const qTerm = (searchTerm || '').trim();
      const res = await adminService.getProducts({
        q: qTerm.length >= 2 ? qTerm : '',
        category: filterCategory,
        status: filterStatus,
        farm: filterFarm,
        page,
        limit: meta.limit,
        sort: 'createdAt',
        order: 'desc'
      });
      const payload = res?.data?.data;
      const data = Array.isArray(payload) ? payload : (payload?.products || []);
      console.debug('Products payload:', { count: Array.isArray(data) ? data.length : 0, raw: res?.data });
      const m = res?.data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
      setProducts(data);
      setMeta(m);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Impossible de charger les produits');
      setProducts([]);
      setMeta({ total: 0, totalPages: 1, page: 1, limit: 20 });
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const onEdit = (product) => {
    setEditing({
      ...product,
      hasVariants: !!product.hasVariants,
      variants: Array.isArray(product.variants) ? product.variants : [],
      collections: Array.isArray(product.collections)
        ? product.collections.map(c => (c?._id || c?.id || c)).filter(Boolean)
        : []
    });
    setShowEditModal(true);
  };

  const onDelete = async (product) => {
    if (!confirm(`Supprimer le produit "${product.name}" ?`)) return;
    try {
      await adminService.deleteProduct(product.id);
      showSuccess && showSuccess('Supprimé', 'Le produit a été supprimé.');
      await fetchProducts(meta.page);
    } catch (e) {
      showError && showError('Suppression impossible', e?.response?.data?.message || 'Erreur inconnue');
    }
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewing, setViewing] = useState(null);
  const onView = async (product) => {
    try {
      const res = await adminService.getProduct(product.id);
      const p = res?.data?.data?.product || product;
      setViewing(p);
    } catch (e) {
      console.warn('Impossible de charger le produit détaillé, affichage local.', e);
      setViewing(product);
    } finally {
      setShowViewModal(true);
    }
  };

  // Menu contextuel (trois points)
  const [menuOpenId, setMenuOpenId] = useState(null);
  const toggleMenu = (id) => setMenuOpenId(prev => (prev === id ? null : id));
  const closeMenu = () => setMenuOpenId(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    const onClick = (e) => {
      const target = e.target;
      if (!target.closest) return;
      if (!target.closest('[data-product-menu]')) closeMenu();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('click', onClick); };
  }, []);

  useEffect(() => { fetchProducts(1); fetchCategories(); }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchProducts(1), 300);
    return () => clearTimeout(id);
  }, [searchTerm, filterCategory, filterStatus]);

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    const s = (searchTerm || '').toLowerCase();
    const matchesSearch = s.length < 1 ||
      (p.name && p.name.toLowerCase().includes(s)) ||
      (p.category && p.category.toLowerCase().includes(s)) ||
      (p.description && p.description.toLowerCase().includes(s));
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (p.status || 'active') === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Stock faible' };
    if (stock <= minStock * 2) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Stock moyen' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'Stock bon' };
  };

  // Statistiques et pourcentages
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const lowStockCount = (Array.isArray(products) ? products.filter(p => p.stock <= p.minStock).length : 0);
  const totalSales = (Array.isArray(products) ? products.reduce((sum, p) => sum + (Number(p.sales) || 0), 0) : 0);
  const categoriesCount = (Array.isArray(products) ? new Set(products.map(p => p.category)).size : 0);
  const pct = (num, den) => den > 0 ? Math.round((num / den) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des produits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez votre catalogue de produits avicoles</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nouveau Produit</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
          <div className="mt-2 sm:mt-0 text-xs text-gray-500">
            {filteredProducts.length} résultat(s){searchTerm ? ` pour "${searchTerm}"` : ''}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Produits</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Stock Faible</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{lowStockCount}</p>
              <p className="text-xs text-gray-500">{pct(lowStockCount, totalProducts)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Ventes Totales</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Catégories</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{categoriesCount}</p>
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
                placeholder="Rechercher (nom, catégorie, description)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {searchTerm && (
                <button aria-label="Effacer la recherche" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 text-gray-500" onClick={()=>setSearchTerm('')}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <select
              value={filterFarm}
              onChange={(e) => setFilterFarm(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Toutes fermes</option>
              {(Array.isArray(farms) ? farms : []).map(f => (
                <option key={f._id || f.id} value={f._id || f.id}>{f.nom || f.name || f._id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* État aucun résultat */}
      {products.length > 0 && filteredProducts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md px-4 py-3">
          Aucun produit ne correspond à votre recherche.
          <button className="ml-2 underline" onClick={() => setSearchTerm('')}>Réinitialiser</button>
        </div>
      )}

      {/* Liste des produits */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ferme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(filteredProducts) ? filteredProducts : []).filter(Boolean).map((product) => {
                const stock = Number(product?.stock) || 0;
                const minStock = Number(product?.minStock) || 0;
                const stockStatus = getStockStatus(stock, minStock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                          <div className="mt-0.5 text-xs text-gray-600">
                            Ferme:
                            {product?.farm ? (
                              <Link to={`/admin/farms/edit/${product.farm}`} className="ml-1 inline-flex px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 hover:bg-gray-200">
                                {getFarmName(product?.farm)}
                              </Link>
                            ) : (
                              <span className="ml-1 inline-flex px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(product?.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getFarmName(product?.farm)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(product?.price || 0).toLocaleString()} GNF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                          {stock} unités
                        </span>
                        {stock <= minStock && (
                          <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                        )}

      {/* Modal de visualisation */}
      {showViewModal && viewing && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails du produit</h3>
              <button onClick={()=>{ setShowViewModal(false); setViewing(null); }} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium text-gray-700">Nom:</span> {viewing.name}</div>
              <div><span className="font-medium text-gray-700">Catégorie:</span> {getCategoryName(viewing.category)}</div>
              <div>
                <span className="font-medium text-gray-700">Ferme:</span>{' '}
                {viewing.farm ? (
                  <Link to={`/admin/farms/edit/${viewing.farm}`} className="underline text-blue-600 hover:text-blue-700">
                    {getFarmName(viewing.farm)}
                  </Link>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div><span className="font-medium text-gray-700">Prix:</span> {Number(viewing.price).toLocaleString()} GNF</div>
              <div><span className="font-medium text-gray-700">Stock:</span> {viewing.stock} (min {viewing.minStock})</div>
              <div><span className="font-medium text-gray-700">Statut:</span> {(viewing.status || 'active')}</div>
              <div><span className="font-medium text-gray-700">Ventes:</span> {viewing.sales || 0}</div>
              <div><span className="font-medium text-gray-700">Créé le:</span> {viewing.createdAt ? new Date(viewing.createdAt).toLocaleString('fr-FR') : '—'}</div>
              {Array.isArray(viewing.variants) && viewing.variants.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-gray-700 mb-1">Variantes:</div>
                  <div className="space-y-1">
                    {viewing.variants.map((v, i) => (
                      <div key={i} className="text-xs text-gray-700 flex flex-wrap gap-x-2 gap-y-1">
                        <span className="font-semibold">SKU:</span> <span>{v.sku || '—'}</span>
                        <span className="font-semibold">Nom:</span> <span>{v.name || '—'}</span>
                        <span className="font-semibold">Prix:</span> <span>{Number(v.price||0).toLocaleString()} GNF</span>
                        <span className="font-semibold">Qté:</span> <span>{Number(v.quantity||0)}</span>
                        <span className="font-semibold">Seuil:</span> <span>{Number(v.lowStockThreshold||0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button onClick={()=>{ setShowViewModal(false); setViewing(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Fermer</button>
              <button onClick={()=>{ const p = viewing; setShowViewModal(false); setViewing(null); onEdit(p); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de produit */}
      {showEditModal && editing && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le Produit</h3>
              <button onClick={()=>setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={async (e)=>{
              e.preventDefault();
              try {
                const payload = {
                  name: editing.name,
                  category: editing.category,
                  price: Number(editing.price),
                  // simple stock path (handled by backend to metadata)
                  stock: editing.hasVariants ? undefined : Number(editing.stock),
                  minStock: editing.hasVariants ? undefined : Number(editing.minStock),
                  description: editing.description,
                  status: editing.status || 'active',
                  hasVariants: !!editing.hasVariants,
                  variants: editing.hasVariants
                    ? (Array.isArray(editing.variants) ? editing.variants : []).map(v => ({
                        sku: (v.sku || '').toUpperCase(),
                        name: v.name || '',
                        price: Number(v.price) || 0,
                        quantity: Number(v.quantity) || 0,
                        lowStockThreshold: Number(v.lowStockThreshold) || 0,
                        options: v.options || {},
                        trackInventory: v.trackInventory !== false
                      }))
                    : []
                };
                await adminService.updateProduct(editing.id, payload);
                await fetchProducts(meta.page);
                setShowEditModal(false);
                showSuccess && showSuccess('Modifié', 'Le produit a été mis à jour.');
              } catch (err) {
                showError && showError('Mise à jour impossible', err?.response?.data?.message || 'Erreur inconnue');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <input type="text" required value={editing.name} onChange={(e)=>setEditing({...editing, name:e.target.value})} className="w-full px-3 py-2 border rounded"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select value={editing.category} onChange={(e)=>setEditing({...editing, category:e.target.value})} className="w-full px-3 py-2 border rounded">
                    {categories.length === 0 && <option value="">Aucune catégorie</option>}
                    {categories.map(cat => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center justify-between">
                    <button type="button" className="text-xs text-blue-600 hover:underline" onClick={()=>setShowCatForm(v=>!v)}>
                      {showCatForm ? 'Annuler' : 'Créer une catégorie'}
                    </button>
                    {catLoading && <span className="text-xs text-gray-500">Chargement…</span>}
                  </div>
                  {showCatForm && (
                    <div className="mt-2 border rounded p-2 space-y-2">
                      <input placeholder="Nom de la catégorie" value={catName} onChange={(e)=>setCatName(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <input placeholder="Description (optionnel)" value={catDesc} onChange={(e)=>setCatDesc(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="flex justify-end space-x-2">
                        <button type="button" className="px-2 py-1 text-sm" onClick={()=>{ setShowCatForm(false); setCatName(''); setCatDesc(''); }}>Annuler</button>
                        <button type="button" disabled={catSaving || !catName.trim()} className={`px-2 py-1 text-sm rounded ${catSaving || !catName.trim() ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`} onClick={()=>createCategoryInline((id)=>setEditing(prev=>({ ...prev, category: id })))}>
                          {catSaving ? 'Création…' : 'Créer'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collections</label>
                  <select multiple value={editing.collections || []} onChange={(e)=>{
                    const ids = Array.from(e.target.selectedOptions).map(opt=>opt.value);
                    setEditing({...editing, collections: ids});
                  }} className="w-full px-3 py-2 border rounded min-h-[100px]">
                    {collections.map(col => (
                      <option key={col._id} value={col._id}>{col.name} /{col.slug}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (GNF)</label>
                  <input type="number" required value={editing.price} onChange={(e)=>setEditing({...editing, price:e.target.value})} className="w-full px-3 py-2 border rounded"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" required value={editing.stock} onChange={(e)=>setEditing({...editing, stock:e.target.value})} className="w-full px-3 py-2 border rounded"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Min</label>
                    <input type="number" required value={editing.minStock} onChange={(e)=>setEditing({...editing, minStock:e.target.value})} className="w-full px-3 py-2 border rounded"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={editing.description || ''} onChange={(e)=>setEditing({...editing, description:e.target.value})} className="w-full px-3 py-2 border rounded"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={editing.status || 'active'} onChange={(e)=>setEditing({...editing, status:e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                    <input type="checkbox" checked={!!editing.hasVariants} onChange={(e)=>setEditing({...editing, hasVariants: e.target.checked})} />
                    <span>Gérer le stock par variantes</span>
                  </label>
                  {editing.hasVariants ? (
                    <div className="space-y-3">
                      {(Array.isArray(editing.variants) ? editing.variants : []).map((v, idx) => (
                        <div key={idx} className="border rounded p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600">SKU</label>
                              <input value={v.sku || ''} onChange={(e)=>{
                                const arr = [...(editing.variants||[])]; arr[idx] = { ...arr[idx], sku: e.target.value }; setEditing({...editing, variants: arr});
                              }} className="w-full px-2 py-1 border rounded" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Nom variante</label>
                              <input value={v.name || ''} onChange={(e)=>{
                                const arr = [...(editing.variants||[])]; arr[idx] = { ...arr[idx], name: e.target.value }; setEditing({...editing, variants: arr});
                              }} className="w-full px-2 py-1 border rounded" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Prix</label>
                              <input type="number" value={v.price || 0} onChange={(e)=>{
                                const arr = [...(editing.variants||[])]; arr[idx] = { ...arr[idx], price: e.target.value }; setEditing({...editing, variants: arr});
                              }} className="w-full px-2 py-1 border rounded" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Quantité</label>
                              <input type="number" value={v.quantity || 0} onChange={(e)=>{
                                const arr = [...(editing.variants||[])]; arr[idx] = { ...arr[idx], quantity: e.target.value }; setEditing({...editing, variants: arr});
                              }} className="w-full px-2 py-1 border rounded" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Seuil stock bas</label>
                              <input type="number" value={v.lowStockThreshold || 0} onChange={(e)=>{
                                const arr = [...(editing.variants||[])]; arr[idx] = { ...arr[idx], lowStockThreshold: e.target.value }; setEditing({...editing, variants: arr});
                              }} className="w-full px-2 py-1 border rounded" />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button type="button" className="text-red-600 text-sm" onClick={()=>{
                              const arr = [...(editing.variants||[])]; arr.splice(idx,1); setEditing({...editing, variants: arr});
                            }}>Supprimer la variante</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="px-2 py-1 text-sm border rounded" onClick={()=>{
                        setEditing({...editing, variants: [...(editing.variants||[]), { sku: '', name: '', price: 0, quantity: 0, lowStockThreshold: 0 }]});
                      }}>+ Ajouter une variante</button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Utilisez le stock simple (champs Stock et Stock Min) si vous n'avez pas de variantes.</p>
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative" data-product-menu>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded" onClick={() => onView(product)}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded" onClick={() => onEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded" onClick={() => onDelete(product)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded sm:inline-flex hidden" onClick={(e)=>{ e.stopPropagation(); toggleMenu(product.id); }}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      {menuOpenId === product.id && (
                        <div className="absolute right-2 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10" onClick={(e)=>e.stopPropagation()}>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{ closeMenu(); onView(product); }}>Voir</button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{ closeMenu(); onEdit(product); }}>Modifier</button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{ closeMenu(); setEditing({ ...product, status: (product.status || 'active') === 'active' ? 'inactive' : 'active' }); setShowEditModal(true); }}>
                            {(product.status || 'active') === 'active' ? 'Désactiver' : 'Activer'}
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={()=>{ closeMenu(); onDelete(product); }}>Supprimer</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
            onClick={() => fetchProducts(Math.max(meta.page - 1, 1))}
            className={`px-3 py-1.5 text-sm rounded border ${meta.page <= 1 ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Précédent
          </button>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchProducts(Math.min(meta.page + 1, meta.totalPages))}
            className={`px-3 py-1.5 text-sm rounded border ${meta.page >= meta.totalPages ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modal d'ajout de produit */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nouveau Produit</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {categories.length === 0 && <option value="">Sélectionnez une catégorie</option>}
                    {categories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center justify-between">
                    <button type="button" className="text-xs text-blue-600 hover:underline" onClick={()=>setShowCatForm(v=>!v)}>
                      {showCatForm ? 'Annuler' : 'Créer une catégorie'}
                    </button>
                    {catLoading && <span className="text-xs text-gray-500">Chargement…</span>}
                  </div>
                  {showCatForm && (
                    <div className="mt-2 border rounded p-2 space-y-2">
                      <input placeholder="Nom de la catégorie" value={catName} onChange={(e)=>setCatName(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <input placeholder="Description (optionnel)" value={catDesc} onChange={(e)=>setCatDesc(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="flex justify-end space-x-2">
                        <button type="button" className="px-2 py-1 text-sm" onClick={()=>{ setShowCatForm(false); setCatName(''); setCatDesc(''); }}>Annuler</button>
                        <button type="button" disabled={catSaving || !catName.trim()} className={`px-2 py-1 text-sm rounded ${catSaving || !catName.trim() ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`} onClick={()=>createCategoryInline((id)=>setNewProduct(prev=>({ ...prev, category: id })))}>
                          {catSaving ? 'Création…' : 'Créer'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collections</label>
                  <select
                    multiple
                    value={newProduct.collections || []}
                    onChange={(e) => setNewProduct({ ...newProduct, collections: Array.from(e.target.selectedOptions).map(o=>o.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[100px]"
                  >
                    {collections.map((col) => (
                      <option key={col._id} value={col._id}>{col.name} /{col.slug}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (GNF)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Min</label>
                    <input
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                    <input type="checkbox" checked={!!newProduct.hasVariants} onChange={(e) => setNewProduct({ ...newProduct, hasVariants: e.target.checked })} />
                    <span>Gérer le stock par variantes</span>
                  </label>
                  {newProduct.hasVariants ? (
                    <div className="space-y-3">
                      {(Array.isArray(newProduct.variants) ? newProduct.variants : []).map((v, idx) => (
                        <div key={idx} className="border rounded p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600">SKU</label>
                              <input
                                value={v.sku || ''}
                                onChange={(e) => {
                                  const arr = [...(newProduct.variants || [])];
                                  arr[idx] = { ...arr[idx], sku: e.target.value };
                                  setNewProduct({ ...newProduct, variants: arr });
                                }}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Nom variante</label>
                              <input
                                value={v.name || ''}
                                onChange={(e) => {
                                  const arr = [...(newProduct.variants || [])];
                                  arr[idx] = { ...arr[idx], name: e.target.value };
                                  setNewProduct({ ...newProduct, variants: arr });
                                }}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Prix</label>
                              <input
                                type="number"
                                value={v.price || 0}
                                onChange={(e) => {
                                  const arr = [...(newProduct.variants || [])];
                                  arr[idx] = { ...arr[idx], price: e.target.value };
                                  setNewProduct({ ...newProduct, variants: arr });
                                }}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Quantité</label>
                              <input
                                type="number"
                                value={v.quantity || 0}
                                onChange={(e) => {
                                  const arr = [...(newProduct.variants || [])];
                                  arr[idx] = { ...arr[idx], quantity: e.target.value };
                                  setNewProduct({ ...newProduct, variants: arr });
                                }}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Seuil stock bas</label>
                              <input
                                type="number"
                                value={v.lowStockThreshold || 0}
                                onChange={(e) => {
                                  const arr = [...(newProduct.variants || [])];
                                  arr[idx] = { ...arr[idx], lowStockThreshold: e.target.value };
                                  setNewProduct({ ...newProduct, variants: arr });
                                }}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="text-red-600 text-sm"
                              onClick={() => {
                                const arr = [...(newProduct.variants || [])];
                                arr.splice(idx, 1);
                                setNewProduct({ ...newProduct, variants: arr });
                              }}
                            >
                              Supprimer la variante
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="px-2 py-1 text-sm border rounded"
                        onClick={() => {
                          setNewProduct({
                            ...newProduct,
                            variants: [...(newProduct.variants || []), { sku: '', name: '', price: 0, quantity: 0, lowStockThreshold: 0 }],
                          });
                        }}
                      >
                        + Ajouter une variante
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Utilisez le stock simple si vous n'avez pas de variantes.</p>
                  )}
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
                  Créer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsModule;

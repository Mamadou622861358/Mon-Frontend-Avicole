import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Package, Home, Calendar } from 'lucide-react';
import { adminService } from '../../../../services/api';

const Reports = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState(null);
  const [productsReport, setProductsReport] = useState([]);
  const [farmsReport, setFarmsReport] = useState([]);
  const [loading, setLoading] = useState(false);

  // Récupérer les rapports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      // Rapports réels: ventes (admin)
      try {
        const res = await adminService.getSalesReport(params);
        // Supposons un format { data: { totalRevenue, totalOrders, averageOrderValue } }
        const payload = res?.data?.data || res?.data || {};
        setSalesReport({
          totalRevenue: Number(payload.totalRevenue) || 0,
          totalOrders: Number(payload.totalOrders) || 0,
          averageOrderValue: Number(payload.averageOrderValue) || 0,
        });
      } catch (e) {
        setSalesReport({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
      }

      // Produits
      try {
        const pr = await adminService.getProductsReport(params);
        const list = pr?.data?.data || pr?.data || [];
        setProductsReport(Array.isArray(list) ? list : []);
      } catch {
        setProductsReport([]);
      }
      // Fermes
      try {
        const fr = await adminService.getFarmsReport(params);
        const list = fr?.data?.data || fr?.data || [];
        setFarmsReport(Array.isArray(list) ? list : []);
      } catch {
        setFarmsReport([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handleExport = async (type) => {
    // A n'activer que si une route d'export existe côté backend. Pour l'instant, pas de simulation.
    console.warn('Export indisponible: aucune route d\'export définie pour les rapports.');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderSalesReport = () => (
    <div className="space-y-6">
      {(!salesReport || (
        Number(salesReport.totalRevenue) === 0 &&
        Number(salesReport.totalOrders) === 0 &&
        Number(salesReport.averageOrderValue) === 0
      )) ? (
        <div className="bg-white border rounded p-6 text-sm text-gray-600">Aucune donnée disponible pour la période sélectionnée.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Chiffre d'affaires</h3>
            <p className="text-2xl font-bold">{formatCurrency(salesReport.totalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Commandes</h3>
            <p className="text-2xl font-bold">{salesReport.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Panier moyen</h3>
            <p className="text-2xl font-bold">{formatCurrency(salesReport.averageOrderValue)}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderProductsReport = () => (
    <div className="space-y-4">
      {(!productsReport || productsReport.length === 0) ? (
        <div className="bg-white border rounded p-6 text-sm text-gray-600">Aucune donnée disponible.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité vendue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiffre d'affaires</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsReport.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.category || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.quantitySold || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(p.revenue || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderFarmsReport = () => (
    <div className="space-y-4">
      {(!farmsReport || farmsReport.length === 0) ? (
        <div className="bg-white border rounded p-6 text-sm text-gray-600">Aucune donnée disponible.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ferme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commandes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiffre d'affaires</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {farmsReport.map((f) => (
                <tr key={f.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.location || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.productsCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.ordersCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(f.revenue || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Rapports et Analyses</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Du</span>
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Au</span>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleExport(activeTab)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Exporter
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sales')}
              className={`${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Ventes
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Package className="w-4 h-4 mr-2" /> Produits
            </button>
            <button
              onClick={() => setActiveTab('farms')}
              className={`${
                activeTab === 'farms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Home className="w-4 h-4 mr-2" /> Fermes
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {activeTab === 'sales' && renderSalesReport()}
          {activeTab === 'products' && renderProductsReport()}
          {activeTab === 'farms' && renderFarmsReport()}
        </div>
      )}
    </div>
  );
};

export default Reports;

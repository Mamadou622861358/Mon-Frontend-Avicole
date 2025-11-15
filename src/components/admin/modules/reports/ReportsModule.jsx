import React, { useState, useEffect } from 'react';
import { 
  Download,
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  FileText
} from 'lucide-react';
import { adminService } from '../../../../services/adminService';

const ReportsModule = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  const [sales, setSales] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [newUsers, setNewUsers] = useState(0);
  const [productsSold, setProductsSold] = useState(0);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
      // Sales (aggregate array salesData)
      try {
        const sr = await adminService.getSalesReport(params);
        const salesData = sr?.data?.data?.salesData || [];
        const totals = Array.isArray(salesData) ? salesData.reduce((acc, it) => {
          acc.totalRevenue += Number(it.totalRevenue) || 0;
          acc.totalOrders += Number(it.totalOrders) || 0;
          return acc;
        }, { totalRevenue: 0, totalOrders: 0 }) : { totalRevenue: 0, totalOrders: 0 };
        const averageOrderValue = totals.totalOrders > 0 ? Math.round(totals.totalRevenue / totals.totalOrders) : 0;
        setSales({ totalRevenue: totals.totalRevenue, totalOrders: totals.totalOrders, averageOrderValue });
      } catch { setSales({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 }); }
      // Users (by date range, sum userGrowth)
      try {
        const ur = await adminService.getUsersReport(params);
        const userGrowth = ur?.data?.data?.userGrowth || [];
        const count = Array.isArray(userGrowth) ? userGrowth.reduce((sum, it) => sum + (Number(it.newUsers) || 0), 0) : 0;
        setNewUsers(count);
      } catch { setNewUsers(0); }
      // Products
      try {
        const pr = await adminService.getProductsReport(params);
        const list = pr?.data?.data || pr?.data || [];
        const totalQty = Array.isArray(list) ? list.reduce((sum, it) => sum + (Number(it.quantitySold) || 0), 0) : 0;
        setProductsSold(totalQty);
      } catch { setProductsSold(0); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [startDate, endDate]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const params = {
        type: 'sales',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        includeUnpaid: true,
      };
      const resp = await adminService.exportReportCsv(params);
      const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_sales_${startDate.toISOString().slice(0,10)}_${endDate.toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error('Export échoué', e);
      alert('Échec de la génération du rapport.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des rapports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rapports et Analyses</h1>
          <p className="text-sm sm:text-base text-gray-600">Générez des rapports détaillés sur votre activité</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={generateReport}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Générer rapport</span>
            <span className="sm:hidden">Rapport</span>
          </button>
        </div>
      </div>

      {/* Filtres période */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          />
          <span className="text-sm text-gray-600">au</span>
          <input
            type="date"
            value={endDate.toISOString().split('T')[0]}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Statistiques rapides réelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Croissance CA</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">—</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Nouveaux Clients</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{newUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Produits Vendus</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{productsSold}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Revenus</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0 }).format(sales.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section de rapports (désactivée tant qu'aucun export n'est prêt) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapports Disponibles</h3>
        <div className="text-sm text-gray-600">Aucun export disponible. Implémenter l'export backend pour activer cette section.</div>
      </div>
    </div>
  );
};

export default ReportsModule;

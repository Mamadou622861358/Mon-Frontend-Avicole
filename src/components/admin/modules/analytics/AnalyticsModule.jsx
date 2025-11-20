import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Calendar,
  Download
} from 'lucide-react';
import { adminService } from '../../../../../services/api';

const AnalyticsModule = () => {
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalSales: 0, totalOrders: 0, conversionRate: 0, topProducts: [], salesSeries: [], usersByRole: [], usersByRegion: [] });
  const [growth, setGrowth] = useState({ users: 0, sales: 0, orders: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
      const [salesResp, usersResp, productsResp] = await Promise.all([
        adminService.getSalesReport({ ...params, includeUnpaid: true }),
        adminService.getUsersReport(params),
        adminService.getProductsReport(params)
      ]);
      const salesData = salesResp?.data?.data?.salesData || [];
      const totals = Array.isArray(salesData) ? salesData.reduce((acc, it) => {
        acc.totalRevenue += Number(it.totalRevenue) || 0;
        acc.totalOrders += Number(it.totalOrders) || 0;
        return acc;
      }, { totalRevenue: 0, totalOrders: 0 }) : { totalRevenue: 0, totalOrders: 0 };
      const userGrowth = usersResp?.data?.data?.userGrowth || [];
      const usersByRole = usersResp?.data?.data?.usersByRole || [];
      const usersByRegion = usersResp?.data?.data?.usersByRegion || [];
      const totalUsers = Array.isArray(userGrowth) ? userGrowth.reduce((s, u) => s + (Number(u.newUsers) || 0), 0) : 0;
      const products = productsResp?.data?.data || [];
      const topProducts = Array.isArray(products)
        ? products
            .slice()
            .sort((a, b) => (Number(b.quantitySold || 0) - Number(a.quantitySold || 0)))
            .slice(0, 3)
            .map(p => ({ name: p.name || '—', sales: Number(p.quantitySold) || 0 }))
        : [];
      // Compute previous period for growth rates
      const durationMs = endDate.getTime() - startDate.getTime();
      const prevStart = new Date(startDate.getTime() - durationMs);
      const prevEnd = new Date(startDate.getTime() - 1);
      const prevParams = { startDate: prevStart.toISOString(), endDate: prevEnd.toISOString() };
      const [prevSalesResp, prevUsersResp] = await Promise.all([
        adminService.getSalesReport({ ...prevParams, includeUnpaid: true }),
        adminService.getUsersReport(prevParams),
      ]);
      const prevSalesData = prevSalesResp?.data?.data?.salesData || [];
      const prevTotals = Array.isArray(prevSalesData) ? prevSalesData.reduce((acc, it) => {
        acc.totalRevenue += Number(it.totalRevenue) || 0;
        acc.totalOrders += Number(it.totalOrders) || 0;
        return acc;
      }, { totalRevenue: 0, totalOrders: 0 }) : { totalRevenue: 0, totalOrders: 0 };
      const prevUserGrowth = prevUsersResp?.data?.data?.userGrowth || [];
      const prevTotalUsers = Array.isArray(prevUserGrowth) ? prevUserGrowth.reduce((s, u) => s + (Number(u.newUsers) || 0), 0) : 0;

      const salesGrowth = prevTotals.totalRevenue > 0 ? ((totals.totalRevenue - prevTotals.totalRevenue) / prevTotals.totalRevenue) * 100 : 0;
      const ordersGrowth = prevTotals.totalOrders > 0 ? ((totals.totalOrders - prevTotals.totalOrders) / prevTotals.totalOrders) * 100 : 0;
      const usersGrowth = prevTotalUsers > 0 ? ((totalUsers - prevTotalUsers) / prevTotalUsers) * 100 : 0;

      const salesSeries = Array.isArray(salesData)
        ? salesData.map(it => ({
            label: it._id?.day ? `${it._id.day}/${it._id.month}` : (it._id?.month ? `${it._id.month}/${it._id.year}` : `${it._id?.year||''}`),
            revenue: Number(it.totalRevenue) || 0,
            orders: Number(it.totalOrders) || 0,
          }))
        : [];

      setAnalytics({
        totalUsers,
        totalSales: totals.totalRevenue,
        totalOrders: totals.totalOrders,
        conversionRate: 0,
        topProducts,
        salesSeries,
        usersByRole,
        usersByRegion,
      });
      setGrowth({ users: usersGrowth, sales: salesGrowth, orders: ordersGrowth });
    } catch (e) {
      setError("Impossible de charger les analyses.");
      setAnalytics({ totalUsers: 0, totalSales: 0, totalOrders: 0, conversionRate: 0, topProducts: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement des analyses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded p-4 text-sm text-red-700">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analyses Avancées</h1>
          <p className="text-sm sm:text-base text-gray-600">Analyses détaillées des performances</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2">
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
          <div className="flex items-center space-x-2">
            <button onClick={fetchAnalytics} className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
              Actualiser
            </button>
            <button
              onClick={() => {
                const data = {
                  period: { startDate, endDate },
                  analytics,
                  growth
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics_${startDate.toISOString().slice(0,10)}_${endDate.toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(()=>URL.revokeObjectURL(url), 60000);
              }}
              className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Exporter JSON</span>
              <span className="sm:hidden">JSON</span>
            </button>
            <button
              onClick={() => {
                const rows = [
                  ['Metric','Value'],
                  ['Total Users', analytics.totalUsers],
                  ['Total Sales', analytics.totalSales],
                  ['Total Orders', analytics.totalOrders],
                  ['Users Growth %', growth.users.toFixed(2)],
                  ['Sales Growth %', growth.sales.toFixed(2)],
                  ['Orders Growth %', growth.orders.toFixed(2)],
                ];
                const csv = rows.map(r => r.map(v => {
                  const s = String(v);
                  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
                }).join(';')).join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv; charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics_${startDate.toISOString().slice(0,10)}_${endDate.toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(()=>URL.revokeObjectURL(url), 60000);
              }}
              className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Exporter CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Utilisateurs</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{analytics.totalUsers?.toLocaleString()}</p>
              <p className={`text-xs ${growth.users>=0?'text-green-600':'text-red-600'}`}>{growth.users>=0?'+':''}{growth.users.toFixed(1)}% vs période précédente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Ventes</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{analytics.totalSales?.toLocaleString()} GNF</p>
              <p className={`text-xs ${growth.sales>=0?'text-green-600':'text-red-600'}`}>{growth.sales>=0?'+':''}{growth.sales.toFixed(1)}% vs période précédente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Commandes</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{analytics.totalOrders?.toLocaleString()}</p>
              <p className={`text-xs ${growth.orders>=0?'text-green-600':'text-red-600'}`}>{growth.orders>=0?'+':''}{growth.orders.toFixed(1)}% vs période précédente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Taux Conversion</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{analytics.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les Plus Vendus</h3>
        <div className="space-y-4">
          {analytics.topProducts?.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{product.name}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(product.sales / 234) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{product.sales}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segments Utilisateurs (rôle) et Répartition par région */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Utilisateurs par Rôle</h3>
          {analytics.usersByRole.length === 0 ? (
            <div className="text-sm text-gray-600">Aucune donnée.</div>
          ) : (
            <div className="space-y-2">
              {analytics.usersByRole.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800">{r._id || '—'}</span>
                  <span className="text-sm font-medium text-gray-900">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Utilisateurs par Région</h3>
          {analytics.usersByRegion.length === 0 ? (
            <div className="text-sm text-gray-600">Aucune donnée.</div>
          ) : (
            <div className="space-y-2">
              {analytics.usersByRegion.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800">{r._id || '—'}</span>
                  <span className="text-sm font-medium text-gray-900">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModule;

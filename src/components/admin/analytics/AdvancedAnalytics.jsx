import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'users', 'orders', 'products']);
  const [analyticsData, setAnalyticsData] = useState({});

  // Données simulées pour les analyses avancées
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Simulation du chargement des données
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = {
        overview: {
          totalRevenue: 125430,
          revenueGrowth: 12.5,
          totalUsers: 2847,
          userGrowth: 8.3,
          totalOrders: 1523,
          orderGrowth: -2.1,
          avgOrderValue: 82.4,
          avgOrderGrowth: 15.2
        },
        salesTrends: [
          { month: 'Jan', revenue: 18500, orders: 245, users: 189 },
          { month: 'Fév', revenue: 22300, orders: 298, users: 234 },
          { month: 'Mar', revenue: 19800, orders: 267, users: 201 },
          { month: 'Avr', revenue: 25600, orders: 342, users: 278 },
          { month: 'Mai', revenue: 28900, orders: 389, users: 312 },
          { month: 'Jun', revenue: 31200, orders: 421, users: 345 }
        ],
        productCategories: [
          { name: 'Poussins', value: 35, revenue: 43750, color: '#3B82F6' },
          { name: 'Poules pondeuses', value: 28, revenue: 35100, color: '#10B981' },
          { name: 'Alimentation', value: 22, revenue: 27600, color: '#F59E0B' },
          { name: 'Équipements', value: 10, revenue: 12550, color: '#EF4444' },
          { name: 'Accessoires', value: 5, revenue: 6275, color: '#8B5CF6' }
        ],
        topProducts: [
          { name: 'Poussins Brahma', sales: 234, revenue: 18720, growth: 23.5 },
          { name: 'Aliment croissance', sales: 189, revenue: 9450, growth: 12.8 },
          { name: 'Poules pondeuses ISA', sales: 156, revenue: 15600, growth: -5.2 },
          { name: 'Mangeoire automatique', sales: 89, revenue: 4450, growth: 34.7 },
          { name: 'Abreuvoir nipple', sales: 67, revenue: 2010, growth: 8.9 }
        ],
        userSegments: [
          { segment: 'Nouveaux clients', count: 892, percentage: 31.3, avgSpend: 67.5 },
          { segment: 'Clients réguliers', count: 1245, percentage: 43.7, avgSpend: 95.2 },
          { segment: 'Clients VIP', count: 456, percentage: 16.0, avgSpend: 185.7 },
          { segment: 'Clients inactifs', count: 254, percentage: 8.9, avgSpend: 23.1 }
        ],
        geographicData: [
          { region: 'Conakry', orders: 456, revenue: 45600, growth: 15.2 },
          { region: 'Kankan', orders: 234, revenue: 23400, growth: 8.7 },
          { region: 'Labé', orders: 189, revenue: 18900, growth: 12.3 },
          { region: 'N\'Zérékoré', orders: 167, revenue: 16700, growth: -3.4 },
          { region: 'Boké', orders: 145, revenue: 14500, growth: 22.1 }
        ],
        performanceMetrics: {
          conversionRate: 3.2,
          avgSessionDuration: 245,
          bounceRate: 42.1,
          customerRetention: 68.5,
          customerLifetimeValue: 287.5,
          churnRate: 12.3
        }
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const exportData = () => {
    const dataToExport = {
      dateRange,
      exportDate: new Date().toISOString(),
      data: analyticsData
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">Chargement des analyses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analyses Avancées</h1>
            <p className="text-gray-600">Tableau de bord analytique détaillé</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">Dernière année</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.overview?.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {getGrowthIcon(analyticsData.overview?.revenueGrowth || 0)}
            <span className={`ml-2 text-sm font-medium ${getGrowthColor(analyticsData.overview?.revenueGrowth || 0)}`}>
              {formatPercentage(analyticsData.overview?.revenueGrowth || 0)}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.overview?.totalUsers?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {getGrowthIcon(analyticsData.overview?.userGrowth || 0)}
            <span className={`ml-2 text-sm font-medium ${getGrowthColor(analyticsData.overview?.userGrowth || 0)}`}>
              {formatPercentage(analyticsData.overview?.userGrowth || 0)}
            </span>
            <span className="text-sm text-gray-500 ml-2">nouveaux utilisateurs</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.overview?.totalOrders?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {getGrowthIcon(analyticsData.overview?.orderGrowth || 0)}
            <span className={`ml-2 text-sm font-medium ${getGrowthColor(analyticsData.overview?.orderGrowth || 0)}`}>
              {formatPercentage(analyticsData.overview?.orderGrowth || 0)}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Panier moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.overview?.avgOrderValue || 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {getGrowthIcon(analyticsData.overview?.avgOrderGrowth || 0)}
            <span className={`ml-2 text-sm font-medium ${getGrowthColor(analyticsData.overview?.avgOrderGrowth || 0)}`}>
              {formatPercentage(analyticsData.overview?.avgOrderGrowth || 0)}
            </span>
            <span className="text-sm text-gray-500 ml-2">par commande</span>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendances des ventes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Ventes</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.salesTrends?.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '200px' }}>
                  <div
                    className="bg-blue-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                    style={{ height: `${(item.revenue / 35000) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                <span className="text-xs font-medium text-gray-900">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par catégories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par Catégorie</h3>
          <div className="space-y-4">
            {analyticsData.productCategories?.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{category.value}%</div>
                  <div className="text-xs text-gray-500">{formatCurrency(category.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Produits top performers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Produits les Plus Vendus</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ventes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chiffre d'affaires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Croissance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analyticsData.topProducts?.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Package className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sales} unités
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getGrowthIcon(product.growth)}
                      <span className={`ml-2 text-sm font-medium ${getGrowthColor(product.growth)}`}>
                        {formatPercentage(product.growth)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segments d'utilisateurs et géographie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Segments d'utilisateurs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segments d'Utilisateurs</h3>
          <div className="space-y-4">
            {analyticsData.userSegments?.map((segment, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{segment.segment}</span>
                  <span className="text-sm text-gray-500">{segment.percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{segment.count} utilisateurs</span>
                  <span className="text-xs font-medium text-gray-900">
                    Moy: {formatCurrency(segment.avgSpend)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition géographique */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par Région</h3>
          <div className="space-y-4">
            {analyticsData.geographicData?.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{region.region}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{region.orders} commandes</div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">{formatCurrency(region.revenue)}</span>
                    <span className={`text-xs font-medium ${getGrowthColor(region.growth)}`}>
                      {formatPercentage(region.growth)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Métriques de Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.performanceMetrics?.conversionRate}%
              </div>
              <div className="text-sm text-gray-600">Taux de conversion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.performanceMetrics?.avgSessionDuration}s
              </div>
              <div className="text-sm text-gray-600">Durée de session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.performanceMetrics?.bounceRate}%
              </div>
              <div className="text-sm text-gray-600">Taux de rebond</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.performanceMetrics?.customerRetention}%
              </div>
              <div className="text-sm text-gray-600">Rétention client</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {formatCurrency(analyticsData.performanceMetrics?.customerLifetimeValue || 0)}
              </div>
              <div className="text-sm text-gray-600">LTV client</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analyticsData.performanceMetrics?.churnRate}%
              </div>
              <div className="text-sm text-gray-600">Taux d'attrition</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

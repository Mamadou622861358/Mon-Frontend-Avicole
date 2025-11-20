import { DollarSign, Eye, Package, ShoppingCart, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../../../../services/api";
import ErrorMessage from "../../../common/ErrorMessage";
import LoadingSpinner from "../../../common/LoadingSpinner";

const DashboardOverview = () => {
  const [overview, setOverview] = useState(null);
  const [salesEvolution, setSalesEvolution] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [integrity, setIntegrity] = useState(null);
  const [period, setPeriod] = useState("7d");
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [topClients, setTopClients] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const navigate = useNavigate();
  const refreshIntegrity = async () => {
    try {
      const res = await adminService.getIntegritySummary();
      setIntegrity(res.data || null);
    } catch {}
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getDashboardStats({ period });
        const payload = res?.data?.data || {};
        setOverview(payload.overview || null);
        setSalesEvolution(
          Array.isArray(payload.salesEvolution) ? payload.salesEvolution : []
        );
        setTopProducts(
          Array.isArray(payload.topProducts) ? payload.topProducts : []
        );
        setOrdersByStatus(payload.ordersByStatus || {});
        setTopClients(
          Array.isArray(payload.topClients) ? payload.topClients : []
        );
        setSalesByCategory(
          Array.isArray(payload.salesByCategory) ? payload.salesByCategory : []
        );
        // Fetch integrity in parallel
        try {
          await refreshIntegrity();
        } catch {}
      } catch (e) {
        setError("Impossible de charger les statistiques du tableau de bord");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
    const id = setInterval(() => {
      refreshIntegrity();
    }, 30000);
    return () => clearInterval(id);
  }, [period]);

  const handleDetailedReport = () => setShowDetailedReport(true);
  const generateDetailedReport = () => {
    // Rapport uniquement à partir des données réelles
    const lines = [];
    lines.push("RAPPORT DÉTAILLÉ - GUINÉE AVICOLE");
    lines.push(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`);
    lines.push("");
    if (overview) {
      lines.push("STATISTIQUES GÉNÉRALES");
      lines.push(`• Utilisateurs totaux: ${overview.totalUsers || 0}`);
      lines.push(`• Commandes totales: ${overview.totalOrders || 0}`);
      lines.push(`• Produits disponibles: ${overview.totalProducts || 0}`);
      lines.push(
        `• Chiffre d'affaires: ${(overview.revenue || 0).toLocaleString(
          "fr-FR"
        )} GNF`
      );
      lines.push("");
    }
    if (Array.isArray(topProducts) && topProducts.length) {
      lines.push("TOP PRODUITS");
      topProducts
        .slice(0, 10)
        .forEach((p, i) =>
          lines.push(`${i + 1}. ${p.name} — vendus: ${p.totalSold}`)
        );
      lines.push("");
    }
    if (Array.isArray(salesEvolution) && salesEvolution.length) {
      lines.push("ÉVOLUTION DES VENTES (revenu par jour)");
      salesEvolution.forEach((d) =>
        lines.push(`• ${JSON.stringify(d._id)} — ${d.revenue}`)
      );
      lines.push("");
    }
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-detaille-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDetailedReport(false);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {(value ?? 0).toLocaleString()}
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner text="Chargement du tableau de bord..." />;
  }

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tableau de Bord
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Vue d'ensemble de votre plateforme GuinéeAvicole
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm"
            title="Période des statistiques"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
          </select>
          <button
            onClick={handleDetailedReport}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Rapport détaillé</span>
            <span className="sm:hidden">Rapport</span>
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Utilisateurs Total"
          value={overview?.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Produits"
          value={overview?.totalProducts}
          icon={Package}
          color="bg-green-500"
        />
        <StatCard
          title="Commandes"
          value={overview?.totalOrders}
          icon={ShoppingCart}
          color="bg-purple-500"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={overview?.revenue}
          icon={DollarSign}
          color="bg-orange-500"
        />
      </div>

      {/* KPI additionnel: taux de conversion (réel) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Taux de conversion
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {(overview?.conversionRate ?? 0).toString()}%
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Livrées / Total commandes
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des ventes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des Ventes
          </h3>
          <div className="h-64 min-h-[16rem] flex items-end justify-between space-x-2">
            {(() => {
              const maxRevenue = Math.max(
                1,
                ...salesEvolution.map((d) => d.revenue || 0)
              );
              return salesEvolution.map((d, idx) => {
                const height = Math.round(
                  ((d.revenue || 0) / maxRevenue) * 100
                );
                const label = `${d._id?.day || ""}/${d._id?.month || ""}`;
                return (
                  <div
                    key={`${label}-${idx}`}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{label}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
        {/* Commandes par statut (réel) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Commandes par Statut
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">En attente</span>
              <span className="font-semibold text-gray-900">
                {ordersByStatus?.pending ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">En traitement</span>
              <span className="font-semibold text-gray-900">
                {ordersByStatus?.processing ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expédiées</span>
              <span className="font-semibold text-gray-900">
                {ordersByStatus?.shipped ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Livrées</span>
              <span className="font-semibold text-gray-900">
                {ordersByStatus?.delivered ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Annulées</span>
              <span className="font-semibold text-gray-900">
                {ordersByStatus?.cancelled ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques supplémentaires (réelles uniquement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-3">Top Produits</h4>
          <div className="space-y-3">
            {topProducts.length === 0 && (
              <div className="text-sm text-gray-500">
                Aucune donnée disponible.
              </div>
            )}
            {topProducts.slice(0, 10).map((p, index) => (
              <div
                key={p._id || p.name || index}
                className="flex items-center justify-between gap-2"
              >
                <span
                  className="text-sm text-gray-700 truncate max-w-[60%]"
                  title={p.name}
                >
                  {p.name}
                </span>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  {p.totalSold}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-3">Top Clients</h4>
          <div className="space-y-3">
            {topClients.length === 0 && (
              <div className="text-sm text-gray-500">
                Aucune donnée disponible.
              </div>
            )}
            {topClients.map((c, idx) => (
              <div
                key={c.customer || idx}
                className="flex items-center justify-between gap-2"
              >
                <span
                  className="text-sm text-gray-700 truncate max-w-[45%]"
                  title={c.customer}
                >
                  {c.customer}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {c.orders} cmd
                </span>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  {(c.amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition des ventes par catégorie (réel) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-3">Ventes par Catégorie</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {salesByCategory.length === 0 && (
            <div className="text-sm text-gray-500">
              Aucune donnée disponible.
            </div>
          )}
          {salesByCategory.map((cat, idx) => (
            <div
              key={cat.category || idx}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700">{cat.category}</span>
              <span className="text-gray-500 mr-3">{cat.quantity} pcs</span>
              <span className="font-medium text-gray-900">
                {(cat.revenue || 0).toLocaleString()} GNF
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmation pour le rapport détaillé */}
      {showDetailedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Générer un rapport détaillé
            </h3>
            <p className="text-gray-600 mb-6">
              Voulez-vous télécharger un rapport détaillé des statistiques
              actuelles de la plateforme ?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={generateDetailedReport}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Télécharger
              </button>
              <button
                onClick={() => setShowDetailedReport(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;

import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminBreadcrumb from "./layout/AdminBreadcrumb";
import AdminHeader from "./layout/AdminHeader";
import AdminSidebar from "./layout/AdminSidebar";

// Import des modules admin
import AnalyticsModule from "./modules/analytics/AnalyticsModule";
import AnimalsModule from "./modules/animals/AnimalsModule";
import BackupModule from "./modules/backup/BackupModule";
import CategoriesModule from "./modules/categories/CategoriesModule";
import ChatModule from "./modules/chat/ChatModule";
import CollectionsModule from "./modules/collections/CollectionsModule";
import DashboardOverview from "./modules/dashboard/DashboardOverview";
import DeliveriesModule from "./modules/deliveries/DeliveriesModule";
import DocumentationModule from "./modules/documentation/DocumentationModule";
import FarmsModule from "./modules/farms/FarmsModule";
import ForumsModule from "./modules/forums/ForumsModule";
import NotificationsLive from "./modules/notifications/NotificationsLive";
import NotificationsModule from "./modules/notifications/NotificationsModule";
import OrdersModule from "./modules/orders/OrdersModule";
import ProductsModule from "./modules/products/ProductsModule";
import QuotesModule from "./modules/quotes/QuotesModule";
import ReportsModule from "./modules/reports/ReportsModule";
import ReviewsModule from "./modules/reviews/ReviewsModule";
import SettingsModule from "./modules/settings/SettingsModule";
import UsersModule from "./modules/users/UsersModule";
import ServicesModule from "./modules/services/ServicesModule";

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentModule, setCurrentModule] = useState("dashboard");
  const { user } = useAuth();
  const location = useLocation();

  // Mise à jour du module actuel basé sur l'URL
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const module = pathSegments[2] || "dashboard";
    setCurrentModule(module);
  }, [location]);

  // Configuration des modules avec permissions
  const adminModules = {
    dashboard: {
      component: DashboardOverview,
      title: "Tableau de Bord",
      permissions: ["admin", "super_admin"],
      icon: "BarChart3",
    },
    users: {
      component: UsersModule,
      title: "Gestion des Utilisateurs",
      permissions: ["admin", "super_admin"],
      icon: "Users",
    },
    products: {
      component: ProductsModule,
      title: "Gestion des Produits",
      permissions: ["admin", "super_admin", "product_manager"],
      icon: "Package",
    },
    services: {
      component: ServicesModule,
      title: "Gestion des Services",
      permissions: ["admin", "super_admin", "product_manager"],
      icon: "Book",
    },
    categories: {
      component: CategoriesModule,
      title: "Gestion des Catégories",
      permissions: ["admin", "super_admin", "product_manager"],
      icon: "FileText",
    },
    collections: {
      component: CollectionsModule,
      title: "Collections produits",
      permissions: ["admin", "super_admin", "product_manager"],
      icon: "FileText",
    },
    farms: {
      component: FarmsModule,
      title: "Gestion des Fermes",
      permissions: ["admin", "super_admin", "farm_manager"],
      icon: "Home",
    },
    orders: {
      component: OrdersModule,
      title: "Gestion des Commandes",
      permissions: ["admin", "super_admin", "order_manager"],
      icon: "ShoppingCart",
    },
    forums: {
      component: ForumsModule,
      title: "Gestion des Forums",
      permissions: ["admin", "super_admin", "content_moderator"],
      icon: "MessageSquare",
    },
    animals: {
      component: AnimalsModule,
      title: "Gestion des Animaux",
      permissions: ["admin", "super_admin", "farm_manager"],
      icon: "Bird",
    },
    deliveries: {
      component: DeliveriesModule,
      title: "Gestion des Livraisons",
      permissions: ["admin", "super_admin", "delivery_manager"],
      icon: "Truck",
    },
    reviews: {
      component: ReviewsModule,
      title: "Gestion des Avis",
      permissions: ["admin", "super_admin", "content_moderator"],
      icon: "Star",
    },
    notifications: {
      component: NotificationsModule,
      title: "Notifications",
      permissions: ["admin", "super_admin"],
      icon: "Bell",
    },
    "notifications-live": {
      component: NotificationsLive,
      title: "Notifications Live",
      permissions: ["admin", "super_admin", "support_agent"],
      icon: "Bell",
    },
    quotes: {
      component: QuotesModule,
      title: "Devis",
      permissions: ["admin", "super_admin", "support_agent"],
      icon: "FileText",
    },
    reports: {
      component: ReportsModule,
      title: "Rapports",
      permissions: ["admin", "super_admin"],
      icon: "FileText",
    },
    settings: {
      component: SettingsModule,
      title: "Paramètres",
      permissions: ["super_admin"],
      icon: "Settings",
    },
    documentation: {
      component: DocumentationModule,
      title: "Documentation",
      permissions: [
        "admin",
        "super_admin",
        "product_manager",
        "farm_manager",
        "order_manager",
        "content_moderator",
        "delivery_manager",
      ],
      icon: "Book",
    },
    backup: {
      component: BackupModule,
      title: "Sauvegarde",
      permissions: ["super_admin"],
      icon: "Database",
    },
    analytics: {
      component: AnalyticsModule,
      title: "Analyses Avancées",
      permissions: ["admin", "super_admin"],
      icon: "TrendingUp",
    },
    chat: {
      component: ChatModule,
      title: "Chat Support",
      permissions: ["admin", "super_admin", "support_agent"],
      icon: "MessageCircle",
    },
  };

  // Vérification des permissions
  const hasPermission = (modulePermissions) => {
    if (!user || !user.role) return false;
    return modulePermissions.includes(user.role);
  };

  // Filtrer les modules selon les permissions
  const availableModules = Object.entries(adminModules).filter(
    ([key, module]) => hasPermission(module.permissions)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        modules={availableModules}
        currentModule={currentModule}
      />

      {/* Contenu principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Header */}
        <AdminHeader
          user={user}
          currentModule={adminModules[currentModule]}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Breadcrumb */}
        <AdminBreadcrumb currentModule={currentModule} />

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/admin/dashboard" replace />}
              />

              {availableModules.map(([key, module]) => {
                const Component = module.component;
                return <Route key={key} path={key} element={<Component />} />;
              })}

              {/* Route par défaut */}
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>© 2024 GuinéeAvicole. Tous droits réservés.</span>
            <span>Version 2.0.0</span>
          </div>
        </footer>
      </div>

      {/* Overlay pour mobile */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

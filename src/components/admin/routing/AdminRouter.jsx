import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import AdminRouteGuard from './AdminRouteGuard';
import NotFound from './NotFound';
import { RefreshCw } from 'lucide-react';

// Lazy loading des composants pour optimiser les performances
const DashboardStats = React.lazy(() => import('../stats/DashboardStats'));
const UsersList = React.lazy(() => import('../users/UsersList'));
const ProductsList = React.lazy(() => import('../products/ProductsList'));
const FarmsList = React.lazy(() => import('../farms/FarmsList'));
const OrdersList = React.lazy(() => import('../orders/OrdersList'));
const ForumsManagement = React.lazy(() => import('../forums/ForumsManagement'));
const AnimalsManagement = React.lazy(() => import('../animals/AnimalsManagement'));
const DeliveriesManagement = React.lazy(() => import('../deliveries/DeliveriesManagement'));
const ReviewsManagement = React.lazy(() => import('../reviews/ReviewsManagement'));
const NotificationsManagement = React.lazy(() => import('../notifications/NotificationsManagement'));
const Reports = React.lazy(() => import('../reports/Reports'));
const Settings = React.lazy(() => import('../settings/Settings'));
const Documentation = React.lazy(() => import('../documentation/Documentation'));
const BackupManagement = React.lazy(() => import('../backup/BackupManagement'));
const AdvancedAnalytics = React.lazy(() => import('../analytics/AdvancedAnalytics'));
const LiveChat = React.lazy(() => import('../chat/LiveChat'));
const FarmContactsInbox = React.lazy(() => import('../farms/FarmContactsInbox'));
const QuotesModule = React.lazy(() => import('../modules/quotes/QuotesModule'));
const CollectionsModule = React.lazy(() => import('../modules/collections/CollectionsModule'));
const ServicesModule = React.lazy(() => import('../modules/services/ServicesModule'));

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
    <span className="ml-3 text-gray-600">Chargement...</span>
  </div>
);

// Configuration des routes avec leurs permissions
const adminRoutes = [
  {
    path: 'dashboard',
    component: DashboardStats,
    permissions: ['admin', 'super_admin'],
    title: 'Tableau de bord'
  },
  {
    path: 'users',
    component: UsersList,
    permissions: ['admin', 'super_admin'],
    title: 'Gestion des utilisateurs'
  },
  {
    path: 'products',
    component: ProductsList,
    permissions: ['admin', 'super_admin', 'product_manager'],
    title: 'Gestion des produits'
  },
  {
    path: 'farms',
    component: FarmsList,
    permissions: ['admin', 'super_admin', 'farm_manager'],
    title: 'Gestion des fermes'
  },
  {
    path: 'orders',
    component: OrdersList,
    permissions: ['admin', 'super_admin', 'order_manager'],
    title: 'Gestion des commandes'
  },
  {
    path: 'forums',
    component: ForumsManagement,
    permissions: ['admin', 'super_admin', 'content_moderator'],
    title: 'Gestion des forums'
  },
  {
    path: 'animals',
    component: AnimalsManagement,
    permissions: ['admin', 'super_admin', 'farm_manager'],
    title: 'Gestion des animaux'
  },
  {
    path: 'deliveries',
    component: DeliveriesManagement,
    permissions: ['admin', 'super_admin', 'delivery_manager'],
    title: 'Gestion des livraisons'
  },
  {
    path: 'reviews',
    component: ReviewsManagement,
    permissions: ['admin', 'super_admin', 'content_moderator'],
    title: 'Gestion des avis'
  },
  {
    path: 'quotes',
    component: QuotesModule,
    permissions: ['admin', 'super_admin'],
    title: 'Gestion des devis'
  },
  {
    path: 'collections',
    component: CollectionsModule,
    permissions: ['admin', 'super_admin', 'product_manager'],
    title: 'Collections produits'
  },
  {
    path: 'services',
    component: ServicesModule,
    permissions: ['admin', 'super_admin', 'product_manager'],
    title: 'Gestion des services'
  },
  {
    path: 'notifications',
    component: NotificationsManagement,
    permissions: ['admin', 'super_admin'],
    title: 'Gestion des notifications'
  },
  {
    path: 'reports',
    component: Reports,
    permissions: ['admin', 'super_admin'],
    title: 'Rapports et analyses'
  },
  {
    path: 'settings',
    component: Settings,
    permissions: ['super_admin'],
    title: 'Paramètres système'
  },
  {
    path: 'documentation',
    component: Documentation,
    permissions: ['admin', 'super_admin', 'product_manager', 'farm_manager', 'order_manager', 'content_moderator', 'delivery_manager'],
    title: 'Documentation'
  },
  {
    path: 'backup',
    component: BackupManagement,
    permissions: ['super_admin'],
    title: 'Sauvegarde et export'
  },
  {
    path: 'analytics',
    component: AdvancedAnalytics,
    permissions: ['admin', 'super_admin'],
    title: 'Analyses avancées'
  },
  {
    path: 'chat',
    component: LiveChat,
    permissions: ['admin', 'super_admin', 'support_agent'],
    title: 'Chat support'
  },
  {
    path: 'farm-contacts',
    component: FarmContactsInbox,
    permissions: ['admin', 'super_admin', 'support_agent', 'farm_manager'],
    title: 'Messages Fermes'
  }
];

const AdminRouter = () => {
  return (
    <AdminRouteGuard requiredPermissions={['admin', 'super_admin', 'product_manager', 'farm_manager', 'order_manager', 'content_moderator', 'delivery_manager', 'support_agent']}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Redirection par défaut vers le dashboard */}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          
          {/* Routes admin avec protection */}
          {adminRoutes.map((route) => {
            const Component = route.component;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <AdminRouteGuard requiredPermissions={route.permissions}>
                    <Component />
                  </AdminRouteGuard>
                }
              />
            );
          })}
          
          {/* Route 404 pour les pages admin non trouvées */}
          <Route path="*" element={<NotFound isAdminRoute={true} />} />
        </Routes>
      </Suspense>
    </AdminRouteGuard>
  );
};

export default AdminRouter;

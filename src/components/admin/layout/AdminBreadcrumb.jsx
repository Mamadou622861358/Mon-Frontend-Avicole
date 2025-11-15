import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const AdminBreadcrumb = ({ currentModule }) => {
  const moduleLabels = {
    dashboard: 'Tableau de Bord',
    users: 'Utilisateurs',
    products: 'Produits',
    farms: 'Fermes',
    orders: 'Commandes',
    forums: 'Forums',
    animals: 'Animaux',
    deliveries: 'Livraisons',
    reviews: 'Avis Clients',
    notifications: 'Notifications',
    reports: 'Rapports',
    settings: 'Paramètres',
    documentation: 'Documentation',
    backup: 'Sauvegarde',
    analytics: 'Analyses Avancées',
    chat: 'Chat Support'
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm">
        <Link
          to="/"
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        
        <ChevronRight className="w-4 h-4 text-gray-400" />
        
        <Link
          to="/admin/dashboard"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Administration
        </Link>
        
        {currentModule && currentModule !== 'dashboard' && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">
              {moduleLabels[currentModule] || currentModule}
            </span>
          </>
        )}
      </nav>
    </div>
  );
};

export default AdminBreadcrumb;

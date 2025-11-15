import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Mapping des routes vers des labels lisibles
const ROUTE_LABELS = {
  'admin': 'Administration',
  'dashboard': 'Tableau de bord',
  'users': 'Utilisateurs',
  'products': 'Produits',
  'farms': 'Fermes',
  'orders': 'Commandes',
  'forums': 'Forums',
  'animals': 'Animaux',
  'deliveries': 'Livraisons',
  'reviews': 'Avis Clients',
  'notifications': 'Notifications',
  'reports': 'Rapports',
  'settings': 'Paramètres',
  'documentation': 'Documentation',
  'backup': 'Sauvegarde',
  'analytics': 'Analyses Avancées',
  'chat': 'Chat Support',
  'farm-management': 'Gestion Ferme',
  'product-management': 'Gestion Produit',
  'stats': 'Statistiques'
};

// Icônes pour chaque section
const ROUTE_ICONS = {
  'dashboard': '📊',
  'users': '👥',
  'products': '📦',
  'farms': '🏡',
  'orders': '🛒',
  'forums': '💬',
  'animals': '🐔',
  'deliveries': '🚚',
  'reviews': '⭐',
  'notifications': '🔔',
  'reports': '📈',
  'settings': '⚙️',
  'documentation': '📚',
  'backup': '💾',
  'analytics': '📊',
  'chat': '💬'
};

const Breadcrumb = ({ className = '' }) => {
  const location = useLocation();
  
  // Diviser le chemin en segments
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  
  // Créer les éléments de breadcrumb
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const icon = ROUTE_ICONS[segment];
    const isLast = index === pathSegments.length - 1;
    
    return {
      path,
      label,
      icon,
      isLast
    };
  });

  // Ne pas afficher le breadcrumb si on est à la racine
  if (pathSegments.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      {/* Lien vers l'accueil */}
      <Link
        to="/"
        className="flex items-center hover:text-gray-900 transition-colors"
        title="Accueil"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      <ChevronRight className="w-4 h-4 text-gray-400" />
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {item.isLast ? (
            <span className="flex items-center font-medium text-gray-900">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="flex items-center hover:text-gray-900 transition-colors"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </Link>
          )}
          
          {!item.isLast && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

// Définition des permissions par route
const ROUTE_PERMISSIONS = {
  '/admin/dashboard': ['admin', 'super_admin'],
  '/admin/users': ['admin', 'super_admin'],
  '/admin/products': ['admin', 'super_admin', 'product_manager'],
  '/admin/farms': ['admin', 'super_admin', 'farm_manager'],
  '/admin/orders': ['admin', 'super_admin', 'order_manager'],
  '/admin/forums': ['admin', 'super_admin', 'content_moderator'],
  '/admin/animals': ['admin', 'super_admin', 'farm_manager'],
  '/admin/deliveries': ['admin', 'super_admin', 'delivery_manager'],
  '/admin/reviews': ['admin', 'super_admin', 'content_moderator'],
  '/admin/notifications': ['admin', 'super_admin'],
  '/admin/reports': ['admin', 'super_admin'],
  '/admin/settings': ['super_admin'],
  '/admin/documentation': ['admin', 'super_admin', 'product_manager', 'farm_manager', 'order_manager', 'content_moderator', 'delivery_manager'],
  '/admin/backup': ['super_admin'],
  '/admin/analytics': ['admin', 'super_admin'],
  '/admin/chat': ['admin', 'super_admin', 'support_agent']
};

// Niveaux de permissions hiérarchiques
const PERMISSION_HIERARCHY = {
  'super_admin': 10,
  'admin': 8,
  'product_manager': 6,
  'farm_manager': 6,
  'order_manager': 6,
  'delivery_manager': 6,
  'content_moderator': 5,
  'support_agent': 4,
  'user': 1
};

const AdminRouteGuard = ({ children, requiredPermissions = [], minPermissionLevel = 0 }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Vérification des permissions...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirection si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des permissions pour la route actuelle
  const currentRoutePermissions = ROUTE_PERMISSIONS[location.pathname] || [];
  const userPermissions = user.permissions || [];
  const userRoles = user.roles || [user.role];
  const userPermissionLevel = Math.max(...userRoles.map(role => PERMISSION_HIERARCHY[role] || 0));

  // Fonction pour vérifier si l'utilisateur a les permissions requises
  const hasRequiredPermissions = () => {
    // Vérification du niveau de permission minimum
    if (minPermissionLevel > 0 && userPermissionLevel < minPermissionLevel) {
      return false;
    }

    // Vérification des permissions spécifiques requises
    if (requiredPermissions.length > 0) {
      return requiredPermissions.some(permission => 
        userPermissions.includes(permission) || userRoles.includes(permission)
      );
    }

    // Vérification des permissions pour la route actuelle
    if (currentRoutePermissions.length > 0) {
      return currentRoutePermissions.some(permission => 
        userPermissions.includes(permission) || userRoles.includes(permission)
      );
    }

    // Par défaut, autoriser l'accès si aucune permission spécifique n'est requise
    return true;
  };

  // Vérification des permissions
  if (!hasRequiredPermissions()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Refusé</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <Shield className="w-4 h-4 mr-2" />
                <span className="font-medium">Vos permissions actuelles :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {userRoles.map((role, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {role}
                  </span>
                ))}
              </div>
              {currentRoutePermissions.length > 0 && (
                <>
                  <div className="flex items-center text-sm text-gray-700 mt-3 mb-2">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Permissions requises :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentRoutePermissions.map((permission, index) => (
                      <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {permission}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage du contenu si les permissions sont valides
  return children;
};

export default AdminRouteGuard;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = ({ isAdminRoute = false }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-300 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page non trouvée</h2>
          
          <p className="text-gray-600 mb-6">
            {isAdminRoute 
              ? "La page d'administration que vous recherchez n'existe pas ou a été déplacée."
              : "La page que vous recherchez n'existe pas ou a été déplacée."
            }
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Suggestions :</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vérifiez l'URL dans la barre d'adresse</li>
              <li>• Utilisez le menu de navigation</li>
              <li>• Retournez à la page précédente</li>
              {isAdminRoute && <li>• Consultez la documentation admin</li>}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button>
            
            {isAdminRoute ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Tableau de bord
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Link>
            )}
          </div>

          {isAdminRoute && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Pages admin disponibles :</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800">Tableau de bord</Link>
                <Link to="/admin/users" className="text-blue-600 hover:text-blue-800">Utilisateurs</Link>
                <Link to="/admin/products" className="text-blue-600 hover:text-blue-800">Produits</Link>
                <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800">Commandes</Link>
                <Link to="/admin/farms" className="text-blue-600 hover:text-blue-800">Fermes</Link>
                <Link to="/admin/reports" className="text-blue-600 hover:text-blue-800">Rapports</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;

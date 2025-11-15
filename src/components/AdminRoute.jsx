import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur n'est pas administrateur, rediriger vers la page d'accueil
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est administrateur, afficher le contenu protégé
  return children;
};

export default AdminRoute;

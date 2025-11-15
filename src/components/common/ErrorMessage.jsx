import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '',
  variant = 'default' // 'default', 'inline', 'toast'
}) => {
  if (!error) return null;

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.response?.data?.message) return error.response.data.message;
    return 'Une erreur inattendue est survenue';
  };

  const getErrorType = (error) => {
    if (error.type) return error.type;
    if (error.response?.status === 401) return 'auth';
    if (error.response?.status === 403) return 'permission';
    if (error.response?.status === 404) return 'notFound';
    if (error.response?.status >= 500) return 'server';
    if (error.code === 'NETWORK_ERROR') return 'network';
    return 'unknown';
  };

  const errorMessage = getErrorMessage(error);
  const errorType = getErrorType(error);

  const getErrorIcon = () => {
    switch (errorType) {
      case 'auth':
      case 'permission':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'network':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'network':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'auth':
      case 'permission':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  if (variant === 'toast') {
    return (
      <div className={`fixed top-4 right-4 max-w-sm w-full bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4 z-50 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getErrorIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Erreur</p>
            <p className="text-sm text-gray-700 mt-1">{errorMessage}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {onRetry && (
          <div className="mt-3">
            <button
              onClick={onRetry}
              className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Réessayer
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 text-sm text-red-600 ${className}`}>
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${getErrorColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {errorType === 'network' ? 'Problème de connexion' : 
             errorType === 'auth' ? 'Authentification requise' :
             errorType === 'permission' ? 'Accès refusé' :
             'Erreur'}
          </h3>
          <p className="text-sm mt-1">{errorMessage}</p>
          
          {(errorType === 'auth' || errorType === 'permission') && (
            <p className="text-xs mt-2">
              Veuillez vous reconnecter ou contacter l'administrateur.
            </p>
          )}
          
          {errorType === 'network' && (
            <p className="text-xs mt-2">
              Vérifiez votre connexion internet et réessayez.
            </p>
          )}
        </div>
        
        <div className="ml-4 flex space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm bg-white bg-opacity-75 px-3 py-1 rounded hover:bg-opacity-100 transition-colors flex items-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Réessayer
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;

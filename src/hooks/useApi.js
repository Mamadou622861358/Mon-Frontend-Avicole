import { useState, useCallback } from 'react';

// Gestionnaire d'erreurs local (temporaire)
const handleApiError = (error) => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'Erreur du serveur',
      status: error.response.status,
      type: 'server_error'
    };
  } else if (error.request) {
    return {
      message: 'Erreur de connexion au serveur',
      type: 'network_error'
    };
  } else {
    return {
      message: error.message || 'Erreur inconnue',
      type: 'unknown_error'
    };
  }
};

// Hook personnalisé pour les appels API avec gestion d'état
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunction(...args);
      return response.data;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      throw errorInfo;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { callApi, loading, error, clearError };
};

// Hook spécialisé pour les opérations CRUD
export const useCrud = (service) => {
  const { callApi, loading, error, clearError } = useApi();
  const [data, setData] = useState([]);

  const fetchAll = useCallback(async (params = {}) => {
    try {
      const result = await callApi(service.getAll, params);
      setData(result.data || result);
      return result;
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      throw err;
    }
  }, [callApi, service]);

  const create = useCallback(async (itemData) => {
    try {
      const result = await callApi(service.create, itemData);
      setData(prev => [...prev, result.data || result]);
      return result;
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      throw err;
    }
  }, [callApi, service]);

  const update = useCallback(async (id, itemData) => {
    try {
      const result = await callApi(service.update, id, itemData);
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...(result.data || result) } : item
      ));
      return result;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      throw err;
    }
  }, [callApi, service]);

  const remove = useCallback(async (id) => {
    try {
      await callApi(service.delete, id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  }, [callApi, service]);

  return {
    data,
    setData,
    loading,
    error,
    clearError,
    fetchAll,
    create,
    update,
    remove
  };
};

export default useApi;

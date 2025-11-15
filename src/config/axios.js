import axios from 'axios';

// Configuration de base
const axiosConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1',
  timeout: 15000, // Augmenté à 15 secondes
  headers: {
    'Content-Type': 'application/json',
  },
};

// Création de l'instance Axios
const axiosInstance = axios.create(axiosConfig);

// Intercepteur de requête
axiosInstance.interceptors.request.use(
  (config) => {
    // Ajoute le token d'authentification si disponible
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse avec retry
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si la requête a déjà été retentée, on rejette l'erreur
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si c'est une erreur 500, on retente la requête
    if (error.response?.status === 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Attendre 1 seconde avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return axiosInstance(originalRequest);
    }

    // Si c'est une erreur 401 et qu'on a un refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axiosInstance.post('/auth/refresh-token', {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Met à jour le token dans les headers
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecte l'utilisateur
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

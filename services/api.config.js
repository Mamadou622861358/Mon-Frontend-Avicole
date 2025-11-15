import axiosInstance from '../config/axios';

// Configuration des endpoints
const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    me: '/auth/me',
    profile: '/auth/profile',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    base: '/users',
    byId: (id) => `/users/${id}`,
    toggleStatus: (id) => `/users/${id}/toggle-status`,
  },
  products: {
    base: '/products',
    byId: (id) => `/products/${id}`,
    images: (id) => `/products/${id}/images`,
  },
  orders: {
    base: '/orders',
    byId: (id) => `/orders/${id}`,
    status: (id) => `/orders/${id}/status`,
  },
  farms: {
    base: '/farms',
    byId: (id) => `/farms/${id}`,
    stats: (id) => `/farms/${id}/stats`,
  },
  forums: {
    base: '/forums',
    byId: (id) => `/forums/${id}`,
    category: (category) => `/forums/category/${category}`,
    search: '/forums/search',
    replies: (id) => `/forums/${id}/replies`,
    like: (id) => `/forums/${id}/like`,
  },
  // ... autres endpoints
};

// Création des services API
const createApiService = (baseEndpoint) => ({
  getAll: (params) => axiosInstance.get(baseEndpoint, { params }),
  getById: (id) => axiosInstance.get(`${baseEndpoint}/${id}`),
  create: (data) => axiosInstance.post(baseEndpoint, data),
  update: (id, data) => axiosInstance.put(`${baseEndpoint}/${id}`, data),
  delete: (id) => axiosInstance.delete(`${baseEndpoint}/${id}`),
});

// Export des services
export const api = {
  auth: {
    login: (credentials) => axiosInstance.post(endpoints.auth.login, credentials),
    register: (userData) => {
      if (userData instanceof FormData) {
        return axiosInstance.post(endpoints.auth.register, userData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return axiosInstance.post(endpoints.auth.register, userData);
    },
    logout: (refreshToken) => axiosInstance.post(endpoints.auth.logout, { refreshToken }),
    refreshToken: (refreshToken) => axiosInstance.post(endpoints.auth.refreshToken, { refreshToken }),
    getProfile: () => axiosInstance.get(endpoints.auth.me),
    updateProfile: (data) => axiosInstance.put(endpoints.auth.profile, data),
    forgotPassword: (email) => axiosInstance.post(endpoints.auth.forgotPassword, { email }),
    resetPassword: (data) => axiosInstance.post(endpoints.auth.resetPassword, data),
  },
  users: createApiService(endpoints.users.base),
  products: createApiService(endpoints.products.base),
  orders: createApiService(endpoints.orders.base),
  farms: createApiService(endpoints.farms.base),
  forums: createApiService(endpoints.forums.base),
  // ... autres services
};

export default api;

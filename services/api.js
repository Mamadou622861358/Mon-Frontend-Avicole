import axios from "axios";
import { useState } from "react";

// Configuration de base de l'API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configuration pour les APIs admin
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour adminApi
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
const responseInterceptor = (response) => response;
const errorInterceptor = async (error) => {
  const originalRequest = error.config;

  // Si l'erreur est 401 et qu'on n'a pas déjà tenté de rafraîchir le token
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );
        const { accessToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        adminApi.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      }
    } catch (refreshError) {
      // Si le refresh token échoue, déconnecter l'utilisateur
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

// Demandes de devis / réservations publiques
export const quoteService = {
  create: (payload) => api.post('/quotes', payload),
  getById: (id) => api.get(`/quotes/${id}`),
  getMine: () => api.get('/quotes/my'),
};

api.interceptors.response.use(responseInterceptor, errorInterceptor);
adminApi.interceptors.response.use(responseInterceptor, errorInterceptor);

// Services d'authentification
export const authService = {
  register: (userData) => {
    // Si userData est FormData, ne pas modifier les headers
    if (userData instanceof FormData) {
      return api.post("/auth/register", userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.post("/auth/register", userData);
  },
  login: (credentials) => api.post("/auth/login", credentials),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh-token", { refreshToken }),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  forgotPassword: (emailData) => api.post("/auth/forgot-password", emailData),
  resetPassword: (resetData) => api.post("/auth/reset-password", resetData),
};

// Services des produits
export const productService = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, imageData) => {
    const formData = new FormData();
    formData.append("image", imageData);
    return api.post(`/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Services des commandes
export const orderService = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post("/orders", orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Services des fermes
export const farmService = {
  getAll: (params) => api.get("/farms", { params }),
  getById: (id) => api.get(`/farms/${id}`),
  create: (farmData) => api.post("/farms", farmData),
  update: (id, farmData) => api.put(`/farms/${id}`, farmData),
  delete: (id) => api.delete(`/farms/${id}`),
  getStats: (id) => api.get(`/farms/${id}/stats`),
};

// Services des forums
export const forumService = {
  getAll: (params) => api.get("/forums", { params }),
  getById: (id, params) => api.get(`/forums/${id}` , params ? { params } : undefined),
  create: (forumData) => api.post("/forums", forumData),
  update: (id, forumData) => api.put(`/forums/${id}`, forumData),
  delete: (id) => api.delete(`/forums/${id}`),
  getByCategory: (category, params) =>
    api.get(`/forums/category/${category}`, { params }),
  search: (params) => api.get("/forums/search", { params }),
  addReply: (id, replyData) => api.post(`/forums/${id}/replies`, replyData),
  toggleLike: (id) => api.post(`/forums/${id}/like`),
};

// Services des utilisateurs
export const userService = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

// Services des animaux
export const animalService = {
  getAll: (params) => api.get("/animals", { params }),
  getById: (id) => api.get(`/animals/${id}`),
  create: (animalData) => api.post("/animals", animalData),
  update: (id, animalData) => api.put(`/animals/${id}`, animalData),
  delete: (id) => api.delete(`/animals/${id}`),
  getByFarm: (farmId, params) =>
    api.get(`/farms/${farmId}/animals`, { params }),
};

// Services des livraisons
export const deliveryService = {
  getAll: (params) => api.get("/deliveries", { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (deliveryData) => api.post("/deliveries", deliveryData),
  update: (id, deliveryData) => api.put(`/deliveries/${id}`, deliveryData),
  updateStatus: (id, status) =>
    api.patch(`/deliveries/${id}/status`, { status }),
  assignDriver: (id, driverId) =>
    api.patch(`/deliveries/${id}/driver`, { driverId }),
};

 

// Services (catalogue de services publics)
export const serviceService = {
  getAll: (params) => api.get("/services/industrial-projects", { params }),
  getById: (id) => api.get(`/services/industrial-projects/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post("/services/industrial-projects", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post("/services/industrial-projects", data);
  },
};

// Services des collections (catalogue)
export const collectionService = {
  // Public
  getAll: (params) => api.get("/collections", { params }),
  getByIdOrSlug: (idOrSlug) => api.get(`/collections/${idOrSlug}`),
  // Admin
  create: (payload) => api.post("/collections", payload),
  update: (id, payload) => api.put(`/collections/${id}`, payload),
  patch: (id, payload) => api.patch(`/collections/${id}`, payload),
  delete: (id) => api.delete(`/collections/${id}`),
};

// Services des notifications
export const notificationService = {
  getAll: (params) => api.get("/notifications", { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post("/notifications", notificationData),
  update: (id, notificationData) =>
    api.put(`/notifications/${id}`, notificationData),
  delete: (id) => api.delete(`/notifications/${id}`),
  send: (id) => api.post(`/notifications/${id}/send`),
  schedule: (id, scheduleData) =>
    api.post(`/notifications/${id}/schedule`, scheduleData),
};

// Services des paramètres
export const settingsService = {
  getSettings: () => api.get("/settings"),
  updateSettings: (settingsData) => api.put("/settings", settingsData),
  uploadLogo: (formData) => {
    return api.post("/settings/upload-logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadFavicon: (formData) => {
    return api.post("/settings/upload-favicon", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Services des rapports
export const reportService = {
  getSalesReport: (params) => api.get("/reports/sales", { params }),
  getProductsReport: (params) => api.get("/reports/products", { params }),
  getFarmsReport: (params) => api.get("/reports/farms", { params }),
  getAnalytics: (params) => api.get("/reports/analytics", { params }),
  exportReport: (type, params) =>
    api.get(`/reports/export/${type}`, {
      params,
      responseType: "blob",
    }),
};

// Services de sauvegarde
export const backupService = {
  getAll: (params) => api.get("/backups", { params }),
  create: (backupData) => api.post("/backups", backupData),
  restore: (id) => api.post(`/backups/${id}/restore`),
  delete: (id) => api.delete(`/backups/${id}`),
  download: (id) =>
    api.get(`/backups/${id}/download`, { responseType: "blob" }),
};

// Services de chat
export const chatService = {
  getConversations: (params) => api.get("/chat/conversations", { params }),
  getMessages: (conversationId, params) =>
    api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, messageData) => {
    // If attachments are provided, send as multipart/form-data
    const hasFiles =
      messageData &&
      (messageData.attachments instanceof FileList ||
        Array.isArray(messageData.attachments));
    if (hasFiles) {
      const form = new FormData();
      if (messageData.content) form.append("content", messageData.content);
      if (messageData.type) form.append("messageType", messageData.type);
      if (messageData.replyTo) form.append("replyTo", messageData.replyTo);
      const files = Array.from(messageData.attachments);
      files.forEach((f) => form.append("attachments", f));
      return api.post(`/chat/conversations/${conversationId}/messages`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post(
      `/chat/conversations/${conversationId}/messages`,
      messageData
    );
  },
  // Mark a specific message as read (backend route is /chat/messages/:id/read)
  markMessageRead: (messageId) => api.put(`/chat/messages/${messageId}/read`),
  createConversation: (conversationData) =>
    api.post("/chat/conversations", conversationData),
};

// Services d'administration
export const adminService = {
  // Dashboard
  getDashboardStats: (params) =>
    adminApi.get("/admin/dashboard/stats", { params }),

  // Gestion des utilisateurs
  getUsers: (params) => adminApi.get("/admin/users", { params }),
  createUser: (userData) => adminApi.post("/admin/users", userData),
  updateUser: (id, userData) => adminApi.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => adminApi.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => adminApi.patch(`/admin/users/${id}/toggle-status`),

  // Gestion des produits
  getProducts: (params) => adminApi.get("/admin/products", { params }),
  moderateProduct: (id, status, reason) =>
    adminApi.patch(`/admin/products/${id}/moderate`, { status, reason }),

  // Gestion des commandes
  getOrders: (params) => adminApi.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) =>
    adminApi.patch(`/admin/orders/${id}/status`, { status }),
  cancelOrder: (id, reason) =>
    adminApi.patch(`/admin/orders/${id}/cancel`, { reason }),

  // Gestion des fermes
  getFarms: (params) => adminApi.get("/admin/farms", { params }),
  moderateFarm: (id, status, reason) =>
    adminApi.patch(`/admin/farms/${id}/moderate`, { status, reason }),

  // Gestion des avis
  getReviews: (params) => adminApi.get("/admin/reviews", { params }),
  moderateReview: (id, status, reason) =>
    adminApi.patch(`/admin/reviews/${id}/moderate`, { status, reason }),

  // Gestion des animaux
  getAnimals: (params) => adminApi.get("/admin/animals", { params }),
  animals: {
    getAll: (params) => adminApi.get("/admin/animals", { params }),
    create: (animalData) => adminApi.post("/admin/animals", animalData),
    update: (id, animalData) =>
      adminApi.put(`/admin/animals/${id}`, animalData),
    delete: (id) => adminApi.delete(`/admin/animals/${id}`),
  },

  // Gestion des livraisons
  getDeliveries: (params) => adminApi.get("/admin/deliveries", { params }),

  // Gestion des notifications
  getNotifications: (params) =>
    adminApi.get("/admin/notifications", { params }),

  // Gestion des commandes avec CRUD
  orders: {
    getAll: (params) => adminApi.get("/admin/orders", { params }),
    create: (orderData) => adminApi.post("/admin/orders", orderData),
    update: (id, orderData) => adminApi.put(`/admin/orders/${id}`, orderData),
    delete: (id) => adminApi.delete(`/admin/orders/${id}`),
  },

  // Gestion des conversations
  getConversations: (params) =>
    adminApi.get("/admin/conversations", { params }),
  closeConversation: (id) => adminApi.patch(`/admin/conversations/${id}/close`),
  // Inbox fermes
  getFarmContacts: () => adminApi.get("/admin/farm-contacts"),
  updateFarmContactStatus: (ticketId, status) =>
    adminApi.patch(`/admin/farm-contacts/${ticketId}/status`, { status }),
  exportFarmContacts: () =>
    adminApi.get("/admin/farm-contacts/export", { responseType: "blob" }),

  // Gestion des devis
  getQuotes: (params) => adminApi.get("/admin/quotes", { params }),
  updateQuoteStatus: (id, status) =>
    adminApi.patch(`/admin/quotes/${id}/status`, { status }),
  exportQuotes: (params) =>
    adminApi.get("/admin/quotes/export", { params, responseType: "blob" }),
  assignQuote: (id, assignee) =>
    adminApi.patch(`/admin/quotes/${id}/assign`, { assignee }),
  addQuoteNote: (id, note) => adminApi.post(`/admin/quotes/${id}/notes`, note),

  // Rapports
  getSalesReport: (params) => adminApi.get("/admin/reports/sales", { params }),
  getUsersReport: (params) => adminApi.get("/admin/reports/users", { params }),

  // Notifications
  broadcastNotification: (notificationData) =>
    adminApi.post("/admin/notifications/broadcast", notificationData),

  // Configuration système
  getSystemConfig: () => adminApi.get("/admin/config"),
  updateSystemConfig: (configData) =>
    adminApi.patch("/admin/config", configData),
};

// Admin Services (catalogue de services admin)
adminService.services = {
  getAll: (params) => adminApi.get("/admin/services", { params }),
  get: (id) => adminApi.get(`/admin/services/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      return adminApi.post("/admin/services", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return adminApi.post("/admin/services", data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return adminApi.put(`/admin/services/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return adminApi.put(`/admin/services/${id}`, data);
  },
  delete: (id) => adminApi.delete(`/admin/services/${id}`),
  updateStatus: (id, status) => adminApi.patch(`/admin/services/${id}/status`, { status }),
};

// Services des fermes publiques
export const publicFarmService = {
  getAll: (params) => api.get("/farms/public", { params }),
  getById: (id) => api.get(`/farms/${id}`),
  getProducts: (id, params) => api.get(`/farms/${id}/products`, { params }),
  contact: (id, payload) => api.post(`/farms/${id}/contact`, payload),
};

// Services des avis publiques
export const publicReviewService = {
  // Admin-only list (kept for compatibility if used in admin contexts)
  getAll: (params) => api.get("/reviews", { params }),
  // Public: avis approuvés pour une cible
  getByTarget: (targetId, params) => api.get(`/reviews/target/${targetId}`, { params }),
  // Création d'un avis (auth requis)
  create: (reviewData) => api.post("/reviews", reviewData),
  // Marquer utile
  markHelpful: (id, isHelpful = true) => api.post(`/reviews/${id}/helpful`, { isHelpful }),
  // Admin: mise à jour du statut (approved/rejected/pending)
  updateStatus: (id, status, reason) => api.put(`/reviews/${id}/status`, { status, reason }),
};

// Services des notifications utilisateur
export const userNotificationService = {
  getAll: (params) => api.get("/notifications", { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete("/notifications"),
  updatePreferences: (preferences) =>
    api.patch("/notifications/preferences", preferences),
};

// Fonctions d'aide exportées pour une utilisation directe
export const getSettings = () => settingsService.getSettings();
export const updateSettings = (data) => settingsService.updateSettings(data);

// Gestionnaire d'erreurs centralisé
export const handleApiError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return {
          message: data.message || "Données invalides",
          type: "validation",
        };
      case 401:
        return { message: "Non autorisé", type: "auth" };
      case 403:
        return { message: "Accès refusé", type: "permission" };
      case 404:
        return { message: "Ressource non trouvée", type: "notFound" };
      case 500:
        return { message: "Erreur serveur interne", type: "server" };
      default:
        return {
          message: data.message || "Une erreur est survenue",
          type: "unknown",
        };
    }
  } else if (error.request) {
    // Erreur de réseau
    return { message: "Erreur de connexion au serveur", type: "network" };
  } else {
    // Autre erreur
    return {
      message: error.message || "Une erreur inattendue est survenue",
      type: "unknown",
    };
  }
};

// Hook personnalisé pour les appels API avec gestion d'état
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunction, ...args) => {
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
  };

  return { callApi, loading, error };
};

export default api;

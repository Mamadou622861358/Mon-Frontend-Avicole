import axios from "axios";

// Configuration pour les APIs admin
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
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

// Services d'administration
export const adminService = {
  // Dashboard
  getDashboardStats: (params) =>
    adminApi.get("/admin/dashboard/stats", { params }),
  getIntegritySummary: () => adminApi.get("/integrity/summary"),

  // Gestion des utilisateurs
  getUsers: (params) => adminApi.get("/admin/users", { params }),
  createUser: (userData) => adminApi.post("/admin/users", userData),
  updateUser: (id, userData) => adminApi.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => adminApi.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => adminApi.patch(`/admin/users/${id}/toggle-status`),

  // Gestion des produits
  getProducts: (params) => adminApi.get("/admin/products", { params }),
  getProduct: (id) => adminApi.get(`/admin/products/${id}`),
  moderateProduct: (id, status, reason) =>
    adminApi.patch(`/admin/products/${id}/moderate`, { status, reason }),
  createProduct: (data) => adminApi.post("/admin/products", data),
  updateProduct: (id, data) => adminApi.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => adminApi.delete(`/admin/products/${id}`),

  // Catégories (produits)
  getCategories: (params) => adminApi.get("/admin/categories", { params }),
  createCategory: (data) => adminApi.post("/admin/categories", data),
  updateCategory: (id, data) => adminApi.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => adminApi.delete(`/admin/categories/${id}`),

  // Gestion des commandes
  getOrders: (params) => adminApi.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) =>
    adminApi.patch(`/admin/orders/${id}/status`, { status }),
  cancelOrder: (id, reason) =>
    adminApi.patch(`/admin/orders/${id}/cancel`, { reason }),

  // Gestion des fermes
  getFarms: (params) => adminApi.get("/admin/farms", { params }),
  getFarmsPublic: (params) => adminApi.get("/farms/public", { params }),
  moderateFarm: (id, status, reason) =>
    adminApi.patch(`/admin/farms/${id}/moderate`, { status, reason }),
  createFarm: (data) => adminApi.post("/admin/farms", data),
  updateFarm: (id, data) => adminApi.put(`/admin/farms/${id}`, data),
  deleteFarm: (id) => adminApi.delete(`/admin/farms/${id}`),

  // Gestion des avis
  getReviews: (params) => adminApi.get("/admin/reviews", { params }),
  moderateReview: (id, status, reason) =>
    adminApi.patch(`/admin/reviews/${id}/moderate`, { status, reason }),
  reviews: {
    getAll: (params) => adminApi.get("/admin/reviews", { params }),
    create: (data) => adminApi.post("/admin/reviews", data),
    update: (id, data) => adminApi.put(`/admin/reviews/${id}`, data),
    delete: (id) => adminApi.delete(`/admin/reviews/${id}`),
    updateStatus: (id, status) =>
      adminApi.patch(`/admin/reviews/${id}/status`, { status }),
  },

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
  createDelivery: (data) => adminApi.post("/admin/deliveries", data),
  updateDelivery: (id, data) => adminApi.put(`/admin/deliveries/${id}`, data),
  deleteDelivery: (id) => adminApi.delete(`/admin/deliveries/${id}`),
  updateDeliveryStatus: (id, status) =>
    adminApi.patch(`/admin/deliveries/${id}/status`, { status }),

  // Gestion des notifications
  getNotifications: (params) =>
    adminApi.get("/admin/notifications", { params }),

  // Gestion des commandes avec CRUD
  orders: {
    getAll: (params) => adminApi.get("/admin/orders", { params }),
    get: (id) => adminApi.get(`/admin/orders/${id}`),
    create: (orderData) => adminApi.post("/admin/orders", orderData),
    update: (id, orderData) => adminApi.put(`/admin/orders/${id}`, orderData),
    delete: (id) => adminApi.delete(`/admin/orders/${id}`),
  },

  // Forums (admin)
  forums: {
    categories: {
      getAll: () => adminApi.get("/admin/forums/categories"),
      create: (data) => adminApi.post("/admin/forums/categories", data),
      delete: (id) => adminApi.delete(`/admin/forums/categories/${id}`),
    },
    topics: {
      getAll: (params) => adminApi.get("/admin/forums/topics", { params }),
      create: (data) => adminApi.post("/admin/forums/topics", data),
      update: (id, data) => adminApi.put(`/admin/forums/topics/${id}`, data),
      delete: (id) => adminApi.delete(`/admin/forums/topics/${id}`),
      updateStatus: (id, status) =>
        adminApi.patch(`/admin/forums/topics/${id}/status`, { status }),
    },
  },

  // Gestion des conversations
  getConversations: (params) =>
    adminApi.get("/admin/conversations", { params }),
  closeConversation: (id) => adminApi.patch(`/admin/conversations/${id}/close`),

  // Gestion des devis
  getQuotes: (params) => adminApi.get("/admin/quotes", { params }),
  assignQuote: (id, assigneeId) =>
    adminApi.patch(`/admin/quotes/${id}/assign`, { assigneeId }),

  // Rapports
  getSalesReport: (params) => adminApi.get("/admin/reports/sales", { params }),
  getUsersReport: (params) => adminApi.get("/admin/reports/users", { params }),
  getProductsReport: (params) =>
    adminApi.get("/admin/reports/products", { params }),
  getFarmsReport: (params) => adminApi.get("/admin/reports/farms", { params }),

  // Documentation
  getDocs: (params) => adminApi.get("/admin/docs", { params }),
  getDocFileUrl: (id) =>
    `${adminApi.defaults.baseURL}/admin/docs/file/${encodeURIComponent(id)}`,
  getDocFile: (id) =>
    adminApi.get(`/admin/docs/file/${encodeURIComponent(id)}`, {
      responseType: "blob",
    }),
  createDoc: (name, contentBase64) =>
    adminApi.post("/admin/docs", { name, contentBase64 }),
  deleteDoc: (id) => adminApi.delete(`/admin/docs/${encodeURIComponent(id)}`),

  // Exports
  exportReportCsv: (params) =>
    adminApi.get("/admin/reports/export", { params, responseType: "blob" }),

  // Farm Contacts (admin inbox)
  getFarmContacts: (params) => adminApi.get("/admin/farm-contacts", { params }),
  updateFarmContactStatus: (ticketId, status) =>
    adminApi.patch(`/admin/farm-contacts/${ticketId}/status`, { status }),
  exportFarmContacts: (params) =>
    adminApi.get("/admin/farm-contacts/export", {
      params,
      responseType: "blob",
    }),

  // Notifications
  broadcastNotification: (notificationData) =>
    adminApi.post("/admin/notifications/broadcast", notificationData),

  // Notifications (admin CRUD)
  notifications: {
    getAll: (params) => adminApi.get("/admin/notifications", { params }),
    create: (data) => adminApi.post("/admin/notifications", data),
    update: (id, data) => adminApi.put(`/admin/notifications/${id}`, data),
    delete: (id) => adminApi.delete(`/admin/notifications/${id}`),
    updateStatus: (id, status) =>
      adminApi.patch(`/admin/notifications/${id}/status`, { status }),
    broadcast: (id) => adminApi.post("/admin/notifications/broadcast", { id }),
  },

  // Configuration système
  getSystemConfig: () => adminApi.get("/admin/config"),
  updateSystemConfig: (configData) =>
    adminApi.patch("/admin/config", configData),
};

export default adminService;

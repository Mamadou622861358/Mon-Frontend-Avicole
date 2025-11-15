import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const quoteService = {
  create: (data) => api.post('/quotes', data),
  getById: (id) => api.get(`/quotes/${id}`),
};

export default quoteService;

// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const healthCheck = () => api.get('/health');
export const getPublicIp = () => api.get('/public-ip');
export const getStats = () => api.get('/stats');
export const runGeolocation = (ip: string) => api.post('/geolocation', { ip });
export const runPhone = (number: string) => api.post('/phone', { number });
export const runUsername = (username: string) => api.post('/username', { username });
export const runDomainRecon = (domain: string) => api.post('/domain/recon', { domain });
export const getHistory = (params?: { page?: number; search?: string }) =>
  api.get('/history', { params });
export const getHistoryDetail = (id: string) => api.get(`/history/${id}`);
export const deleteHistoryItem = (id: string) => api.delete(`/history/${id}`);
export const clearHistory = () => api.delete('/history');
export const exportHistory = (format: 'json' | 'csv') =>
  api.get(`/history/export?format=${format}`, { responseType: 'blob' });

export default api;

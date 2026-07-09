import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Attach the Bearer token (if present) to every outgoing request.
// Centralizing this means individual service functions never touch localStorage directly.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placementtrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

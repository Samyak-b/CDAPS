import axios from 'axios';

import { API_BASE } from '../config/api';

const api = axios.create({
  baseURL: API_BASE, // Configured through Vite environment
});

// Add a request interceptor to inject the JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

import axios from 'axios';

const API = axios.create({
  baseURL: localStorage.getItem('baseURL') || 'https://banking-system-production-81c5.up.railway.app',
  withCredentials: true,
});

// Automatically inject JWT if present in localStorage as a fallback header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;

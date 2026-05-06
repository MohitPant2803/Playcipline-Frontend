/**
 * API Configuration
 * Environment-based API URL configuration for localhost and production
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/${endpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl
};

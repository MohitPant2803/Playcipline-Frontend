import { Capacitor } from '@capacitor/core';

/**
 * API Configuration
 * Environment-based API URL configuration for localhost and production
 */

let defaultApiUrl = 'http://localhost:5000';
if (Capacitor.isNativePlatform()) {
  // 10.0.2.2 is the special IP for Android Emulators to reach your computer's localhost
  defaultApiUrl = 'http://10.0.2.2:5000';
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || defaultApiUrl;

export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/${endpoint}`;
};

export const getOAuthUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return `${API_BASE_URL}/api/auth/google?redirect_uri=com.playcipline.app://auth`;
  }
  return `${API_BASE_URL}/api/auth/google`;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getOAuthUrl
};

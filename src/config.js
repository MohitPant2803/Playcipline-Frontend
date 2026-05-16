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
  const isNative = Capacitor.isNativePlatform();
  
  console.log('\n--- OAUTH URL GENERATION ---');
  console.log('1. Capacitor.isNativePlatform():', isNative);

  let url = `${API_BASE_URL}/api/auth/google`;
  if (isNative) {
    url += '?redirect_uri=com.playcipline.app://auth';
  }
  
  console.log('2. Final Rendered URL:', url);
  return url;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getOAuthUrl
};

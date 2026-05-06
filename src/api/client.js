import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://playcipline-backend.vercel.app/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and network issues
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message, {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: API_BASE
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getMe: () => apiClient.get('/auth/me'),
  updateMe: (profile) => apiClient.put('/auth/me', profile),
  devLogin: () => apiClient.post('/auth/dev-login'),
};

export const challengeAPI = {
  getAll: () => apiClient.get('/challenges'),
  getMyChall: () => apiClient.get('/challenges/my-challenges'),
  getCompletedByUser: (userId) => apiClient.get(`/challenges/user/${userId}/completed`),
  join: (id, mode) => apiClient.post(`/challenges/${id}/join`, { mode }),
};

export const checkinAPI = {
  checkin: (userChallengeId) => apiClient.post('/checkin', { userChallengeId }),
  getTodayStatus: () => apiClient.get('/checkin/today-status'),
};

export const leaderboardAPI = {
  getGlobal: () => apiClient.get('/leaderboard/global'),
  getFriends: () => apiClient.get('/leaderboard/friends'),
};

export const userAPI = {
  getProfile: (id) => apiClient.get(`/users/${id}`),
  getFollowers: (id) => apiClient.get(`/users/${id}/followers`),
  getFollowing: (id) => apiClient.get(`/users/${id}/following`),
  search: (query) => apiClient.get('/users/search', { params: { q: query } }),
  follow: (id) => apiClient.post(`/users/${id}/follow`),
  unfollow: (id) => apiClient.delete(`/users/${id}/follow`),
};

export const feedAPI = {
  getAll: () => apiClient.get('/feed'),
  getUserActivities: (userId) => apiClient.get(`/feed/user/${userId}`),
  like: (activityId) => apiClient.post('/feed/like', { activityId }),
  comment: (activityId, text) => apiClient.post('/feed/comment', { activityId, text }),
};

export default apiClient;

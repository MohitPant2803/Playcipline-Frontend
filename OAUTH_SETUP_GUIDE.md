# Playcipline Frontend - OAuth & API Configuration Guide

## ✅ Implementation Complete

This guide explains the Google OAuth login fix and environment-based API configuration.

---

## 1. Environment Configuration

### Development (.env.local)
```env
VITE_API_URL=http://localhost:5000
```

### Production (.env.production)
```env
VITE_API_URL=https://your-backend.vercel.app
```

**Replace `https://your-backend.vercel.app` with your actual backend URL after deployment.**

---

## 2. Configuration File

**File:** `src/config.js`

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/${endpoint}`;
};
```

---

## 3. API Client Setup

**File:** `src/api/client.js`

Key changes:
- Imports `API_BASE_URL` from config
- Automatically appends `/api` to all requests
- **Automatically includes `Authorization: Bearer <token>` header** for protected routes
- Handles 401 errors and removes invalid tokens

```javascript
import { API_BASE_URL } from '../config';

const API_BASE = `${API_BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// Token interceptor automatically handles:
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 4. OAuth Login Flow

### Files Modified:
1. **Login.jsx** - Uses `API_BASE_URL` for OAuth button
2. **Header.jsx** - Uses `API_BASE_URL` for OAuth button
3. **AuthContext.jsx** - Handles callback (already working correctly)

### Flow:
```
1. User clicks "Login / Sign up" → Redirects to ${API_BASE_URL}/api/auth/google
2. Google OAuth flow happens
3. Backend redirects to frontend with: ?token=JWT_TOKEN
4. AuthContext detects token in URL
5. Token stored in localStorage
6. URL cleaned (token parameter removed)
7. User info fetched from /api/auth/me
8. User logged in and redirected to dashboard
```

### Login Button Example:
```jsx
<a href={`${API_BASE_URL}/api/auth/google`}>
  Login / Sign up
</a>
```

---

## 5. Authentication Flow

### Token Storage & Usage

```javascript
// Token automatically stored by AuthContext
localStorage.setItem('token', token);

// Automatically sent in all API requests
// Header: Authorization: Bearer <token>

// Token automatically removed on 401 error
// User redirected to login page
```

### Protected API Calls

```javascript
import { authAPI, challengeAPI, userAPI } from '../api/client';

// All these automatically include Bearer token:
authAPI.getMe();              // GET /api/auth/me
challengeAPI.getAll();         // GET /api/challenges
userAPI.getProfile(userId);    // GET /api/users/:id
```

---

## 6. URL Handling After OAuth Callback

The `AuthContext.jsx` automatically:

```javascript
// 1. Extracts token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

// 2. Stores in localStorage
localStorage.setItem('token', token);

// 3. Cleans URL (removes ?token parameter)
window.history.replaceState({}, document.title, window.location.pathname);

// 4. Fetches user data and sets user state
authAPI.getMe().then(res => {
  dispatch({ type: 'SET_USER', payload: res.data, token });
});
```

---

## 7. Vercel Deployment

### Environment Variables to Add:

1. Go to your **Vercel Project Settings**
2. Navigate to **Environment Variables**
3. Add the following variable:

| Variable Name | Value | Environments |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.vercel.app` | Production |

**Replace** `https://your-backend.vercel.app` with your actual backend Vercel URL.

### Important: Backend Configuration

Your backend must be configured to:

1. **Accept the frontend URL as redirect URI:**
   - For localhost: `http://localhost:5173` (or your dev port)
   - For production: `https://your-vercel-frontend.app`

2. **In your backend OAuth config:**
   ```
   Redirect URI: https://your-frontend-vercel.app
   ```

3. **The backend should redirect to:**
   ```
   https://your-frontend-vercel.app/?token=JWT_TOKEN
   ```

---

## 8. Testing the Setup

### Local Testing:
```bash
# Start with .env.local
npm run dev
# Visit http://localhost:5173
# Click Login → OAuth → Should redirect with token
```

### Production Testing (Vercel):
1. Ensure backend URL is set in Vercel Environment Variables
2. Deploy to Vercel
3. Visit your production URL
4. OAuth should work with the configured backend

---

## 9. Common Issues & Fixes

### ❌ Issue: "Cannot GET /api/auth/google"
- **Cause:** Backend URL not configured correctly
- **Fix:** Check that `VITE_API_URL` is pointing to your backend

### ❌ Issue: Token not storing/user not logging in
- **Cause:** Backend not returning token in URL
- **Fix:** Check backend OAuth callback returns `?token=JWT_TOKEN`

### ❌ Issue: CORS error on OAuth
- **Cause:** Backend doesn't have frontend URL in CORS origins
- **Fix:** Add frontend URL to backend CORS configuration

### ❌ Issue: 401 Unauthorized on protected routes
- **Cause:** Token not being sent or expired
- **Fix:** Check localStorage has token, try logging out and back in

---

## 10. API Endpoints Reference

```javascript
// Auth
GET  /api/auth/google              // Initiates OAuth
GET  /api/auth/google/callback     // Backend receives OAuth code (internal)
GET  /api/auth/me                  // Get current user (requires token)
PUT  /api/auth/me                  // Update profile (requires token)

// Challenges
GET  /api/challenges               // Public list
GET  /api/challenges/my-challenges // User's challenges (requires token)
POST /api/challenges/:id/join      // Join challenge (requires token)

// Leaderboard
GET  /api/leaderboard/global       // Public
GET  /api/leaderboard/friends      // Requires token

// User (most public, some require token)
GET  /api/users/:id                // Public profile
POST /api/users/:id/follow         // Follow user (requires token)
DELETE /api/users/:id/follow       // Unfollow (requires token)
```

---

## 11. Files Modified

1. ✅ **`.env.local`** - Development API URL
2. ✅ **`.env.production`** - Production API URL
3. ✅ **`src/config.js`** - Centralized config (created)
4. ✅ **`src/api/client.js`** - Uses config, exports API_BASE_URL
5. ✅ **`src/pages/Login.jsx`** - Uses API_BASE_URL for OAuth
6. ✅ **`src/components/Header.jsx`** - Uses API_BASE_URL for OAuth
7. ✅ **`src/context/AuthContext.jsx`** - No changes needed (already correct)

---

## 12. Next Steps

1. **Update Backend** - Ensure OAuth callback returns `?token=JWT_TOKEN`
2. **Test Locally** - Run `npm run dev` and test OAuth flow
3. **Deploy** - `git push` triggers Vercel deployment
4. **Add Vercel Variables** - Set `VITE_API_URL` in Vercel dashboard
5. **Test Production** - Visit Vercel URL and test OAuth

---

## 13. Troubleshooting Checklist

- [ ] `.env.local` has correct localhost backend URL
- [ ] `.env.production` has correct production backend URL
- [ ] Vercel project has `VITE_API_URL` environment variable
- [ ] Backend has frontend URL in CORS origins
- [ ] Backend OAuth config has correct redirect URIs
- [ ] Backend returns `?token=JWT_TOKEN` in callback
- [ ] Frontend correctly receives and stores token
- [ ] API calls include `Authorization: Bearer <token>` header
- [ ] localStorage is accessible in browser (not disabled)
- [ ] Token persists after page refresh


# Quick Reference - OAuth & API Configuration

## Environment Files

### .env.local (Development)
```
VITE_API_URL=http://localhost:5000
```

### .env.production (Production)
```
VITE_API_URL=https://your-backend.vercel.app
```

---

## How It Works

### 1. Login Flow
```
Click Login Button → Browser redirected to:
${VITE_API_URL}/api/auth/google

↓ (Google OAuth happens on backend)

Backend redirects to frontend:
https://your-frontend-url.vercel.app/?token=JWT_TOKEN

↓ (AuthContext handles this automatically)

Token stored in localStorage
User info fetched and state updated
Redirected to /dashboard
```

### 2. API Requests
```javascript
// All requests automatically:
// - Use VITE_API_URL from environment
// - Include Authorization: Bearer <token> header
// - Handle 401 errors (logout on expired token)

import { challengeAPI } from '../api/client';

// This automatically becomes:
// GET ${VITE_API_URL}/api/challenges
// Header: Authorization: Bearer <token>
challengeAPI.getAll();
```

### 3. OAuth URL Construction
```javascript
// In Login.jsx and Header.jsx
import { API_BASE_URL } from '../api/client';

<a href={`${API_BASE_URL}/api/auth/google`}>
  Login
</a>

// For dev: http://localhost:5000/api/auth/google
// For prod: https://your-backend.vercel.app/api/auth/google
```

---

## Vercel Deployment

**Environment Variable to Add:**

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app` |

Set in: Vercel Dashboard → Project Settings → Environment Variables

---

## Backend Requirements

Your backend OAuth endpoint must:

1. Accept request: `GET /api/auth/google?code=...`
2. Return redirect: `Location: https://frontend-url.com/?token=JWT_TOKEN`

The token will be automatically extracted and stored by the frontend.

---

## Files Changed

| File | Change |
|------|--------|
| `.env.local` | Updated to use `VITE_API_URL=http://localhost:5000` |
| `.env.production` | Created with production URL |
| `src/config.js` | Created - centralized API configuration |
| `src/api/client.js` | Updated to use config, exports API_BASE_URL |
| `src/pages/Login.jsx` | Updated OAuth button to use API_BASE_URL |
| `src/components/Header.jsx` | Updated OAuth button to use API_BASE_URL |

---

## Testing

### Local
```bash
npm run dev
# Visit http://localhost:5173
# Click Login
# Should redirect to http://localhost:5000/api/auth/google
```

### Production
- Deploy to Vercel
- Set `VITE_API_URL` in Vercel environment variables
- Visit production URL
- OAuth should work with production backend

---

## Token Flow Diagram

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ Click Login
       ▼
┌──────────────────────────┐
│ Redirect to Backend OAuth│
│ URL: ${API_BASE_URL}/api/auth/google
└──────────────┬───────────┘
               │
               ▼
        ┌──────────────┐
        │    Google    │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   Backend    │
        │  Validates   │
        │ Generates JWT│
        └──────┬───────┘
               │
               ▼ Redirects to frontend with token
       ┌─────────────────────┐
       │   Frontend (again)  │
       │ URL: ?token=JWT     │
       └──────────┬──────────┘
                  │
                  ▼ AuthContext extracts token
          ┌────────────────┐
          │ Token Stored   │
          │ in localStorage│
          └────────┬───────┘
                   │
                   ▼ Fetch /api/auth/me
           ┌───────────────┐
           │ User Logged In│
           └───────────────┘
```

---

## Important Notes

⚠️ **Before Deployment:**
- Update `.env.production` with your actual backend URL
- Ensure backend has your frontend URL in CORS configuration
- Test OAuth on localhost first
- Verify token is being returned from backend

⚠️ **Common Mistakes:**
- Using `http://localhost:5000` in production (use HTTPS URL)
- Forgetting to add Vercel environment variables
- Backend not returning `?token=` in redirect
- Not updating backend OAuth redirect URIs

✅ **Verify After Deployment:**
- Network tab shows requests to correct backend URL
- Authorization header includes Bearer token
- Token persists after page refresh
- Logout removes token from localStorage

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Feed from './pages/Feed';

import Header from './components/Header';
import { App as CapacitorApp } from '@capacitor/app';

const DomainPage = lazy(() => import('./pages/DomainPage'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/explore" />;
  }

  return children;
}
function RootRedirect() {
  const { loading, user } = useAuth();
  
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/explore"} replace />;
}

function DeepLinkHandler() {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async (url) => {
      console.log('Deep link URL:', url);

      if (!url || !url.includes('token=')) return;

      try {
        const parsedUrl = new URL(url);
        const token = parsedUrl.searchParams.get('token');

        if (token) {
          console.log('JWT received:', token);
          localStorage.setItem('token', token);

          // Await auth refresh so the context updates with the new user
          await refreshAuth(token);

          // Now we can safely navigate using React Router natively
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Deep link parsing failed:', err);
      }
    };

    // App already running
    const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      handleAuthCallback(url);
    });

    // App opened from closed state
    CapacitorApp.getLaunchUrl().then((data) => {
      if (data?.url) {
        handleAuthCallback(data.url);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [refreshAuth, navigate]);

  return null;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <DeepLinkHandler />
      <Header />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/explore" element={<Explore />} />
        <Route 
          path="/explore/:domain" 
          element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-900 text-purple-300 text-2xl font-black uppercase tracking-widest animate-pulse">Loading Portal...</div>}>
              <DomainPage />
            </Suspense>
          } 
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/explore" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Feed from './pages/Feed';

import Header from './components/Header';

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

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
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

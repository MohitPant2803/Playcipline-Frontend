import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const { user } = useAuth();

  const allLinks = [
    { path: '/explore', label: 'Explore', requiresAuth: false },
    { path: '/leaderboard', label: 'Leaderboard', requiresAuth: false },
    { path: '/feed', label: 'Feed', requiresAuth: false },
    { path: '/dashboard', label: 'Dashboard', requiresAuth: true },
    { path: '/profile', label: 'Profile', requiresAuth: true }
  ];

  const visibleLinks = user 
    ? allLinks 
    : allLinks.filter(link => !link.requiresAuth);

  return (
    <nav className="bg-white border-t border-gray-200">
      <div className={`grid gap-0 ${visibleLinks.length === 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
        {visibleLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`min-h-[64px] flex items-center justify-center border-b-2 px-2 text-center text-sm font-semibold transition sm:text-base ${
              location.pathname === link.path
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-700 hover:text-gray-950'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

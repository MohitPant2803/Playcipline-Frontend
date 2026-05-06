import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/explore', label: 'Explore' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/profile', label: 'Profile' },
    { path: '/feed', label: 'Feed' }
  ];

  return (
    <nav className="bg-white border-t border-gray-200">
      <div className="grid grid-cols-5">
        {links.map(link => (
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

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, API_BASE_URL } from '../api/client';
import Navigation from './Navigation';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = React.useState('');
  const [userResults, setUserResults] = React.useState([]);
  const [searchingUsers, setSearchingUsers] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  // Filter out demo/test users
  const isDemoUser = (user) => {
    const demoPatterns = ['demo', 'test', 'sample', 'fake', 'mock', 'placeholder'];
    const name = (user.name || '').toLowerCase();
    return demoPatterns.some(pattern => name.includes(pattern));
  };

  React.useEffect(() => {
    const query = userSearch.trim();

    if (!user || query.length < 2) {
      setUserResults([]);
      setSearchingUsers(false);
      return;
    }

    setSearchingUsers(true);
    const timer = setTimeout(async () => {
      try {
        const res = await userAPI.search(query);
        // Filter out demo/test users from search results
        const filteredResults = (res.data || []).filter(u => !isDemoUser(u));
        setUserResults(filteredResults);
      } catch (err) {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [user, userSearch]);

  const handleFollowToggle = async (targetUser) => {
    try {
      const res = targetUser.isFollowing
        ? await userAPI.unfollow(targetUser._id)
        : await userAPI.follow(targetUser._id);

      setUserResults(userResults.map(result => (
        result._id === targetUser._id
          ? {
              ...result,
              isFollowing: res.data.isFollowing,
              followerCount: Math.max(0, (result.followerCount || 0) + (res.data.isFollowing ? 1 : -1))
            }
          : result
      )));
    } catch (err) {
      setUserResults(userResults.map(result => (
        result._id === targetUser._id
          ? { ...result, followError: 'Try again' }
          : result
      )));
    }
  };

  const handleUserClick = (userId) => {
    setUserSearch('');
    setUserResults([]);
    navigate(`/user/${userId}`);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 shadow-2xl border-b-4 border-purple-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black text-white tracking-wider drop-shadow-lg">🎮 Playcipline</h1>
        {user && (
          <div className="relative w-full sm:max-w-sm">
            <input
              type="search"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search users..."
              className="w-full rounded-xl border-2 border-white bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2.5 text-sm text-white outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-200 placeholder-white placeholder-opacity-70"
            />
            {userSearch.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border-2 border-purple-300 bg-gradient-to-b from-white to-gray-50 shadow-2xl">
                {searchingUsers ? (
                  <p className="px-4 py-3 text-sm text-purple-600 font-semibold">Searching...</p>
                ) : userResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-purple-600 font-semibold">No users found</p>
                ) : (
                  userResults.map(result => (
                    <div
                      key={result._id}
                      className="flex items-center gap-3 border-b border-purple-100 px-4 py-3 last:border-b-0 cursor-pointer hover:bg-purple-50 transition-colors"
                      onClick={() => handleUserClick(result._id)}
                    >
                      {result.avatar ? (
                        <img src={result.avatar} alt={result.name} className="h-9 w-9 rounded-full border-2 border-purple-300" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-bold text-white">
                          {(result.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="flex-grow">
                        <p className="text-sm font-semibold text-gray-900">{result.name}</p>
                        <p className="text-xs text-gray-500">{result.weeklyXP || 0} weekly XP · {result.followerCount || 0} followers</p>
                      </div>
                      {!result.isCurrentUser && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(result);
                          }}
                          className={`ml-auto rounded-lg px-3 py-1 text-xs font-bold transition transform hover:scale-105 ${
                            result.isFollowing
                              ? 'border-2 border-purple-300 bg-white text-purple-600 hover:bg-purple-50'
                              : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg'
                          }`}
                        >
                          {result.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {user ? (
            <>
              <Link
                to="/profile"
                className="inline-flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-gray-50"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-left">
                  <span className="block font-semibold text-gray-900">{user.name}</span>
                  <span className="block text-sm text-gray-600">View profile</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Logout
              </button>
              <LogoutConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
              />
            </>
          ) : (
            <a
              href={`${API_BASE_URL}/api/auth/google`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Login
            </a>
          )}
        </div>
      </div>
      <Navigation />
    </header>
  );
}

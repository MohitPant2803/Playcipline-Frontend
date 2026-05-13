import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, API_BASE_URL } from '../api/client';
import LogoutConfirmModal from './LogoutConfirmModal';

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-3 py-2 text-sm font-bold transition-colors duration-300 ${
        isActive ? 'text-white' : 'text-slate-400 hover:text-white'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute inset-x-2 bottom-[-8px] h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full motion-reduce:bottom-0"></span>
      )}
    </Link>
  );
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const lastScrollY = useRef(0);

  // Filter out demo/test users
  const isDemoUser = (user) => {
    const demoPatterns = ['demo', 'test', 'sample', 'fake', 'mock', 'placeholder'];
    const name = (user.name || '').toLowerCase();
    return demoPatterns.some(pattern => name.includes(pattern));
  };

  // Scroll listener for header animations
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 100) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY <= 100) {
        setIsHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setUserSearch('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
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

  const isExplorePage = location.pathname === '/explore' || location.pathname === '/';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? 'bg-slate-900/80 backdrop-blur-lg border-b border-white/10 shadow-2xl shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        } ${isExplorePage && isHidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-24'}`}>
            
            {/* Left side: Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link to={user ? '/dashboard' : '/explore'} className="flex items-center gap-3 group">
                <span className="text-3xl drop-shadow-[0_0_10px_theme(colors.purple.500)] transition-transform duration-300 group-hover:scale-110 motion-reduce:animate-none">🎮</span>
                <h1 className="text-2xl font-black text-white tracking-wider drop-shadow-lg hidden sm:block">Playcipline</h1>
              </Link>
              <nav className="hidden lg:flex items-center gap-4">
                <NavLink to="/explore">Explore</NavLink>
                <NavLink to="/leaderboard">Leaderboard</NavLink>
                <NavLink to="/feed">Feed</NavLink>
                {user && <NavLink to="/dashboard">Dashboard</NavLink>}
              </nav>
            </div>

            {/* Right side: Search, Profile, Auth */}
            <div className="flex items-center gap-4">
              {user && (
                <div ref={searchRef} className="relative hidden md:block">
                  <div className="relative">
                     <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" /></svg></span>
                     <input type="search" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..." className="w-48 lg:w-64 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm pl-11 pr-4 py-2 text-sm text-white placeholder-slate-400 outline-none transition-all duration-300 focus:w-64 lg:focus:w-72 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  {userSearch.trim().length >= 2 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-[20rem] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-800/80 shadow-2xl backdrop-blur-xl">
                      {searchingUsers ? (
                        <p className="px-4 py-3 text-sm text-slate-400 font-semibold">Searching...</p>
                      ) : userResults.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-400 font-semibold">No users found</p>
                      ) : (
                        userResults.map(result => (
                          <div key={result._id} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleUserClick(result._id)}>
                            <img src={result.avatar} alt={result.name} className="h-9 w-9 rounded-full border-2 border-white/20" />
                            <div className="flex-grow"><p className="text-sm font-semibold text-white">{result.name}</p><p className="text-xs text-slate-400">{result.weeklyXP || 0} weekly XP</p></div>
                            {!result.isCurrentUser && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleFollowToggle(result); }} className={`ml-auto rounded-full px-3 py-1 text-xs font-bold transition transform hover:scale-105 ${result.isFollowing ? 'border border-white/20 bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'}`}>{result.isFollowing ? 'Following' : 'Follow'}</button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {user ? (
                <div ref={profileMenuRef} className="relative">
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="group relative">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-purple-400 transition-all duration-300 shadow-lg" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-[10px] font-black text-white shadow-lg group-hover:animate-pulse">{user.level || 0}</span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 origin-top-right rounded-xl border border-white/10 bg-slate-800/80 shadow-2xl backdrop-blur-xl p-2 animate-fade-in-fast">
                      <NavLink to="/profile">Profile</NavLink>
                      <button onClick={() => { setIsProfileMenuOpen(false); setShowLogoutConfirm(true); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <a href={`${API_BASE_URL}/api/auth/google`} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 motion-reduce:transform-none">Login</a>
              )}
              
              <div className="lg:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-lg lg:hidden animate-fade-in-fast" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="flex flex-col items-center justify-center h-full gap-8">
            <NavLink to="/explore" onClick={() => setIsMobileMenuOpen(false)}>Explore</NavLink>
            <NavLink to="/leaderboard" onClick={() => setIsMobileMenuOpen(false)}>Leaderboard</NavLink>
            <NavLink to="/feed" onClick={() => setIsMobileMenuOpen(false)}>Feed</NavLink>
            {user && <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>}
          </nav>
        </div>
      )}

      <LogoutConfirmModal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Card, Badge } from '../components/UI';
import { getTimeUntilWeekEnd, formatTimeRemaining } from '../utils/weeklyReset';
import UserAvatar from '../components/UserAvatar';

// High-Performance Cinematic Motion System
function useScrollReveal(options = { threshold: 0.1 }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [options.threshold, options.rootMargin]);
  return [ref, inView];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useScrollReveal({ threshold: 0, rootMargin: '100px' });
  const baseClass = "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]";
  return (
    <div ref={ref} className={`${baseClass} ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function WeeklyCountdown() {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    try {
      return getTimeUntilWeekEnd();
    } catch (err) {
      console.error('Error initializing week timer:', err);
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeUntilWeekEnd());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-cyan-400 tabular-nums uppercase">
      {formatTimeRemaining(timeRemaining)}
    </span>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id;
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter out demo/test users from leaderboard
  const isDemoUser = (user) => {
    const demoPatterns = ['demo', 'test', 'sample', 'fake', 'mock', 'placeholder'];
    const name = (user.name || '').toLowerCase();
    return demoPatterns.some(pattern => name.includes(pattern));
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = activeTab === 'global'
          ? await leaderboardAPI.getGlobal()
          : await leaderboardAPI.getFriends();
        // Filter out demo/test users
        const leaderboardData = res.data?.leaderboard || res.data || [];
        const filteredLeaderboard = Array.isArray(leaderboardData) 
          ? leaderboardData.filter(user => !isDemoUser(user))
          : [];
        setLeaderboard(filteredLeaderboard);
        setUserRank(res.data?.currentUserRank || null);
        setLoading(false);
      } catch (err) {
        console.error('Leaderboard fetch error:', err.message);
        // Handle 401 errors gracefully for friends leaderboard
        if (err.response?.status === 401 && activeTab === 'friends') {
          setLeaderboard([]);
          setUserRank(null);
          setLoading(false);
          return;
        }
        setToast({ message: 'Failed to load leaderboard', type: 'error' });
        setLeaderboard([]);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  return (
    <div className="pb-20 sm:pb-0 bg-[#020617] text-white font-sans min-h-screen relative selection:bg-purple-500/30 flex flex-col">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#020617] to-[#020617] -z-10 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse -z-10" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-1/4 right-1/4 w-[40vw] h-[40vw] max-w-[600px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse -z-10" style={{ animationDuration: '12s' }}></div>

      <div className="relative z-10 flex-grow flex flex-col">
        
        {/* Sticky Header Section */}
        <div className={`sticky top-16 z-40 w-full bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 pb-6 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'pt-6 sm:pt-8' : 'pt-28 sm:pt-32'}`}>
          <div className="max-w-[900px] mx-auto px-4">
            {/* Header & Tabs */}
            <Reveal>
              <div className="mb-6 sm:mb-8 text-center flex flex-col items-center">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase drop-shadow-2xl mb-4">Global Rankings</h1>
                <p className="text-sm sm:text-base text-slate-400 font-medium tracking-wide mb-6">Consistency compounds over time.</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="inline-flex p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    {['global', 'friends'].map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          if (tab === 'friends' && !user) {
                            navigate('/');
                            return;
                          }
                          setActiveTab(tab);
                        }}
                        disabled={tab === 'friends' && !user}
                        className={`rounded-full px-6 py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                          activeTab === tab
                            ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5'
                            : tab === 'friends' && !user
                            ? 'text-slate-600 cursor-not-allowed border border-transparent'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {tab === 'global' ? 'Global' : 'Friends'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-inner">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Reset In:</span>
                    <WeeklyCountdown />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="max-w-[900px] w-full mx-auto px-4 py-8">
          <div className={`space-y-4 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {loading && leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="animate-pulse text-xs font-black text-slate-500 tracking-widest uppercase">Loading Rankings...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-xl">
              <p className="text-slate-400 text-sm font-medium">
                {activeTab === 'friends'
                  ? 'Follow people to build your friends leaderboard.'
                  : 'No entries found. Be the first to join.'}
              </p>
            </div>
          ) : leaderboard.map((user, index) => {
            let borderColor = 'border-white/5 group-hover/card:border-white/10';
            let rankColor = 'text-slate-600 group-hover/card:text-slate-400';
            let glow = null;
            let badgeColor = 'text-cyan-400 bg-white/5 border-white/10 group-hover/card:bg-white/10 group-hover/card:border-white/20';

            if (index === 0) {
              borderColor = 'border-purple-500/30 group-hover/card:border-purple-500/50';
              rankColor = 'text-purple-400 font-bold';
              glow = <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none group-hover/card:bg-purple-500/20 transition-colors duration-700"></div>;
              badgeColor = 'text-purple-300 bg-purple-500/10 border-purple-500/20 group-hover/card:bg-purple-500/20';
            } else if (index === 1) {
              borderColor = 'border-slate-300/20 group-hover/card:border-slate-300/40';
              rankColor = 'text-slate-300 font-bold';
              glow = <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-slate-300/5 blur-[60px] rounded-full pointer-events-none group-hover/card:bg-slate-300/10 transition-colors duration-700"></div>;
              badgeColor = 'text-slate-300 bg-slate-300/10 border-slate-300/20 group-hover/card:bg-slate-300/20';
            } else if (index === 2) {
              borderColor = 'border-amber-700/30 group-hover/card:border-amber-700/50';
              rankColor = 'text-amber-500 font-bold';
              glow = <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-amber-700/10 blur-[60px] rounded-full pointer-events-none group-hover/card:bg-amber-700/20 transition-colors duration-700"></div>;
              badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover/card:bg-amber-500/20';
            } else if (user._id === currentUserId) {
              borderColor = 'border-cyan-500/30 group-hover/card:border-cyan-500/50';
              rankColor = 'text-cyan-400 font-bold';
              glow = <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none group-hover/card:bg-cyan-500/20 transition-colors duration-700"></div>;
            }
            
            return (
              <div
                key={user._id}
                onClick={() => navigate(`/user/${user._id}`)}
                className={`relative flex items-center gap-4 sm:gap-6 cursor-pointer p-5 sm:p-7 rounded-[2rem] border transition-all duration-500 group/card overflow-hidden backdrop-blur-xl bg-white/[0.02] hover:bg-white/[0.04] ${borderColor}`}
              >
                {glow}
                <div className={`text-2xl sm:text-3xl font-light w-10 text-center transition-colors relative z-10 ${rankColor}`}>#{index + 1}</div>
                <UserAvatar user={user} size="lg" className="border-2 border-[#020617] relative z-10" />
                
                <div className="flex-grow min-w-0 relative z-10">
                  <p className="font-black text-white text-base sm:text-lg tracking-wide truncate">
                    {user.name} {user._id === currentUserId && <span className="text-slate-500 font-medium ml-1 text-sm">(You)</span>}
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Level {user.level}</p>
                </div>
                <div className="text-right shrink-0 relative z-10">
                  <span className={`px-4 py-2 text-[10px] sm:text-xs font-black rounded-full backdrop-blur-sm transition-colors uppercase tracking-widest border ${badgeColor}`}>
                    {user.weeklyXP} XP
                  </span>
                </div>
              </div>
          )})}

          {userRank && userRank > 50 && (
              <div className="mt-12 pt-8 border-t border-white/5">
                <p className="text-center text-[10px] text-slate-500 font-black mb-4 uppercase tracking-widest">
                  Your Rank: #{userRank}
                </p>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] text-center shadow-2xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors">
                  <p className="text-slate-300 font-medium text-sm">
                    Keep completing challenges to reach the top 50.
                  </p>
                </div>
              </div>
          )}
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

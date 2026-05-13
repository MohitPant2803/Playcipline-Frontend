import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Card, Badge } from '../components/UI';
import { getTimeUntilWeekEnd, formatTimeRemaining } from '../utils/weeklyReset';

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
    <p className="text-2xl font-black mt-1 tabular-nums text-white drop-shadow-lg">
      {formatTimeRemaining(timeRemaining)}
    </p>
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
    <div className="pb-20 sm:pb-0 bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 text-white font-sans min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-black tracking-wider drop-shadow-lg">🏆 LEADERBOARD</h1>
          <div className="inline-flex rounded-2xl border-2 border-purple-500 bg-slate-900 bg-opacity-80 p-1.5 shadow-2xl backdrop-blur-sm">
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
                className={`rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                    : tab === 'friends' && !user
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab === 'global' ? '🌍 Global' : '👥 Friends'}
              </button>
            ))}
          </div>
        </div>

        {/* Week End Countdown */}
        <div className="mb-6 p-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-2xl border-2 border-cyan-400 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
          }}></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-100">⏱️ Weekly Reset:</p>
              <WeeklyCountdown />
            </div>
          </div>
        </div>

        <div className={`space-y-3 transition-opacity duration-300 will-change-opacity ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {loading && leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="animate-bounce text-xl font-bold text-purple-300 tracking-widest uppercase">Loading...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-purple-500 shadow-2xl">
              <p className="text-white text-lg font-bold">
                {activeTab === 'friends'
                  ? '👥 Follow people to build your friends leaderboard.'
                  : '🚀 No entries found. Be the first to join.'}
              </p>
            </div>
          ) : leaderboard.map((user, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || `#${index + 1}`;
            return (
            <div
              key={user._id}
              onClick={() => navigate(`/user/${user._id}`)}
              className={`flex items-center gap-4 cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 transform hover:scale-102 hover:shadow-2xl ${
                user._id === currentUserId 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-purple-300 shadow-2xl' 
                  : index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 shadow-2xl' 
                  : index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300 shadow-xl'
                  : index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 border-orange-400 shadow-xl'
                  : 'bg-slate-700 border-slate-600 hover:border-purple-500 shadow-lg'
              }`}
            >
              <div className={`text-3xl font-black w-10 text-center ${index < 3 ? 'drop-shadow-lg' : ''}`}>{medal}</div>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
                />
              )}
              <div className="flex-grow">
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-sm font-semibold opacity-90">⭐ Level {user.level}</p>
              </div>
              <div className="text-right">
                <span className="px-4 py-2 text-sm font-bold rounded-xl bg-black bg-opacity-30 text-white backdrop-blur-sm">
                  ✨ {user.weeklyXP} XP
                </span>
              </div>
            </div>
          )})}

          {userRank && userRank > 50 && (
            <div className="mt-8 pt-8 border-t-2 border-purple-500">
              <p className="text-center text-purple-300 text-sm font-bold mb-4 uppercase tracking-wide">
                📊 Your Rank: #{userRank}
              </p>
              <div className="bg-gradient-to-r from-purple-900 to-slate-800 border-2 border-purple-500 p-5 rounded-2xl text-center shadow-2xl">
                <p className="text-white font-bold text-lg">
                  🚀 Keep completing challenges to reach the top 50!
                </p>
              </div>
            </div>
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

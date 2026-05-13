import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Card, Badge } from '../components/UI';
import { getTimeUntilWeekEnd, formatTimeRemaining } from '../utils/weeklyReset';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id;
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [timeRemaining, setTimeRemaining] = useState(() => {
    try {
      return getTimeUntilWeekEnd();
    } catch (err) {
      console.error('Error initializing week timer:', err);
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
  });

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

  // Update countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeUntilWeekEnd());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0 bg-[#FAFAF8] text-gray-900 font-sans min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leaderboard</h1>
          <div className="inline-flex rounded-xl border border-[#ECECEC] bg-white p-1.5 shadow-sm">
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
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? 'bg-[#6366F1] text-white shadow-sm'
                    : tab === 'friends' && !user
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Week End Countdown */}
        <div className="mb-6 p-6 bg-white border border-[#ECECEC] rounded-[24px] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Weekly Reset:</p>
              <p className="text-xl font-semibold text-gray-900 mt-1 tabular-nums">
                {formatTimeRemaining(timeRemaining)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#ECECEC] rounded-[24px]">
              <p className="text-gray-500 text-lg font-medium">
                {activeTab === 'friends'
                  ? 'Follow people to build your friends leaderboard.'
                  : 'No entries found. Be the first to join.'}
              </p>
            </div>
          ) : leaderboard.map((user, index) => (
            <div
              key={user._id}
              onClick={() => navigate(`/user/${user._id}`)}
              className={`flex items-center gap-4 cursor-pointer p-4 rounded-[20px] border transition-all duration-200 ${
                user._id === currentUserId 
                  ? 'bg-indigo-50 border-[#6366F1] shadow-sm' 
                  : index === 0 ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-white border-[#ECECEC] hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`text-xl font-bold w-8 ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-400'}`}>#{user.rank}</div>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-[#ECECEC]"
                />
              )}
              <div className="flex-grow">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs font-medium text-gray-500">Level {user.level}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-600">
                  {user.weeklyXP} XP
                </span>
              </div>
            </div>
          ))}

          {userRank && userRank > 50 && (
            <div className="mt-8 pt-8 border-t border-[#ECECEC]">
              <p className="text-center text-gray-500 text-xs font-medium mb-4">
                Your Rank: #{userRank}
              </p>
              <div className="bg-gray-50 border border-[#ECECEC] p-4 rounded-[16px]">
                <p className="text-center text-gray-600 text-sm font-medium">
                  Keep completing challenges to reach the top 50.
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

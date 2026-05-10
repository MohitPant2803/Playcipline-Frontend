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
    <div className="pb-20 sm:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Weekly Leaderboard</h1>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
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
                className={`rounded-md px-4 py-2 text-sm font-bold capitalize transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : tab === 'friends' && !user
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Week End Countdown */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Week Ends In:</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatTimeRemaining(timeRemaining)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Scores reset when the week ends</p>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </div>

        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {activeTab === 'friends'
                  ? 'Follow people to build your friends leaderboard.'
                  : 'No users on the leaderboard yet. Be the first to climb up!'}
              </p>
            </Card>
          ) : leaderboard.map((user, index) => (
            <Card
              key={user._id}
              onClick={() => navigate(`/user/${user._id}`)}
              className={`flex items-center gap-4 cursor-pointer hover:shadow-lg transition ${
                index < 3 ? 'border-2 border-yellow-400' : ''
              } ${user._id === currentUserId ? 'bg-yellow-200' : ''}`}
            >
              <div className="text-2xl font-bold text-gray-400 w-8">#{user.rank}</div>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-grow">
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-600">Level {user.level}</p>
              </div>
              <div className="text-right">
                <Badge text={`${user.weeklyXP} XP`} color="blue" />
              </div>
            </Card>
          ))}

          {userRank && userRank > 50 && (
            <div className="mt-8 pt-8 border-t-2 border-gray-300">
              <p className="text-center text-gray-600 font-semibold mb-4">
                Your Rank: #{userRank}
              </p>
              <Card className="bg-blue-50 border-2 border-blue-300">
                <p className="text-center text-gray-700">
                  Keep completing challenges to reach the top 50!
                </p>
              </Card>
            </div>
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

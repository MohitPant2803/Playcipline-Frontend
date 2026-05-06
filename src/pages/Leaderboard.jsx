import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../api/client';
import Toast from '../components/Toast';
import { Card, Badge } from '../components/UI';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = activeTab === 'global'
          ? await leaderboardAPI.getGlobal()
          : await leaderboardAPI.getFriends();
        setLeaderboard(res.data.leaderboard);
        setUserRank(res.data.currentUserRank);
        setLoading(false);
      } catch (err) {
        setToast({ message: 'Failed to load leaderboard', type: 'error' });
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

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
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-2 text-sm font-bold capitalize transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Follow people to build your friends leaderboard.
              </p>
            </Card>
          ) : leaderboard.map((user, index) => (
            <Card
              key={user._id}
              onClick={() => navigate(`/user/${user._id}`)}
              className={`flex items-center gap-4 cursor-pointer hover:shadow-lg transition ${
                index < 3 ? 'border-2 border-yellow-400' : ''
              }`}
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

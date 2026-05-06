import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, challengeAPI, feedAPI } from '../api/client';
import Toast from '../components/Toast';
import FollowersModal from '../components/FollowersModal';
import { Card, Badge } from '../components/UI';
import XPProgressCard from '../components/XPProgressCard';

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [modalType, setModalType] = useState('followers');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userRes = await userAPI.getProfile(userId);
        setProfile(userRes.data);
        setIsFollowing(userRes.data.isFollowing);
        setLoading(false);
      } catch (err) {
        setToast({ message: 'Failed to load profile', type: 'error' });
        setLoading(false);
        if (err.response?.status === 404) {
          setTimeout(() => navigate('/leaderboard'), 2000);
        }
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await challengeAPI.getCompletedByUser(userId);
        const allChallenges = res.data;
        const completed = allChallenges.filter(c => c.status === 'completed').length;

        setStats({
          completedChallenges: completed,
          allChallenges
        });
      } catch (err) {
        console.log('Could not load stats');
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await feedAPI.getUserActivities(userId);
        setActivities(res.data);
      } catch (err) {
        console.log('Could not load activities');
      }
    };

    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollow(userId);
        setIsFollowing(false);
        setToast({ message: 'Unfollowed', type: 'success' });
      } else {
        await userAPI.follow(userId);
        setIsFollowing(true);
        setToast({ message: 'Following!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to update follow status', type: 'error' });
    } finally {
      setFollowLoading(false);
    }
  };

  const getActivityText = (activity) => {
    const challenge = activity.challengeId?.title || 'a challenge';
    
    if (activity.type === 'checkin') {
      return `completed Day ${activity.meta?.day} of ${challenge} on ${activity.meta?.mode}`;
    } else if (activity.type === 'completed_challenge') {
      return `completed ${challenge} challenge on ${activity.meta?.mode}!`;
    } else if (activity.type === 'badge_earned') {
      return `earned the ${activity.meta?.badge} badge!`;
    }
    return 'did something awesome!';
  };

  const getActivityColor = (type) => {
    const colors = {
      checkin: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500',
      completed_challenge: 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500',
      badge_earned: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500'
    };
    return colors[type] || 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400';
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!profile) return <div className="flex items-center justify-center h-screen">User not found</div>;

  const allBadges = ['7-day', '21-day', '75-hard', 'hard-mode', 'perfect-streak'];
  const earnedBadges = profile?.badges || [];
  const unearned = allBadges.filter(b => !earnedBadges.includes(b));

  return (
    <div className="pb-20 sm:pb-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-4xl font-bold text-blue-600 shadow-lg">
                    {(profile?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold mb-2">{profile?.name}</h1>
                  <p className="text-blue-100 text-lg">{profile?.email}</p>
                  <p className="mt-2 text-blue-100">{profile?.location || 'Location not added'}</p>
                  <p className="mt-3 text-sm font-semibold bg-white bg-opacity-20 inline-block px-3 py-1 rounded-full">
                    👥 {profile?.followerCount} followers
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-3 rounded-lg font-bold transition text-lg ${
                    isFollowing
                      ? 'bg-white text-purple-600 hover:bg-gray-100 disabled:bg-gray-200'
                      : 'bg-white text-blue-600 hover:bg-gray-100 disabled:bg-gray-200'
                  }`}
                >
                  {followLoading ? '⏳ Loading...' : isFollowing ? '✓ Following' : '+ Follow'}
                </button>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-30 transition text-lg"
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Colorful Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                <p className="text-xs font-semibold opacity-90">Total XP</p>
                <p className="text-3xl font-bold mt-1">{Math.round(profile?.totalXP || 0)}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                <p className="text-xs font-semibold opacity-90">This Week</p>
                <p className="text-3xl font-bold mt-1">{Math.round(profile?.weeklyXP || 0)}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                <p className="text-xs font-semibold opacity-90">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats?.completedChallenges || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                <p className="text-xs font-semibold opacity-90">Streak</p>
                <p className="text-3xl font-bold mt-1">{profile?.globalStreak || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Badges Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">🏆 Badges Earned</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earnedBadges.map(badge => (
              <Card key={badge} className="text-center bg-gradient-to-br from-yellow-300 to-amber-400 border-2 border-yellow-500 shadow-lg transform hover:scale-105 transition">
                <p className="text-4xl mb-2">⭐</p>
                <p className="font-bold text-yellow-900 capitalize">{badge.replace(/-/g, ' ')}</p>
              </Card>
            ))}
            {unearned.map(badge => (
              <Card key={badge} className="text-center bg-gradient-to-br from-gray-200 to-gray-300 opacity-60 border-2 border-gray-400">
                <p className="text-4xl mb-2 grayscale">⭐</p>
                <p className="font-bold text-gray-600 capitalize">{badge.replace(/-/g, ' ')}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Activities Timeline */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Recent Activities</h2>
          {activities.length === 0 ? (
            <Card className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100">
              <p className="text-gray-600 text-lg">No activities yet. Keep grinding! 💪</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <Card
                  key={activity._id}
                  className={`${getActivityColor(activity.type)} p-5 shadow-md hover:shadow-lg transition`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {activity.type === 'checkin' && '✅'}
                      {activity.type === 'completed_challenge' && '🎯'}
                      {activity.type === 'badge_earned' && '🏅'}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{getActivityText(activity)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="inline-block bg-white bg-opacity-60 px-2 py-1 rounded">
                          {timeAgo(activity.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Challenges */}
        {stats?.allChallenges && stats.allChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">🎖️ Challenges Completed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.allChallenges
                .filter(c => c.status === 'completed')
                .map((challenge, idx) => (
                  <Card
                    key={challenge._id}
                    className={`bg-gradient-to-br ${
                      idx % 3 === 0
                        ? 'from-green-50 to-emerald-100 border-l-4 border-green-500'
                        : idx % 3 === 1
                        ? 'from-blue-50 to-cyan-100 border-l-4 border-blue-500'
                        : 'from-purple-50 to-pink-100 border-l-4 border-purple-500'
                    } shadow-md hover:shadow-lg transition`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{challenge.challengeId?.title}</h3>
                        <Badge
                          text={`${challenge.mode.charAt(0).toUpperCase() + challenge.mode.slice(1)} Mode`}
                          color={
                            challenge.mode === 'hard'
                              ? 'red'
                              : challenge.mode === 'medium'
                              ? 'yellow'
                              : 'blue'
                          }
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 bg-white bg-opacity-60 px-3 py-1 rounded-full">
                        {challenge.challengeId?.duration} days
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

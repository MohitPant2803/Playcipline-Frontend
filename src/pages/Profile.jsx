import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { challengeAPI } from '../api/client';
import Toast from '../components/Toast';
import { Card, Badge } from '../components/UI';
import XPProgressCard from '../components/XPProgressCard';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    location: user?.location || ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await challengeAPI.getMyChall();
        const allChallenges = res.data;
        const active = allChallenges.filter(c => c.status === 'active').length;
        const completed = allChallenges.filter(c => c.status === 'completed').length;
        const longestStreak = Math.max(...allChallenges.map(c => c.longestStreak || 0), 0);
        const currentStreak = Math.max(...allChallenges.map(c => c.currentStreak || 0), user?.globalStreak || 0);

        setStats({
          currentStreak,
          longestStreak,
          activeChallenges: active,
          completedChallenges: completed,
          allChallenges
        });
        setLoading(false);
      } catch (err) {
        setToast({ message: 'Failed to load profile', type: 'error' });
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.globalStreak]);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      avatar: user?.avatar || '',
      location: user?.location || ''
    });
  }, [user]);

  const allBadges = ['7-day', '21-day', '75-hard', 'hard-mode', 'perfect-streak'];
  const earnedBadges = user?.badges || [];
  const unearned = allBadges.filter(b => !earnedBadges.includes(b));

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setIsEditing(false);
      setToast({ message: 'Profile updated', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="mt-2 text-gray-700">{user?.location || 'Location not added'}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  {isEditing ? 'Cancel edit' : 'Edit profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Sign Out
                </button>
              </div>

              {isEditing && (
                <form onSubmit={handleSaveProfile} className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold text-gray-700">
                    Username
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder={user?.name || 'Your name'}
                      className="rounded-lg border border-gray-300 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-gray-700">
                    Profile picture URL
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={(event) => setForm({ ...form, avatar: event.target.value })}
                      placeholder={user?.avatar || 'Google picture will be used if empty'}
                      className="rounded-lg border border-gray-300 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-gray-700">
                    Where are you from?
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => setForm({ ...form, location: event.target.value })}
                      placeholder="City, Country"
                      className="rounded-lg border border-gray-300 px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-fit rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save profile'}
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <XPProgressCard totalXP={user?.totalXP || 0} className="col-span-2 shadow-none border border-gray-100" />
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{stats?.currentStreak || 0}</p>
              </Card>
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Longest Streak</p>
                <p className="text-3xl font-bold text-orange-600">{stats?.longestStreak || 0}</p>
              </Card>
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Active Challenges</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.activeChallenges || 0}</p>
              </Card>
              <Card className="text-center shadow-none border border-gray-100">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats?.completedChallenges || 0}</p>
              </Card>
            </div>
          </div>
        </Card>

        {/* Badges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earnedBadges.map(badge => (
              <Card key={badge} className="text-center bg-yellow-50 border-2 border-yellow-300">
                <p className="text-3xl mb-2">🏆</p>
                <p className="font-bold text-yellow-700 capitalize">{badge}</p>
              </Card>
            ))}
            {unearned.map(badge => (
              <Card key={badge} className="text-center opacity-50">
                <p className="text-3xl mb-2 grayscale">🏆</p>
                <p className="font-bold text-gray-500 capitalize">{badge}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Completed Challenges */}
        {stats?.allChallenges && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Challenges</h2>
            <div className="space-y-3">
              {stats.allChallenges
                .filter(c => c.status === 'completed')
                .map(challenge => (
                  <Card key={challenge._id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{challenge.challengeId?.title}</h3>
                        <Badge text={challenge.mode} />
                      </div>
                      <p className="text-sm text-gray-600">
                        {challenge.challengeId?.duration} days
                      </p>
                    </div>
                  </Card>
                ))}
              {stats.allChallenges.filter(c => c.status === 'completed').length === 0 && (
                <Card className="text-center py-8">
                  <p className="text-gray-600">No completed challenges yet!</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

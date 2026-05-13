import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { challengeAPI } from '../api/client';
import Toast from '../components/Toast';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import FollowersModal from '../components/FollowersModal';
import ProfileView from '../components/ProfileView';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [socialModalType, setSocialModalType] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  const getEffectiveStreak = () => {
    if (!user || !user.globalStreak) return 0;
    if (!user.lastActiveDate) return user.globalStreak;
    
    const now = new Date();
    const dateToUse = new Date(now);
    if (now.getHours() === 0 && now.getMinutes() < 1) {
      dateToUse.setDate(dateToUse.getDate() - 1);
    }
    const todayStr = dateToUse.toISOString().slice(0, 10);
    
    const todayDate = new Date(todayStr + 'T00:00:00Z');
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    const lastActiveStr = new Date(user.lastActiveDate).toISOString().slice(0, 10);
    
    if (lastActiveStr === todayStr || lastActiveStr === yesterdayStr) {
      return user.globalStreak;
    }
    return 0;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await challengeAPI.getMyChall();
        const allChallenges = res.data;
        const active = allChallenges.filter(challenge => challenge.status === 'active').length;
        const completed = allChallenges.filter(challenge => challenge.status === 'completed').length;

        setStats({
          currentStreak: getEffectiveStreak(),
          longestStreak: user?.longestStreak || 0,
          activeChallenges: active,
          completedChallenges: completed,
          allChallenges
        });
      } catch (err) {
        setToast({ message: 'Failed to load profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.globalStreak, user?.lastActiveDate]);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      avatar: user?.avatar || '',
      location: user?.location || '',
      bio: user?.bio || ''
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
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
    <div className="pb-20 sm:pb-0 bg-[#FAFAF8] text-gray-900 font-sans min-h-screen">
      <ProfileView
        profile={user}
        stats={stats}
        isEditing={isEditing}
        form={form}
        saving={saving}
        onFormChange={setForm}
        onSaveProfile={handleSaveProfile}
        onSocialClick={setSocialModalType}
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-[#6366F1] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm transition"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-white border border-[#ECECEC] text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-5 py-2 rounded-xl text-sm font-medium transition"
            >
              Sign Out
            </button>
          </>
        }
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
      {socialModalType && user?._id && (
        <FollowersModal
          userId={user._id}
          type={socialModalType}
          onClose={() => setSocialModalType(null)}
        />
      )}

      {/* Active Challenges Section */}
      <div className="max-w-4xl mx-auto px-4 pb-12 mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Active Challenges</h2>
        {stats?.allChallenges?.filter(c => c.status === 'active').length === 0 ? (
          <div className="bg-white p-6 rounded-[24px] border border-[#ECECEC] text-center text-gray-500 shadow-sm">
            No active challenges currently. Head to Explore to begin your evolution.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats?.allChallenges?.filter(c => c.status === 'active').map(uc => (
              <div key={uc._id} className="bg-white p-6 rounded-[24px] border border-[#ECECEC] shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                    {uc.mode} Mode
                  </span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                    Day {uc.completedDays} / {uc.requiredDays}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{uc.challengeId?.title || 'Unknown Challenge'}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{uc.challengeId?.description || 'No description available.'}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div 
                    className="bg-[#6366F1] h-full rounded-full transition-all duration-[800ms] ease-out" 
                    style={{ width: `${Math.min(100, Math.max(0, (uc.completedDays / uc.requiredDays) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-right text-gray-500 font-medium">{Math.round((uc.completedDays / uc.requiredDays) * 100)}% Completed</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

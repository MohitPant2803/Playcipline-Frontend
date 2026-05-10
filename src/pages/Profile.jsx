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
    location: user?.location || ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await challengeAPI.getMyChall();
        const allChallenges = res.data;
        const active = allChallenges.filter(challenge => challenge.status === 'active').length;
        const completed = allChallenges.filter(challenge => challenge.status === 'completed').length;
        const longestStreak = Math.max(...allChallenges.map(challenge => challenge.longestStreak || 0), 0);
        const currentStreak = Math.max(...allChallenges.map(challenge => challenge.currentStreak || 0), user?.globalStreak || 0);

        setStats({
          currentStreak,
          longestStreak,
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
  }, [user?.globalStreak]);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      avatar: user?.avatar || '',
      location: user?.location || ''
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
    <>
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
              className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              {isEditing ? 'Cancel edit' : 'Edit profile'}
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
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
    </>
  );
}

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

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-bounce text-2xl font-black text-white">Loading...</div></div>;

  return (
    <div className="pb-20 sm:pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans min-h-screen">
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
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-purple-700 hover:to-pink-600 shadow-lg transition uppercase tracking-wide"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition uppercase tracking-wide"
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
        <h2 className="text-3xl font-black text-white mb-6 tracking-wider drop-shadow-lg">⚔️ ACTIVE CHALLENGES</h2>
        {stats?.allChallenges?.filter(c => c.status === 'active').length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-2xl border-2 border-purple-500 text-center text-purple-300 shadow-2xl font-bold text-lg">
            🎯 No active challenges currently. Head to Explore to begin your evolution.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats?.allChallenges?.filter(c => c.status === 'active').map(uc => (
              <div key={uc._id} className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl border-2 border-purple-500 shadow-2xl hover:border-pink-500 transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg uppercase tracking-wide ${
                    uc.mode === 'easy' ? 'bg-green-500' : uc.mode === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {uc.mode} Mode
                  </span>
                  <span className="text-xs font-bold text-cyan-300 bg-slate-600 px-3 py-1.5 rounded-lg uppercase tracking-wide">
                    Day {uc.completedDays} / {uc.requiredDays}
                  </span>
                </div>
                <h3 className="font-black text-lg text-white mb-2 drop-shadow-lg">{uc.challengeId?.title || 'Unknown Challenge'}</h3>
                <p className="text-sm text-purple-200 mb-4 line-clamp-2 font-semibold">{uc.challengeId?.description || 'No description available.'}</p>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2 overflow-hidden border border-slate-500">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-[800ms] ease-out shadow-lg" 
                    style={{ width: `${Math.min(100, Math.max(0, (uc.completedDays / uc.requiredDays) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-right text-purple-300 font-bold uppercase tracking-wide">{Math.round((uc.completedDays / uc.requiredDays) * 100)}% Completed</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

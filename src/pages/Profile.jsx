import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { challengeAPI, feedAPI } from '../api/client';
import Toast from '../components/Toast';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import FollowersModal from '../components/FollowersModal';
import ProfileView from '../components/ProfileView';
import PersonaSelector from '../components/PersonaSelector';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [socialModalType, setSocialModalType] = useState(null);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
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
        const [chalRes, actsRes] = await Promise.all([
          challengeAPI.getMyChall(),
          user?._id ? feedAPI.getUserActivities(user._id) : Promise.resolve({ data: [] })
        ]);
        const allChallenges = chalRes.data;
        const active = allChallenges.filter(challenge => challenge.status === 'active').length;
        const completed = allChallenges.filter(challenge => challenge.status === 'completed').length;

        setStats({
          currentStreak: getEffectiveStreak(),
          longestStreak: user?.longestStreak || 0,
          activeChallenges: active,
          completedChallenges: completed,
          allChallenges
        });

        setActivities(actsRes.data);
      } catch (err) {
        setToast({ message: 'Failed to load profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.globalStreak, user?.lastActiveDate, user?._id]);

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

  let currentPersonaObj = null;
  try {
    if (form.avatar && form.avatar.startsWith('{')) {
      currentPersonaObj = JSON.parse(form.avatar);
    }
  } catch (e) {}

  return (
    <div className="pt-24 pb-20 sm:pb-0 bg-[#020617] text-white font-sans min-h-screen relative selection:bg-purple-500/30 overflow-hidden">
      <ProfileView
        profile={user}
        stats={stats}
        activities={activities}
        showActivities={true}
        isEditing={isEditing}
        form={form}
        saving={saving}
        onFormChange={setForm}
        onSaveProfile={handleSaveProfile}
        onSocialClick={setSocialModalType}
        onAvatarClick={() => setShowPersonaSelector(true)}
        onCloseEdit={() => setIsEditing(false)}
        currentPersonaObj={currentPersonaObj}
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-full text-xs font-black hover:bg-white/20 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 px-6 py-2 rounded-full text-xs font-black transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]"
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

      {showPersonaSelector && (
        <PersonaSelector
          currentPersona={currentPersonaObj}
          userName={form.name || user?.name}
          userLevel={stats?.level || user?.level || 1}
          onSelect={(persona) => {
            setForm({ ...form, avatar: JSON.stringify(persona) });
            setShowPersonaSelector(false);
          }}
          onClose={() => setShowPersonaSelector(false)}
        />
      )}

      {/* Active Challenges Section */}
      <div className="max-w-6xl mx-auto px-4 pb-24 mt-8 relative z-10">
        <h2 className="text-2xl font-black text-white mb-8 tracking-wider drop-shadow-lg uppercase">⚔️ Active Evolutions</h2>
        {stats?.allChallenges?.filter(c => c.status === 'active').length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[2rem] text-center text-slate-400 backdrop-blur-xl font-bold text-sm uppercase tracking-widest">
            🎯 Enter a domain to begin your evolution.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats?.allChallenges?.filter(c => c.status === 'active').map(uc => (
              <div key={uc._id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] shadow-2xl hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-colors duration-700 pointer-events-none"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                    uc.mode === 'easy' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : uc.mode === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
                  }`}>
                    {uc.mode} Mode
                  </span>
                  <span className="text-[10px] font-black text-cyan-400 bg-cyan-900/20 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                    Day {uc.completedDays} / {uc.requiredDays}
                  </span>
                </div>
                <h3 className="font-black text-2xl text-white mb-2 drop-shadow-lg tracking-tight mt-6">{uc.challengeId?.title || 'Unknown Challenge'}</h3>
                <p className="text-sm text-slate-400 mb-8 line-clamp-2 font-medium leading-relaxed">{uc.challengeId?.description || 'No description available.'}</p>
                <div className="w-full bg-white/[0.03] rounded-full h-1.5 mb-4 overflow-hidden border border-white/[0.05] relative shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-cyan-300 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
                    style={{ width: `${Math.min(100, Math.max(0, (uc.completedDays / uc.requiredDays) * 100))}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
                  </div>
                </div>
                <p className="text-[10px] text-right text-cyan-500 font-black uppercase tracking-widest">{Math.round((uc.completedDays / uc.requiredDays) * 100)}% Engaged</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, challengeAPI, feedAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import FollowersModal from '../components/FollowersModal';
import Modal from '../components/Modal';
import ProfileView from '../components/ProfileView';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [socialModalType, setSocialModalType] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const isCurrentProfile = user?._id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userRes = await userAPI.getProfile(userId);
        setProfile(userRes.data);

        if (user && user._id !== userId) {
          const statusRes = await userAPI.getFollowStatus(userId);
          setIsFollowing(statusRes.data.isFollowing);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        setToast({ message: 'Failed to load profile', type: 'error' });
        if (err.response?.status === 404) {
          setTimeout(() => navigate('/leaderboard'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, user, navigate]);

  const getEffectiveStreak = (profileData) => {
    if (!profileData || !profileData.globalStreak) return 0;
    if (!profileData.lastActiveDate) return profileData.globalStreak;
    
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
    
    const lastActiveStr = new Date(profileData.lastActiveDate).toISOString().slice(0, 10);
    
    if (lastActiveStr === todayStr || lastActiveStr === yesterdayStr) {
      return profileData.globalStreak;
    }
    return 0;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await challengeAPI.getCompletedByUser(userId);
        const allChallenges = res.data;
        const completed = allChallenges.filter(challenge => challenge.status === 'completed').length;

        setStats({
          currentStreak: getEffectiveStreak(profile),
          longestStreak: profile?.longestStreak || 0,
          activeChallenges: 0,
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
  }, [userId, profile]);

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
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (isCurrentProfile) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollow(userId);
        setIsFollowing(false);
        setProfile(current => ({
          ...current,
          followerCount: Math.max(0, (current?.followerCount || 0) - 1)
        }));
        setToast({ message: 'Unfollowed', type: 'success' });
      } else {
        await userAPI.follow(userId);
        setIsFollowing(true);
        setProfile(current => ({
          ...current,
          followerCount: (current?.followerCount || 0) + 1
        }));
        setToast({ message: 'Following', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to update follow status', type: 'error' });
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-bounce text-2xl font-black text-white">Loading...</div></div>;
  if (!profile) return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="text-2xl font-black text-white">User not found</div></div>;

  return (
    <div className="pb-20 sm:pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans min-h-screen">
      <ProfileView
        profile={profile}
        stats={stats}
        activities={activities}
        showActivities
        onSocialClick={setSocialModalType}
        actions={
          <>
            {!isCurrentProfile && (
              <button
                type="button"
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition uppercase tracking-wide ${
                  isFollowing
                    ? 'border-2 border-purple-500 bg-slate-700 text-purple-300 hover:bg-slate-600'
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600'
                } disabled:opacity-50`}
              >
                {!user ? 'Login required' : followLoading ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/leaderboard')}
              className="rounded-xl border-2 border-purple-500 bg-slate-700 px-5 py-2.5 text-sm font-bold text-purple-300 transition hover:bg-slate-600 shadow-lg uppercase tracking-wide"
            >
              Back
            </button>
          </>
        }
      />

      {toast && <Toast message={toast.message} type={toast.type} />}

      {socialModalType && (
        <FollowersModal
          userId={userId}
          type={socialModalType}
          onClose={() => setSocialModalType(null)}
        />
      )}

      <Modal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="🔐 LOGIN REQUIRED"
      >
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">You need to be logged in to follow users.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowLoginPrompt(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold uppercase tracking-wide"
            >
              Continue Browsing
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLoginPrompt(false);
                navigate('/');
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 text-center font-bold uppercase tracking-wide shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, challengeAPI, feedAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import FollowersModal from '../components/FollowersModal';
import Modal from '../components/Modal';
import ProfileView from '../components/ProfileView';

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

function getActivityText(activity) {
  const challenge = activity.challengeId?.title || 'a challenge';

  if (activity.type === 'checkin') {
    return `completed Day ${activity.meta?.day} of ${challenge} on ${activity.meta?.mode}`;
  }
  if (activity.type === 'completed_challenge') {
    return `completed ${challenge} challenge on ${activity.meta?.mode}`;
  }
  if (activity.type === 'badge_earned') {
    return `earned the ${activity.meta?.badge} badge`;
  }
  return 'did something awesome';
}

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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!profile) return <div className="flex items-center justify-center h-screen">User not found</div>;

  return (
    <div className="pb-20 sm:pb-0 bg-[#FAFAF8] text-gray-900 font-sans min-h-screen">
      <ProfileView
        profile={profile}
        stats={stats}
        activities={activities}
        showActivities
        getActivityText={getActivityText}
        timeAgo={timeAgo}
        onSocialClick={setSocialModalType}
        actions={
          <>
            {!isCurrentProfile && (
              <button
                type="button"
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isFollowing
                    ? 'border border-[#ECECEC] bg-white text-gray-600 hover:bg-gray-50'
                    : 'bg-[#6366F1] text-white hover:bg-indigo-700 shadow-sm'
                } disabled:opacity-50`}
              >
                {!user ? 'Login required' : followLoading ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/leaderboard')}
              className="rounded-xl border border-[#ECECEC] bg-white px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
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
        title="Login Required"
      >
        <div className="space-y-4">
          <p className="text-gray-600">You need to be logged in to follow users.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowLoginPrompt(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Continue Browsing
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLoginPrompt(false);
                navigate('/');
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

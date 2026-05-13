import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { Card } from '../components/UI';

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

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Filter out activities from demo/test users
  const isDemoUser = (activity) => {
    const demoPatterns = ['demo', 'test', 'sample', 'fake', 'mock', 'placeholder'];
    const userName = (activity.userId?.name || '').toLowerCase();
    const userExists = activity.userId && activity.userId._id;
    // Filter out if no valid user or if user name contains demo patterns
    return !userExists || demoPatterns.some(pattern => userName.includes(pattern));
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await feedAPI.getAll();
        // Filter out activities from demo/test users
        const filteredActivities = (res.data || []).filter(activity => !isDemoUser(activity));
        setActivities(filteredActivities);
        setLoading(false);
      } catch (err) {
        setToast({ message: 'Failed to load feed', type: 'error' });
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleLike = async (activityId) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const res = await feedAPI.like(activityId);
      setActivities(activities.map(a => 
        a._id === activityId 
          ? { ...a, likesCount: res.data.likes }
          : a
      ));
    } catch (err) {
      setToast({ message: 'Failed to like', type: 'error' });
    }
  };

  const handleComment = async (activityId) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const text = commentText[activityId];
    if (!text?.trim()) return;

    try {
      const res = await feedAPI.comment(activityId, text);
      setActivities(activities.map(a => 
        a._id === activityId 
          ? { ...a, comments: res.data }
          : a
      ));
      setCommentText({ ...commentText, [activityId]: '' });
    } catch (err) {
      setToast({ message: 'Failed to comment', type: 'error' });
    }
  };

  const getActivityText = (activity) => {
    const user = activity.userId?.name || 'Someone';
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

  const getLikeCount = (activity) => {
    if (typeof activity.likesCount === 'number') return activity.likesCount;
    return activity.likes?.length || 0;
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0 bg-[#FAFAF8] text-gray-900 font-sans min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Activity Feed</h1>
          <p className="mt-2 text-gray-500">See what others are accomplishing.</p>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#ECECEC] rounded-[24px]">
              <p className="text-gray-500 text-lg font-medium">No recent activity found.</p>
            </div>
          ) : (
            activities.map(activity => (
              <div key={activity._id} className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
                {/* Activity Header */}
                <div className="flex gap-4 mb-3">
                  {activity.userId?.avatar && (
                    <img
                      src={activity.userId.avatar}
                      alt={activity.userId.name}
                      className="w-10 h-10 rounded-full border border-[#ECECEC]"
                    />
                  )}
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">{activity.userId?.name || 'User'}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>

                {/* Like Button */}
                <div className="border-t border-[#ECECEC] pt-4 mb-4 mt-2">
                  <button
                    onClick={() => handleLike(activity._id)}
                    disabled={!user}
                    className={`transition font-medium text-sm flex items-center gap-2 ${
                      user
                        ? 'text-gray-500 hover:text-red-500 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className={activity.likes?.includes(user?._id) ? "text-red-500" : ""}>♥️</span> {activity.likes?.length || 0}
                  </button>
                </div>

                {/* Comments */}
                {activity.comments && activity.comments.length > 0 && (
                  <div className="mb-4 space-y-2 bg-gray-50 border border-[#ECECEC] p-4 rounded-xl">
                    {activity.comments.map((comment, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-semibold text-gray-800 text-xs">{comment.userId?.name || 'User'}</p>
                        <p className="text-gray-600 mt-0.5">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={user ? "Write a comment..." : "Log in to comment"}
                    value={commentText[activity._id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [activity._id]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleComment(activity._id);
                      }
                    }}
                    disabled={!user}
                    className={`flex-grow px-4 py-2 border rounded-xl text-sm focus:outline-none placeholder-gray-400 text-gray-900 ${
                      user
                        ? 'border-[#ECECEC] bg-white focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'
                        : 'border-[#ECECEC] bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                  <button
                    onClick={() => handleComment(activity._id)}
                    disabled={!user}
                    className={`px-5 py-2 rounded-xl transition text-sm font-medium ${
                      user
                        ? 'bg-[#6366F1] text-white hover:bg-indigo-700 shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>

      <Modal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Login Required"
      >
        <div className="space-y-4">
          <p className="text-gray-600">You need to be logged in to like and comment on activities.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Continue Browsing
            </button>
            <button
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

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

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-bounce text-2xl font-black text-white">Loading...</div></div>;

  return (
    <div className="pt-24 pb-20 sm:pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white tracking-wider drop-shadow-lg">📢 ACTIVITY FEED</h1>
          <p className="mt-2 text-purple-300 font-semibold">See what others are accomplishing. 🏆</p>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-purple-500 shadow-2xl">
              <p className="text-white text-lg font-bold">📭 No recent activity found.</p>
            </div>
          ) : (
            activities.map(activity => (
              <div key={activity._id} className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500 rounded-2xl p-6 shadow-2xl hover:border-pink-500 transition-all">
                {/* Activity Header */}
                <div className="flex gap-4 mb-3">
                  {activity.userId?.avatar && (
                    <img
                      src={activity.userId.avatar}
                      alt={activity.userId.name}
                      className="w-12 h-12 rounded-full border-2 border-purple-400 shadow-lg"
                    />
                  )}
                  <div className="flex-grow">
                    <p className="font-black text-white">{activity.userId?.name || 'User'}</p>
                    <p className="text-sm text-purple-300 capitalize font-semibold">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-purple-200 mt-1 font-bold uppercase tracking-wide">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>

                {/* Like Button */}
                <div className="border-t-2 border-purple-500 pt-4 mb-4 mt-2">
                  <button
                    onClick={() => handleLike(activity._id)}
                    disabled={!user}
                    className={`transition font-bold text-sm flex items-center gap-2 uppercase tracking-wide ${
                      user
                        ? 'text-purple-300 hover:text-pink-400 cursor-pointer'
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className={activity.likes?.includes(user?._id) ? "text-pink-500 text-xl" : "text-lg"}>♥️</span> {activity.likes?.length || 0}
                  </button>
                </div>

                {/* Comments */}
                {activity.comments && activity.comments.length > 0 && (
                  <div className="mb-4 space-y-2 bg-slate-600 bg-opacity-50 border-l-4 border-cyan-400 p-4 rounded-lg">
                    {activity.comments.map((comment, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-bold text-cyan-300 text-xs uppercase tracking-wide">{comment.userId?.name || 'User'}</p>
                        <p className="text-purple-200 mt-0.5 font-semibold">{comment.text}</p>
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
                    className={`flex-grow px-4 py-2 border-2 rounded-xl text-sm focus:outline-none placeholder-purple-300 text-white font-semibold ${
                      user
                        ? 'border-purple-500 bg-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                        : 'border-slate-600 bg-slate-700 cursor-not-allowed'
                    }`}
                  />
                  <button
                    onClick={() => handleComment(activity._id)}
                    disabled={!user}
                    className={`px-5 py-2 rounded-xl transition text-sm font-bold uppercase tracking-wide ${
                      user
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg'
                        : 'bg-slate-600 text-gray-400 cursor-not-allowed'
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
        title="🔐 LOGIN REQUIRED"
      >
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">You need to be logged in to like and comment on activities.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold uppercase tracking-wide"
            >
              Continue Browsing
            </button>
            <button
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

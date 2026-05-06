import React, { useState, useEffect } from 'react';
import { feedAPI } from '../api/client';
import Toast from '../components/Toast';
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
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await feedAPI.getAll();
        setActivities(res.data);
        setLoading(false);
      } catch (err) {
        setToast({ message: 'Failed to load feed', type: 'error' });
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleLike = async (activityId) => {
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
    <div className="pb-20 sm:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          <p className="mt-2 text-gray-600">Your activity and updates from people you follow.</p>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600 text-lg">No activities yet. Start completing challenges!</p>
            </Card>
          ) : (
            activities.map(activity => (
              <Card key={activity._id}>
                {/* Activity Header */}
                <div className="flex gap-4 mb-3">
                  {activity.userId?.avatar && (
                    <img
                      src={activity.userId.avatar}
                      alt={activity.userId.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-grow">
                    <p className="font-bold">{activity.userId?.name || 'User'}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>

                {/* Like Button */}
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <button
                    onClick={() => handleLike(activity._id)}
                    className="text-gray-600 hover:text-red-500 transition font-medium text-sm flex items-center gap-2"
                  >
                    <span>♥️</span> {activity.likes?.length || 0}
                  </button>
                </div>

                {/* Comments */}
                {activity.comments && activity.comments.length > 0 && (
                  <div className="mb-3 space-y-2 bg-gray-50 p-3 rounded">
                    {activity.comments.map((comment, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-bold text-gray-800">{comment.userId?.name || 'User'}</p>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText[activity._id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [activity._id]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleComment(activity._id);
                      }
                    }}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleComment(activity._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    Post
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

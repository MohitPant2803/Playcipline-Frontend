import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from './UI';

export default function FollowersModal({ userId, type = 'followers', onClose }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Filter out demo/test users
  const isDemoUser = (user) => {
    const demoPatterns = ['demo', 'test', 'sample', 'fake', 'mock', 'placeholder'];
    const name = (user.name || '').toLowerCase();
    return demoPatterns.some(pattern => name.includes(pattern));
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = type === 'followers'
          ? await userAPI.getFollowers(userId)
          : await userAPI.getFollowing(userId);
        // Filter out demo/test users
        const filteredUsers = (res.data || []).filter(user => !isDemoUser(user));
        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        console.log('Failed to load list');
        setLoading(false);
      }
    };

    if (userId) {
      fetchList();
    }
  }, [userId, type]);

  const handleUserClick = (targetUserId) => {
    navigate(`/user/${targetUserId}`);
    onClose();
  };

  const handleFollowToggle = async (event, targetUser) => {
    event.stopPropagation();

    if (!currentUser) {
      onClose();
      navigate('/login');
      return;
    }

    if (targetUser._id === currentUser._id || targetUser.isCurrentUser) {
      return;
    }

    setUpdatingUserId(targetUser._id);
    try {
      const res = targetUser.isFollowing
        ? await userAPI.unfollow(targetUser._id)
        : await userAPI.follow(targetUser._id);

      setUsers(currentUsers => currentUsers.map(listUser => (
        listUser._id === targetUser._id
          ? { ...listUser, isFollowing: res.data.isFollowing }
          : listUser
      )));
    } catch (err) {
      console.log('Failed to update follow status');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="bg-white p-8 rounded-lg shadow-2xl">
          <p>Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-md max-h-96 overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 -m-6 mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold capitalize">{type}</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No {type} yet</p>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                onClick={() => handleUserClick(user._id)}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">Level {user.level}</p>
                </div>
                {user._id !== currentUser?._id && !user.isCurrentUser && (
                  <button
                    type="button"
                    onClick={(event) => handleFollowToggle(event, user)}
                    disabled={updatingUserId === user._id}
                    className={`ml-auto min-w-[92px] rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      user.isFollowing
                        ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {updatingUserId === user._id ? '...' : user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

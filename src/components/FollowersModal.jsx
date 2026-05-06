import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/client';
import { Card } from './UI';

export default function FollowersModal({ userId, type = 'followers', onClose }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = type === 'followers'
          ? await userAPI.getFollowers(userId)
          : await userAPI.getFollowing(userId);
        setUsers(res.data);
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
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { challengeAPI, checkinAPI } from '../api/client';
import Toast from '../components/Toast';
import { Card, Badge, Button, ProgressBar } from '../components/UI';
import XPProgressCard from '../components/XPProgressCard';
import { getLevelInfo } from '../utils/leveling';

export default function Dashboard() {
  const { user, mergeUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [checkedInToday, setCheckedInToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [checking, setChecking] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chalRes, statusRes] = await Promise.all([
          challengeAPI.getMyChall(),
          checkinAPI.getTodayStatus()
        ]);
        setChallenges(chalRes.data.filter(c => c.status === 'active'));
        setCheckedInToday(statusRes.data);
        setLoading(false);
      } catch (err) {
        setToast({ message: 'Failed to load challenges', type: 'error' });
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCheckin = async (userChallengeId) => {
    setChecking({ ...checking, [userChallengeId]: true });
    try {
      const res = await checkinAPI.checkin(userChallengeId);
      setCheckedInToday([...checkedInToday, userChallengeId]);
      setToast({ message: `+${res.data.xpEarned} XP earned!`, type: 'success' });
      mergeUser({
        totalXP: res.data.totalXP,
        level: res.data.level,
        globalStreak: res.data.globalStreak
      });
      
      // Update challenge status if completed/failed
      if (res.data.status !== 'active') {
        setChallenges(challenges.filter(c => c._id !== userChallengeId));
      }
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Check-in failed', type: 'error' });
    } finally {
      setChecking({ ...checking, [userChallengeId]: false });
    }
  };

  const getModeColor = (mode) => {
    return mode === 'easy' ? 'green' : mode === 'medium' ? 'yellow' : 'red';
  };

  const levelInfo = getLevelInfo(user?.totalXP || 0);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <XPProgressCard totalXP={user?.totalXP || 0} className="mb-8" />

        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <p className="text-gray-600 text-sm">Total XP</p>
            <p className="text-3xl font-bold text-blue-600">{user?.totalXP || 0}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Level</p>
            <p className="text-3xl font-bold text-purple-600">{levelInfo.level}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Global Streak</p>
            <p className="text-3xl font-bold text-orange-600">{user?.globalStreak || 0} 🔥</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Active Challenges</p>
            <p className="text-3xl font-bold text-green-600">{challenges.length}</p>
          </Card>
        </div>

        {/* Today's Challenges */}
        <h2 className="text-2xl font-bold mb-4">Today's Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {challenges.length === 0 ? (
            <Card className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No active challenges. Start one in Explore!</p>
            </Card>
          ) : (
            challenges.map(uc => (
              <Card key={uc._id}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{uc.challengeId?.title || 'Challenge'}</h3>
                  <Badge text={uc.mode.toUpperCase()} color={getModeColor(uc.mode)} />
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {uc.completedDays} / {uc.requiredDays} days
                  </p>
                  <ProgressBar current={uc.completedDays} total={uc.requiredDays} />
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Streak: <span className="font-bold text-orange-600">{uc.currentStreak}</span> 🔥</p>
                </div>

                <Button
                  onClick={() => handleCheckin(uc._id)}
                  disabled={checkedInToday.includes(uc._id) || checking[uc._id]}
                  variant={checkedInToday.includes(uc._id) ? 'secondary' : 'primary'}
                  size="md"
                  className="w-full"
                >
                  {checkedInToday.includes(uc._id) ? 'Done today ✓' : 'Complete Day'}
                </Button>
              </Card>
            ))
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

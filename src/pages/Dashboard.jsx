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
  const [leaving, setLeaving] = useState({});

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
        globalStreak: res.data.globalStreak,
        longestStreak: res.data.longestStreak
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

  const handleLeave = async (userChallengeId) => {
    setLeaving({ ...leaving, [userChallengeId]: true });
    try {
      await challengeAPI.leave(userChallengeId);
      setChallenges(challenges.filter(challenge => challenge._id !== userChallengeId));
      setToast({ message: 'Challenge de-enrolled.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to de-enroll', type: 'error' });
    } finally {
      setLeaving({ ...leaving, [userChallengeId]: false });
    }
  };

  const levelInfo = getLevelInfo(user?.totalXP || 0);
  const maxActiveChallenges = 3;
  const completedTodayCount = challenges.filter(challenge => checkedInToday.includes(challenge._id)).length;
  const remainingTodayCount = Math.max(0, challenges.length - completedTodayCount);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
        </div>

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
            <p className="text-gray-600 text-sm">Active Slots</p>
            <p className="text-3xl font-bold text-green-600">{challenges.length}/{maxActiveChallenges}</p>
            <p className="mt-1 text-xs font-semibold text-gray-500">Max 3 active challenges</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
          <Card className="border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Daily Tasks</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{remainingTodayCount} remaining</p>
            <p className="mt-1 text-sm text-gray-600">{completedTodayCount} completed today</p>
          </Card>
          <Card className="border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Challenge Capacity</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {Math.max(0, maxActiveChallenges - challenges.length)} slots open
            </p>
            <p className="mt-1 text-sm text-gray-600">Keep no more than 3 active at once.</p>
          </Card>
          <Card className="border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Today Focus</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {remainingTodayCount === 0 ? 'Clear' : 'Check in'}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {remainingTodayCount === 0 ? 'All active challenges are done today.' : 'Finish each due challenge below.'}
            </p>
          </Card>
        </div>

        {/* Today's Challenges */}
        <h2 className="text-2xl font-bold mb-4">Daily Tasks</h2>
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

                <div className="grid gap-2">
                  <Button
                    onClick={() => handleCheckin(uc._id)}
                    disabled={checkedInToday.includes(uc._id) || checking[uc._id]}
                    variant={checkedInToday.includes(uc._id) ? 'secondary' : 'primary'}
                    size="md"
                    className="w-full"
                  >
                    {checkedInToday.includes(uc._id) ? 'Done today ✓' : 'Complete Day'}
                  </Button>
                  <Button
                    onClick={() => handleLeave(uc._id)}
                    disabled={leaving[uc._id]}
                    variant="danger"
                    size="md"
                    className="w-full"
                  >
                    {leaving[uc._id] ? 'Leaving...' : 'De-enroll'}
                  </Button>
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

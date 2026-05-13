import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { challengeAPI, checkinAPI } from '../api/client';
import Toast from '../components/Toast';
import { Card, Badge, Button, ProgressBar } from '../components/UI';
import XPProgressCard from '../components/XPProgressCard';
import { getLevelInfo } from '../utils/leveling';
import { useDailyCheckInCountdown } from '../hooks/useDailyCheckIn';
import { formatTimeUntilReset } from '../utils/dailyTimer';

export default function Dashboard() {
  const { user, mergeUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [checkedInToday, setCheckedInToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [checking, setChecking] = useState({});
  const [leaving, setLeaving] = useState({});
  const timeRemaining = useDailyCheckInCountdown();

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

  // Refetch check-in status when daily window resets (at 12:20 AM)
  useEffect(() => {
    // If time remaining is very small (less than 2 seconds), we're near the reset
    if (timeRemaining.total > 0 && timeRemaining.total < 2000) {
      // Wait a bit for 12:20 AM to fully pass, then refetch
      const refetchTimer = setTimeout(async () => {
        try {
          const [chalRes, statusRes] = await Promise.all([
            challengeAPI.getMyChall(),
            checkinAPI.getTodayStatus()
          ]);
          setChallenges(chalRes.data.filter(c => c.status === 'active'));
          setCheckedInToday(statusRes.data);
        } catch (err) {
          console.error('Failed to refresh check-in status after reset:', err);
        }
      }, 1500);

      return () => clearTimeout(refetchTimer);
    }
  }, [timeRemaining.total]);

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
        longestStreak: res.data.longestStreak,
        lastActiveDate: res.data.lastActiveDate
      });
      
      // Update challenge with new streak and completed days
      setChallenges(challenges.map(c => {
        if (c._id === userChallengeId) {
          return {
            ...c,
            currentStreak: res.data.currentStreak,
            completedDays: res.data.completedDays,
            status: res.data.status
          };
        }
        return c;
      }));
      
      // Remove challenge if completed/failed
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

  const levelInfo = getLevelInfo(user?.totalXP || 0);
  const maxActiveChallenges = 3;
  const completedTodayCount = challenges.filter(challenge => checkedInToday.includes(challenge._id)).length;
  const remainingTodayCount = Math.max(0, challenges.length - completedTodayCount);
  const currentStreak = getEffectiveStreak();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="pb-20 sm:pb-0 bg-[#FAFAF8] text-gray-900 font-sans min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        </div>

        <XPProgressCard totalXP={user?.totalXP || 0} className="mb-8" />

        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total XP</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2 tabular-nums">{user?.totalXP || 0}</p>
          </div>
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Level</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2 tabular-nums">{levelInfo.level}</p>
          </div>
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Global Streak</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2 tabular-nums">{currentStreak} <span className="text-lg font-normal text-gray-400">days</span></p>
          </div>
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm relative overflow-hidden">
            <p className="text-xs font-medium text-gray-500">Active Slots</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2 tabular-nums">{challenges.length}/{maxActiveChallenges}</p>
            <p className="mt-1 text-xs text-gray-400 absolute bottom-4 right-5">MAX 3</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Daily Tasks</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">{remainingTodayCount} remaining</p>
            <p className="mt-1 text-sm text-gray-500">{completedTodayCount} completed today</p>
          </div>
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Challenge Capacity</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">
              {Math.max(0, maxActiveChallenges - challenges.length)} slots open
            </p>
            <p className="mt-1 text-sm text-gray-500">Keep max 3 active.</p>
          </div>
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Daily Focus</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {remainingTodayCount === 0 ? 'All Done' : 'Check In'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {remainingTodayCount === 0 ? 'Great job today.' : 'Complete your pending tasks.'}
            </p>
          </div>
        </div>

        {/* Today's Challenges */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Active Challenges</h2>
        
        {/* Daily Check-in Timer - Only show if user has active challenges */}
        {challenges.length > 0 && (
          <div className="mb-6 p-5 bg-white border border-[#ECECEC] shadow-sm rounded-[24px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Daily Reset in:</p>
                <p className="text-xl font-semibold text-gray-900 tabular-nums mt-1">
                  {formatTimeUntilReset(timeRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {challenges.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white border border-[#ECECEC] rounded-[24px]">
              <p className="text-gray-500 text-lg font-medium">No active challenges. Start one in Explore.</p>
            </div>
          ) : (
            challenges.map(uc => {
              const isCheckedInToday = checkedInToday.includes(uc._id);
              
              return (
              <div key={uc._id} className="flex flex-col bg-white border border-[#ECECEC] rounded-[24px] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{uc.challengeId?.title || 'Challenge'}</h3>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-600">
                    {uc.mode}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-2 flex justify-between">
                    <span>Phase Progress</span>
                    <span className="text-gray-900">{uc.completedDays} / {uc.requiredDays} days</span>
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div 
                      className="h-full rounded-full bg-[#6366F1] transition-all duration-[800ms] ease-out" 
                      style={{ width: `${Math.min(100, Math.max(0, (uc.completedDays / uc.requiredDays) * 100))}%` }} 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500">Streak: <span className="font-semibold text-gray-900 tabular-nums">{uc.currentStreak} days</span></p>
                </div>

                <div className="grid gap-3 mt-auto pt-2">
                  <button
                    onClick={() => handleCheckin(uc._id)}
                    disabled={isCheckedInToday || checking[uc._id]}
                    className={`w-full font-medium rounded-xl py-2.5 transition-colors text-sm ${
                      isCheckedInToday 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#6366F1] text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    {isCheckedInToday ? 'Checked In' : checking[uc._id] ? 'Syncing...' : 'Check In'}
                  </button>
                  <button
                    onClick={() => handleLeave(uc._id)}
                    disabled={leaving[uc._id]}
                    className="w-full font-medium bg-white border border-[#ECECEC] text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl py-2.5 transition-colors text-sm"
                  >
                    {leaving[uc._id] ? 'Leaving...' : 'Leave Challenge'}
                  </button>
                </div>
              </div>
            );
            })
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

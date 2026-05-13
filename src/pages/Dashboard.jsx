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

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-bounce text-2xl font-black">Loading...</div></div>;

  return (
    <div className="pt-24 pb-20 sm:pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-black tracking-wider drop-shadow-lg">⚡ DASHBOARD</h1>
        </div>

        <XPProgressCard totalXP={user?.totalXP || 0} className="mb-8" />

        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 shadow-2xl border-2 border-cyan-400">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-100">📊 Total XP</p>
            <p className="text-3xl font-black mt-2 tabular-nums text-white drop-shadow-lg">{user?.totalXP || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 shadow-2xl border-2 border-pink-400">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-100">🎯 Level</p>
            <p className="text-3xl font-black mt-2 tabular-nums text-white drop-shadow-lg">{levelInfo.level}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl p-6 shadow-2xl border-2 border-orange-400">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-100">🔥 Global Streak</p>
            <p className="text-3xl font-black mt-2 tabular-nums text-white drop-shadow-lg">{currentStreak} <span className="text-lg font-bold text-orange-100">days</span></p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-6 shadow-2xl border-2 border-green-400 relative overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-widest text-green-100">💪 Active Slots</p>
            <p className="text-3xl font-black mt-2 tabular-nums text-white drop-shadow-lg">{challenges.length}/{maxActiveChallenges}</p>
            <p className="mt-1 text-xs text-green-100 absolute bottom-4 right-5 font-bold">MAX 3</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl p-6 shadow-2xl border-2 border-blue-400">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-100">✅ Daily Tasks</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-white drop-shadow-lg">{remainingTodayCount} remaining</p>
            <p className="mt-1 text-sm text-blue-100 font-semibold">{completedTodayCount} completed today</p>
          </div>
          <div className="bg-gradient-to-br from-rose-600 to-pink-500 rounded-2xl p-6 shadow-2xl border-2 border-pink-400">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-100">📈 Challenge Capacity</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-white drop-shadow-lg">
              {Math.max(0, maxActiveChallenges - challenges.length)} slots open
            </p>
            <p className="mt-1 text-sm text-pink-100 font-semibold">Keep max 3 active.</p>
          </div>
          <div className="bg-gradient-to-br from-amber-600 to-orange-500 rounded-2xl p-6 shadow-2xl border-2 border-amber-400">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-100">🎯 Daily Focus</p>
            <p className="mt-2 text-2xl font-black text-white drop-shadow-lg">
              {remainingTodayCount === 0 ? 'All Done' : 'Check In'}
            </p>
            <p className="mt-1 text-sm text-amber-100 font-semibold">
              {remainingTodayCount === 0 ? 'Great job today.' : 'Complete your pending tasks.'}
            </p>
          </div>
        </div>

        {/* Today's Challenges */}
        <h2 className="text-3xl font-black text-white mb-6 tracking-wider drop-shadow-lg">⚔️ ACTIVE CHALLENGES</h2>
        
        {/* Daily Check-in Timer - Only show if user has active challenges */}
        {challenges.length > 0 && (
          <div className="mb-6 p-5 bg-gradient-to-r from-cyan-600 to-blue-600 shadow-2xl rounded-2xl border-2 border-cyan-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-100">⏱️ Daily Reset in:</p>
                <p className="text-xl font-black text-white tabular-nums mt-1 drop-shadow-lg">
                  {formatTimeUntilReset(timeRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {challenges.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-purple-500 shadow-2xl">
              <p className="text-white text-lg font-bold">🎯 No active challenges. Start one in Explore.</p>
            </div>
          ) : (
            challenges.map(uc => {
              const isCheckedInToday = checkedInToday.includes(uc._id);
              
              return (
              <div key={uc._id} className="flex flex-col bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500 rounded-2xl p-6 shadow-2xl hover:border-pink-500 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-white drop-shadow-lg">{uc.challengeId?.title || 'Challenge'}</h3>
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide ${
                    uc.mode === 'easy' ? 'bg-green-500 text-white' : uc.mode === 'medium' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {uc.mode}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs font-bold text-purple-300 mb-2 flex justify-between uppercase tracking-wide">
                    <span>🎯 Phase Progress</span>
                    <span className="text-white">{uc.completedDays} / {uc.requiredDays} days</span>
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-600 border border-slate-500">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-[800ms] ease-out shadow-lg" 
                      style={{ width: `${Math.min(100, Math.max(0, (uc.completedDays / uc.requiredDays) * 100))}%` }} 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide">🔥 Streak: <span className="font-black text-white tabular-nums">{uc.currentStreak} days</span></p>
                </div>

                <div className="grid gap-3 mt-auto pt-2">
                  <button
                    onClick={() => handleCheckin(uc._id)}
                    disabled={isCheckedInToday || checking[uc._id]}
                    className={`w-full font-bold rounded-xl py-3 transition-all text-sm uppercase tracking-wide ${
                      isCheckedInToday 
                        ? 'bg-slate-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg hover:shadow-2xl'
                    }`}
                  >
                    {isCheckedInToday ? '✅ Checked In' : checking[uc._id] ? '⏳ Syncing...' : '✨ Check In'}
                  </button>
                  <button
                    onClick={() => handleLeave(uc._id)}
                    disabled={leaving[uc._id]}
                    className="w-full font-bold bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 rounded-xl py-3 transition-all text-sm uppercase tracking-wide shadow-lg hover:shadow-2xl"
                  >
                    {leaving[uc._id] ? '⏳ Leaving...' : '🚫 Leave Challenge'}
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

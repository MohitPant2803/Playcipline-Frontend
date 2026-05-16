import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { challengeAPI, checkinAPI } from '../api/client';
import Toast from '../components/Toast';
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

  const handleLeave = async (userChallengeId) => {
    if (!window.confirm("Are you sure you want to abandon this path? Your progress will be lost.")) return;
    
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#020617] to-[#020617]"></div>
      <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(34,211,238,0.3)]"></div>
      <div className="animate-pulse text-xs font-black text-slate-500 uppercase tracking-widest drop-shadow-md">Initializing System...</div>
    </div>
  );

  return (
    <div className="pt-32 pb-20 sm:pb-0 bg-[#020617] text-white font-sans min-h-screen relative overflow-hidden selection:bg-purple-500/30">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 bg-[#020617] -z-20 pointer-events-none"></div>
      
      {/* Subtle Grid Texture for OS feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none"></div>

      {/* Deep Atmospheric Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#020617]/80 to-[#020617] -z-10 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen -z-10"></div>
      <div className="absolute top-1/4 left-0 w-[50vw] h-[50vw] max-w-[800px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse -z-10" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 right-0 w-[50vw] h-[50vw] max-w-[800px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse -z-10" style={{ animationDuration: '12s' }}></div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 relative z-10">
        <div className="mb-16 sm:mb-20 text-center flex flex-col items-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-purple-500/20 blur-[80px] pointer-events-none -z-10"></div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] mb-6 relative z-10">Your Evolution</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-black tracking-[0.3em] uppercase relative z-10 drop-shadow-md">Consistency compounds silently.</p>
        </div>

        <XPProgressCard totalXP={user?.totalXP || 0} />

        {/* Cinematic Context Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-20 px-2 sm:px-0">
          
          {/* Progression */}
          <div className="flex flex-col border-l border-white/10 pl-5 sm:pl-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 drop-shadow-sm">Current Level</p>
            <p className="text-lg sm:text-xl font-bold text-white tracking-wide mb-1 drop-shadow-md">Level {levelInfo.level}</p>
            <p className="text-xs text-slate-300 font-medium">{levelInfo.xpNeededForNextLevel} XP to next evolution</p>
          </div>

          {/* Streak */}
          <div className="flex flex-col border-l border-white/10 pl-5 sm:pl-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 drop-shadow-sm">Momentum</p>
            <p className="text-lg sm:text-xl font-bold text-white tracking-wide mb-1 drop-shadow-md">{currentStreak} Days Active</p>
            <p className="text-xs text-slate-300 font-medium">Personal best: {user?.longestStreak || 0} days</p>
          </div>

          {/* Active Challenges */}
          <div className="flex flex-col border-l border-white/10 pl-5 sm:pl-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 drop-shadow-sm">System Bandwidth</p>
            <p className="text-lg sm:text-xl font-bold text-white tracking-wide mb-1 drop-shadow-md">{challenges.length} Active Paths</p>
            <p className="text-xs text-slate-300 font-medium">{Math.max(0, maxActiveChallenges - challenges.length)} slots available</p>
          </div>

          {/* Daily Execution / Tasks */}
          <div className="flex flex-col border-l border-white/10 pl-5 sm:pl-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 drop-shadow-sm">Daily Directives</p>
            <p className="text-lg sm:text-xl font-bold text-white tracking-wide mb-1 drop-shadow-md">{completedTodayCount} of {challenges.length} Done</p>
            <p className="text-xs text-slate-300 font-medium">{remainingTodayCount === 0 ? 'All protocols finished' : `${remainingTodayCount} awaiting execution`}</p>
          </div>

        </div>

        {/* Today's Challenges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-24 bg-cyan-500/10 blur-[50px] pointer-events-none -z-10"></div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider drop-shadow-lg uppercase relative z-10">Active Evolutions</h2>
          {challenges.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-900/20 border border-cyan-500/20 rounded-full px-4 py-2 shadow-[0_0_15px_rgba(34,211,238,0.1)] backdrop-blur-md relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Cycle Ends In {formatTimeUntilReset(timeRemaining)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {challenges.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#11111c]/60 border border-white/[0.06] rounded-[2rem] backdrop-blur-xl shadow-lg">
              <p className="text-slate-400 font-medium tracking-wide">Your journey awaits. Select a domain in Explore to begin.</p>
            </div>
          ) : (
            challenges.map(uc => {
              const isCheckedInToday = checkedInToday.includes(uc._id);
              
              return (
              <div key={uc._id} className="bg-[#11111c]/60 border border-white/[0.06] p-6 sm:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-[#11111c]/80 hover:border-white/10 transition-all duration-500 ease-out group relative overflow-hidden backdrop-blur-xl flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors duration-700 pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg tracking-tighter leading-tight pr-4">{uc.challengeId?.title || 'Challenge'}</h3>
                  <span className={`px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-[0.2em] border shrink-0 ${
                    uc.mode === 'easy' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : uc.mode === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
                  }`}>
                    {uc.mode} Mode
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-[10px] font-black text-slate-400 mb-3 flex justify-between uppercase tracking-widest drop-shadow-sm">
                    <span>Evolution Progress</span>
                    <span className="text-cyan-400">{uc.completedDays} / {uc.requiredDays} Days</span>
                  </p>
                  <div className="w-full bg-white/[0.03] rounded-full h-1.5 overflow-hidden border border-white/[0.05] relative shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-cyan-300 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
                      style={{ width: `${Math.min(100, Math.max(0, (uc.completedDays / uc.requiredDays) * 100))}%` }}
                    >
                      {/* Animated Highlight Tip */}
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest drop-shadow-sm">Momentum: <span className="text-white drop-shadow-md tabular-nums ml-2 text-xs">{uc.currentStreak} Days</span></p>
                </div>

                <div className="mt-auto pt-2 relative z-10">
                  {isCheckedInToday ? (
                    <button
                      disabled
                      className="relative w-full rounded-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300 transition-all duration-500 border border-cyan-500/20 bg-cyan-900/20 shadow-[0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-md cursor-default overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Protocol Executed
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckin(uc._id)}
                      disabled={checking[uc._id]}
                      className="relative w-full rounded-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all duration-500 overflow-hidden group/execute border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-md shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover/execute:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover/execute:translate-x-[100%] ease-in-out"></div>
                      <span className="relative z-10">{checking[uc._id] ? 'Synchronizing...' : 'Execute Protocol'}</span>
                    </button>
                  )}
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

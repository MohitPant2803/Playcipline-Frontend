import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge } from './UI';
import { getLevelInfo } from '../utils/leveling';
import IdentityGraph from '../pages/IdentityGraph';
import UserAvatar from './UserAvatar';

const ALL_BADGES = ['7-day', '21-day', '75-hard', 'hard-mode', 'perfect-streak'];

function formatBadgeName(badge) {
  return String(badge || '').replace(/-/g, ' ');
}

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getActivityText(activity) {
  const challenge = activity.challengeId?.title || 'a challenge';
  if (activity.type === 'checkin') {
    return `completed Day ${activity.meta?.day} of ${challenge} on ${activity.meta?.mode}`;
  } else if (activity.type === 'completed_challenge') {
    return `completed ${challenge} challenge on ${activity.meta?.mode}`;
  } else if (activity.type === 'badge_earned') {
    return `earned the ${activity.meta?.badge} badge`;
  }
  return 'did something awesome';
}

// High-Performance Cinematic Motion System (Ported from Explore)
function useScrollReveal(options = { threshold: 0.2 }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [options.threshold, options.rootMargin]);
  return [ref, inView];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useScrollReveal({ threshold: 0, rootMargin: '100px' });
  const baseClass = "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform";
  return (
    <div ref={ref} className={`${baseClass} ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function ProfileView({
  profile,
  stats,
  actions,
  isEditing = false,
  form,
  saving = false,
  onFormChange,
  onSaveProfile,
  onSocialClick,
  activities = [],
  showActivities = false,
  onAvatarClick,
  currentPersonaObj,
  onCloseEdit
}) {
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const displayedActivities = activities.slice(0, 3);
  const earnedBadges = profile?.badges || [];
  const unearnedBadges = ALL_BADGES.filter(badge => !earnedBadges.includes(badge));
  const followerCount = profile?.followerCount ?? profile?.followers ?? 0;
  const followingCount = profile?.followingCount ?? profile?.following ?? 0;
  const completedChallenges = stats?.allChallenges?.filter(challenge => challenge.status === 'completed') || [];
  const completedCount = stats?.completedChallenges ?? completedChallenges.length;
  const currentStreak = stats?.currentStreak ?? profile?.globalStreak ?? 0;
  const longestStreak = stats?.longestStreak ?? profile?.longestStreak ?? 0;
  const levelInfo = getLevelInfo(profile?.totalXP || 0);
  const levelProgress = levelInfo.xpRange > 0
    ? Math.min(100, Math.max(0, (levelInfo.xpIntoLevel / levelInfo.xpRange) * 100))
    : 100;

  // Profile Power Score calculation
  const powerScore = Math.floor(((profile?.totalXP || 0) * 0.1) + (currentStreak * 15) + (completedCount * 50));
  const circumference = 2 * Math.PI * 48; // r=48
  const strokeDashoffset = circumference - (levelProgress / 100) * circumference;

  return (
    <div className="relative">
      {/* Ambient Global Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Cinematic Hero Section */}
        <Reveal delay={0}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16 relative z-10">
            
            {/* LEFT: Avatar & Info */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Glowing Avatar Ring */}
              <div className="relative w-32 h-32 mb-6 group-hover:scale-105 transition-transform duration-500">
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <circle 
                    cx="50" cy="50" r="48" fill="none" 
                    stroke="url(#purpleGradient)" strokeWidth="2.5" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                    className="transition-all duration-1500 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full overflow-hidden flex items-center justify-center bg-[#020617] border-4 border-[#020617]">
                  <UserAvatar user={profile} size="custom" className="w-full h-full border-none bg-transparent" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#020617] border border-purple-500/50 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  Lvl {levelInfo.level}
                </div>
              </div>

              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md mb-1">{profile?.name}</h1>
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-4">{profile?.location || 'Location Unknown'}</p>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[250px] mb-6 line-clamp-2">
                {profile?.bio || 'Building discipline, one day at a time.'}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <button onClick={() => onSocialClick?.('followers')} className="flex flex-col items-center group/btn focus:outline-none">
                  <span className="text-2xl font-black text-white drop-shadow-md group-hover/btn:text-purple-400 transition-colors">{followerCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Followers</span>
                </button>
                <div className="w-px h-8 bg-white/10"></div>
                <button onClick={() => onSocialClick?.('following')} className="flex flex-col items-center group/btn focus:outline-none">
                  <span className="text-2xl font-black text-white drop-shadow-md group-hover/btn:text-cyan-400 transition-colors">{followingCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Following</span>
                </button>
              </div>

              {actions && <div className="mt-8 flex flex-wrap justify-center gap-3 w-full">{actions}</div>}
            </div>

            {/* CENTER: 3 Premium Stats */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-orange-500/20 transition-colors duration-500"></div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2"><span>🔥</span> Current Streak</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">{currentStreak}</p>
                  <p className="text-sm font-bold text-slate-400 uppercase">Days</p>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-4">Longest: {longestStreak} days</p>
              </div>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-colors duration-500"></div>
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2"><span>⚡</span> Total XP</p>
                <p className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">{profile?.totalXP || 0}</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2"><span>✅</span> Completed</p>
                <p className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">{completedCount}</p>
              </div>
            </div>

            {/* RIGHT: Power Score */}
            <div className="lg:col-span-3 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-[0_0_40px_rgba(79,70,229,0.15)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 relative z-10">Profile Power Score</p>
              <h3 className="text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] relative z-10">{powerScore}</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed relative z-10">Calculated by combining consistency, challenge difficulty, and lifetime experience.</p>
            </div>

          </div>
        </Reveal>

        {isEditing && form && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-4 sm:p-8 animate-fade-in-fast" onClick={onCloseEdit}>
            <form onSubmit={onSaveProfile} onClick={e => e.stopPropagation()} className="w-full max-w-2xl bg-[#12121c]/90 border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">Edit Identity</h3>
                <button type="button" onClick={onCloseEdit} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid gap-6">
                <label className="grid gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  Username
                  <input type="text" value={form.name} onChange={(e) => onFormChange?.({ ...form, name: e.target.value })} placeholder={profile?.name || 'Your name'} className="rounded-xl bg-[#020617]/50 border border-white/10 text-white placeholder-slate-500 px-4 py-3.5 font-bold outline-none focus:border-purple-500 focus:bg-white/5 transition-colors" />
                </label>
                <label className="grid gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest relative">
                  Persona Identity
                  <button
                    type="button"
                    onClick={onAvatarClick}
                    className="rounded-xl bg-[#020617]/50 border border-white/10 text-white px-4 py-3.5 font-bold outline-none hover:border-cyan-500 hover:bg-white/5 transition-colors text-left flex items-center justify-between group shadow-inner"
                  >
                    <span>{currentPersonaObj?.name || (form?.avatar ? 'Custom External Identity' : 'Select your Persona')}</span>
                    <span className="text-cyan-500 group-hover:translate-x-1 transition-transform">Edit ➔</span>
                  </button>
                </label>
                <label className="grid gap-2 text-[10px] font-black text-pink-400 uppercase tracking-widest">
                  Location
                  <input type="text" value={form.location} onChange={(e) => onFormChange?.({ ...form, location: e.target.value })} placeholder="City, Country" className="rounded-xl bg-[#020617]/50 border border-white/10 text-white placeholder-slate-500 px-4 py-3.5 font-bold outline-none focus:border-pink-500 focus:bg-white/5 transition-colors" />
                </label>
                <label className="grid gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Bio
                  <textarea value={form.bio} onChange={(e) => onFormChange?.({ ...form, bio: e.target.value.slice(0, 100) })} placeholder="A short note about your goals (max 100 chars)" maxLength={100} rows={3} className="resize-none rounded-xl bg-[#020617]/50 border border-white/10 text-white placeholder-slate-500 px-4 py-3.5 font-bold outline-none focus:border-emerald-500 focus:bg-white/5 transition-colors" />
                </label>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={onCloseEdit} className="rounded-full bg-transparent text-slate-400 hover:text-white hover:bg-white/5 px-8 py-3 text-[10px] font-black transition-colors uppercase tracking-widest">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#020617] px-8 py-3 text-[10px] font-black transition-all disabled:opacity-50 uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Premium Life Identity Graph Component */}
        <Reveal delay={0}>
          <IdentityGraph stats={stats} />
        </Reveal>

        {/* Horizontal Badge Showcase */}
        <Reveal delay={0}>
          <div className="mb-16">
            <h2 className="text-2xl font-black text-white tracking-wider drop-shadow-lg uppercase mb-6">🎖️ Achievement Showcase</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
              {ALL_BADGES.map((badge) => {
                const isEarned = earnedBadges.includes(badge);
                
                // Determine Rarity Colors
                let border = 'border-slate-600'; let bg = 'bg-slate-800/50'; let glow = ''; let text = 'text-slate-400'; let icon = '🏆';
                if (badge.includes('75-hard')) { border = 'border-yellow-500/50'; bg = 'bg-yellow-900/20'; glow = 'hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]'; text = 'text-yellow-400'; icon = '👑'; }
                else if (badge.includes('perfect-streak')) { border = 'border-purple-500/50'; bg = 'bg-purple-900/20'; glow = 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]'; text = 'text-purple-400'; icon = '⚡'; }
                else if (badge.includes('21-day') || badge.includes('hard-mode')) { border = 'border-cyan-500/50'; bg = 'bg-cyan-900/20'; glow = 'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'; text = 'text-cyan-400'; icon = '💎'; }
                else { border = 'border-emerald-500/50'; bg = 'bg-emerald-900/20'; glow = 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'; text = 'text-emerald-400'; icon = '🏅'; }

                if (!isEarned) { border = 'border-white/5'; bg = 'bg-white/[0.02]'; glow = ''; text = 'text-slate-600'; icon = '🔒'; }

                return (
                  <div key={badge} className={`shrink-0 w-48 text-center rounded-[2rem] p-6 border transition-all duration-500 backdrop-blur-md snap-center ${border} ${bg} ${glow} ${isEarned ? 'opacity-100 transform hover:-translate-y-2' : 'opacity-50 grayscale'}`}>
                    <p className={`text-4xl mb-4 ${isEarned ? 'drop-shadow-lg' : ''}`}>{icon}</p>
                    <p className={`font-black text-[11px] uppercase tracking-widest ${text}`}>{formatBadgeName(badge)}</p>
                    {!isEarned && <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Locked</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {showActivities && (
          <Reveal delay={0} className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-wider drop-shadow-lg uppercase">📋 Timeline</h2>
              {activities.length > 3 && (
                <button
                  onClick={() => setShowActivitiesModal(true)}
                  className="text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest"
                >
                  View All
                </button>
              )}
            </div>
            {activities.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">📭 No journey recorded yet.</p>
              </div>
            ) : (
              <div className={`relative border-l border-white/10 ml-4 py-4 space-y-8 ${activities.length > 0 ? 'cursor-pointer group/timeline' : ''}`} onClick={() => activities.length > 0 && setShowActivitiesModal(true)}>
                {displayedActivities.map((activity, i) => (
                  <div key={activity._id} className="relative pl-8 group/item transition-all duration-300 hover:translate-x-2">
                    <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-[#020617] group-hover/item:scale-150 group-hover/item:shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all duration-300"></div>
                    <p className="font-bold text-white text-sm leading-snug">{getActivityText(activity)}</p>
                    <p className="mt-1 text-[10px] text-cyan-400 font-black uppercase tracking-widest">{timeAgo(activity.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        )}

        {showActivitiesModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-60 backdrop-blur-sm p-4"
            onClick={() => setShowActivitiesModal(false)}
          >
            <div
              className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col backdrop-blur-xl"
              style={{ maxHeight: '60vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-transparent z-10">
                <h2 className="text-xl font-black text-white tracking-widest uppercase">📋 Full History</h2>
                <button
                  onClick={() => setShowActivitiesModal(false)}
                  className="text-slate-400 hover:text-white transition-colors text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-8 overflow-y-auto relative border-l border-white/10 ml-8 my-4 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {activities.map((activity, i) => (
                  <div key={activity._id} className="relative pl-8 group/item transition-all duration-300 hover:translate-x-2">
                    <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-[#020617] group-hover/item:scale-150 group-hover/item:shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-300"></div>
                    <p className="font-bold text-white text-sm">{getActivityText(activity)}</p>
                    <p className="mt-1 text-[10px] text-purple-400 font-black uppercase tracking-widest">{timeAgo(activity.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stats?.allChallenges && (
          <Reveal delay={0} className="mb-12">
            <h2 className="text-2xl font-black text-white mb-6 tracking-wider drop-shadow-lg uppercase">🎯 Trophies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedChallenges.map(challenge => (
                <div key={challenge._id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-black text-white text-lg mb-3 drop-shadow-lg">{challenge.challengeId?.title}</h3>
                      <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                        challenge.mode === 'easy' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' : challenge.mode === 'medium' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30' : 'bg-red-900/40 text-red-400 border border-red-500/30'
                      }`}>
                        {challenge.mode} Mode
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                      🏆
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Executed {challenge.completedDays || 0} days</p>
                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">+{challenge.challengeId?.duration} Mastery</p>
                  </div>
                </div>
              ))}
              {completedChallenges.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">🎪 Journey just beginning.</p>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}

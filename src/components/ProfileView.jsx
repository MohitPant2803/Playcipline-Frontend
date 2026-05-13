import React, { useState } from 'react';
import { Card, Badge } from './UI';
import { getLevelInfo } from '../utils/leveling';
import IdentityGraph from '../pages/IdentityGraph';

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
  showActivities = false
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

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-black text-white tracking-wider drop-shadow-lg">👤 PROFILE</h1>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500 rounded-2xl p-8 shadow-2xl mb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative flex w-28 shrink-0 justify-center pb-5">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-purple-400 shadow-lg"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-3xl font-black text-white shadow-lg">
                      {(profile?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className="group absolute bottom-0 left-1/2 w-24 -translate-x-1/2 rounded-full border-2 border-purple-400 bg-gradient-to-r from-slate-800 to-slate-700 px-2 py-1 shadow-lg"
                    aria-label={`${levelInfo.totalXP}/${levelInfo.nextLevelXp} XP to next level`}
                  >
                    <div className="mb-0.5 text-center text-[10px] font-black text-purple-300 uppercase tracking-wider">
                      Level {levelInfo.level}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-600 border border-slate-500">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-purple-600 px-2 py-1 text-[11px] font-black text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                      {levelInfo.totalXP}/{levelInfo.nextLevelXp} XP
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black mb-1 text-white drop-shadow-lg">{profile?.name}</h1>
                  <p className="text-sm text-purple-300 font-semibold">{profile?.location || 'Location not added'}</p>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-purple-200 line-clamp-3 break-words font-semibold">
                    {profile?.bio || 'No bio added yet.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-5 text-sm">
                    <button
                      type="button"
                      onClick={() => onSocialClick?.('followers')}
                      className="text-left text-xs font-bold text-purple-300 hover:text-cyan-300 transition-colors uppercase tracking-wide"
                    >
                      <span className="block text-xl text-white mb-1 tabular-nums font-black drop-shadow-lg">{followerCount}</span>
                      followers
                    </button>
                    <button
                      type="button"
                      onClick={() => onSocialClick?.('following')}
                      className="text-left text-xs font-bold text-purple-300 hover:text-cyan-300 transition-colors uppercase tracking-wide"
                    >
                      <span className="block text-xl text-white mb-1 tabular-nums font-black drop-shadow-lg">{followingCount}</span>
                      following
                    </button>
                  </div>
                </div>
              </div>

              {actions && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {actions}
                </div>
              )}

              {isEditing && form && (
                <form onSubmit={onSaveProfile} className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-xs font-bold text-purple-300 uppercase tracking-wide">
                    Username
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => onFormChange?.({ ...form, name: event.target.value })}
                      placeholder={profile?.name || 'Your name'}
                      className="rounded-xl bg-slate-600 border-2 border-purple-500 text-white placeholder-purple-300 px-4 py-3 font-bold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-bold text-purple-300 uppercase tracking-wide">
                    Profile picture URL
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={(event) => onFormChange?.({ ...form, avatar: event.target.value })}
                      placeholder={profile?.avatar || 'Google picture will be used if empty'}
                      className="rounded-xl bg-slate-600 border-2 border-purple-500 text-white placeholder-purple-300 px-4 py-3 font-bold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-bold text-purple-300 uppercase tracking-wide">
                    Where are you from?
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => onFormChange?.({ ...form, location: event.target.value })}
                      placeholder="City, Country"
                      className="rounded-xl bg-slate-600 border-2 border-purple-500 text-white placeholder-purple-300 px-4 py-3 font-bold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-bold text-purple-300 uppercase tracking-wide">
                    Bio
                    <textarea
                      value={form.bio}
                      onChange={(event) => onFormChange?.({ ...form, bio: event.target.value.slice(0, 100) })}
                      placeholder="A short note about your habits, goals, or progress (max 100 characters)"
                      maxLength={100}
                      rows={3}
                      className="resize-none rounded-xl bg-slate-600 border-2 border-purple-500 text-white placeholder-purple-300 px-4 py-3 font-bold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-fit rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 text-sm font-black transition hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 mt-2 shadow-lg uppercase tracking-wide"
                  >
                    {saving ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-5 border-2 border-cyan-400 shadow-lg">
                <p className="text-xs font-bold text-cyan-100 uppercase tracking-wide">🏆 Badges Earned</p>
                <p className="text-3xl font-black text-white mt-2 drop-shadow-lg">{earnedBadges.length}</p>
              </div>
              <div className="text-center bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-5 border-2 border-pink-400 shadow-lg">
                <p className="text-xs font-bold text-pink-100 uppercase tracking-wide">✅ Completed</p>
                <p className="text-3xl font-black text-white mt-2 drop-shadow-lg">{completedCount}</p>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl p-5 border-2 border-orange-400 shadow-lg">
                <p className="text-xs font-bold text-orange-100 uppercase tracking-wide">🔥 Current Streak</p>
                <p className="text-3xl font-black text-white mt-2 drop-shadow-lg">{currentStreak}</p>
              </div>
              <div className="text-center bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-5 border-2 border-green-400 shadow-lg">
                <p className="text-xs font-bold text-green-100 uppercase tracking-wide">⭐ Longest</p>
                <p className="text-3xl font-black text-white mt-2 drop-shadow-lg">{longestStreak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Life Identity Graph Component */}
        <IdentityGraph stats={stats} />

        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-6 tracking-wider drop-shadow-lg">🎖️ BADGES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earnedBadges.map(badge => (
              <div key={badge} className="text-center bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-2xl p-6 shadow-lg border-2 border-yellow-400">
                <p className="text-4xl mb-2 drop-shadow-lg">🏆</p>
                <p className="font-black text-white text-sm capitalize uppercase tracking-wide">{formatBadgeName(badge)}</p>
              </div>
            ))}
            {unearnedBadges.map(badge => (
              <div key={badge} className="text-center bg-slate-700 rounded-2xl p-6 opacity-50 border-2 border-slate-600">
                <p className="text-4xl mb-2 grayscale">🏆</p>
                <p className="font-bold text-purple-300 text-sm capitalize uppercase tracking-wide">{formatBadgeName(badge)}</p>
              </div>
            ))}
          </div>
        </div>

        {showActivities && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-white tracking-wider drop-shadow-lg">📋 RECENT ACTIVITY</h2>
              {activities.length > 3 && (
                <button
                  onClick={() => setShowActivitiesModal(true)}
                  className="text-sm font-bold text-cyan-300 hover:text-cyan-200 transition uppercase tracking-wide"
                >
                  View All
                </button>
              )}
            </div>
            {activities.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-purple-500 shadow-2xl">
                <p className="text-purple-300 text-sm font-bold">📭 No actions recorded.</p>
              </div>
            ) : (
              <div
                className={`space-y-3 ${activities.length > 0 ? 'cursor-pointer' : ''}`}
                onClick={() => activities.length > 0 && setShowActivitiesModal(true)}
              >
                {displayedActivities.map(activity => (
                  <div key={activity._id} className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 shadow-lg border-2 border-purple-500 hover:border-pink-500 transition-all duration-200 transform hover:-translate-y-1">
                    <p className="font-bold text-white text-sm">{getActivityText(activity)}</p>
                    <p className="mt-1 text-xs text-purple-300 font-semibold uppercase tracking-wide">{timeAgo(activity.createdAt)}</p>
                  </div>
                ))}
                {activities.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-sm font-bold text-cyan-300 uppercase tracking-wide opacity-80 hover:opacity-100 transition-opacity">
                      Click to see {activities.length - 3} more...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showActivitiesModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-60 backdrop-blur-sm p-4"
            onClick={() => setShowActivitiesModal(false)}
          >
            <div
              className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 rounded-2xl shadow-2xl flex flex-col"
              style={{ maxHeight: '60vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b-2 border-purple-500 border-opacity-50 flex justify-between items-center sticky top-0 bg-slate-800 bg-opacity-90 backdrop-blur-md rounded-t-2xl z-10">
                <h2 className="text-2xl font-black text-white tracking-wider drop-shadow-lg">📋 ALL ACTIVITY</h2>
                <button
                  onClick={() => setShowActivitiesModal(false)}
                  className="text-purple-300 hover:text-white transition-colors text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
                {activities.map(activity => (
                  <div key={activity._id} className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 shadow-lg border-2 border-purple-500 hover:border-pink-500 transition-all">
                    <p className="font-bold text-white text-sm">{getActivityText(activity)}</p>
                    <p className="mt-1 text-xs text-purple-300 font-semibold uppercase tracking-wide">{timeAgo(activity.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stats?.allChallenges && (
          <div>
            <h2 className="text-3xl font-black text-white mb-6 tracking-wider drop-shadow-lg">🎯 COMPLETED CHALLENGES</h2>
            <div className="space-y-3">
              {completedChallenges.map(challenge => (
                <div key={challenge._id} className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 shadow-lg border-2 border-purple-500 hover:border-pink-500 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-black text-white text-sm mb-2 drop-shadow-lg">{challenge.challengeId?.title}</h3>
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide text-white ${
                        challenge.mode === 'easy' ? 'bg-green-600' : challenge.mode === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {challenge.mode} Mode
                      </span>
                      <p className="mt-3 text-xs text-purple-300 font-semibold">
                        ✅ Executed {challenge.completedDays || 0} times
                      </p>
                    </div>
                    <p className="text-xs font-bold text-cyan-300 bg-slate-600 px-3 py-1.5 rounded-lg uppercase tracking-wide">
                      {challenge.challengeId?.duration} days
                    </p>
                  </div>
                </div>
              ))}
              {completedChallenges.length === 0 && (
                <div className="text-center py-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-purple-500 shadow-2xl">
                  <p className="text-purple-300 text-sm font-bold">🎪 No completed challenges found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
